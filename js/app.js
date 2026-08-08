import {castThreeCoins,collectEntropy} from './random.js';
import {loadHistory,saveHistoryItem,deleteHistoryItem as deleteStoredHistoryItem,downloadHistory,parseHistoryFile,replaceHistory,migrateLegacyHistory} from './storage.js';
import {canonicalHexagramNumber,getHexagramData,MAPPING_VERSION,validateCanonicalMapping} from '../data/hexagrams.js';
import {buildInterpretation} from './interpretation.js';
import {loadPreferences,savePreferences} from './preferences.js';
import {renderLines,showToast,switchTab} from './ui.js';

const APP_VERSION='4.0.0';
const LIBRARY_VERSION='1.3.0';
const ENGINE_VERSION='4.0.0';
const $=selector=>document.querySelector(selector);
const clone=value=>globalThis.structuredClone?structuredClone(value):JSON.parse(JSON.stringify(value));
const state={lines:[],history:[],preferences:loadPreferences(),busy:false,lastTap:0,tapTimer:0,openedHistoryItem:null,displayingSnapshot:false};
const button=$('#cast-button');

function createId(){
  if(typeof crypto.randomUUID==='function')return crypto.randomUUID();
  const bytes=new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');
}
function transformedLines(lines){return lines.map(line=>({...line,type:line.changing?(line.type==='yang'?'yin':'yang'):line.type,changing:false}))}
function hasLegacyMapping(item){
  if(!item?.casting?.lines?.length)return false;
  return item?.interpretationSource?.mappingVersion!==MAPPING_VERSION;
}
function changingPositions(lines=state.lines){return lines.map((line,index)=>line.changing?index+1:null).filter(Boolean)}
function setText(selector,value=''){const element=$(selector);if(element)element.textContent=value}
function currentResult(lines=state.lines,preferences=state.preferences){
  const primary=getHexagramData(canonicalHexagramNumber(lines));
  const changed=transformedLines(lines);
  const secondary=getHexagramData(canonicalHexagramNumber(changed));
  const positions=changingPositions(lines);
  const interpretation=buildInterpretation({primary,secondary,changingPositions:positions,context:preferences.context,mode:preferences.mode});
  return {primary,secondary,changed,positions,interpretation};
}

function normalizeInterpretation(raw,result){
  if(raw?.answer)return raw;
  const lines=raw?.lines??[];
  const transition=raw?.transition??{};
  const primary=raw?.primary??{};
  const secondary=raw?.secondary??{};
  const lineText=lines.length
    ? lines.map(line=>`${line.title}: ${line.meaning} ${line.advice}`).join(' ')
    : 'Змінних ліній немає, тому головним орієнтиром залишається основна гексаграма.';
  const essence=raw?.conclusion||[transition.summary,transition.recommendation].filter(Boolean).join(' ')||result.primary.desc;
  return {
    schemaVersion:1,
    answer:{
      essence,
      action:transition.recommendation||primary.advice||result.primary.advice,
      development:transition.future||secondary.meaning||result.secondary.desc
    },
    rationale:{lines:lineText,transition:'Це історичний знімок попередньої версії рушія. Його зміст збережено без переписування.'},
    primary:{meaning:primary.meaning||result.primary.desc,advice:primary.advice||result.primary.advice,caution:primary.caution||result.primary.caution},
    lines,
    transition:{summary:'',change:'',recommendation:'',danger:'',future:'',...transition},
    secondary:{meaning:secondary.meaning||result.secondary.desc,advice:secondary.advice||result.secondary.advice,caution:secondary.caution||result.secondary.caution},
    classics:{verified:false,wilhelm:'Класичний шар у цьому старому знімку ще не зберігався.',shchutsky:'Класичний шар у цьому старому знімку ще не зберігався.'},
    mode:'practical',
    conclusion:essence
  };
}

function interpretationToText(result){
  const interpretation=normalizeInterpretation(result.interpretation,result);
  const parts=[
    `Питання розглянуто через основну гексаграму №${result.primary.number} — ${result.primary.name}.`,
    `Суть відповіді: ${interpretation.answer.essence}`,
    `Що робити: ${interpretation.answer.action}`,
    `До чого це веде: ${interpretation.answer.development}`
  ];
  if(result.positions.length)parts.push(`Додаткова гексаграма №${result.secondary.number} — ${result.secondary.name}.`);
  if(interpretation.lines.length){
    parts.push('Деталі змінних ліній:');
    interpretation.lines.forEach(line=>parts.push(`${line.title}. ${line.meaning} ${line.advice}`));
  }
  return parts.join('\n\n');
}
function createSnapshot(result){
  return {
    capturedAt:new Date().toISOString(),
    interpretationSchemaVersion:2,
    primary:{number:result.primary.number,name:result.primary.name,description:result.primary.desc},
    secondary:{number:result.secondary.number,name:result.secondary.name,description:result.secondary.desc},
    interpretation:clone(result.interpretation),
    fullText:interpretationToText(result)
  };
}

function closeKnowledgeSections(){
  document.querySelectorAll('#answer-result details').forEach(detail=>{detail.open=false});
}
function renderChangingLines(lines){
  const list=$('#changing-lines-list');
  list.innerHTML='';
  if(!lines.length){
    list.innerHTML='<p class="muted detail-muted">Змінних ліній немає: головною залишається основна гексаграма.</p>';
    return;
  }
  lines.forEach(item=>{
    const article=document.createElement('article');
    article.className='changing-line-card';
    const title=document.createElement('strong');title.textContent=item.title;
    const meaning=document.createElement('p');meaning.textContent=item.meaning;
    const advice=document.createElement('p');advice.textContent=item.advice;
    article.append(title,meaning,advice);

    const classical=item.classical||{};
    const details=document.createElement('details');
    details.className='line-classical-details';
    const summary=document.createElement('summary');
    summary.textContent=classical.available?'Класичне трактування цієї лінії':'Класичне трактування лінії ще доповнюється';
    details.appendChild(summary);
    const body=document.createElement('div');body.className='line-classical-body';
    if(classical.wilhelm){
      const h=document.createElement('h5');h.textContent='Ріхард Вільгельм';
      const p=document.createElement('p');p.textContent=classical.wilhelm;
      body.append(h,p);
    }
    if(classical.shchutsky){
      const h=document.createElement('h5');h.textContent='Юліан Шуцький';
      const p=document.createElement('p');p.textContent=classical.shchutsky;
      body.append(h,p);
    }
    if(!classical.available){
      const p=document.createElement('p');p.className='muted';p.textContent='Цей запис навмисно не заповнено шаблонним текстом. Додамо його після звірки з джерелами.';
      body.appendChild(p);
    }
    details.appendChild(body);
    article.appendChild(details);
    list.appendChild(article);
  });
}
function applyReadingMode(mode=state.preferences.mode){
  const answerCard=$('#answer-result');
  if(!answerCard)return;
  mode=mode==='classic'?'classic':'practical';
  const summary=answerCard.querySelector('.answer-summary');
  const steps=answerCard.querySelector('.answer-steps');
  const classics=answerCard.querySelector('.classical-section');
  const knowledge=answerCard.querySelector('.knowledge-sections');
  const snapshot=answerCard.querySelector('#snapshot-text-details');
  const historyActions=answerCard.querySelector('.history-view-actions');
  const classic=mode==='classic';

  answerCard.classList.toggle('reading-mode-classic',classic);
  answerCard.classList.toggle('reading-mode-practical',!classic);

  // Не покладаємося лише на CSS order: фізично переставляємо блоки,
  // тому режим змінюється однаково у браузері, PWA і старіших WebView.
  const ordered=classic
    ? [classics,summary,steps,knowledge,snapshot,historyActions]
    : [summary,steps,classics,knowledge,snapshot,historyActions];
  ordered.filter(Boolean).forEach(node=>answerCard.appendChild(node));
  answerCard.dataset.readingMode=mode;
}

function updateReadingModeIndicator(){
  const label=$('#active-reading-mode');
  if(!label)return;
  label.textContent=state.preferences.mode==='classic'?'Класичний':'Практичний';
}

function renderInterpretationResult(result,hasChanges){
  const interpretation=normalizeInterpretation(result.interpretation,result);
  const answer=interpretation.answer;
  setText('#answer-essence',answer.essence);
  setText('#answer-action',answer.action);
  setText('#answer-development',answer.development);
  const classics=interpretation.classics||{};
  setText('#wilhelm-text',classics.wilhelm||'Класичний текст для цієї гексаграми ще не додано.');
  setText('#shchutsky-text',classics.shchutsky||'Класичний текст для цієї гексаграми ще не додано.');
  setText('#classical-status',classics.verified?'звірено':'корпус доповнюється');
  // Режим читання є лише налаштуванням відображення.
  // Збережений snapshot не має права перекривати поточний вибір користувача.
  applyReadingMode(state.preferences.mode);
  updateReadingModeIndicator();

  setText('#rationale-lines',interpretation.rationale?.lines||interpretation.primary?.meaning||'');
  setText('#rationale-transition',interpretation.rationale?.transition||'Основна гексаграма описує стан, а додаткова — можливий напрям зміни.');
  setText('#primary-details-title',`Основна гексаграма №${result.primary.number} — ${result.primary.name}`);
  setText('#primary-meaning',interpretation.primary.meaning);
  setText('#primary-caution',interpretation.primary.caution);

  renderChangingLines(interpretation.lines);
  setText('#changing-details-title',interpretation.lines.length?`Змінні лінії (${interpretation.lines.length})`:'Змінні лінії відсутні');

  setText('#secondary-details-title',`Додаткова гексаграма №${result.secondary.number} — ${result.secondary.name}`);
  setText('#secondary-meaning',interpretation.secondary.meaning);
  $('#secondary-details').classList.toggle('hidden',!hasChanges);

  const transition=interpretation.transition;
  setText('#transition-title',transition.exact?'Готовий текст переходу':'Повний розбір переходу');
  setText('#transition-summary',transition.summary);
  setText('#transition-change',transition.change);
  $('#answer-result').classList.remove('hidden');
  closeKnowledgeSections();
}
function renderComplete(result,question){
  $('#snapshot-text-details').classList.add('hidden');
  setText('#snapshot-full-text','');
  setText('#hex-name',`Гексаграма №${result.primary.number} — ${result.primary.name}`);
  setText('#hex-description',result.positions.length
    ? `Змінні лінії: ${result.positions.join(', ')}. Нижче подано спочатку коротку відповідь, а потім — подробиці.`
    : 'Змінних ліній немає. Нижче подано коротку відповідь і подробиці основної гексаграми.');
  setText('#question-view',`Питання: «${question}»`);
  $('#question-view').classList.remove('hidden');
  renderLines($('#secondary-hexagram'),result.changed);
  renderInterpretationResult(result,result.positions.length>0);
}
function renderCurrent(){
  renderLines($('#hexagram'),state.lines);
  $('#empty-symbol').classList.toggle('hidden',state.lines.length>0);
  const complete=state.lines.length===6;
  const question=$('#question').value.trim();
  $('#undo-button').disabled=state.lines.length===0||complete||Boolean(state.openedHistoryItem);
  button.disabled=complete||Boolean(state.openedHistoryItem);
  setText('#progress',complete?'Гексаграму завершено':state.lines.length?`Створено ліній: ${state.lines.length} із 6`:'Очікується перша лінія');
  setText('#cast-label',complete?'Рекомендацію сформовано':state.lines.length?'Подвійний тап для наступної лінії':'Подвійний тап для першої лінії');
  if(!complete){
    setText('#hex-name','Нове звернення');
    setText('#hex-description',question?'Зробіть шість подвійних тапів. Кожен жест викидає три монети й створює одну лінію знизу вгору.':'Спочатку введіть запитання. Без сформульованого запиту монети не викидаються.');
    $('#question-view').classList.add('hidden');
    $('#answer-result').classList.add('hidden');
    $('#history-view-actions').classList.add('hidden');
    return;
  }
  renderComplete(currentResult(),question);
}
function showOriginalSnapshotText(item){
  const savedText=item?.snapshot?.fullText;
  if(!savedText)return;
  setText('#snapshot-full-text',savedText);
  $('#snapshot-text-details').classList.remove('hidden');
}
function renderSnapshot(item){
  const snap=item.snapshot;
  const source=item.interpretationSource??{};
  const savedPreferences={context:source.context||'general',mode:source.mode||(source.style==='classic'?'classic':'practical'),collection:source.libraryId||'official'};
  if(hasLegacyMapping(item)){
    const corrected=currentResult(item.casting.lines,savedPreferences);
    renderLines($('#hexagram'),item.casting.lines);
    renderComplete(corrected,item.question);
    state.displayingSnapshot=false;
    setText('#snapshot-info','Цей запис створено версією до 3.4, де верхня і нижня триграми помилково мінялися місцями під час визначення номера. Показано виправлене трактування за збереженими шістьма лініями. Старий текст залишено нижче лише як архівний.');
    showOriginalSnapshotText(item);
    return;
  }
  if(!snap?.interpretation){
    renderComplete(currentResult(item.casting.lines,savedPreferences),item.question);
    state.displayingSnapshot=false;
    setText('#snapshot-info','Цей старий запис не містить повного знімка. Показано відновлення за доступною бібліотекою.');
    return;
  }
  const base=currentResult(item.casting.lines,savedPreferences);
  base.primary={...base.primary,...snap.primary};
  base.secondary={...base.secondary,...snap.secondary};
  base.interpretation=clone(snap.interpretation);
  renderLines($('#hexagram'),item.casting.lines);
  renderComplete(base,item.question);
  state.displayingSnapshot=true;
  setText('#snapshot-info',`Показано інтерпретацію, збережену ${new Date(snap.capturedAt||item.createdAt).toLocaleString('uk-UA')}. Бібліотека ${source.libraryId||'невідома'} ${source.libraryVersion||''}; рушій ${source.engineVersion||'попередній'}.`);
  showOriginalSnapshotText(item);
}
function openHistoryItem(item){
  state.openedHistoryItem=item;
  state.lines=clone(item.casting.lines);
  state.lastTap=0;
  clearTimeout(state.tapTimer);
  $('#question').value=item.question||'';
  $('#question').readOnly=true;
  renderSnapshot(item);
  $('#history-view-actions').classList.remove('hidden');
  switchTab('divination');
  setTimeout(()=>$('#answer-result').scrollIntoView({behavior:'smooth',block:'start'}),100);
  showToast('Відкрито збережену інтерпретацію');
}
async function removeHistoryItem(id){
  await deleteStoredHistoryItem(id);
  state.history=state.history.filter(item=>item.id!==id);
  renderHistory();
  showToast('Запис видалено');
}
function renderHistory(){
  const list=$('#history-list');
  list.innerHTML='';
  if(!state.history.length){list.innerHTML='<p class="empty-history">Історія поки порожня</p>';return}
  state.history.forEach(item=>{
    const lines=item.casting?.lines||[];
    const primary=getHexagramData(canonicalHexagramNumber(lines)||item.casting?.primaryHexagram);
    const card=document.createElement('article');
    card.className='history-item';card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label',`Відкрити запис: ${item.question||primary.name}`);
    const mini=document.createElement('div');renderLines(mini,lines,true);card.appendChild(mini);
    const title=document.createElement('strong');title.textContent=`№${primary.number} ${item.snapshot?.primary?.name||primary.name}`;card.appendChild(title);
    const question=document.createElement('div');question.className='meta history-question';question.textContent=item.question||'Без конкретного питання';card.appendChild(question);
    const date=document.createElement('div');date.className='meta';date.textContent=new Date(item.createdAt).toLocaleString('uk-UA');card.appendChild(date);
    const actions=document.createElement('div');actions.className='history-actions';
    const open=document.createElement('button');open.type='button';open.className='history-open';open.textContent='Відкрити';open.addEventListener('click',event=>{event.stopPropagation();openHistoryItem(item)});
    const remove=document.createElement('button');remove.type='button';remove.className='history-delete';remove.textContent='Видалити';remove.addEventListener('click',async event=>{event.stopPropagation();if(confirm('Видалити цей запис з історії?'))await removeHistoryItem(item.id)});
    actions.append(open,remove);card.appendChild(actions);
    card.addEventListener('click',()=>openHistoryItem(item));
    card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openHistoryItem(item)}});
    list.appendChild(card);
  });
}
function reset(){
  state.lines=[];state.openedHistoryItem=null;state.displayingSnapshot=false;state.lastTap=0;clearTimeout(state.tapTimer);
  $('#snapshot-text-details').classList.add('hidden');setText('#snapshot-full-text','');
  $('#question').value='';$('#question').readOnly=false;$('#history-view-actions').classList.add('hidden');renderCurrent();
}
async function addLine(){
  if(state.busy||state.lines.length===6||state.openedHistoryItem)return;
  const question=$('#question').value.trim();
  if(!question){$('#question').focus();showToast('Спочатку введіть запитання');navigator.vibrate?.([35,45,35]);return}
  state.busy=true;button.classList.add('pressed');
  try{
    const line=await castThreeCoins();state.lines.push(line);renderCurrent();navigator.vibrate?.(35);
    if(state.lines.length===6){
      const result=currentResult();
      const snapshot=createSnapshot(result);
      const record={
        id:createId(),schemaVersion:5,createdAt:new Date().toISOString(),question,
        casting:{method:'three-coins',lines:clone(state.lines),primaryHexagram:result.primary.number,resultingHexagram:result.secondary.number,changingLines:result.positions},
        interpretationSource:{libraryId:state.preferences.collection||'official',libraryVersion:LIBRARY_VERSION,engineVersion:ENGINE_VERSION,appVersion:APP_VERSION,mappingVersion:MAPPING_VERSION,context:state.preferences.context,mode:state.preferences.mode,transitionId:`${result.primary.number}-${result.secondary.number}`},
        snapshot
      };
      await saveHistoryItem(record);state.history.unshift(record);renderHistory();showToast('Готово: ясну рекомендацію збережено');
      setTimeout(()=>$('#answer-result').scrollIntoView({behavior:'smooth',block:'start'}),120);
    }else{
      setText('#cast-label',`Лінія ${state.lines.length}: ${line.type==='yang'?'Ян':'Інь'} (${line.value}) · подвійний тап далі`);
      showToast(`Монети: ${line.coins.join(' + ')} = ${line.value}`);
    }
  }finally{
    setTimeout(()=>button.classList.remove('pressed'),100);state.busy=false;
  }
}

['pointerdown','pointermove'].forEach(type=>button.addEventListener(type,collectEntropy,{passive:true}));
button.addEventListener('pointerup',event=>{
  event.preventDefault();if(button.disabled)return;
  const now=performance.now();const second=state.lastTap>0&&now-state.lastTap<=480;
  if(second){clearTimeout(state.tapTimer);state.lastTap=0;addLine();return}
  state.lastTap=now;clearTimeout(state.tapTimer);state.tapTimer=setTimeout(()=>state.lastTap=0,500);
});
button.addEventListener('click',event=>event.preventDefault());
button.addEventListener('dblclick',event=>event.preventDefault());
$('#question').addEventListener('input',renderCurrent);
$('#undo-button').addEventListener('click',()=>{state.lines.pop();renderCurrent()});
$('#reset-button').addEventListener('click',reset);
document.querySelectorAll('.nav-btn').forEach(navButton=>navButton.addEventListener('click',()=>switchTab(navButton.dataset.tab)));
$('#reinterpret-button').addEventListener('click',()=>{
  if(!state.openedHistoryItem)return;
  const result=currentResult(state.openedHistoryItem.casting.lines,state.preferences);
  renderComplete(result,state.openedHistoryItem.question);
  state.displayingSnapshot=false;
  setText('#snapshot-info',`Показано нове переосмислення за поточною бібліотекою ${LIBRARY_VERSION} і поточними налаштуваннями. Збережений історичний знімок не змінено.`);
  showOriginalSnapshotText(state.openedHistoryItem);
  showToast('Переосмислено без зміни історії');
});
$('#export-history').addEventListener('click',()=>downloadHistory(state.history));
$('#import-history').addEventListener('change',async event=>{
  try{
    const imported=await parseHistoryFile(event.target.files[0]);await replaceHistory(imported);state.history=await loadHistory();renderHistory();showToast('Історію імпортовано в IndexedDB');
  }catch(error){showToast(error.message||'Не вдалося імпортувати')}
  finally{event.target.value=''}
});
['context','mode','collection'].forEach(name=>{
  const element=$(`#${name}-select`);element.value=state.preferences[name];
  element.addEventListener('change',()=>{
    state.preferences[name]=element.value;
    savePreferences(state.preferences);

    if(name==='mode'){
      // Режим не змінює зміст трактування — лише порядок його читання.
      // Тому перемикаємо DOM без повторного генерування тексту.
      applyReadingMode(state.preferences.mode);
      updateReadingModeIndicator();
      showToast(state.preferences.mode==='classic'?'Класичний режим':'Практичний режим');
      return;
    }

    // Контекст/бібліотека впливають на зміст, тому для них потрібен новий рендер.
    if(state.openedHistoryItem&&!state.displayingSnapshot){
      const result=currentResult(state.openedHistoryItem.casting.lines,state.preferences);
      renderComplete(result,state.openedHistoryItem.question);
      showOriginalSnapshotText(state.openedHistoryItem);
    }else if(!state.openedHistoryItem){
      renderCurrent();
  updateReadingModeIndicator();
    }
    showToast('Налаштування збережено');
  });
});

async function init(){
  if(!validateCanonicalMapping()){console.error('Помилка контрольної таблиці Вень-вана');showToast('Помилка таблиці гексаграм');return}
  try{
    const migrated=await migrateLegacyHistory();state.history=await loadHistory();renderHistory();if(migrated)showToast(`Перенесено записів у нову базу: ${migrated}`);
  }catch(error){console.error(error);showToast('Не вдалося відкрити локальну базу історії')}
  renderCurrent();
  if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(console.error));
}
init();
