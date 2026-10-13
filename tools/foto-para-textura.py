#!/usr/bin/env python3
"""Transforma uma foto (ou imagem gerada) de superfície de rocha em textura da bancada.

1. recorta o quadrado central e redimensiona para 1024 px;
2. tira a luz desigual da foto (vinheta, degradê), mantendo a cor média;
3. atenua reflexos pintados na imagem (opcional), porque o 3D já desenha o brilho;
4. deixa a textura sem emenda (mistura com cópia deslocada, máscara irregular);
5. gera o mapa de relevo (normal map) a partir dos detalhes claros e escuros.

Uso: python3 tools/foto-para-textura.py <imagem> <chave> [--reflexos 0..1] [--relevo 3.0] [--inverter]
Saída: apps/terra/assets/rocha-<chave>.webp e rocha-<chave>-normal.webp
"""
import argparse, os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

N = 1024
SAIDA = os.path.join(os.path.dirname(__file__), '..', 'apps', 'terra', 'assets')

def ruido_periodico(n, beta, seed):
    rng = np.random.default_rng(seed)
    w = rng.standard_normal((n, n))
    f = np.fft.fftfreq(n) * n
    r = np.sqrt(f[None, :] ** 2 + f[:, None] ** 2); r[0, 0] = 1
    o = np.real(np.fft.ifft2(np.fft.fft2(w) / r ** (beta / 2)))
    o -= o.min(); return o / o.max()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('imagem'); ap.add_argument('chave')
    ap.add_argument('--reflexos', type=float, default=0.0, help='quanto atenuar os reflexos pintados (0 a 1)')
    ap.add_argument('--relevo', type=float, default=3.0, help='força do normal map')
    ap.add_argument('--inverter', action='store_true', help='claro = fundo (para rochas com poros claros)')
    ap.add_argument('--direto', action='store_true', help='não mistura para tirar a emenda (imagens com estruturas grandes, como a obsidiana; nas pedras cada face usa a imagem inteira)')
    a = ap.parse_args()

    im = Image.open(a.imagem).convert('RGB')
    w, h = im.size; s = min(w, h)
    im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)).resize((N, N), Image.LANCZOS)
    rgb = np.asarray(im).astype(np.float32) / 255.0

    # 2. luz desigual: divide pela luminância muito borrada e devolve a média
    lum = rgb @ np.array([.299, .587, .114], np.float32)
    baixa = gaussian_filter(lum, N / 8, mode='reflect')
    rgb = rgb * (lum.mean() / np.maximum(baixa, 1e-3))[..., None]

    # 3. reflexos pintados: comprime os tons muito claros e pouco saturados
    if a.reflexos > 0:
        lum = rgb @ np.array([.299, .587, .114], np.float32)
        sat = rgb.max(-1) - rgb.min(-1)
        limiar = np.percentile(lum, 70)
        alvo = limiar + (lum - limiar) * (1 - a.reflexos)
        m = (lum > limiar) & (sat < .25)
        fator = np.where(m, alvo / np.maximum(lum, 1e-3), 1.0)
        rgb = rgb * fator[..., None]
    rgb = np.clip(rgb, 0, 1)

    # 4. sem emenda: B = A deslocada pela metade (bordas já casam); no centro usa A (contínua ali)
    B = np.roll(np.roll(rgb, N // 2, 0), N // 2, 1)
    yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
    d = np.maximum(np.abs(xx - N / 2), np.abs(yy - N / 2)) / (N / 2)  # 0 no centro, 1 nas bordas
    d = d + (ruido_periodico(N, 2.6, 7) - .5) * .35                  # fronteira irregular, menos "costura"
    wB = np.clip((d - .55) / .2, 0, 1)
    wB = wB * wB * (3 - 2 * wB)
    out = rgb if a.direto else rgb * (1 - wB[..., None]) + B * wB[..., None]

    # 5. relevo: detalhes de média e alta frequência da luminância
    lum = out @ np.array([.299, .587, .114], np.float32)
    alt = lum - gaussian_filter(lum, 12, mode='wrap')
    alt = gaussian_filter(alt, .8, mode='wrap')
    if a.inverter: alt = -alt
    gx = (np.roll(alt, -1, 1) - np.roll(alt, 1, 1)) * a.relevo
    gy = (np.roll(alt, -1, 0) - np.roll(alt, 1, 0)) * a.relevo
    nrm = np.stack([-gx, gy, np.ones_like(alt)], -1)
    nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)

    Image.fromarray((np.clip(out, 0, 1) * 255 + .5).astype(np.uint8)).save(os.path.join(SAIDA, f'rocha-{a.chave}.webp'), quality=86, method=6)
    Image.fromarray(((nrm * .5 + .5) * 255 + .5).astype(np.uint8)).save(os.path.join(SAIDA, f'rocha-{a.chave}-normal.webp'), quality=88, method=6)
    print(a.chave, 'ok')

if __name__ == '__main__':
    main()
