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
  const existing=detail.querySelector('.library-modern-guide');

  if(existing?.dataset.hexagram===String(number))return;
  existing?.remove();
  if(!guide)return;

  const oldSummary=detail.querySelector('.library-summary-block');
  const oldCycle=detail.querySelector('.library-cycle');
  if(oldSummary)oldSummary.style.display='none';
  if(oldCycle)oldCycle.style.display='none';

  const wrap=document.createElement('div');
  wrap.className='library-modern-guide';
  wrap.dataset.hexagram=String(number);
  wrap.innerHTML=guideSection('Образ',guide.image)+development(guide.development)+guideSection('Приклад',guide.example)+guideSection('На що звернути увагу',guide.attention);

  const head=detail.querySelector('.library-detail-head');
  head?.insertAdjacentElement('afterend',wrap);
}

function boot(){
  const detail=$('#library-detail');
  if(!detail){setTimeout(boot,100);return}

  let scheduled=false;
  const schedule=()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      render();
    });
  };

  // library.js replaces the direct contents of #library-detail when another
  // hexagram is selected. Watching only direct child changes is sufficient.
  // Do not observe the whole subtree: inserting our own guide would otherwise
  // trigger a continuous render loop and make taps/details sluggish.
  new MutationObserver(schedule).observe(detail,{childList:true});
  render();
}

boot();
