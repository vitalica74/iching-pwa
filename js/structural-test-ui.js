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

function lowerFirst(text){
  const value=String(text||'').trim();
  if(!value)return '';
  return value.charAt(0).toLocaleLowerCase('uk-UA')+value.slice(1);
}

function stableChoice(text,count){
  let hash=0;
  for(const ch of String(text||''))hash=(hash*31+ch.codePointAt(0))>>>0;
  return count?hash%count:0;
}

const stageFrames={
  1:[
    'На самому початку ',
    'Поки все лише починається, ',
    'На першому етапі '
  ],
  2:[
    'Поки ситуація ще визріває, ',
    'Поки основа ще формується, ',
    'На внутрішньому етапі '
  ],
  3:[
    'На межі між визріванням і дією ',
    'Коли внутрішній процес уже підходить до дії, ',
    'Перед виходом у зовнішню дію '
  ],
  4:[
    'Коли зміна виходить назовні, ',
    'На етапі реальної взаємодії ',
    'Коли намір уже переходить у дію, '
  ],
  5:[
    'У зрілій і вже помітній фазі ',
    'Коли наслідки вже стають видимими, ',
    'На зрілому етапі '
  ],
  6:[
    'На межі завершення ',
    'Коли процес доходить до своєї межі, ',
    'Наприкінці циклу '
  ]
};

const conditionalLeads={
  1:['Початок ще крихкий.','Процес лише набирає форму.'],
  2:['Основа ще формується зсередини.','Ситуація ще не вийшла назовні.'],
  3:['Внутрішнє визрівання вже підходить до дії.','Це перехідна точка між внутрішнім і зовнішнім.'],
  4:['Зміна вже входить у реальну взаємодію.','Намір уже переходить у зовнішню дію.'],
  5:['Наслідки вже стають помітними.','Процес уже проявився досить зріло.'],
  6:['Процес підійшов до межі.','Цикл уже доходить до завершення.']
};

function blendStage(position,meaning){
  const text=String(meaning||'').trim();
  if(!text)return '';
  const conditional=/^(коли|якщо|поки|щойно)\b/i.test(text);
  const key=`${position}:${text}`;

  if(conditional){
    const leads=conditionalLeads[position]||[''];
    return `${leads[stableChoice(key,leads.length)]} ${text}`.trim();
  }

  const frames=stageFrames[position]||[''];
  const prefix=frames[stableChoice(key,frames.length)];
  return `${prefix}${lowerFirst(text)}`.trim();
}

function semanticSignals(text){
  const value=String(text||'').toLowerCase();
  const has=words=>words.some(word=>value.includes(word));
  return {
    act:has(['діяти','дія','крок','рух','рішуч','ініціат','імпульс']),
    wait:has(['не посп','зачека','почек','пауза','зупин','стрим']),
    ease:has(['послаб','м’як','мяк','не тис','не форс','відступ']),
    balance:has(['мір','рівнов','баланс','середин','центр','крайн']),
    verify:has(['перевір','підтвердж','перекона','проясн'])
  };
}

function structuralShade(structural,item,meaning,advice){
  const source=`${meaning} ${advice}`;
  const signals=semanticSignals(source);
  const minority=structural.minority===item.type;

  // Структура не створює нових людей, підтримку, ресурси, небезпеки чи події.
  // Додатковий відтінок дозволений лише тоді, коли він повторює вже наявний напрям
  // і робить його точнішим, а не розширює факти ситуації.
  if(!item.appropriate&&signals.verify)return 'Тут краще перевірити ще раз, ніж поспішити з остаточним кроком.';
  if(minority&&item.type==='yang'&&signals.act)return 'Дію краще спрямувати точно, без зайвого розпорошення.';
  if(minority&&item.type==='yin'&&(signals.wait||signals.ease))return 'Тут стриманість корисніша за посилення натиску.';
  if(item.central&&signals.balance)return '';
  return '';
}

function integratedText(primaryNumber,line){
  const structural=getStructuralContext(primaryNumber,[line.position]);
  const item=structural?.lines?.[0];
  if(!item)return null;
  const meaning=String(line.meaning||'').trim();
  const advice=String(line.advice||'').trim();
  const base=blendStage(item.position,meaning);
  const shade=structuralShade(structural,item,meaning,advice);
  return {explanation:[base,shade].filter(Boolean).join(' '),advice,hasShade:Boolean(shade)};
}

function auditStructuralReadings(){
  const issues=[];
  let checked=0;
  let withShade=0;
  let stageOnly=0;
  const stageVariantCounts={1:{},2:{},3:{},4:{},5:{},6:{}};
  const forbidden=[
    'центральне положення','центральна позиція','будова гексаграми','структурн','відповідність','ян ','інь ','позиція',
    'інша сторона ситуації','реальна опора','зовнішня підтримка','наявний зв’язок','наявний зв\'язок',
    'тема міри','для самого змісту лінії','частиною самого шляху зміни','випливає з напруги самої ситуації',
    'загальний фон ситуації','самого змісту','самої лінії'
  ];

  for(let h=1;h<=64;h++){
    const hexagram=getHexagramData(h);
    if(!hexagram){issues.push({id:String(h),type:'missing-hexagram'});continue;}
    for(let position=1;position<=6;position++){
      checked++;
      const line=getChangingLine(hexagram,position);
      const result=integratedText(h,line);
      if(!result?.explanation){issues.push({id:`${h}.${position}`,type:'missing-reading'});continue;}
      if(result.hasShade)withShade++;else stageOnly++;

      const frames=stageFrames[position]||[];
      const used=frames.find(frame=>result.explanation.startsWith(frame))||'conditional';
      stageVariantCounts[position][used]=(stageVariantCounts[position][used]||0)+1;

      const text=`${result.explanation} ${result.advice}`.toLowerCase();
      const technical=forbidden.filter(term=>text.includes(term));
      if(technical.length)issues.push({id:`${h}.${position}`,type:'meta-risk-or-invented-fact',terms:technical});
      if(result.explanation.length>460)issues.push({id:`${h}.${position}`,type:'too-long',chars:result.explanation.length});
    }
  }

  const report={ok:issues.length===0,checked,total:384,withShade,stageOnly,stageVariantCounts,issues};
  globalThis.__structuralAudit=report;
  console.info(`[structural-audit] ${checked}/384; conservative shade: ${withShade}; stage-framed only: ${stageOnly}; ${issues.length} issue(s).`,report);
  return report;
}

function markExperiment(){
  const result=$('#answer-result');
  if(!result||result.classList.contains('hidden'))return;
  if(!$('#structural-test-badge')){
    const badge=document.createElement('p');
    badge.id='structural-test-badge';
    badge.className='structural-test-badge';
    badge.textContent='Експеримент: структура як контекст';
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
if(target){
  let scheduled=false;
  new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;render()});
  }).observe(target,{subtree:true,childList:true,characterData:true});
}
