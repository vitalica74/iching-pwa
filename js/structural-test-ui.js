import {getStructuralContext} from '../data/structural-context.js';
import {getHexagramData} from '../data/hexagrams.js';
import {getChangingLine} from '../data/changing-lines.js';

const $=selector=>document.querySelector(selector);
const numberFrom=text=>{const match=String(text??'').match(/№\s*(\d+)/);return match?Number(match[1]):null};

function ensureTestStyles(){
  if(document.querySelector('#structural-test-styles'))return;
  const style=document.createElement('style');
  style.id='structural-test-styles';
  style.textContent=`
    html{min-height:100%;background:#0f172a}
    body{min-height:100%;padding-bottom:112px !important}
    .nav-bar{position:fixed !important;left:0 !important;right:0 !important;bottom:0 !important;transform:none !important;margin:0 auto !important;width:100% !important;max-width:520px !important;border-radius:18px 18px 0 0 !important;border-bottom:0 !important;padding-bottom:max(8px,env(safe-area-inset-bottom)) !important}
    .structural-test-badge{margin:.4rem 0 .8rem;padding:.5rem .7rem;border:1px dashed rgba(245,158,11,.55);border-radius:10px;color:#f59e0b;font-size:.78rem;text-align:center}
    .integrated-reading{margin:.55rem 0 .25rem;font-size:1rem;line-height:1.55}
    .integrated-reading + .integrated-reading{margin-top:.7rem}
    @media(max-width:699px){body{padding-bottom:108px !important}.nav-bar{padding-bottom:max(7px,env(safe-area-inset-bottom)) !important}}
  `;
  document.head.appendChild(style);
}

const stageLead={
  1:'Ця зміна лише зароджується: спершу варто визначити її напрям, а не поспішати з дією.',
  2:'Зміна ще визріває всередині ситуації: зараз важливіше впорядкувати основу, ніж домагатися зовнішнього ефекту.',
  3:'Ситуація дійшла до межі між внутрішнім визріванням і зовнішньою дією.',
  4:'Зміна вже виходить назовні: намір переходить у взаємодію з реальними людьми й обставинами.',
  5:'Зміна досягла зрілої й помітної фази: її напрям уже має бути зрозумілим у зовнішньому прояві.',
  6:'Процес підійшов до межі: тепер важливо зрозуміти, що слід завершити, а що вже стало надмірним.'
};

function hasAny(text,words){
  const value=String(text||'').toLowerCase();
  return words.some(word=>value.includes(word));
}

function semanticSignals(text){
  return {
    support:hasAny(text,['підтрим','допом','поруч','зв’яз','зв\'яз','опор','довір','союз','партнер','разом','відгук']),
    isolation:hasAny(text,['самостій','самот','без підтрим','ніхто не','відсутн','ізоль']),
    act:hasAny(text,['дійте','діяти','дія','рухайтесь','рухатися','крок','починайте','почати','рішуч','виступ','просува']),
    wait:hasAny(text,['не посп','зачека','почек','пауза','зупин','стрим','не рух','відкла']),
    ease:hasAny(text,['послаб','м’як','мяк','не тис','не форс','без примус','відступ','прийнят']),
    press:hasAny(text,['натиск','тиснути','тиск','форс','примус','наполяг']),
    finish:hasAny(text,['заверш','закінч','відпуст','межа','кінець']),
    continue:hasAny(text,['продовж','розвива','рухатися далі','йти далі','просува'])
  };
}

function minorityMeaning(structural,item,baseText,signals){
  if(structural.minority!==item.type)return '';
  const decisive=structural.yangCount===1||structural.yinCount===1;

  if(item.type==='yang'){
    if(signals.act||signals.wait||hasAny(baseText,['ініціат','імпульс','актив']))return '';
    return decisive
      ? 'На тлі загальної стриманості тут з’являється виразний імпульс до дії; його краще спрямувати точно, а не розпорошувати.'
      : 'На тлі більш стриманої ситуації тут помітніша потреба діяти; краще надати їй чіткого напряму, ніж просто посилювати натиск.';
  }

  if(signals.wait||signals.ease)return '';
  return decisive
    ? 'На тлі загальної активності тут особливо важливо вчасно послабити натиск і не відповідати силою на силу.'
    : 'На тлі активного розвитку тут корисніше зберегти сприйнятливість і вчасно послабити натиск.';
}

function chooseNuance(structural,item,sourceText){
  const signals=semanticSignals(sourceText);
  const balanceAlready=hasAny(sourceText,['мір','рівнов','баланс','середин','центр','крайн']);
  const supportAlready=signals.support;
  const cautionAlready=hasAny(sourceText,['не посп','перевір','обереж','ризик','форс']);
  const minority=minorityMeaning(structural,item,sourceText,signals);

  // Ієрархія: зміст конкретної лінії > практична порада > структурне уточнення.
  // Структура ніколи не повинна заперечувати прямо висловлений зміст лінії.
  if(minority)return minority;
  if(item.central&&!balanceAlready)return 'Тепер важливо не посилювати крайнощі, а втримати ясний напрям і міру.';

  if(!item.appropriate&&!item.correspondence&&!cautionAlready&&!supportAlready){
    return 'Тут є внутрішня суперечність, тому перед дією варто ще раз перевірити, чи обраний напрям справді відповідає ситуації.';
  }
  if(!item.appropriate&&item.correspondence&&!signals.isolation){
    return supportAlready
      ? 'Наявний зв’язок може допомогти пройти цю внутрішню суперечність без зайвого тиску.'
      : 'Попри внутрішню суперечність, тут можливий відгук з іншого боку ситуації; цю напругу можна використати для переходу.';
  }
  if(item.appropriate&&item.correspondence&&!supportAlready&&!signals.isolation){
    return 'Напрям має достатню опору, тож рухатися далі можна без зайвого форсування.';
  }
  if(item.appropriate&&!item.correspondence&&!supportAlready){
    return 'Напрям має внутрішню опору; цього достатньо, щоб не шукати зовнішнього підтвердження будь-якою ціною.';
  }
  return '';
}

function integratedText(primaryNumber,line){
  const structural=getStructuralContext(primaryNumber,[line.position]);
  const item=structural?.lines?.[0];
  if(!item)return null;
  const meaning=String(line.meaning||'').trim();
  const advice=String(line.advice||'').trim();
  const lead=stageLead[item.position]||'';
  const base=[lead,meaning].filter(Boolean).join(' ');
  const sourceText=`${meaning} ${advice}`;
  const nuance=chooseNuance(structural,item,sourceText);
  return {explanation:[base,nuance].filter(Boolean).join(' '),advice};
}

function auditStructuralReadings(){
  const issues=[];
  let checked=0;
  const forbidden=['центральне положення','центральна позиція','будова гексаграми','структурн','відповідність','ян ','інь ','позиція'];
  const repeatedConcepts=[
    ['міра',['мір','рівнов','баланс','крайн']],
    ['підтримка',['підтрим','опор','відгук']],
    ['перевірка',['перевір','підтвердж']],
    ['натиск',['натиск','форс','тиск']]
  ];

  for(let h=1;h<=64;h++){
    const hexagram=getHexagramData(h);
    if(!hexagram){issues.push({id:String(h),type:'missing-hexagram'});continue;}
    for(let position=1;position<=6;position++){
      checked++;
      const line=getChangingLine(hexagram,position);
      const result=integratedText(h,line);
      if(!result?.explanation){issues.push({id:`${h}.${position}`,type:'missing-reading'});continue;}
      const source=`${line.meaning||''} ${line.advice||''}`;
      const sourceSignals=semanticSignals(source);
      const generatedSignals=semanticSignals(result.explanation);
      const text=`${result.explanation} ${result.advice}`.toLowerCase();
      const technical=forbidden.filter(term=>text.includes(term));
      if(technical.length)issues.push({id:`${h}.${position}`,type:'technical-language',terms:technical});

      if(sourceSignals.support&&generatedSignals.isolation)issues.push({id:`${h}.${position}`,type:'semantic-conflict',conflict:'support-vs-isolation'});
      if(sourceSignals.act&&generatedSignals.wait&&!sourceSignals.wait)issues.push({id:`${h}.${position}`,type:'semantic-conflict',conflict:'act-vs-wait'});
      if(sourceSignals.wait&&generatedSignals.act&&!sourceSignals.act)issues.push({id:`${h}.${position}`,type:'semantic-conflict',conflict:'wait-vs-act'});
      if(sourceSignals.ease&&generatedSignals.press&&!sourceSignals.press)issues.push({id:`${h}.${position}`,type:'semantic-conflict',conflict:'ease-vs-pressure'});
      if(sourceSignals.finish&&generatedSignals.continue&&!sourceSignals.continue)issues.push({id:`${h}.${position}`,type:'semantic-conflict',conflict:'finish-vs-continue'});

      repeatedConcepts.forEach(([name,stems])=>{
        const hits=stems.reduce((sum,stem)=>sum+(text.split(stem).length-1),0);
        if(hits>=3)issues.push({id:`${h}.${position}`,type:'repeated-concept',concept:name,hits});
      });

      const sentences=result.explanation.split(/[.!?]+/).map(value=>value.trim()).filter(Boolean);
      if(sentences.length!==new Set(sentences.map(value=>value.toLowerCase())).size)issues.push({id:`${h}.${position}`,type:'duplicate-sentence'});
      if(result.explanation.length>520)issues.push({id:`${h}.${position}`,type:'too-long',chars:result.explanation.length});
    }
  }

  const report={ok:issues.length===0,checked,total:384,issues};
  globalThis.__structuralAudit=report;
  console.info(`[structural-audit] ${checked}/384 readings checked; ${issues.length} issue(s).`,report);
  return report;
}

function markExperiment(){
  const result=$('#answer-result');
  if(!result||result.classList.contains('hidden'))return;
  if(!$('#structural-test-badge')){
    const badge=document.createElement('p');
    badge.id='structural-test-badge';
    badge.className='structural-test-badge';
    badge.textContent='Експеримент: природне структурне читання';
    result.querySelector('.progress')?.insertAdjacentElement('afterend',badge);
  }
}

function resolveLine(card,primary){
  const badgeText=card.querySelector('.changing-line-badge')?.textContent?.trim()||'';
  const position=Number(badgeText);
  if(Number.isInteger(position)&&position>=1&&position<=6)return getChangingLine(primary,position);

  const variants=Array.from({length:6},(_,i)=>getChangingLine(primary,i+1));
  const title=card.querySelector('strong')?.textContent?.trim()||'';
  const paragraphs=Array.from(card.querySelectorAll(':scope > p'));
  const originalMeaning=paragraphs[0]?.dataset.originalText||paragraphs[0]?.textContent?.trim()||'';
  return variants.find(item=>item.title===title&&item.meaning===originalMeaning)
    ||variants.find(item=>item.title===title)
    ||variants.find(item=>item.meaning===originalMeaning)
    ||null;
}

function decorateChangingLines(){
  const primaryNumber=numberFrom($('#primary-details-title')?.textContent);
  if(!primaryNumber)return;
  const primary=getHexagramData(primaryNumber);
  if(!primary)return;

  document.querySelectorAll('#changing-lines-list .changing-line-card').forEach(card=>{
    card.querySelector('.structural-line-note')?.remove();
    const paragraphs=Array.from(card.querySelectorAll(':scope > p'));
    const line=resolveLine(card,primary);
    if(!line)return;
    const integrated=integratedText(primaryNumber,line);
    if(!integrated)return;

    if(paragraphs[0]){
      if(!paragraphs[0].dataset.originalText)paragraphs[0].dataset.originalText=paragraphs[0].textContent.trim();
      paragraphs[0].classList.add('integrated-reading');
      paragraphs[0].textContent=integrated.explanation;
    }
    if(paragraphs[1]&&integrated.advice){
      if(!paragraphs[1].dataset.originalText)paragraphs[1].dataset.originalText=paragraphs[1].textContent.trim();
      paragraphs[1].classList.add('integrated-reading');
      paragraphs[1].textContent=integrated.advice;
    }
  });
}

function render(){ensureTestStyles();markExperiment();decorateChangingLines()}
ensureTestStyles();
auditStructuralReadings();
render();
const target=$('#answer-result');
if(target){let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;render()})}).observe(target,{subtree:true,childList:true,characterData:true})}
