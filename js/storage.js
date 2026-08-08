const DB_NAME='iching-pwa';
const DB_VERSION=1;
const STORE_HISTORY='history';
const LEGACY_KEY='iching-pwa-history-v2';

function requestToPromise(request){return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
function transactionDone(tx){return new Promise((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}

export async function openDatabase(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains(STORE_HISTORY)){
        const store=db.createObjectStore(STORE_HISTORY,{keyPath:'id'});
        store.createIndex('createdAt','createdAt');
        store.createIndex('primaryNumber','casting.primaryHexagram');
      }
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

export async function migrateLegacyHistory(){
  const raw=localStorage.getItem(LEGACY_KEY);
  if(!raw)return 0;
  let legacy=[];
  try{legacy=JSON.parse(raw)||[]}catch{return 0}
  if(!Array.isArray(legacy)||!legacy.length){localStorage.removeItem(LEGACY_KEY);return 0}
  const db=await openDatabase();
  const tx=db.transaction(STORE_HISTORY,'readwrite');
  const store=tx.objectStore(STORE_HISTORY);
  legacy.forEach((item,index)=>store.put(normalizeHistoryItem(item,index)));
  await transactionDone(tx);
  localStorage.removeItem(LEGACY_KEY);
  return legacy.length;
}

export function normalizeHistoryItem(item,index=0){
  if(item?.schemaVersion>=3)return item;
  const createdAt=item?.createdAt||new Date().toISOString();
  return {
    id:item?.id||`legacy-${Date.parse(createdAt)||Date.now()}-${index}`,
    schemaVersion:3,
    createdAt,
    question:item?.question||'',
    casting:{
      method:'three-coins',
      lines:Array.isArray(item?.lines)?item.lines:[],
      primaryHexagram:item?.number||null,
      resultingHexagram:item?.transformedNumber||item?.number||null,
      changingLines:Array.isArray(item?.lines)?item.lines.map((line,i)=>line.changing?i+1:null).filter(Boolean):[]
    },
    interpretationSource:{
      libraryId:item?.preferences?.collection||'official',
      libraryVersion:'legacy',
      engineVersion:'legacy',
      context:item?.preferences?.context||'general',
      style:item?.preferences?.style||'practical',
      transitionId:item?.number&&item?.transformedNumber?`${item.number}-${item.transformedNumber}`:null
    },
    snapshot:item?.snapshot||null,
    legacy:{name:item?.name||'',transformedName:item?.transformedName||''}
  };
}

export async function loadHistory(){
  const db=await openDatabase();
  const tx=db.transaction(STORE_HISTORY,'readonly');
  const items=await requestToPromise(tx.objectStore(STORE_HISTORY).getAll());
  return items.map(normalizeHistoryItem).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function saveHistoryItem(item){
  const db=await openDatabase();
  const tx=db.transaction(STORE_HISTORY,'readwrite');
  tx.objectStore(STORE_HISTORY).put(item);
  await transactionDone(tx);
}

export async function deleteHistoryItem(id){
  const db=await openDatabase();
  const tx=db.transaction(STORE_HISTORY,'readwrite');
  tx.objectStore(STORE_HISTORY).delete(id);
  await transactionDone(tx);
}

export async function replaceHistory(history){
  const db=await openDatabase();
  const tx=db.transaction(STORE_HISTORY,'readwrite');
  const store=tx.objectStore(STORE_HISTORY);
  store.clear();
  history.forEach((item,index)=>store.put(normalizeHistoryItem(item,index)));
  await transactionDone(tx);
}

export function downloadHistory(history){
  const payload={schemaVersion:5,storage:'IndexedDB',exportedAt:new Date().toISOString(),history};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`iching-history-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);
}

export async function parseHistoryFile(file){
  const parsed=JSON.parse(await file.text());
  const history=Array.isArray(parsed)?parsed:parsed.history;
  if(!Array.isArray(history))throw new Error('Некоректний формат історії');
  return history.filter(x=>x&&((x.casting&&Array.isArray(x.casting.lines))||Array.isArray(x.lines))).map(normalizeHistoryItem);
}
