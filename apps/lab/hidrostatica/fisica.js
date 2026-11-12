/* Portal Lab 3D · Bancada 04 · Hidrostática · núcleo de física (v1.0)
   Módulo puro, sem desenho: as mesmas funções rodam no navegador (window.LabFisica) e no Node (testes).
   Unidades do SI em todo o cálculo (m, kg, N, Pa, m³). A conversão para cm, cm³, mL e kPa fica só na interface.

   Modelo (cilindro vertical, centrado num recipiente cilíndrico):
   - Peso: P = m·g
   - Empuxo: E = ρL·g·Vsub, com Vsub calculado pela geometria efetivamente submersa: π·r²·(altura do cilindro abaixo da superfície)
   - O nível do líquido depende da posição do cilindro (o cilindro desloca líquido e o nível sobe) e é resolvido de forma exata.
   - Recipiente de transbordamento: o nível não passa da bica; o excedente vai para a proveta e não volta.
   - O fio só puxa: se P − E < 0 o cilindro flutua (T = 0); se a base chega ao fundo, o fio afrouxa (T = 0) e o fundo sustenta N = P − E.
   - Leitura do dinamômetro = tensão no fio, T = P − E quando o cilindro está pendurado e em equilíbrio. */
(function(raiz){'use strict';
const G=9.8;
const LIQUIDOS={
 agua:{nome:'Água',rho:1000,cor:'#9fd4ff'},
 aguaSal:{nome:'Água com sal (salmoura)',rho:1100,cor:'#b8dcf0'},
 alcool:{nome:'Álcool etílico',rho:789,cor:'#e8f4ff'},
 oleo:{nome:'Óleo de soja',rho:920,cor:'#f2c45a'},
 glicerina:{nome:'Glicerina',rho:1260,cor:'#f4f1e2'}
};
const MATERIAIS={
 aluminio:{nome:'Alumínio',rho:2700,cor:'#c9ced6',metal:.9},
 latao:{nome:'Latão',rho:8500,cor:'#d8b45a',metal:1},
 ferro:{nome:'Ferro',rho:7870,cor:'#7d8590',metal:.85},
 pvc:{nome:'Plástico (PVC)',rho:1380,cor:'#e8ecef',metal:0},
 madeira:{nome:'Madeira (pinus)',rho:600,cor:'#c69c63',metal:0},
 personalizado:{nome:'Personalizado',rho:2000,cor:'#9fb6c9',metal:.3}
};
/* equipamento escolar padrão (medidas internas) */
const EQUIP={
 rCil:.016,              // raio do cilindro: 3,2 cm de diâmetro
 rRec:.045,              // raio interno do recipiente: 9 cm de diâmetro (área de 63,6 cm²)
 altRec:.13,             // altura interna do recipiente
 hBica:.10,              // altura da bica do recipiente de transbordamento
 rProveta:.0125,         // proveta de 100 mL (área de 4,91 cm²)
 capProveta:100e-6,
 hInicialGraduado:.07    // nível inicial no béquer graduado (445 mL)
};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const area=r=>Math.PI*r*r;
/* altura do cilindro a partir do volume (diâmetro fixo de 3,2 cm) */
function alturaCilindro(V){return V/area(EQUIP.rCil);}

/* Nível do líquido no recipiente, dado o volume de líquido Vw e a base do cilindro em yb (altura sobre o fundo).
   Volume de líquido = A·h − (parte do cilindro abaixo de h). Resolve por trechos, exato. */
function nivel(Vw,yb,H,A,a){
 const h1=Vw/A;if(h1<=yb)return h1;                       // líquido não alcança o cilindro
 const h2=(Vw-a*yb)/(A-a);if(h2<yb+H)return h2;            // cilindro parcialmente submerso
 return (Vw+a*H)/A;                                        // cilindro totalmente submerso
}
const subm=(h,yb,H)=>clamp(h-yb,0,H);                      // altura submersa do cilindro

/* Estado inicial do experimento */
function inicial(p){
 const A=area(EQUIP.rRec);
 const Vw=p.recipiente==='transbordamento'?A*EQUIP.hBica:A*(p.hInicial||EQUIP.hInicialGraduado);
 return {Vw,coletado:0};
}

/* Um passo da simulação. p: parâmetros; s: estado anterior {Vw, coletado}; yCmd: altura pedida para a base do cilindro.
   Devolve o estado completo (posição real, nível, volumes, forças, pressões e situação). Não altera s. */
function passo(p,s,yCmd){
 const g=p.g||G,rhoL=p.rhoL,rhoO=p.rhoO,V=p.V;const m=rhoO*V,P=m*g;
 const a=area(EQUIP.rCil),A=area(EQUIP.rRec),H=alturaCilindro(V);
 let Vw=s.Vw,coletado=s.coletado;
 let yb=Math.max(0,yCmd),situ;
 let h=nivel(Vw,yb,H,A,a);
 let hs=subm(h,yb,H),Vsub=a*hs,E=rhoL*g*Vsub;
 /* o fio não empurra: se o empuxo vence o peso, o cilindro sobe até flutuar */
 if(E>P+1e-12){const d=m/(rhoL*a);/* altura submersa que equilibra o peso (menor que H, senão não flutuaria) */
  const hF=(Vw+a*d)/A,ybF=hF-d;if(ybF>yb){yb=ybF;h=hF;hs=d;Vsub=a*d;E=rhoL*g*Vsub;situ='flutua';}}
 /* transbordamento: o nível não passa da bica; o excedente vai para a proveta */
 let transbordou=0;
 if(p.recipiente==='transbordamento'){
  const VwMax=A*EQUIP.hBica-a*subm(EQUIP.hBica,yb,H);
  if(Vw>VwMax+1e-15){transbordou=Vw-VwMax;coletado=Math.min(EQUIP.capProveta,coletado+transbordou);Vw=VwMax;h=nivel(Vw,yb,H,A,a);
   if(situ==='flutua'){const d=m/(rhoL*a);h=(Vw+a*d)/A;yb=h-d;}hs=subm(h,yb,H);Vsub=a*hs;E=rhoL*g*Vsub;}
 }
 let T,N=0;
 if(situ==='flutua'){T=0;}
 else if(yCmd<=0&&P-E>0){T=0;N=P-E;situ='fundo';}
 else{T=Math.max(0,P-E);situ=hs<=1e-9?'fora':(hs>=H-1e-9?'submerso':'parcial');}
 const prof=h-yb;/* profundidade da base do cilindro abaixo da superfície (negativa: acima do líquido) */
 return {
  Vw,coletado,transbordou,yb,h,H,hs,Vsub,m,P,E,T,N,situ,prof,
  pBase:prof>0?rhoL*g*prof:0,          // pressão hidrostática (relativa) na base do cilindro
  pFundo:rhoL*g*h,                      // pressão hidrostática (relativa) no fundo do recipiente
  Pap:P-E,                              // peso aparente
  fracao:hs/H,densRel:rhoO/rhoL
 };
}

/* Leitura do instrumento: a medição simulada é o valor físico arredondado à resolução do instrumento
   (sem ruído inventado). Fora da escala, o instrumento indica o limite. */
function leitura(valor,resolucao,max){const lim=max!=null?Math.min(valor,max):valor;return {valor:Math.round(lim/resolucao)*resolucao,saturado:max!=null&&valor>max};}
const DINAMOMETROS={
 analogico2:{nome:'Dinamômetro analógico 2 N',max:2,res:.02,tipo:'analogico'},
 analogico5:{nome:'Dinamômetro analógico 5 N',max:5,res:.05,tipo:'analogico'},
 analogico10:{nome:'Dinamômetro analógico 10 N',max:10,res:.1,tipo:'analogico'},
 digital:{nome:'Dinamômetro digital 20 N',max:20,res:.01,tipo:'digital'}
};

/* Vasos comunicantes (tubo em U de seção constante a, ligação inferior de volume Vc).
   Água (ρa) em todo o tubo e um segundo líquido (ρo, não miscível e menos denso) despejado no ramo direito.
   Na interface, as pressões se igualam: ρo·g·ho = ρa·g·(yE − yI). */
function vasos(p){const a=area(p.rTubo),ho=p.Vo/a;const dh=p.rhoO*ho/p.rhoA;/* altura da água no ramo esquerdo acima da interface */
 const yI=((p.Va-p.Vc)/a-dh)/2;const yE=yI+dh,yD=yI+ho;
 return {ho,dh,yI,yE,yD,desnivel:yD-yE,pInterface:p.rhoO*(p.g||G)*ho};}

const API={G,LIQUIDOS,MATERIAIS,EQUIP,DINAMOMETROS,area,alturaCilindro,nivel,inicial,passo,leitura,vasos};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else raiz.LabFisica=API;
})(typeof window!=='undefined'?window:globalThis);
