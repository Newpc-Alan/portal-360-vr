#!/usr/bin/env python3
"""Gera apps/estande/sw.js (cache-first, uso sem internet no estande). Rodar a cada publicação do Modo Estande."""
import os,json,hashlib,re
raiz=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','apps','estande');os.chdir(raiz)
html=open('index.html',encoding='utf-8').read();v=re.search(r'estande\.js\?v=([0-9.]+)',html).group(1)
arqs=['./','index.html','estande.js?v='+v]
for d in ['vendor','snap','assets','modelos','audio']:
    arqs+=[d+'/'+f for f in sorted(os.listdir(d)) if not f.endswith('.txt')]
h=hashlib.md5(''.join(arqs).encode()+b''.join(open(a,'rb').read() for a in arqs[1:2]+['estande.js']+[x for x in arqs if x.startswith('audio/')])).hexdigest()[:6]
sw='''/* Modo Estande: guarda tudo no aparelho para funcionar sem internet na feira. Cache-first; nova versão = novo nome. */
const CACHE='estande-%s-%s';
const ARQS=%s;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ARQS.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('estande-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&new URL(e.request.url).origin===location.origin){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}return res;}).catch(()=>caches.match(e.request,{ignoreSearch:true}))));});
'''%(v,h,json.dumps(arqs))
open('sw.js','w').write(sw);print('sw.js',v,h,len(arqs),'arquivos')
