import {getHexagramCycle} from '../data/hexagram-cycles.js';
import {getClassicalInterpretations} from '../data/classical-sources.js';

const $=selector=>document.querySelector(selector);
const numberFrom=text=>{
  const match=String(text??'').match(/№\s*(\d+)/);
  return match?Number(match[1]):null;
};
const formatCycle=cycle=>Array.isArray(cycle)&&cycle.length?cycle.join(' → '):'Цикл для цієї гексаграми ще доповнюється.';
const setIfChanged=(element,value)=>{
  if(element&&element.textContent!==value)element.textContent=value;
};

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
  organizeKnowledge();
  const primaryNumber=numberFrom($('#primary-details-title')?.textContent);
  const secondaryNumber=numberFrom($('#secondary-details-title')?.textContent);
  setIfChanged($('#primary-cycle'),formatCycle(getHexagramCycle(primaryNumber)));
  setIfChanged($('#secondary-cycle'),formatCycle(getHexagramCycle(secondaryNumber)));
  renderSecondaryClassics(secondaryNumber);
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
