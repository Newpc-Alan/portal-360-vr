/* Sistema Solar VR · service worker de uso sem internet (out/2026)
   Rede primeiro para a casca (html, css, js): com internet sempre carrega a versão publicada mais nova, inclusive pacotes
   atualizados por fora; sem internet, ou se a rede não responder em 4 s, usa a cópia guardada. Áudios ficam numa cache
   persistente (cache primeiro), baixados em segundo plano depois da primeira abertura. Pedidos com Range recebem 206. */
const VERSAO='9.16-69c189';
const PFX='solar-',CASCA=PFX+'casca-'+VERSAO,PESADA=PFX+'pesada-v1',META=PFX+'meta-v1';
const ESCOPO=new URL(self.registration.scope).pathname;
let baixando=false;
async function manifesto(){const r=await fetch('precache.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('precache.json');return r.json();}
async function avisar(msg){const cs=await self.clients.matchAll({includeUncontrolled:true});cs.forEach(c=>c.postMessage(msg));}
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const m=await manifesto();const c=await caches.open(CASCA);
  await Promise.all(m.casca.map(async u=>{try{const r=await fetch(u,{cache:'no-cache'});if(r.ok)await c.put(u,r);}catch(_){}}));
  const meta=await caches.open(META);await meta.put('manifesto',new Response(JSON.stringify(m),{headers:{'content-type':'application/json'}}));
  await self.skipWaiting();})());});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  const nomes=await caches.keys();await Promise.all(nomes.filter(n=>n.startsWith(PFX+'casca-')&&n!==CASCA).map(n=>caches.delete(n)));
  await self.clients.claim();baixarPesados();})());});
async function baixarPesados(){
  if(baixando)return;baixando=true;
  try{
    const meta=await caches.open(META);const mr=await meta.match('manifesto');const m=mr?await mr.json():await manifesto();
    const c=await caches.open(PESADA);const hr=await meta.match('hashes');const hashes=hr?await hr.json():{};
    let feitos=0;const total=m.pesados.length;const pendentes=[];
    for(const p of m.pesados){const tem=await c.match(p.u,{ignoreSearch:true});if(tem&&hashes[p.u]===p.h){feitos++;continue;}pendentes.push(p);}
    await avisar({tipo:'offline',feitos,total,bytes:m.bytes});
    for(let i=0;i<pendentes.length;i+=6){
      await Promise.all(pendentes.slice(i,i+6).map(async p=>{try{const r=await fetch(p.u,{cache:'no-cache'});if(r.ok){await c.put(p.u,r);hashes[p.u]=p.h;}}catch(_){}feitos++;}));
      await meta.put('hashes',new Response(JSON.stringify(hashes),{headers:{'content-type':'application/json'}}));
      await avisar({tipo:'offline',feitos,total,bytes:m.bytes});
    }
    const validos=new Set(m.pesados.map(p=>new URL(p.u,self.registration.scope).pathname));
    for(const req of await c.keys()){if(!validos.has(new URL(req.url).pathname))await c.delete(req);}
    await avisar({tipo:'offline',feitos:total,total,bytes:m.bytes,pronto:true});
  }catch(e){await avisar({tipo:'offline',erro:String(e&&e.message||e)});}
  baixando=false;
}
self.addEventListener('message',e=>{const d=e.data||{};if(d.tipo==='precache')baixarPesados();if(d.tipo==='status')(async()=>{const meta=await caches.open(META);const mr=await meta.match('manifesto');if(!mr)return;const m=await mr.json();const c=await caches.open(PESADA);let feitos=0;for(const p of m.pesados){if(await c.match(p.u,{ignoreSearch:true}))feitos++;}e.source&&e.source.postMessage({tipo:'offline',feitos,total:m.pesados.length,bytes:m.bytes,pronto:feitos===m.pesados.length});})();});
function resposta206(res,range){return res.arrayBuffer().then(buf=>{const m=/bytes=(\d+)-(\d*)/.exec(range);const ini=m?Number(m[1]):0,fim=m&&m[2]?Math.min(Number(m[2]),buf.byteLength-1):buf.byteLength-1;const parte=buf.slice(ini,fim+1);const h=new Headers(res.headers);h.set('Content-Range','bytes '+ini+'-'+fim+'/'+buf.byteLength);h.set('Content-Length',String(parte.byteLength));h.set('Accept-Ranges','bytes');return new Response(parte,{status:206,statusText:'Partial Content',headers:h});});}
function comPrazo(p,ms){return new Promise((ok,erro)=>{const t=setTimeout(()=>erro(new Error('timeout')),ms);p.then(r=>{clearTimeout(t);ok(r);},e=>{clearTimeout(t);erro(e);});});}
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==location.origin||!url.pathname.startsWith(ESCOPO))return;
  if(url.pathname.endsWith('/precache.json')||url.pathname.endsWith('/sw.js'))return;
  const pesado=/\.(glb|mp3)$/.test(url.pathname),range=req.headers.get('range');
  if(pesado){e.respondWith((async()=>{const c=await caches.open(PESADA);const hit=await c.match(req,{ignoreSearch:true});if(hit)return range?resposta206(hit,range):hit;
    try{const r=await fetch(req);if(r.ok&&r.status===200&&!range)c.put(req,r.clone());return r;}catch(_){return new Response('',{status:504,statusText:'offline'});}})());return;}
  e.respondWith((async()=>{const c=await caches.open(CASCA);
    try{const r=await comPrazo(fetch(req),4000);if(r.ok&&r.status===200)c.put(req,r.clone());return r;}
    catch(_){let hit=await c.match(req,{ignoreSearch:req.mode==='navigate'});if(!hit)hit=await c.match(req,{ignoreSearch:true});if(!hit&&req.mode==='navigate')hit=await c.match('index.html',{ignoreSearch:true});return hit||new Response('',{status:504,statusText:'offline'});}
  })());
});
