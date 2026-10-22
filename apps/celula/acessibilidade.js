/* Portal 360º VR · Acessibilidade (v1.0, out/2026) · modo inclusivo, fase 1
   Um botão "♿ Acessibilidade" em todos os apps abre um painel com 4 chaves:
   · Legendas: o texto da narração aparece na tela (alunos surdos ou com dificuldade auditiva).
   · Modo calmo: sem música, sem giro automático, sem animações de interface e sem efeitos de ambiente (TEA, sensibilidade sensorial).
   · Alto contraste: fundo preto, texto branco e botões com borda amarela (baixa visão).
   · Fonte ampliada: textos dos painéis cerca de 25% maiores.
   A escolha fica guardada no aparelho e vale para todo o catálogo. Link pronto: ?acess=legendas,calmo,contraste,fonte (ou ?acess=0 para limpar).
   Usa os controles que cada app já tem (Ajustes): não reescreve os apps.
   Fonte única: tools/acessibilidade.js (copiado para cada app). Regra 9: sem onclick inline. */
(function(){'use strict';
if(window.Portal360Acess)return;
const VERSAO='1.0.0',CHAVE='p360_acess';
const LS={get:k=>{try{return localStorage.getItem(k);}catch(_){return null;}},set:(k,v)=>{try{localStorage.setItem(k,v);}catch(_){}}};
const OPCOES=[
 {id:'legendas',icone:'💬',titulo:'Legendas',texto:'O texto da narração aparece na tela.'},
 {id:'calmo',icone:'🌙',titulo:'Modo calmo',texto:'Sem música, sem giro automático e sem animações. Para quem se incomoda com estímulos.'},
 {id:'contraste',icone:'◐',titulo:'Alto contraste',texto:'Fundo preto, texto branco e botões com borda amarela.'},
 {id:'fonte',icone:'🔠',titulo:'Fonte ampliada',texto:'Textos dos painéis maiores.'}];
let pref={};try{pref=JSON.parse(LS.get(CHAVE)||'{}')||{};}catch(_){pref={};}
const q=new URLSearchParams(location.search);
if(q.has('acess')){const v=q.get('acess');pref={};if(v&&v!=='0')v.split(',').forEach(k=>{if(OPCOES.some(o=>o.id===k.trim()))pref[k.trim()]=true;});LS.set(CHAVE,JSON.stringify(pref));}
const salvar=()=>LS.set(CHAVE,JSON.stringify(pref));

/* ---------- estilos ---------- */
function estilos(){if(document.getElementById('p360a-css'))return;const s=document.createElement('style');s.id='p360a-css';s.textContent=`
#p360aBtn{position:fixed;left:14px;bottom:14px;z-index:2147483000;display:inline-flex;align-items:center;gap:6px;font:700 13px/1 system-ui,Segoe UI,Arial,sans-serif;color:#fff;background:#14324d;border:2px solid #5fd0ff;border-radius:999px;padding:8px 12px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.35)}
#p360aBtn:hover,#p360aBtn:focus-visible{background:#1d4a70;outline:3px solid #ffd400;outline-offset:2px}
#p360aBtn .n{background:#ffd400;color:#000;border-radius:999px;padding:2px 7px;font-size:11px}
#p360aDlg{position:fixed;inset:0;z-index:2147483001;display:flex;align-items:center;justify-content:center;background:rgba(2,8,16,.72);padding:16px}
#p360aDlg[hidden]{display:none}
#p360aDlg .cx{width:min(520px,100%);max-height:92dvh;overflow:auto;background:#0d2238;color:#eef7ff;border:2px solid #5fd0ff;border-radius:20px;padding:20px 20px 16px;font:16px/1.45 system-ui,Segoe UI,Arial,sans-serif;box-shadow:0 24px 80px rgba(0,0,0,.5)}
#p360aDlg h2{margin:0 0 4px;font-size:22px}#p360aDlg .sub{margin:0 0 14px;color:#b8d3e6;font-size:14px}
#p360aDlg .op{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#12304a;border:2px solid #2b5578;border-radius:14px;padding:12px 14px;margin:8px 0;color:inherit;font:inherit;cursor:pointer}
#p360aDlg .op .ic{font-size:26px;width:36px;text-align:center;flex:none}
#p360aDlg .op b{display:block;font-size:17px}#p360aDlg .op small{display:block;color:#b8d3e6;font-size:13.5px}
#p360aDlg .op .sw{margin-left:auto;flex:none;width:54px;height:30px;border-radius:999px;background:#3a5168;position:relative;transition:background .15s}
#p360aDlg .op .sw::after{content:'';position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;transition:left .15s}
#p360aDlg .op[aria-pressed="true"]{border-color:#ffd400;background:#183d5e}
#p360aDlg .op[aria-pressed="true"] .sw{background:#19c96a}#p360aDlg .op[aria-pressed="true"] .sw::after{left:27px}
#p360aDlg .rod{display:flex;gap:10px;justify-content:space-between;align-items:center;margin-top:12px;flex-wrap:wrap}
#p360aDlg .rod button{font:700 15px system-ui,Segoe UI,Arial;border-radius:999px;padding:10px 18px;cursor:pointer}
#p360aDlg .fechar{background:#19c96a;color:#fff;border:2px solid #7CFFB8}#p360aDlg .limpar{background:transparent;color:#b8d3e6;border:1px solid #3a5168}
#p360aDlg .nota{font-size:12.5px;color:#8fb0c7;margin-top:10px}
/* modo calmo: nada de animação ou transição de interface */
html.p360-calmo *,html.p360-calmo *::before,html.p360-calmo *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
/* fonte ampliada: os painéis de texto crescem (o 3D não muda) */
html.p360-fonte .button-row{flex-wrap:wrap!important}
html.p360-fonte .sidebar button,html.p360-fonte .painel button{white-space:normal!important;height:auto!important}
html.p360-fonte .sidebar,html.p360-fonte .stage-heading,html.p360-fonte dialog,html.p360-fonte .painel,html.p360-fonte .card,html.p360-fonte .p360s-box{zoom:1.25}/* só os contêineres externos: aninhar dobra o zoom */
html.p360-fonte #captionText,html.p360-fonte #v8Speech{font-size:1.35em!important;line-height:1.45!important}
/* alto contraste */
html.p360-contraste body{background:#000!important}
html.p360-contraste .sidebar,html.p360-contraste .lesson-panel,html.p360-contraste .topbar,html.p360-contraste footer,html.p360-contraste dialog,html.p360-contraste .painel,html.p360-contraste .barrasup,html.p360-contraste #ficha,html.p360-contraste .activity-nav,html.p360-contraste .card,html.p360-contraste .info-card,html.p360-contraste .investiga,html.p360-contraste .guide-panel{background:#000!important;color:#fff!important;border-color:#fff!important}
html.p360-contraste .sidebar *,html.p360-contraste .lesson-panel *,html.p360-contraste .painel *,html.p360-contraste #ficha *,html.p360-contraste dialog *,html.p360-contraste footer *,html.p360-contraste .topbar *,html.p360-contraste .card *{color:#fff!important;text-shadow:none!important}
html.p360-contraste button,html.p360-contraste .btn,html.p360-contraste a.primary-btn,html.p360-contraste a.secondary-btn{background:#000!important;color:#ffeb3b!important;border:2px solid #ffeb3b!important;box-shadow:none!important}
html.p360-contraste button *,html.p360-contraste .btn *{color:#ffeb3b!important}
html.p360-contraste button:focus-visible,html.p360-contraste a:focus-visible{outline:4px solid #00e5ff!important;outline-offset:2px}
html.p360-contraste a{color:#ffeb3b!important}
/* caixas claras dentro dos painéis (dicas, notas) ficam pretas com borda branca */
html.p360-contraste .painel *:not(button):not(input):not(canvas),html.p360-contraste #ficha *:not(button):not(input):not(canvas){background-color:transparent!important;background-image:none!important}
html.p360-contraste .painel [class*=dica],html.p360-contraste .painel [class*=nota],html.p360-contraste .painel [class*=info],html.p360-contraste .painel [class*=caixa]{border:1px solid #fff!important}
html.p360-contraste #captionText,html.p360-contraste #v8Speech{background:#000!important;color:#fff!important;border:2px solid #ffeb3b!important}
html.p360-contraste .stage-heading h2,html.p360-contraste .stage-heading p{color:#fff!important;text-shadow:0 0 6px #000,0 0 3px #000!important}
`;document.head.appendChild(s);}

/* ---------- aplicar nas apps ---------- */
function labAtual(){for(const k of ['HistoriaLab','CorpoLab','TerraLab','CelulaLab','DNALab']){const L=window[k];if(L&&L.state)return L;}return null;}
function marcar(id,valor){const i=document.getElementById(id);if(!i||i.checked===valor)return false;i.checked=valor;i.dispatchEvent(new Event('change',{bubbles:true}));i.dispatchEvent(new Event('input',{bubbles:true}));return true;}
function checkboxPorRotulo(txt){const l=[...document.querySelectorAll('label')].find(x=>x.textContent.trim().startsWith(txt));return l?l.querySelector('input[type=checkbox]'):null;}
function marcarEl(i,valor){if(!i||i.checked===valor)return;i.checked=valor;if(typeof i.onchange==='function')i.onchange();else i.dispatchEvent(new Event('change',{bubbles:true}));}
let antes=null;/* o que o app tinha antes do modo calmo, para devolver ao desligar */
const ultimo={};
function aplicar(){const h=document.documentElement;['calmo','contraste','fonte','legendas'].forEach(k=>h.classList.toggle('p360-'+k,!!pref[k]));
 const L=labAtual();
 /* legendas: só mexe quando a opção muda (não apaga o que o professor ligou nos Ajustes) */
 if(ultimo.legendas!==!!pref.legendas&&(pref.legendas||ultimo.legendas!==undefined)){if(L)marcar('captionsEnabled',!!pref.legendas);const solarLeg=checkboxPorRotulo('Exibir legendas');if(solarLeg)marcarEl(solarLeg,!!pref.legendas);}
 ultimo.legendas=!!pref.legendas;
 /* modo calmo */
 if(pref.calmo){if(!antes){antes={};if(L){const m=document.getElementById('musicEnabled');antes.musica=m?m.checked:null;const r=document.getElementById('reducedMotion');antes.mov=r?r.checked:null;antes.giro=!!L.state.autoRotate;}
   if(typeof musicaOn!=='undefined')antes.musicaSolar=musicaOn;const amb=checkboxPorRotulo('Ambiente com poeira');antes.amb=amb?amb.checked:null;}
  if(L){marcar('reducedMotion',true);marcar('musicEnabled',false);if(L.state.autoRotate){L.state.autoRotate=false;const b=document.getElementById('rotateBtn');if(b){b.textContent='▷ Girar';b.setAttribute('aria-pressed','false');}}}
  try{if(typeof musicaOn!=='undefined'&&musicaOn&&typeof toggleMusica==='function')toggleMusica();}catch(_){}
  const amb=checkboxPorRotulo('Ambiente com poeira');if(amb)marcarEl(amb,false);}
 else if(antes){/* devolve o que era */
  if(L){if(antes.mov!==null)marcar('reducedMotion',antes.mov);if(antes.musica)marcar('musicEnabled',true);}
  try{if(antes.musicaSolar&&typeof musicaOn!=='undefined'&&!musicaOn&&typeof toggleMusica==='function')toggleMusica();}catch(_){}
  const amb=checkboxPorRotulo('Ambiente com poeira');if(amb&&antes.amb)marcarEl(amb,true);antes=null;}
 atualizarBotao();}
/* o modo calmo também segura o giro automático se algo religar */
setInterval(()=>{if(!pref.calmo)return;const L=labAtual();if(L&&L.state.autoRotate){L.state.autoRotate=false;}},1500);

/* ---------- interface ---------- */
let btn=null,dlg=null;
function atualizarBotao(){if(!btn)return;const n=OPCOES.filter(o=>pref[o.id]).length;btn.innerHTML='<span aria-hidden="true">♿</span> Acessibilidade'+(n?' <span class="n">'+n+'</span>':'');btn.setAttribute('aria-label','Acessibilidade'+(n?': '+n+' opções ligadas':''));
 if(dlg)dlg.querySelectorAll('.op').forEach(b=>b.setAttribute('aria-pressed',String(!!pref[b.dataset.op])));}
function montar(){estilos();if(document.getElementById('p360aBtn'))return;
 btn=document.createElement('button');btn.type='button';btn.id='p360aBtn';btn.dataset.action='p360a-abrir';document.body.appendChild(btn);
 dlg=document.createElement('div');dlg.id='p360aDlg';dlg.hidden=true;dlg.setAttribute('role','dialog');dlg.setAttribute('aria-modal','true');dlg.setAttribute('aria-labelledby','p360aTit');
 dlg.innerHTML='<div class="cx"><h2 id="p360aTit">♿ Acessibilidade</h2><p class="sub">Vale para todas as experiências deste aparelho.</p>'+
  OPCOES.map(o=>'<button type="button" class="op" data-action="p360a-op" data-op="'+o.id+'" aria-pressed="false"><span class="ic" aria-hidden="true">'+o.icone+'</span><span><b>'+o.titulo+'</b><small>'+o.texto+'</small></span><span class="sw" aria-hidden="true"></span></button>').join('')+
  '<div class="rod"><button type="button" class="limpar" data-action="p360a-limpar">Restaurar o padrão</button><button type="button" class="fechar" data-action="p360a-fechar">Pronto ✓</button></div>'+
  '<p class="nota">Dica para a Sala de Recursos: abra o catálogo com <b>?acess=legendas,calmo</b> no endereço para já começar assim.</p></div>';
 document.body.appendChild(dlg);atualizarBotao();}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action^="p360a-"]');if(!b){if(dlg&&!dlg.hidden&&e.target===dlg){dlg.hidden=true;}return;}
 const a=b.dataset.action;if(a==='p360a-abrir'){dlg.hidden=false;const f=dlg.querySelector('.op');if(f)f.focus();}
 else if(a==='p360a-fechar'){dlg.hidden=true;btn.focus();}
 else if(a==='p360a-limpar'){pref={};salvar();aplicar();}
 else if(a==='p360a-op'){const k=b.dataset.op;pref[k]=!pref[k];if(!pref[k])delete pref[k];salvar();aplicar();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dlg&&!dlg.hidden){dlg.hidden=true;btn.focus();}});
/* no VR o botão some (o óculos não mostra a página) */
setInterval(()=>{if(!btn)return;const chip=document.querySelector('.p360s-chip');const r=chip&&chip.getBoundingClientRect();if(r&&r.width>0&&getComputedStyle(chip).display!=='none'){btn.style.left=Math.round(r.right+8)+'px';}else btn.style.left='14px';let vr=false;try{const c=window.PortalEntrada&&PortalEntrada.contexto&&PortalEntrada.contexto();vr=!!(c&&c.renderer&&c.renderer.xr&&c.renderer.xr.isPresenting);}catch(_){}btn.hidden=vr;},1000);
/* espera o app montar os Ajustes antes de aplicar */
function iniciar(n){montar();const pronto=labAtual()||typeof musicaOn!=='undefined'||(n||0)>40;if(pronto){aplicar();setTimeout(aplicar,1500);}else setTimeout(()=>iniciar((n||0)+1),150);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>iniciar(0));else iniciar(0);
window.Portal360Acess={versao:VERSAO,get pref(){return Object.assign({},pref);},ligar:(k,v)=>{if(v)pref[k]=true;else delete pref[k];salvar();aplicar();}};
})();
