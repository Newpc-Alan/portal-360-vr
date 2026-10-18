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


/* ---------- Portal de entrada (abertura cinematográfica ao entrar no VR e no 3D) ---------- */
if(window.PortalEntrada)window.PortalEntrada.configurar({titulo:'DNA Imersivo',cor:'#57d4ff',logo:'assets/entrada-simbolo.png?v=2',logo2:'assets/entrada-pde.png',auto3D:!EMBED,obter:()=>({renderer:view.renderer,scene:view.scene,camera:view.camera})});
const depoisAbertura=(fn,ms)=>{if(window.PortalEntrada)window.PortalEntrada.depois(fn,ms);else setTimeout(fn,ms||0);};
const abertura3D=()=>{if(window.PortalEntrada)window.PortalEntrada.tocar3D();};

/* ---------- 2. Tela de entrada (?vr=1) ---------- */
function mensagem(txt){const f=document.getElementById('feedback');if(!f)return;f.hidden=false;f.className='feedback warning';f.textContent=txt;}
if(q.get('vr')==='1'){
  const semVR=()=>mensagem('Para a experiência em VR, abra este mesmo link no navegador do óculos (Meta Quest). Aqui você pode explorar em 3D normalmente.');
  const mostrarEntrada=()=>{
    const ov=document.createElement('div');ov.id='vrGate';
    ov.innerHTML='<div class="vrgate-box"><img src="assets/logo.png" alt=""><div class="vrgate-t">DNA Imersivo</div><div class="vrgate-s">Coloque o óculos e toque para começar</div><button type="button" data-action="vr-entrar">🥽 Entrar em VR</button><button type="button" class="sec" data-action="vr-3d">Explorar em 3D</button></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;
      if(b.dataset.action==='vr-entrar'){window.alternarVR().finally(()=>ov.remove());}else{ov.remove();abertura3D();}});
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
  let title=(lesson.querySelector('h2')||{}).textContent||'DNA Imersivo';
  const instrucao=document.getElementById('captionText').textContent||'';
  const fbEl=document.getElementById('feedback');const feedback=fbEl&&!fbEl.hidden?fbEl.textContent:'';
  let body=instrucao+(feedback?'  '+feedback:''),tom='neutro';
  const des=estadoDesafio();
  if(des){title=des.acertou?'✅ ACERTOU!':'❌ ERROU';tom=des.acertou?'ok':'erro';body=D.questions[S.quiz.index].why;}
  if(this.xrReport){const r=Lab.report();title='Resumo da experiência';body=S.completed.length+' atividades concluídas. '+r.independent+' respostas independentes. '+r.errors+' tentativas incorretas. '+r.hints+' pistas consultadas. '+r.skips+' posições puladas. Exporte os registros no modo 3D.';tom='neutro';}
  if(this.xrAjuda&&!this.xrReport){title='Como usar os controles';body=AJUDA_CONTROLES;tom='neutro';}
  const menuAberto=!!this.menuAberto;
  const panel=this.textPlane(title,body,1.06,.86,tom);panel.position.set(1.16,.30,-1.64);panel.rotation.y=-.6;if(menuAberto)panel.visible=false;this.ui.add(panel);
  const lista=menuAberto?[]:this.xrReport?[{label:'Voltar à atividade',cmd:'xr:reportclose'}]:this.xrAjuda?[{label:'Voltar à atividade',cmd:'xr:ajudaclose'}]:this._acoes();
  const max=8,pages=Math.max(1,Math.ceil(lista.length/max));this.uiPage=Math.min(this.uiPage||0,pages-1);
  const quizFase=(S.view==='desafio'&&S.quiz.phase===1&&!this.xrReport&&!this.xrAjuda&&!menuAberto);
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
  if(pages>1&&!quizFase&&!menuAberto){this.xrButton('◀ Opções','xr:prev',.91,-.86,UI.btnW,this.uiPage===0);this.xrButton('Mais opções ▶','xr:next',1.41,-.86,UI.btnW,this.uiPage===pages-1);}
  /* v2.3 · VR enxuto (padrão Sistema Solar 8.13 / Célula 1.2.2): botão "☰ Menu" fixo na cena; menu em colunas acima dele */
  const AZ={bg:'#0f2c4a',borda:'#37B1DA',texto:'#ffffff'},AT={bg:'#0f6b3a',borda:'#7CFFB8',texto:'#ffffff'},SAI={bg:'#5a2a16',borda:'#ff9f6b',texto:'#fff2ea'};
  this.xrButton(menuAberto?'✕ Fechar menu':'☰  Menu','xr:abrirmenu',-.80,-.52,.36,false,menuAberto?{bg:'#3a2a10',borda:'#ffc77a',texto:'#fff6e8'}:{bg:'#0f4a6e',borda:'#7fd6ff',texto:'#ffffff'});
  if(!menuAberto)return;
  const atv=D.activities,idx=Math.max(0,atv.findIndex(a=>a.id===S.view));
  const cols=[['MISSÕES',atv.map((a,i)=>[(a.id===S.view?'▶ ':'')+(i+1)+'. '+a.label,'view:'+a.id,a.id===S.view?AT:null])],
   ['VER',[['Recentralizar a cena','center',null],['Aproximar tudo  (X)','xr:perto',null],['Afastar tudo  (Y)','xr:longe',null],[S.autoRotate?'Parar o giro do modelo':'Girar o modelo','rotate',null]]],
   ['SOM E SAÍDA',[['Repetir a explicação','voice:repeat',null],['Parar a voz','voice:stop',null],[narrator.musicOn?'Música de fundo: ligada':'Música de fundo: desligada','xr:musica',null],['Como usar os controles','xr:ajuda',null],['Voltar ao catálogo','catalog',AZ],['Sair do VR','vr',SAI]]]];
  const COLS=cols.length,DX=.5,W=.47,DY=.13,linhas=Math.max(...cols.map(c=>c[1].length)),base=-.52+.06+.075,topo=base+(linhas-1)*DY,cx=-.98+(COLS*DX)/2;
  const fundoC=document.createElement('canvas');fundoC.width=fundoC.height=256;const fg=fundoC.getContext('2d');fg.fillStyle='rgba(4,14,28,.92)';fg.fillRect(0,0,256,256);fg.strokeStyle='rgba(55,177,218,.85)';fg.lineWidth=3;fg.strokeRect(1.5,1.5,253,253);
  const alt=(topo+.36)-(base-.08),fundo=new T.Mesh(new T.PlaneGeometry(COLS*DX+.06,alt),new T.MeshBasicMaterial({map:texturaCanvas(fundoC),transparent:true,side:T.DoubleSide,depthWrite:false}));
  fundo.position.set(cx,(topo+.36+base-.08)/2,UI.z-.03);fundo.rotation.y=-Math.atan2(cx,-UI.z);fundo.userData.ordem=990;this.ui.add(fundo);
  const rot=-Math.atan2(cx,-UI.z);
  [[('Menu  ·  DNA Imersivo  ·  atividade '+(idx+1)+' de '+atv.length),'#ffffff',topo+.30,64],['Aponte o raio e aperte o gatilho · B fecha · X aproxima, Y afasta','#bfe6f2',topo+.215,44]].forEach(([t,c,y,sz])=>{const r=rotuloPlano(t,c,COLS*DX-.12,sz);r.position.set(cx,y,UI.z-.01);r.rotation.y=rot;r.userData.ordem=995;this.ui.add(r);});
  cols.forEach(([cab,itens],c)=>{const x=cx+(c-(COLS-1)/2)*DX;const h=rotuloPlano(cab,'#9fe8ff',W,64);h.position.set(x,topo+.105,UI.z-.005);h.rotation.y=-Math.atan2(x,-UI.z);h.userData.ordem=996;this.ui.add(h);
    itens.forEach(([t,cmd,cor],l)=>this.xrButton(t,cmd,x,topo-l*DY,W,false,cor));});
};
function rotuloPlano(text,cor,largura,size){const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.font='600 '+size+'px Segoe UI,Arial';while(g.measureText(text).width>490&&size>17){size-=2;g.font='600 '+size+'px Segoe UI,Arial';}
  g.textAlign='center';g.textBaseline='middle';g.fillStyle=cor;g.fillText(text,256,64);return new T.Mesh(new T.PlaneGeometry(largura,largura/4),new T.MeshBasicMaterial({map:texturaCanvas(c),transparent:true,side:T.DoubleSide,depthWrite:false}));}
const AJUDA_CONTROLES='Gatilho: escolhe e abre a ficha. Grip (lateral): segura a peça na mão; gire o pulso para olhar em volta. Analógicos para os lados: giram a hélice. B: abre e fecha o menu. X: aproxima tudo. Y: afasta tudo (10 distâncias, o óculos lembra a escolhida). Gatilho fora do menu: fecha o menu ou para a narração.';
Proto.alternarMenuVR=function(forca){this.menuAberto=forca===undefined?!this.menuAberto:!!forca;this.uiPage=0;if(this.menuAberto)this.xrAjuda=false;this.buildXRUI();};
/* botão apontado cresce e acende, ponto no toque do raio, B/Y abre o menu; UI por cima do modelo, fundo do menu atrás dos botões */
const updateOriginalV=Proto.updateXR;
Proto.updateXR=function(dt){updateOriginalV.call(this,dt);if(!this.xr)return;
  this.ui.traverse(o=>{if(o.isMesh&&o.material&&!o.userData._ord){o.userData._ord=true;o.material.depthTest=false;o.material.transparent=true;o.renderOrder=o.userData.ordem||1000;}});
  const alvos=new Set();this._pontos=this._pontos||new Map();
  for(const ctrl of this.controllers){const ui=this.controllerRay(ctrl).intersectObjects(this.uiHits,false)[0];let pt=this._pontos.get(ctrl);
    if(!pt){pt=new T.Mesh(new T.SphereGeometry(.012,12,8),new T.MeshBasicMaterial({color:0xffffff,depthTest:false,transparent:true}));pt.renderOrder=1100;this.scene.add(pt);this._pontos.set(ctrl,pt);}
    if(ui){alvos.add(ui.object);pt.visible=true;pt.position.copy(ui.point);}else pt.visible=false;}
  for(const b of this.uiHits){const on=alvos.has(b);if(b.userData.s0===undefined)b.userData.s0=b.scale.x;const k=on?1.1:1;b.scale.set(b.userData.s0*k,b.userData.s0*k,1);if(b.material&&b.material.color)b.material.color.setScalar(on?1:.86);}
  if(this.xrSession)for(const src of this.xrSession.inputSources){const gp=src.gamepad;if(!gp)continue;const st=src.__menuSt||(src.__menuSt={});const esq=src.handedness==='left'&&this.mudarDistancia;const bX=!!(gp.buttons[4]&&gp.buttons[4].pressed);const bY=!!(gp.buttons[5]&&gp.buttons[5].pressed);/* pde-vr-padrao: esquerdo X aproxima, Y afasta; direito B abre o menu */if(esq){if(bX&&!st.x)this.mudarDistancia(-1);if(bY&&!st.y)this.mudarDistancia(1);}else if(bY&&!st.y)this.alternarMenuVR();st.x=bX;st.y=bY;}
};

/* lista de ações da lateral (o dna-app monta os botões com data-act; lemos de lá para não depender de variáveis internas) */
Proto._acoes=function(){const out=[];document.querySelectorAll('#lessonPanel [data-act]').forEach(b=>{if(/^pair:target:/.test(b.dataset.act))return;if(b.closest('details')&&!b.closest('details').open)return;const label=(b.title&&b.textContent.trim().length<=1?b.textContent.trim()+' · '+b.title:b.textContent.trim());out.push({label,cmd:b.dataset.act,disabled:b.disabled});});return out;};

/* gatilho no vazio: para a narração (mesmo comportamento do Sistema Solar) */
const xrSelectOriginal=Proto.xrSelect;
Proto.xrSelect=function(ctrl){
  if(this.held.has(ctrl))return xrSelectOriginal.call(this,ctrl);
  const ray=this.controllerRay(ctrl);
  const ui=ray.intersectObjects(this.uiHits,false)[0];
  const cmdUI=ui&&ui.object.userData.command;
  if(cmdUI==='xr:abrirmenu'){this.alternarMenuVR();return;}
  if(cmdUI==='xr:musica'){this.menuAberto=false;narrator.setMusic(!narrator.musicOn,Math.max(.12,narrator.musicVolume||.2));const cb=document.getElementById('musicEnabled');if(cb)cb.checked=narrator.musicOn;setTimeout(()=>{if(this.xr)this.buildXRUI();},120);return;}
  if(cmdUI==='xr:ajuda'){this.menuAberto=false;this.xrAjuda=true;this.buildXRUI();return;}
  if(cmdUI==='xr:ajudaclose'){this.xrAjuda=false;this.buildXRUI();return;}
  if(this.menuAberto&&!ui){this.alternarMenuVR(false);return;}
  if(this.menuAberto&&cmdUI)this.menuAberto=false;
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
Proto.exitXR=function(){exitOriginal.call(this);if(posicional)posicional.setRefDistance(14);if(this._pontos){for(const pt of this._pontos.values()){this.scene.remove(pt);pt.geometry.dispose();pt.material.dispose();}this._pontos=null;}this.menuAberto=false;this.xrAjuda=false;};

/* ---------- 5. Ambiente VR com profundidade + trilha de fundo ---------- */
let ambiente=null,musicaAntes=null;
function criarAmbiente(modo2d){
  const g=new T.Group();g.name='ambienteVR';g.userData.modo2d=!!modo2d;const E=modo2d?1.9:1,CY=modo2d?-3.6:0;/* no 3D o chão fica abaixo do modelo e os anéis crescem */
  // abóbada em gradiente (azul-profundo do Portal → quase preto no zênite e no chão)
  const c=document.createElement('canvas');c.width=16;c.height=512;const x=c.getContext('2d');
  const gr=x.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#04101c');gr.addColorStop(.35,'#0a2238');gr.addColorStop(.5,'#0e2a44');gr.addColorStop(.65,'#0a2238');gr.addColorStop(1,'#04101c');/* espaço: simétrico, sem linha de chão */
  x.fillStyle=gr;x.fillRect(0,0,16,512);
  const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;
  const domo=new T.Mesh(new T.SphereGeometry(45,48,32),new T.MeshBasicMaterial({map:tex,side:T.BackSide,depthWrite:false}));
  domo.position.y=modo2d?0:1.2;g.add(domo);g.userData.domo=domo;
  // partículas "meio celular": duas camadas, próxima e distante
  const mkPontos=(n,raio,tam,cor,op)=>{const pos=new Float32Array(n*3);for(let i=0;i<n;i++){const r=raio*(0.35+0.65*Math.cbrt(Math.random())),th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1);pos[i*3]=r*Math.sin(ph)*Math.cos(th);pos[i*3+1]=1.4+r*Math.cos(ph)*0.55;pos[i*3+2]=r*Math.sin(ph)*Math.sin(th);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));
    const sp=document.createElement('canvas');sp.width=sp.height=64;const q=sp.getContext('2d');const rg=q.createRadialGradient(32,32,0,32,32,32);rg.addColorStop(0,'rgba(255,255,255,1)');rg.addColorStop(.35,'rgba(170,230,255,.55)');rg.addColorStop(1,'rgba(120,200,255,0)');q.fillStyle=rg;q.fillRect(0,0,64,64);
    const m=new T.PointsMaterial({size:tam,map:new T.CanvasTexture(sp),color:cor,transparent:true,opacity:op,depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true});
    const pts=new T.Points(geo,m);pts.userData.vel=0.02+Math.random()*0.02;return pts;};
  g.add(mkPontos(420,14,.09,0x7fd6ff,.55),mkPontos(180,6,.05,0xa6f0d6,.7));
  g.userData.piso=[];/* v3.2: sem piso. O modelo fica no espaço, só com a abóbada e as partículas (regra: igual no 3D e no VR). */
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
  const S=Lab.state,fita=['pareamento','desafio','replicacao','montagem'].includes(S.view)&&!(S.view==='desafio'&&S.quiz.phase!==0);
  if(!fita)return;
  const f=1.3;this.root.scale.multiplyScalar(f);this.root.position.y+=.08;this.root.position.addScaledVector(this.anchor.f,-.35);this.root.updateMatrixWorld(true);
};
});
})();
