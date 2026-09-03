import {getHexagramData} from '../data/hexagrams.js';
import {getChangingLine} from '../data/changing-lines.js';
import {selectLineAccent,accentLabel} from '../data/line-accent-selector.js';

const $=selector=>document.querySelector(selector);
const numberFrom=text=>{const m=String(text??'').match(/№\s*(\d+)/);return m?Number(m[1]):null};

function ensureTestStyles(){
  if($('#structural-test-styles'))return;
  const s=document.createElement('style');
  s.id='structural-test-styles';
  s.textContent=`html{min-height:100%;background:#0f172a}body{min-height:100%;padding-bottom:112px!important}.nav-bar{position:fixed!important;left:0!important;right:0!important;bottom:0!important;transform:none!important;margin:0 auto!important;width:100%!important;max-width:520px!important;border-radius:18px 18px 0 0!important;border-bottom:0!important;padding-bottom:max(8px,env(safe-area-inset-bottom))!important}.structural-test-badge{margin:.4rem 0 .8rem;padding:.5rem .7rem;border:1px dashed rgba(245,158,11,.55);border-radius:10px;color:#f59e0b;font-size:.78rem;text-align:center}.accent-chip{display:inline-block;margin:.15rem 0 .55rem;padding:.18rem .48rem;border:1px solid rgba(245,158,11,.35);border-radius:999px;color:#cbd5e1;font-size:.72rem;line-height:1.25;opacity:.9}@media(max-width:699px){body{padding-bottom:108px!important}.nav-bar{padding-bottom:max(7px,env(safe-area-inset-bottom))!important}}`;
  document.head.appendChild(s);
}

function audit(){
  let checked=0,matched=0;
  const counts={};
  const issues=[];
  for(let h=1;h<=64;h++){
    const hex=getHexagramData(h);
    if(!hex){issues.push(`${h}:missing`);continue}
    for(let p=1;p<=6;p++){
      checked++;
      const line=getChangingLine(hex,p);
      if(!line){issues.push(`${h}.${p}:missing`);continue}
      const a=selectLineAccent(line);
      if(a.matched)matched++;
      counts[a.accent]=(counts[a.accent]||0)+1;
    }
  }
  const report={ok:!issues.length,checked,total:384,matched,unmatched:checked-matched,counts,issues};
  globalThis.__accentAudit=report;
  console.info('[accent-selector-audit]',report);
  return report;
}

function markExperiment(){
  const result=$('#answer-result');
  if(!result||result.classList.contains('hidden'))return;
  let b=$('#structural-test-badge');
  if(!b){
    b=document.createElement('p');
    b.id='structural-test-badge';
    b.className='structural-test-badge';
    result.querySelector('.progress')?.insertAdjacentElement('afterend',b);
  }
  b.textContent='Новий експеримент: структура лише обирає акцент';
}

function resolveLine(card,primary){
  const p=Number(card.querySelector('.changing-line-badge')?.textContent?.trim());
  if(Number.isInteger(p)&&p>=1&&p<=6)return getChangingLine(primary,p);
  const variants=Array.from({length:6},(_,i)=>getChangingLine(primary,i+1));
  const title=card.querySelector('strong')?.textContent?.trim()||'';
  return variants.find(x=>x.title===title)||null;
}

function decorate(){
  const h=numberFrom($('#primary-details-title')?.textContent);
  if(!h)return;
  const primary=getHexagramData(h);
  if(!primary)return;
  document.querySelectorAll('#changing-lines-list .changing-line-card').forEach(card=>{
    const line=resolveLine(card,primary);
    if(!line)return;
    // Restore authored text. The selector is deliberately forbidden from rewriting it.
    const ps=Array.from(card.querySelectorAll(':scope > p'));
    if(ps[0])ps[0].textContent=String(line.meaning||'').trim();
    if(ps[1])ps[1].textContent=String(line.advice||'').trim();
    card.querySelector('.accent-chip')?.remove();
    const a=selectLineAccent(line);
    const chip=document.createElement('span');
    chip.className='accent-chip';
    chip.textContent=`Акцент: ${accentLabel(a.accent)}`;
    const anchor=card.querySelector('strong');
    if(anchor)anchor.insertAdjacentElement('afterend',chip);
  });
}

function render(){ensureTestStyles();markExperiment();decorate()}
ensureTestStyles();audit();render();
const target=$('#answer-result');
if(target){
  let scheduled=false;
  new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;render()});
  }).observe(target,{subtree:true,childList:true,characterData:true});
}
