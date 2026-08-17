import './install.js';
import './library.js';
import {getHexagramCycle} from '../data/hexagram-cycles.js';
import {getClassicalInterpretations} from '../data/classical-sources.js';
import {getHexagramData,canonicalHexagramNumber} from '../data/hexagrams.js';
import {getChangingLine} from '../data/changing-lines.js';
import {buildCrossroads} from '../data/crossroads.js';

const $=selector=>document.querySelector(selector);
const numberFrom=text=>{
  const match=String(text??'').match(/№\s*(\d+)/);
  return match?Number(match[1]):null;
};
const formatCycle=cycle=>Array.isArray(cycle)&&cycle.length?cycle.join(' → '):'Цикл для цієї гексаграми ще доповнюється.';
const setIfChanged=(element,value)=>{
  if(element&&element.textContent!==value)element.textContent=value;
};

function ensureDisclosureIndicatorStyles(){
  if(document.querySelector('#v41-disclosure-indicator-fix'))return;
  const style=document.createElement('style');
  style.id='v41-disclosure-indicator-fix';
  style.textContent=`
    .knowledge-details > summary::after{content:'+'}
    .knowledge-details[open] > summary::after{content:'−'}
    .line-classical-details > summary::after{content:'+' !important}
    .line-classical-details[open] > summary::after{content:'−' !important}
    .crossroads-preview{margin:1rem 0;padding:1rem;border:1px solid currentColor;border-radius:14px}
    .crossroads-preview h3{margin-top:0}
    .crossroads-preview ul{padding-left:1.25rem}
    .crossroads-preview li+li{margin-top:.55rem}
    .crossroads-open{font-style:italic;opacity:.82}
    .crossroads-test-button{margin-top:.8rem;width:100%}
  `;
  document.head.appendChild(style);
}

function ensureClassicalDetails(parent,id,title){
  let details=document.querySelector(`#${id}`);
  if(details)return details;
  details=document.createElement('details');
  details.id=id;
  details.className='line-classical-details state-classical-details';
  const summary=document.createElement('summary');
  summary.textContent=title;
  const body=document.createElement('div');
  body.className='line-classical-body';
  const wh=document.createElement('h5');wh.textContent='Ріхард Вільгельм';
  const wp=document.createElement('p');wp.dataset.role='wilhelm';
  const sh=document.createElement('h5');sh.textContent='Юліан Шуцький';
  const sp=document.createElement('p');sp.dataset.role='shchutsky';
  const note=document.createElement('small');note.textContent='Стислі авторські перекази, не цитати.';
  body.append(wh,wp,sh,sp,note);
  details.append(summary,body);
  parent?.appendChild(details);
  return details;
}

function organizeKnowledge(){
  const primaryBody=$('#primary-meaning')?.parentElement;
  const secondaryBody=$('#secondary-meaning')?.parentElement;
  const oldClassics=$('#classical-section');

  if(primaryBody&&oldClassics&&oldClassics.parentElement!==primaryBody){
    let wrapper=$('#primary-classics-details');
    if(!wrapper){
      wrapper=document.createElement('details');
      wrapper.id='primary-classics-details';
      wrapper.className='line-classical-details state-classical-details';
      const summary=document.createElement('summary');
      summary.textContent='Класичні трактування стану';
      wrapper.appendChild(summary);
      primaryBody.appendChild(wrapper);
    }
    wrapper.appendChild(oldClassics);
  }

  if(secondaryBody){
    ensureClassicalDetails(secondaryBody,'secondary-classics-details','Класичне трактування нового стану');
  }
}

function organizeConclusion(){
  const steps=$('#answer-result .answer-steps');
  const crossroads=$('#answer-action')?.closest('.answer-step');
  const development=$('#answer-development')?.closest('.answer-step');
  if(!steps||!crossroads||!development)return;
  setIfChanged(development.querySelector('h3'),'Напрямок розвитку');
  setIfChanged(development.querySelector('.step-number'),'1');
  setIfChanged(crossroads.querySelector('h3'),'На роздоріжжі');
  setIfChanged(crossroads.querySelector('.step-number'),'2');
  if(steps.firstElementChild!==development)steps.append(development,crossroads);
}

function renderSecondaryClassics(number){
  const details=$('#secondary-classics-details');
  if(!details)return;
  const classics=number?getClassicalInterpretations(number):null;
  const wilhelm=classics?.wilhelm||'Класичний текст для цієї гексаграми ще не додано.';
  const shchutsky=classics?.shchutsky||'Класичний текст для цієї гексаграми ще не додано.';
  setIfChanged(details.querySelector('[data-role="wilhelm"]'),wilhelm);
  setIfChanged(details.querySelector('[data-role="shchutsky"]'),shchutsky);
}

function renderProgressiveDisclosure(){
  ensureDisclosureIndicatorStyles();
  organizeKnowledge();
  organizeConclusion();
  const primaryNumber=numberFrom($('#primary-details-title')?.textContent);
  const secondaryNumber=numberFrom($('#secondary-details-title')?.textContent);
  setIfChanged($('#primary-cycle'),formatCycle(getHexagramCycle(primaryNumber)));
  setIfChanged($('#secondary-cycle'),formatCycle(getHexagramCycle(secondaryNumber)));
  renderSecondaryClassics(secondaryNumber);
}

function libraryLinesFromFigure(){
  return [...document.querySelectorAll('#library-detail .library-hexagram .library-line')].map(line=>({
    type:line.classList.contains('yang')?'yang':'yin',changing:false
  }));
}

function resultingHexagramForLibraryLine(position){
  const lines=libraryLinesFromFigure();
  if(lines.length!==6)return null;
  const changed=lines.map((line,index)=>index===position-1?{...line,type:line.type==='yang'?'yin':'yang'}:line);
  const number=canonicalHexagramNumber(changed);
  return number?getHexagramData(number):null;
}

function showLibraryCrossroads(position){
  const detail=$('#library-detail');
  const primaryNumber=numberFrom(detail?.querySelector('.progress')?.textContent);
  if(!detail||!primaryNumber)return;
  const primary=getHexagramData(primaryNumber);
  const secondary=resultingHexagramForLibraryLine(position);
  if(!secondary)return;
  const line=getChangingLine(primary,position);
  const crossroads=buildCrossroads({primary,secondary,lines:[line]});

  let preview=detail.querySelector('#library-crossroads-preview');
  if(!preview){
    preview=document.createElement('section');
    preview.id='library-crossroads-preview';
    preview.className='crossroads-preview';
    const summary=detail.querySelector('.library-summary-block');
    summary?.insertAdjacentElement('afterend',preview);
  }
  preview.replaceChildren();
  const eyebrow=document.createElement('p');eyebrow.className='progress';eyebrow.textContent=`Приклад · змінюється лінія ${position}`;
  const title=document.createElement('h3');title.textContent='На роздоріжжі';
  const transition=document.createElement('p');transition.textContent=`Стан «${primary.name}» через цю рухому точку переходить у напрямку «${secondary.name}».`;
  const list=document.createElement('ul');
  crossroads.paths.forEach(path=>{const item=document.createElement('li');item.textContent=path;list.appendChild(item)});
  const open=document.createElement('p');open.className='crossroads-open';open.textContent=crossroads.open;
  preview.append(eyebrow,title,transition,list,open);
  preview.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function decorateLibraryLines(){
  const detail=$('#library-detail');
  if(!detail||detail.classList.contains('hidden'))return;
  detail.querySelectorAll('.library-line-details').forEach((details,index)=>{
    const body=details.querySelector('.library-line-body');
    if(!body||body.querySelector('.crossroads-test-button'))return;
    const button=document.createElement('button');
    button.type='button';
    button.className='secondary-button crossroads-test-button';
    button.textContent='Показати підсумок «Роздоріжжя»';
    button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();showLibraryCrossroads(index+1)});
    body.appendChild(button);
  });
}

const target=$('#answer-result');
if(target){
  let scheduled=false;
  const scheduleRender=()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      renderProgressiveDisclosure();
    });
  };
  const observer=new MutationObserver(scheduleRender);
  observer.observe(target,{subtree:true,childList:true,characterData:true});
  renderProgressiveDisclosure();
}

const libraryTarget=$('#library-detail');
if(libraryTarget){
  let scheduled=false;
  const scheduleLibrary=()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;decorateLibraryLines()});
  };
  new MutationObserver(scheduleLibrary).observe(libraryTarget,{subtree:true,childList:true});
  scheduleLibrary();
}
