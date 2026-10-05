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
      const S=Lab.state,bv=()=>{if(!S.welcomed&&Lab.boasVindas)Lab.boasVindas();};if(b.dataset.action==='vr-entrar'){window.alternarVR().finally(()=>ov.remove());}else{ov.remove();bv();}});
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
function estadoDesafio(){const S=Lab.state;if(S.view!=='desafio')return null;const q=Lab.quizAtual(),Q=Lab.questoesAtuais();if(q.phase!==1||q.done)return null;const i=q.index,resp=q.answers[i];if(resp===undefined)return null;const item=Q[i];return{correto:item.correct,escolha:resp,acertou:resp===item.correct};}

Proto.buildXRUI=function(){
  if(!this.xr)return;this.clearXRUI();
  if(this.anchor){this.ui.position.copy(this.anchor.p);this.ui.rotation.y=this.anchor.yaw;}
  const S=Lab.state,lesson=document.getElementById('lessonPanel');
  let title=(lesson.querySelector('h2')||{}).textContent||'Corpo Humano';
  const instrucao=document.getElementById('captionText').textContent||'';
  if(Lab.WELCOME&&instrucao===Lab.WELCOME)title='Bem-vindo ao Corpo Humano Imersivo';
  const fbEl=document.getElementById('feedback');const feedback=fbEl&&!fbEl.hidden?fbEl.textContent:'';
  let body=instrucao+(feedback?'  '+feedback:''),tom='neutro';
  const des=estadoDesafio();
  if(des){title=des.acertou?'✅ ACERTOU!':'❌ ERROU';tom=des.acertou?'ok':'erro';body=Lab.questoesAtuais()[Lab.quizAtual().index].why;}
  if(this.xrReport){const r=Lab.report();title='Resumo da experiência';body=S.completed.length+' atividades concluídas. '+r.independent+' respostas independentes. '+r.errors+' tentativas incorretas. '+r.hints+' pistas consultadas. '+r.skips+' posições puladas. Gere o relatório do professor no modo 3D.';tom='neutro';}
  const panel=this.textPlane(title,body,1.06,.86,tom);panel.position.set(1.16,.30,-1.64);panel.rotation.y=-.6;this.ui.add(panel);
  const lista=this.xrReport?[{label:'Voltar à atividade',cmd:'xr:reportclose'}]:this._acoes();
  const max=8,pages=Math.max(1,Math.ceil(lista.length/max));this.uiPage=Math.min(this.uiPage||0,pages-1);
  const quizFase=(S.view==='desafio'&&Lab.quizAtual().phase===1)&&!this.xrReport;
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
  /* coluna da esquerda em dois níveis: raiz → sistemas / missões do sistema atual / controles */
  const menu=this.xrMenu||'raiz';const sis=Lab.sistemaAtual(),atv=Lab.atividadesDe(S.sistema);
  const atual=atv.find(a=>a.id===S.view)||atv[0],idx=Math.max(0,atv.indexOf(atual));
  const AZ={bg:'#0f2c4a',borda:'#37B1DA',texto:'#ffffff'},VD={bg:'#0f4a3a',borda:'#7CFFB8',texto:'#ffffff'};
  if(menu==='raiz'){
    this.xrButton('Sistema: '+sis.nome,'xr:menu:sistemas',-1.18,.6,.5,false,AZ);
    this.xrButton('▣ Missão '+(idx+1)+' de '+atv.length+': '+atual.label,'xr:menu:missoes',-1.18,.6-UI.passo,.5,false,VD);
    this.xrButton(this.dentro?'⤡ Sair de dentro do corpo':'⤢ Entrar no corpo','xr:dentro',-1.18,.6-2*UI.passo,.5,false,this.dentro?{bg:'#4a2a0f',borda:'#ffc77a',texto:'#fff6e8'}:{bg:'#2a1050',borda:'#c9a6ff',texto:'#ffffff'});
    this.xrButton('⚙ Controles','xr:menu:controles',-1.18,.6-3*UI.passo,.5);
    this.xrButton('🔊 Ouvir de novo','voice:repeat',-1.18,.6-4*UI.passo,.5);
    this.xrButton('🥽 Sair do VR','vr',-1.18,.6-5.3*UI.passo,.5,false,{bg:'#5a2a16',borda:'#ff9f6b',texto:'#fff2ea'});
  }else if(menu==='missoes'){
    atv.forEach((a,i)=>this.xrButton((i+1)+'. '+a.label,'view:'+a.id,-1.18,.6-i*UI.passo,.5,false,a.id===S.view?VD:null));
    this.xrButton('◀ Voltar','xr:menu:raiz',-1.18,.6-(atv.length+.3)*UI.passo,.5);
  }else if(menu==='sistemas'){
    const disp=D.sistemas.filter(x=>!x.breve);
    disp.forEach((x,i)=>this.xrButton((x.id===S.sistema?'● ':'○ ')+x.nome,'sistema:'+x.id,-1.18,.6-i*UI.passo,.5,false,x.id===S.sistema?VD:null));
    this.xrButton('… mais 6 sistemas em breve','xr:menu:raiz',-1.18,.6-disp.length*UI.passo,.5,true);
    this.xrButton('◀ Voltar','xr:menu:raiz',-1.18,.6-(disp.length+1.3)*UI.passo,.5);
  }else{
    this.xrButton('◎ Centralizar','center',-1.18,.6,.5);this.xrButton(S.autoRotate?'Ⅱ Pausar giro':'▷ Girar modelo','rotate',-1.18,.6-UI.passo,.5);
    this.xrButton('■ Parar voz','voice:stop',-1.18,.6-2*UI.passo,.5);this.xrButton('↙ Catálogo','catalog',-1.18,.6-3*UI.passo,.5,false,AZ);
    this.xrButton('◀ Voltar','xr:menu:raiz',-1.18,.6-4.3*UI.passo,.5);
    const ajuda=this.textPlane('Como usar os controles','Grip (lateral): segura o órgão na mão; gire o pulso para olhar em volta. Duas mãos: afaste para aumentar. Gatilho: seleciona e abre a ficha. Analógico direito: gira o modelo em passos e aproxima ou afasta. Analógico esquerdo: sobe e desce. Botão A: centraliza. Botão B: menu de missões.',.92,.62,'neutro');ajuda.position.set(-1.18,.6-7.2*UI.passo,UI.z);ajuda.rotation.y=.55;this.ui.add(ajuda);
  }
};
/* lista de ações da lateral (o dna-app monta os botões com data-act; lemos de lá para não depender de variáveis internas) */
Proto._acoes=function(){const out=[];const lab=!!(window.CORPO_V4&&window.CORPO_V4.accepts(Lab.state.view));document.querySelectorAll('#lessonPanel [data-act]').forEach(b=>{if(/^seq:target:/.test(b.dataset.act))return;if(b.closest('details')&&(!b.closest('details').open||lab))return;if(lab&&(b.closest('.v4-small')||/^v4:(turn|align|cutStep|axis)/.test(b.dataset.act)))return;const label=(b.title&&b.textContent.trim().length<=1?b.textContent.trim()+' · '+b.title:b.textContent.trim());out.push({label,cmd:b.dataset.act,disabled:b.disabled});});return out;};

/* gatilho no vazio: para a narração (mesmo comportamento do Sistema Solar) */
const xrSelectOriginal=Proto.xrSelect;
Proto.xrSelect=function(ctrl){
  if(this.held.has(ctrl))return xrSelectOriginal.call(this,ctrl);
  const ray=this.controllerRay(ctrl);
  const ui=ray.intersectObjects(this.uiHits,false)[0];
  if(ui&&ui.object.userData.command==='xr:dentro'){this.alternarDentro();return;}
  this.root.updateMatrixWorld(true);
  const hit=ui?null:this.hits(ray)[0];
  if(!ui&&!hit){narrator.stop();return;}
  return xrSelectOriginal.call(this,ctrl);
};
/* v3.8 · "Entrar no corpo": o modelo cresce até virar uma sala em volta do aluno */
const DENTRO_TXT={torax:'Você está dentro do tórax. Olhe em volta: as costelas protegem o coração e os pulmões, e a traqueia desce logo acima de você. Aponte para qualquer estrutura para ouvir sobre ela.',corpo:'Você está ao lado de um corpo gigante. Dê a volta, olhe de perto as articulações e aponte para o que quiser conhecer.',fora:'De volta ao tamanho natural.'};
Proto.alternarDentro=function(){this.dentro=!this.dentro;this.anchor=null;this.xrZoom=1;if(this.copy)Lab.command('inspect:close');this.placeXR();this.buildXRUI();
  const S=Lab.state,inteiro=((S.view==='contexto'&&!S.context)||['esqContexto','ossos','musculos','articulacoes'].includes(S.view)||(S.view==='desafio'&&S.modulo==='esq'));
  if(S.autoVoice)narrator.say(this.dentro?(inteiro?DENTRO_TXT.corpo:DENTRO_TXT.torax):DENTRO_TXT.fora,this.dentro?(inteiro?'vr-dentro-corpo':'vr-dentro-torax'):'vr-fora');};

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
Proto.toggleVR=async function(){const r=await toggleOriginal.call(this);ligarPosicional();if(posicional)posicional.setRefDistance(this.xr?1.2:14);if(this.xr&&typeof entrarAmbiente==='function')entrarAmbiente();/* boas-vindas a cada entrada no VR (v3.5.4) */if(this.xr&&Lab.boasVindas)setTimeout(()=>{if(view.xr){Lab.boasVindas();setTimeout(()=>{if(view.xr)view.buildXRUI();},700);}},900);return r;};
const exitOriginal=Proto.exitXR;
Proto.exitXR=function(){exitOriginal.call(this);if(posicional)posicional.setRefDistance(14);};

/* ---------- 5. Ambiente VR com profundidade + trilha de fundo ---------- */
let ambiente=null,musicaAntes=null;
/* v3.8: cada sistema é um lugar (abóbada e partículas com a cor do sistema; o circulatório pulsa no ritmo do coração) */
const CLIMA={
 respiratorio:{domo:['#06161f','#0d3140','#124052','#0d3140','#06161f'],p1:[0x9fe3ff,.5],p2:[0xd8f6ff,.7]},
 circulatorio:{domo:['#12050a','#2c0a12','#3a0d16','#2c0a12','#12050a'],p1:[0xff6f6f,.55],p2:[0xff9a9a,.75],pulsa:true},
 digestorio:{domo:['#150d05','#30200c','#3e2a10','#30200c','#150d05'],p1:[0xffc27a,.45],p2:[0xffe0b0,.6]},
 esqueletico:{domo:['#05070d','#10161f','#161e2a','#10161f','#05070d'],p1:[0xcfd8e6,.4],p2:[0xf2f2f2,.55]},
 muscular:{domo:['#130607','#2a0e11','#361216','#2a0e11','#130607'],p1:[0xff9c8a,.45],p2:[0xffd0c4,.6]},
 padrao:{domo:['#04101c','#0a2238','#0e2a44','#0a2238','#04101c'],p1:[0x7fd6ff,.55],p2:[0xa6f0d6,.7]}
};
function climaDe(){const S=Lab.state;return CLIMA[S.sistema]||CLIMA.padrao;}
function criarAmbiente(modo2d){
  const g=new T.Group();g.name='ambienteVR';g.userData.modo2d=!!modo2d;const clima=climaDe();g.userData.sistema=Lab.state.sistema;const E=modo2d?1.9:1,CY=modo2d?-3.6:0;/* no 3D o chão fica abaixo do modelo e os anéis crescem */
  // abóbada em gradiente (azul-profundo do Portal → quase preto no zênite e no chão)
  const c=document.createElement('canvas');c.width=16;c.height=512;const x=c.getContext('2d');
  const gr=x.createLinearGradient(0,0,0,512);[0,.35,.5,.65,1].forEach((st,i)=>gr.addColorStop(st,clima.domo[i]));/* espaço: simétrico, sem linha de chão */
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
  g.add(mkPontos(420,14,.09,clima.p1[0],clima.p1[1]),mkPontos(180,6,.05,clima.p2[0],clima.p2[1]));g.userData.pulsa=!!clima.pulsa;
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
  if(ambiente&&ambiente.userData.sistema!==Lab.state.sistema){const m2=ambiente.userData.modo2d;M.dispose(ambiente);view.scene.remove(ambiente);ambiente=null;ambiente=criarAmbiente(m2);view.scene.add(ambiente);}
  if(ambiente&&ambiente.userData.pulsa&&ambiente.userData.domo&&window.CORPO_TECIDOS){const k=1+.1*window.CORPO_TECIDOS.PULSO.value;ambiente.userData.domo.material.color.setScalar(k);}
  if(this.xr){if(!ambiente||ambiente.userData.modo2d)entrarAmbiente(false);}else{if(!ambiente)entrarAmbiente(true);armarMusica2d();
    /* no 3D o piso acompanha a base do modelo (corpo inteiro nunca fica com os pés abaixo do chão) */
    ambiente.userData.n=(ambiente.userData.n||0)+1;if(ambiente.userData.n%15===1&&this.model){const b=this.boxDe?this.boxDe(this.model,true):new T.Box3().setFromObject(this.model);const y=b.isEmpty()?-3.6:Math.min(-3.6,b.min.y-.12);if(Math.abs((ambiente.userData.pisoY??-3.6)-y)>.01){ambiente.userData.pisoY=y;(ambiente.userData.piso||[]).forEach(([o,d])=>{o.position.y=y+d;});}}}
  if(ambiente){const t=(time||performance.now())*0.001;ambiente.children.forEach(o=>{if(o.isPoints){o.rotation.y=t*o.userData.vel;o.position.y=Math.sin(t*0.35+o.userData.vel*50)*0.08;}});}
  return frameOriginal.call(this,time,frame);
};
const exitOriginal2=Proto.exitXR;
Proto.exitXR=function(){this.dentro=false;sairAmbiente();return exitOriginal2.call(this);};

/* ---------- 6. Modelo maior no VR nas atividades de fita ---------- */
const placeOriginal=Proto.placeXR;
Proto.placeXR=function(){
  placeOriginal.call(this);
  if(!this.xr||!this.model||!this.anchor)return;
  const S=Lab.state,fita=['caminhoAr','caminhoSangue','alimento','coluna','braco'].includes(S.view);
  if(this.dentro&&!this.copy){
    const a=this.anchor;const inteiro=((S.view==='contexto'&&!S.context)||['esqContexto','ossos','musculos','articulacoes'].includes(S.view)||(S.view==='desafio'&&S.modulo==='esq'));
    const alvoObj=this.obj||this.model;const b=this.boxDe(alvoObj,inteiro);if(b.isEmpty())return;const sz=b.getSize(new T.Vector3()),maior=Math.max(sz.x,sz.y,sz.z);if(maior<1e-4)return;
    if(inteiro){/* corpo gigante de 3,4 m, pés no nível do aluno, a 1,2 m; o analógico esquerdo sobe para ver de perto */const k=3.4/sz.y;this.root.scale.multiplyScalar(k);this.root.updateMatrixWorld(true);const b2=this.boxDe(alvoObj,true),c=b2.getCenter(new T.Vector3());const alvo=a.p.clone().addScaledVector(a.f,1.2);this.root.position.x+=alvo.x-c.x;this.root.position.z+=alvo.z-c.z;this.root.position.y+=.02-b2.min.y;}
    else{/* tórax-sala: os órgãos (sem a silhueta) ocupam 3,4 m; o aluno fica no meio, coração à altura do peito */const k=3.4/maior;this.root.scale.multiplyScalar(k);this.root.updateMatrixWorld(true);const b2=this.boxDe(alvoObj),c=b2.getCenter(new T.Vector3());const alvo=a.p.clone().addScaledVector(a.f,.45);alvo.y=a.p.y-.3;this.root.position.add(alvo.sub(c));}
    this.root.updateMatrixWorld(true);return;
  }
  if(((S.view==='contexto'&&!S.context)||(['esqContexto','ossos','musculos','articulacoes'].includes(S.view)||(S.view==='desafio'&&S.modulo==='esq')))&&!this.copy){
    // corpo inteiro em tamanho natural, pés no piso, a 1,8 m do professor
    const tudo=this.boxDe(this.model,true);if(!tudo.isEmpty()){const alt=tudo.getSize(new T.Vector3()).y,esc=1.72/alt;this.root.scale.multiplyScalar(esc);this.root.updateMatrixWorld(true);const b=this.boxDe(this.model,true),c=b.getCenter(new T.Vector3());this.root.position.x+=this.anchor.p.x+this.anchor.f.x*1.8-c.x;this.root.position.z+=this.anchor.p.z+this.anchor.f.z*1.8-c.z;this.root.position.y+=.05-b.min.y;this.root.updateMatrixWorld(true);}
    return;
  }
  if(this.copy&&!this.copy.userData.held){
    /* v3.5.6: o órgão projetado vem bem à frente do aluno (0,7 m), em tamanho de "segurar nas mãos" (~0,55 m); o corpo fica ao fundo */
    const a=this.anchor,copy=this.copy;this.animatedInspect=null;this.root.updateMatrixWorld(true);
    /* corpo ao fundo: ~1,05 m de altura a 2,3 m, levemente à esquerda */
    if(this.obj){const bo=this.boxDe(this.obj);if(!bo.isEmpty()){const so=bo.getSize(new T.Vector3()),mo=Math.max(so.x,so.y,so.z);if(mo>1e-4){this.root.scale.multiplyScalar(1.05/mo);this.root.updateMatrixWorld(true);const co=this.boxDe(this.obj).getCenter(new T.Vector3());const alvoC=a.p.clone().addScaledVector(a.f,2.3);alvoC.y=a.p.y-.15;const lado=new T.Vector3(-a.f.z,0,a.f.x);alvoC.addScaledVector(lado,-.35);this.root.position.add(alvoC.sub(co));this.root.updateMatrixWorld(true);}}}
    const b=this.boxDe(copy);if(!b.isEmpty()){const size=b.getSize(new T.Vector3()),maior=Math.max(size.x,size.y,size.z);
      if(maior>1e-4){const alvoTam=.55,k=alvoTam/maior;copy.scale.multiplyScalar(k);this.root.updateMatrixWorld(true);
        const b2=this.boxDe(copy),c=b2.getCenter(new T.Vector3());
        const alvo=a.p.clone().addScaledVector(a.f,.72);alvo.y=a.p.y-.08;
        const delta=alvo.sub(c),pai=copy.parent||this.root;const local=delta.applyQuaternion(pai.getWorldQuaternion(new T.Quaternion()).invert()).divideScalar(pai.getWorldScale(new T.Vector3()).x||1);
        copy.position.add(local);this.root.updateMatrixWorld(true);}}
    return;
  }
  if(!fita)return;
  const f=1.0;this.root.scale.multiplyScalar(f);this.root.position.y+=.05;this.root.position.addScaledVector(this.anchor.f,-.25);this.root.updateMatrixWorld(true);
};
});
})();
