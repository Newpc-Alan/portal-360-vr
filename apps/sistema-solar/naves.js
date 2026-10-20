/* Sistema Solar VR · Naves e telescópios (v9.12)
   Quatro marcos da exploração espacial, do mais perto ao mais longe:
   ISS e Hubble em órbita da Terra, James Webb no ponto L2 (do lado oposto ao Sol, além da Lua) e Voyager 1 já fora do
   Sistema Solar, na direção real em que ela viaja (constelação de Ofiúco/Hércules).
   Cada nave entra como um "corpo" do app: clique abre a ficha, a narração e a cópia ampliada (inclusive no óculos).
   Modelos 3D: NASA 3D Resources (github.com/nasa/NASA-3D-Resources), livres de direitos autorais; otimizados pela NEWPC.
   O uso não implica endosso da NASA. Regra 9: controles com addEventListener, sem onclick. */
(function(){'use strict';
function pronto(fn){if(window.THREE&&THREE.GLTFLoader&&typeof CORPOS!=='undefined'&&typeof buildSistema==='function'&&typeof esfera==='function'&&window.PortalSolarV8)fn();else setTimeout(()=>pronto(fn),80);}
pronto(()=>{
const T=THREE,R2D=Math.PI/180;
const NAVES={
 iss:{arq:'iss',nome:'ISS',tamanho:.42,
  ficha:{nome:'Estação Espacial Internacional',tipo:'Laboratório tripulado em órbita da Terra',
   dados:[['Tamanho','109 m × 73 m (um campo de futebol)'],['Altitude','cerca de 400 km'],['Velocidade','cerca de 28.000 km/h'],['Uma volta na Terra','cerca de 90 min (16 por dia)'],['Ocupada desde','novembro de 2000']],
   fato:'Dá para ver a ISS a olho nu: ela cruza o céu como um ponto brilhante e rápido, sem piscar, logo depois do pôr do sol ou antes do amanhecer. É um projeto de cinco agências espaciais (EUA, Rússia, Europa, Japão e Canadá).'}},
 hubble:{arq:'hubble',nome:'Hubble',tamanho:.3,
  ficha:{nome:'Telescópio Espacial Hubble',tipo:'Telescópio de luz visível em órbita da Terra',
   dados:[['Tamanho','13,2 m de comprimento (um ônibus)'],['Espelho','2,4 m de diâmetro'],['Altitude','cerca de 530 km'],['Lançamento','abril de 1990'],['Uma volta na Terra','cerca de 95 min']],
   fato:'Acima do ar que embaça a visão, o Hubble ajudou a medir a idade do Universo (cerca de 13,8 bilhões de anos) e fotografou galáxias tão distantes que vemos a luz que saiu delas há bilhões de anos.'}},
 webb:{arq:'webb',nome:'James Webb',tamanho:.62,
  ficha:{nome:'Telescópio Espacial James Webb',tipo:'Telescópio infravermelho no ponto L2',
   dados:[['Espelho','6,5 m, com 18 segmentos dourados'],['Escudo solar','cerca de 21 m × 14 m (uma quadra de tênis)'],['Distância da Terra','cerca de 1,5 milhão de km (4 vezes a Lua)'],['Lançamento','25 de dezembro de 2021'],['Temperatura de trabalho','cerca de −233 °C']],
   fato:'O Webb enxerga o calor (infravermelho), por isso precisa ficar muito frio: o escudo do tamanho de uma quadra de tênis bloqueia a luz do Sol, da Terra e da Lua. Fica sempre do lado oposto ao Sol, acompanhando a Terra.'}},
 voyager:{arq:'voyager',nome:'Voyager 1',tamanho:2.2,
  ficha:{nome:'Sonda Voyager 1',tipo:'Sonda no espaço interestelar',
   dados:[['Lançamento','5 de setembro de 1977'],['Distância do Sol','mais de 25 bilhões de km (cerca de 170 UA)'],['Sinal até a Terra','quase 24 horas na velocidade da luz'],['Velocidade','cerca de 61.000 km/h'],['Saiu da heliosfera','agosto de 2012']],
   fato:'É o objeto feito por humanos mais distante da Terra. Passou por Júpiter (1979) e Saturno (1980) e leva o Disco de Ouro, com sons e imagens da Terra. Por volta de novembro de 2026 fica a 1 dia-luz de nós.'}}
};
/* fichas como "corpos" do app (sem órbita própria: não entram em ORDEM nem em PLANETAS) */
Object.keys(NAVES).forEach(k=>{const n=NAVES[k],f=n.ficha;
 CORPOS[k]={nome:f.nome,tipo:f.tipo,cor:0xcfd8e3,raio:1.6,orbita:0,rotDias:40,anoDias:0,ua:0,diam:f.dados[0][1],dist:f.dados[1][1],luas:'—',incl:0,temp:'—',fato:f.fato,nave:true,
  linhasVR:[f.nome,f.tipo].concat(f.dados.slice(0,3).map(d=>d[0]+': '+d[1]),[f.fato,'Gire com o analógico · Grip segura na mão'])};});
let mostrar=true;try{mostrar=localStorage.getItem('pde_solar_naves')!=='0';}catch(_){}
/* modelos: carregados uma vez, centralizados e normalizados para medir 1 unidade no maior lado */
const MOLDE={};let carregados=0;
const loader=new T.GLTFLoader();
Object.keys(NAVES).forEach(k=>{loader.load('modelos/'+NAVES[k].arq+'.glb?v=9.12.0',g=>{const o=g.scene;const b=new T.Box3().setFromObject(o),sz=b.getSize(new T.Vector3()),c=b.getCenter(new T.Vector3());
  const piv=new T.Group();o.position.sub(c);piv.add(o);piv.scale.setScalar(1/Math.max(sz.x,sz.y,sz.z));
  o.traverse(m=>{if(m.isMesh){m.userData.corpoKey=null;m.userData.vrInterativo=false;const ms=Array.isArray(m.material)?m.material:[m.material];ms.forEach(mt=>{if(mt&&mt.metalness>.6)mt.metalness=.6;});}});
  MOLDE[k]=piv;carregados++;if(estado.vista==='sistema')montar();},undefined,()=>{carregados++;});});
function copia(k){const m=MOLDE[k];if(!m)return null;const c=m.clone(true);c.traverse(o=>{if(o.isMesh)o.material=Array.isArray(o.material)?o.material.map(x=>x.clone()):o.material.clone();});return c;}
/* corpo clicável: esfera invisível (fácil de acertar com o mouse ou o laser) com o modelo dentro */
const MAT_ALVO=new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false});
function alvo(k,raio,tamanhoModelo){const m=new T.Mesh(new T.SphereGeometry(raio,12,8),MAT_ALVO);m.userData.corpoKey=k;m.userData.vrInterativo=true;
 const c=copia(k);if(c){c.scale.multiplyScalar(tamanhoModelo);m.add(c);m.userData.modelo=c;}return m;}
/* a cópia ampliada (zoom do computador, foco no óculos, bancada "Examinar") usa esfera(); para uma nave devolve o modelo */
const esferaAntes=esfera;
esfera=function(r,cor,emissiva,key){if(key&&NAVES[key]&&MOLDE[key]){const m=alvo(key,r,r*2.1);m.userData.corpoKey=null;m.userData.vrInterativo=false;return m;}return esferaAntes.apply(this,arguments);};
/* ficha lateral */
const fichaAntes=atualizarFicha;
atualizarFicha=function(){const k=estado.sel;if(!NAVES[k])return fichaAntes.apply(this,arguments);const f=NAVES[k].ficha;
 let h='<div class="cardhead"><span class="bola" style="background:radial-gradient(circle at 35% 30%,#fff8,#5b7a99 60%)"></span><div><div class="nome">'+f.nome+'</div><div class="tipo">'+f.tipo+'</div></div></div>';
 f.dados.forEach(d=>{h+='<div class="metric"><span class="lbl">'+d[0]+'</span><span class="val">'+d[1]+'</span></div>';});
 h+='<div class="fato"><b>Curiosidade:</b> '+f.fato+'</div>';
 h+='<button class="btn" data-action="narrar" data-k="'+k+'" style="width:100%;justify-content:center;margin-top:10px">'+(narrAtual===k?'⏹ Parar narração':'🔊 Ouvir narração')+'</button>';
 h+='<div class="fato" style="opacity:.75;font-size:.85em">Modelo 3D: NASA. Tamanho e distância fora de escala.</div>';
 const el=document.getElementById('ficha');if(el)el.innerHTML=h;};
/* montagem na vista Sistema Solar */
let grupo=null,objs={};
function terraHolder(){const s=sis.find(x=>x.k==='terra');return s?s.mesh.parent:null;}
let presos=[];
function montar(){if(grupo&&grupo.parent)grupo.parent.remove(grupo);grupo=null;
 /* tira as cópias antigas presas à Terra e os rótulos delas (senão a ISS aparece duas vezes após reconstruir a vista) */
 presos.forEach(o=>{if(o.parent)o.parent.remove(o);});presos=[];
 const velhos=new Set(Object.values(objs).map(o=>o.m));if(typeof labelsMap!=='undefined')for(let i=labelsMap.length-1;i>=0;i--){if(velhos.has(labelsMap[i].mesh)){labelsMap[i].el.remove();labelsMap.splice(i,1);}}
 objs={};
 if(estado.vista!=='sistema'||!mostrar||!root)return;
 const h=terraHolder();if(!h)return;const terra=sis.find(x=>x.k==='terra').mesh,rT=CORPOS.terra.raio,dLua=terra.userData.dLua||(rT+2.4);
 grupo=new T.Group();grupo.name='naves';root.add(grupo);
 /* ISS e Hubble: órbitas baixas e inclinadas em volta da Terra */
 const orbita=(k,dist,incl,fase,vel)=>{if(!MOLDE[k])return;const p=new T.Group();p.rotation.z=incl*R2D;h.add(p);presos.push(p);const q=new T.Group();q.rotation.y=fase;p.add(q);
  const m=alvo(k,.45,NAVES[k].tamanho);m.position.x=dist;q.add(m);objs[k]={m,q,vel,donos:[p]};addLabel(m,NAVES[k].nome);};
 orbita('iss',rT+.55,51.6,0,2.2);orbita('hubble',rT+.85,28.5,2.4,1.9);
 /* Webb: no ponto L2, do lado oposto ao Sol (o +x do suporte da Terra aponta para fora), escudo virado para o Sol */
 if(MOLDE.webb){const m=alvo('webb',.6,NAVES.webb.tamanho);m.position.set(dLua*1.75,.25,0);m.userData.modelo&&(m.userData.modelo.rotation.y=-Math.PI/2);h.add(m);presos.push(m);objs.webb={m,donos:[]};addLabel(m,'James Webb');}
 /* Voyager 1: além de Netuno, na direção real (longitude eclíptica ~255°, latitude ~+35°), com o rastro desde o Sol */
 if(MOLDE.voyager){const lam=255*R2D,bet=35*R2D,d=raioOrbita('netuno')*1.5;const dir=new T.Vector3(Math.cos(bet)*Math.cos(lam),Math.sin(bet),-Math.cos(bet)*Math.sin(lam));
  const m=alvo('voyager',2.2,NAVES.voyager.tamanho);m.position.copy(dir.clone().multiplyScalar(d));m.lookAt(0,0,0);grupo.add(m);objs.voyager={m,donos:[]};addLabel(m,'Voyager 1');
  const pts=[];for(let i=0;i<=60;i++)pts.push(dir.clone().multiplyScalar(d*i/60));const lin=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineDashedMaterial({color:0x8fd3ff,dashSize:3,gapSize:3,transparent:true,opacity:.45}));lin.computeLineDistances();grupo.add(lin);}
}
const buildAntes=buildSistema;
buildSistema=function(){const r=buildAntes.apply(this,arguments);montar();return r;};
/* movimento: chamado a cada quadro pelo laço de animação (via atualizarLabels) */
let ult=performance.now();
const labelsAntes=atualizarLabels;
atualizarLabels=function(){const t=performance.now(),dt=Math.min(.05,(t-ult)/1000);ult=t;const v=estado.playing?estado.vel:0;
 for(const k in objs){const o=objs[k];if(o.q)o.q.rotation.y+=o.vel*dt*(v||.15);const md=o.m.userData.modelo;if(md&&k!=='voyager')md.rotation.y+=dt*.05;}
 return labelsAntes.apply(this,arguments);};
/* controle no painel Exibir */
function controle(){const g=document.getElementById('grpExibir');if(!g||document.getElementById('tgNaves'))return;const tg=g.querySelector('.toggles')||g;
 const lab=document.createElement('label');lab.className='chk';lab.innerHTML='<input type="checkbox" id="tgNaves"'+(mostrar?' checked':'')+'> Naves e telescópios';tg.appendChild(lab);
 document.getElementById('tgNaves').addEventListener('change',e=>{mostrar=e.target.checked;try{localStorage.setItem('pde_solar_naves',mostrar?'1':'0');}catch(_){}
  if(estado.vista==='sistema'){if(!mostrar&&NAVES[estado.sel])selecionar('terra');buildSistema();}});}
controle();
if(estado.vista==='sistema')montar();
window.SOLAR_NAVES={NAVES,objs:()=>objs,montar};
});
})();
