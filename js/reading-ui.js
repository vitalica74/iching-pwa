import './install.js';
import './library.js';
import {getHexagramCycle} from '../data/hexagram-cycles.js';
import {getClassicalInterpretations} from '../data/classical-sources.js';
import {getHexagramData,canonicalHexagramNumber} from '../data/hexagrams.js';
import {getChangingLine} from '../data/changing-lines.js';
import {buildCrossroads} from '../data/crossroads.js';

const $=selector=>document.querySelector(selector);
const numberFrom=text=>{const match=String(text??'').match(/№\s*(\d+)/);return match?Number(match[1]):null};
const formatCycle=cycle=>Array.isArray(cycle)&&cycle.length?cycle.join(' → '):'Цикл для цієї гексаграми ще доповнюється.';
const setIfChanged=(element,value)=>{if(element&&element.textContent!==value)element.textContent=value};

function ensureStyles(){
  if(document.querySelector('#reading-flow'))return;
  const style=document.createElement('style');style.id='reading-flow';style.textContent=`
    .knowledge-details > summary::after{content:'+'}.knowledge-details[open] > summary::after{content:'−'}
    .line-classical-details > summary::after{content:'+' !important}.line-classical-details[open] > summary::after{content:'−' !important}
    .crossroads-preview{margin:1rem 0 .25rem;padding:1rem;border:1px solid currentColor;border-radius:14px}.crossroads-preview h3{margin:.15rem 0 .8rem}
    .crossroads-preview ul{padding-left:1.35rem;margin:.8rem 0}.crossroads-preview li+li{margin-top:.75rem}.crossroads-open{font-style:italic;opacity:.82;margin-bottom:.15rem}
    .crossroads-choice{font-weight:750}.crossroads-test-button{margin-top:.8rem;width:100%}.crossroads-test-button[aria-expanded="true"]{opacity:.82}.reading-depth-note{margin:.8rem 0 0;opacity:.72;font-size:.92em}
    #answer-action.crossroads-formatted{display:block}.crossroads-main-path{display:block;position:relative;padding-left:1.15rem;margin:.65rem 0}.crossroads-main-path::before{content:'•';position:absolute;left:0;font-weight:800}
    .crossroads-main-open{display:block;margin-top:.85rem;font-style:italic;opacity:.82}
    .changing-line-context{display:flex;align-items:center;gap:.65rem;margin:0 0 .7rem;color:#f59e0b;font-weight:700;line-height:1.25}
    .changing-line-badge{display:inline-flex;align-items:center;justify-content:center;flex:0 0 2rem;width:2rem;height:2rem;border-radius:50%;background:#f59e0b;color:#111827;font-size:1rem;font-weight:850}
  `;document.head.appendChild(style);
}
function appendCrossroadsPath(container,path){const split=String(path).split(' — ');if(split.length<2){container.textContent=path;return}const choice=document.createElement('strong');choice.className='crossroads-choice';choice.textContent=split.shift();container.append(choice,document.createTextNode(` — ${split.join(' — ')}`))}
function ensureClassicalDetails(parent,id,title){let details=document.querySelector(`#${id}`);if(details)return details;details=document.createElement('details');details.id=id;details.className='line-classical-details state-classical-details';const summary=document.createElement('summary');summary.textContent=title;const body=document.createElement('div');body.className='line-classical-body';const wh=document.createElement('h5');wh.textContent='Ріхард Вільгельм';const wp=document.createElement('p');wp.dataset.role='wilhelm';const sh=document.createElement('h5');sh.textContent='Юліан Шуцький';const sp=document.createElement('p');sp.dataset.role='shchutsky';const note=document.createElement('small');note.textContent='Стислі авторські перекази, не цитати.';body.append(wh,wp,sh,sp,note);details.append(summary,body);parent?.appendChild(details);return details}
function organizeKnowledge(){const primaryBody=$('#primary-meaning')?.parentElement;const secondaryBody=$('#secondary-meaning')?.parentElement;const oldClassics=$('#classical-section');if(primaryBody&&oldClassics&&!primaryBody.contains(oldClassics)){let wrapper=$('#primary-classics-details');if(!wrapper){wrapper=document.createElement('details');wrapper.id='primary-classics-details';wrapper.className='line-classical-details state-classical-details';const summary=document.createElement('summary');summary.textContent='Класичні трактування стану';wrapper.appendChild(summary);primaryBody.appendChild(wrapper)}if(!wrapper.contains(oldClassics))wrapper.appendChild(oldClassics)}if(secondaryBody)ensureClassicalDetails(secondaryBody,'secondary-classics-details','Класичне трактування нового стану')}
function organizeConclusion(){const steps=$('#answer-result .answer-steps');const crossroads=$('#answer-action')?.closest('.answer-step');const development=$('#answer-development')?.closest('.answer-step');if(!steps||!development)return;setIfChanged(development.querySelector('h3'),'Напрямок шляху');setIfChanged(development.querySelector('.step-number'),'1');if(crossroads)crossroads.classList.add('hidden');if(steps.firstElementChild!==development)steps.prepend(development);let note=$('#reading-depth-note');if(!note){note=document.createElement('p');note.id='reading-depth-note';note.className='reading-depth-note';note.textContent='Напрямок уже видно. Деталі нижче відкривайте лише тоді, коли хочеться зрозуміти шлях глибше.';steps.insertAdjacentElement('afterend',note)}}
function decorateChangingLineCards(primaryNumber){
  if(!primaryNumber)return;
  const primary=getHexagramData(primaryNumber);
  if(!primary)return;
  const variants=Array.from({length:6},(_,index)=>getChangingLine(primary,index+1));
  document.querySelectorAll('#changing-lines-list .changing-line-card').forEach(card=>{
    if(card.querySelector('.changing-line-context'))return;
    const title=card.querySelector('strong');
    const meaning=card.querySelector('p');
    const titleText=title?.textContent?.trim()||'';
    const meaningText=meaning?.textContent?.trim()||'';
    const line=variants.find(item=>item.title===titleText&&item.meaning===meaningText)||variants.find(item=>item.title===titleText)||variants.find(item=>item.meaning===meaningText);
    if(!line)return;
    const context=document.createElement('div');context.className='changing-line-context';
    const badge=document.createElement('span');badge.className='changing-line-badge';badge.textContent=String(line.position);badge.setAttribute('aria-hidden','true');
    const label=document.createElement('span');label.textContent=`Лінія ${line.position} — стосується вашого питання`;
    context.append(badge,label);
    card.insertBefore(context,card.firstChild);
  });
}
function renderSecondaryClassics(number){const details=$('#secondary-classics-details');if(!details)return;const classics=number?getClassicalInterpretations(number):null;setIfChanged(details.querySelector('[data-role="wilhelm"]'),classics?.wilhelm||'Класичний текст для цієї гексаграми ще не додано.');setIfChanged(details.querySelector('[data-role="shchutsky"]'),classics?.shchutsky||'Класичний текст для цієї гексаграми ще не додано.')}
function renderProgressiveDisclosure(){ensureStyles();organizeKnowledge();organizeConclusion();const primaryNumber=numberFrom($('#primary-details-title')?.textContent);const secondaryNumber=numberFrom($('#secondary-details-title')?.textContent);decorateChangingLineCards(primaryNumber);setIfChanged($('#primary-cycle'),formatCycle(getHexagramCycle(primaryNumber)));setIfChanged($('#secondary-cycle'),formatCycle(getHexagramCycle(secondaryNumber)));renderSecondaryClassics(secondaryNumber)}
function libraryLinesFromFigure(){return [...document.querySelectorAll('#library-detail .library-hexagram .library-line')].map(line=>({type:line.classList.contains('yang')?'yang':'yin',changing:false}))}
function resultingHexagramForLibraryLine(position){const lines=libraryLinesFromFigure();if(lines.length!==6)return null;const changed=lines.map((line,index)=>index===position-1?{...line,type:line.type==='yang'?'yin':'yang'}:line);const number=canonicalHexagramNumber(changed);return number?getHexagramData(number):null}
function removeOtherLibraryCrossroads(exceptBody=null){document.querySelectorAll('#library-detail .crossroads-preview').forEach(preview=>{if(!exceptBody||preview.parentElement!==exceptBody)preview.remove()});document.querySelectorAll('#library-detail .crossroads-test-button').forEach(button=>{if(!exceptBody||button.parentElement!==exceptBody){button.setAttribute('aria-expanded','false');button.textContent='Побачити, куди веде ця зміна'}})}
function showLibraryCrossroads(position,body,button){const detail=$('#library-detail');const primaryNumber=numberFrom(detail?.querySelector('.progress')?.textContent);if(!detail||!primaryNumber||!body)return;const existing=body.querySelector('.crossroads-preview');if(existing){existing.remove();button?.setAttribute('aria-expanded','false');if(button)button.textContent='Побачити, куди веде ця зміна';return}removeOtherLibraryCrossroads(body);const primary=getHexagramData(primaryNumber);const secondary=resultingHexagramForLibraryLine(position);if(!secondary)return;const line=getChangingLine(primary,position);const crossroads=buildCrossroads({primary,secondary,lines:[line]});const preview=document.createElement('section');preview.className='crossroads-preview';preview.dataset.line=String(position);const eyebrow=document.createElement('p');eyebrow.className='progress';eyebrow.textContent=`Змінюється лінія ${position}`;const title=document.createElement('h3');title.textContent='На роздоріжжі';const transition=document.createElement('p');transition.textContent=`«${primary.name}» → «${secondary.name}»`;const list=document.createElement('ul');crossroads.paths.forEach(path=>{const item=document.createElement('li');appendCrossroadsPath(item,path);list.appendChild(item)});const open=document.createElement('p');open.className='crossroads-open';open.textContent=crossroads.open;preview.append(eyebrow,title,transition,list,open);body.appendChild(preview);button?.setAttribute('aria-expanded','true');if(button)button.textContent='Сховати роздоріжжя';preview.scrollIntoView({behavior:'smooth',block:'nearest'})}
function decorateLibraryLines(){const detail=$('#library-detail');if(!detail||detail.classList.contains('hidden'))return;detail.querySelectorAll('.library-lines-section .library-line-details').forEach((details,index)=>{const body=details.querySelector('.library-line-body');if(!body||body.querySelector('.crossroads-test-button'))return;const button=document.createElement('button');button.type='button';button.className='secondary-button crossroads-test-button';button.textContent='Побачити, куди веде ця зміна';button.setAttribute('aria-expanded','false');button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();showLibraryCrossroads(index+1,body,button)});body.appendChild(button)})}
const target=$('#answer-result');if(target){let scheduled=false;const scheduleRender=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;renderProgressiveDisclosure()})};new MutationObserver(scheduleRender).observe(target,{subtree:true,childList:true,characterData:true});renderProgressiveDisclosure()}
const libraryTarget=$('#library-detail');if(libraryTarget){let scheduled=false;const scheduleLibrary=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorateLibraryLines()})};new MutationObserver(scheduleLibrary).observe(libraryTarget,{childList:true});scheduleLibrary()}
const resetButton=$('#reset-button');if(resetButton){resetButton.addEventListener('click',()=>{requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'smooth'}))})}
