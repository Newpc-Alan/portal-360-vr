#!/bin/sh
# Copia o padrão VR (fonte única em tools/) para os apps que o usam e regenera o precache de cada um.
cd "$(dirname "$0")/.." || exit 1
for a in celula terra dna historia; do cp tools/pde-vr-padrao.js apps/$a/; python3 tools/gerar-precache.py $a $a-data.js; done
