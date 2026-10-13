/* Uso sem internet (out/2026): registra o service worker e mostra um selo discreto com o progresso.
   Arquivo separado do app para sobreviver a pacotes novos: se o index.html for substituído, basta manter a linha
   <script defer src="offline.js"></script> antes de </body>. */
(function(){'use strict';
 if(!('serviceWorker' in navigator))return;if(!(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))return;
 const q=new URLSearchParams(location.search),embed=q.get('embed')==='1';
 let selo=null,some=null;
 function mostrar(txt,ok){if(embed)return;if(!selo){selo=document.createElement('div');selo.id='seloOffline';selo.setAttribute('role','status');selo.style.cssText='position:fixed;left:12px;bottom:12px;z-index:2147483000;font:600 12px/1.2 system-ui,Segoe UI,Arial,sans-serif;color:#fff;background:rgba(15,44,74,.88);border:1px solid rgba(255,255,255,.18);padding:7px 11px;border-radius:999px;pointer-events:none;transition:opacity .6s';document.body.appendChild(selo);}
  selo.textContent=txt;selo.style.opacity='1';selo.style.background=ok?'rgba(26,107,42,.92)':'rgba(15,44,74,.88)';clearTimeout(some);if(ok)some=setTimeout(()=>{if(selo)selo.style.opacity='0';},4000);}
 navigator.serviceWorker.addEventListener('message',e=>{const d=e.data||{};if(d.tipo!=='offline')return;
  if(d.erro)return;if(d.pronto)mostrar('✓ Pronto para uso sem internet',true);else if(d.total)mostrar('Preparando uso sem internet… '+Math.round(100*d.feitos/d.total)+'%',false);});
 window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').then(()=>{const pedir=()=>{if(navigator.serviceWorker.controller)navigator.serviceWorker.controller.postMessage({tipo:'status'});};if(navigator.serviceWorker.controller)pedir();else navigator.serviceWorker.addEventListener('controllerchange',pedir,{once:true});}).catch(()=>{});});
})();
