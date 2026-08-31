import {getStructuralContext} from '../data/structural-context.js';
import {getHexagramData} from '../data/hexagrams.js';
import {getChangingLine} from '../data/changing-lines.js';

const $=selector=>document.querySelector(selector);
const numberFrom=text=>{const match=String(text??'').match(/№\s*(\d+)/);return match?Number(match[1]):null};
const isFirefoxAndroid=/Android/i.test(navigator.userAgent)&&/Firefox\//i.test(navigator.userAgent);
let footerFrame=0;

function ensureTestStyles(){
  if(document.querySelector('#structural-test-styles'))return;
  if(isFirefoxAndroid)document.documentElement.classList.add('firefox-android');
  const style=document.createElement('style');
  style.id='structural-test-styles';
  style.textContent=`
    html{min-height:100%;background:#0f172a}
    body{min-height:100%;padding-bottom:112px !important}
    .nav-bar{
      position:fixed !important;
      left:0 !important;
      right:0 !important;
      bottom:0 !important;
      transform:none !important;
      margin:0 auto !important;
      width:100% !important;
      max-width:520px !important;
      border-radius:18px 18px 0 0 !important;
      border-bottom:0 !important;
      padding-bottom:max(8px,env(safe-area-inset-bottom)) !important;
      backface-visibility:hidden;
      -webkit-backface-visibility:hidden;
      will-change:transform;
      contain:layout paint;
    }
    .firefox-android .nav-bar{
      position:absolute !important;
      top:0;
      bottom:auto !important;
      backface-visibility:visible !important;
      -webkit-backface-visibility:visible !important;
      will-change:auto !important;
      contain:none !important;
      transform:none !important;
    }
    .structural-test-badge{margin:.4rem 0 .8rem;padding:.5rem .7rem;border:1px dashed rgba(245,158,11,.55);border-radius:10px;color:#f59e0b;font-size:.78rem;text-align:center}
    .structural-line-note{margin:.7rem 0 .1rem;padding:.75rem .8rem;border-left:3px solid #f59e0b;border-radius:0 10px 10px 0;background:rgba(245,158,11,.07);font-size:.86rem;line-height:1.5}
    .structural-line-note strong{display:block;margin-bottom:.25rem;color:#f59e0b}
    @media(max-width:699px){body{padding-bottom:108px !important}.nav-bar{padding-bottom:max(7px,env(safe-area-inset-bottom)) !important}}
  `;
  document.head.appendChild(style);
}

function syncFirefoxFooter(){
  if(!isFirefoxAndroid)return;
  const nav=$('.nav-bar');
  if(!nav)return;
  const vv=window.visualViewport;
  const viewportTop=window.scrollY+(vv?.offsetTop||0);
  const viewportHeight=vv?.height||window.innerHeight;
  const top=viewportTop+viewportHeight-nav.offsetHeight;
  nav.style.top=`${Math.max(0,Math.round(top))}px`;
}

function scheduleFirefoxFooter(){
  if(!isFirefoxAndroid||footerFrame)return;
  footerFrame=requestAnimationFrame(()=>{
    footerFrame=0;
    syncFirefoxFooter();
  });
}

function installFirefoxFooterTracking(){
  if(!isFirefoxAndroid)return;
  scheduleFirefoxFooter();
  window.addEventListener('scroll',scheduleFirefoxFooter,{passive:true});
  window.addEventListener('resize',scheduleFirefoxFooter,{passive:true});
  window.addEventListener('orientationchange',scheduleFirefoxFooter,{passive:true});
  if(window.visualViewport){
    window.visualViewport.addEventListener('scroll',scheduleFirefoxFooter,{passive:true});
    window.visualViewport.addEventListener('resize',scheduleFirefoxFooter,{passive:true});
  }
}

function stageMeaning(item){
  switch(item.position){
    case 1:return 'Зміна лише зароджується, тому важливіше відчути напрямок, ніж поспішати з дією.';
    case 2:return 'Зміна визріває всередині ситуації; зараз корисніше вирівняти основу й знайти внутрішню міру.';
    case 3:return 'Ситуація підійшла до межі внутрішнього етапу: наступний крок уже торкатиметься зовнішніх обставин.';
    case 4:return 'Зміна переходить у зовнішню дію, тому намір уже потрібно узгоджувати з людьми та обставинами.';
    case 5:return 'Ситуація проявляється зріло й помітно; головне — зберегти міру та не втратити центр.';
    case 6:return 'Процес наближається до межі, тому важливо вчасно завершити або відпустити надмірне.';
    default:return '';
  }
}

function relationMeaning(item){
  if(item.appropriate&&item.correspondence)return 'Внутрішня будова підтримує цей рух, тож його можна розвивати без зайвого форсування.';
  if(item.appropriate&&!item.correspondence)return 'Позиція сама по собі стійка, але зв’язок з іншою частиною ситуації неочевидний; краще спертися на власну ясність.';
  if(!item.appropriate&&item.correspondence)return 'Є внутрішня суперечність, але водночас існує відгук з іншого боку ситуації; напругу можна використати для переходу.';
  return 'У цій точці є внутрішнє напруження й мало природної опори, тому поспіх лише посилить суперечність.';
}

function emphasisMeaning(structural,item){
  if(structural.minority===item.type&&item.central)return 'Ця лінія особливо помітна: вона поєднує центральну позицію з рідкісною для цієї гексаграми якістю.';
  if(structural.minority===item.type)return 'Її якість перебуває в меншості, тому саме тут може бути прихований важливий акцент ситуації.';
  if(item.central)return 'Центральна позиція підсилює тему рівноваги й міри.';
  return '';
}

function structuralSentence(primaryNumber,position){
  const structural=getStructuralContext(primaryNumber,[position]);
  const item=structural?.lines?.[0];
  if(!item)return '';
  return [stageMeaning(item),relationMeaning(item),emphasisMeaning(structural,item)].filter(Boolean).join(' ');
}

function markExperiment(){
  const result=$('#answer-result');
  if(!result||result.classList.contains('hidden'))return;
  if(!$('#structural-test-badge')){
    const badge=document.createElement('p');
    badge.id='structural-test-badge';
    badge.className='structural-test-badge';
    badge.textContent='Експеримент: структурне читання увімкнено';
    result.querySelector('.progress')?.insertAdjacentElement('afterend',badge);
  }
}

function decorateChangingLines(){
  const primaryNumber=numberFrom($('#primary-details-title')?.textContent);
  if(!primaryNumber)return;
  const primary=getHexagramData(primaryNumber);
  const variants=Array.from({length:6},(_,i)=>getChangingLine(primary,i+1));
  document.querySelectorAll('#changing-lines-list .changing-line-card').forEach(card=>{
    const old=card.querySelector('.structural-line-note');
    const title=card.querySelector('strong')?.textContent?.trim()||'';
    const meaning=card.querySelector('p')?.textContent?.trim()||'';
    const line=variants.find(item=>item.title===title&&item.meaning===meaning)||variants.find(item=>item.title===title)||variants.find(item=>item.meaning===meaning);
    if(!line)return;
    const text=structuralSentence(primaryNumber,line.position);
    if(!text)return;
    if(old){const body=old.querySelector('span');if(body&&body.textContent!==text)body.textContent=text;return}
    const note=document.createElement('div');
    note.className='structural-line-note';
    const heading=document.createElement('strong');
    heading.textContent='Структура цієї лінії';
    const body=document.createElement('span');
    body.textContent=text;
    note.append(heading,body);
    card.appendChild(note);
  });
}

function render(){ensureTestStyles();markExperiment();decorateChangingLines();scheduleFirefoxFooter()}
ensureTestStyles();
installFirefoxFooterTracking();
render();
const target=$('#answer-result');
if(target){let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;render()})}).observe(target,{subtree:true,childList:true,characterData:true})}
