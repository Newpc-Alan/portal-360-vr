/* Portal Lab 3D · Bancada 04 · equipamentos em 3D (v1.0)
   Todas as peças em METROS, com as medidas de equipamento escolar (proveta de 100 mL, recipiente de 9 cm, haste de 60 cm).
   Materiais PBR (MeshStandard/MeshPhysical) com mapa de ambiente; graduações desenhadas em textura (legíveis de perto).
   Cada construtor devolve um THREE.Group e, quando a peça muda com a física, funções set*() para atualizá-la. */
(function(){'use strict';
const T=THREE,F=window.LabFisica,E=F.EQUIP,V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
let ENV=null;
/* ambiente: um "laboratório" simples em cubo, para o vidro e o metal terem o que refletir */
function ambiente(){if(ENV)return ENV;const W=256;const face=(topo,meio,base,janela)=>{const c=document.createElement('canvas');c.width=c.height=W;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,W);g.addColorStop(0,topo);g.addColorStop(.5,meio);g.addColorStop(1,base);x.fillStyle=g;x.fillRect(0,0,W,W);if(janela){x.fillStyle='rgba(255,255,255,.85)';x.fillRect(W*.15,W*.18,W*.3,W*.34);x.fillRect(W*.55,W*.18,W*.3,W*.34);}return c;};
 const parede=face('#dfe6ee','#9aa6b2','#3b4552'),luz=face('#f4f8fc','#b8c4d0','#3b4552',true);const teto=document.createElement('canvas');teto.width=teto.height=W;const tx=teto.getContext('2d');tx.fillStyle='#e9eef4';tx.fillRect(0,0,W,W);tx.fillStyle='#ffffff';for(let i=0;i<3;i++)tx.fillRect(W*.1,W*(.15+i*.3),W*.8,W*.08);const chao=face('#5a5048','#4a423b','#2e2924');
 ENV=new T.CubeTexture([parede,luz,teto,chao,luz,parede]);ENV.encoding=T.sRGBEncoding;ENV.needsUpdate=true;return ENV;}
const mat=(color,o={})=>new T.MeshStandardMaterial(Object.assign({color,roughness:.5,metalness:0,envMap:ambiente(),envMapIntensity:.8},o));
function vidro(o={}){return new T.MeshPhysicalMaterial(Object.assign({color:0xf2f8ff,metalness:0,roughness:.04,transparent:true,opacity:.18,envMap:ambiente(),envMapIntensity:1.6,clearcoat:1,clearcoatRoughness:.05,side:T.DoubleSide,depthWrite:false},o));}
function sombra(o,lanca=true,recebe=true){o.traverse(m=>{if(m.isMesh){m.castShadow=lanca&&!(m.material&&m.material.transparent);m.receiveShadow=recebe;}});return o;}
function texto(txt,{cor='#0f2c4a',fundo=null,larg=512,alt=128,fonte='600 64px Segoe UI, Arial',w=.1}={}){const c=document.createElement('canvas');c.width=larg;c.height=alt;const x=c.getContext('2d');if(fundo){x.fillStyle=fundo;x.fillRect(0,0,larg,alt);}x.fillStyle=cor;x.font=fonte;x.textAlign='center';x.textBaseline='middle';x.fillText(txt,larg/2,alt/2);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=8;const m=new T.Mesh(new T.PlaneGeometry(w,w*alt/larg),new T.MeshBasicMaterial({map:t,transparent:true,toneMapped:false,depthWrite:false}));m.userData.canvas=c;m.userData.tex=t;return m;}
/* rótulo que sempre olha para a câmera (setas de força) */
function rotulo(txt,cor){const c=document.createElement('canvas');c.width=256;c.height=96;const x=c.getContext('2d');x.font='700 54px Segoe UI, Arial';x.textAlign='center';x.textBaseline='middle';x.lineWidth=8;x.strokeStyle='rgba(8,16,26,.85)';x.strokeText(txt,128,48);x.fillStyle=cor;x.fillText(txt,128,48);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;const s=new T.Sprite(new T.SpriteMaterial({map:t,depthTest:false,toneMapped:false}));s.scale.set(.06,.0225,1);s.renderOrder=20;s.userData.canvas=c;s.userData.tex=t;return s;}
function setRotulo(s,txt,cor){const c=s.userData.canvas,x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.font='700 54px Segoe UI, Arial';x.textAlign='center';x.textBaseline='middle';x.lineWidth=8;x.strokeStyle='rgba(8,16,26,.85)';x.strokeText(txt,128,48);x.fillStyle=cor;x.fillText(txt,128,48);s.userData.tex.needsUpdate=true;}

/* ---------- sala e bancada ---------- */
function sala(){const g=new T.Group();
 const tampo=new T.Mesh(new T.BoxGeometry(1.5,.04,.8),mat(0x1d2a33,{roughness:.35,envMapIntensity:.6}));tampo.position.y=-.02;g.add(tampo);/* tampo de resina epóxi escura, como bancada de laboratório */
 const borda=new T.Mesh(new T.BoxGeometry(1.52,.012,.82),mat(0x2b3a45,{roughness:.4}));borda.position.y=-.046;g.add(borda);
 const movel=new T.Mesh(new T.BoxGeometry(1.46,.82,.76),mat(0xd9dde2,{roughness:.6}));movel.position.y=-.47;g.add(movel);
 for(let i=0;i<3;i++){const porta=new T.Mesh(new T.BoxGeometry(.46,.7,.01),mat(0xc6ccd3,{roughness:.55}));porta.position.set(-.49+i*.49,-.48,.385);g.add(porta);const pux=new T.Mesh(new T.BoxGeometry(.12,.012,.02),mat(0x8d969f,{metalness:.8,roughness:.3}));pux.position.set(-.49+i*.49,-.2,.395);g.add(pux);}
 const chao=new T.Mesh(new T.PlaneGeometry(8,8),mat(0x6e6a63,{roughness:.85}));chao.rotation.x=-Math.PI/2;chao.position.y=-.88;g.add(chao);
 const parede=new T.Mesh(new T.PlaneGeometry(8,4),mat(0xe4e8ec,{roughness:.9}));parede.position.set(0,1,-.6);g.add(parede);
 /* azulejos e quadro de segurança na parede: dá escala e contexto de laboratório escolar */
 const azul=new T.Mesh(new T.PlaneGeometry(1.6,.5),mat(0xffffff,{roughness:.3}));azul.position.set(0,.25,-.598);g.add(azul);
 const c=document.createElement('canvas');c.width=512;c.height=160;const x=c.getContext('2d');x.fillStyle='#f3f6f8';x.fillRect(0,0,512,160);x.strokeStyle='#c9d2da';x.lineWidth=2;for(let i=0;i<=16;i++){x.beginPath();x.moveTo(i*32,0);x.lineTo(i*32,160);x.stroke();}for(let j=0;j<=5;j++){x.beginPath();x.moveTo(0,j*32);x.lineTo(512,j*32);x.stroke();}const tt=new T.CanvasTexture(c);tt.encoding=T.sRGBEncoding;azul.material.map=tt;
 const placa=texto('LABORATÓRIO DE CIÊNCIAS · BANCADA 04',{cor:'#ffffff',fundo:'#1a6b2a',fonte:'700 46px Segoe UI, Arial',larg:1024,alt:110,w:.62});placa.position.set(0,.62,-.597);g.add(placa);
 sombra(g,false,true);return g;}

/* ---------- suporte universal: base, haste e mufa com braço ---------- */
function suporte(){const g=new T.Group();const ferro=mat(0x2c3238,{roughness:.45,metalness:.6}),aco=mat(0xc8cdd3,{roughness:.22,metalness:1});
 const base=new T.Mesh(new T.BoxGeometry(.22,.014,.14),ferro);base.position.set(-.16,.007,-.02);g.add(base);
 const haste=new T.Mesh(new T.CylinderGeometry(.006,.006,.6,20),aco);haste.position.set(-.2,.3,-.02);g.add(haste);
 const mufa=new T.Group();g.add(mufa);const bloco=new T.Mesh(new T.BoxGeometry(.03,.026,.026),ferro);mufa.add(bloco);const parafuso=new T.Mesh(new T.CylinderGeometry(.004,.004,.025,12),aco);parafuso.rotation.z=Math.PI/2;parafuso.position.x=-.025;mufa.add(parafuso);const borb=new T.Mesh(new T.BoxGeometry(.004,.016,.006),aco);borb.position.x=-.038;mufa.add(borb);
 const braco=new T.Mesh(new T.CylinderGeometry(.0045,.0045,.21,16),aco);braco.rotation.z=Math.PI/2;braco.position.set(.105,0,0);mufa.add(braco);
 const gancho=new T.Mesh(new T.TorusGeometry(.007,.0018,8,20),aco);gancho.position.set(.2,-.008,0);mufa.add(gancho);
 mufa.position.set(-.2,.4,-.02);
 /* o braço termina sobre o centro do recipiente (x = 0) */
 g.userData.setAltura=y=>{mufa.position.y=y;};g.userData.pontoGancho=()=>V(0,mufa.position.y-.015,-.02);
 sombra(g);return g;}

/* ---------- dinamômetros ---------- */
function escalaDinamometro(max,comp){/* textura da escala: do zero ao fundo de escala ao longo de "comp" metros */
 const c=document.createElement('canvas');c.width=128;c.height=1024;const x=c.getContext('2d');x.fillStyle='#fbf6e8';x.fillRect(0,0,128,1024);
 const y0=120,y1=920;const passos=max<=2?100:max<=5?50:100;const res=max/passos;x.strokeStyle='#1c2430';x.fillStyle='#1c2430';x.textAlign='left';x.textBaseline='middle';
 for(let i=0;i<=passos;i++){const y=y0+(y1-y0)*i/passos;const v=i*res;const maior=Math.abs(v*10-Math.round(v*10))<1e-6&&(max<=2?true:Math.abs(v-Math.round(v))<1e-6||max<=5&&Math.abs(v*2-Math.round(v*2))<1e-6);const meio=!maior&&i%5===0;x.lineWidth=maior?3:1.5;x.beginPath();x.moveTo(8,y);x.lineTo(maior?62:meio?48:34,y);x.stroke();if(maior&&(max<=2?Math.abs(v*5-Math.round(v*5))<1e-6:true)){x.font='600 30px Segoe UI, Arial';x.fillText(String(Math.round(v*100)/100).replace('.',','),68,y);}}
 x.font='700 34px Segoe UI, Arial';x.textAlign='center';x.fillText('N',64,60);x.font='600 22px Segoe UI, Arial';x.fillText('máx. '+max+' N',64,980);
 const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=8;return {tex:t,y0:y0/1024,y1:y1/1024};}
function mola(raio,voltas,comp,esp){const pts=[];const n=voltas*24;for(let i=0;i<=n;i++){const a=i/24*Math.PI*2;pts.push(V(Math.cos(a)*raio,-comp*i/n,Math.sin(a)*raio));}return new T.TubeGeometry(new T.CatmullRomCurve3(pts),n*2,esp,6,false);}
/* analógico: tubo transparente com escala; o corpo interno com a mola desce s = T/max × 10 cm */
function dinamometroAnalogico(max){const g=new T.Group();const COMP=.1,TUBO=.2;const aco=mat(0xd0d5db,{roughness:.25,metalness:1});
 const argola=new T.Mesh(new T.TorusGeometry(.008,.0018,8,24),aco);argola.position.y=.006;g.add(argola);
 const tampa=new T.Mesh(new T.CylinderGeometry(.013,.013,.012,24),mat(0xe8eaec,{roughness:.4}));tampa.position.y=-.006;g.add(tampa);
 const esc=escalaDinamometro(max,COMP);const papel=new T.Mesh(new T.PlaneGeometry(.016,.128),new T.MeshStandardMaterial({map:esc.tex,roughness:.8,envMap:ambiente(),envMapIntensity:.3}));
 /* zero da escala a 4 cm do topo e fundo de escala 10 cm abaixo: as marcas da textura (y0 e y1) caem exatamente nessas alturas */papel.position.set(0,-.04+esc.y0*.128-.064,.0105);g.add(papel);
 const tubo=new T.Mesh(new T.CylinderGeometry(.012,.012,TUBO,32,1,true),vidro({opacity:.16}));tubo.position.y=-.012-TUBO/2;g.add(tubo);
 const fundoT=new T.Mesh(new T.CylinderGeometry(.012,.012,.01,24),mat(0xe8eaec,{roughness:.4}));fundoT.position.y=-.012-TUBO;g.add(fundoT);
 const interno=new T.Group();g.add(interno);
 const indicador=new T.Mesh(new T.CylinderGeometry(.0108,.0108,.004,24),mat(0xd32f2f,{roughness:.4}));interno.add(indicador);
 const haste=new T.Mesh(new T.CylinderGeometry(.0018,.0018,.2,10),aco);haste.position.y=-.1;interno.add(haste);
 const gancho=new T.Mesh(new T.TorusGeometry(.006,.0015,8,20,Math.PI*1.4),aco);gancho.rotation.z=Math.PI*.8;interno.add(gancho);
 let molaM=new T.Mesh(mola(.008,14,1,.0009),aco);g.add(molaM);molaM.position.y=-.012;
 let compAtual=0;
 g.userData.set=(Tn)=>{const s=Math.min(1.08,Math.max(0,Tn/max))*COMP;const yInd=-.04-s;indicador.position.y=yInd;haste.position.y=yInd-.1;gancho.position.y=yInd-.204;molaM.scale.y=Math.max(.001,-.012-yInd);compAtual=-(yInd-.204)+.006;};
 g.userData.comprimento=()=>compAtual;g.userData.set(0);g.userData.tipo='analogico';sombra(g);return g;}
/* digital: célula de carga com visor; quase não se deforma */
function dinamometroDigital(){const g=new T.Group();const aco=mat(0xd0d5db,{roughness:.25,metalness:1});
 const argola=new T.Mesh(new T.TorusGeometry(.008,.0018,8,24),aco);argola.position.y=.006;g.add(argola);
 const corpo=new T.Mesh(new T.BoxGeometry(.06,.1,.03),mat(0x1f6f3a,{roughness:.45}));corpo.position.y=-.05;g.add(corpo);
 const visorFundo=new T.Mesh(new T.PlaneGeometry(.048,.024),mat(0x10181a,{roughness:.2}));visorFundo.position.set(0,-.032,.0152);g.add(visorFundo);
 const c=document.createElement('canvas');c.width=256;c.height=128;const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;const lcd=new T.Mesh(new T.PlaneGeometry(.046,.023),new T.MeshBasicMaterial({map:tx,toneMapped:false}));lcd.position.set(0,-.032,.0154);g.add(lcd);
 const marca=texto('LAB · 20 N · 0,01 N',{cor:'#d9f2e1',fonte:'600 40px Segoe UI, Arial',w:.05});marca.position.set(0,-.08,.0153);g.add(marca);
 [-.012,.012].forEach((x,i)=>{const b=new T.Mesh(new T.CylinderGeometry(.004,.004,.003,16),mat(i?0xd32f2f:0xe8e8e8,{roughness:.4}));b.rotation.x=Math.PI/2;b.position.set(x,-.064,.016);g.add(b);});
 const haste=new T.Mesh(new T.CylinderGeometry(.002,.002,.03,10),aco);haste.position.y=-.115;g.add(haste);
 const gancho=new T.Mesh(new T.TorusGeometry(.006,.0015,8,20,Math.PI*1.4),aco);gancho.rotation.z=Math.PI*.8;gancho.position.y=-.134;g.add(gancho);
 g.userData.set=(Tn,txt)=>{const x=c.getContext('2d');x.fillStyle='#b9d8b2';x.fillRect(0,0,256,128);x.fillStyle='#0f2414';x.font='700 76px "Courier New", monospace';x.textAlign='right';x.textBaseline='middle';x.fillText(txt||Tn.toFixed(2).replace('.',','),200,66);x.font='700 38px Segoe UI, Arial';x.fillText('N',246,74);tx.needsUpdate=true;};
 g.userData.comprimento=()=>.138;g.userData.set(0,'0,00');g.userData.tipo='digital';sombra(g);return g;}

/* ---------- cilindro de Arquimedes (com argola no topo) ---------- */
function cilindro(materialId,V){const g=new T.Group();const M=F.MATERIAIS[materialId]||F.MATERIAIS.aluminio;const H=F.alturaCilindro(V),r=E.rCil;
 const corpo=new T.Mesh(new T.CylinderGeometry(r,r,H,48),mat(M.cor,{metalness:M.metal,roughness:M.metal>.5?.28:.6,envMapIntensity:1.1}));corpo.position.y=H/2;g.add(corpo);
 const bisel=new T.Mesh(new T.TorusGeometry(r-.0006,.0007,6,48),corpo.material);bisel.rotation.x=Math.PI/2;bisel.position.y=H;g.add(bisel);
 const argola=new T.Mesh(new T.TorusGeometry(.005,.0013,8,20),mat(0xd0d5db,{metalness:1,roughness:.25}));argola.position.y=H+.006;g.add(argola);
 g.userData.altura=H;g.userData.pegavel=true;corpo.userData.cilindro=true;sombra(g);return g;}

/* ---------- recipientes ---------- */
function graduacaoRecipiente(A,altMax,cada,rotulo){const c=document.createElement('canvas');c.width=256;c.height=1024;const x=c.getContext('2d');x.clearRect(0,0,256,1024);x.fillStyle='#ffffff';x.strokeStyle='#ffffff';x.textBaseline='middle';x.textAlign='left';
 const ml=v=>1024-(v*1e-6/A)/altMax*1024;for(let v=cada;v*1e-6/A<altMax-.004;v+=cada){const y=ml(v);const grande=v%(cada*2)===0;x.lineWidth=grande?4:2.5;x.beginPath();x.moveTo(20,y);x.lineTo(grande?110:75,y);x.stroke();if(grande){x.font='600 40px Segoe UI, Arial';x.fillText(String(v),118,y);}}
 x.font='700 34px Segoe UI, Arial';x.fillText(rotulo,30,60);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=8;return t;}
function recipiente(tipo){const g=new T.Group();const R=E.rRec,esp=.0025,H=E.altRec;const A=F.area(R);
 const fora=new T.Mesh(new T.CylinderGeometry(R+esp,R+esp,H,64,1,true),vidro());fora.position.y=H/2+.003;g.add(fora);
 const dentro=new T.Mesh(new T.CylinderGeometry(R,R,H,64,1,true),vidro({opacity:.08}));dentro.position.y=H/2+.003;g.add(dentro);
 const fundo=new T.Mesh(new T.CylinderGeometry(R+esp,R+esp,.006,64),vidro({opacity:.3}));fundo.position.y=.003;g.add(fundo);
 const aro=new T.Mesh(new T.TorusGeometry(R+esp/2,esp/1.6,8,64),vidro({opacity:.35}));aro.rotation.x=Math.PI/2;aro.position.y=H+.003;g.add(aro);
 /* graduação em mL, na frente do vidro (lado da câmera); a escala começa no fundo interno */
 const grad=new T.Mesh(new T.CylinderGeometry(R+esp+.0004,R+esp+.0004,H,64,1,true,-.42,.84),new T.MeshBasicMaterial({map:graduacaoRecipiente(A,H,25,'mL'),transparent:true,depthWrite:false,toneMapped:false}));grad.position.y=H/2+.006;g.add(grad);
 if(tipo==='transbordamento'){/* bica: tubo inclinado na altura do transbordamento, levando o excedente à proveta */
  const pts=[V(R,E.hBica+.006,0),V(R+.02,E.hBica+.004,0),V(R+.05,E.hBica-.01,0),V(R+.072,E.hBica-.022,0)];const bica=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),24,.0045,12,false),vidro({opacity:.3}));g.add(bica);
  const furo=new T.Mesh(new T.CircleGeometry(.0042,16),new T.MeshBasicMaterial({color:0x0c1820,transparent:true,opacity:.6}));furo.rotation.y=-Math.PI/2;furo.position.set(R-.0004,E.hBica+.006,0);g.add(furo);
  g.userData.bicaFim=V(R+.072,E.hBica-.022,0);}
 g.userData.tipo=tipo;return g;}
function liquido(cor){const g=new T.Group();const R=E.rRec-.0004;
 const m=new T.MeshPhysicalMaterial({color:new T.Color(cor),transparent:true,opacity:.42,roughness:.05,metalness:0,envMap:ambiente(),envMapIntensity:1.1,clearcoat:.6,depthWrite:false,side:T.DoubleSide});
 const corpo=new T.Mesh(new T.CylinderGeometry(R,R,1,64,1,true),m);g.add(corpo);
 const sup=new T.Mesh(new T.CircleGeometry(R,64),new T.MeshPhysicalMaterial({color:new T.Color(cor).lerp(new T.Color(0xffffff),.25),transparent:true,opacity:.55,roughness:.02,envMap:ambiente(),envMapIntensity:1.6,clearcoat:1,depthWrite:false,side:T.DoubleSide}));sup.rotation.x=-Math.PI/2;g.add(sup);
 /* menisco: anel claro junto ao vidro */const men=new T.Mesh(new T.TorusGeometry(R-.001,.0012,6,64),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.35,depthWrite:false}));men.rotation.x=Math.PI/2;g.add(men);
 g.userData.set=(h,c)=>{const hh=Math.max(.0005,h);corpo.scale.y=hh;corpo.position.y=hh/2+.006;sup.position.y=hh+.006;men.position.y=hh+.006+.0006;if(c){m.color.set(c);sup.material.color.set(c).lerp(new T.Color(0xffffff),.25);}};return g;}
/* proveta de 100 mL com escala de 1 em 1 mL (número a cada 10) */
function proveta(){const g=new T.Group();const r=E.rProveta,esp=.0018,H=.235;const a=F.area(r);
 const pe=new T.Mesh(new T.CylinderGeometry(.03,.034,.008,6),vidro({opacity:.35}));pe.position.y=.004;g.add(pe);
 const tubo=new T.Mesh(new T.CylinderGeometry(r+esp,r+esp,H,40,1,true),vidro());tubo.position.y=.008+H/2;g.add(tubo);
 const bico=new T.Mesh(new T.TorusGeometry(r+esp/2,esp/1.4,8,40),vidro({opacity:.35}));bico.rotation.x=Math.PI/2;bico.position.y=.008+H;g.add(bico);
 const c=document.createElement('canvas');c.width=256;c.height=2048;const x=c.getContext('2d');x.strokeStyle='#ffffff';x.fillStyle='#ffffff';x.textBaseline='middle';
 const alt=H,base=.004;/* volume v (mL) → altura v·1e-6/a acima do fundo interno */
 for(let v=1;v<=100;v++){const yh=base+v*1e-6/a;const y=2048-(yh/alt)*2048;const d10=v%10===0,d5=v%5===0;x.lineWidth=d10?5:d5?3.5:2;x.beginPath();x.moveTo(20,y);x.lineTo(d10?120:d5?90:62,y);x.stroke();if(d10){x.font='700 52px Segoe UI, Arial';x.fillText(String(v),130,y);}}
 x.font='700 46px Segoe UI, Arial';x.fillText('mL',40,70);x.font='600 30px Segoe UI, Arial';x.fillText('100 mL · ±1 mL',30,130);
 const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=8;const grad=new T.Mesh(new T.CylinderGeometry(r+esp+.0003,r+esp+.0003,H,40,1,true,-.55,1.1),new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,toneMapped:false}));grad.position.y=.008+H/2;g.add(grad);
 const liq=new T.Mesh(new T.CylinderGeometry(r-.0003,r-.0003,1,32),new T.MeshPhysicalMaterial({color:0x9fd4ff,transparent:true,opacity:.5,roughness:.05,envMap:ambiente(),depthWrite:false}));g.add(liq);
 g.userData.set=(vol,cor)=>{const h=Math.max(.0002,vol/a);liq.scale.y=h;liq.position.y=.008+base+h/2-.004;liq.visible=vol>1e-8;if(cor)liq.material.color.set(cor);};g.userData.set(0);return g;}
/* régua de 30 cm em pé, ao lado do recipiente (zero no fundo interno) */
function regua(){const g=new T.Group();const c=document.createElement('canvas');c.width=128;c.height=2048;const x=c.getContext('2d');x.fillStyle='#e8d9b0';x.fillRect(0,0,128,2048);x.strokeStyle='#1c2430';x.fillStyle='#1c2430';x.textBaseline='middle';
 const L=.3;for(let mm=0;mm<=300;mm++){const y=2048-mm/1000/L*2048-((.006)/L*2048);if(y<0)break;const cm=mm%10===0,meio=mm%5===0;x.lineWidth=cm?3:1.5;x.beginPath();x.moveTo(0,y);x.lineTo(cm?52:meio?38:24,y);x.stroke();if(cm&&mm>0){x.font='700 34px Segoe UI, Arial';x.fillText(String(mm/10),60,y);}}
 x.font='700 26px Segoe UI, Arial';x.fillText('cm',62,30);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=8;
 const m=new T.Mesh(new T.BoxGeometry(.028,L,.003),[mat(0xd8c89c),mat(0xd8c89c),mat(0xd8c89c),mat(0xd8c89c),new T.MeshStandardMaterial({map:t,roughness:.7,envMap:ambiente(),envMapIntensity:.4}),mat(0xd8c89c)]);m.position.y=L/2;g.add(m);sombra(g);return g;}
/* fio entre o gancho e o cilindro */
function fio(){const m=new T.Mesh(new T.CylinderGeometry(.0006,.0006,1,6),mat(0xf2efe6,{roughness:.9}));m.userData.set=(a,b)=>{const d=b.clone().sub(a),L=d.length();m.position.copy(a).add(b).multiplyScalar(.5);m.scale.y=Math.max(1e-4,L);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());};return m;}
/* seta de força com rótulo: comprimento proporcional ao módulo */
function seta(cor){const g=new T.Group();const mm=new T.MeshBasicMaterial({color:new T.Color(cor),toneMapped:false,depthTest:false,transparent:true});const haste=new T.Mesh(new T.CylinderGeometry(.0018,.0018,1,10),mm);const ponta=new T.Mesh(new T.ConeGeometry(.0055,.014,14),mm);haste.renderOrder=ponta.renderOrder=19;g.add(haste,ponta);const r=rotulo('',cor);g.add(r);
 g.userData.set=(origem,dir,comp,txt)=>{g.visible=comp>.002;if(!g.visible)return;g.position.copy(origem);g.quaternion.setFromUnitVectors(V(0,1,0),dir.clone().normalize());haste.scale.y=Math.max(.001,comp-.014);haste.position.y=(comp-.014)/2;ponta.position.y=comp-.007;r.position.set(.028,comp*.6,0);setRotulo(r,txt,cor);};return g;}

/* ---------- vasos comunicantes: tubo em U ---------- */
function tuboU(){const g=new T.Group();const rT=.008,esp=.0018,dx=.05,yB=.05,Ht=.26;
 const caminho=new T.CurvePath();caminho.add(new T.LineCurve3(V(-dx,Ht,0),V(-dx,yB,0)));caminho.add(new T.QuadraticBezierCurve3(V(-dx,yB,0),V(-dx,yB-dx*1.1,0),V(0,yB-dx*1.1,0)));caminho.add(new T.QuadraticBezierCurve3(V(0,yB-dx*1.1,0),V(dx,yB-dx*1.1,0),V(dx,yB,0)));caminho.add(new T.LineCurve3(V(dx,yB,0),V(dx,Ht,0)));
 const vid=new T.Mesh(new T.TubeGeometry(caminho,200,rT+esp,20,false),vidro({opacity:.2}));g.add(vid);
 /* ligação inferior sempre cheia de água */const conx=new T.CurvePath();conx.add(new T.QuadraticBezierCurve3(V(-dx,yB,0),V(-dx,yB-dx*1.1,0),V(0,yB-dx*1.1,0)));conx.add(new T.QuadraticBezierCurve3(V(0,yB-dx*1.1,0),V(dx,yB-dx*1.1,0),V(dx,yB,0)));
 const mAgua=new T.MeshPhysicalMaterial({color:0x4fa8f0,transparent:true,opacity:.78,roughness:.05,envMap:ambiente(),depthWrite:false});const liga=new T.Mesh(new T.TubeGeometry(conx,80,rT-.0005,14,false),mAgua);g.add(liga);
 const colE=new T.Mesh(new T.CylinderGeometry(rT-.0005,rT-.0005,1,20),mAgua),colD=new T.Mesh(new T.CylinderGeometry(rT-.0005,rT-.0005,1,20),mAgua),mO=new T.MeshPhysicalMaterial({color:0xf2c45a,transparent:true,opacity:.85,roughness:.05,envMap:ambiente(),depthWrite:false}),colO=new T.Mesh(new T.CylinderGeometry(rT-.0005,rT-.0005,1,20),mO);colE.position.x=-dx;colD.position.x=dx;colO.position.x=dx;g.add(colE,colD,colO);
 const suporteU=new T.Mesh(new T.BoxGeometry(.24,.3,.01),mat(0x2b3a45,{roughness:.5}));suporteU.position.set(-.02,.15,-.02);g.add(suporteU);
 /* régua no próprio suporte, zero na altura de referência yB (início dos ramos retos) */
 const rg=regua();rg.position.set(-.1,yB-.006,-.012);g.add(rg);
 g.userData.set=(r,corO)=>{/* alturas medidas a partir de yB */const col=(m,y0,y1)=>{const L=Math.max(.0001,y1-y0);m.scale.y=L;m.position.y=yB+y0+L/2;m.visible=y1-y0>1e-5;};
  col(colE,0,r.yE);col(colD,0,r.yI);col(colO,r.yI,r.yD);if(corO)mO.color.set(corO);};
 g.userData.yB=yB;g.userData.dx=dx;g.userData.rT=rT;sombra(g);return g;}

window.LabEquip={ambiente,mat,vidro,texto,rotulo,setRotulo,sala,suporte,dinamometroAnalogico,dinamometroDigital,cilindro,recipiente,liquido,proveta,regua,fio,seta,tuboU,sombra};
})();
