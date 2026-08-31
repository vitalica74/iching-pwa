import {downloadHistory,loadHistory,replaceHistory} from './storage.js';

const button=document.querySelector('#clear-history');

async function refreshState(){
  if(!button)return;
  try{
    const history=await loadHistory();
    button.disabled=history.length===0;
    button.title=history.length?`Записів: ${history.length}`:'Історія вже порожня';
  }catch{
    button.disabled=true;
  }
}

if(button){
  button.addEventListener('click',async()=>{
    const history=await loadHistory();
    if(!history.length){button.disabled=true;return}
    const count=history.length;
    const confirmed=confirm(`Очистити всю історію (${count})?\n\nПеред видаленням автоматично буде створено JSON-експорт. Його можна буде імпортувати пізніше.`);
    if(!confirmed)return;
    button.disabled=true;
    button.textContent='Створюємо експорт…';
    downloadHistory(history);
    // Даємо браузеру почати завантаження файла до очищення IndexedDB.
    await new Promise(resolve=>setTimeout(resolve,350));
    try{
      await replaceHistory([]);
      button.textContent='Історію очищено';
      setTimeout(()=>location.reload(),250);
    }catch(error){
      console.error(error);
      button.disabled=false;
      button.textContent='Очистити всю історію';
      alert('Експорт створено, але очистити історію не вдалося. Дані залишилися на місці.');
    }
  });
  refreshState();
}
