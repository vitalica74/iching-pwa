import {getHexagramCycle} from '../data/hexagram-cycles-01-10.js';

const $=selector=>document.querySelector(selector);
const numberFrom=text=>{
  const match=String(text??'').match(/№\s*(\d+)/);
  return match?Number(match[1]):null;
};
const formatCycle=cycle=>Array.isArray(cycle)&&cycle.length?cycle.join(' → '):'Цикл для цієї гексаграми ще доповнюється.';

function renderCycles(){
  const primaryNumber=numberFrom($('#primary-details-title')?.textContent);
  const secondaryNumber=numberFrom($('#secondary-details-title')?.textContent);
  const primary=$('#primary-cycle');
  const secondary=$('#secondary-cycle');
  if(primary)primary.textContent=formatCycle(getHexagramCycle(primaryNumber));
  if(secondary)secondary.textContent=formatCycle(getHexagramCycle(secondaryNumber));
}

const target=$('#answer-result');
if(target){
  const observer=new MutationObserver(renderCycles);
  observer.observe(target,{subtree:true,childList:true,characterData:true});
  renderCycles();
}
