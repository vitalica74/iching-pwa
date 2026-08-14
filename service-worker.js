const CACHE='iching-pwa-v35';
const OFFLINE_URL='./index.html';
const ASSETS=[
  './','./index.html','./css/styles.css','./manifest.webmanifest','./icons/icon.svg',
  './js/app.js','./js/v41-ui.js','./js/random.js','./js/storage.js','./js/ui.js','./js/interpretation.js','./js/preferences.js',
  './data/hexagrams.js','./data/profiles.js','./data/transitions.js','./data/classical-sources.js',
  './data/changing-lines.js',
  './data/changing-lines-01-04.js','./data/changing-lines-05-10.js','./data/changing-lines-11-16.js','./data/changing-lines-17-24.js','./data/changing-lines-25-32.js','./data/changing-lines-33-40.js','./data/changing-lines-41-48.js','./data/changing-lines-49-56.js','./data/changing-lines-57-64.js',
  './data/classical-lines.js',
  './data/classical-lines-01-04.js','./data/classical-lines-05-10.js','./data/classical-lines-11-16.js','./data/classical-lines-17-24.js','./data/classical-lines-25-32.js','./data/classical-lines-33-40.js','./data/classical-lines-41-48.js','./data/classical-lines-49-56.js','./data/classical-lines-57-64.js',
  './data/hexagram-cycles.js',
  './data/hexagram-cycles-01-10.js','./data/hexagram-cycles-11-16.js','./data/hexagram-cycles-17-24.js','./data/hexagram-cycles-25-32.js','./data/hexagram-cycles-33-40.js','./data/hexagram-cycles-41-48.js','./data/hexagram-cycles-49-56.js','./data/hexagram-cycles-57-64.js'
];

async function cacheAppShell(){
  const cache=await caches.open(CACHE);
  await Promise.all(ASSETS.map(async asset=>{
    try{
      const response=await fetch(new Request(asset,{cache:'reload'}));
      if(response.ok)await cache.put(asset,response);
      else console.warn('Не вдалося закешувати',asset,response.status);
    }catch(error){
      console.warn('Помилка кешування',asset,error);
    }
  }));
}

self.addEventListener('install',event=>event.waitUntil(cacheAppShell().then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(async response=>{
      if(response.ok)(await caches.open(CACHE)).put(OFFLINE_URL,response.clone());
      return response;
    }).catch(()=>caches.match(OFFLINE_URL)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(async response=>{
    if(response.ok)(await caches.open(CACHE)).put(event.request,response.clone());
    return response;
  })));
});
