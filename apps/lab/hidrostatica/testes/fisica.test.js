/* Testes automatizados da física da Bancada 04 (rodar com: node apps/lab/hidrostatica/testes/fisica.test.js)
   Cada caso foi calculado à mão e o resultado esperado está escrito no próprio teste. */
'use strict';
const F=require('../fisica.js');
let ok=0,falhas=0;
function perto(nome,obtido,esperado,tol){const t=tol!=null?tol:Math.abs(esperado)*1e-6+1e-12;if(Math.abs(obtido-esperado)<=t){ok++;}else{falhas++;console.log('✗ '+nome+': obtido '+obtido+' · esperado '+esperado);}}
function igual(nome,obtido,esperado){if(obtido===esperado)ok++;else{falhas++;console.log('✗ '+nome+': obtido '+obtido+' · esperado '+esperado);}}
const cm3=1e-6,g=9.8;
const base={g,rhoL:1000,rhoO:2700,V:50*cm3,recipiente:'graduado'};
const A=F.area(F.EQUIP.rRec),a=F.area(F.EQUIP.rCil),H=F.alturaCilindro(50*cm3);

/* 1. Alumínio de 50 cm³ fora do líquido: T = P = 0,135 kg × 9,8 = 1,323 N */
{const s0=F.inicial(base);const r=F.passo(base,s0,.11);igual('fora: situação',r.situ,'fora');perto('fora: peso',r.P,1.323);perto('fora: tensão',r.T,1.323);perto('fora: empuxo',r.E,0);}
/* 2. Totalmente submerso em água: E = 1000 × 9,8 × 50e-6 = 0,49 N; T = 1,323 − 0,49 = 0,833 N */
{const s0=F.inicial(base);const r=F.passo(base,s0,.01);igual('submerso: situação',r.situ,'submerso');perto('submerso: empuxo',r.E,.49);perto('submerso: tensão',r.T,.833);perto('submerso: peso aparente',r.Pap,.833);
 /* o nível sobe V/A: 0,07 + 50e-6/(π·0,045²) */perto('submerso: nível',r.h,.07+50*cm3/A);}
/* 3. Metade submersa: a base fica na altura em que exatamente H/2 está abaixo da superfície.
   Com o nível acoplado: h = (Vw − a·yb)/(A − a). Escolhendo yb, confere-se E = ρ g a (h − yb). */
{const s0=F.inicial(base);const yb=.06;const h=(s0.Vw-a*yb)/(A-a);const r=F.passo(base,s0,yb);igual('parcial: situação',r.situ,'parcial');perto('parcial: nível',r.h,h);perto('parcial: empuxo',r.E,1000*g*a*(h-yb));perto('parcial: tensão',r.T,1.323-1000*g*a*(h-yb));}
/* 4. Fundo: base no fundo → fio frouxo (T = 0) e o fundo sustenta N = P − E = 0,833 N */
{const s0=F.inicial(base);const r=F.passo(base,s0,-.01);igual('fundo: situação',r.situ,'fundo');perto('fundo: tensão',r.T,0);perto('fundo: normal',r.N,.833);perto('fundo: base em zero',r.yb,0);}
/* 5. Madeira (600 kg/m³, 50 cm³) flutua em água: Vsub = m/ρL = 0,03 kg / 1000 = 30 cm³; T = 0 */
{const p=Object.assign({},base,{rhoO:600});const s0=F.inicial(p);const r=F.passo(p,s0,0);igual('flutua: situação',r.situ,'flutua');perto('flutua: volume submerso',r.Vsub,30*cm3);perto('flutua: empuxo = peso',r.E,r.P);perto('flutua: tensão',r.T,0);
 perto('flutua: fração submersa = 600/1000',r.fracao,.6);}
/* 6. Transbordamento: começando cheio até a bica, mergulhar todo o cilindro joga 50 mL na proveta */
{const p=Object.assign({},base,{recipiente:'transbordamento'});let s=F.inicial(p);let r;for(let y=.15;y>=.02;y-=.002){r=F.passo(p,s,y);s={Vw:r.Vw,coletado:r.coletado};}
 perto('transbordo: coletado = volume do cilindro',r.coletado,50*cm3,1e-12);perto('transbordo: nível na bica',r.h,F.EQUIP.hBica,1e-12);perto('transbordo: empuxo = peso do líquido coletado',r.E,1000*g*r.coletado,1e-12);
 /* ao subir o cilindro, a água não volta: o nível baixa 50 cm³ / A */
 r=F.passo(p,s,.15);perto('transbordo: nível baixa ao retirar',r.h,F.EQUIP.hBica-50*cm3/A,1e-12);perto('transbordo: coletado não diminui',r.coletado,50*cm3,1e-12);}
/* 7. Outro líquido: álcool (789 kg/m³) → E = 789 × 9,8 × 50e-6 = 0,38661 N */
{const p=Object.assign({},base,{rhoL:789});const r=F.passo(p,F.inicial(p),.01);perto('álcool: empuxo',r.E,.38661);}
/* 8. Pressão hidrostática relativa na base: p = ρ g Δh (submerso, Δh = h − yb) */
{const s0=F.inicial(base);const r=F.passo(base,s0,.005);perto('pressão na base',r.pBase,1000*g*(r.h-.005));perto('pressão no fundo',r.pFundo,1000*g*r.h);}
/* 9. Latão em água salgada: P = 8500·50e-6·9,8 = 4,165 N; E = 1100·9,8·50e-6 = 0,539 N; T = 3,626 N */
{const p=Object.assign({},base,{rhoO:8500,rhoL:1100});const r=F.passo(p,F.inicial(p),.01);perto('latão: peso',r.P,4.165);perto('latão: empuxo',r.E,.539);perto('latão: tensão',r.T,3.626);}
/* 10. Leitura do instrumento: arredonda à resolução e satura no fundo de escala */
{const l=F.leitura(.833,.02,2);perto('leitura 2 N',l.valor,.84,1e-9);igual('leitura não saturada',l.saturado,false);const l2=F.leitura(3.626,.02,2);perto('leitura saturada',l2.valor,2,1e-9);igual('saturou',l2.saturado,true);}
/* 11. Vasos comunicantes: 5 cm de óleo (920) equilibram 4,6 cm de água acima da interface; desnível = 0,4 cm */
{const r=F.vasos({rTubo:.008,Va:60*cm3,Vc:10*cm3,Vo:F.area(.008)*.05,rhoA:1000,rhoO:920,g});perto('vasos: coluna de óleo',r.ho,.05,1e-12);perto('vasos: água acima da interface',r.dh,.046,1e-12);perto('vasos: desnível',r.desnivel,.004,1e-12);
 /* sem óleo, os dois ramos ficam no mesmo nível */const r0=F.vasos({rTubo:.008,Va:60*cm3,Vc:10*cm3,Vo:0,rhoA:1000,rhoO:920,g});perto('vasos: mesmo nível',r0.yE,r0.yD,1e-12);}
/* 12. Conservação: a quantidade de líquido no recipiente não muda no béquer graduado */
{const s0=F.inicial(base);let s=s0;for(const y of [.12,.08,.05,.01,-.01,.04,.12]){const r=F.passo(base,s,y);s={Vw:r.Vw,coletado:r.coletado};}perto('conservação do volume',s.Vw,s0.Vw,1e-15);}
console.log((falhas?'FALHOU':'OK')+' · '+ok+' verificações certas, '+falhas+' erradas');
process.exit(falhas?1:0);
