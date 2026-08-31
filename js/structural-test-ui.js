import {getStructuralContext} from '../data/structural-context.js';
import {getHexagramData} from '../data/hexagrams.js';
import {getChangingLine} from '../data/changing-lines.js';

const $=selector=>document.querySelector(selector);
const numberFrom=text=>{const match=String(text??'').match(/№\s*(\d+)/);return match?Number(match[1]):null};

function ensureTestStyles(){
  if(document.querySelector('#structural-test-styles'))return;
  const style=document.createElement('style');
  style.id='structural-test-styles';
  style.textContent=`
    body{padding-bottom:calc(118px + env(safe-area-inset-bottom)) !important}
    .nav-bar{bottom:0 !important;width:100% !important;max-width:520px !important;border-radius:18px 18px 0 0 !important;border-bottom:0 !important}
    .structural-test-badge{margin:.4rem 0 .8rem;padding:.5rem .7rem;border:1px dashed rgba(245,158,11,.55);border-radius:10px;color:#f59e0b;font-size:.78rem;text-align:center}
    .structural-line-note{margin:.7rem 0 .1rem;padding:.75rem .8rem;border-left:3px solid #f59e0b;border-radius:0 10px 10px 0;background:rgba(245,158,11,.07);font-size:.86rem;line-height:1.5}
    .structural-line-note strong{display:block;margin-bottom:.25rem;color:#f59e0b}
    @media(max-width:699px){body{padding-bottom:calc(112px + env(safe-area-inset-bottom)) !important}.nav-bar{padding-bottom:calc(8px + env(safe-area-inset-bottom)) !important}}
  `;
  document.head.appendChild(style);
}

function structuralSentence(primaryNumber,position){
  const structural=getStructuralContext(primaryNumber,[position]);
  const item=structural?.lines?.[0];
  if(!item)return '';
  const parts=[`Це ${item.role}.`];
  parts.push(item.region==='inner'?'Подія ще формується переважно всередині ситуації.':'Її наслідки вже проявляються назовні.');
  parts.push(item.appropriate?'Характер лінії узгоджується з її місцем.':'Характер лінії не цілком узгоджується з її місцем, тому тут можливе внутрішнє напруження.');
  if(item.central)parts.push('Це центральна позиція: важливі рівновага й міра.');
  parts.push(item.correspondence?`Є природний відгук із ${item.partner}-ю лінією.`:`Із ${item.partner}-ю лінією немає полярного відгуку.`);
  if(structural.minority===item.type)parts.push('Цей тип лінії перебуває в меншості, тому може мати особливу смислову вагу.');
  return parts.join(' ');
}

function markExperiment(){
  const result=$('#answer-result');
  if(!result||result.classList.contains('hidden'))return;
  if(!$('#structural-test-badge')){
    const badge=document.createElement('p');
    badge.id='structural-test-badge';
    badge.className='structural-test-badge';
    badge.textContent='Експеримент: структурне читання увімкнено';
    result.querySelector('.progress')?.insertAdjacentElement('afterend',badge);
  }
}

function decorateChangingLines(){
  const primaryNumber=numberFrom($('#primary-details-title')?.textContent);
  if(!primaryNumber)return;
  const primary=getHexagramData(primaryNumber);
  const variants=Array.from({length:6},(_,i)=>getChangingLine(primary,i+1));
  document.querySelectorAll('#changing-lines-list .changing-line-card').forEach(card=>{
    if(card.querySelector('.structural-line-note'))return;
    const title=card.querySelector('strong')?.textContent?.trim()||'';
    const meaning=card.querySelector('p')?.textContent?.trim()||'';
    const line=variants.find(item=>item.title===title&&item.meaning===meaning)||variants.find(item=>item.title===title)||variants.find(item=>item.meaning===meaning);
    if(!line)return;
    const text=structuralSentence(primaryNumber,line.position);
    if(!text)return;
    const note=document.createElement('div');
    note.className='structural-line-note';
    const heading=document.createElement('strong');
    heading.textContent='Структура цієї лінії';
    const body=document.createElement('span');
    body.textContent=text;
    note.append(heading,body);
    card.appendChild(note);
  });
}

function render(){ensureTestStyles();markExperiment();decorateChangingLines()}
ensureTestStyles();
render();
const target=$('#answer-result');
if(target){let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;render()})}).observe(target,{subtree:true,childList:true,characterData:true})}
