#!/usr/bin/env python3
"""Gera os SVGs da marca Portal 360º VR (símbolo Órbita + assinaturas), com o texto convertido em curvas (Sora).
Uso: python3 gerar_marca.py <pasta-de-saida>"""
import os, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = sys.argv[1]
os.makedirs(SAIDA, exist_ok=True)
FONTES = os.path.join(AQUI, 'node_modules/@fontsource/sora/files')
F800 = TTFont(os.path.join(FONTES, 'sora-latin-800-normal.woff2'))

# ---------- paleta ----------
ESCURO = dict(g=('#2E6BE6', '#37B1DA', '#B6D752'), esfera=('#1B3D72', '#050B18'), linha='#37B1DA', ponto='#B6D752',
              texto='#F2F7FC', pilula='#B6D752', pilula_txt='#050B18', pilula_borda=False)
CLARO = dict(g=('#1F57C9', '#1A8DB8', '#1A6B2A'), esfera=('#0F2C4A', '#0F2C4A'), linha='#37B1DA', ponto='#1A6B2A',
             texto='#0F2C4A', pilula='#0F2C4A', pilula_txt='#B6D752', pilula_borda=False)
def mono(c):
    return dict(g=(c, c, c), esfera=None, linha=c, ponto=c, texto=c, pilula=c, pilula_txt=c, pilula_borda=True)

# ---------- texto em curvas ----------
def texto(s, tam, x, base, track=-0.03, fonte=F800):
    """Devolve (d, largura) do texto s com altura de fonte tam, baseline em y=base."""
    upm = fonte['head'].unitsPerEm
    gs = fonte.getGlyphSet(); cmap = fonte.getBestCmap(); hmtx = fonte['hmtx']
    esc = tam / upm; d = []; cx = x
    for i, ch in enumerate(s):
        nome = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[nome].draw(TransformPen(pen, (esc, 0, 0, -esc, cx, base)))
        d.append(pen.getCommands())
        cx += hmtx[nome][0] * esc
        if i < len(s) - 1:
            cx += track * tam
    return ' '.join(d), cx - x

def altura_maiuscula(tam, fonte=F800):
    os2 = fonte['OS/2']
    return getattr(os2, 'sCapHeight', 0.7 * fonte['head'].unitsPerEm) / fonte['head'].unitsPerEm * tam

# ---------- símbolo ----------
def simbolo(p, pfx, x=0, y=0, tam=200, simples=False):
    """Símbolo Órbita desenhado na caixa (x,y,tam,tam). simples=True: versão de ícone pequeno."""
    k = tam / 200
    g = f'url(#{pfx}g)'
    defs = (f'<linearGradient id="{pfx}g" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">'
            f'<stop offset="0" stop-color="{p["g"][0]}"/><stop offset="0.55" stop-color="{p["g"][1]}"/>'
            f'<stop offset="1" stop-color="{p["g"][2]}"/></linearGradient>')
    if p['esfera']:
        defs += (f'<radialGradient id="{pfx}s" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stop-color="{p["esfera"][0]}"/>'
                 f'<stop offset="1" stop-color="{p["esfera"][1]}"/></radialGradient>')
        esfera = f'url(#{pfx}s)'
    else:
        esfera = 'none'
    m = f'<g transform="translate({x} {y}) scale({k})">'
    if simples:
        m += f'<circle cx="100" cy="100" r="58" fill="{esfera}" stroke="{g}" stroke-width="10"/>'
        m += f'<ellipse cx="100" cy="100" rx="24" ry="56" fill="none" stroke="{p["linha"]}" stroke-opacity="0.45" stroke-width="4"/>'
        m += (f'<g transform="rotate(-20 100 100)"><path d="M 192 100 A 92 32 0 0 1 8 100" fill="none" stroke="{g}" '
              f'stroke-width="14" stroke-linecap="round"/><circle cx="192" cy="100" r="14" fill="{p["ponto"]}"/></g>')
    else:
        m += (f'<g transform="rotate(-20 100 100)"><path d="M 8 100 A 92 32 0 0 1 192 100" fill="none" stroke="{g}" '
              f'stroke-width="5" opacity="0.4"/></g>')
        m += f'<circle cx="100" cy="100" r="58" fill="{esfera}" stroke="{g}" stroke-width="6"/>'
        for el in ('<ellipse cx="100" cy="100" rx="24" ry="56"', '<ellipse cx="100" cy="100" rx="56" ry="18"',
                   '<line x1="100" y1="44" x2="100" y2="156"'):
            m += f'{el} fill="none" stroke="{p["linha"]}" stroke-opacity="0.38" stroke-width="2.2"/>'
        m += (f'<g transform="rotate(-20 100 100)"><path d="M 192 100 A 92 32 0 0 1 8 100" fill="none" stroke="{g}" '
              f'stroke-width="9" stroke-linecap="round"/><circle cx="192" cy="100" r="10" fill="{p["ponto"]}"/></g>')
    m += '</g>'
    return defs, m

def palavra(p, pfx, x, centro_y, tam):
    """'Portal 360º' + pílula VR, alinhada pelo meio da altura de maiúscula em centro_y. Devolve (defs, markup, largura)."""
    cap = altura_maiuscula(tam); base = centro_y + cap / 2
    d1, w1 = texto('Portal', tam, x, base)
    x2 = x + w1 + 0.2 * tam
    d2, w2 = texto('360º', tam, x2, base)
    defs = (f'<linearGradient id="{pfx}t" x1="{x2:.1f}" y1="0" x2="{x2 + w2:.1f}" y2="0" gradientUnits="userSpaceOnUse">'
            f'<stop offset="0" stop-color="{p["g"][0]}"/><stop offset="0.5" stop-color="{p["g"][1]}"/>'
            f'<stop offset="1" stop-color="{p["g"][2]}"/></linearGradient>')
    m = f'<path d="{d1}" fill="{p["texto"]}"/><path d="{d2}" fill="url(#{pfx}t)"/>'
    # pílula VR
    tv = tam * 0.42; capv = altura_maiuscula(tv)
    xp = x2 + w2 + 0.2 * tam
    dv, wv = texto('VR', tv, 0, 0, track=0.02)
    padx = tv * 0.42; ph = capv + tv * 0.62; pw = wv + 2 * padx
    yp = centro_y - ph / 2
    dv, _ = texto('VR', tv, xp + padx, centro_y + capv / 2, track=0.02)
    if p['pilula_borda']:
        sw = tv * 0.08
        m += (f'<rect x="{xp + sw / 2:.1f}" y="{yp + sw / 2:.1f}" width="{pw - sw:.1f}" height="{ph - sw:.1f}" '
              f'rx="{ph * 0.26:.1f}" fill="none" stroke="{p["pilula"]}" stroke-width="{sw:.1f}"/>')
    else:
        m += f'<rect x="{xp:.1f}" y="{yp:.1f}" width="{pw:.1f}" height="{ph:.1f}" rx="{ph * 0.26:.1f}" fill="{p["pilula"]}"/>'
    m += f'<path d="{dv}" fill="{p["pilula_txt"]}"/>'
    return defs, m, (xp + pw) - x

def svg(w, h, corpo, titulo, fundo=None):
    f = f'<rect width="{w:.0f}" height="{h:.0f}" fill="{fundo}"/>' if fundo else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}" '
            f'role="img" aria-label="{titulo}"><title>{titulo}</title>{f}{corpo}</svg>\n')

def grava(nome, conteudo):
    open(os.path.join(SAIDA, nome), 'w', encoding='utf-8').write(conteudo)

M = 8  # margem mínima nos arquivos
NOME = 'Portal 360º VR'

def horizontal(p, pfx):
    d0, s = simbolo(p, pfx + 's', M, M, 200)
    d1, t, w = palavra(p, pfx + 'w', M + 236, M + 100, 120)
    return svg(M + 236 + w + M, 200 + 2 * M, f'<defs>{d0}{d1}</defs>{s}{t}', NOME)

def vertical(p, pfx):
    _, _, w = palavra(p, 'x', 0, 0, 96)
    W = max(w, 240) + 2 * M
    d0, s = simbolo(p, pfx + 's', (W - 240) / 2, M, 240)
    d1, t, _ = palavra(p, pfx + 'w', (W - w) / 2, M + 240 + 34 + 48, 96)
    return svg(W, M + 240 + 34 + 96 + M, f'<defs>{d0}{d1}</defs>{s}{t}', NOME)

def so_simbolo(p, pfx, simples=False):
    d, s = simbolo(p, pfx, 0, 0, 200, simples)
    return svg(200, 200, f'<defs>{d}</defs>{s}', NOME)

def icone(tam_ref=512, simples=False):
    """Ícone de app: quadrado escuro com o símbolo (área segura de 72% para ícone 'maskable')."""
    d, s = simbolo(ESCURO, 'i', 512 * 0.14, 512 * 0.14, 512 * 0.72, simples)
    fundo = ('<radialGradient id="ib" cx="0.35" cy="0.3" r="0.85"><stop offset="0" stop-color="#12305C"/>'
             '<stop offset="1" stop-color="#050B18"/></radialGradient>')
    return svg(512, 512, f'<defs>{fundo}{d}</defs><rect width="512" height="512" fill="url(#ib)"/>{s}', NOME)

def favicon():
    """Favicon: só esfera + órbita, traço grosso, legível a 16-32 px."""
    corpo = ('<rect width="64" height="64" rx="14" fill="#050B18"/>'
             '<g transform="translate(4 4) scale(0.28)"><circle cx="100" cy="100" r="58" fill="#0B1B31" stroke="#37B1DA" stroke-width="16"/>'
             '<g transform="rotate(-20 100 100)"><path d="M 192 100 A 92 32 0 0 1 8 100" fill="none" stroke="#B6D752" '
             'stroke-width="22" stroke-linecap="round"/></g></g>')
    return svg(64, 64, corpo, NOME)

def animado():
    """Símbolo com movimento: o globo gira (meridiano) e o satélite percorre a órbita da frente. SMIL, funciona em <img>."""
    d, _ = simbolo(ESCURO, 'a', 0, 0, 200)
    g = 'url(#ag)'
    c = (f'<g transform="rotate(-20 100 100)"><path d="M 8 100 A 92 32 0 0 1 192 100" fill="none" stroke="{g}" stroke-width="5" opacity="0.4"/></g>'
         f'<circle cx="100" cy="100" r="58" fill="url(#as)" stroke="{g}" stroke-width="6"/>'
         '<ellipse cx="100" cy="100" rx="56" ry="18" fill="none" stroke="#37B1DA" stroke-opacity="0.38" stroke-width="2.2"/>'
         '<line x1="100" y1="44" x2="100" y2="156" stroke="#37B1DA" stroke-opacity="0.38" stroke-width="2.2"/>'
         '<ellipse cx="100" cy="100" rx="24" ry="56" fill="none" stroke="#37B1DA" stroke-opacity="0.38" stroke-width="2.2">'
         '<animate attributeName="rx" values="56;2;56" dur="6s" repeatCount="indefinite"/></ellipse>'
         '<ellipse cx="100" cy="100" rx="2" ry="56" fill="none" stroke="#37B1DA" stroke-opacity="0.38" stroke-width="2.2">'
         '<animate attributeName="rx" values="2;56;2" dur="6s" repeatCount="indefinite"/></ellipse>'
         '<g transform="rotate(-20 100 100)">'
         f'<path d="M 192 100 A 92 32 0 0 1 8 100" fill="none" stroke="{g}" stroke-width="9" stroke-linecap="round" '
         'stroke-dasharray="320" stroke-dashoffset="320"><animate attributeName="stroke-dashoffset" values="320;0" dur="1.4s" '
         'fill="freeze" calcMode="spline" keySplines="0.2 0 0.2 1" keyTimes="0;1"/></path>'
         '<circle r="10" fill="#B6D752"><animateMotion dur="4s" repeatCount="indefinite" path="M 192 100 A 92 32 0 0 1 8 100" '
         'keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1"/>'
         '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.88;1" dur="4s" repeatCount="indefinite"/></circle>'
         '</g>')
    return svg(200, 200, f'<defs>{d}</defs>{c}', NOME)

grava('p360-simbolo.svg', so_simbolo(ESCURO, 'a'))
grava('p360-simbolo-claro.svg', so_simbolo(CLARO, 'c'))
grava('p360-simbolo-branco.svg', so_simbolo(mono('#FFFFFF'), 'b'))
grava('p360-simbolo-navy.svg', so_simbolo(mono('#0F2C4A'), 'n'))
grava('p360-simbolo-animado.svg', animado())
grava('p360-assinatura-horizontal.svg', horizontal(ESCURO, 'h'))
grava('p360-assinatura-horizontal-claro.svg', horizontal(CLARO, 'hc'))
grava('p360-assinatura-horizontal-branca.svg', horizontal(mono('#FFFFFF'), 'hb'))
grava('p360-assinatura-horizontal-navy.svg', horizontal(mono('#0F2C4A'), 'hn'))
grava('p360-assinatura-vertical.svg', vertical(ESCURO, 'v'))
grava('p360-assinatura-vertical-claro.svg', vertical(CLARO, 'vc'))
grava('p360-icone.svg', icone())
grava('p360-favicon.svg', favicon())
print('ok', sorted(os.listdir(SAIDA)))
