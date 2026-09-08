import {getHexagramData} from '../data/hexagrams.js';
import {getChangingLine} from '../data/changing-lines.js';

const $=selector=>document.querySelector(selector);
const numberFrom=text=>{const m=String(text??'').match(/№\s*(\d+)/);return m?Number(m[1]):null};
const firstSentence=text=>{const value=String(text??'').trim();const m=value.match(/^.*?[.!?](?:\s|$)/);return (m?.[0]??value).trim()};
const lowerFirst=text=>{const value=String(text??'').trim();return value?value[0].toLocaleLowerCase('uk-UA')+value.slice(1):value};
const STAGES={1:'Початок',2:'Формування',3:'Межа внутрішнього етапу',4:'Вихід у дію',5:'Зрілий прояв',6:'Завершення'};

function ensureTestStyles(){
  if($('#structural-test-styles'))return;
  const s=document.createElement('style');
  s.id='structural-test-styles';
  s.textContent=`html{min-height:100%;background:#0f172a}body{min-height:100%;padding-bottom:112px!important}.nav-bar{position:fixed!important;left:0!important;right:0!important;bottom:0!important;transform:none!important;margin:0 auto!important;width:100%!important;max-width:520px!important;border-radius:18px 18px 0 0!important;border-bottom:0!important;padding-bottom:max(8px,env(safe-area-inset-bottom))!important}.structural-test-badge{display:none!important}.answer-card>.progress{opacity:.62;font-size:.72rem;letter-spacing:.08em;margin-bottom:.65rem}.answer-summary{margin-top:.15rem!important;padding:1rem 1rem 1.05rem!important;border-color:rgba(245,158,11,.55)!important;background:linear-gradient(180deg,rgba(245,158,11,.075),rgba(15,23,42,.08))!important}.answer-summary h2{font-size:1.18rem!important;margin-bottom:.5rem!important}.answer-summary p{font-size:1.02rem!important;line-height:1.55!important}.answer-steps{display:flex!important;flex-direction:column!important;gap:.65rem!important;margin-top:.7rem!important}.answer-step{display:block!important;grid-template-columns:none!important;order:1!important;padding:.8rem .9rem!important;background:rgba(15,23,42,.16)!important}.answer-step-action{order:2!important;border-color:rgba(245,158,11,.48)!important;background:rgba(245,158,11,.035)!important}.answer-step h3{font-size:1rem!important}.answer-step p{line-height:1.5!important;width:100%!important;max-width:none!important}.answer-step .step-number{display:none!important}.answer-step>div{display:block!important;width:100%!important;min-width:0!important;max-width:none!important}.action-paths{display:grid;gap:.55rem;margin-top:.45rem;width:100%}.action-path{display:block;padding:.65rem .75rem;border:1px solid rgba(148,163,184,.25);border-left:3px solid rgba(245,158,11,.72);border-radius:9px;background:rgba(15,23,42,.2);line-height:1.5}.action-path strong{display:block;color:#f59e0b;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.16rem}.action-path-note{display:block;margin:.5rem .05rem 0!important;color:#94a3b8;font-size:.86rem;line-height:1.45!important}.transition-path{margin:.25rem 0 0;padding:.8rem .9rem;border:1px solid rgba(245,158,11,.3);border-radius:12px;background:rgba(15,23,42,.28)}.transition-path-title{margin:0 0 .65rem;color:#f59e0b;font-weight:700}.transition-path-row{margin:.35rem 0;color:#e2e8f0;line-height:1.45}.transition-path-label{display:block;color:#94a3b8;font-size:.76rem;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.08rem}.logic-stage-list{display:grid;gap:.32rem;margin:.7rem 0}.logic-stage{display:flex;align-items:center;gap:.55rem;padding:.42rem .5rem;border-radius:9px;color:#94a3b8;border:1px solid transparent}.logic-stage-number{display:grid;place-items:center;width:1.7rem;height:1.7rem;flex:0 0 1.7rem;border:1px solid rgba(148,163,184,.28);border-radius:50%;font-weight:750;font-size:.82rem}.logic-stage-name{font-weight:650}.logic-stage.active{color:#f8fafc;background:rgba(245,158,11,.07);border-color:rgba(245,158,11,.34)}.logic-stage.active .logic-stage-number{color:#f59e0b;border-color:rgba(245,158,11,.7)}.logic-stage-active{margin-left:auto;color:#f59e0b;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap}.transition-path-arrow{text-align:center;color:#64748b;margin:.18rem 0;font-size:1.05rem}.transition-path-conclusion{margin:.7rem 0 0;padding:.65rem .7rem;border-top:1px solid rgba(148,163,184,.22);color:#f8fafc;line-height:1.5}.transition-path-conclusion strong{color:#f59e0b}.structural-test-hidden-rationale{display:none!important}@media(max-width:699px){body{padding-bottom:108px!important}.nav-bar{padding-bottom:max(7px,env(safe-area-inset-bottom))!important}.answer-summary{padding:.9rem!important}.answer-step{padding:.75rem .8rem!important}.logic-stage-active{font-size:.66rem}}`;
  document.head.appendChild(s);
}

function markExperiment(){$('#structural-test-badge')?.remove()}
function changingPositions(){return [...document.querySelectorAll('#changing-lines-list .changing-line-card')].map(card=>Number(card.querySelector('.changing-line-badge')?.textContent?.trim())).filter(p=>Number.isInteger(p)&&p>=1&&p<=6)}
function lineData(hex,p){return getChangingLine(hex,p)}

function transitionConclusion(primary,secondary,positions){
  const lines=positions.map(p=>lineData(primary,p)).filter(Boolean);if(!lines.length)return '';
  const actions=lines.map(line=>firstSentence(line.advice||line.meaning||line.title)).filter(Boolean);
  let movement='';
  if(actions.length===1)movement=actions[0];
  else if(actions.length===2)movement=`Спочатку ${lowerFirst(actions[0])} Потім ${lowerFirst(actions[1])}`;
  else movement=`Зміна проходить через кілька кроків: ${actions.map(lowerFirst).join(' ')}`;
  const destination=secondary?` Напрямок цього переходу — «${secondary.name}».`:'';
  return `${movement}${destination}`.trim();
}

function splitSentences(text){return String(text??'').trim().match(/[^.!?…]+(?:[.!?…]+|$)/g)?.map(s=>s.trim()).filter(Boolean)||[]}
function renderActionPaths(){
  const p=$('#answer-action');if(!p)return;if(p.querySelector('.action-paths'))return;
  const text=p.textContent.trim();const marker='Це лише частина шляхів, які видно звідси.';const markerIndex=text.indexOf(marker);
  if(markerIndex<0){p.removeAttribute('data-crossroads');return;}
  const pathsText=text.slice(0,markerIndex).trim();const tail=text.slice(markerIndex).trim();const paths=splitSentences(pathsText);if(paths.length<2)return;
  p.dataset.crossroads='1';p.innerHTML=`<span class="action-paths">${paths.map((path,i)=>`<span class="action-path"><strong>Шлях ${i+1}</strong>${path}</span>`).join('')}</span><span class="action-path-note">${tail}</span>`;
}

function hideRepeatedRationale(){const rationale=$('#rationale-lines');if(rationale)rationale.classList.add('structural-test-hidden-rationale');const transition=$('#rationale-transition');if(transition)transition.classList.add('structural-test-hidden-rationale')}
function clearTransitionPath(){$('#transition-path-experiment')?.remove()}
function stageMap(positions){const active=new Set(positions);return Object.entries(STAGES).map(([n,name])=>{const p=Number(n);return `<div class="logic-stage${active.has(p)?' active':''}"><span class="logic-stage-number">${p}</span><span class="logic-stage-name">${name}</span>${active.has(p)?'<span class="logic-stage-active">активна зміна</span>':''}</div>`}).join('')}

function renderTransitionPath(){
  const primaryNumber=numberFrom($('#primary-details-title')?.textContent);const changingTitle=$('#changing-details-title')?.textContent||'';const secondaryDetails=$('#secondary-details');const hasVisibleSecondary=Boolean(secondaryDetails&&!secondaryDetails.classList.contains('hidden'));const positions=changingPositions();
  if(!primaryNumber){clearTransitionPath();return;}
  const primary=getHexagramData(primaryNumber);if(!primary){clearTransitionPath();return;}
  const logicBody=$('#rationale-lines')?.parentElement;if(!logicBody){clearTransitionPath();return;}
  let box=$('#transition-path-experiment');if(!box){box=document.createElement('section');box.id='transition-path-experiment';box.className='transition-path';logicBody.appendChild(box)}else if(box.parentElement!==logicBody)logicBody.appendChild(box);
  const hasChanges=/Змінні лінії \(\d+\)/.test(changingTitle)&&positions.length>0;
  const stages=stageMap(hasChanges?positions:[]);
  if(!hasChanges){
    box.innerHTML=`<p class="transition-path-title">Логіка стану</p><p class="transition-path-row"><span class="transition-path-label">Загальний стан</span><strong>№${primaryNumber} — ${primary.name}</strong></p><div class="logic-stage-list">${stages}</div><p class="transition-path-conclusion"><strong>Разом:</strong> Змінних ліній немає. Усі шість позицій показують структуру процесу, але жодна зараз не є активною точкою переходу.</p>`;
    return;
  }
  const secondaryNumber=hasVisibleSecondary?numberFrom($('#secondary-details-title')?.textContent):null;const secondary=secondaryNumber?getHexagramData(secondaryNumber):null;const together=transitionConclusion(primary,secondary,positions);
  box.innerHTML=`<p class="transition-path-title">Логіка читання</p><p class="transition-path-row"><span class="transition-path-label">Загальний стан</span><strong>№${primaryNumber} — ${primary.name}</strong></p><div class="logic-stage-list">${stages}</div>${secondary?`<div class="transition-path-arrow">↓</div><p class="transition-path-row"><span class="transition-path-label">Новий стан</span><strong>№${secondaryNumber} — ${secondary.name}</strong></p>`:''}${together?`<p class="transition-path-conclusion"><strong>Разом:</strong> ${together}</p>`:''}`;
}

function restoreLineCards(){const h=numberFrom($('#primary-details-title')?.textContent);const primary=h?getHexagramData(h):null;if(!primary)return;document.querySelectorAll('#changing-lines-list .changing-line-card').forEach(card=>{card.querySelector('.accent-chip')?.remove();const p=Number(card.querySelector('.changing-line-badge')?.textContent?.trim());if(!Number.isInteger(p))return;const line=getChangingLine(primary,p);if(!line)return;const ps=Array.from(card.querySelectorAll(':scope > p'));if(ps[0])ps[0].textContent=String(line.meaning||'').trim();if(ps[1])ps[1].textContent=String(line.advice||'').trim()})}

function render(){ensureTestStyles();markExperiment();restoreLineCards();renderActionPaths();hideRepeatedRationale();renderTransitionPath()}
ensureTestStyles();render();
const target=$('#answer-result');if(target){let timer=0;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(render,40)}).observe(target,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});}
