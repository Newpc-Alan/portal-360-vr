// Renderiza SVG -> PNG. Uso: node render.js <entrada.svg> <saida.png> <largura>
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const [, , ent, sai, larg] = process.argv;
const r = new Resvg(fs.readFileSync(ent, 'utf8'), { fitTo: { mode: 'width', value: Number(larg) } });
fs.writeFileSync(sai, r.render().asPng());
