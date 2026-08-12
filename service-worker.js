const CACHE='iching-pwa-v25';
const OFFLINE_URL='./index.html';
const ASSETS=[
  './','./index.html','./css/styles.css',
  './js/app.js','./js/v41-ui.js','./js/random.js','./js/storage.js','./js/ui.js','./js/interpretation.js','./js/preferences.js',
  './data/hexagrams.js','./data/hexagram-cycles-01-10.js','./data/changing-lines.js','./data/changing-lines-01-04.js','./data/changing-lines-05-10.js',
  './data/transitions.js','./data/profiles.js','./data/classical-sources.js','./data/classical-lines.js','./data/classical-lines-v41.js','./data/classical-lines-01-04.js','./data/classical-lines-05-10.js',
  './manifest.webmanifest','./icons/icon.svg'
];

async function cacheAppShell(){
  const cache=await caches.open(CACHE);
  await Promise.all(ASSETS.map(async asset=>{
    try{
      const request=new Request(asset,{cache:'reload'});
      const response=await fetch(request);
      if(response.ok)await cache.put(request,response);
      else console.warn('Не вдалося закешувати',asset,response.status);
    }catch(error){
      console.warn('Помилка кешування',asset,error);
    }
  }));
}

self.addEventListener('install',event=>{
  event.waitUntil(cacheAppShell().then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;

  if(event.request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request);
        if(response.ok){
          const cache=await caches.open(CACHE);
          cache.put(OFFLINE_URL,response.clone());
        }
        return response;
      }catch(error){
        return (await caches.match(event.request)) || (await caches.match(OFFLINE_URL)) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    try{
      const response=await fetch(event.request);
      if(response.ok){
        const cache=await caches.open(CACHE);
        cache.put(event.request,response.clone());
      }
      return response;
    }catch(error){
      return Response.error();
    }
  })());
});
