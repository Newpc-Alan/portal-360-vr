/* Corpo Humano Imersivo · camada Portal 360º VR (v2.0, derivada do DNA v2.2)
   Integra o laboratório ao catálogo do Portal do Educador sem reescrever o dna-app.js:
   1. Contrato do catálogo: alternarVR(), irCatalogo(), ?embed=1, ?quiosque=0, ?vr=1 (tela de entrada).
   2. Modo VR no padrão do Sistema Solar: painel maior e nítido (mipmaps), botões maiores,
      acerto em verde / erro em vermelho no Desafio, gatilho no vazio interrompe a narração.
   3. Narração posicional: a voz sai da molécula (THREE.PositionalAudio) quando o áudio do
      navegador está liberado; caso contrário continua pelo player comum, sem perder som.
   Regra 9: nenhum onclick inline; tudo por data-action + delegação. */
(function(){'use strict';
const q=new URLSearchParams(location.search);
const EMBED=q.get('embed')==='1';
const QUIOSQUE=q.get('quiosque')!=='0';
if(EMBED)document.body.classList.add('embed');
if(!QUIOSQUE)document.body.classList.add('sem-quiosque');

function pronto(fn){if(window.CorpoLab&&window.CorpoLab.view)fn();else setTimeout(()=>pronto(fn),40);}

pronto(function(){
const Lab=window.CorpoLab,T=window.THREE,D=window.CORPO_DATA,M=window.CORPO_MODELS;
const view=Lab.view,narrator=Lab.narrator;
const Proto=Object.getPrototypeOf(view);

/* ---------- 1. Contrato do catálogo ---------- */
window.alternarVR=function(){try{return Promise.resolve(view.toggleVR());}catch(e){return Promise.reject(e);}};
window.irCatalogo=function(){Lab.command('catalog');};
window.PortalCorpo={versao:'2.0.0',get emVR(){return !!view.xr;}};

/* ---------- 2. Tela de entrada (?vr=1) ---------- */
function mensagem(txt){const f=document.getElementById('feedback');if(!f)return;f.hidden=false;f.className='feedback warning';f.textContent=txt;}
if(q.get('vr')==='1'){
  const semVR=()=>mensagem('Para a experiência em VR, abra este mesmo link no navegador do óculos (Meta Quest). Aqui você pode explorar em 3D normalmente.');
  const mostrarEntrada=()=>{
    const ov=document.createElement('div');ov.id='vrGate';
    ov.innerHTML='<div class="vrgate-box"><img src="assets/logo.png" alt=""><div class="vrgate-t">Corpo Humano Imersivo</div><div class="vrgate-s">Coloque o óculos e toque para começar</div><button type="button" data-action="vr-entrar">🥽 Entrar em VR</button><button type="button" class="sec" data-action="vr-3d">Explorar em 3D</button></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;
      if(b.dataset.action==='vr-entrar'){window.alternarVR().finally(()=>ov.remove());}else ov.remove();});
  };
  if(!window.isSecureContext||!navigator.xr)semVR();
  else navigator.xr.isSessionSupported('immersive-vr').then(ok=>ok?mostrarEntrada():semVR()).catch(semVR);
}

/* ---------- 3. Interface VR: nítida, maior e com feedback de cor ---------- */
const UI={z:-1.62,btnW:.46,btnH:.115,passo:.15};
function texturaCanvas(c){const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;tex.minFilter=T.LinearMipmapLinearFilter;tex.magFilter=T.LinearFilter;tex.generateMipmaps=true;try{tex.anisotropy=view.renderer.capabilities.getMaxAnisotropy();}catch(e){tex.anisotropy=8;}return tex;}
function quebrar(ctx,text,maxW){const out=[];let line='';for(const w of String(text).split(/\s+/)){const n=(line?line+' ':'')+w;if(ctx.measureText(n).width>maxW&&line){out.push(line);line=w;}else line=n;}if(line)out.push(line);return out;}

Proto.textPlane=function(title,body,w,h,tom){
  w=w||1.06;h=h||.86;
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;const c=canvas.getContext('2d');
  const cores={ok:['rgba(10,46,34,.97)','#3fd48a'],erro:['rgba(60,16,22,.97)','#ff6b6b'],neutro:['rgba(10,31,46,.97)','#4c8294']}[tom||'neutro'];
  c.fillStyle=cores[0];c.fillRect(0,0,1024,1024);c.strokeStyle=cores[1];c.lineWidth=8;c.strokeRect(4,4,1016,1016);
  const grande=!!(tom&&tom!=='neutro')||(Lab.state.view==='desafio');
  let y=100;
  c.font='600 70px Segoe UI,Arial';c.fillStyle='#a4e6d1';
  for(const l of quebrar(c,title,930)){c.fillText(l,52,y);y+=86;}
  y+=24;const fb=grande?64:56;c.font='400 '+fb+'px Segoe UI,Arial';c.fillStyle='#e6f3fb';
  for(const l of quebrar(c,body,930)){if(y>990)break;c.fillText(l,52,y);y+=fb*1.32;}
  const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texturaCanvas(canvas),transparent:true,side:T.DoubleSide,depthWrite:false}));
  return m;
};

Proto.xrButton=function(label,cmd,x,y,w,disabled,cor){
  w=w||UI.btnW;
  const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');
  const paleta=cor||(disabled?{bg:'#172c3b',borda:'#314756',texto:'#6b8190'}:{bg:'#144957',borda:'#6098a7',texto:'#ebfbff'});
  g.fillStyle=paleta.bg;g.fillRect(0,0,1024,256);g.strokeStyle=paleta.borda;g.lineWidth=10;g.strokeRect(5,5,1014,246);
  let size=72;g.font='600 '+size+'px Segoe UI,Arial';while(g.measureText(label).width>940&&size>26){size-=3;g.font='600 '+size+'px Segoe UI,Arial';}
  g.textAlign='center';g.textBaseline='middle';g.fillStyle=paleta.texto;g.fillText(label,512,130);
  const m=new T.Mesh(new T.PlaneGeometry(w,UI.btnH),new T.MeshBasicMaterial({map:texturaCanvas(c),side:T.DoubleSide}));
  m.position.set(x,y,UI.z);m.rotation.y=-Math.atan2(x,-UI.z);m.userData.command=cmd;this.ui.add(m);if(!disabled)this.uiHits.push(m);return m;
};

Proto.xrBotaoLargo=function(label,cmd,x,y,disabled,cor){
  const w=1.08,h=.2;const c=document.createElement('canvas');c.width=2048;c.height=384;const g=c.getContext('2d');
  const paleta=cor||(disabled?{bg:'#172c3b',borda:'#314756',texto:'#6b8190'}:{bg:'#144957',borda:'#6098a7',texto:'#ebfbff'});
  g.fillStyle=paleta.bg;g.fillRect(0,0,2048,384);g.strokeStyle=paleta.borda;g.lineWidth=12;g.strokeRect(6,6,2036,372);
  let size=100;g.font='600 '+size+'px Segoe UI,Arial';let linhas=quebrar(g,label,1900);
  while(linhas.length>2&&size>56){size-=6;g.font='600 '+size+'px Segoe UI,Arial';linhas=quebrar(g,label,1900);}
  g.textAlign='center';g.textBaseline='middle';g.fillStyle=paleta.texto;
  const passo=size*1.15,y0=192-(linhas.length-1)*passo/2;linhas.forEach((l,i)=>g.fillText(l,1024,y0+i*passo));
  const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texturaCanvas(c),side:T.DoubleSide}));
  m.position.set(x,y,UI.z);m.rotation.y=-Math.atan2(x,-UI.z);m.userData.command=cmd;this.ui.add(m);if(!disabled)this.uiHits.push(m);return m;
};
const VERDE={bg:'#0f6b3a',borda:'#3fd48a',texto:'#ffffff'},VERMELHO={bg:'#7a1f28',borda:'#ff6b6b',texto:'#ffffff'},APAGADO={bg:'#122531',borda:'#243a47',texto:'#5c7484'};
function estadoDesafio(){const S=Lab.state;if(S.view!=='desafio'||S.quiz.phase!==1||S.quiz.done)return null;const i=S.quiz.index,resp=S.quiz.answers[i];if(resp===undefined)return null;const item=D.questions[i];return{correto:item.correct,escolha:resp,acertou:resp===item.correct};}

Proto.buildXRUI=function(){
  if(!this.xr)return;this.clearXRUI();
  if(this.anchor){this.ui.position.copy(this.anchor.p);this.ui.rotation.y=this.anchor.yaw;}
  const S=Lab.state,lesson=document.getElementById('lessonPanel');
  let title=(lesson.querySelector('h2')||{}).textContent||'Corpo Humano';
  const instrucao=document.getElementById('captionText').textContent||'';
  const fbEl=document.getElementById('feedback');const feedback=fbEl&&!fbEl.hidden?fbEl.textContent:'';
  let body=instrucao+(feedback?'  '+feedback:''),tom='neutro';
  const des=estadoDesafio();
  if(des){title=des.acertou?'✅ ACERTOU!':'❌ ERROU';tom=des.acertou?'ok':'erro';body=D.questions[S.quiz.index].why;}
  if(this.xrReport){const r=Lab.report();title='Resumo da experiência';body=S.completed.length+' atividades concluídas. '+r.independent+' respostas independentes. '+r.errors+' tentativas incorretas. '+r.hints+' pistas consultadas. '+r.skips+' posições puladas. Exporte os registros no modo 3D.';tom='neutro';}
  const panel=this.textPlane(title,body,1.06,.86,tom);panel.position.set(1.16,.30,-1.64);panel.rotation.y=-.6;this.ui.add(panel);
  const lista=this.xrReport?[{label:'Voltar à atividade',cmd:'xr:reportclose'}]:this._acoes();
  const max=8,pages=Math.max(1,Math.ceil(lista.length/max));this.uiPage=Math.min(this.uiPage||0,pages-1);
  const quizFase=(S.view==='desafio'&&S.quiz.phase===1&&!this.xrReport);
  if(quizFase){
    panel.position.set(1.16,.52,-1.64);
    let yy=-.06;lista.forEach(a=>{let cor=null;const m=/^quiz:answer:(\d+)$/.exec(a.cmd);
      if(des&&m){const k=Number(m[1]);cor=k===des.correto?VERDE:k===des.escolha?VERMELHO:APAGADO;}
      if(/^quiz:next$/.test(a.cmd))cor=cor||{bg:'#0f6b3a',borda:'#7CFFB8',texto:'#ffffff'};
      this.xrBotaoLargo(a.label,a.cmd,1.16,yy,a.disabled,cor);yy-=.22;});
  }else
  lista.slice(this.uiPage*max,(this.uiPage+1)*max).forEach((a,i)=>{
    let cor=null;const m=/^quiz:answer:(\d+)$/.exec(a.cmd);
    if(des&&m){const k=Number(m[1]);cor=k===des.correto?VERDE:k===des.escolha?VERMELHO:APAGADO;}
    this.xrButton(a.label,a.cmd,1.16+(i%2?.25:-.25),-.22-Math.floor(i/2)*UI.passo,UI.btnW,a.disabled,cor);
  });
  if(pages>1&&!quizFase){this.xrButton('◀ Opções','xr:prev',.91,-.86,UI.btnW,this.uiPage===0);this.xrButton('Mais opções ▶','xr:next',1.41,-.86,UI.btnW,this.uiPage===pages-1);}
  D.activities.forEach((a,i)=>this.xrButton((i+1)+'. '+a.label,'view:'+a.id,-1.18,.6-i*UI.passo,.5));
  const yb=.6-D.activities.length*UI.passo-.04;
  this.xrButton('🥽 Sair do VR','vr',-1.18,yb,.5,false,{bg:'#5a2a16',borda:'#ff9f6b',texto:'#fff2ea'});
  this.xrButton('↙ Catálogo','catalog',-1.18,yb-UI.passo,.5,false,{bg:'#0f2c4a',borda:'#37B1DA',texto:'#ffffff'});
  this.xrButton('◎ Centralizar','center',-.52,-.95,UI.btnW);this.xrButton(S.autoRotate?'Ⅱ Pausar':'▷ Girar','rotate',-.02,-.95,UI.btnW);
  this.xrButton('🔊 Ouvir','voice:repeat',-.52,-1.1,UI.btnW);this.xrButton('■ Parar voz','voice:stop',-.02,-1.1,UI.btnW);
};
/* lista de ações da lateral (o dna-app monta os botões com data-act; lemos de lá para não depender de variáveis internas) */
Proto._acoes=function(){const out=[];document.querySelectorAll('#lessonPanel [data-act]').forEach(b=>{if(/^seq:target:/.test(b.dataset.act))return;if(b.closest('details')&&!b.closest('details').open)return;const label=(b.title&&b.textContent.trim().length<=1?b.textContent.trim()+' · '+b.title:b.textContent.trim());out.push({label,cmd:b.dataset.act,disabled:b.disabled});});return out;};

/* gatilho no vazio: para a narração (mesmo comportamento do Sistema Solar) */
const xrSelectOriginal=Proto.xrSelect;
Proto.xrSelect=function(ctrl){
  if(this.held.has(ctrl))return xrSelectOriginal.call(this,ctrl);
  const ray=this.controllerRay(ctrl);
  const ui=ray.intersectObjects(this.uiHits,false)[0];
  this.root.updateMatrixWorld(true);
  const hit=ui?null:this.hits(ray)[0];
  if(!ui&&!hit){narrator.stop();return;}
  return xrSelectOriginal.call(this,ctrl);
};

/* ---------- 4. Narração posicional ---------- */
let posicional=null,ligado=false;
function ligarPosicional(){
  if(ligado||!T.AudioListener)return;
  try{
    const ctx=T.AudioContext.getContext();
    if(ctx.state!=='running'){ctx.resume().catch(()=>{});return;}
    const listener=new T.AudioListener();view.camera.add(listener);
    posicional=new T.PositionalAudio(listener);posicional.setMediaElementSource(narrator.player);
    posicional.setRefDistance(view.xr?1.2:14);posicional.setRolloffFactor(.6);posicional.setDistanceModel('inverse');
    view.root.add(posicional);ligado=true;
  }catch(e){/* mantém o player comum */}
}
['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,ligarPosicional,{passive:true}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ligado){try{T.AudioContext.getContext().resume();}catch(e){}}});
const toggleOriginal=Proto.toggleVR;
Proto.toggleVR=async function(){const r=await toggleOriginal.call(this);ligarPosicional();if(posicional)posicional.setRefDistance(this.xr?1.2:14);if(this.xr&&typeof entrarAmbiente==='function')entrarAmbiente();return r;};
const exitOriginal=Proto.exitXR;
Proto.exitXR=function(){exitOriginal.call(this);if(posicional)posicional.setRefDistance(14);};

/* ---------- 5. Ambiente VR com profundidade + trilha de fundo ---------- */
let ambiente=null,musicaAntes=null;
function criarAmbiente(modo2d){
  const g=new T.Group();g.name='ambienteVR';g.userData.modo2d=!!modo2d;const E=modo2d?1.9:1,CY=modo2d?-3.6:0;/* no 3D o chão fica abaixo do modelo e os anéis crescem */
  // abóbada em gradiente (azul-profundo do Portal → quase preto no zênite e no chão)
  const c=document.createElement('canvas');c.width=16;c.height=512;const x=c.getContext('2d');
  const gr=x.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#03070f');gr.addColorStop(.42,'#0b2340');gr.addColorStop(.58,'#0f2c4a');gr.addColorStop(.72,'#071526');gr.addColorStop(1,'#02050a');
  x.fillStyle=gr;x.fillRect(0,0,16,512);
  const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;
  const domo=new T.Mesh(new T.SphereGeometry(45,48,32),new T.MeshBasicMaterial({map:tex,side:T.BackSide,depthWrite:false}));
  domo.position.y=1.2;g.add(domo);
  // partículas "meio celular": duas camadas, próxima e distante
  const mkPontos=(n,raio,tam,cor,op)=>{const pos=new Float32Array(n*3);for(let i=0;i<n;i++){const r=raio*(0.35+0.65*Math.cbrt(Math.random())),th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1);pos[i*3]=r*Math.sin(ph)*Math.cos(th);pos[i*3+1]=1.4+r*Math.cos(ph)*0.55;pos[i*3+2]=r*Math.sin(ph)*Math.sin(th);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));
    const sp=document.createElement('canvas');sp.width=sp.height=64;const q=sp.getContext('2d');const rg=q.createRadialGradient(32,32,0,32,32,32);rg.addColorStop(0,'rgba(255,255,255,1)');rg.addColorStop(.35,'rgba(170,230,255,.55)');rg.addColorStop(1,'rgba(120,200,255,0)');q.fillStyle=rg;q.fillRect(0,0,64,64);
    const m=new T.PointsMaterial({size:tam,map:new T.CanvasTexture(sp),color:cor,transparent:true,opacity:op,depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true});
    const pts=new T.Points(geo,m);pts.userData.vel=0.02+Math.random()*0.02;return pts;};
  g.add(mkPontos(420,14,.09,0x7fd6ff,.55),mkPontos(180,6,.05,0xa6f0d6,.7));
  // chão: disco escuro + anéis finos para referência de posição (altura do piso real, local-floor)
  const chao=new T.Mesh(new T.CircleGeometry(9,64),new T.MeshBasicMaterial({color:0x02070e,transparent:true,opacity:.92,depthWrite:false}));chao.rotation.x=-Math.PI/2;chao.position.y=CY+0.005;chao.scale.setScalar(E);g.add(chao);g.userData.piso=[[chao,0.005]];
  for(const r of [1,2.2,3.6,5.2]){const an=new T.Mesh(new T.RingGeometry(r-.012,r+.012,96),new T.MeshBasicMaterial({color:0x37b1da,transparent:true,opacity:r===1?.32:.12,side:T.DoubleSide,depthWrite:false}));an.rotation.x=-Math.PI/2;an.position.y=CY+0.01;an.scale.setScalar(E);g.add(an);g.userData.piso.push([an,0.01]);}
  const fog=new T.Mesh(new T.CircleGeometry(9,64),new T.MeshBasicMaterial({color:0x0f2c4a,transparent:true,opacity:.08,depthWrite:false,blending:T.AdditiveBlending}));fog.rotation.x=-Math.PI/2;fog.position.y=CY+0.02;fog.scale.setScalar(E);g.add(fog);g.userData.piso.push([fog,0.02]);
  return g;
}
function entrarAmbiente(modo2d){if(ambiente&&ambiente.userData.modo2d===!!modo2d)return;if(ambiente){M.dispose(ambiente);view.scene.remove(ambiente);ambiente=null;}ambiente=criarAmbiente(modo2d);view.scene.add(ambiente);
  if(modo2d)return;
  musicaAntes=narrator.musicOn;if(!narrator.musicOn){const vol=Math.max(.12,narrator.musicVolume||.2);narrator.setMusic(true,vol);const cb=document.getElementById('musicEnabled');if(cb)cb.checked=true;}}
/* no 3D a trilha também toca, mas só depois do primeiro toque (política de autoplay); respeita o checkbox de Ajustes */
let musica2dArmada=false;
function armarMusica2d(){if(musica2dArmada)return;musica2dArmada=true;const cb=document.getElementById('musicEnabled');if(cb&&!cb.checked&&!narrator.musicOn){cb.checked=true;}
  const ligar=()=>{if(view.xr)return;const c=document.getElementById('musicEnabled');if(c&&c.checked&&!narrator.musicOn)narrator.setMusic(true,Math.max(.12,narrator.musicVolume||.2));};
  ['pointerdown','keydown'].forEach(ev=>window.addEventListener(ev,ligar,{once:true,capture:true}));}
function sairAmbiente(){if(ambiente){M.dispose(ambiente);view.scene.remove(ambiente);ambiente=null;}
  musicaAntes=null;entrarAmbiente(true);}
const frameOriginal=Proto.frame;
Proto.frame=function(time,frame){
  if(this.xr){if(!ambiente||ambiente.userData.modo2d)entrarAmbiente(false);}else{if(!ambiente)entrarAmbiente(true);armarMusica2d();
    /* no 3D o piso acompanha a base do modelo (corpo inteiro nunca fica com os pés abaixo do chão) */
    ambiente.userData.n=(ambiente.userData.n||0)+1;if(ambiente.userData.n%15===1&&this.model){const b=this.boxDe?this.boxDe(this.model,true):new T.Box3().setFromObject(this.model);const y=b.isEmpty()?-3.6:Math.min(-3.6,b.min.y-.12);if(Math.abs((ambiente.userData.pisoY??-3.6)-y)>.01){ambiente.userData.pisoY=y;(ambiente.userData.piso||[]).forEach(([o,d])=>{o.position.y=y+d;});}}}
  if(ambiente){const t=(time||performance.now())*0.001;ambiente.children.forEach(o=>{if(o.isPoints){o.rotation.y=t*o.userData.vel;o.position.y=Math.sin(t*0.35+o.userData.vel*50)*0.08;}});}
  return frameOriginal.call(this,time,frame);
};
const exitOriginal2=Proto.exitXR;
Proto.exitXR=function(){sairAmbiente();return exitOriginal2.call(this);};

/* ---------- 6. Modelo maior no VR nas atividades de fita ---------- */
const placeOriginal=Proto.placeXR;
Proto.placeXR=function(){
  placeOriginal.call(this);
  if(!this.xr||!this.model||!this.anchor)return;
  const S=Lab.state,fita=['caminhoAr','caminhoSangue','alimento'].includes(S.view);
  if(S.view==='contexto'&&!S.context){
    // corpo inteiro em tamanho natural, pés no piso, a 1,8 m do professor
    const tudo=this.boxDe(this.model,true);if(!tudo.isEmpty()){const alt=tudo.getSize(new T.Vector3()).y,esc=1.72/alt;this.root.scale.multiplyScalar(esc);this.root.updateMatrixWorld(true);const b=this.boxDe(this.model,true),c=b.getCenter(new T.Vector3());this.root.position.x+=this.anchor.p.x+this.anchor.f.x*1.8-c.x;this.root.position.z+=this.anchor.p.z+this.anchor.f.z*1.8-c.z;this.root.position.y+=.05-b.min.y;this.root.updateMatrixWorld(true);}
    return;
  }
  if(!fita)return;
  const f=1.0;this.root.scale.multiplyScalar(f);this.root.position.y+=.05;this.root.position.addScaledVector(this.anchor.f,-.25);this.root.updateMatrixWorld(true);
};
});
})();
