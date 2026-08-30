import {getHexagramGuide} from '../data/hexagram-guides-01-10.js';
import {getHexagramData} from '../data/hexagrams.js';
import {getChangingLine} from '../data/changing-lines.js';

const $=selector=>document.querySelector(selector);
const circled=['①','②','③','④','⑤','⑥'];

function guideSection(title,item){
  return `<section class="library-summary-block"><h3>${title}</h3><p><strong>Коротко:</strong> ${item.short}</p><details class="knowledge-details"><summary>Розгорнути пояснення</summary><div class="details-body"><p>${item.long}</p></div></details></section>`;
}

function lineClassics(line){
  const classical=line?.classical||{};
  return `<details class="library-classics"><summary>Класичні трактування</summary><div><h5>Ріхард Вільгельм</h5><p>${classical.wilhelm||'Текст ще доповнюється.'}</p><h5>Юліан Шуцький</h5><p>${classical.shchutsky||'Текст ще доповнюється.'}</p><small class="library-note">Стислі авторські перекази, не цитати.</small></div></details>`;
}

function development(number,items){
  const hex=getHexagramData(number);
  return `<section class="library-summary-block library-development"><h3>Розвиток стану</h3><p class="cycle-text"><strong>Коротко:</strong> ${items.map((item,i)=>`${circled[i]} ${item[0]}`).join(' → ')}</p>${items.map((item,i)=>{
    const line=hex?getChangingLine(hex,i+1):null;
    return `<details class="library-line-details modern-development-line"><summary><span>${circled[i]}</span><strong>${item[0]}</strong></summary><div class="library-line-body"><p>${item[1]}</p>${lineClassics(line)}</div></details>`;
  }).join('')}</section>`;
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

  const oldSummary=detail.querySelector('.library-summary-block:not(.library-modern-guide .library-summary-block)');
  const oldCycle=detail.querySelector('.library-cycle');
  const oldLines=detail.querySelector('.library-lines-section');

  if(!guide){
    if(oldSummary)oldSummary.style.display='';
    if(oldCycle)oldCycle.style.display='';
    if(oldLines)oldLines.style.display='';
    return;
  }

  if(oldSummary)oldSummary.style.display='none';
  if(oldCycle)oldCycle.style.display='none';
  if(oldLines)oldLines.style.display='none';

  const wrap=document.createElement('div');
  wrap.className='library-modern-guide';
  wrap.dataset.hexagram=String(number);
  wrap.innerHTML=guideSection('Образ',guide.image)+development(number,guide.development)+guideSection('Приклад',guide.example)+guideSection('На що звернути увагу',guide.attention);

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

  new MutationObserver(schedule).observe(detail,{childList:true});
  render();
}

boot();
