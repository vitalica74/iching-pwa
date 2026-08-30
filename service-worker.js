const CACHE='iching-pwa-v1.0.7';
const OFFLINE_URL='./index.html';
const ASSETS=[
  './','./index.html','./css/styles.css','./css/library.css','./manifest.webmanifest','./icons/icon.svg',
  './js/app.js','./js/reading-ui.js','./js/guide-ui.js','./js/library-guide-ui.js','./js/library.js','./js/install.js','./js/random.js','./js/storage.js','./js/ui.js','./js/interpretation.js','./js/preferences.js',
  './data/hexagrams.js','./data/profiles.js','./data/transitions.js','./data/classical-sources.js','./data/hexagram-guides-01-10.js','./data/hexagram-guides-11-16.js','./data/hexagram-guides-17-24.js',
  './data/changing-lines.js',
  './data/changing-lines-01-04.js','./data/changing-lines-05-10.js','./data/changing-lines-11-16.js','./data/changing-lines-17-24.js','./data/changing-lines-25-32.js','./data/changing-lines-33-40.js','./data/changing-lines-41-48.js','./data/changing-lines-49-56.js','./data/changing-lines-57-64.js',
  './data/classical-lines.js',
  './data/classical-lines-01-04.js','./data/classical-lines-05-10.js','./data/classical-lines-11-16.js','./data/classical-lines-17-24.js','./data/classical-lines-25-32.js','./data/classical-lines-33-40.js','./data/classical-lines-41-48.js','./data/classical-lines-49-56.js','./data/classical-lines-57-64.js',
  './data/hexagram-cycles.js',
  './data/hexagram-cycles-01-10.js','./data/hexagram-cycles-11-16.js','./data/hexagram-cycles-17-24.js','./data/hexagram-cycles-25-32.js','./data/hexagram-cycles-33-40.js','./data/hexagram-cycles-41-48.js','./data/hexagram-cycles-49-56.js','./data/hexagram-cycles-57-64.js',
  './data/crossroads.js',
  './data/crossroads-01-04.js','./data/crossroads-05-10.js','./data/crossroads-11-16.js','./data/crossroads-17-24.js','./data/crossroads-25-32.js','./data/crossroads-33-40.js','./data/crossroads-41-48.js','./data/crossroads-49-56.js','./data/crossroads-57-64.js'
];
async function fetchFresh(request){return fetch(new Request(request,{cache:'no-store'}))}
async function cacheAppShell(){const cache=await caches.open(CACHE);await Promise.all(ASSETS.map(async asset=>{try{const response=await fetchFresh(asset);if(response.ok)await cache.put(asset,response.clone());else console.warn('Не вдалося закешувати',asset,response.status)}catch(error){console.warn('Помилка кешування',asset,error)}}))}
self.addEventListener('install',event=>{event.waitUntil(cacheAppShell().then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetchFresh(event.request);if(response.ok)await cache.put(event.request,response.clone());return response}catch(error){const cached=await cache.match(event.request,{ignoreSearch:true});if(cached)return cached;if(event.request.mode==='navigate'){const offline=await cache.match(OFFLINE_URL);if(offline)return offline}throw error}})())});
