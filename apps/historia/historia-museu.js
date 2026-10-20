/* História VR · Museu do Egito (v1.2.0)
   Navegação no átrio e nas quatro alas, sem refazer a cena a cada clique.
   3D: clicar numa ala, num círculo do chão ou no piso leva a câmera até lá; clicar numa peça aproxima dela (voo suave).
   VR: tudo em tamanho real. Teleporte apontando para um círculo ou para o piso e apertando o gatilho;
   analógico para os lados vira 30° (giro em degraus, que enjoa menos); analógico para a frente avança 1,5 m.
   Escolher uma peça pela lista (ou no tour) leva o aluno até a frente dela. Regra 9: sem onclick. */
(function(){'use strict';
function pronto(fn){if(window.HistoriaLab&&window.HistoriaLab.view&&window.HISTORIA_MODELS&&window.THREE)fn();else setTimeout(()=>pronto(fn),40);}
pronto(()=>{
const Lab=window.HistoriaLab,T=window.THREE,M=window.HISTORIA_MODELS,D=window.HISTORIA_DATA,view=Lab.view;
if(!view||!view.ok)return;
const Proto=Object.getPrototypeOf(view),UP=new T.Vector3(0,1,0),MU=M.MU;
const ehMuseu=v=>!!(v.obj&&v.obj.userData.museu&&v.model&&!v.model.userData.disposed);
const dados=v=>v.obj.userData;
M.aoTrocar=()=>{if(view.refreshHits)view.refreshHits();};

/* ---------- onde o aluno fica ---------- */
function alaAtual(){const a=Lab.state.ala;return a>=0&&D.ALAS[a]?a:-1;}
function poseAla(v,i){const u=dados(v);if(i<0||!u.alas[i])return{Q:u.inicio.spot.clone(),th:u.inicio.theta};return{Q:u.alas[i].spot.clone(),th:u.alas[i].theta};}
function posePeca(v,k){const p=dados(v).pecas[k];if(!p)return null;const f=new T.Vector3(Math.sin(p.yaw),0,Math.cos(p.yaw));const d=p.painel?2.6:Math.max(1.25,Math.min(2.4,1.0+p.h*.55));return{Q:p.pos.clone().addScaledVector(f,d).setY(0),th:p.yaw};}
/* v1.4: a peça escolhida vem até o aluno (cópia flutuante); o aluno e a câmera não se movem mais por causa dela */
function poseFoco(v){return poseAla(v,alaAtual());}
function focoDe(){return 'a:'+alaAtual();}
/* piso válido: átrio ou dentro de uma ala (longe das paredes) */
function valido(v,Q){const a=MU.A/2;if((dados(v).obst||[]).some(o=>Math.hypot(Q.x-o.x,Q.z-o.z)<o.r))return false;if(Math.abs(Q.x)<a-.2&&Math.abs(Q.z)<a-.2)return true;return dados(v).alas.some(al=>{const l=Q.clone().sub(al.centro).applyAxisAngle(UP,-al.theta);return Math.abs(l.x)<a-.35&&l.z>-MU.L/2+.35&&l.z<MU.L/2+.3;});}

/* ---------- VR: coloca o prédio em volta do aluno (Q = ponto do museu sob os pés; th = para onde ele olha) ---------- */
function posicionar(v,Q,th){let h;try{h=v.head();}catch(_){return false;}const ry=h.yaw-th;v.root.scale.setScalar(1);v.root.rotation.set(0,ry,0);const q=Q.clone().setY(0).applyAxisAngle(UP,ry);v.root.position.set(h.p.x-q.x,0,h.p.z-q.z);v.root.updateMatrixWorld(true);
 v._museuRoot={p:v.root.position.clone(),ry,cedo:!!v.waitFrames};v._museuXR=true;v.anchor=h;return true;}
function ondeEstou(v){let h;try{h=v.head();}catch(_){return null;}const Q=v.obj.worldToLocal(h.p.clone());Q.y=0;return{Q,th:h.yaw-v.root.rotation.y};}
function irPara(v,pose){if(!pose)return;if(v.xr){posicionar(v,pose.Q,pose.th);if(v.buildXRUI)v.buildXRUI();}}

/* ---------- 3D: câmera ---------- */
/* v1.5 · andar pelo museu: no 3D a câmera fica na altura dos olhos (1,6 m) e o aluno caminha (setas, WASD, botões na tela,
   clique no piso). Tecnicamente é a mesma câmera orbital com distância quase zero: arrastar olha em volta. "Vista de cima" volta ao corte. */
const OLHO=1.6;const pp=v=>!v.xr&&!v._vistaCima;
function alvoCamera(v,foco){const u=dados(v);
 if(pp(v)){const i=foco?Number(foco.slice(2)):alaAtual();const al=u.alas[i];const Q=al?al.spot:u.inicio.spot,th=al?al.theta:u.inicio.theta;return{t:Q.clone().setY(OLHO),az:th,elev:.04,dist:.01};}
 if(foco&&foco.startsWith('p:')){const p=u.pecas[foco.slice(2)];if(p){const d=p.painel?3.4:Math.max(1.9,Math.min(4.4,1.5+p.h*1.35));return{t:p.pos.clone().setY(p.y),az:p.yaw,elev:p.painel?.05:.14,dist:d};}}
 const i=foco?Number(foco.slice(2)):alaAtual();
 if(i>=0&&u.alas[i]){const al=u.alas[i];const t=al.centro.clone().add(new T.Vector3(-Math.sin(al.theta),0,-Math.cos(al.theta)).multiplyScalar(.4));t.y=1.65;return{t,az:al.theta,elev:.12,dist:6.2};}
 return{t:new T.Vector3(0,0,0),az:.62,elev:.92,dist:Math.max(19,22/Math.max(.9,Math.min(1.8,v.stage.clientWidth/Math.max(1,v.stage.clientHeight)))*1.25)};}
function voar(v,c,instante){if(instante||Lab.state.reducedMotion){v.target.copy(c.t);v.az=c.az;v.elev=c.elev;v.dist=c.dist;v._voo=null;v.cameraPosition();return;}
 let d=c.az-v.az;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;const passo=pp(v)?Math.max(.7,Math.min(4,v.target.distanceTo(c.t)/1.8)):.95;v._voo={de:{t:v.target.clone(),az:v.az,elev:v.elev,dist:v.dist},para:{t:c.t.clone(),az:v.az+d,elev:c.elev,dist:c.dist},t0:performance.now(),dur:passo*1000,anda:pp(v)};}

/* ---------- atualizar sem refazer a cena ---------- */
function atualizar(v,novo){const foco=focoDe();
 if(v.xr){if(novo||!v._museuRoot){if(!v._museuRoot||v._museuRoot.cedo)posicionar(v,poseFoco(v).Q,poseFoco(v).th);else Proto.placeXR.call(v);}
  else if((foco!==v._foco||v._forcarFoco)&&!(foco.startsWith('p:')&&v._semTeleporte))irPara(v,poseFoco(v));
  if(v.buildXRUI)v.buildXRUI();}
 else if(novo||foco!==v._foco||v._forcarFoco){voar(v,alvoCamera(v,foco),novo);}
 v._foco=foco;v._semTeleporte=false;v._forcarFoco=false;sincronizarCopia(v);
 const ci=document.getElementById('closeInspect');if(ci){ci.hidden=!Lab.inspectKey;ci.textContent='← Voltar à ala';}
 const sh=document.getElementById('stageHint');if(sh)sh.textContent=Lab.inspectKey?'Arraste a peça para girar · Esc ou Voltar à ala fecha':'Toque numa ala, num círculo do chão ou numa peça · arraste para olhar em volta · roda do mouse aproxima';
 if(v.legend)v.legend();atualizarControles();}

/* ---------- v1.4: a peça vem para a frente do aluno ----------
   Clicou numa peça: uma cópia dela aparece flutuando à frente (0,75 m no óculos, 2,3 m da câmera no 3D), com um fundo
   escuro suave atrás para destacar, girando devagar. No 3D dá para girar arrastando; no óculos, segurar com o grip.
   A ficha (texto e voz) só aparece nesse momento. */
function fecharCopia(v){const c=v._copia;if(!c)return;v._copia=null;const gi=c.userData.giro;if(gi&&gi.parent!==c){for(const [ct,o] of [...v.held])if(o===gi)v.held.delete(ct);if(v.duasMaos&&v.duasMaos.obj===gi)v.duasMaos=null;if(gi.parent)gi.parent.remove(gi);M.dispose(gi);}if(c.parent)c.parent.remove(c);M.dispose(c);if(v.refreshHits)v.refreshHits();}
function posicaoCopia(v){if(v.xr){let h;try{h=v.head();}catch(_){return null;}const p=h.p.clone().addScaledVector(h.f,.75);p.y=h.p.y-.12;return{p,olho:h.p};}
 const cam=v.camera;cam.updateMatrixWorld(true);const o=cam.getWorldPosition(new T.Vector3()),d=cam.getWorldDirection(new T.Vector3());return{p:o.clone().addScaledVector(d,pp(v)?1.7:2.3),olho:o};}
function encaraOlho(v,c,olho){const ol=v.model.worldToLocal(olho.clone());c.rotation.set(0,Math.atan2(ol.x-c.position.x,ol.z-c.position.z),0);}
function abrirCopia(v,key){fecharCopia(v);const g=M.copiaPeca(key);if(!g)return;const pos=posicaoCopia(v);if(!pos)return;
 const c=new T.Group();c.userData={copiaMuseu:true,chave:key,t0:performance.now()};
 g.updateMatrixWorld(true);const b=new T.Box3().setFromObject(g),sz=b.getSize(new T.Vector3()),ce=b.getCenter(new T.Vector3());g.position.sub(ce);
 const giro=new T.Group();giro.userData={rotateCopy:true,pegavel:true};giro.add(g);c.add(giro);c.userData.giro=giro;
 const maior=Math.max(sz.x,sz.y,sz.z,1e-3),alvo=v.xr?.55:1.15,k=alvo/maior;giro.scale.setScalar(k);c.userData.k=k;
 const hit=new T.Mesh(new T.BoxGeometry(sz.x,sz.y,sz.z),new T.MeshBasicMaterial({visible:false}));hit.userData.hit={type:'inspect',key};giro.add(hit);
 const fundo=M.poca(alvo*2.4,alvo*2.4,.0);fundo.material=new T.MeshBasicMaterial({map:fundo.material.map,color:0x000000,transparent:true,opacity:.62,depthWrite:false,toneMapped:false});fundo.position.z=-alvo*.75;fundo.renderOrder=1;c.add(fundo);c.userData.fundo=fundo;
 const luz=M.poca(alvo*1.6,alvo*1.6,.55);luz.position.z=-alvo*.7;luz.renderOrder=2;c.add(luz);
 c.position.copy(v.model.worldToLocal(pos.p.clone()));encaraOlho(v,c,pos.olho);
 v.model.add(c);v._copia=c;if(v.refreshHits)v.refreshHits();}
function sincronizarCopia(v){const k=Lab.inspectKey&&Lab.state.view==='explorar'?Lab.inspectKey:null;if(!k){v._copiaFechada=null;fecharCopia(v);return;}if(v._copiaFechada===k){fecharCopia(v);return;}if(v._copia&&v._copia.userData.chave===k&&v._copia.parent)return;abrirCopia(v,k);}
function animarCopia(v,dt){const c=v._copia;if(!c||!c.parent)return;const t=Math.min(1,(performance.now()-c.userData.t0)/320),e=1-Math.pow(1-t,3);const s=Lab.state.reducedMotion?1:.55+.45*e;c.scale.setScalar(s);
 const gi=c.userData.giro;if(!gi.userData.held&&gi.parent===c&&!(v.drag&&v.drag.group===gi&&v.drag.moved)&&!Lab.state.reducedMotion)gi.rotation.y+=dt*.35;
 if(!v.xr){const pos=posicaoCopia(v);if(pos){c.position.copy(v.model.worldToLocal(pos.p.clone()));const r=c.rotation.y;encaraOlho(v,c,pos.olho);}}}
/* v1.7.2: como no Sistema Solar: clicar de novo na peça (ou na cópia) fecha a cópia e para a voz; ao fim da narração
   a cópia fecha sozinha. A ficha (leitura de fonte) continua aberta na lateral; clicar outra vez traz a cópia e a voz de volta. */
const activateAnt=Proto.activate;
Proto.activate=function(data){if(data&&data.type==='inspect'&&Lab.state.view==='explorar'&&ehMuseu(this)&&Lab.inspectKey===data.key){
  if(this._copia&&this._copia.userData.chave===data.key){this._copiaFechada=data.key;Lab.narrator.stop();fecharCopia(this);if(this.xr&&this.buildXRUI)this.buildXRUI();return;}
  this._copiaFechada=null;}
 return activateAnt.call(this,data);};
{const n=Lab.narrator,notAnt=n.notify;n.notify=function(o){notAnt.call(n,o);if(o&&o.state==='ended'&&o.key&&!n.next&&o.key===Lab.inspectKey&&Lab.state.view==='explorar'){const v=Lab.view,k=o.key;
 setTimeout(()=>{if(v&&Lab.inspectKey===k&&v._copia&&v._copia.userData.chave===k&&!n.busy){v._copiaFechada=k;fecharCopia(v);if(v.xr&&v.buildXRUI)v.buildXRUI();}},1400);}};}
const showAnt=Proto.show;
Proto.show=function(){const S=Lab.state;
 if(S.view==='explorar'&&ehMuseu(this)&&this.lastView==='explorar'&&this._museuXR===this.xr){atualizar(this,false);return;}
 this._copia=null;showAnt.call(this);const ci=document.getElementById('closeInspect');if(ci&&S.view!=='explorar')ci.textContent='← Voltar ao modelo';
 if(S.view==='explorar'&&ehMuseu(this)){this._museuXR=this.xr;if(!this.xr)this._museuRoot=null;atualizar(this,true);}
 if(typeof atualizarControles==='function')atualizarControles();};

const placeAnt=Proto.placeXR;
Proto.placeXR=function(){
 if(Lab.state.view==='explorar'&&this.xr&&ehMuseu(this)){const r=this._museuRoot;
  if(r&&!r.cedo){this.root.scale.setScalar(1);this.root.rotation.set(0,r.ry,0);this.root.position.copy(r.p);this.root.updateMatrixWorld(true);this._museuXR=true;if(!this.anchor){try{this.anchor=this.head();}catch(_){}}return;}
  const p=poseFoco(this);posicionar(this,p.Q,p.th);return;}
 return placeAnt.call(this);};

const centerAnt=Proto.center;
Proto.center=function(){if(Lab.state.view==='explorar'&&ehMuseu(this)){if(this.xr){this._museuRoot=null;irPara(this,poseFoco(this));}else voar(this,alvoCamera(this,focoDe()),false);return;}return centerAnt.call(this);};

const exitAnt=Proto.exitXR;
Proto.exitXR=function(){this._museuRoot=null;this._museuXR=null;return exitAnt.apply(this,arguments);};

/* clique/gatilho no piso: anda até o ponto (3D) ou teleporta (VR) e atualiza a ala da lateral */
Proto.andar=function(ponto){if(!ponto||!ehMuseu(this))return;const Q=this.obj.worldToLocal(ponto.clone());Q.y=0;if(!valido(this,Q))return;
 const nova=dados(this).alaDe(Q);
 if(this.xr){const atual=ondeEstou(this);posicionar(this,Q,atual?atual.th:0);}
 else if(pp(this)){const de=this.target.clone(),dx=Q.x-de.x,dz=Q.z-de.z;const az=Math.hypot(dx,dz)>.05?Math.atan2(-dx,-dz):this.az;voar(this,{t:Q.clone().setY(OLHO),az,elev:Math.max(-.3,Math.min(.3,this.elev)),dist:.01},false);this._foco='a:'+nova;}
 else{this._voo=null;this._forcarFoco=true;}/* na vista de cima, clicar no piso de uma ala abre a vista daquela ala */
 trocarAla(this,nova);};
function trocarAla(v,nova){const S=Lab.state;if(nova===alaAtual()&&!Lab.inspectKey){if(!v.xr&&v._forcarFoco)atualizar(v,false);return;}S.ala=nova;if(v.xr||pp(v))v._foco='a:'+nova;if(Lab.inspectKey)Lab.command('inspect:close');else Lab.refresh();}

/* ---------- VR: giro em degraus, avançar e mira no piso ---------- */
let mira=null;const estado=new WeakMap();
function garantirMira(v){if(mira)return mira;mira=new T.Group();const a=new T.Mesh(new T.RingGeometry(.2,.26,40),new T.MeshBasicMaterial({color:0x7cffb8,transparent:true,opacity:.9,depthWrite:false,toneMapped:false}));a.rotation.x=-Math.PI/2;mira.add(a);const b=new T.Mesh(new T.CircleGeometry(.06,20),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9,depthWrite:false,toneMapped:false}));b.rotation.x=-Math.PI/2;mira.add(b);mira.renderOrder=900;mira.visible=false;v.scene.add(mira);return mira;}
const updAnt=Proto.updateXR;
Proto.updateXR=function(dt){updAnt.call(this,dt);
 const ok=this.xr&&Lab.state.view==='explorar'&&ehMuseu(this);const m=garantirMira(this);m.visible=false;if(!ok)return;
 /* mira: mostra onde o teleporte vai cair */
 for(const ctrl of this.controllers){const ray=this.controllerRay(ctrl);if(ray.intersectObjects(this.uiHits,false)[0])continue;const h=this.hits(ray)[0];const d=h&&h.object.userData.hit;if(d&&(d.type==='chao'||d.type==='ala')){const Q=this.obj.worldToLocal(h.point.clone());Q.y=0;if(d.type==='ala'||valido(this,Q)){m.position.copy(h.point);m.position.y+=.02;m.rotation.y=this.root.rotation.y;m.visible=true;break;}}}
 if(!this.xrSession||this.menuAberto)return;
 for(const src of this.xrSession.inputSources){const gp=src.gamepad;if(!gp)continue;const x=gp.axes[2]||0,y=gp.axes[3]||0;let st=estado.get(src);if(!st){st={};estado.set(src,st);}
  if(src.handedness==='left'){andarVR(this,x,y,dt);continue;}
  if(Math.abs(x)>.7&&!st.giro){st.giro=true;const at=ondeEstou(this);if(at){posicionar(this,at.Q,at.th-Math.sign(x)*Math.PI/6);if(this.buildXRUI)this.buildXRUI();}}else if(Math.abs(x)<.3)st.giro=false;
  if(y<-.7&&!st.frente&&src.handedness!=='left'){st.frente=true;const at=ondeEstou(this);if(at){const Q=at.Q.clone().add(new T.Vector3(-Math.sin(at.th),0,-Math.cos(at.th)).multiplyScalar(1.5));if(valido(this,Q)){posicionar(this,Q,at.th);trocarAla(this,dados(this).alaDe(Q));if(this.buildXRUI)this.buildXRUI();}}}else if(y>-.3)st.frente=false;}};

/* VR: andar com o analógico esquerdo (para onde a cabeça aponta), 1,4 m/s, com vinheta escura nas bordas enquanto anda,
   o que reduz muito o enjoo. Não atravessa paredes. */
let vinheta=null;
function garantirVinheta(v){if(vinheta)return vinheta;const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');const g=x.createRadialGradient(128,128,40,128,128,128);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.55,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,1)');x.fillStyle=g;x.fillRect(0,0,256,256);
 const tx=new T.CanvasTexture(c);vinheta=new T.Mesh(new T.PlaneGeometry(1.1,1.1),new T.MeshBasicMaterial({map:tx,transparent:true,opacity:0,depthTest:false,depthWrite:false,toneMapped:false}));vinheta.renderOrder=9998;vinheta.frustumCulled=false;vinheta.visible=false;v.scene.add(vinheta);return vinheta;}
function andarVR(v,x,y,dt){const vi=garantirVinheta(v);const mag=Math.hypot(x,y);let h;try{h=v.head();}catch(_){return;}
 const cam=v.renderer.xr.getCamera(v.camera);
 if(mag<.18){v._vel=Math.max(0,(v._vel||0)-dt*4);}else{v._vel=Math.min(1,(v._vel||0)+dt*4);
  const f=h.f.clone(),r=new T.Vector3(-f.z,0,f.x);const dir=f.multiplyScalar(-y).add(r.multiplyScalar(x));if(dir.lengthSq()>1)dir.normalize();
  const delta=dir.multiplyScalar(1.4*dt*Math.min(1,mag));const Q=v.obj.worldToLocal(h.p.clone().add(delta));Q.y=0;
  const tenta=d=>{const q=v.obj.worldToLocal(h.p.clone().add(d));q.y=0;return valido(v,q)?d:null;};
  const ok=tenta(delta)||tenta(new T.Vector3(delta.x,0,0))||tenta(new T.Vector3(0,0,delta.z));
  if(ok){v.root.position.sub(ok);v.root.updateMatrixWorld(true);if(v._museuRoot)v._museuRoot.p.copy(v.root.position);const at=ondeEstou(v);if(at){const na=dados(v).alaDe(at.Q);if(na!==alaAtual())trocarAla(v,na);}}}
 const op=.8*(v._vel||0);vi.material.opacity=op;vi.visible=op>.02;if(vi.visible){cam.getWorldPosition(vi.position);const q=cam.getWorldQuaternion(new T.Quaternion());vi.quaternion.copy(q);vi.position.add(new T.Vector3(0,0,-.32).applyQuaternion(q));}}

/* 3D: teclado e botões na tela */
const teclas=new Set();
const digitando=()=>{const a=document.activeElement;return a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);};
const MAPA={ArrowUp:'f',KeyW:'f',ArrowDown:'t',KeyS:'t',ArrowLeft:'ge',ArrowRight:'gd',KeyA:'e',KeyD:'d'};
window.addEventListener('keydown',e=>{if(Lab.state.view!=='explorar'||!ehMuseu(view)||!pp(view)||digitando())return;const k=MAPA[e.code];if(!k)return;teclas.add(k);view._voo=null;e.preventDefault();e.stopPropagation();},true);
window.addEventListener('keyup',e=>{const k=MAPA[e.code];if(k)teclas.delete(k);},true);
window.addEventListener('blur',()=>teclas.clear());
window.addEventListener('wheel',e=>{if(Lab.state.view!=='explorar'||!ehMuseu(view)||!pp(view)||view.xr)return;if(!view.canvas.contains(e.target)&&e.target!==view.canvas)return;e.preventDefault();e.stopPropagation();view._voo=null;passo3D(view,-Math.sign(e.deltaY)*.45,0);},{capture:true,passive:false});
function passo3D(v,frente,lado){const az=v.az;const f=new T.Vector3(-Math.sin(az),0,-Math.cos(az)),r=new T.Vector3(-f.z,0,f.x);const d=f.multiplyScalar(frente).add(r.multiplyScalar(lado));
 const tenta=dd=>{const q=v.target.clone().add(dd);q.y=0;return valido(v,q)?dd:null;};const ok=tenta(d)||tenta(new T.Vector3(d.x,0,0))||tenta(new T.Vector3(0,0,d.z));
 if(ok){v.target.add(ok);v.target.y=OLHO;v.cameraPosition();const q=v.target.clone();q.y=0;const na=dados(v).alaDe(q);if(na!==alaAtual())trocarAla(v,na);return true;}return false;}
function mover3D(v,dt){if(!teclas.size||!pp(v)||v.xr)return;const vel=1.6*dt;let fr=0,la=0;if(teclas.has('f'))fr+=vel;if(teclas.has('t'))fr-=vel;if(teclas.has('e'))la-=vel;if(teclas.has('d'))la+=vel;
 if(teclas.has('ge'))v.az+=dt*1.6;if(teclas.has('gd'))v.az-=dt*1.6;if(fr||la){passo3D(v,fr,la);v._passo=(v._passo||0)+dt*9;}else v.cameraPosition();}
/* controles na tela (lousa, Chromebook com toque): segurar o botão anda; Regra 9, sem onclick */
function montarControles(){if(document.getElementById('museuAndar'))return;const st=document.getElementById('stage');if(!st)return;
 const css=document.createElement('style');css.textContent='#museuAndar{position:absolute;left:14px;bottom:64px;z-index:6;display:grid;grid-template-columns:repeat(3,44px);grid-template-rows:repeat(2,44px);gap:6px}#museuAndar[hidden]{display:none}#museuAndar button{border:1px solid rgba(255,255,255,.25);background:rgba(8,22,34,.78);color:#fff;border-radius:10px;font-size:18px;cursor:pointer;touch-action:none;user-select:none}#museuAndar button:active{background:#1a6b2a}#museuAndar .vista{grid-column:1/4;font-size:12.5px;font-weight:600}@media (max-width:800px){#museuAndar{bottom:70px}}';document.head.appendChild(css);
 const b=document.createElement('div');b.id='museuAndar';b.setAttribute('aria-label','Andar pelo museu');b.innerHTML='<button data-mover="ge" aria-label="Virar à esquerda">↶</button><button data-mover="f" aria-label="Andar para a frente">▲</button><button data-mover="gd" aria-label="Virar à direita">↷</button><button data-mover="e" aria-label="Passo para a esquerda">◀</button><button data-mover="t" aria-label="Andar para trás">▼</button><button data-mover="d" aria-label="Passo para a direita">▶</button><button class="vista" data-mover="vista">Vista de cima</button>';st.appendChild(b);
 const solta=()=>{['f','t','e','d','ge','gd'].forEach(k=>teclas.delete(k));};
 b.addEventListener('pointerdown',e=>{const bt=e.target.closest('[data-mover]');if(!bt)return;e.preventDefault();const k=bt.dataset.mover;if(k==='vista'){view._vistaCima=!view._vistaCima;bt.textContent=view._vistaCima?'Andar pelo museu':'Vista de cima';view._voo=null;voar(view,alvoCamera(view,focoDe()),false);atualizarControles();return;}view._voo=null;teclas.add(k);try{bt.setPointerCapture(e.pointerId);}catch(_){}});
 ['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,solta));}
function atualizarControles(){const b=document.getElementById('museuAndar');if(!b)return;b.hidden=!(Lab.state.view==='explorar'&&!view.xr);b.querySelectorAll('[data-mover]:not(.vista)').forEach(x=>{x.style.visibility=view._vistaCima?'hidden':'visible';});}

/* luz geral mais baixa no museu: as peças se destacam com as manchas de luz */
const luzAnt=Proto.luzes;Proto.luzes=function(k){return luzAnt.call(this,(Lab.state.view==='explorar'&&ehMuseu(this))?k*.82:k);};
/* ---------- 3D: voo da câmera ---------- */
const frameAnt=Proto.frame;
Proto.frame=function(time,frame){const vo=this._voo;
 if(vo&&!this.xr){const k=Math.min(1,(performance.now()-vo.t0)/vo.dur),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;this.target.lerpVectors(vo.de.t,vo.para.t,e);this.az=vo.de.az+(vo.para.az-vo.de.az)*e;this.elev=vo.de.elev+(vo.para.elev-vo.de.elev)*e;this.dist=vo.de.dist+(vo.para.dist-vo.de.dist)*e;this.cameraPosition();if(k>=1)this._voo=null;}
 {const ag=performance.now(),dt=Math.min(.05,(ag-(this._tm||ag))/1000);this._tm=ag;if(Lab.state.view==='explorar'&&ehMuseu(this)){mover3D(this,dt);if(vo&&vo.anda&&!this.xr)this._passo=(this._passo||0)+dt*9;}if(this._copia&&Lab.state.view==='explorar')animarCopia(this,dt);}
 return frameAnt.call(this,time,frame);};
view.canvas.addEventListener('pointerdown',()=>{view._voo=null;});
const camAnt=Proto.cameraPosition;Proto.cameraPosition=function(){if(!this.xr){const fov=(Lab.state.view==='explorar'&&pp(this)&&ehMuseu(this))?68:44;if(this.camera.fov!==fov){this.camera.fov=fov;this.camera.updateProjectionMatrix();}}camAnt.call(this);if(this.xr||Lab.state.view!=='explorar'||!pp(this)||!ehMuseu(this))return;const b=Lab.state.reducedMotion?0:Math.sin(this._passo||0)*.022;if(b){this.camera.position.y+=b;this.camera.updateMatrixWorld(true);}};
montarControles();
view._andarVR=(x,y,dt)=>andarVR(view,x,y,dt);/* usado nos testes */

/* a primeira montagem pode ter acontecido antes deste arquivo: refaz para entrar no modo museu */
if(Lab.state.view==='explorar'&&ehMuseu(view)){view._museuXR=view.xr;atualizar(view,true);}
});
})();
