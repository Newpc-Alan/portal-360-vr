#!/usr/bin/env python3
"""Gera as texturas das 12 amostras da bancada de rochas (Terra por Dentro).

Saída em apps/terra/assets/: rocha-<chave>.webp (cor) e rocha-<chave>-normal.webp.
Todas as texturas são periódicas (emendam sem costura), porque o ruído é
filtrado no domínio da frequência e as células de Voronoi usam distância toroidal.

Uso: python3 tools/gerar-texturas-rochas.py [chave ...]
"""
import os, sys
import numpy as np
from PIL import Image
from scipy.spatial import cKDTree
from scipy.ndimage import gaussian_filter

N = 1024
SAIDA = os.path.join(os.path.dirname(__file__), '..', 'apps', 'terra', 'assets')

# ---------------------------------------------------------------- primitivas
def ruido(beta=2.0, seed=0, n=N, fmin=1.0):
    """Ruído 1/f^beta periódico, normalizado em 0..1."""
    rng = np.random.default_rng(seed)
    w = rng.standard_normal((n, n))
    fx = np.fft.fftfreq(n) * n
    f = np.sqrt(fx[None, :] ** 2 + fx[:, None] ** 2)
    f[0, 0] = 1
    filtro = 1.0 / np.power(np.maximum(f, fmin), beta / 2.0)
    filtro[0, 0] = 0
    r = np.real(np.fft.ifft2(np.fft.fft2(w) * filtro))
    r -= r.min(); r /= r.max()
    return r

def faixa(f0, f1, seed, n=N):
    """Ruído de banda limitada entre f0 e f1 ciclos por textura."""
    rng = np.random.default_rng(seed)
    w = rng.standard_normal((n, n))
    fx = np.fft.fftfreq(n) * n
    f = np.sqrt(fx[None, :] ** 2 + fx[:, None] ** 2)
    filtro = ((f >= f0) & (f <= f1)).astype(float)
    r = np.real(np.fft.ifft2(np.fft.fft2(w) * filtro))
    r -= r.min(); r /= r.max()
    return r

YY, XX = np.mgrid[0:N, 0:N].astype(np.float32)

def voronoi(npts, seed, n=N, jitter=None):
    """Células periódicas: devolve (id da célula, F1, F2) em pixels."""
    rng = np.random.default_rng(seed)
    pts = rng.random((npts, 2)) * n
    rep = []
    for dx in (-n, 0, n):
        for dy in (-n, 0, n):
            rep.append(pts + [dx, dy])
    rep = np.concatenate(rep)
    ids = np.tile(np.arange(npts), 9)
    tree = cKDTree(rep)
    q = np.stack([XX.ravel(), YY.ravel()], 1)
    if jitter is not None:
        q = q + jitter
    d, i = tree.query(q, k=2, workers=-1)
    cid = ids[i[:, 0]].reshape(n, n)
    return cid, d[:, 0].reshape(n, n), d[:, 1].reshape(n, n)

def warp(campo_x, campo_y, amp):
    return np.stack([((campo_x - .5) * amp).ravel(), ((campo_y - .5) * amp).ravel()], 1)

def amostra_periodica(img, dx, dy):
    """Lê img em (x+dx, y+dy) com volta periódica (vizinho mais próximo)."""
    xi = (XX + dx).astype(int) % N
    yi = (YY + dy).astype(int) % N
    return img[yi, xi]

def cor(*rgb):
    return np.array(rgb, dtype=np.float32) / 255.0

def mistura(base, top, m):
    m = np.clip(m, 0, 1)[..., None]
    return base * (1 - m) + top * m

def preencher(c):
    return np.broadcast_to(c, (N, N, 3)).astype(np.float32).copy()

def normal_de(h, forca):
    gx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * forca
    gy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * forca
    nz = np.ones_like(h)
    v = np.stack([-gx, gy, nz], -1)
    v /= np.linalg.norm(v, axis=-1, keepdims=True)
    return (v * .5 + .5)

def salvar(chave, rgb, h, forca):
    rgb = np.clip(rgb, 0, 1)
    Image.fromarray((rgb * 255 + .5).astype(np.uint8)).save(os.path.join(SAIDA, f'rocha-{chave}.webp'), quality=84, method=6)
    nm = normal_de(h.astype(np.float32), forca)
    Image.fromarray((nm * 255 + .5).astype(np.uint8)).save(os.path.join(SAIDA, f'rocha-{chave}-normal.webp'), quality=88, method=6)

# ---------------------------------------------------------------- rochas
def granito():
    # cristais visíveis de tamanhos variados: quartzo cinza-fumê, feldspato rosado e branco, biotita preta
    j = warp(ruido(2.4, 11), ruido(2.4, 12), 34)
    cidG, f1G, f2G = voronoi(700, 1, jitter=j)
    cidP, f1P, f2P = voronoi(5200, 2, jitter=j)
    rng = np.random.default_rng(5)
    grande = rng.random(cidG.max() + 1) < .55
    usaG = grande[cidG]
    cid = np.where(usaG, cidG, cidP + 10000)
    f1 = np.where(usaG, f1G, f1P); f2 = np.where(usaG, f2G, f2P)
    n = cid.max() + 1
    tipo = rng.choice(4, size=n, p=[.30, .32, .30, .08])  # 0 quartzo 1 feld. rosa 2 feld. branco 3 biotita
    tom = rng.random(n)
    t = tipo[cid]; k = tom[cid][..., None]
    pal = [cor(132, 128, 128), cor(204, 160, 140), cor(222, 216, 204), cor(30, 28, 28)]
    var = [cor(98, 96, 100), cor(184, 136, 116), cor(198, 190, 176), cor(52, 46, 40)]
    rgb = np.zeros((N, N, 3), np.float32)
    for i in range(4):
        m = (t == i)[..., None]
        rgb += m * (pal[i] * (1 - k) + var[i] * k)
    interno = ruido(1.6, 13)
    rgb *= (.88 + .2 * interno)[..., None]
    nuvem = faixa(40, 120, 16)
    rgb = mistura(rgb, preencher(cor(236, 230, 222)), np.where(t == 1, nuvem * .35, 0))
    borda = np.clip((f2 - f1) / 2.5, 0, 1)
    rgb *= (.8 + .2 * borda)[..., None]
    salpico = (faixa(160, 300, 14) > .84) & (ruido(2.2, 15) > .55)
    rgb[salpico] = rgb[salpico] * .25
    h = .5 * borda + .25 * interno + np.where(t == 3, -.18, 0) + np.where(t == 0, .1, 0)
    return rgb, gaussian_filter(h, .8, mode='wrap'), 3.0

def basalto():
    base = ruido(1.6, 21)
    med = ruido(2.6, 22)
    rgb = mistura(preencher(cor(46, 46, 48)), preencher(cor(78, 76, 74)), base * .9)
    rgb *= (.85 + .3 * med)[..., None]
    # olivina: pontinhos verde-oliva
    ol = faixa(120, 220, 23) > .86
    rgb[ol] = cor(92, 104, 58)
    # vesículas (bolhas de gás): buracos escuros de vários tamanhos
    cid, f1, f2 = voronoi(380, 24)
    rng = np.random.default_rng(25)
    raio = rng.random(cid.max() + 1) * 7 + 2
    ativa = rng.random(cid.max() + 1) < .55
    buraco = (f1 < raio[cid]) & ativa[cid]
    prof = np.clip(1 - f1 / raio[cid], 0, 1) * buraco
    rgb *= (1 - .75 * prof)[..., None]
    h = .35 * base + .25 * med + .2 * faixa(150, 400, 26) - .9 * prof
    return rgb, gaussian_filter(h, .7, mode='wrap'), 4.0

def obsidiana():
    # vidro vulcânico: quase preto, faixas de fluxo suaves e ondas de fratura concoidal
    j = warp(ruido(3, 31), ruido(3, 32), 160)
    fluxo = np.sin((YY + j[:, 1].reshape(N, N)) / N * 2 * np.pi * 9) * .5 + .5
    rgb = mistura(preencher(cor(10, 10, 13)), preencher(cor(40, 34, 32)), fluxo * .45)
    rng = np.random.default_rng(33)
    h = np.zeros((N, N), np.float32)
    for _ in range(9):
        cx, cy = rng.random(2) * N
        dx = (XX - cx + N / 2) % N - N / 2
        dy = (YY - cy + N / 2) % N - N / 2
        d = np.sqrt(dx * dx + dy * dy)
        r0 = rng.random() * 220 + 120
        onda = np.cos(d / (rng.random() * 9 + 9)) * np.clip(1 - d / r0, 0, 1) ** 1.5
        h += onda
    h = h * .5 + .15 * ruido(3, 34)
    return rgb, gaussian_filter(h, 1.2, mode='wrap'), 2.4

def pomes():
    # espuma de rocha: poros pequenos e alongados pelo fluxo do gás
    rgb = mistura(preencher(cor(214, 210, 198)), preencher(cor(182, 176, 162)), ruido(1.8, 41))
    h = .25 * ruido(2.2, 42)
    sx = .6
    for semente, n, rmin, rmax in ((43, 1600, 2.5, 6), (44, 5200, 1.2, 3), (45, 260, 6, 11)):
        rng = np.random.default_rng(semente)
        pts = rng.random((n, 2)) * N
        rep = np.concatenate([pts + [dx, dy] for dx in (-N, 0, N) for dy in (-N, 0, N)])
        tree = cKDTree(rep * [sx, 1])
        q = np.stack([XX.ravel() * sx, YY.ravel()], 1)
        d, i = tree.query(q, workers=-1)
        d = d.reshape(N, N); i = (i % n).reshape(N, N)
        raio = (rng.random(n) * (rmax - rmin) + rmin)[i]
        prof = np.clip(1 - d / raio, 0, 1)
        rgb *= (1 - .7 * prof ** .5)[..., None]
        h -= prof ** .5 * .8
    return rgb, gaussian_filter(h, .5, mode='wrap'), 4.5

def arenito():
    # grãos de areia cimentados, em camadas (estratificação)
    j = ruido(2.8, 51)
    camadas = np.sin((YY / N + (j - .5) * .12) * 2 * np.pi * 7) * .5 + .5
    camadas2 = np.sin((YY / N + (j - .5) * .08) * 2 * np.pi * 23) * .5 + .5
    rgb = mistura(preencher(cor(214, 168, 112)), preencher(cor(186, 124, 78)), camadas * .7 + camadas2 * .25)
    graos = faixa(160, 380, 52)
    rgb *= (.82 + .3 * graos)[..., None]
    rng = np.random.default_rng(53)
    # grãos coloridos isolados (quartzo claro, óxido de ferro escuro)
    m1 = faixa(200, 420, 54) > .80
    m2 = faixa(200, 420, 55) > .84
    rgb[m1] = rgb[m1] * .3 + cor(240, 228, 206) * .7
    rgb[m2] = rgb[m2] * .55
    h = .55 * graos + .2 * camadas2 + .15 * ruido(2, 56)
    return rgb, gaussian_filter(h, .5, mode='wrap'), 3.4

def calcario():
    rgb = mistura(preencher(cor(230, 222, 198)), preencher(cor(198, 188, 160)), ruido(2.0, 61) * .8)
    rgb *= (.93 + .1 * faixa(120, 300, 62))[..., None]
    h = .25 * ruido(2.2, 63) + .15 * faixa(120, 300, 62)
    rng = np.random.default_rng(64)
    # fósseis: conchas em leque (bivalves) e espirais (gastrópodes/amonites pequenos)
    for i in range(40):
        cx, cy = rng.random(2) * N
        dx = (XX - cx + N / 2) % N - N / 2
        dy = (YY - cy + N / 2) % N - N / 2
        ang = rng.random() * 2 * np.pi
        rx = dx * np.cos(ang) - dy * np.sin(ang)
        ry = dx * np.sin(ang) + dy * np.cos(ang)
        tam = rng.random() * 30 + 18
        d = np.sqrt(rx * rx + ry * ry)
        if i % 3:
            # leque com costelas radiais
            th = np.arctan2(ry, rx)
            dentro = (d < tam) & (np.abs(th) < 1.15) & (rx > -2)
            costela = (np.cos(th * 14) * .5 + .5)
            relevo = dentro * (.45 + .4 * costela) * np.clip(1 - d / tam, 0, 1) ** .3
        else:
            # espiral logarítmica
            th = np.arctan2(ry, rx)
            espiral = np.cos(np.log(d + 1) * 7 - th) * .5 + .5
            relevo = (d < tam) * espiral * .7
        h += relevo * .9
        rgb *= (1 - relevo * .22)[..., None]
    return rgb, gaussian_filter(h, .8, mode='wrap'), 3.0

def carvao():
    j = ruido(2.6, 71)
    banda = np.sin((YY / N + (j - .5) * .05) * 2 * np.pi * 34) * .5 + .5
    brilho = (banda > .62).astype(np.float32)  # faixas vítreas (vitrênio) entre faixas foscas
    rgb = mistura(preencher(cor(26, 25, 24)), preencher(cor(52, 50, 50)), brilho * .8 + ruido(1.5, 72) * .2)
    # fraturas perpendiculares às camadas (clivagem do carvão)
    cl = np.abs(np.sin((XX / N + (ruido(3, 73) - .5) * .03) * 2 * np.pi * 19))
    trinca = (cl < .045).astype(np.float32)
    rgb *= (1 - .6 * trinca)[..., None]
    h = .4 * banda + .2 * ruido(2.3, 74) - .7 * trinca
    return rgb, gaussian_filter(h, .7, mode='wrap'), 3.0

def marmore():
    # calcita recristalizada (aspecto de açúcar) + veios cinzentos sinuosos
    cid, f1, f2 = voronoi(9000, 81)
    rng = np.random.default_rng(82)
    tom = rng.random(cid.max() + 1)[cid]
    rgb = preencher(cor(240, 238, 232)) * (.94 + .06 * tom)[..., None]
    rgb *= (.95 + .05 * np.clip((f2 - f1) / 2, 0, 1))[..., None]
    w1 = ruido(2.2, 83); w2 = ruido(2.2, 84)
    jx = (w1 - .5) * 260; jy = (w2 - .5) * 260
    linha = np.sin(((XX + jx) * .6 + (YY + jy) * .8) / N * 2 * np.pi * 3)
    veio = np.clip(1 - np.abs(linha) * 9, 0, 1) ** 1.6
    linha2 = np.sin(((XX - jy) * .9 - (YY + jx) * .4) / N * 2 * np.pi * 5)
    veio2 = np.clip(1 - np.abs(linha2) * 16, 0, 1) ** 2 * .7
    nevoa = gaussian_filter(veio, 6, mode='wrap') * .45
    v = np.clip(np.maximum(veio, veio2) + nevoa, 0, 1)
    rgb = mistura(rgb, preencher(cor(120, 124, 132)), v * .8)
    h = .25 * tom + .2 * np.clip((f2 - f1) / 2, 0, 1) - .1 * v
    return rgb, gaussian_filter(h, .6, mode='wrap'), 2.0

def ardosia():
    j = ruido(2.8, 91)
    fol = np.sin((YY / N + (j - .5) * .03) * 2 * np.pi * 70) * .5 + .5
    rgb = mistura(preencher(cor(60, 66, 76)), preencher(cor(84, 90, 100)), fol * .5 + ruido(1.6, 92) * .5)
    # manchas de óxido e brilho sericítico
    ox = gaussian_filter((ruido(2.0, 93) > .78).astype(np.float32), 4, mode='wrap')
    rgb = mistura(rgb, preencher(cor(120, 92, 66)), ox * .35)
    degrau = np.floor(ruido(2.4, 94) * 6) / 6
    h = .25 * fol + .5 * degrau + .1 * faixa(200, 450, 95)
    return rgb, gaussian_filter(h, .6, mode='wrap'), 2.6

def quartzo():
    # quartzo leitoso: estrias horizontais nas faces do prisma, fraturas internas e véus brancos
    estria = np.sin((YY / N + (ruido(3, 101) - .5) * .01) * 2 * np.pi * 90) * .5 + .5
    veu = ruido(2.0, 102)
    rgb = mistura(preencher(cor(206, 214, 224)), preencher(cor(250, 250, 252)), veu * .9)
    cid, f1, f2 = voronoi(40, 103, jitter=warp(ruido(2.5, 104), ruido(2.5, 105), 60))
    fratura = np.clip(1 - (f2 - f1) / 2.0, 0, 1)
    rgb = mistura(rgb, preencher(cor(255, 255, 255)), fratura * .55)
    h = .3 * estria + .1 * veu
    return rgb, gaussian_filter(h, .7, mode='wrap'), 1.6

def feldspato():
    # ortoclásio salmão com lamelas brancas finas (pertita) e poucos planos de clivagem
    j = ruido(2.6, 111)
    lam = np.sin(((XX + YY * .35) / N + (j - .5) * .09) * 2 * np.pi * 38) * .5 + .5
    pert = np.clip((lam - .82) / .18, 0, 1) * (ruido(2.0, 116) > .45)
    rgb = mistura(preencher(cor(218, 152, 124)), preencher(cor(190, 122, 98)), ruido(1.8, 112) * .7)
    rgb = mistura(rgb, preencher(cor(236, 214, 198)), gaussian_filter(pert.astype(np.float32), 1.0, mode='wrap') * .65)
    rgb *= (.94 + .08 * faixa(100, 260, 117))[..., None]
    cl = np.clip(1 - np.abs(np.sin(YY / N * 2 * np.pi * 3 + (ruido(3, 113) - .5) * .6)) / .012, 0, 1)
    cl *= ruido(2.0, 118) > .5
    rgb *= (1 - .18 * cl)[..., None]
    h = .2 * pert + .35 * ruido(2.4, 115) - .4 * cl
    return rgb, gaussian_filter(h, .7, mode='wrap'), 2.2

def mica():
    # muscovita âmbar: lâminas lisas, linhas de crescimento e bordas descascadas mais claras
    folha = np.floor(gaussian_filter(ruido(2.8, 123), 3, mode='wrap') * 9) / 9
    j = ruido(2.6, 121)
    linhas = np.sin(((XX * .5 + YY) / N + (j - .5) * .02) * 2 * np.pi * 26) * .5 + .5
    rgb = mistura(preencher(cor(190, 150, 92)), preencher(cor(138, 100, 56)), folha * .9)
    rgb *= (.95 + .07 * linhas + .05 * ruido(2.4, 122))[..., None]
    borda = (np.abs(np.roll(folha, 1, 0) - folha) + np.abs(np.roll(folha, 1, 1) - folha)) > 0
    rgb = mistura(rgb, preencher(cor(232, 210, 158)), gaussian_filter(borda.astype(np.float32), 1.4, mode='wrap') * .35)
    h = .8 * folha + .05 * linhas
    return rgb, gaussian_filter(h, .6, mode='wrap'), 2.0

ROCHAS = dict(granito=granito, basalto=basalto, obsidiana=obsidiana, pomes=pomes, arenito=arenito,
              calcario=calcario, carvao=carvao, marmore=marmore, ardosia=ardosia, quartzo=quartzo,
              feldspato=feldspato, mica=mica)

if __name__ == '__main__':
    alvo = sys.argv[1:] or list(ROCHAS)
    for k in alvo:
        rgb, h, forca = ROCHAS[k]()
        salvar(k, rgb, h, forca)
        tam = sum(os.path.getsize(os.path.join(SAIDA, f)) for f in (f'rocha-{k}.webp', f'rocha-{k}-normal.webp'))
        print(f'{k:10s} {tam/1024:6.0f} KB')
