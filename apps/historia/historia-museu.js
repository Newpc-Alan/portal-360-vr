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
function poseFoco(v){const k=Lab.inspectKey;return(k&&posePeca(v,k))||poseAla(v,alaAtual());}
function focoDe(){const k=Lab.inspectKey;if(k&&view.obj&&dados(view).pecas[k])return 'p:'+k;return 'a:'+alaAtual();}
/* piso válido: átrio ou dentro de uma ala (longe das paredes) */
function valido(v,Q){const a=MU.A/2;if(Math.abs(Q.x)<a-.2&&Math.abs(Q.z)<a-.2)return true;return dados(v).alas.some(al=>{const l=Q.clone().sub(al.centro).applyAxisAngle(UP,-al.theta);return Math.abs(l.x)<a-.35&&l.z>-MU.L/2+.35&&l.z<MU.L/2+.3;});}

/* ---------- VR: coloca o prédio em volta do aluno (Q = ponto do museu sob os pés; th = para onde ele olha) ---------- */
function posicionar(v,Q,th){let h;try{h=v.head();}catch(_){return false;}const ry=h.yaw-th;v.root.scale.setScalar(1);v.root.rotation.set(0,ry,0);const q=Q.clone().setY(0).applyAxisAngle(UP,ry);v.root.position.set(h.p.x-q.x,0,h.p.z-q.z);v.root.updateMatrixWorld(true);
 v._museuRoot={p:v.root.position.clone(),ry,cedo:!!v.waitFrames};v._museuXR=true;v.anchor=h;return true;}
function ondeEstou(v){let h;try{h=v.head();}catch(_){return null;}const Q=v.obj.worldToLocal(h.p.clone());Q.y=0;return{Q,th:h.yaw-v.root.rotation.y};}
function irPara(v,pose){if(!pose)return;if(v.xr){posicionar(v,pose.Q,pose.th);if(v.buildXRUI)v.buildXRUI();}}

/* ---------- 3D: câmera ---------- */
function alvoCamera(v,foco){const u=dados(v);
 if(foco&&foco.startsWith('p:')){const p=u.pecas[foco.slice(2)];if(p){const d=p.painel?3.4:Math.max(1.9,Math.min(4.4,1.5+p.h*1.35));return{t:p.pos.clone().setY(p.y),az:p.yaw,elev:p.painel?.05:.14,dist:d};}}
 const i=foco?Number(foco.slice(2)):alaAtual();
 if(i>=0&&u.alas[i]){const al=u.alas[i];const t=al.centro.clone().add(new T.Vector3(-Math.sin(al.theta),0,-Math.cos(al.theta)).multiplyScalar(.4));t.y=1.65;return{t,az:al.theta,elev:.12,dist:6.2};}
 return{t:new T.Vector3(0,0,0),az:.62,elev:.92,dist:Math.max(19,22/Math.max(.9,Math.min(1.8,v.stage.clientWidth/Math.max(1,v.stage.clientHeight)))*1.25)};}
function voar(v,c,instante){if(instante||Lab.state.reducedMotion){v.target.copy(c.t);v.az=c.az;v.elev=c.elev;v.dist=c.dist;v._voo=null;v.cameraPosition();return;}
 let d=c.az-v.az;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;v._voo={de:{t:v.target.clone(),az:v.az,elev:v.elev,dist:v.dist},para:{t:c.t.clone(),az:v.az+d,elev:c.elev,dist:c.dist},t0:performance.now(),dur:950};}

/* ---------- atualizar sem refazer a cena ---------- */
function atualizar(v,novo){const foco=focoDe();
 if(v.xr){if(novo||!v._museuRoot){if(!v._museuRoot||v._museuRoot.cedo)posicionar(v,poseFoco(v).Q,poseFoco(v).th);else Proto.placeXR.call(v);}
  else if((foco!==v._foco||v._forcarFoco)&&!(foco.startsWith('p:')&&v._semTeleporte))irPara(v,poseFoco(v));
  if(v.buildXRUI)v.buildXRUI();}
 else if(novo||foco!==v._foco||v._forcarFoco){voar(v,alvoCamera(v,foco),novo);}
 v._foco=foco;v._semTeleporte=false;v._forcarFoco=false;
 const ci=document.getElementById('closeInspect');if(ci){ci.hidden=!Lab.inspectKey;ci.textContent='← Voltar à ala';}
 const sh=document.getElementById('stageHint');if(sh)sh.textContent=Lab.inspectKey?'Arraste para olhar a peça de vários lados · Fechar ficha volta para a ala':'Toque numa ala, num círculo do chão ou numa peça · arraste para olhar em volta · roda do mouse aproxima';
 if(v.legend)v.legend();}

const showAnt=Proto.show;
Proto.show=function(){const S=Lab.state;
 if(S.view==='explorar'&&ehMuseu(this)&&this.lastView==='explorar'&&this._museuXR===this.xr){atualizar(this,false);return;}
 showAnt.call(this);const ci=document.getElementById('closeInspect');if(ci&&S.view!=='explorar')ci.textContent='← Voltar ao modelo';
 if(S.view==='explorar'&&ehMuseu(this)){this._museuXR=this.xr;if(!this.xr)this._museuRoot=null;atualizar(this,true);}};

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
 else{this._voo=null;this._forcarFoco=true;}/* no 3D, clicar no piso de uma ala abre a vista daquela ala; no átrio, a vista geral */
 trocarAla(this,nova);};
function trocarAla(v,nova){const S=Lab.state;if(nova===alaAtual()&&!Lab.inspectKey){if(!v.xr&&v._forcarFoco)atualizar(v,false);return;}S.ala=nova;if(v.xr)v._foco='a:'+nova;if(Lab.inspectKey)Lab.command('inspect:close');else Lab.refresh();}

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
  if(Math.abs(x)>.7&&!st.giro){st.giro=true;const at=ondeEstou(this);if(at){posicionar(this,at.Q,at.th-Math.sign(x)*Math.PI/6);if(this.buildXRUI)this.buildXRUI();}}else if(Math.abs(x)<.3)st.giro=false;
  if(y<-.7&&!st.frente&&src.handedness!=='left'){st.frente=true;const at=ondeEstou(this);if(at){const Q=at.Q.clone().add(new T.Vector3(-Math.sin(at.th),0,-Math.cos(at.th)).multiplyScalar(1.5));if(valido(this,Q)){posicionar(this,Q,at.th);trocarAla(this,dados(this).alaDe(Q));if(this.buildXRUI)this.buildXRUI();}}}else if(y>-.3)st.frente=false;}};

/* ---------- 3D: voo da câmera ---------- */
const frameAnt=Proto.frame;
Proto.frame=function(time,frame){const vo=this._voo;
 if(vo&&!this.xr){const k=Math.min(1,(performance.now()-vo.t0)/vo.dur),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;this.target.lerpVectors(vo.de.t,vo.para.t,e);this.az=vo.de.az+(vo.para.az-vo.de.az)*e;this.elev=vo.de.elev+(vo.para.elev-vo.de.elev)*e;this.dist=vo.de.dist+(vo.para.dist-vo.de.dist)*e;this.cameraPosition();if(k>=1)this._voo=null;}
 return frameAnt.call(this,time,frame);};
view.canvas.addEventListener('pointerdown',()=>{view._voo=null;});

/* a primeira montagem pode ter acontecido antes deste arquivo: refaz para entrar no modo museu */
if(Lab.state.view==='explorar'&&ehMuseu(view)){view._museuXR=view.xr;atualizar(view,true);}
});
})();
