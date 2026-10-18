#!/bin/sh
# Copia os padrões do catálogo (fonte única em tools/) para os apps e regenera o precache de cada um.
#  - pde-vr-padrao.js : VR (distâncias, menu, controles) · celula, terra, dna, historia
#  - pde-3d-padrao.css: textos e layout responsivo do 3D · dna, corpo-humano, terra, celula, historia
cd "$(dirname "$0")/.." || exit 1
for a in celula terra dna historia; do cp tools/pde-vr-padrao.js apps/$a/; done
for a in dna corpo-humano terra celula historia; do cp tools/pde-3d-padrao.css apps/$a/; done
for a in celula terra dna historia; do python3 tools/gerar-precache.py $a $a-data.js; done
python3 tools/gerar-precache.py corpo-humano corpo-data.js
