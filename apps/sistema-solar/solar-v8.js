/* Portal do Educador | Sistema Solar v8 | atualização independente da home.
 * Preserva as texturas e a trilha do pacote do usuário. Não altera armazenamento da abertura.
 */
(function(){
'use strict';
if(!window.THREE||!renderer||!root)return;
const T=THREE, $v=id=>document.getElementById(id);
const el=(tag,props={},parent=null)=>{const n=document.createElement(tag);Object.assign(n,props);if(parent)parent.appendChild(n);return n;};
const D={sol:1392700,mercurio:4879,venus:12104,terra:12742,lua:3474,marte:6779,jupiter:139820,saturno:116460,urano:50724,netuno:49244};
const S={narrSeq:0,quality:'equilibrado',environment:true,voice:1,music:.55,captions:true,compareA:'terra',compareB:'jupiter',guide:-1,mission:0,attempts:0,complete:false,dayAngle:0,manual:false,caption:'',captionUntil:0,visited:new Set(['terra']),activities:new Set(['sistema']),inspections:[],held:new Map(),dt:.016,simTime:0,phase:0,xrAnchor:null,xrPanel:null,xrCaption:null,xrLabels:[],lastPanel:'',lastCaption:'',lastPhase:-999,xrFocus:null,xrFocusKey:null,events:[],desktopFocus:null,desktopFocusKey:null,desktopFocusT:0,views:['sistema','planeta','comparar','diaNoite','fases','estacoes','eclipse','desafio']};
let vvLast=performance.now(), dimensions={w:0,h:0,p:0}, activeDrag=null;
const original={esfera,criarAnelSaturno,entrarVista,mostrarGrupos,buildPlaneta,buildFases,buildEclipse,atualizarFicha,selecionar,narrar,narrFallback,responder,criarControleVR,irCatalogo};
const ambient=scene.children.find(o=>o.isAmbientLight);
const sharedTextures=new Set(Object.values(TEX));
function release(object){if(!object)return;const gs=new Set(),ms=new Set(),ts=new Set();object.traverse(o=>{if(o.geometry)gs.add(o.geometry);const a=Array.isArray(o.material)?o.material:[o.material];for(const m of a){if(!m)continue;ms.add(m);for(const k of ['map','bumpMap','normalMap','specularMap','alphaMap','emissiveMap','roughnessMap']){const tx=m[k];if(tx&&!sharedTextures.has(tx)&&tx!==_texParticulaSuave)ts.add(tx);}}});if(object.parent)object.parent.remove(object);gs.forEach(x=>x.dispose());ms.forEach(x=>x.dispose());ts.forEach(x=>x.dispose());}
function emit(name,value){S.events.push({evento:name,valor:value,tempo:new Date().toISOString()});if(S.events.length>200)S.events.shift();}
function syncPause(){const b=$v('btnPlay');b.classList.toggle('on',estado.playing);b.textContent=estado.playing?'⏸ Pausar':'▶ Reproduzir';}
function pause(on){estado.playing=!on;syncPause();}
function colorHex(v){return '#'+Number(v||0).toString(16).padStart(6,'0');}
function syncPlanetDock(){const on=estado.vista==='planeta'&&!estado.vr&&!document.body.classList.contains('imersao');document.body.classList.toggle('vista-planeta',on);if(!planetDock)return;planetDock.hidden=!on;if(!on)return;const C=CORPOS[estado.sel]||CORPOS.terra;$v('v8PlanetName').textContent=C.nome;$v('v8PlanetType').textContent=(C.tipo||'Corpo celeste')+' · arraste para girar';$v('v8PlanetBall').style.background='radial-gradient(circle at 30% 28%, rgba(255,255,255,.80), rgba(255,255,255,.08) 28%, transparent 31%), linear-gradient(145deg,'+colorHex(C.cor)+' 0%, #0e2036 140%)';const active=S.captions&&S.caption&&performance.now()<S.captionUntil;$v('v8PlanetText').textContent=active?S.caption:C.fato;}
function caption(text,secs=14){S.caption=text;S.captionUntil=performance.now()+secs*1000;const c=$v('v8Speech');const inPlanet=estado.vista==='planeta'&&!estado.vr;if(c){c.textContent=text;c.hidden=!S.captions||!text||inPlanet;}syncPlanetDock();}
function speak(text){narrParar();caption(text,30);if(!window.speechSynthesis||!S.voice)return;const u=new SpeechSynthesisUtterance(text);u.lang='pt-BR';u.rate=.94;u.volume=S.voice;const pt=speechSynthesis.getVoices().find(x=>/pt[-_]BR/i.test(x.lang));if(pt)u.voice=pt;duckMusica(true);u.onend=u.onerror=()=>duckMusica(false);speechSynthesis.speak(u);}
function button(text,action,parent,cls='btn'){const b=el('button',{type:'button',className:cls,textContent:text},parent);b.addEventListener('click',action);return b;}
function row(parent){return el('div',{className:'row'},parent);}
function note(text,parent){return el('p',{textContent:text},parent);}
function range(parent,label,id,min,max,value,fn){const lab=el('label',{htmlFor:id,textContent:label},parent);const input=el('input',{type:'range',id,min,max,value,step:1},parent);input.addEventListener('input',()=>fn(Number(input.value)));return input;}
function select(parent,label,vals,selected,fn){el('label',{textContent:label},parent);const box=el('select',{},parent);for(const [v,t] of vals)box.add(new Option(t,v,false,v===selected));box.addEventListener('change',()=>fn(box.value));return box;}

// Interface: a marca ocupa uma faixa própria; textos e controles não ficam sobrepostos.
const app=$v('app'),bar=document.querySelector('.barrasup');
const brand=el('header',{className:'v8-brandbar',innerHTML:'<img src="media/logo.png" alt="Portal do Educador"><div><h1>Sistema Solar</h1><small>Portal do Educador · 360° VR</small></div><div class="v8-version">LABORATÓRIO INTERATIVO<br>v8 · 3D / WebXR</div>'});app.insertBefore(brand,app.firstChild);
const compareBtn=el('button',{className:'btn',type:'button',textContent:'⚖ Comparar'});compareBtn.dataset.v='comparar';bar.insertBefore(compareBtn,bar.querySelector('[data-v="diaNoite"]'));compareBtn.onclick=()=>entrarVista('comparar');
button('▷ Aula guiada',()=>startGuide(),bar);
button('☑ Resumo',showSummary,bar);
const panel=document.querySelector('.painel .aba');
const guide=el('section',{className:'v8-guide',id:'v8Guide',hidden:true});panel.prepend(guide);
const experiment=el('section',{className:'v8-panel',id:'v8Experiment'});guide.after(experiment);
const context=el('div',{id:'v8Context'});experiment.after(context);
el('div',{id:'v8Speech',hidden:true,role:'status','aria-live':'polite'},document.querySelector('.palco'));
const planetDock=el('section',{id:'v8PlanetDock',hidden:true,innerHTML:'<div class="v8-planet-head"><div class="v8-planet-ball" id="v8PlanetBall"></div><div><div class="v8-planet-name" id="v8PlanetName"></div><div class="v8-planet-type" id="v8PlanetType"></div></div></div><div class="v8-planet-text" id="v8PlanetText"></div>'},document.querySelector('.palco'));
const settings=el('details',{className:'v8-settings',innerHTML:'<summary>Conforto, áudio e qualidade</summary>'},panel);
select(settings,'Qualidade gráfica',[['economico','Econômico'],['equilibrado','Equilibrado'],['alto','Mais detalhes']],S.quality,v=>{S.quality=v;dimensions.p=0;applyQuality();});
range(settings,'Volume da voz','v8Voice',0,100,100,n=>{S.voice=n/100;if(narrSom)narrSom.setVolume(S.voice);if(S.narrAudio)S.narrAudio.volume=S.voice;});
range(settings,'Volume da trilha','v8Music',0,100,55,n=>{S.music=n/100;if(musicNodes&&audioCtx){musicNodes.nivel=S.music;musicNodes.master.gain.setTargetAtTime(narrAtual?S.music*.2:S.music,audioCtx.currentTime,.12);}});
for(const [label,key] of [['Ambiente com poeira e cometas','environment'],['Exibir legendas da narração','captions']]){const l=el('label',{textContent:label},settings);const i=el('input',{type:'checkbox',checked:S[key]},l);i.onchange=()=>{S[key]=i.checked;applyQuality();if(key==='captions')caption(S.caption);};}
note('No VR: use os controles. Centralize a experiência e ajuste a posição antes de começar. Interrompa se houver desconforto.',settings);
button('Iniciar novo aluno',()=>{if(confirm('Limpar as atividades desta sessão e iniciar um novo aluno?'))resetStudent();},settings);
const footer=el('footer',{className:'v8-footer',innerHTML:'<b>Explore · compare · experimente</b><span>Modelo didático: tamanhos e distâncias ajustados, exceto no comparador.</span><span class="v8-stats" id="v8Stats"></span>'},app);
const dialog=el('div',{className:'v8-dialog',id:'v8Summary',hidden:true,role:'dialog','aria-modal':'true'},app);
function applyQuality(){if(cinturao)cinturao.visible=S.environment;for(const c of cometas)c.piv.visible=S.environment;if(starfield)starfield.children.forEach(o=>o.visible=S.environment);if(renderer.xr.setFoveation)renderer.xr.setFoveation(S.quality==='alto'?.25:.7);}

function stopNarrationExclusive(){
  // Invalida qualquer callback assíncrono de uma narração anterior.
  S.narrSeq++;
  try{if(S.narrAudio){S.narrAudio.onended=null;S.narrAudio.onerror=null;S.narrAudio.pause();S.narrAudio.currentTime=0;S.narrAudio.removeAttribute('src');S.narrAudio.load();S.narrAudio=null;}}catch(e){}
  try{if(narrSom){if(narrSom.isPlaying)narrSom.stop();if(narrSom.parent)narrSom.parent.remove(narrSom);narrSom=null;}}catch(e){}
  try{if(window.speechSynthesis)speechSynthesis.cancel();}catch(e){}
  try{scene.traverse(o=>{if(o&&o.isAudio&&o.isPlaying){try{o.stop();}catch(e){}}});}catch(e){}
  narrAtual=null;narrCarregando=null;duckMusica(false);try{atualizarBotoesNarr();}catch(e){}
}
function clearDesktopFocus(){
  if(S.desktopFocus){release(S.desktopFocus);S.desktopFocus=null;}
  S.desktopFocusKey=null;S.desktopFocusT=0;
  document.body.classList.remove('v8-system-focus');
}
function desktopFocusTarget(){
  const dir=new T.Vector3();camera.getWorldDirection(dir);dir.normalize();
  const right=new T.Vector3().crossVectors(dir,camera.up).normalize();
  const up=camera.up.clone().normalize();
  return camera.position.clone().add(dir.multiplyScalar(10.5)).add(right.multiplyScalar(-1.15)).add(up.multiplyScalar(.25));
}
function createDesktopFocus(key){
  if(estado.vr||estado.vista!=='sistema'||!CORPOS[key])return null;
  clearDesktopFocus();
  const C=CORPOS[key],g=new T.Group();
  const visualRadius=key==='sol'?2.65:(key==='saturno'?2.35:2.55);
  const m=esfera(visualRadius,C.cor,key==='sol',key);m.userData.corpoKey=null;m.userData.vrInterativo=false;
  if(C.anel)m.add(criarAnelSaturno(visualRadius));
  g.add(m);g.userData.focusPlanet=true;g.userData.planetMesh=m;g.scale.setScalar(.03);
  g.position.copy(desktopFocusTarget());scene.add(g);
  S.desktopFocus=g;S.desktopFocusKey=key;S.desktopFocusT=0;
  document.body.classList.add('v8-system-focus');
  return m;
}
function updateDesktopFocus(){
  const g=S.desktopFocus;if(!g||estado.vr||estado.vista!=='sistema')return;
  S.desktopFocusT=Math.min(1,S.desktopFocusT+S.dt*3.8);
  const t=1-Math.pow(1-S.desktopFocusT,3);
  g.scale.setScalar(.03+.97*t);
  const target=desktopFocusTarget();g.position.lerp(target,Math.min(1,S.dt*8));
  const m=g.userData.planetMesh;if(m)m.rotation.y+=S.dt*.08;
}

BADGES.comparar='Comparação de diâmetros';DICAS.comparar='Diâmetros na mesma proporção · distância entre os corpos ajustada';DICAS.planeta='Arraste o planeta para girar · arraste o fundo para mover a câmera';DICAS.diaNoite='Gire a Terra ou use o controle de rotação · observe o marcador amarelo';
INFOS.sistema='Os tamanhos e as distâncias são ajustados para caber na maquete. Use Comparar para observar os diâmetros na mesma proporção.';
INFOS.estacoes='Estações do Ano no Hemisfério Sul (Brasil): Outono, Inverno, Primavera e Verão. A inclinação do eixo é mantida fixa no espaço.';
INFOS.comparar='Aqui os diâmetros usam uma escala comum. A separação entre os corpos não representa distâncias astronômicas reais.';

// Materiais: atmosfera por ângulo de visão, nuvens em camada independente e relevo sutil.
let clouds=null,water=null;
const loader=new T.TextureLoader();
clouds=loader.load('media/terra-nuvens.png');water=loader.load('media/terra-oceanos.png');sharedTextures.add(clouds);sharedTextures.add(water);
function atmosphere(radius,color){const m=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.BackSide,blending:T.AdditiveBlending,uniforms:{tint:{value:new T.Color(color)}},vertexShader:'varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform vec3 tint;varying vec3 n;varying vec3 v;void main(){float f=pow(1.-abs(dot(normalize(n),normalize(v))),3.);gl_FragColor=vec4(tint,f*.36);}'});return new T.Mesh(new T.SphereGeometry(radius,48,32),m);}
esfera=function(r,color,emissive,key){let m;const map=key?TEX[key]:null;const segments=S.quality==='economico'?32:64;
 if(key==='terra'){m=new T.MeshPhongMaterial({map:map,color:0xffffff,specularMap:water,specular:0x314855,shininess:16});}
 else if(emissive)m=new T.MeshBasicMaterial({map:map||null,color:map?0xffffff:color});
 else m=new T.MeshStandardMaterial({map:map||null,color:map?0xffffff:color,roughness:.97,metalness:0,bumpMap:['lua','mercurio','marte'].includes(key)?map:null,bumpScale:r*.012});
 const mesh=new T.Mesh(new T.SphereGeometry(r,segments,segments/2),m);
 if(key){mesh.userData.corpoKey=key;mesh.userData.vrInterativo=true;mesh.userData.radius=r;}
 if(key==='terra'){const c=new T.Mesh(new T.SphereGeometry(r*1.009,48,32),new T.MeshPhongMaterial({map:clouds,transparent:true,opacity:.48,depthWrite:false,shininess:0}));c.userData.cloud=true;mesh.add(c);mesh.add(atmosphere(r*1.035,0x4a9dff));}
 if(['venus','urano','netuno'].includes(key))mesh.add(atmosphere(r*1.025,key==='venus'?0xd5b36f:0x58add3));
 if(key==='sol')mesh.add(atmosphere(r*1.06,0xffa82b));
 return mesh;
};
criarAnelSaturno=function(r){const ring=original.criarAnelSaturno(r);const old=ring.material;ring.material=new T.MeshPhongMaterial({map:TEX.anel||null,color:TEX.anel?0xffffff:0xd2c59e,side:T.DoubleSide,transparent:true,opacity:.86,depthWrite:false,shininess:1});old.dispose();ring.userData.ring=true;return ring;};
limparRoot=function(){clearInspections();while(root.children.length)release(root.children[0]);root.position.set(0,0,0);root.rotation.set(0,0,0);root.scale.setScalar(1);sis=[];cinturao=null;cometas=[];focoMesh=null;terraDia=null;estObj=null;fasesObj=null;eclObj=null;S.lastPhase=-999;};
resize=function(){if(!renderer||renderer.xr.isPresenting)return;const m=medir();const p=Math.min(devicePixelRatio||1,S.quality==='economico'?1:S.quality==='alto'?2:1.5);if(m.w!==dimensions.w||m.h!==dimensions.h||p!==dimensions.p){dimensions={w:m.w,h:m.h,p};renderer.setPixelRatio(p);renderer.setSize(m.w,m.h,false);camera.aspect=m.w/m.h;camera.updateProjectionMatrix();}};

// Cometas: partículas com ciclo de vida; cauda iônica radial e poeira levemente curvada.
criarCometas=function(){if(!_texParticulaSuave)_texParticulaSuave=criarTexturaParticulaSuave();const arr=[];const rn=raioOrbita('netuno');for(let j=0;j<3;j++){const piv=new T.Group();piv.rotation.set(.26+j*.22,j*2.1,.15*j);root.add(piv);const hold=new T.Group();hold.position.x=rn*(.85+j*.12);piv.add(hold);const nuc=new T.Mesh(new T.IcosahedronGeometry(.3,1),new T.MeshStandardMaterial({color:0x554b41,roughness:1}));nuc.scale.set(1.4,.85,1);hold.add(nuc);const glow=new T.Sprite(new T.SpriteMaterial({map:_texParticulaSuave,color:0xc0eeff,transparent:true,opacity:.65,blending:T.AdditiveBlending,depthWrite:false}));glow.scale.set(2.8,2.8,1);hold.add(glow);const tracks=[];for(let k=0;k<2;k++){const n=S.quality==='economico'?100:220,positions=new Float32Array(n*3),colors=new Float32Array(n*3),seed=new Float32Array(n*4);for(let i=0;i<n;i++){seed[i*4]=Math.random();seed[i*4+1]=Math.random()*TAU;seed[i*4+2]=Math.random();seed[i*4+3]=.55+Math.random()*.5;}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));geo.setAttribute('color',new T.BufferAttribute(colors,3));const mat=new T.PointsMaterial({map:_texParticulaSuave,vertexColors:true,size:k?.65:.35,transparent:true,opacity:.6,depthWrite:false,blending:T.AdditiveBlending});const pts=new T.Points(geo,mat);pts.userData.baseSize=mat.size;hold.add(pts);tracks.push({geo,seed,n,k});}arr.push({piv,hold,nuc,speed:.14+j*.08,phase:Math.random(),tracks});}return arr;};
function cometStep(c,dt){c.piv.rotation.y+=c.speed*dt;c.nuc.rotation.y+=dt*.7;c.phase+=dt*.12;for(const tr of c.tracks){const p=tr.geo.attributes.position,co=tr.geo.attributes.color;for(let i=0;i<tr.n;i++){const q=(tr.seed[i*4]+c.phase*tr.seed[i*4+3])%1,angle=tr.seed[i*4+1],spread=(.08+q*(tr.k?1.3:.24))*tr.seed[i*4+2],f=(1-q)*(1-q)*.9;p.setXYZ(i,.25+q*(tr.k?12:19),Math.sin(angle)*spread,Math.cos(angle)*spread+(tr.k?q*q*3:0));co.setXYZ(i,f*(tr.k?1:.53),f*(tr.k?.76:.8),f*(tr.k?.43:1));}p.needsUpdate=true;co.needsUpdate=true;}}

buildPlaneta=function(){original.buildPlaneta();S.manual=false;if(focoMesh){focoMesh.mesh.userData.manipulavel=true;if(typeof camDist!=='undefined'){camDist=Math.max((CORPOS[estado.sel].raio||1)*4.2+2.1,4.2);if(typeof atualizarCamera==='function')atualizarCamera();}}renderPanel();syncPlanetDock();};
function buildCompare(){limparRoot();limparLabels();const a=S.compareA,b=S.compareB;const max=Math.max(D[a],D[b]),r1=D[a]/max*7,r2=D[b]/max*7,gap=3;const x1=-(r2+gap/2),x2=r1+gap/2;const m1=esfera(r1,CORPOS[a].cor,a==='sol',a),m2=esfera(r2,CORPOS[b].cor,b==='sol',b);m1.position.set(x1,0,0);m2.position.set(x2,0,0);root.add(m1,m2);if(CORPOS[a].anel)m1.add(criarAnelSaturno(r1));if(CORPOS[b].anel)m2.add(criarAnelSaturno(r2));addLabel(m1,CORPOS[a].nome);addLabel(m2,CORPOS[b].nome);const light=new T.DirectionalLight(0xffffff,1.4);light.position.set(-8,8,15);root.add(light);camTarget.set((x1+x2)/2,0,0);camDist=43;camElev=.14;camAzim=0;atualizarCamera();}
buildDiaNoite=function(){limparRoot();limparLabels();const light=new T.DirectionalLight(0xffffff,1.6);light.position.set(40,0,0);root.add(light);const sun=esfera(2,0xffcc33,true,'sol');sun.position.set(22,0,0);root.add(sun);const axis=new T.Group();axis.rotation.z=-23.44*PI/180;root.add(axis);const earth=esfera(6,0x2e6fdb,false,'terra');axis.add(earth);earth.rotation.y=S.dayAngle;const marker=esfera(.2,0xf4c744,true);const lat=-15*PI/180,lon=-50*PI/180;marker.position.set(6.06*Math.cos(lat)*Math.cos(lon),6.06*Math.sin(lat),-6.06*Math.cos(lat)*Math.sin(lon));earth.add(marker);const ag=new T.BufferGeometry().setFromPoints([new T.Vector3(0,-8,0),new T.Vector3(0,8,0)]);axis.add(new T.Line(ag,new T.LineBasicMaterial({color:0x76cfd5})));terraDia={mesh:earth,marcador:marker,axis,sol:sun};camTarget.set(1.5,0,0);camDist=33;camElev=.24;camAzim=.4;atualizarCamera();};
function daylight(){if(!terraDia)return 0;root.updateMatrixWorld(true);const a=new T.Vector3(),b=new T.Vector3();terraDia.marcador.getWorldPosition(a);terraDia.mesh.getWorldPosition(b);const n=a.sub(b).normalize();const sunDir=new T.Vector3(1,0,0).transformDirection(root.matrixWorld);return n.dot(sunDir);}
function setDay(v){S.dayAngle=((v%TAU)+TAU)%TAU;if(terraDia)terraDia.mesh.rotation.y=S.dayAngle;pause(true);updateDayStatus();}
function updateDayStatus(){if(!terraDia)return;const d=daylight();const status=d>.08?'DIA':d<-.08?'NOITE':'AMANHECER / ANOITECER';if($v('v8DayState'))$v('v8DayState').textContent='No marcador: '+status;if($v('v8DayRange')&&document.activeElement!==$v('v8DayRange'))$v('v8DayRange').value=Math.round(S.dayAngle*180/PI);}
function beginMission(){S.mission=1;S.attempts=0;S.complete=false;S.dayAngle=0;entrarVista('diaNoite');for(let i=0;i<360;i++){setDay(i*PI/180);if(daylight()>.8)break;}renderPanel();speak('Missão: faça anoitecer no marcador amarelo. Gire a Terra, sem mover o Sol. Quando o ponto estiver no lado escuro, confira o resultado.');emit('missao','iniciada');}
function checkMission(){S.attempts++;if(daylight()<-.12){S.mission=2;caption('Você fez anoitecer no marcador! Agora identifique o movimento que realizou.',15);emit('dia_noite','executado');renderPanel();}else{const text='O marcador ainda recebe luz do Sol. Gire mais a Terra até colocar o ponto no lado escuro.';caption(text);if($v('v8MissionResult'))$v('v8MissionResult').textContent=text;}S.lastPanel='';}
function finishMission(answer){S.attempts++;if(answer==='rotacao'){S.complete=true;S.mission=3;emit('missao','concluida');speak('Missão concluída. A rotação da Terra faz diferentes regiões entrarem e saírem da parte iluminada pelo Sol.');renderPanel();}else caption('Você girou a Terra em torno do próprio eixo. Esse movimento é chamado rotação. Tente novamente.');S.lastPanel='';}

buildEstacoes=function(){limparRoot();limparLabels();root.add(esfera(4,0xffcc33,true,'sol'));root.add(new T.PointLight(0xffffff,2.2,0,.5));root.add(anelOrbita(34));const holder=new T.Group();root.add(holder);holder.rotation.z=-23.44*PI/180;const earth=esfera(3,0x2e6fdb,false,'terra');holder.add(earth);const g=new T.BufferGeometry().setFromPoints([new T.Vector3(0,-5,0),new T.Vector3(0,5,0)]);holder.add(new T.Line(g,new T.LineBasicMaterial({color:0xf5b301})));estObj={terra:earth,holder,axisDir:new T.Vector3(Math.sin(23.44*PI/180),Math.cos(23.44*PI/180),0)};for(const [a,estacao,mes] of [[0,'OUTONO','MARÇO'],[90,'INVERNO','JUNHO'],[180,'PRIMAVERA','SETEMBRO'],[270,'VERÃO','DEZEMBRO']]){const p=new T.Object3D();const th=a*PI/180+PI/2;p.position.set(Math.cos(th)*40,0,Math.sin(th)*40);root.add(p);addLabel(p,estacao+' · '+mes);const lbl=labelsMap[labelsMap.length-1];if(lbl&&lbl.el)lbl.el.classList.add('season-label');}camTarget.set(0,0,0);camDist=108;camElev=.86;camAzim=.5;atualizarCamera();aplicarOrbita();};
function seasons(a){a=((a%360)+360)%360;const q=Math.floor(a/90),sul=['Outono','Inverno','Primavera','Verão'][q],norte=['Primavera','Verão','Outono','Inverno'][q];return{sul,norte,event:a%90<.01?(q%2?'Solstício':'Equinócio'):null,month:['Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez','Jan','Fev'][Math.floor(a/30)]};}
aplicarOrbita=function(){if(!estObj)return;const th=estado.orbAng*PI/180+PI/2;estObj.holder.position.set(Math.cos(th)*34,0,Math.sin(th)*34);const t=seasons(estado.orbAng);$v('mesLbl').textContent=t.month+(t.event?' · '+t.event:'');$v('estacaoInfo').innerHTML='<b>Hemisfério Sul: '+t.sul+'</b><br>Hemisfério Norte: '+t.norte+'<br><br>O eixo permanece apontando para a mesma direção. Posições e meses são referências didáticas, não um calendário astronômico exato.';};
function setSeason(a){estado.orbAng=a;$v('orbRange').value=a;aplicarOrbita();S.lastPanel='';}

desenharFase=function(deg){const c=$v('faseCanvas'),g=c.getContext('2d'),w=c.width,h=c.height,rr=62;const im=g.createImageData(w,h);const angle=deg*PI/180,lx=Math.sin(angle),lz=-Math.cos(angle);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const nx=(x-w/2)/rr,ny=(y-h/2)/rr,r2=nx*nx+ny*ny,i=(y*w+x)*4;if(r2>1){im.data[i]=5;im.data[i+1]=7;im.data[i+2]=15;}else{const nz=Math.sqrt(1-r2),light=nx*lx+nz*lz,shade=light>0?90+152*Math.sqrt(light):27;im.data[i]=shade;im.data[i+1]=shade;im.data[i+2]=shade*.96;}im.data[i+3]=255;}g.putImageData(im,0,0);};
atualizarFase=function(){if(!fasesObj)return;let a=((fasesObj.luaPivot.rotation.y*180/PI)%360+360)%360;const step=Math.round(a);if(S.lastPhase===step)return;S.lastPhase=step;const signed=a<=180?a:a-360;desenharFase(signed);$v('faseNome').textContent=nomeFase(signed);const f=Math.round((1-Math.cos(a*PI/180))*50);$v('fasePasso').innerHTML='Iluminação visível da Terra: <b>'+f+'%</b>. A Lua reflete a luz do Sol. As fases não são a sombra da Terra; a orientação da ilustração é uma convenção de observação.';};
function setPhase(a){if(fasesObj)fasesObj.luaPivot.rotation.y=a*PI/180;pause(true);S.lastPhase=-999;atualizarFase();S.lastPanel='';}
function rebuildView(v){if(v==='comparar')buildCompare();else if(v==='sistema')buildSistema();else if(v==='planeta')buildPlaneta();else if(v==='diaNoite')buildDiaNoite();else if(v==='estacoes')buildEstacoes();else if(v==='fases')buildFases();else if(v==='eclipse')buildEclipse();else if(v==='desafio'){buildSistema();novaQuestao();}}
entrarVista=function(v){if(!S.views.includes(v))v='sistema';stopNarrationExclusive();if(v!=='sistema')clearDesktopFocus();clearXRUI();estado.vista=v;S.activities.add(v);mostrarGrupos();$v('badge').textContent=BADGES[v];$v('dica').textContent=DICAS[v]||'';$v('modeinfo').classList.remove('show');context.textContent=(INFOS[v]||'Observe, manipule e compare.');atualizarBncc();rebuildView(v);ambient.intensity=['diaNoite','fases','eclipse'].includes(v)?.045:.36;renderPanel();syncPause();applyQuality();syncPlanetDock();if(estado.vr)setupXRActivity();emit('atividade',v);};
mostrarGrupos=function(){original.mostrarGrupos();$v('grpTempo').style.display=['estacoes','eclipse','desafio','comparar'].includes(estado.vista)?'none':'block';$v('grpBncc').style.display=['sistema','planeta','comparar','desafio'].includes(estado.vista)?'none':'block';};
selecionar=function(k){if(!CORPOS[k])return;S.visited.add(k);if(estado.vr&&estado.vista==='planeta'){estado.sel=k;entrarVista('planeta');}else{original.selecionar(k);if(!estado.vr&&estado.vista==='sistema')createDesktopFocus(k);}emit('corpo',k);if(['sistema','planeta'].includes(estado.vista))renderPanel();syncPlanetDock();};
atualizarLabels=function(){const show=estado.nomes&&!estado.vr&&['sistema','comparar','estacoes'].includes(estado.vista);for(const l of labelsMap){l.el.style.display=show?'block':'none';if(!show)continue;const p=new T.Vector3();l.mesh.getWorldPosition(p);p.project(camera);if(p.z>1||p.z< -1){l.el.style.display='none';continue;}l.el.style.left=((p.x*.5+.5)*canvas3d.clientWidth)+'px';l.el.style.top=((-p.y*.5+.5)*canvas3d.clientHeight)+'px';}};

function renderPanel(){experiment.innerHTML='';const v=estado.vista;
 if(v==='sistema'){el('h2',{textContent:'Um universo para investigar'},experiment);note('Clique em um planeta: ele será ampliado à sua frente e a narração anterior será encerrada antes da próxima começar.',experiment);const r=row(experiment);button('Examinar '+CORPOS[estado.sel].nome,()=>entrarVista('planeta'),r);button('Aula guiada',startGuide,r);if(S.desktopFocus)button('Fechar zoom',()=>{stopNarrationExclusive();clearDesktopFocus();renderPanel();},experiment,'btn full');}
 if(v==='planeta'){el('h2',{textContent:'Bancada de investigação'},experiment);note('Nesta vista, o foco fica no planeta ampliado. A narração aparece abaixo da visualização para não cobrir o objeto.',experiment);const r=row(experiment);button('↶ Girar',()=>rotateTarget(-.25),r);button('Girar ↷',()=>rotateTarget(.25),r);button('Comparar tamanhos',()=>{S.compareA=estado.sel;entrarVista('comparar');},experiment,'btn full');}
 if(v==='comparar'){el('h2',{textContent:'Compare os diâmetros'},experiment);const vals=ORDEM.map(k=>[k,CORPOS[k].nome]);select(experiment,'Primeiro corpo',vals,S.compareA,v=>{S.compareA=v;entrarVista('comparar');});select(experiment,'Segundo corpo',vals,S.compareB,v=>{S.compareB=v;entrarVista('comparar');});const ratio=D[S.compareB]/D[S.compareA];el('div',{className:'v8-result',textContent:'Diâmetro de '+CORPOS[S.compareB].nome+' ÷ diâmetro de '+CORPOS[S.compareA].nome+' = '+ratio.toLocaleString('pt-BR',{maximumFractionDigits:2})+'.'},experiment);note('Mesma escala de diâmetro. Isso não representa a proporção de massas nem de volumes. O Sol pode tornar os planetas pequenos demais para inspeção.',experiment);const r=row(experiment);button('Terra × Lua',()=>{S.compareA='terra';S.compareB='lua';entrarVista(v);},r);button('Terra × Júpiter',()=>{S.compareA='terra';S.compareB='jupiter';entrarVista(v);},r);}
 if(v==='diaNoite'){el('h2',{textContent:S.mission?'Missão: do dia para a noite':'Faça o planeta girar'},experiment);note('O ponto amarelo representa uma localização aproximada no Brasil. Observe quando ele recebe luz.',experiment);range(experiment,'Rotação da Terra','v8DayRange',0,360,Math.round(S.dayAngle*180/PI),n=>setDay(n*PI/180));el('div',{className:'v8-result',id:'v8DayState'},experiment);const r=row(experiment);button('− 15°',()=>setDay(S.dayAngle-PI/12),r);button('+ 15°',()=>setDay(S.dayAngle+PI/12),r);if(!S.mission)button('Iniciar missão',beginMission,experiment,'btn full');if(S.mission===1){note('Objetivo: coloque o marcador no lado noturno e confira.',experiment);button('Conferir posição',checkMission,experiment,'btn on full');el('div',{id:'v8MissionResult',className:'v8-result warning',textContent:'Dica: mantenha o Sol parado e gire a Terra.'},experiment);}if(S.mission===2){note('Qual movimento você realizou?',experiment);const r2=row(experiment);button('Rotação',()=>finishMission('rotacao'),r2);button('Translação',()=>finishMission('translacao'),r2);}if(S.complete){el('div',{className:'v8-result',textContent:'✓ Missão concluída. A rotação explica a alternância entre dia e noite.'},experiment);button('Repetir missão',beginMission,experiment,'btn full');}updateDayStatus();}
 if(v==='estacoes'){el('h2',{textContent:'Estações do Ano · Hemisfério Sul'},experiment);note('Referência principal: Brasil. Escolha uma estação e observe a posição da Terra na órbita.',experiment);const r=row(experiment);for(const [a,n] of [[0,'🍂 Outono'],[90,'❄️ Inverno'],[180,'🌸 Primavera'],[270,'☀️ Verão']])button(n,()=>setSeason(a),r);}
 if(v==='fases'){el('h2',{textContent:'A Lua vista da Terra'},experiment);note('Escolha uma fase para pausar e comparar as posições.',experiment);const r=row(experiment);for(const [a,n] of [[0,'Nova'],[90,'Crescente'],[180,'Cheia'],[270,'Minguante']])button(n,()=>setPhase(a),r);}
 if(v==='eclipse'){el('h2',{textContent:'Investigue o alinhamento'},experiment);note('Compare as duas configurações. O cone é um guia ilustrativo da sombra, não uma simulação astronômica de precisão.',experiment);}
 if(v==='desafio'){el('h2',{textContent:'Revise o que descobriu'},experiment);note('Responda e leia a explicação antes de avançar. As respostas ficam apenas nesta sessão.',experiment);}
 renderGuide();S.lastPanel='';}
function rotateTarget(delta){pause(true);if(estado.vista==='diaNoite')setDay(S.dayAngle+delta);else if(focoMesh){focoMesh.mesh.rotation.y+=delta;S.manual=true;}}

// Arrastar um objeto não altera a maquete inteira.
function pickPointer(x,y){const r=canvas3d.getBoundingClientRect();const rc=new T.Raycaster();rc.setFromCamera(new T.Vector2((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1),camera);return rc.intersectObjects(objetosVR(),false)[0];}
canvas3d.style.touchAction='none';
canvas3d.addEventListener('pointerdown',e=>{if(estado.vr||!['planeta','diaNoite'].includes(estado.vista))return;const h=pickPointer(e.clientX,e.clientY);const m=estado.vista==='diaNoite'?terraDia&&terraDia.mesh:focoMesh&&focoMesh.mesh;if(!h||h.object!==m)return;e.preventDefault();e.stopImmediatePropagation();activeDrag={id:e.pointerId,x:e.clientX,y:e.clientY,mesh:m,moved:false};canvas3d.setPointerCapture(e.pointerId);pause(true);},true);
canvas3d.addEventListener('pointermove',e=>{if(!activeDrag)return;e.preventDefault();e.stopImmediatePropagation();const dx=e.clientX-activeDrag.x,dy=e.clientY-activeDrag.y;activeDrag.moved=true;if(estado.vista==='diaNoite')setDay(S.dayAngle+dx*.01);else{activeDrag.mesh.rotation.y+=dx*.01;activeDrag.mesh.rotation.x+=dy*.008;S.manual=true;}activeDrag.x=e.clientX;activeDrag.y=e.clientY;},true);
for(const ev of ['pointerup','pointercancel'])canvas3d.addEventListener(ev,e=>{if(!activeDrag)return;activeDrag=null;dragging=false;try{canvas3d.releasePointerCapture(e.pointerId);}catch(_){}});
for(const ev of ['mousedown','touchstart','touchmove'])canvas3d.addEventListener(ev,e=>{if(activeDrag){e.preventDefault();e.stopImmediatePropagation();}},true);
let v8Down={x:0,y:0,t:0};canvas3d.addEventListener('pointerdown',e=>{v8Down={x:e.clientX,y:e.clientY,t:performance.now()};},true);
canvas3d.addEventListener('click',e=>{
  const curto=Math.hypot(e.clientX-v8Down.x,e.clientY-v8Down.y)<6&&performance.now()-v8Down.t<600;
  if(curto&&!estado.vr&&(narrAtual||S.narrAudio)&&!pickPointer(e.clientX,e.clientY)){stopNarrationExclusive();}
  if(['planeta','diaNoite'].includes(estado.vista)){e.stopImmediatePropagation();}
},true);

// Narração humanizada: UM player global. Um novo planeta sempre encerra o áudio anterior.
narrParar=function(){stopNarrationExclusive();};
narrFallback=function(key,seq){
  if(seq!==undefined&&seq!==S.narrSeq)return;
  if(!window.speechSynthesis){caption(CORPOS[key].fato);return;}
  try{speechSynthesis.cancel();}catch(e){}
  const C=CORPOS[key],u=new SpeechSynthesisUtterance(C.nome+'. '+C.tipo+'. '+C.fato);u.lang='pt-BR';u.rate=.94;u.volume=S.voice;
  const pt=speechSynthesis.getVoices().find(x=>/pt[-_]BR/i.test(x.lang));if(pt)u.voice=pt;
  narrAtual=key;duckMusica(true);atualizarBotoesNarr();
  u.onend=u.onerror=()=>{if(seq===undefined||seq===S.narrSeq){narrAtual=null;duckMusica(false);atualizarBotoesNarr();}};
  speechSynthesis.speak(u);
};
narrar=function(key,mesh){
  if(!CORPOS[key])return;
  stopNarrationExclusive();
  const seq=S.narrSeq;
  caption(CORPOS[key].nome+'. '+CORPOS[key].fato,30);
  const a=new Audio(NARR_BASE+key+'.mp3');
  S.narrAudio=a;narrAtual=key;a.preload='auto';a.volume=Math.max(0,Math.min(1,S.voice));
  duckMusica(true);atualizarBotoesNarr();
  const finish=()=>{if(seq!==S.narrSeq||S.narrAudio!==a)return;S.narrAudio=null;narrAtual=null;duckMusica(false);atualizarBotoesNarr();};
  a.onended=finish;
  a.onerror=()=>{if(seq!==S.narrSeq||S.narrAudio!==a)return;S.narrAudio=null;narrAtual=null;duckMusica(false);atualizarBotoesNarr();narrFallback(key,seq);};
  const p=a.play();if(p&&p.catch)p.catch(()=>{if(seq===S.narrSeq&&S.narrAudio===a){S.narrAudio=null;narrAtual=null;duckMusica(false);atualizarBotoesNarr();narrFallback(key,seq);}});
};
const GUIDE=[
 {v:'sistema',t:'Conheça a maquete',p:'O Sol é a estrela deste sistema. Selecione um planeta e observe sua órbita. Os tamanhos e as distâncias foram ajustados para a exploração.'},
 {v:'planeta',t:'Observe a Terra de perto',p:'Esta é a bancada de investigação. Arraste a Terra para observar continentes, oceanos e nuvens. Essa ampliação serve para inspecionar detalhes.'},
 {v:'comparar',t:'Compare os tamanhos',p:'A Terra e Júpiter aparecem com diâmetros na mesma proporção. Compare o tamanho dos dois, sem confundir diâmetro com volume ou massa.'},
 {v:'diaNoite',t:'Produza o dia e a noite',p:'Gire a Terra e acompanhe o ponto amarelo. Complete a missão para explicar por que diferentes regiões alternam entre dia e noite.'},
 {v:'fases',t:'Observe as fases da Lua',p:'Compare a Lua Nova com a Lua Cheia. A fase depende da parte iluminada pelo Sol que enxergamos a partir da Terra.'},
 {v:'estacoes',t:'Compare os hemisférios',p:'Escolha junho e dezembro. O eixo mantém a direção no espaço. Compare as estações no Hemisfério Sul e no Hemisfério Norte.'},
 {v:'eclipse',t:'Verifique o alinhamento',p:'No eclipse solar, a Lua está entre o Sol e a Terra. No eclipse lunar, a Terra está entre o Sol e a Lua.'},
 {v:'desafio',t:'Conte o que aprendeu',p:'Responda ao desafio. Depois abra o resumo para rever as atividades realizadas.'}
];
function startGuide(){S.guide=0;goGuide();}
function goGuide(){const g=GUIDE[S.guide];if(!g){S.guide=-1;renderGuide();showSummary();return;}if(g.v==='planeta')estado.sel='terra';if(g.v==='comparar'){S.compareA='terra';S.compareB='jupiter';}if(g.v==='diaNoite')beginMission();else entrarVista(g.v);renderGuide();speak(g.p);emit('aula',S.guide+1);}
function renderGuide(){guide.hidden=S.guide<0;if(guide.hidden)return;const g=GUIDE[S.guide];guide.innerHTML='<small>AULA GUIADA · '+(S.guide+1)+' / '+GUIDE.length+'</small>';el('h2',{textContent:g.t},guide);note(g.p,guide);el('progress',{max:GUIDE.length,value:S.guide+1},guide);const r=row(guide);button('Ouvir',()=>speak(g.p),r);button(S.guide===GUIDE.length-1?'Concluir':'Próxima',()=>{S.guide++;goGuide();},r);button('Encerrar',()=>{S.guide=-1;narrParar();renderGuide();},r);}
const explanations={
 'Qual é o maior planeta do Sistema Solar?':'Júpiter é o maior planeta. Abra Comparar para colocar seus diâmetros na mesma escala.',
 'O que causa as estações do ano na Terra?':'A inclinação do eixo, combinada com a translação, altera a iluminação dos hemisférios ao longo do ano.',
 'O que causa o dia e a noite?':'A rotação faz cada região entrar e sair da parte iluminada da Terra.',
 'Em qual fase da Lua ocorre o eclipse solar?':'É necessário haver Lua Nova e alinhamento adequado. Não ocorre eclipse em toda Lua Nova.',
 'Em qual fase da Lua ocorre o eclipse lunar?':'É necessário haver Lua Cheia e alinhamento adequado. Não ocorre eclipse em toda Lua Cheia.'
};
responder=function(btn,ok,correct){if(quiz.respondida)return;original.responder(btn,ok,correct);let box=$v('v8QuizExplain');if(!box){box=el('div',{id:'v8QuizExplain',className:'v8-result'});$v('qOps').after(box);}box.textContent=explanations[$v('qPergunta').textContent]||('A resposta correta é '+correct+'. Revise a ficha do planeta ou a atividade correspondente.');box.classList.toggle('warning',!ok);emit('quiz',{pergunta:$v('qPergunta').textContent,acerto:ok});};
const oldQ=novaQuestao;novaQuestao=function(){oldQ();const box=$v('v8QuizExplain');if(box)box.remove();S.lastPanel='';};
function showSummary(){dialog.innerHTML='';dialog.hidden=false;const b=el('div',{},dialog);el('h2',{textContent:'Resumo da exploração'},b);note('Registro desta sessão, sem nome de aluno e sem envio a um servidor.',b);note('Corpos explorados: '+[...S.visited].map(k=>CORPOS[k].nome).join(', ')+'.',b);note('Atividades abertas: '+[...S.activities].map(k=>BADGES[k]).join(', ')+'.',b);note('Missão dia e noite: '+(S.complete?'concluída':'ainda não concluída')+'. Conferências e respostas: '+S.attempts+'.',b);note('Revisão: '+quiz.acertos+' acertos em '+quiz.total+' respostas.',b);const r=row(b);button('Exportar resumo',exportSummary,r);button('Fechar',()=>dialog.hidden=true,r);}
function exportSummary(){const data={aplicacao:'Sistema Solar v8',gerado:new Date().toISOString(),corpos:[...S.visited],atividades:[...S.activities],missaoDiaNoite:{concluida:S.complete,tentativas:S.attempts},revisao:{acertos:quiz.acertos,total:quiz.total},eventos:S.events};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=el('a',{href:url,download:'resumo-sistema-solar.json'});a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function resetStudent(){stopNarrationExclusive();clearDesktopFocus();S.visited=new Set(['terra']);S.activities=new Set();S.mission=0;S.complete=false;S.attempts=0;S.events=[];S.guide=-1;S.dayAngle=0;quiz.acertos=quiz.total=quiz.seq=0;$v('qAcertos').textContent=$v('qTotal').textContent=$v('qSeq').textContent='0';dialog.hidden=true;entrarVista('sistema');}

// VR: console no mundo, atividades sem sair do headset, cópia independente segurável.
function clearInspections(){for(const m of S.inspections)release(m);S.inspections=[];S.held.clear();}
function clearXRUI(){limparBotoesVR();fecharPainelVR();limparLabelsVR();for(const l of S.xrLabels)release(l.sp);S.xrLabels=[];if(S.xrPanel){release(S.xrPanel);S.xrPanel=null;}if(S.xrCaption){release(S.xrCaption);S.xrCaption=null;}if(S.xrFocus){release(S.xrFocus);S.xrFocus=null;S.xrFocusKey=null;}S.lastPanel='';S.lastCaption='';}
function xrAnchor(){const p=new T.Vector3(),q=new T.Quaternion();const cam=renderer.xr.isPresenting?renderer.xr.getCamera(camera):camera;cam.getWorldPosition(p);cam.getWorldQuaternion(q);const forward=new T.Vector3(0,0,-1).applyQuaternion(q);forward.y=0;if(forward.lengthSq()<.01)forward.set(0,0,-1);forward.normalize();return{p,f:forward,r:new T.Vector3(-forward.z,0,forward.x),yaw:Math.atan2(-forward.x,-forward.z)};}
function atAnchor(x,y,z){return S.xrAnchor.p.clone().addScaledVector(S.xrAnchor.r,x).addScaledVector(S.xrAnchor.f,z).add(new T.Vector3(0,y,0));}
function xrButton(text,action,x,y,z=1.45){const b=criarBotaoVR(text,action);b.position.copy(atAnchor(x,y,z));scene.add(b);return b;}
function setupXRActivity(){clearXRUI();if(!S.xrAnchor)S.xrAnchor=xrAnchor();const v=estado.vista;const scales={sistema:.017,desafio:.017,planeta: .3/(CORPOS[estado.sel].raio||1),comparar:.062,diaNoite:.068,fases:.049,estacoes:.023,eclipse:.028};root.scale.setScalar(scales[v]);root.rotation.set(v==='sistema'||v==='estacoes'?.25:0,S.xrAnchor.yaw,0);root.position.copy(atAnchor(0,-.45,1.85));if(v==='planeta'){root.position.copy(atAnchor(0,.02,1.0));root.scale.multiplyScalar(1.22);}root.traverse(o=>{if(o.isPoints){if(o.userData.baseSize===undefined)o.userData.baseSize=o.material.size;o.material.size=o.userData.baseSize*root.scale.x;}if(o.isPointLight)o.decay=0;});
 const titles=['Sistema Solar','Examinar','Comparar','Dia e noite','Fases da Lua','Estações','Eclipses','Desafio'];S.views.forEach((x,i)=>xrButton(titles[i],'view:'+x,-1.08,.5-i*.135));xrButton('Centralizar','center',-.26,-.88);xrButton('Pausar / retomar','pause',.26,-.88);xrButton('Catálogo','catalogo',-.26,-1.02);xrButton('Sair do VR','sair',.26,-1.02);
 if(v==='sistema'||v==='planeta'){xrButton('Ouvir planeta','speak',.78,-.56);xrButton('Anterior','prevPlanet',.58,-.70);xrButton('Próximo','nextPlanet',.98,-.70);if(v==='sistema')xrButton('Fechar zoom','closeFocus',.78,-.84);}
 if(v==='comparar'){xrButton('Terra × Lua','cmp:lua',.9,-.30);xrButton('Terra × Júpiter','cmp:jupiter',.9,-.45);xrButton('Terra × Saturno','cmp:saturno',.9,-.60);}
 if(v==='diaNoite'){xrButton('Girar − 15°','day:-1',.72,-.3);xrButton('Girar + 15°','day:1',1.19,-.3);xrButton('Iniciar missão','mission',.95,-.45);xrButton('Conferir','check',.95,-.6);}
 if(v==='estacoes')[[0,'Outono'],[90,'Inverno'],[180,'Primavera'],[270,'Verão']].forEach(([a,n],i)=>xrButton(n,'season:'+a,.95,-.15-i*.14));
 if(v==='fases')[[0,'Nova'],[90,'Crescente'],[180,'Cheia'],[270,'Minguante']].forEach(([a,n],i)=>xrButton(n,'phase:'+a,.95,-.15-i*.14));
 if(v==='eclipse'){xrButton('Solar','eclipse:solar',.95,-.25);xrButton('Lunar','eclipse:lunar',.95,-.4);}
 if(v==='desafio'){Array.from($v('qOps').children).forEach((b,i)=>xrButton(String.fromCharCode(65+i)+' — '+b.textContent,'answer:'+i,.95,-.1-i*.16));xrButton('Próxima questão','question',.95,-.81);}
 xrButton(S.guide<0?'Aula guiada':'Próxima etapa','guide',-.80,-.75);
 if(S.mission===2&&v==='diaNoite'){xrButton('Rotação','result:rotacao',.72,-.75);xrButton('Translação','result:translacao',1.19,-.75);}
 // Etiquetas existentes reaproveitam as posições dos modelos, sem alterar escala.
 for(const l of labelsMap){const sp=criarLabelVR(l.el.textContent);sp.scale.set(.20,.05,1);scene.add(sp);S.xrLabels.push({sp,mesh:l.mesh});}
 S.lastPanel='';updateXRPanel();}
function criarFocoPlanetaVR(key){
  if(S.xrFocus){release(S.xrFocus);S.xrFocus=null;S.xrFocusKey=null;}
  const C=CORPOS[key];if(!C||!S.xrAnchor)return null;
  const r=.30,m=esfera(r,C.cor,key==='sol',key);
  if(C.anel)m.add(criarAnelSaturno(r));
  m.rotation.z=(C.incl||0)*PI/180;
  m.position.copy(atAnchor(0,.03,.82));
  m.userData.vrInterativo=true;m.userData.inspection=true;m.userData.corpoKey=key;m.userData.zoomT=0;
  m.scale.setScalar(.18);scene.add(m);S.xrFocus=m;S.xrFocusKey=key;return m;
}
function animarFocoPlanetaVR(){const m=S.xrFocus;if(!m)return;if(m.userData.zoomT<1){m.userData.zoomT=Math.min(1,m.userData.zoomT+S.dt*3.2);const t=1-Math.pow(1-m.userData.zoomT,3);m.scale.setScalar(.18+.82*t);}m.rotation.y+=S.dt*.08;}
function linhasPainelPlanetaVR(key){const C=CORPOS[key];if(!C)return ['Planeta'];return [C.nome,C.tipo,'Diâmetro: '+C.diam,(C.distLabel||'Distância do Sol')+': '+C.dist,'Temperatura: '+C.temp,C.fato];}
function xrText(lines,width=1024,height=512){return textoCanvasVR(width,height,(g,c)=>{g.fillStyle='rgba(5,19,34,.94)';g.beginPath();g.roundRect(0,0,c.width,c.height,28);g.fill();g.strokeStyle='#37b1da';g.lineWidth=4;g.stroke();let y=58;for(let i=0;i<lines.length;i++){g.font=(i===0?'700 44px':'500 32px')+' Segoe UI, Arial';g.fillStyle=i===0?'#80dfc0':'#e4f3ff';for(const line of quebrarLinhas(g,lines[i],c.width-80)){if(y>height-20)break;g.fillText(line,40,y);y+=i===0?58:43;}y+=10;}});}
function xrPlanetCaption(text){return textoCanvasVR(1400,360,(g,c)=>{g.clearRect(0,0,c.width,c.height);g.textAlign='center';g.textBaseline='middle';g.shadowColor='rgba(0,0,0,.95)';g.shadowBlur=14;g.fillStyle='#f2f8ff';g.font='600 52px Segoe UI, Arial';const lines=quebrarLinhas(g,text,c.width-140).slice(0,4);const lh=66,total=lines.length*lh;let y=(c.height-total)/2+lh/2;for(const line of lines){g.fillText(line,c.width/2,y);y+=lh;}g.shadowBlur=0;});}
function updateXRPanel(){
 const v=estado.vista;let lines=[BADGES[v]],lateral=false;
 if(v==='sistema'&&S.xrFocusKey){lines=linhasPainelPlanetaVR(S.xrFocusKey);lateral=true;}
 else if(v==='planeta'){lines=linhasPainelPlanetaVR(estado.sel);lateral=true;}
 else if(v==='comparar')lines.push(CORPOS[S.compareA].nome+' × '+CORPOS[S.compareB].nome,'Razão dos diâmetros: '+(D[S.compareB]/D[S.compareA]).toLocaleString('pt-BR',{maximumFractionDigits:2}),'Mesma proporção de diâmetro. Distâncias ajustadas.');
 else if(v==='diaNoite')lines.push(daylight()>.08?'Marcador: DIA':daylight()<-.08?'Marcador: NOITE':'Marcador: transição',S.mission===2?'Qual movimento você realizou?':S.complete?'Missão concluída!':S.mission?'Coloque o marcador na noite e confira.':'Gire a Terra e observe a iluminação.');
 else if(v==='estacoes'){const t=seasons(estado.orbAng);lines.push(t.month,'Sul: '+t.sul,'Norte: '+t.norte);}
 else if(v==='fases')lines.push($v('faseNome').textContent,$v('fasePasso').textContent);
 else if(v==='eclipse')lines.push($v('eclipseInfo').textContent);
 else if(v==='desafio')lines.push($v('qPergunta').textContent,quiz.respondida?('Resposta: '+quiz.certa):'Selecione uma alternativa no console.');
 else lines.push(CORPOS[estado.sel].nome,CORPOS[estado.sel].fato,'Aponte e aperte o gatilho para aproximar um planeta.');
 const txt=(lateral?'L|':'C|')+lines.join('|');if(txt===S.lastPanel)return;S.lastPanel=txt;if(S.xrPanel)release(S.xrPanel);
 const sp=xrText(lines,lateral?900:1024,lateral?760:512);
 if(lateral){sp.scale.set(.50,.42,1);sp.position.copy(atAnchor(.74,.12,.92));sp.rotation.y=S.xrAnchor.yaw-.18;}
 else{sp.scale.set(.68,.34,1);sp.position.copy(atAnchor(.82,.42,1.55));}
 scene.add(sp);S.xrPanel=sp;
}
acaoBotaoVR=function(action){if(action.startsWith('view:')){entrarVista(action.slice(5));return;}if(action==='center'){S.xrAnchor=xrAnchor();setupXRActivity();return;}if(action==='pause'){pause(estado.playing);return;}if(action==='sair'){alternarVR();return;}if(action==='catalogo'){if(vrSession)vrSession.end().then(original.irCatalogo,original.irCatalogo);else original.irCatalogo();return;}if(action==='speak'){narrar(estado.sel,S.xrFocus||meshDoCorpo(estado.sel));return;}if(action==='closeFocus'){if(S.xrFocus){release(S.xrFocus);S.xrFocus=null;S.xrFocusKey=null;}narrParar();S.lastPanel='';S.lastCaption='';updateXRPanel();return;}if(action==='prevPlanet'||action==='nextPlanet'){const i=ORDEM.indexOf(estado.sel),k=ORDEM[(i+(action==='nextPlanet'?1:ORDEM.length-1))%ORDEM.length];if(estado.vista==='sistema'){estado.sel=k;S.visited.add(k);criarFocoPlanetaVR(k);narrar(k,S.xrFocus);S.lastPanel='';S.lastCaption='';updateXRPanel();}else selecionar(k);return;}if(action.startsWith('cmp:')){S.compareA='terra';S.compareB=action.slice(4);entrarVista('comparar');return;}if(action.startsWith('day:'))setDay(S.dayAngle+Number(action.slice(4))*PI/12);if(action.startsWith('season:'))setSeason(Number(action.slice(7)));if(action.startsWith('phase:'))setPhase(Number(action.slice(6)));if(action.startsWith('eclipse:')){estado.ecl=action.slice(8);aplicarEclipse();S.lastPanel='';}if(action==='mission')beginMission();if(action==='check'){checkMission();if(S.mission===2)setupXRActivity();}if(action.startsWith('result:'))finishMission(action.slice(7));if(action.startsWith('answer:')){const b=$v('qOps').children[Number(action.slice(7))];if(b)b.click();S.lastPanel='';}if(action==='question'){novaQuestao();setupXRActivity();}if(action==='guide'){if(S.guide<0)startGuide();else{S.guide++;goGuide();}}};
tratarSelecaoVR=function(ctrl){const b=raycastBotoesVR(ctrl);if(b){acaoBotaoVR(b.userData.vrBotao);return;}const h=raycastController(ctrl);if(!h){if(narrAtual||S.narrAudio)stopNarrationExclusive();return;}const key=h.object.userData.corpoKey;if(!key)return;if(estado.vista==='sistema'){estado.sel=key;S.visited.add(key);emit('corpo',key);const foco=criarFocoPlanetaVR(key);narrar(key,foco||h.object);S.lastPanel='';S.lastCaption='';updateXRPanel();return;}selecionar(key);narrar(key,h.object);S.lastPanel='';};
function grab(ctrl){if(rayCastHeld(ctrl))return;const hit=raycastController(ctrl);if(!hit)return;const k=hit.object.userData.corpoKey;if(!k)return;const m=esfera(.22,CORPOS[k].cor,k==='sol',k);if(CORPOS[k].anel)m.add(criarAnelSaturno(.22));scene.add(m);ctrl.add(m);m.position.set(0,-.025,-.4);m.rotation.set(0,0,0);m.userData.inspection=true;S.inspections.push(m);S.held.set(ctrl,m);if(S.inspections.length>3){const old=S.inspections.shift();for(const [c,o] of S.held)if(o===old)S.held.delete(c);release(old);}caption('Cópia de inspeção: segure o botão lateral para mover; solte para deixar no espaço.',8);}
function rayCastHeld(ctrl){const rc=new T.Raycaster();rc.ray.origin.setFromMatrixPosition(ctrl.matrixWorld);rc.ray.direction.set(0,0,-1).transformDirection(ctrl.matrixWorld);const h=rc.intersectObjects(S.inspections,false)[0];if(!h)return false;const m=h.object;if([...S.held.values()].includes(m))return true;ctrl.attach(m);S.held.set(ctrl,m);return true;}
function drop(ctrl){const m=S.held.get(ctrl);if(m){scene.attach(m);S.held.delete(ctrl);}}
criarControleVR=function(i){const ctrl=renderer.xr.getController(i);vrRig.add(ctrl);const g=new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3(0,0,-1)]);const ray=new T.Line(g,new T.LineBasicMaterial({color:0x37b1da}));ray.name='vrRay';ray.scale.z=4;ctrl.add(ray);ctrl.addEventListener('selectstart',()=>tratarSelecaoVR(ctrl));ctrl.addEventListener('squeezestart',()=>grab(ctrl));ctrl.addEventListener('squeezeend',()=>drop(ctrl));ctrl.addEventListener('disconnected',()=>drop(ctrl));vrControllers.push(ctrl);return ctrl;};
entrarVR=async function(){if(!window.isSecureContext||!navigator.xr){vrMensagem('Abra em HTTPS em um navegador compatível com WebXR. O modo 3D continua disponível.',6000);return;}try{if(!await navigator.xr.isSessionSupported('immersive-vr')){vrMensagem('Este dispositivo não informou suporte a VR imersivo.',5000);return;}renderer.xr.setReferenceSpaceType('local-floor');const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor']});try{await renderer.xr.setSession(session);}catch(e){await session.end();throw e;}vrSession=session;estado.vr=true;document.body.classList.add('vr-active');$v('btnVR').textContent='🥽 Sair do VR';camera.position.set(0,0,0);camera.rotation.set(0,0,0);vrRig.position.set(0,0,0);if(!vrControllers.length){criarControleVR(0);criarControleVR(1);}S.xrAnchor=null;session.addEventListener('end',sairVRFinal);S.xrWait=3;narrInit();}catch(e){vrMensagem('Não foi possível iniciar VR: '+e.message,7000);}};
sairVRFinal=function(){clearInspections();clearXRUI();estado.vr=false;vrSession=null;S.xrAnchor=null;document.body.classList.remove('vr-active');$v('btnVR').textContent='🥽 Entrar em VR';narrParar();root.position.set(0,0,0);root.rotation.set(0,0,0);root.scale.setScalar(1);vrRig.position.set(0,0,0);entrarVista(estado.vista);dimensions.w=0;resize();};
atualizarVR=function(){if(S.xrWait){S.xrWait--;if(!S.xrWait){S.xrAnchor=xrAnchor();setupXRActivity();}return;}for(const ctrl of vrControllers){const h=raycastBotoesVR(ctrl)||raycastController(ctrl),ray=ctrl.getObjectByName('vrRay');if(ray)ray.material.color.setHex(h?0x8fe4ba:0x37b1da);}const session=renderer.xr.getSession();if(session){let i=0;for(const source of session.inputSources){const gp=source.gamepad;if(!gp){i++;continue;}const prev=vrPrevBtn[i]||(vrPrevBtn[i]={});const ax=gp.axes[2]||0,ay=gp.axes[3]||0;if(Math.abs(ax)>.25){if(estado.vista==='diaNoite')setDay(S.dayAngle-ax*S.dt);else if(estado.vista==='planeta'&&focoMesh){focoMesh.mesh.rotation.y-=ax*S.dt;pause(true);}else root.rotation.y-=ax*S.dt*.6;}if(Math.abs(ay)>.25)root.position.addScaledVector(S.xrAnchor.f,ay*S.dt*.15);const pressed=gp.buttons[4]&&gp.buttons[4].pressed;if(pressed&&!prev.a)pause(estado.playing);prev.a=pressed;i++;}}
 root.updateMatrixWorld(true);for(const l of S.xrLabels){const p=new T.Vector3();l.mesh.getWorldPosition(p);const r=l.mesh.geometry&&l.mesh.geometry.parameters.radius||1;l.sp.position.copy(p);l.sp.position.y+=r*root.scale.x+.04;l.sp.visible=estado.nomes;}
 animarFocoPlanetaVR();updateXRPanel();const suppressCaption=(estado.vista==='planeta'||(estado.vista==='sistema'&&!!S.xrFocusKey));const text=!suppressCaption&&S.captions&&performance.now()<S.captionUntil?S.caption:'';const capKey=(suppressCaption?'sem-caixa:':'geral:')+text;if(capKey!==S.lastCaption){S.lastCaption=capKey;if(S.xrCaption){release(S.xrCaption);S.xrCaption=null;}if(text){if(estado.vista==='planeta'){const sp=xrPlanetCaption(text);sp.scale.set(1.25,.32,1);sp.position.copy(atAnchor(0,-.62,1.02));scene.add(sp);S.xrCaption=sp;}else{const sp=xrText([text],1024,320);sp.scale.set(.92,.29,1);sp.position.copy(atAnchor(0,-.46,1.12));scene.add(sp);S.xrCaption=sp;}}}
};

// Boucle única com delta-time. A pausa interrompe toda a simulação, inclusive os cometas.
animate=function(){const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-vvLast)/1000));vvLast=now;S.dt=dt;resize();_frames++;const v=estado.playing?estado.vel:0,step=dt*v;S.simTime+=step;
 if(estado.vista==='sistema'||estado.vista==='desafio'){for(const s of sis){s.pivot.rotation.y+=s.revSpeed*step*5.4;s.mesh.rotation.y+=s.spinSpeed*step*1.8;if(s.mesh.userData.luaPivot)s.mesh.userData.luaPivot.rotation.y+=step*2.7;}if(cinturao)cinturao.rotation.y+=step*.14;for(const c of cometas)cometStep(c,step);}
 if(estado.vista==='planeta'&&focoMesh&&!S.manual)focoMesh.mesh.rotation.y+=focoMesh.spin*step*1.8;
 if(estado.vista==='diaNoite'&&terraDia){if(v){S.dayAngle=(S.dayAngle+step)%TAU;terraDia.mesh.rotation.y=S.dayAngle;}updateDayStatus();}
 if(estado.vista==='fases'&&fasesObj){fasesObj.luaPivot.rotation.y+=step*.6;atualizarFase();}
 root.traverse(o=>{if(o.userData.cloud)o.rotation.y+=step*.025;});
 if(starfield)starfield.material.opacity=.88; // ciel fixe : repère de confort en VR.
 if(narrSom&&narrSom.getVolume&&narrSom.getVolume()!==S.voice)narrSom.setVolume(S.voice);if(S.narrAudio&&Math.abs(S.narrAudio.volume-S.voice)>.01)S.narrAudio.volume=S.voice;
 updateDesktopFocus();atualizarLabels();if(estado.vr)atualizarVR();renderer.render(scene,camera);
 const speech=$v('v8Speech');if(speech){const active=S.captions&&S.caption&&now<=S.captionUntil;speech.hidden=!active||estado.vista==='planeta';}if(estado.vista==='planeta')syncPlanetDock();
};
setInterval(()=>{const e=$v('v8Stats');if(e)e.textContent=S.visited.size+' corpos explorados · '+S.activities.size+' atividades';},1200);
window.PortalSolarV8={version:'8.3',state:S,seasons,daylight,setDay,beginMission,checkMission,finishMission,enterView:entrarVista,exportSummary,setupXRActivity,resetStudent};
entrarVista(S.views.includes(estado.vista)?estado.vista:'sistema');renderer.setAnimationLoop(animate);
})();
