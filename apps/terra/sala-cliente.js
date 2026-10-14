/* Sala do professor · cliente dos óculos (Portal 360º VR · Portal do Educador) v1.0.0 (out/2026)
   Roda no catálogo e em cada app. O óculos entra numa sala (código de 4 dígitos), informa a cada poucos segundos
   o que o aluno está fazendo (app, sistema/tema, missão, progresso, Desafio, se está no VR, bateria) e obedece aos
   comandos do professor: levar para uma missão, pausar/retomar, chamar (identificar o óculos) e encerrar.
   Transporte: API REST do Firebase Realtime Database (fetch + EventSource), sem SDK.
   Entrar na sala: botão "🎓 Sala" no canto da tela (fora do VR) ou link com ?sala=1234&oculos=3 (útil no modo quiosque).
   Arquivo-mestre: assets/sala/sala-cliente.js (cópia idêntica em cada apps/<app>/). Regra 9: sem onclick inline. */
(function(){'use strict';
if(window.Portal360Sala)return;
const VERSAO='1.0.1';
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
function pacote(){let e={};try{if(A.ok())e=A.estado();}catch(_){e={};}return Object.assign({rotulo:sala.rotulo,app:APP,appNome:APPS[APP],emVR:emVR(),bateria,saindo:false,versao:VERSAO},e);}
async function enviar(forcar){if(!sala)return;const p=pacote();const sig=JSON.stringify(p);if(!forcar&&sig===ultimoEnvio&&Date.now()-hb<5000)return;ultimoEnvio=sig;hb=Date.now();p.visto={'.sv':'timestamp'};await rede('PATCH','salas/'+sala.codigo+'/oculos/'+ID,p);}
async function enviarMapa(){if(!sala||!A.ok())return;const m=A.mapa();if(m)await rede('PUT','salas/'+sala.codigo+'/mapas/'+APP,{nome:APPS[APP],secoes:m});}

/* ---------- comandos ---------- */
const CMD_ULT='portal360_sala_ultimo_cmd';
function executar(c){
  if(!c||!c.id||!sala)return;if(SS.get(CMD_ULT)===c.id)return;
  if(c.alvo&&c.alvo!=='todos'&&c.alvo!==ID)return;
  if(c.t&&Math.abs(Date.now()-c.t)>120000)return; /* comando antigo: ignorado (margem larga para relógios diferentes) */
  SS.set(CMD_ULT,c.id);
  if(c.tipo==='pausa'){aviso('⏸ Olhe para o professor','A atividade foi pausada.',true);return;}
  if(c.tipo==='retomar'){fecharAviso();return;}
  if(c.tipo==='chamar'){aviso(sala.rotulo.toUpperCase(),'O professor está procurando este óculos.',false,5000);return;}
  if(c.tipo==='encerrar'){fecharAviso();aviso('Aula encerrada','Obrigado! Pode tirar o óculos.',false,6000);sair(true);return;}
  if(c.tipo==='ir'){fecharAviso();
    if(c.app&&c.app!==APP&&PASTA[c.app]){SS.set('portal360_irpara',JSON.stringify({sec:c.sec||'',view:c.view||''}));location.href=BASE+'apps/'+PASTA[c.app]+'/?vr=1';return;}
    fecharBoasVindas();try{if(A.ok())A.ir(c.sec,c.view);}catch(e){console.warn('Sala: não consegui ir para a missão',e);}setTimeout(()=>enviar(true),600);}
}
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
  enviar(true);setInterval(()=>enviar(false),1500);ouvirComandos();chip();}
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

/* ---------- interface 2D: chip e diálogo de entrada ---------- */
function estilo(){if(document.getElementById('p360s-css'))return;const s=document.createElement('style');s.id='p360s-css';s.textContent=
 '.p360s-chip{position:fixed;left:14px;bottom:14px;z-index:2147483000;border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:9px 15px;background:rgba(15,44,74,.92);color:#fff;font:700 14px system-ui,Segoe UI,Arial;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.35)}'+
 '.p360s-chip i{display:inline-block;width:9px;height:9px;border-radius:50%;background:#3ddc84;margin-right:7px;vertical-align:1px}.p360s-chip.off i{background:#ffb347}'+
 '.p360s-dlg{position:fixed;inset:0;z-index:2147483100;background:rgba(2,8,18,.72);display:flex;align-items:center;justify-content:center;font-family:system-ui,Segoe UI,Arial}'+
 '.p360s-box{background:#0f2c4a;color:#fff;border:1px solid rgba(55,177,218,.5);border-radius:18px;padding:24px;width:min(420px,92vw);box-shadow:0 20px 60px rgba(0,0,0,.5)}'+
 '.p360s-box h3{margin:0 0 6px;font-size:22px}.p360s-box p{margin:0 0 14px;color:#b9d3e6;font-size:14px;line-height:1.45}.p360s-box label{display:block;font-size:13px;color:#9fdcff;margin:10px 0 4px}'+
 '.p360s-box input,.p360s-box select{width:100%;box-sizing:border-box;font:700 28px system-ui;letter-spacing:.3em;text-align:center;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.25);background:#081d33;color:#fff}.p360s-box select{font-size:20px;letter-spacing:0}'+
 '.p360s-box .acoes{display:flex;gap:10px;margin-top:18px}.p360s-box button{flex:1;padding:13px;border-radius:12px;border:0;font:700 16px system-ui;cursor:pointer;background:rgba(255,255,255,.1);color:#fff}.p360s-box button.pri{background:#1a6b2a}.p360s-box button.perigo{background:#7a2a1a}.p360s-box .erro{color:#ffb4a0;font-size:13px;min-height:18px;margin-top:8px}'+
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
  else if(ac==='p360s-entrar'){const cod=(dlg.querySelector('#p360s-cod').value||'').replace(/\D/g,''),num=dlg.querySelector('#p360s-num').value,er=dlg.querySelector('#p360s-erro');
    if(cod.length!==4){er.textContent='O código tem 4 números.';return;}
    er.textContent='Procurando a sala…';const s=await rede('GET','salas/'+cod+'/aberta');if(s!==true){er.textContent='Sala '+cod+' não encontrada. Confira o código na lousa.';return;}
    LS.set('portal360_oculos_num',num);await entrar(cod,'Óculos '+num);fecharDialogo();}
},true);
document.addEventListener('keydown',e=>{if(dlg&&e.key==='Enter'){const b=dlg.querySelector('[data-action="p360s-entrar"]');if(b)b.click();}});

window.Portal360Sala={versao:VERSAO,get sala(){return sala;},id:ID,app:APP,entrar,sair,abrir:abrirDialogo,estado:pacote,_executar:executar};
const pronto=()=>{chip();if(sala)iniciar();};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',pronto);else pronto();
})();
