import {getHexagramCycle} from '../data/hexagram-cycles-01-10.js';

const $=selector=>document.querySelector(selector);
const numberFrom=text=>{
  const match=String(text??'').match(/№\s*(\d+)/);
  return match?Number(match[1]):null;
};
const formatCycle=cycle=>Array.isArray(cycle)&&cycle.length?cycle.join(' → '):'Цикл для цієї гексаграми ще доповнюється.';
const setIfChanged=(element,value)=>{
  if(element&&element.textContent!==value)element.textContent=value;
};

function renderCycles(){
  const primaryNumber=numberFrom($('#primary-details-title')?.textContent);
  const secondaryNumber=numberFrom($('#secondary-details-title')?.textContent);
  const primary=$('#primary-cycle');
  const secondary=$('#secondary-cycle');
  setIfChanged(primary,formatCycle(getHexagramCycle(primaryNumber)));
  setIfChanged(secondary,formatCycle(getHexagramCycle(secondaryNumber)));
}

const target=$('#answer-result');
if(target){
  const observer=new MutationObserver(renderCycles);
  observer.observe(target,{subtree:true,childList:true,characterData:true});
  renderCycles();
}
