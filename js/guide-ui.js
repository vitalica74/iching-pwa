import {getHexagramGuide as getGuide01to10} from '../data/hexagram-guides-01-10.js';
import {getHexagramGuide11to16} from '../data/hexagram-guides-11-16.js';
import {getHexagramGuide17to24} from '../data/hexagram-guides-17-24.js';
import {getHexagramGuide25to32} from '../data/hexagram-guides-25-32.js';
import {getHexagramGuide33to40} from '../data/hexagram-guides-33-40.js';
import {getHexagramGuide41to48} from '../data/hexagram-guides-41-48.js';
import {getHexagramGuide49to56} from '../data/hexagram-guides-49-56.js';
import {getHexagramGuide57to64} from '../data/hexagram-guides-57-64.js';

const getHexagramGuide=number=>getGuide01to10(number)||getHexagramGuide11to16(number)||getHexagramGuide17to24(number)||getHexagramGuide25to32(number)||getHexagramGuide33to40(number)||getHexagramGuide41to48(number)||getHexagramGuide49to56(number)||getHexagramGuide57to64(number);
const $=selector=>document.querySelector(selector);
const numberFrom=text=>{const match=String(text??'').match(/№\s*(\d+)/);return match?Number(match[1]):null};

function ensureStyles(){
  if($('#hexagram-guide-styles'))return;
  const style=document.createElement('style');
  style.id='hexagram-guide-styles';
  style.textContent=`
.hexagram-guide{margin-top:.75rem;padding:.85rem .9rem 1rem;border:1px solid rgba(148,163,184,.18);border-left:4px solid rgba(245,158,11,.82);border-radius:12px;background:rgba(15,23,42,.16)}
.guide-intro{display:grid;grid-template-columns:88px minmax(0,1fr);gap:.85rem;align-items:start;margin-bottom:.35rem}
.guide-mini-hex{display:flex;flex-direction:column;align-items:center;gap:.38rem;padding:.45rem .3rem;border-right:1px solid rgba(148,163,184,.2)}
.guide-mini-hex .hexagram{margin:0!important;transform:scale(.72);transform-origin:top center;min-height:92px}
.guide-mini-number{font-weight:800;color:#f59e0b;font-size:.86rem;line-height:1.1;text-align:center}
.guide-mini-name{color:#cbd5e1;font-size:.78rem;line-height:1.25;text-align:center}
.guide-content{min-width:0}
.guide-badge{display:flex;align-items:center;gap:.5rem;margin:.05rem 0 .55rem;color:#f59e0b;font-weight:750;font-size:.86rem}
.guide-badge::before{content:'◉';font-size:.78rem}
.guide-section{margin:0;padding:.85rem 0}.guide-section+.guide-section{border-top:1px solid rgba(148,163,184,.28);margin-top:.25rem;padding-top:1rem}.guide-section>h4{margin:.15rem 0 .5rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.035em;font-size:.82rem}.guide-short{font-weight:650;line-height:1.55}.guide-more{margin:.55rem 0 0;border-top:1px solid rgba(148,163,184,.25);padding-top:.55rem}.guide-more[open]{margin-bottom:.8rem}.guide-more summary{cursor:pointer;font-weight:650;position:relative;padding-right:1.7rem;list-style:none;color:#f59e0b}.guide-more summary::-webkit-details-marker{display:none}.guide-more p{margin:.7rem 0 .2rem;line-height:1.6}.guide-classics-marker{margin-top:1.1rem}
.knowledge-sections>details.knowledge-details>summary::after{content:'+'}.knowledge-sections>details.knowledge-details[open]>summary::after{content:'−'}
.details-body .guide-more>summary::after,.hexagram-guide .guide-more>summary::after{content:'⌄'!important;position:absolute;right:.15rem;top:50%;transform:translateY(-55%);color:var(--muted);font-size:1.15rem;font-weight:500}.details-body .guide-more[open]>summary::after,.hexagram-guide .guide-more[open]>summary::after{content:'⌃'!important;transform:translateY(-35%)}
@media(max-width:430px){.guide-intro{grid-template-columns:72px minmax(0,1fr);gap:.65rem}.guide-mini-hex .hexagram{transform:scale(.62);min-height:82px}.hexagram-guide{padding:.75rem .75rem .9rem}}
`;
  document.head.appendChild(style)
}

function details(text,label='Розгорнути пояснення'){
  const el=document.createElement('details');el.className='guide-more';
  const summary=document.createElement('summary');
  const closedLabel=label;const openLabel=label==='Розгорнути пояснення'?'Згорнути пояснення':label;
  const sync=()=>{summary.textContent=el.open?openLabel:closedLabel;summary.setAttribute('aria-expanded',String(el.open))};
  sync();el.addEventListener('toggle',sync);
  const p=document.createElement('p');p.textContent=text;el.append(summary,p);return el
}

function section(title,short,long){
  const el=document.createElement('section');el.className='guide-section';
  const h=document.createElement('h4');h.textContent=title;
  const p=document.createElement('p');p.className='guide-short';p.textContent=short;
  el.append(h,p,details(long));return el
}

function cloneHexagram(source){
  if(!source)return null;
  const clone=source.cloneNode(true);
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
  clone.classList.add('compact-hexagram');
  return clone
}

function buildGuide(guide,{resulting=false,number=null,hexagramSource=null}={}){
  const wrap=document.createElement('div');wrap.className='hexagram-guide';
  const badge=document.createElement('div');badge.className='guide-badge';badge.textContent=resulting?'Розгорнутий опис додаткової гексаграми':'Розгорнутий опис основної гексаграми';
  const intro=document.createElement('div');intro.className='guide-intro';
  const mini=document.createElement('div');mini.className='guide-mini-hex';
  const hex=cloneHexagram(hexagramSource);
  if(hex)mini.appendChild(hex);
  if(number){const n=document.createElement('div');n.className='guide-mini-number';n.textContent=`№${number}`;mini.appendChild(n)}
  const name=document.createElement('div');name.className='guide-mini-name';name.textContent=resulting?'Новий стан':'Поточний стан';mini.appendChild(name);
  const content=document.createElement('div');content.className='guide-content';
  content.append(section(resulting?'Образ нового стану':'Образ',guide.image.short,guide.image.long),section(resulting?'Приклад нового стану':'Приклад',guide.example.short,guide.example.long),section('На що звернути увагу',guide.attention.short,guide.attention.long));
  intro.append(mini,content);wrap.append(badge,intro);return wrap
}

function setPrimaryLegacy(hidden){
  const meaning=$('#primary-meaning'),cycle=$('#primary-cycle'),caution=$('#primary-caution');
  meaning?.classList.toggle('hidden',hidden);cycle?.classList.toggle('hidden',hidden);cycle?.previousElementSibling?.classList.toggle('hidden',hidden);caution?.classList.toggle('hidden',hidden);caution?.previousElementSibling?.classList.toggle('hidden',hidden)
}
function setSecondaryLegacy(hidden){
  const meaning=$('#secondary-meaning'),cycle=$('#secondary-cycle');
  meaning?.classList.toggle('hidden',hidden);meaning?.previousElementSibling?.classList.toggle('hidden',hidden);cycle?.classList.toggle('hidden',hidden);cycle?.previousElementSibling?.classList.toggle('hidden',hidden)
}

function renderPrimary(){
  const body=$('#primary-meaning')?.parentElement;if(!body)return;
  const number=numberFrom($('#primary-details-title')?.textContent);const guide=getHexagramGuide(number);
  const existing=body.querySelector('.hexagram-guide[data-role="primary"]');if(existing?.dataset.hexagram===String(number))return;
  existing?.remove();if(!guide){setPrimaryLegacy(false);return}setPrimaryLegacy(true);
  const wrap=buildGuide(guide,{number,hexagramSource:$('#hexagram')});wrap.dataset.role='primary';wrap.dataset.hexagram=String(number);
  const classics=$('#primary-classics-details');if(classics){classics.classList.add('guide-classics-marker');body.insertBefore(wrap,classics)}else body.appendChild(wrap)
}

function renderSecondary(){
  const body=$('#secondary-details .secondary-details-body');if(!body)return;
  const number=numberFrom($('#secondary-details-title')?.textContent);const guide=getHexagramGuide(number);
  const existing=body.querySelector('.hexagram-guide[data-role="secondary"]');if(existing?.dataset.hexagram===String(number))return;
  existing?.remove();if(!guide){setSecondaryLegacy(false);return}setSecondaryLegacy(true);
  const source=$('#secondary-hexagram');
  const wrap=buildGuide(guide,{resulting:true,number,hexagramSource:source});wrap.dataset.role='secondary';wrap.dataset.hexagram=String(number);
  if(source)source.classList.add('hidden');
  const classics=$('#secondary-classics-details');if(classics){classics.classList.add('guide-classics-marker');body.insertBefore(wrap,classics)}else body.appendChild(wrap)
}

function renderGuide(){ensureStyles();renderPrimary();renderSecondary()}
const target=$('#answer-result');if(target){let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;renderGuide()})};new MutationObserver(schedule).observe(target,{subtree:true,childList:true,characterData:true});schedule()}
