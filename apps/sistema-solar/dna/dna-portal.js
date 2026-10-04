/* DNA Imersivo · camada Portal 360º VR (v2.1)
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

function pronto(fn){if(window.DNALab&&window.DNALab.view)fn();else setTimeout(()=>pronto(fn),40);}

pronto(function(){
const Lab=window.DNALab,T=window.THREE,D=window.DNA_DATA,M=window.DNA_MODELS;
const view=Lab.view,narrator=Lab.narrator;
const Proto=Object.getPrototypeOf(view);

/* ---------- 1. Contrato do catálogo ---------- */
window.alternarVR=function(){try{return Promise.resolve(view.toggleVR());}catch(e){return Promise.reject(e);}};
window.irCatalogo=function(){Lab.command('catalog');};
window.PortalDNA={versao:'2.1.0',get emVR(){return !!view.xr;}};

/* ---------- 2. Tela de entrada (?vr=1) ---------- */
function mensagem(txt){const f=document.getElementById('feedback');if(!f)return;f.hidden=false;f.className='feedback warning';f.textContent=txt;}
if(q.get('vr')==='1'){
  const semVR=()=>mensagem('Para a experiência em VR, abra este mesmo link no navegador do óculos (Meta Quest). Aqui você pode explorar em 3D normalmente.');
  const mostrarEntrada=()=>{
    const ov=document.createElement('div');ov.id='vrGate';
    ov.innerHTML='<div class="vrgate-box"><img src="assets/logo.png" alt=""><div class="vrgate-t">DNA Imersivo</div><div class="vrgate-s">Coloque o óculos e toque para começar</div><button type="button" data-action="vr-entrar">🥽 Entrar em VR</button><button type="button" class="sec" data-action="vr-3d">Explorar em 3D</button></div>';
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
  let y=96;
  c.font='600 62px Segoe UI,Arial';c.fillStyle='#a4e6d1';
  for(const l of quebrar(c,title,930)){c.fillText(l,52,y);y+=78;}
  y+=26;c.font='400 48px Segoe UI,Arial';c.fillStyle='#e6f3fb';
  for(const l of quebrar(c,body,930)){if(y>990)break;c.fillText(l,52,y);y+=64;}
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

const VERDE={bg:'#0f6b3a',borda:'#3fd48a',texto:'#ffffff'},VERMELHO={bg:'#7a1f28',borda:'#ff6b6b',texto:'#ffffff'},APAGADO={bg:'#122531',borda:'#243a47',texto:'#5c7484'};
function estadoDesafio(){const S=Lab.state;if(S.view!=='desafio'||S.quiz.phase!==1||S.quiz.done)return null;const i=S.quiz.index,resp=S.quiz.answers[i];if(resp===undefined)return null;const item=D.questions[i];return{correto:item.correct,escolha:resp,acertou:resp===item.correct};}

Proto.buildXRUI=function(){
  if(!this.xr)return;this.clearXRUI();
  if(this.anchor){this.ui.position.copy(this.anchor.p);this.ui.rotation.y=this.anchor.yaw;}
  const S=Lab.state,lesson=document.getElementById('lessonPanel');
  let title=(lesson.querySelector('h2')||{}).textContent||'DNA Imersivo';
  const instrucao=document.getElementById('captionText').textContent||'';
  const fbEl=document.getElementById('feedback');const feedback=fbEl&&!fbEl.hidden?fbEl.textContent:'';
  let body=instrucao+(feedback?'  '+feedback:''),tom='neutro';
  const des=estadoDesafio();
  if(des){title=des.acertou?'✅ ACERTOU!':'❌ ERROU';tom=des.acertou?'ok':'erro';body=D.questions[S.quiz.index].why;}
  if(this.xrReport){const r=Lab.report();title='Resumo da experiência';body=S.completed.length+' atividades concluídas. '+r.independent+' respostas independentes. '+r.errors+' tentativas incorretas. '+r.hints+' pistas consultadas. '+r.skips+' posições puladas. Exporte os registros no modo 3D.';tom='neutro';}
  const panel=this.textPlane(title,body,1.06,.86,tom);panel.position.set(1.16,.30,-1.64);panel.rotation.y=-.6;this.ui.add(panel);
  const lista=this.xrReport?[{label:'Voltar à atividade',cmd:'xr:reportclose'}]:this._acoes();
  const max=8,pages=Math.max(1,Math.ceil(lista.length/max));this.uiPage=Math.min(this.uiPage||0,pages-1);
  lista.slice(this.uiPage*max,(this.uiPage+1)*max).forEach((a,i)=>{
    let cor=null;const m=/^quiz:answer:(\d+)$/.exec(a.cmd);
    if(des&&m){const k=Number(m[1]);cor=k===des.correto?VERDE:k===des.escolha?VERMELHO:APAGADO;}
    this.xrButton(a.label,a.cmd,1.16+(i%2?.25:-.25),-.22-Math.floor(i/2)*UI.passo,UI.btnW,a.disabled,cor);
  });
  if(pages>1){this.xrButton('◀ Opções','xr:prev',.91,-.86,UI.btnW,this.uiPage===0);this.xrButton('Mais opções ▶','xr:next',1.41,-.86,UI.btnW,this.uiPage===pages-1);}
  D.activities.forEach((a,i)=>this.xrButton((i+1)+'. '+a.label,'view:'+a.id,-1.18,.52-i*UI.passo,.5));
  this.xrButton('🥽 Sair do VR','vr',-1.18,-.62,.5,false,{bg:'#5a2a16',borda:'#ff9f6b',texto:'#fff2ea'});
  this.xrButton('↙ Catálogo','catalog',-1.18,-.77,.5,false,{bg:'#0f2c4a',borda:'#37B1DA',texto:'#ffffff'});
  this.xrButton('◎ Centralizar','center',-.52,-.86,UI.btnW);this.xrButton(S.autoRotate?'Ⅱ Pausar':'▷ Girar','rotate',-.02,-.86,UI.btnW);
  this.xrButton('🔊 Ouvir','voice:repeat',-.52,-1.01,UI.btnW);this.xrButton('■ Parar voz','voice:stop',-.02,-1.01,UI.btnW);
};
/* lista de ações da lateral (o dna-app monta os botões com data-act; lemos de lá para não depender de variáveis internas) */
Proto._acoes=function(){const out=[];document.querySelectorAll('#lessonPanel [data-act]').forEach(b=>{if(/^pair:target:/.test(b.dataset.act))return;if(b.closest('details')&&!b.closest('details').open)return;const label=(b.title&&b.textContent.trim().length<=1?b.textContent.trim()+' · '+b.title:b.textContent.trim());out.push({label,cmd:b.dataset.act,disabled:b.disabled});});return out;};

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
Proto.toggleVR=async function(){const r=await toggleOriginal.call(this);ligarPosicional();if(posicional)posicional.setRefDistance(this.xr?1.2:14);return r;};
const exitOriginal=Proto.exitXR;
Proto.exitXR=function(){exitOriginal.call(this);if(posicional)posicional.setRefDistance(14);};
});
})();
