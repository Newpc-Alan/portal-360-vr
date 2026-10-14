/* Sala do professor · cliente dos óculos (Portal 360º VR · Portal do Educador) v1.2.0 (out/2026)
   Roda no catálogo e em cada app. O óculos entra numa sala (código de 4 dígitos), informa a cada poucos segundos
   o que o aluno está fazendo (app, sistema/tema, missão, progresso, Desafio, se está no VR, bateria) e obedece aos
   comandos do professor: levar para uma missão, pausar/retomar, chamar (identificar o óculos) e encerrar.
   Transporte: API REST do Firebase Realtime Database (fetch + EventSource), sem SDK.
   Entrar na sala: botão "🎓 Sala" no canto da tela (fora do VR) ou link com ?sala=1234&oculos=3 (útil no modo quiosque).
   Arquivo-mestre: assets/sala/sala-cliente.js (cópia idêntica em cada apps/<app>/). Regra 9: sem onclick inline. */
(function(){'use strict';
if(window.Portal360Sala)return;
const VERSAO='1.6.0';
/* endereço do banco: preenchido quando o projeto Firebase da sala for criado (sem barra no fim) */
const DB_PADRAO='https://portal360-sala-default-rtdb.firebaseio.com';
const q=new URLSearchParams(location.search);
const LS={get:k=>{try{return localStorage.getItem(k);}catch(_){return null;}},set:(k,v)=>{try{localStorage.setItem(k,v);}catch(_){}},del:k=>{try{localStorage.removeItem(k);}catch(_){}}};
const SS={get:k=>{try{return sessionStorage.getItem(k);}catch(_){return null;}},set:(k,v)=>{try{sessionStorage.setItem(k,v);}catch(_){}},del:k=>{try{sessionStorage.removeItem(k);}catch(_){}}};
if(q.get('saladb'))LS.set('portal360_sala_db',q.get('saladb').replace(/\/+$/,''));
const DB=()=>(LS.get('portal360_sala_db')||DB_PADRAO||'').replace(/\/+$/,'');
const ID=(()=>{let id=LS.get('portal360_oculos_id');if(!id){id='o'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);LS.set('portal360_oculos_id',id);}return id;})();
const BASE=(()=>{const m=location.pathname.match(/^(.*?)\/apps\/[^/]+\/?/);return m?m[1]+'/':location.pathname.replace(/[^/]*$/,'');})();
let sala=null;try{sala=JSON.parse(LS.get('portal360_sala')||'null');}catch(_){sala=null;}
if(q.get('sala')&&/^\d{4}$/.test(q.get('sala'))){sala={codigo:q.get('sala'),rotulo:q.get('oculos')?('Óculos '+q.get('oculos').replace(/\D/g,'')):(sala&&sala.rotulo)||'Óculos'};LS.set('portal360_sala',JSON.stringify(sala));}

/* ---------- adaptadores: o que cada app expõe ---------- */
const APPS={corpo:'Corpo Humano Imersivo',terra:'Terra por Dentro',dna:'DNA Imersivo',solar:'Sistema Solar VR',catalogo:'Catálogo Portal 360º'};
const PASTA={corpo:'corpo-humano',terra:'terra',dna:'dna',solar:'sistema-solar'};
const SOLAR_VISTAS={sistema:'Sistema Solar',planeta:'Planeta',comparar:'Comparar diâmetros',diaNoite:'Dia e noite',fases:'Fases da Lua',estacoes:'Estações do ano',eclipse:'Eclipses',desafio:'Desafio'};
function emVR(){try{const c=window.PortalEntrada&&window.PortalEntrada.contexto&&window.PortalEntrada.contexto();return !!(c&&c.renderer&&c.renderer.xr&&c.renderer.xr.isPresenting);}catch(_){return false;}}
function labGenerico(Lab,D,secKey,secLista){
  const S=Lab.state,act=(D.activities||[]).find(a=>a.id===S.view)||{};const sec=(secLista||[]).find(x=>x.id===S[secKey])||{};
  const ativ=(sec.atividades||[]).concat(['desafio']);const feitas=(sec.atividades||[]).filter(id=>(S.completed||[]).includes(id)).length+(((S.quizzes||{})[S[secKey]]||{}).done?1:0);
  const quiz=(S.quizzes||{})[S[secKey]]||S.quiz||null;let acertos=0,resp=0;
  try{const Q=(sec.questoes||[]).map(id=>(D.todasQuestoes||D.questions||[]).find(x=>x.id===id)).filter(Boolean);if(quiz&&quiz.answers){quiz.answers.forEach((a,i)=>{if(a===undefined||a===null)return;resp++;if(Q[i]&&a===Q[i].correct)acertos++;});}}catch(_){}
  return{secao:sec.nome||'',secId:S[secKey]||'',view:S.view,viewNome:(act.label||S.view)+(act.title?' · '+act.title:''),feitas,total:ativ.length,desafio:{acertos,respondidas:resp,total:(sec.questoes||[]).length}};}
function mapaGenerico(D,secLista){return (secLista||[]).filter(s=>!s.breve).map(s=>({id:s.id,nome:s.nome,missoes:(s.atividades||[]).concat(['desafio']).map(v=>{const a=(D.activities||[]).find(x=>x.id===v)||{};return{id:v,nome:a.label||v};})}));}
const ADAPT={
  corpo:{ok:()=>!!(window.CorpoLab&&window.CORPO_DATA),estado:()=>labGenerico(window.CorpoLab,window.CORPO_DATA,'sistema',window.CORPO_DATA.sistemas),mapa:()=>mapaGenerico(window.CORPO_DATA,window.CORPO_DATA.sistemas),
    ir:(sec,view)=>{const L=window.CorpoLab;if(sec&&L.state.sistema!==sec)L.command('sistema:'+sec);if(view)L.command('view:'+view);if(L.fecharMenu)L.fecharMenu();}},
  terra:{ok:()=>!!(window.TerraLab&&window.TERRA_DATA),estado:()=>labGenerico(window.TerraLab,window.TERRA_DATA,'tema',window.TERRA_DATA.temas),mapa:()=>mapaGenerico(window.TERRA_DATA,window.TERRA_DATA.temas),
    ir:(sec,view)=>{const L=window.TerraLab;if(sec&&L.state.tema!==sec)L.command('tema:'+sec);if(view)L.command('view:'+view);if(L.fecharMenu)L.fecharMenu();}},
  dna:{ok:()=>!!(window.DNALab&&window.DNA_DATA),estado:()=>{const S=window.DNALab.state,D=window.DNA_DATA,a=D.activities.find(x=>x.id===S.view)||{};const ids=D.activities.map(x=>x.id);const q_=S.quiz||{};let ac=0,re=0;try{(q_.answers||[]).forEach((x,i)=>{if(x===undefined||x===null)return;re++;const Q=(D.questions||[])[i];if(Q&&x===Q.correct)ac++;});}catch(_){}
      return{secao:'DNA',secId:'dna',view:S.view,viewNome:(a.label||S.view)+(a.title?' · '+a.title:''),feitas:ids.filter(i=>(S.completed||[]).includes(i)).length,total:ids.length,desafio:{acertos:ac,respondidas:re,total:(D.questions||[]).length}};},
    mapa:()=>[{id:'dna',nome:'DNA',missoes:window.DNA_DATA.activities.map(a=>({id:a.id,nome:a.label}))}],ir:(sec,view)=>{if(view)window.DNALab.command('view:'+view);}},
  solar:{ok:()=>!!window.PortalSolarV8,estado:()=>{let v='sistema';try{v=(typeof estado!=='undefined'&&estado.vista)||'sistema';}catch(_){}const st=window.PortalSolarV8.state||{};const vistas=Object.keys(SOLAR_VISTAS);
      return{secao:'Sistema Solar',secId:'solar',view:v,viewNome:SOLAR_VISTAS[v]||v,feitas:vistas.filter(x=>(st.completed||st.feitas||[]).includes&&(st.completed||st.feitas||[]).includes(x)).length,total:vistas.length,desafio:{acertos:0,respondidas:0,total:0}};},
    mapa:()=>[{id:'solar',nome:'Sistema Solar',missoes:Object.keys(SOLAR_VISTAS).map(k=>({id:k,nome:SOLAR_VISTAS[k]}))}],ir:(sec,view)=>{if(view&&window.PortalSolarV8.enterView)window.PortalSolarV8.enterView(view);}},
  catalogo:{ok:()=>true,estado:()=>({secao:'',secId:'',view:'catalogo',viewNome:'No catálogo',feitas:0,total:0,desafio:{acertos:0,respondidas:0,total:0}}),mapa:()=>null,ir:()=>{}}
};
const APP=(()=>{const m=location.pathname.match(/\/apps\/([^/]+)\//);const p=m?m[1]:'';return p==='corpo-humano'?'corpo':p==='terra'?'terra':p==='dna'?'dna':p==='sistema-solar'?'solar':'catalogo';})();
const A=ADAPT[APP];

/* ---------- rede ---------- */
const url=p=>DB()+'/'+p+'.json';
async function rede(metodo,p,corpo){if(!DB())return null;try{const r=await fetch(url(p),{method:metodo,headers:{'Content-Type':'application/json'},body:corpo===undefined?undefined:JSON.stringify(corpo),cache:'no-store'});return r.ok?await r.json():null;}catch(_){return null;}}
let bateria=null;try{if(navigator.getBattery)navigator.getBattery().then(b=>{const f=()=>{bateria={nivel:Math.round(b.level*100),carregando:!!b.charging};};f();b.addEventListener('levelchange',f);b.addEventListener('chargingchange',f);});}catch(_){}
let ultimoEnvio='',hb=0,es=null,poll=0,ligado=false;
function pacote(){let e={};try{if(A.ok())e=A.estado();}catch(_){e={};}
  const chave=APP+'/'+(e.secId||'')+'/'+(e.view||'');if(chave!==ENG.chave){ENG.chave=chave;ENG.interacoes=0;ENG.novaMissao=true;if(!tocando())MID.el=null;}
  return Object.assign({rotulo:sala.rotulo,app:APP,appNome:APPS[APP],emVR:emVR(),bateria,saindo:false,versao:VERSAO,atividade:ENG.status,atencao:atencao(),interacoes:ENG.interacoes,midia:midia(),diagVR},e);}
async function enviar(forcar){if(!sala)return;const p=pacote();const sig=JSON.stringify(p);if(!forcar&&sig===ultimoEnvio&&Date.now()-hb<5000)return;ultimoEnvio=sig;hb=Date.now();p.visto={'.sv':'timestamp'};
  /* marcos com a hora do servidor: desde quando está neste status e nesta missão */
  if(ENG.novoStatus){p.statusDesde={'.sv':'timestamp'};ENG.novoStatus=false;}if(ENG.novaMissao){p.missaoDesde={'.sv':'timestamp'};ENG.novaMissao=false;}
  await rede('PATCH','salas/'+sala.codigo+'/oculos/'+ID,p);}

/* ---------- engajamento (sinais automáticos) ----------
   ativo  = cabeça se mexendo ou aluno interagindo nos últimos 90 s
   parado = 90 s sem mexer a cabeça e sem interagir (óculos largado na mesa, aluno "desligado")
   menu   = menu do sistema do Quest aberto por cima do app
   tirou  = sessão VR oculta (óculos fora do rosto) ou página em segundo plano
   atencao = % do último minuto com a cabeça voltada para o conteúdo (direção da cabeça; o Quest 3S não rastreia os olhos) */
const PARADO_MS=90000;
const ENG={status:'ativo',ultMov:Date.now(),ultInt:Date.now(),ref:null,amostras:[],interacoes:0,chave:'',novoStatus:true,novaMissao:true,visib:null,sess:null};
function ctxApp(){try{return window.PortalEntrada&&window.PortalEntrada.contexto&&window.PortalEntrada.contexto();}catch(_){return null;}}
function atencao(){if(!emVR()||ENG.amostras.length<20)return null;let s=0;for(const x of ENG.amostras)s+=x;return Math.round(10*s/ENG.amostras.length)*10;}
function interagiu(conta){ENG.ultInt=Date.now();if(conta)ENG.interacoes++;}
let focoC=null,focoT=0,V=null;
/* centro e raio do conteúdo: une as malhas visíveis de tamanho "de objeto" (ignora céu, estrelas, controles e avisos) */
function foco(ctx,T){if(focoC&&Date.now()-focoT<10000)return focoC;focoT=Date.now();
  const fora=new Set([ctx.camera]);try{for(let i=0;i<2;i++){fora.add(ctx.renderer.xr.getController(i));fora.add(ctx.renderer.xr.getControllerGrip(i));}}catch(_){}
  const caixa=new T.Box3(),b=new T.Box3(),esf=new T.Sphere();let n=0;
  const dentro=o=>{for(let x=o;x;x=x.parent)if(fora.has(x))return true;return false;};
  ctx.scene.traverseVisible(o=>{if(!o.isMesh||!o.geometry||o.renderOrder>=9990)return;const g=o.geometry;
    try{if(!g.boundingSphere)g.computeBoundingSphere();if(!g.boundingSphere)return;esf.copy(g.boundingSphere).applyMatrix4(o.matrixWorld);if(!(esf.radius<8)||esf.center.length()>40||dentro(o))return;
      if(!g.boundingBox)g.computeBoundingBox();b.copy(g.boundingBox).applyMatrix4(o.matrixWorld);caixa.union(b);n++;}catch(_){}});
  focoC=n?{c:caixa.getCenter(new T.Vector3()),r:caixa.getSize(new T.Vector3()).length()/2}:null;return focoC;}
function amostrar(){if(!sala)return;const T=window.THREE,ctx=ctxApp(),agoraMs=Date.now();
  if(T&&ctx&&ctx.camera&&ctx.renderer&&ctx.renderer.xr&&ctx.renderer.xr.isPresenting){
    const sess=ctx.renderer.xr.getSession();
    if(sess&&sess!==ENG.sess){ENG.sess=sess;ENG.visib=sess.visibilityState||'visible';ENG.amostras=[];ENG.ref=null;
      sess.addEventListener('select',()=>interagiu(true));sess.addEventListener('squeeze',()=>interagiu(false));
      sess.addEventListener('visibilitychange',()=>{ENG.visib=sess.visibilityState;amostrar();});
      sess.addEventListener('end',()=>{ENG.sess=null;ENG.visib=null;ENG.ultMov=Date.now();amostrar();});}
    if(!V)V={p:new T.Vector3(),q:new T.Quaternion(),s:new T.Vector3(),f:new T.Vector3(),d:new T.Vector3()};
    ctx.camera.matrixWorld.decompose(V.p,V.q,V.s);V.f.set(0,0,-1).applyQuaternion(V.q);
    if(!ENG.ref)ENG.ref={p:V.p.clone(),f:V.f.clone()};
    else if(ENG.ref.p.distanceTo(V.p)>0.04||ENG.ref.f.angleTo(V.f)>0.07){ENG.ref.p.copy(V.p);ENG.ref.f.copy(V.f);ENG.ultMov=agoraMs;}
    if(ENG.visib==='visible'){const fc=foco(ctx,T);if(fc){V.d.copy(fc.c).sub(V.p);const dist=Math.max(V.d.length(),0.3);
      const cone=Math.min(2.6,Math.max(0.6,Math.atan(fc.r/dist)+0.26));ENG.amostras.push(V.f.angleTo(V.d)<cone?1:0);if(ENG.amostras.length>240)ENG.amostras.shift();}}
  }
  const st=(ENG.visib==='hidden'||document.visibilityState==='hidden')?'tirou':ENG.visib==='visible-blurred'?'menu':tocando()?'assistindo':(agoraMs-Math.max(ENG.ultMov,ENG.ultInt)>PARADO_MS?'parado':'ativo');
  if(st==='assistindo')ENG.ultInt=agoraMs; /* ao terminar o vídeo, os 90 s de "parado" contam a partir do fim */
  if(st!==ENG.status){ENG.status=st;ENG.novoStatus=true;enviar(true);}}
/* ---------- vídeo-aula e narração: assistir conta como participação ----------
   Vale para <video>/<audio> e new Audio() com som, sem loop e com mais de 3 s (fica de fora trilha de fundo e vídeo de capa mudo). */
const MID={el:null,max:0,fim:false};
const midiaValida=m=>m&&!m.muted&&!m.loop&&m.volume>0&&isFinite(m.duration)&&m.duration>3;
/* mídia externa (ex.: aula do YouTube no catálogo): a página informa {tipo,nome,estado:()=>({tocando,pos,dur,fim})} */
let EXT=null;const extEstado=()=>{try{return EXT&&EXT.estado();}catch(_){return null;}};
const tocando=()=>{const x=extEstado();if(x&&x.tocando)return true;return !!(MID.el&&!MID.el.paused&&!MID.el.ended);};
function midiaExterna(o){EXT=o||null;MID.extMax=0;MID.extFim=false;MID.extUlt=null;enviar(true);}
function vigiar(m){if(!m||m.__p360)return;m.__p360=1;
  m.addEventListener('playing',()=>{if(!midiaValida(m))return;const src=m.currentSrc||m.src;if(MID.el!==m||MID.src!==src){MID.el=m;MID.src=src;MID.max=0;MID.fim=false;}interagiu(false);amostrar();enviar(true);});
  m.addEventListener('timeupdate',()=>{if(MID.el===m&&m.duration)MID.max=Math.max(MID.max,m.currentTime/m.duration);});
  m.addEventListener('ended',()=>{if(MID.el===m){MID.max=1;MID.fim=true;interagiu(false);amostrar();enviar(true);}});
  m.addEventListener('pause',()=>{if(MID.el===m){interagiu(false);amostrar();enviar(true);}});}
try{const _play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){try{vigiar(this);}catch(_){}return _play.apply(this,arguments);};}catch(_){}
document.addEventListener('play',e=>{if(e.target instanceof HTMLMediaElement)vigiar(e.target);},true);
function midia(){if(EXT){let x=extEstado();if(x&&x.dur>0)MID.extUlt=x;else x=MID.extUlt;
    if(x&&x.dur>0){if(x.fim)MID.extFim=true;MID.extMax=MID.extFim?1:Math.max(MID.extMax||0,(x.pos||0)/x.dur);
      return{tipo:EXT.tipo||'video',nome:EXT.nome||'',tocando:!!x.tocando,pos:Math.floor((x.pos||0)/5)*5,dur:Math.round(x.dur),visto:Math.round(MID.extMax*10)*10,fim:MID.extFim};}}
  const m=MID.el;if(!m)return null;let nome='';try{nome=decodeURIComponent((m.currentSrc||m.src||'').split('?')[0].split('/').pop()).replace(/\.[a-z0-9]+$/i,'');}catch(_){}
  return{tipo:m.tagName==='VIDEO'?'video':'audio',nome,tocando:tocando(),pos:Math.floor((m.currentTime||0)/5)*5,dur:Math.round(m.duration||0),visto:Math.round(MID.max*10)*10,fim:MID.fim};}
['pointerdown','keydown','wheel'].forEach(t=>addEventListener(t,()=>interagiu(t==='pointerdown'),{capture:true,passive:true}));
addEventListener('pointermove',()=>{ENG.ultInt=Date.now();},{passive:true});
document.addEventListener('visibilitychange',()=>amostrar());
async function enviarMapa(){if(!sala||!A.ok())return;const m=A.mapa();if(m)await rede('PUT','salas/'+sala.codigo+'/mapas/'+APP,{nome:APPS[APP],secoes:m});}

/* ---------- comandos ---------- */
const CMD_ULT='portal360_sala_ultimo_cmd';
function executar(c){
  if(!c||!c.id||!sala)return;if(SS.get(CMD_ULT)===c.id)return;
  if(c.alvo&&c.alvo!=='todos'&&c.alvo!==ID)return;
  if(c.t&&Math.abs(Date.now()-c.t)>120000)return; /* comando antigo: ignorado (margem larga para relógios diferentes) */
  SS.set(CMD_ULT,c.id);
  if(c.tipo==='video'){if(c.yt)abrirYouTube(c.yt,c.titulo);else abrirVideo(c.src,c.titulo);return;}
  if(c.tipo==='video-pausa'){if(telao)telao.v.pause();return;}
  if(c.tipo==='video-play'){if(telao)tocarVideo();return;}
  if(c.tipo==='video-fim'){fecharVideo();return;}
  if(c.tipo==='pausa'){if(telao)telao.v.pause();aviso('⏸ Olhe para o professor','A atividade foi pausada.',true);return;}
  if(c.tipo==='retomar'){fecharAviso();if(telao)tocarVideo();return;}
  if(c.tipo==='chamar'){aviso(sala.rotulo.toUpperCase(),'O professor está procurando este óculos.',false,5000);return;}
  if(c.tipo==='encerrar'){fecharAviso();aviso('Aula encerrada','Obrigado! Pode tirar o óculos.',false,6000);sair(true);return;}
  if(c.tipo==='ir'){fecharAviso();fecharVideo();
    if(c.app==='catalogo'){if(APP!=='catalogo')location.href=BASE;return;}
    if(c.app&&c.app!==APP&&PASTA[c.app]){SS.set('portal360_prof_abriu',APPS[c.app]||'1');SS.set('portal360_estava_vr',emVR()?'1':'0');}
    if(c.app&&c.app!==APP&&PASTA[c.app]){SS.set('portal360_irpara',JSON.stringify({sec:c.sec||'',view:c.view||''}));location.href=BASE+'apps/'+PASTA[c.app]+'/?vr=1';return;}
    fecharBoasVindas();try{if(A.ok())A.ir(c.sec,c.view);}catch(e){console.warn('Sala: não consegui ir para a missão',e);}setTimeout(()=>enviar(true),600);}
}
/* ---------- chegou ao app por ordem do professor: entrar no VR com o mínimo de toques ----------
   1) Se o aluno já estava em VR, o Quest Browser concede a sessão à página nova (evento "sessiongranted",
      navegação WebXR): entramos sozinhos, sem toque.
   2) Se não (vinha do catálogo em 2D), o navegador exige um toque: a tela de entrada inteira vira o botão. */
let xrConcedido=false;const concedido=()=>xrConcedido||!!window.__xrConcedido;
try{if(navigator.xr&&navigator.xr.addEventListener)navigator.xr.addEventListener('sessiongranted',()=>{xrConcedido=true;});}catch(_){}
let diagVR=null; /* para o painel: como foi a entrada no VR depois da troca de app */
function chegadaPeloProfessor(){const nome=SS.get('portal360_prof_abriu');if(!nome||APP==='catalogo')return;SS.del('portal360_prof_abriu');const estava=SS.get('portal360_estava_vr')==='1';SS.del('portal360_estava_vr');
  let n=0;const t=setInterval(()=>{const g=document.getElementById('vrGate'),bt=g&&g.querySelector('[data-action="vr-entrar"]');
    if(!bt){if(++n>60)clearInterval(t);return;}clearInterval(t);
    if(concedido()){diagVR='auto';bt.click();enviar(true);return;}
    diagVR=estava?'toque-sem-concessao':'toque-vinha-2d';enviar(true);
    g.classList.add('p360s-gate');const sub=g.querySelector('.vrgate-s');if(sub)sub.textContent='O professor abriu esta atividade · toque em qualquer lugar para entrar';
    g.addEventListener('click',e=>{if(!e.target.closest('button'))bt.click();});
    /* o evento pode chegar depois da tela montada */
    const t2=setInterval(()=>{if(!document.body.contains(g)){clearInterval(t2);return;}if(concedido()){clearInterval(t2);diagVR='auto';bt.click();enviar(true);}},200);setTimeout(()=>clearInterval(t2),8000);},250);}
/* a turma chega direto na missão: fecha a boas-vindas (marcando como vista) */
function fecharBoasVindas(){try{const w=document.getElementById('welcomeDialog');if(w&&w.open){w.close();const L=window.CorpoLab||window.TerraLab||window.DNALab;if(L&&L.state){L.state.welcomed=true;}}}catch(_){}}
function ouvirComandos(){
  if(!sala||!DB())return;pararComandos();
  const caminho='salas/'+sala.codigo+'/comando';
  try{es=new EventSource(url(caminho));
    es.addEventListener('put',ev=>{try{const d=JSON.parse(ev.data);if(d.path==='/')executar(d.data);}catch(_){}});
    es.addEventListener('patch',ev=>{rede('GET',caminho).then(executar);});
    es.onerror=()=>{/* sem streaming (rede bloqueia): cai para consulta periódica */if(es&&es.readyState===2){es=null;if(!poll)poll=setInterval(()=>rede('GET',caminho).then(executar),3000);}};
  }catch(_){poll=setInterval(()=>rede('GET',caminho).then(executar),3000);}
}
function pararComandos(){if(es){try{es.close();}catch(_){}es=null;}if(poll){clearInterval(poll);poll=0;}}
function iniciar(){if(ligado||!sala||!DB())return;ligado=true;
  /* chegou por um comando "ir" vindo de outro app: completa a navegação quando o app estiver pronto */
  const ir=SS.get('portal360_irpara');if(ir){SS.del('portal360_irpara');let tent=0;const t=setInterval(()=>{if(A.ok()||++tent>40){clearInterval(t);try{const o=JSON.parse(ir);fecharBoasVindas();if(A.ok())A.ir(o.sec,o.view);setTimeout(fecharBoasVindas,400);}catch(_){}}},250);}
  let tent=0;const esperar=setInterval(()=>{if(A.ok()||++tent>40){clearInterval(esperar);enviarMapa();}},250);
  enviar(true);setInterval(()=>enviar(false),1500);setInterval(amostrar,250);ouvirComandos();chip();}
async function entrar(codigo,rotulo){sala={codigo,rotulo};LS.set('portal360_sala',JSON.stringify(sala));ligado=false;iniciar();chip();}
async function sair(silencioso){if(sala){await rede('DELETE','salas/'+sala.codigo+'/oculos/'+ID);}pararComandos();sala=null;LS.del('portal360_sala');ligado=false;chip();if(!silencioso)fecharDialogo();}
addEventListener('pagehide',()=>{if(sala&&DB()){try{fetch(url('salas/'+sala.codigo+'/oculos/'+ID),{method:'PATCH',body:JSON.stringify({saindo:true,visto:{'.sv':'timestamp'}}),keepalive:true});}catch(_){}}});

/* ---------- avisos (no VR: véu à frente dos olhos; no 3D: tela cheia) ---------- */
let avisoAtual=null;
function aviso(titulo,sub,fixo,ms){fecharAviso();
  const T=window.THREE,ctx=window.PortalEntrada&&window.PortalEntrada.contexto&&window.PortalEntrada.contexto();
  const xr=ctx&&ctx.renderer&&ctx.renderer.xr&&ctx.renderer.xr.isPresenting&&T;
  const fim=[];
  if(xr){const {renderer,scene,camera}=ctx;const g=new T.Group();
    const veu=new T.Mesh(new T.SphereGeometry(2.5,32,20),new T.MeshBasicMaterial({color:0x020812,side:T.BackSide,transparent:true,opacity:.93,depthTest:false,depthWrite:false}));veu.renderOrder=9995;g.add(veu);
    const c=document.createElement('canvas');c.width=1024;c.height=384;const x=c.getContext('2d');x.textAlign='center';x.fillStyle='#ffffff';x.font='800 92px system-ui,Segoe UI,Arial';x.fillText(titulo,512,170);x.fillStyle='#9fdcff';x.font='500 44px system-ui,Segoe UI,Arial';x.fillText(sub,512,270);
    const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;const placa=new T.Mesh(new T.PlaneGeometry(1.6,.6),new T.MeshBasicMaterial({map:tx,transparent:true,depthTest:false,depthWrite:false}));placa.renderOrder=9996;placa.position.set(0,0,-1.5);g.add(placa);
    scene.add(g);const p=new T.Vector3(),qq=new T.Quaternion(),s=new T.Vector3();let vivo=true;const sess=renderer.xr.getSession();
    const quadro=()=>{if(!vivo)return;camera.matrixWorld.decompose(p,qq,s);g.position.copy(p);g.quaternion.copy(qq);sess.requestAnimationFrame(quadro);};sess.requestAnimationFrame(quadro);
    fim.push(()=>{vivo=false;scene.remove(g);veu.geometry.dispose();veu.material.dispose();placa.geometry.dispose();placa.material.dispose();tx.dispose();});}
  /* <dialog> modal: fica acima até de outros diálogos modais do app (ex.: boas-vindas) */const modal=typeof HTMLDialogElement==='function';const d=document.createElement(modal?'dialog':'div');d.className='p360s-aviso';d.innerHTML='<div><b></b><span></span></div>';d.querySelector('b').textContent=titulo;d.querySelector('span').textContent=sub;document.body.appendChild(d);if(modal){try{d.showModal();}catch(_){d.setAttribute('open','');}d.addEventListener('cancel',e=>{if(fixo)e.preventDefault();});}fim.push(()=>{try{if(d.open&&d.close)d.close();}catch(_){}d.remove();});
  const t=ms?setTimeout(fecharAviso,ms):0;avisoAtual={fim,t};}
function fecharAviso(){if(!avisoAtual)return;clearTimeout(avisoAtual.t);avisoAtual.fim.forEach(f=>{try{f();}catch(_){}});avisoAtual=null;}

/* ---------- vídeo-aula conduzida pelo professor ----------
   No VR: telão fixo no espaço, à frente de onde o aluno olhava (não acompanha a cabeça, para não enjoar), com a cena escurecida.
   Fora do VR: tela cheia. Só aceita MP4 hospedado no próprio Portal (caminho relativo). Conta no painel como "Assistindo". */
let telao=null;
const srcValido=s=>typeof s==='string'&&/^[\w\-/.]+\.mp4$/i.test(s)&&!s.includes('..')&&!s.startsWith('/');
function tocarVideo(){if(!telao)return;const v=telao.v;const pr=v.play();if(pr&&pr.catch)pr.catch(()=>{telao.precisaToque=true;});}
function abrirVideo(src,titulo){if(!srcValido(src))return;fecharVideo();fecharAviso();fecharBoasVindas();
  const v=document.createElement('video');v.src=BASE+src;v.playsInline=true;v.setAttribute('playsinline','');v.preload='auto';v.crossOrigin='anonymous';
  const T=window.THREE,ctx=ctxApp(),xr=!!(T&&ctx&&ctx.renderer&&ctx.renderer.xr&&ctx.renderer.xr.isPresenting);const fim=[];
  if(xr){const {renderer,scene,camera}=ctx;const g=new T.Group();
    const p=new T.Vector3(),q=new T.Quaternion(),sc=new T.Vector3();camera.matrixWorld.decompose(p,q,sc);
    const f=new T.Vector3(0,0,-1).applyQuaternion(q);f.y=0;if(f.lengthSq()<1e-4)f.set(0,0,-1);f.normalize();
    g.position.copy(p);g.rotation.y=Math.atan2(-f.x,-f.z);
    const veu=new T.Mesh(new T.SphereGeometry(8,32,20),new T.MeshBasicMaterial({color:0x02060e,side:T.BackSide,transparent:true,opacity:.9,depthTest:false,depthWrite:false}));veu.renderOrder=9990;
    const tex=new T.VideoTexture(v);tex.encoding=T.sRGBEncoding;tex.minFilter=T.LinearFilter;tex.generateMipmaps=false;
    const mat=new T.MeshBasicMaterial({map:tex,depthTest:false,depthWrite:false});mat.toneMapped=false;
    const tela=new T.Mesh(new T.PlaneGeometry(3.2,1.8),mat);tela.position.set(0,0,-2.6);tela.renderOrder=9992;
    const moldura=new T.Mesh(new T.PlaneGeometry(3.32,1.92),new T.MeshBasicMaterial({color:0x37b1da,transparent:true,opacity:.35,depthTest:false,depthWrite:false}));moldura.position.set(0,0,-2.62);moldura.renderOrder=9991;
    const c=document.createElement('canvas');c.width=1024;c.height=128;const x=c.getContext('2d');x.textAlign='center';x.fillStyle='#9fdcff';x.font='700 54px system-ui,Segoe UI,Arial';x.fillText(String(titulo||'Vídeo-aula').slice(0,48),512,80);
    const tt=new T.CanvasTexture(c);tt.encoding=T.sRGBEncoding;const titu=new T.Mesh(new T.PlaneGeometry(2.4,.3),new T.MeshBasicMaterial({map:tt,transparent:true,depthTest:false,depthWrite:false}));titu.position.set(0,1.15,-2.6);titu.renderOrder=9992;
    g.add(veu,moldura,tela,titu);scene.add(g);
    /* se o navegador bloquear o som sem toque: o primeiro gatilho do controle dá o play */
    const sess=renderer.xr.getSession();const toque=()=>{if(telao&&telao.v===v&&v.paused&&telao.precisaToque){telao.precisaToque=false;tocarVideo();}};if(sess)sess.addEventListener('select',toque);
    fim.push(()=>{if(sess)sess.removeEventListener('select',toque);scene.remove(g);[veu,moldura,tela,titu].forEach(m=>{m.geometry.dispose();m.material.dispose();});tex.dispose();tt.dispose();});}
  else{const modal=typeof HTMLDialogElement==='function';const d=document.createElement(modal?'dialog':'div');d.className='p360s-aviso p360s-video';d.appendChild(v);document.body.appendChild(d);
    if(modal){try{d.showModal();}catch(_){d.setAttribute('open','');}d.addEventListener('cancel',e=>e.preventDefault());}
    const toque=()=>{if(telao&&telao.v===v&&v.paused&&telao.precisaToque){telao.precisaToque=false;tocarVideo();}};d.addEventListener('click',toque);
    fim.push(()=>{try{if(d.open&&d.close)d.close();}catch(_){}d.remove();});}
  v.addEventListener('ended',()=>setTimeout(()=>{if(telao&&telao.v===v)fecharVideo();},1500));
  telao={v,fim,precisaToque:false};tocarVideo();}
/* Aula no YouTube: o YouTube não toca dentro do VR. O óculos sai do VR, mostra a aula em tela cheia
   (acompanhada pela API do YouTube: assistindo, minuto, fim) e, ao terminar, oferece "Toque para voltar ao VR" (1 toque). */
const ytValido=id=>typeof id==='string'&&/^[\w-]{11}$/.test(id);
function ytApi(cb){if(window.YT&&YT.Player)return cb();const antes=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=function(){if(antes)try{antes();}catch(_){}cb();};
  if(!document.getElementById('ytApi')){const sc=document.createElement('script');sc.id='ytApi';sc.src='https://www.youtube.com/iframe_api';document.head.appendChild(sc);}}
async function abrirYouTube(id,titulo){if(!ytValido(id))return;fecharVideo();fecharAviso();fecharBoasVindas();
  const ctx=ctxApp();let estavaVR=false;
  try{if(ctx&&ctx.renderer&&ctx.renderer.xr&&ctx.renderer.xr.isPresenting){estavaVR=true;await ctx.renderer.xr.getSession().end();}}catch(_){}
  const modal=typeof HTMLDialogElement==='function';const d=document.createElement(modal?'dialog':'div');d.className='p360s-aviso p360s-yt';
  d.innerHTML='<div class="p360s-yt-box"><div class="p360s-yt-top"><b></b><button type="button" data-action="p360s-yt-fechar">✕ Fechar</button></div><div class="p360s-yt-frame"><iframe id="p360sYT" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div></div>';
  d.querySelector('b').textContent=titulo||'Aula';const fr=d.querySelector('iframe');fr.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1&playsinline=1&hl=pt-BR&enablejsapi=1&origin='+encodeURIComponent(location.origin);
  document.body.appendChild(d);if(modal){try{d.showModal();}catch(_){d.setAttribute('open','');}d.addEventListener('cancel',e=>e.preventDefault());}
  let player=null,ytFim=false;
  const ctrl={pause(){try{player&&player.pauseVideo();}catch(_){}},play(){try{player&&player.playVideo();}catch(_){}return Promise.resolve();},paused:false};
  const est=()=>{if(!player||!player.getPlayerState)return null;const st=player.getPlayerState();return{tocando:st===1||st===3,pos:player.getCurrentTime(),dur:player.getDuration(),fim:ytFim||st===0};};
  ytApi(()=>{try{player=new YT.Player(fr,{events:{onStateChange:e=>{if(e.data===0){ytFim=true;setTimeout(()=>{if(telao&&telao.v===ctrl)fecharVideo();},1500);}}}});}catch(_){player=null;}
    midiaExterna({tipo:'video',nome:titulo||'Aula',estado:est});});
  telao={v:ctrl,precisaToque:false,fim:[()=>{let ult=null;try{ult=est();}catch(_){}if(ult&&ult.dur)midiaExterna({tipo:'video',nome:titulo||'Aula',estado:()=>Object.assign({},ult,{tocando:false})});
    try{if(d.open&&d.close)d.close();}catch(_){}d.remove();if(estavaVR)voltarAoVR();}]};}
function voltarAoVR(){if(typeof window.alternarVR!=='function')return;const modal=typeof HTMLDialogElement==='function';const d=document.createElement(modal?'dialog':'div');d.className='p360s-aviso p360s-voltar';
  d.innerHTML='<div><b>🥽 Voltar ao VR</b><span>Toque em qualquer lugar para continuar a aula</span></div>';document.body.appendChild(d);if(modal){try{d.showModal();}catch(_){d.setAttribute('open','');}}
  d.addEventListener('click',()=>{try{if(d.open&&d.close)d.close();}catch(_){}d.remove();try{const r=window.alternarVR('vr');if(r&&r.catch)r.catch(()=>{});}catch(_){}});}
function fecharVideo(){if(!telao)return;const t=telao;telao=null;try{t.v.pause();}catch(_){}t.fim.forEach(f=>{try{f();}catch(_){}});try{t.v.removeAttribute('src');t.v.load();}catch(_){}}

/* ---------- interface 2D: chip e diálogo de entrada ---------- */
function estilo(){if(document.getElementById('p360s-css'))return;const s=document.createElement('style');s.id='p360s-css';s.textContent=
 '.p360s-chip{position:fixed;left:14px;bottom:14px;z-index:2147483000;border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:9px 15px;background:rgba(15,44,74,.92);color:#fff;font:700 14px system-ui,Segoe UI,Arial;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.35)}'+
 '.p360s-chip i{display:inline-block;width:9px;height:9px;border-radius:50%;background:#3ddc84;margin-right:7px;vertical-align:1px}.p360s-chip.off i{background:#ffb347}'+
 '.p360s-dlg{position:fixed;inset:0;z-index:2147483100;background:rgba(2,8,18,.72);display:flex;align-items:center;justify-content:center;font-family:system-ui,Segoe UI,Arial}'+
 '.p360s-box{background:#0f2c4a;color:#fff;border:1px solid rgba(55,177,218,.5);border-radius:18px;padding:24px;width:min(420px,92vw);box-shadow:0 20px 60px rgba(0,0,0,.5)}'+
 '.p360s-box h3{margin:0 0 6px;font-size:22px}.p360s-box p{margin:0 0 14px;color:#b9d3e6;font-size:14px;line-height:1.45}.p360s-box label{display:block;font-size:13px;color:#9fdcff;margin:10px 0 4px}'+
 '.p360s-box input,.p360s-box select{width:100%;box-sizing:border-box;font:700 28px system-ui;letter-spacing:.3em;text-align:center;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.25);background:#081d33;color:#fff}.p360s-box select{font-size:20px;letter-spacing:0}'+
 '.p360s-box .acoes{display:flex;gap:10px;margin-top:18px}.p360s-box button{flex:1;padding:13px;border-radius:12px;border:0;font:700 16px system-ui;cursor:pointer;background:rgba(255,255,255,.1);color:#fff}.p360s-box button.pri{background:#1a6b2a}.p360s-box button.perigo{background:#7a2a1a}.p360s-box .erro{color:#ffb4a0;font-size:13px;min-height:18px;margin-top:8px}'+
 '.p360s-gate{cursor:pointer}.p360s-gate .vrgate-s{color:#8ff0b8!important;font-size:18px!important;font-weight:700}.p360s-gate [data-action="vr-entrar"]{font-size:24px!important;padding:20px 44px!important;animation:p360pulse 1.6s ease-in-out infinite}@keyframes p360pulse{50%{box-shadow:0 0 0 14px rgba(61,220,132,.25)}}'+
 '.p360s-yt-top b{display:inline!important;font-size:18px!important;font-weight:700!important}.p360s-yt-box{width:min(96vw,calc((100vh - 80px)*1.7778));display:flex;flex-direction:column;gap:10px}.p360s-yt-top{display:flex;align-items:center;justify-content:space-between;color:#fff;font:700 18px system-ui}.p360s-yt-top button{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:10px;padding:8px 14px;font:700 14px system-ui;cursor:pointer}.p360s-yt-frame{position:relative;width:100%;aspect-ratio:16/9;background:#000}.p360s-yt-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}.p360s-voltar{cursor:pointer}'+
 '.p360s-video video{width:min(100vw,177vh);height:auto;max-height:100vh;background:#000}'+
 '.p360s-aviso{position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:2147483200;background:rgba(2,8,18,.94);display:flex;align-items:center;justify-content:center;text-align:center;font-family:system-ui,Segoe UI,Arial}.p360s-aviso::backdrop{background:transparent}.p360s-aviso b{display:block;color:#fff;font-size:clamp(34px,7vw,80px);font-weight:800}.p360s-aviso span{display:block;color:#9fdcff;font-size:clamp(16px,2.6vw,26px);margin-top:12px}';
 document.head.appendChild(s);}
let chipEl=null;
function chip(){if(!document.body)return;estilo();if(!DB()){if(chipEl){chipEl.remove();chipEl=null;}return;}
  if(!chipEl){chipEl=document.createElement('button');chipEl.type='button';chipEl.className='p360s-chip';chipEl.dataset.action='p360s-abrir';document.body.appendChild(chipEl);}
  chipEl.className='p360s-chip'+(sala?'':' off');chipEl.innerHTML='<i></i>'+(sala?'Sala '+sala.codigo+' · '+escapar(sala.rotulo):'🎓 Entrar na sala');}
const escapar=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let dlg=null;
function abrirDialogo(){fecharDialogo();estilo();dlg=document.createElement('div');dlg.className='p360s-dlg';dlg.dataset.action='p360s-fora';
  const num=(sala&&sala.rotulo||'').replace(/\D/g,'')||LS.get('portal360_oculos_num')||'';
  dlg.innerHTML=sala?'<div class="p360s-box"><h3>🎓 Sala '+sala.codigo+'</h3><p>Este é o <b>'+escapar(sala.rotulo)+'</b>. O professor acompanha a atividade e pode levar a turma para uma missão.</p><div class="acoes"><button type="button" data-action="p360s-fechar">Fechar</button><button type="button" class="perigo" data-action="p360s-sair">Sair da sala</button></div></div>'
   :'<div class="p360s-box"><h3>🎓 Entrar na sala do professor</h3><p>Digite o código de 4 números que aparece no painel do professor, na lousa.</p><label>Código da sala</label><input id="p360s-cod" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="0000"><label>Número deste óculos</label><select id="p360s-num">'+Array.from({length:40},(_,i)=>'<option value="'+(i+1)+'"'+(String(i+1)===num?' selected':'')+'>Óculos '+(i+1)+'</option>').join('')+'</select><div class="erro" id="p360s-erro"></div><div class="acoes"><button type="button" data-action="p360s-fechar">Cancelar</button><button type="button" class="pri" data-action="p360s-entrar">Entrar</button></div></div>';
  document.body.appendChild(dlg);const i=dlg.querySelector('#p360s-cod');if(i)setTimeout(()=>i.focus(),50);}
function fecharDialogo(){if(dlg){dlg.remove();dlg=null;}}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-action^="p360s-"]');if(!b)return;const ac=b.dataset.action;
  if(ac==='p360s-abrir')abrirDialogo();else if(ac==='p360s-fechar'||(ac==='p360s-fora'&&e.target===b))fecharDialogo();else if(ac==='p360s-sair')sair();
  else if(ac==='p360s-yt-fechar'){fecharVideo();}
  else if(ac==='p360s-entrar'){const cod=(dlg.querySelector('#p360s-cod').value||'').replace(/\D/g,''),num=dlg.querySelector('#p360s-num').value,er=dlg.querySelector('#p360s-erro');
    if(cod.length!==4){er.textContent='O código tem 4 números.';return;}
    er.textContent='Procurando a sala…';const s=await rede('GET','salas/'+cod+'/aberta');if(s!==true){er.textContent='Sala '+cod+' não encontrada. Confira o código na lousa.';return;}
    /* número já usado por outro óculos ativo nesta sala? sugere o próximo livre */
    const oc=await rede('GET','salas/'+cod+'/oculos')||{};const ativo=o=>o&&!o.saindo&&typeof o.visto==='number'&&Math.abs(Date.now()-o.visto)<60000;
    const usados=new Set(Object.entries(oc).filter(([id,o])=>id!==ID&&ativo(o)).map(([,o])=>String(o.rotulo||'').replace(/\D/g,'')));
    if(usados.has(num)){let n=1;while(usados.has(String(n))&&n<40)n++;const sel=dlg.querySelector('#p360s-num');sel.value=String(n);er.textContent='O Óculos '+num+' já está nesta sala. Sugeri o Óculos '+n+': confira a etiqueta e toque em Entrar.';return;}
    LS.set('portal360_oculos_num',num);await entrar(cod,'Óculos '+num);fecharDialogo();}
},true);
document.addEventListener('keydown',e=>{if(dlg&&e.key==='Enter'){const b=dlg.querySelector('[data-action="p360s-entrar"]');if(b)b.click();}});

window.Portal360Sala={versao:VERSAO,get sala(){return sala;},id:ID,app:APP,entrar,sair,abrir:abrirDialogo,estado:pacote,midiaExterna,_executar:executar};
const pronto=()=>{chip();if(sala)iniciar();chegadaPeloProfessor();};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',pronto);else pronto();
})();
