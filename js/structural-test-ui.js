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

function stageLead(position){
  switch(position){
    case 1:return 'Ця зміна лише зароджується, тому її напрям важливіший за швидкість дії.';
    case 2:return 'Зміна ще визріває всередині ситуації, і зараз важливо надати їй ясної та врівноваженої форми.';
    case 3:return 'Ситуація дійшла до межі між внутрішнім визріванням і зовнішньою дією.';
    case 4:return 'Зміна вже переходить із внутрішнього наміру в зовнішню дію.';
    case 5:return 'Зміна досягла зрілої, помітної фази, де особливо важливо зберегти центр і міру.';
    case 6:return 'Процес підійшов до своєї межі, тому тепер важливо відрізнити завершення від надмірного продовження.';
    default:return '';
  }
}

function structuralNuance(structural,item){
  const parts=[];
  if(!item.appropriate&&item.correspondence)parts.push('У цій точці є певна внутрішня суперечність, але структура показує відгук з іншого боку ситуації.');
  else if(!item.appropriate&&!item.correspondence)parts.push('У цій точці є внутрішня суперечність, тому рішення потребує додаткової перевірки перед дією.');
  else if(item.appropriate&&item.correspondence)parts.push('Будова ситуації підтримує цей напрям, якщо не форсувати його понад міру.');
  else if(item.appropriate&&!item.correspondence)parts.push('Позиція дає внутрішню опору, хоча прямий відгук з іншої частини ситуації неочевидний.');

  if(structural.minority===item.type&&item.central)parts.push('Саме ця лінія має особливу вагу: центральне положення поєднується тут із рідкісною для гексаграми якістю.');
  else if(structural.minority===item.type)parts.push('Її якість вирізняється в будові гексаграми, тому ця точка може бути одним із головних акцентів зміни.');
  else if(item.central)parts.push('Центральне положення підсилює потребу в рівновазі та мірі.');
  return parts.join(' ');
}

function integratedText(primaryNumber,line){
  const structural=getStructuralContext(primaryNumber,[line.position]);
  const item=structural?.lines?.[0];
  if(!item)return null;
  const meaning=String(line.meaning||'').trim();
  const advice=String(line.advice||'').trim();
  const explanation=[stageLead(item.position),meaning,structuralNuance(structural,item)].filter(Boolean).join(' ');
  return {explanation,advice};
}

function markExperiment(){
  const result=$('#answer-result');
  if(!result||result.classList.contains('hidden'))return;
  if(!$('#structural-test-badge')){
    const badge=document.createElement('p');
    badge.id='structural-test-badge';
    badge.className='structural-test-badge';
    badge.textContent='Експеримент: зміст лінії + структура';
    result.querySelector('.progress')?.insertAdjacentElement('afterend',badge);
  }
}

function decorateChangingLines(){
  const primaryNumber=numberFrom($('#primary-details-title')?.textContent);
  if(!primaryNumber)return;
  const primary=getHexagramData(primaryNumber);
  const variants=Array.from({length:6},(_,i)=>getChangingLine(primary,i+1));

  document.querySelectorAll('#changing-lines-list .changing-line-card').forEach(card=>{
    card.querySelector('.structural-line-note')?.remove();
    const title=card.querySelector('strong')?.textContent?.trim()||'';
    const paragraphs=Array.from(card.querySelectorAll(':scope > p'));
    const originalMeaning=paragraphs[0]?.dataset.originalText||paragraphs[0]?.textContent?.trim()||'';
    const line=variants.find(item=>item.title===title&&item.meaning===originalMeaning)||variants.find(item=>item.title===title)||variants.find(item=>item.meaning===originalMeaning);
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
