import {getHexagramGuide} from '../data/hexagram-guides-01-10.js';

const $=selector=>document.querySelector(selector);
const circled=['①','②','③','④','⑤','⑥'];

function guideSection(title,item){
  return `<section class="library-summary-block"><h3>${title}</h3><p><strong>Коротко:</strong> ${item.short}</p><details class="knowledge-details"><summary>Розгорнути пояснення</summary><div class="details-body"><p>${item.long}</p></div></details></section>`;
}
function development(items){
  return `<section class="library-summary-block"><h3>Розвиток стану</h3><p class="cycle-text"><strong>Коротко:</strong> ${items.map((item,i)=>`${circled[i]} ${item[0]}`).join(' → ')}</p>${items.map((item,i)=>`<details class="library-line-details"><summary><span>${circled[i]}</span><strong>${item[0]}</strong></summary><div class="library-line-body"><p>${item[1]}</p></div></details>`).join('')}</section>`;
}
function render(){
  const detail=$('#library-detail');
  if(!detail||detail.classList.contains('hidden'))return;
  const match=detail.querySelector('.progress')?.textContent?.match(/№\s*(\d+)/);
  const number=match?Number(match[1]):null;
  const guide=getHexagramGuide(number);
  detail.querySelector('.library-modern-guide')?.remove();
  if(!guide)return;
  const oldSummary=detail.querySelector('.library-summary-block');
  const oldCycle=detail.querySelector('.library-cycle');
  if(oldSummary)oldSummary.style.display='none';
  if(oldCycle)oldCycle.style.display='none';
  const wrap=document.createElement('div');
  wrap.className='library-modern-guide';
  wrap.innerHTML=guideSection('Образ',guide.image)+development(guide.development)+guideSection('Приклад',guide.example)+guideSection('На що звернути увагу',guide.attention);
  const head=detail.querySelector('.library-detail-head');
  head?.insertAdjacentElement('afterend',wrap);
}

const observer=new MutationObserver(()=>requestAnimationFrame(render));
const boot=()=>{const detail=$('#library-detail');if(detail){observer.observe(detail,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});render()}else setTimeout(boot,100)};
boot();
