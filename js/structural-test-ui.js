import {getHexagramData} from '../data/hexagrams.js';
import {getChangingLine} from '../data/changing-lines.js';

const $=selector=>document.querySelector(selector);
const numberFrom=text=>{const m=String(text??'').match(/№\s*(\d+)/);return m?Number(m[1]):null};

function ensureTestStyles(){
  if($('#structural-test-styles'))return;
  const s=document.createElement('style');
  s.id='structural-test-styles';
  s.textContent=`html{min-height:100%;background:#0f172a}body{min-height:100%;padding-bottom:112px!important}.nav-bar{position:fixed!important;left:0!important;right:0!important;bottom:0!important;transform:none!important;margin:0 auto!important;width:100%!important;max-width:520px!important;border-radius:18px 18px 0 0!important;border-bottom:0!important;padding-bottom:max(8px,env(safe-area-inset-bottom))!important}.structural-test-badge{margin:.4rem 0 .8rem;padding:.5rem .7rem;border:1px dashed rgba(245,158,11,.55);border-radius:10px;color:#f59e0b;font-size:.78rem;text-align:center}.transition-path{margin:.9rem 0 0;padding:.8rem .9rem;border:1px solid rgba(245,158,11,.3);border-radius:12px;background:rgba(15,23,42,.28)}.transition-path-title{margin:0 0 .55rem;color:#f59e0b;font-weight:700}.transition-path-row{margin:.28rem 0;color:#e2e8f0;line-height:1.45}.transition-path-label{color:#94a3b8;font-size:.78rem;text-transform:uppercase;letter-spacing:.03em;margin-right:.35rem}.transition-path-lines{margin:.45rem 0 0;padding-left:1.15rem;color:#e2e8f0}.transition-path-lines li{margin:.28rem 0}.transition-path-conclusion{margin:.65rem 0 0;padding-top:.6rem;border-top:1px solid rgba(148,163,184,.22);color:#f8fafc;line-height:1.5}@media(max-width:699px){body{padding-bottom:108px!important}.nav-bar{padding-bottom:max(7px,env(safe-area-inset-bottom))!important}}`;
  document.head.appendChild(s);
}

function markExperiment(){
  const result=$('#answer-result');
  if(!result||result.classList.contains('hidden'))return;
  let b=$('#structural-test-badge');
  if(!b){b=document.createElement('p');b.id='structural-test-badge';b.className='structural-test-badge';result.querySelector('.progress')?.insertAdjacentElement('afterend',b)}
  b.textContent='Новий експеримент: стан → що змінюється → новий стан';
}

function changingPositions(){
  return [...document.querySelectorAll('#changing-lines-list .changing-line-card')]
    .map(card=>Number(card.querySelector('.changing-line-badge')?.textContent?.trim()))
    .filter(p=>Number.isInteger(p)&&p>=1&&p<=6);
}

function linePhrase(hex,p){
  const line=getChangingLine(hex,p);
  if(!line)return `Лінія ${p}`;
  return String(line.title||line.meaning||`Лінія ${p}`).trim();
}

function transitionConclusion(primary,secondary,positions){
  if(!secondary)return 'Тут немає окремого нового стану для читання: зміна проявляється через самі лінії, тому головним залишається їхній спільний напрямок.';
  if(positions.length===1)return `Ситуація переходить від «${primary.name}» до «${secondary.name}» саме через тему цієї лінії. Читайте її як міст між двома станами.`;
  return `Перехід від «${primary.name}» до «${secondary.name}» складається з кількох одночасних змін. Важливий не один ізольований акцент, а спільний напрямок цих ліній.`;
}

function clearTransitionPath(){
  $('#transition-path-experiment')?.remove();
}

function renderTransitionPath(){
  const primaryNumber=numberFrom($('#primary-details-title')?.textContent);
  const changingTitle=$('#changing-details-title')?.textContent||'';
  const secondaryDetails=$('#secondary-details');
  const hasVisibleSecondary=Boolean(secondaryDetails&&!secondaryDetails.classList.contains('hidden'));
  const positions=changingPositions();

  if(!primaryNumber||!/Змінні лінії \(\d+\)/.test(changingTitle)||!positions.length){clearTransitionPath();return;}
  const primary=getHexagramData(primaryNumber);
  if(!primary){clearTransitionPath();return;}

  const secondaryNumber=hasVisibleSecondary?numberFrom($('#secondary-details-title')?.textContent):null;
  const secondary=secondaryNumber?getHexagramData(secondaryNumber):null;

  const logicBody=$('#rationale-lines')?.parentElement;
  if(!logicBody){clearTransitionPath();return;}

  let box=$('#transition-path-experiment');
  if(!box){box=document.createElement('section');box.id='transition-path-experiment';box.className='transition-path';logicBody.appendChild(box)}
  else if(box.parentElement!==logicBody)logicBody.appendChild(box);

  const lines=positions.map(p=>`<li><strong>Лінія ${p}:</strong> ${linePhrase(primary,p)}</li>`).join('');
  box.innerHTML=`<p class="transition-path-title">Як читати перехід</p><p class="transition-path-row"><span class="transition-path-label">Було</span><strong>№${primaryNumber} — ${primary.name}</strong></p><p class="transition-path-row"><span class="transition-path-label">Змінюється</span></p><ul class="transition-path-lines">${lines}</ul>${secondary?`<p class="transition-path-row"><span class="transition-path-label">Стає</span><strong>№${secondaryNumber} — ${secondary.name}</strong></p>`:''}<p class="transition-path-conclusion">${transitionConclusion(primary,secondary,positions)}</p>`;
}

function restoreLineCards(){
  const h=numberFrom($('#primary-details-title')?.textContent);
  const primary=h?getHexagramData(h):null;
  if(!primary)return;
  document.querySelectorAll('#changing-lines-list .changing-line-card').forEach(card=>{
    card.querySelector('.accent-chip')?.remove();
    const p=Number(card.querySelector('.changing-line-badge')?.textContent?.trim());
    if(!Number.isInteger(p))return;
    const line=getChangingLine(primary,p);
    if(!line)return;
    const ps=Array.from(card.querySelectorAll(':scope > p'));
    if(ps[0])ps[0].textContent=String(line.meaning||'').trim();
    if(ps[1])ps[1].textContent=String(line.advice||'').trim();
  });
}

function render(){ensureTestStyles();markExperiment();restoreLineCards();renderTransitionPath()}
ensureTestStyles();render();
const target=$('#answer-result');
if(target){
  let timer=0;
  new MutationObserver(()=>{
    clearTimeout(timer);
    timer=setTimeout(render,40);
  }).observe(target,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
}
