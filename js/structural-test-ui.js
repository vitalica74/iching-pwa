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
    html{min-height:100%;background:#0f172a}
    body{min-height:100%;padding-bottom:112px !important}
    .nav-bar{position:fixed !important;left:0 !important;right:0 !important;bottom:0 !important;transform:none !important;margin:0 auto !important;width:100% !important;max-width:520px !important;border-radius:18px 18px 0 0 !important;border-bottom:0 !important;padding-bottom:max(8px,env(safe-area-inset-bottom)) !important}
    .structural-test-badge{margin:.4rem 0 .8rem;padding:.5rem .7rem;border:1px dashed rgba(245,158,11,.55);border-radius:10px;color:#f59e0b;font-size:.78rem;text-align:center}
    .integrated-reading{margin:.55rem 0 .25rem;font-size:1rem;line-height:1.55}
    .integrated-reading + .integrated-reading{margin-top:.7rem}
    @media(max-width:699px){body{padding-bottom:108px !important}.nav-bar{padding-bottom:max(7px,env(safe-area-inset-bottom)) !important}}
  `;
  document.head.appendChild(style);
}

const stageLead={
  1:'Ця зміна лише зароджується: спершу варто визначити її напрям, а не поспішати з дією.',
  2:'Зміна ще визріває всередині ситуації: зараз важливіше впорядкувати основу, ніж домагатися зовнішнього ефекту.',
  3:'Ситуація дійшла до межі між внутрішнім визріванням і зовнішньою дією.',
  4:'Зміна вже виходить назовні: намір переходить у взаємодію з реальними людьми й обставинами.',
  5:'Зміна досягла зрілої й помітної фази: її напрям уже має бути зрозумілим у зовнішньому прояві.',
  6:'Процес підійшов до межі: тепер важливо зрозуміти, що слід завершити, а що вже стало надмірним.'
};

function hasAny(text,words){
  const value=String(text||'').toLowerCase();
  return words.some(word=>value.includes(word));
}

function chooseNuance(structural,item,baseText){
  const minority=structural.minority===item.type;
  const balanceAlready=hasAny(baseText,['мір','рівнов','баланс','середин','центр','крайн']);
  const supportAlready=hasAny(baseText,['підтрим','опор','довір','підтвердж']);
  const cautionAlready=hasAny(baseText,['не посп','перевір','обереж','ризик','форс']);

  if(minority&&item.central&&!balanceAlready)return 'Саме тут зосереджена одна з головних тем зміни: важливо втримати ясний напрям без крайнощів.';
  if(minority)return 'Саме ця точка може виявитися одним із головних акцентів зміни, тому її не варто вважати другорядною.';
  if(item.central&&!balanceAlready)return 'Тепер важливо не посилювати крайнощі, а втримати ясний напрям і міру.';

  if(!item.appropriate&&!item.correspondence&&!cautionAlready)return 'Тут є внутрішня суперечність, а підтримка з іншого боку ситуації поки неочевидна, тому перед дією потрібна додаткова перевірка.';
  if(!item.appropriate&&item.correspondence)return 'Попри внутрішню суперечність, з іншого боку ситуації є відгук; цю напругу можна використати для переходу.';
  if(item.appropriate&&item.correspondence&&!supportAlready)return 'Напрям має достатню опору, тож рухатися далі можна без зайвого форсування.';
  if(item.appropriate&&!item.correspondence&&!supportAlready)return 'Напрям має внутрішню опору, хоча підтримка з іншого боку ситуації поки неочевидна.';
  return '';
}

function integratedText(primaryNumber,line){
  const structural=getStructuralContext(primaryNumber,[line.position]);
  const item=structural?.lines?.[0];
  if(!item)return null;
  const meaning=String(line.meaning||'').trim();
  const advice=String(line.advice||'').trim();
  const lead=stageLead[item.position]||'';
  const base=[lead,meaning].filter(Boolean).join(' ');
  const nuance=chooseNuance(structural,item,`${base} ${advice}`);
  return {explanation:[base,nuance].filter(Boolean).join(' '),advice};
}

function markExperiment(){
  const result=$('#answer-result');
  if(!result||result.classList.contains('hidden'))return;
  if(!$('#structural-test-badge')){
    const badge=document.createElement('p');
    badge.id='structural-test-badge';
    badge.className='structural-test-badge';
    badge.textContent='Експеримент: природне структурне читання';
    result.querySelector('.progress')?.insertAdjacentElement('afterend',badge);
  }
}

function resolveLine(card,primary){
  const badgeText=card.querySelector('.changing-line-badge')?.textContent?.trim()||'';
  const position=Number(badgeText);
  if(Number.isInteger(position)&&position>=1&&position<=6)return getChangingLine(primary,position);

  const variants=Array.from({length:6},(_,i)=>getChangingLine(primary,i+1));
  const title=card.querySelector('strong')?.textContent?.trim()||'';
  const paragraphs=Array.from(card.querySelectorAll(':scope > p'));
  const originalMeaning=paragraphs[0]?.dataset.originalText||paragraphs[0]?.textContent?.trim()||'';
  return variants.find(item=>item.title===title&&item.meaning===originalMeaning)
    ||variants.find(item=>item.title===title)
    ||variants.find(item=>item.meaning===originalMeaning)
    ||null;
}

function decorateChangingLines(){
  const primaryNumber=numberFrom($('#primary-details-title')?.textContent);
  if(!primaryNumber)return;
  const primary=getHexagramData(primaryNumber);
  if(!primary)return;

  document.querySelectorAll('#changing-lines-list .changing-line-card').forEach(card=>{
    card.querySelector('.structural-line-note')?.remove();
    const paragraphs=Array.from(card.querySelectorAll(':scope > p'));
    const line=resolveLine(card,primary);
    if(!line)return;
    const integrated=integratedText(primaryNumber,line);
    if(!integrated)return;

    if(paragraphs[0]){
      if(!paragraphs[0].dataset.originalText)paragraphs[0].dataset.originalText=paragraphs[0].textContent.trim();
      paragraphs[0].classList.add('integrated-reading');
      paragraphs[0].textContent=integrated.explanation;
    }
    if(paragraphs[1]&&integrated.advice){
      if(!paragraphs[1].dataset.originalText)paragraphs[1].dataset.originalText=paragraphs[1].textContent.trim();
      paragraphs[1].classList.add('integrated-reading');
      paragraphs[1].textContent=integrated.advice;
    }
  });
}

function render(){ensureTestStyles();markExperiment();decorateChangingLines()}
ensureTestStyles();
render();
const target=$('#answer-result');
if(target){let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;render()})}).observe(target,{subtree:true,childList:true,characterData:true})}
