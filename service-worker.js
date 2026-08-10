const CACHE='iching-pwa-v22';
const ASSETS=['./','./index.html','./css/styles.css','./js/app.js','./js/v41-ui.js','./js/random.js','./js/storage.js','./js/ui.js','./js/interpretation.js','./js/preferences.js','./data/hexagrams.js','./data/hexagram-cycles-01-10.js','./data/changing-lines.js','./data/changing-lines-01-04.js','./data/changing-lines-05-10.js','./data/transitions.js','./data/profiles.js','./data/classical-sources.js','./data/classical-lines.js','./data/classical-lines-v41.js','./data/classical-lines-01-04.js','./data/classical-lines-05-10.js','./manifest.webmanifest','./icons/icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));return response}).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(event.request);
    const network=fetch(event.request).then(response=>{if(response.ok)cache.put(event.request,response.clone());return response}).catch(()=>null);
    return cached||network;
  }));
});
