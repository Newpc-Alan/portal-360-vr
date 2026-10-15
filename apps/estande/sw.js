/* Endereço antigo do Modo Estande: este service worker apaga o cache velho e se desinstala, para o óculos ir para /demo/ */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('estande-')).map(k=>caches.delete(k)))).then(()=>self.registration.unregister()).then(()=>self.clients.matchAll()).then(cs=>cs.forEach(c=>c.navigate('../../demo/'))));});
