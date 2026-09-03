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

function hasAny(text,parts){
  const value=String(text||'').toLowerCase();
  return parts.some(part=>value.includes(part));
}

const stageSignals={
  1:['почат','перш','старт','зарод','відкрива','новий шлях','лише почина','ще крихк'],
  2:['форму','визріва','основ','всередин','внутрішн','ще не настав','ще не вийш'],
  3:['межі між','перехід','визрівання','підходить до дії','перед виход','готовність','назовні'],
  4:['виходить назовні','реальн','взаємод','переходить у дію','дія вже','зовнішн'],
  5:['зріл','наслід','помітн','видим','проявив','майстерн'],
  6:['заверш','на межі','межа циклу','наприкін','кінець','кінці','цикл','підсум','остаточ']
};

function alreadyCarriesStage(position,text){
  return hasAny(text,stageSignals[position]||[]);
}

function weaveStage(position,meaning){
  const text=String(meaning||'').trim();
  if(!text)return {text:'',woven:false};
  if(alreadyCarriesStage(position,text))return {text,woven:false};

  // Не додаємо готову рамку до кожної лінії. Вплітаємо стадію тільки через
  // безпечні мовні гачки, де зміна не створює нового факту і не ламає граматику.
  let out=text;

  if(position===1){
    if(/\b(ще|лише)\b/i.test(text))return {text,woven:false};
    if(/\b(може|можуть)\b/i.test(text))out=text.replace(/\b(може|можуть)\b/i,'на початку $1');
    else if(/\b(потрібно|варто|слід)\b/i.test(text))out=text.replace(/\b(потрібно|варто|слід)\b/i,'спершу $1');
  }else if(position===2){
    if(/\b(поступово|ще|внутрішн|основ)\w*/i.test(text))return {text,woven:false};
    if(/\b(зростає|зміцнюється|визначається|стає)\b/i.test(text))out=text.replace(/\b(зростає|зміцнюється|визначається|стає)\b/i,'поступово $1');
  }else if(position===3){
    if(/\b(дія|дії|дію|рух|крок|вихід|виходу)\b/i.test(text)){
      out=text.replace(/\b(дія|дії|дію|рух|крок|вихід|виходу)\b/i,match=>`перехід до ${match.toLowerCase()}`);
      // Захист від незграбних конструкцій на кшталт «перехід до виходу».
      if(/перехід до вих(ід|оду)/i.test(out))out=text;
    }
  }else if(position===4){
    if(/\b(назовні|зовнішн|взаємод|реальн)\w*/i.test(text))return {text,woven:false};
    if(/\b(дія|дії|дію|вчинок|вчинки)\b/i.test(text))out=text.replace(/\b(дія|дії|дію|вчинок|вчинки)\b/i,match=>`зовнішн${/я$/.test(match)?'я':'ій'} ${match}`);
  }else if(position===5){
    if(/\b(зріл|видим|помітн|наслід|результат)\w*/i.test(text))return {text,woven:false};
    if(/\b(стає|стають|проявляється|проявляються)\b/i.test(text))out=text.replace(/\b(стає|стають|проявляється|проявляються)\b/i,'вже $1');
  }else if(position===6){
    if(/\b(заверш|кінець|кінці|цикл|межа|остаточ|підсум)\w*/i.test(text))return {text,woven:false};
    if(/\b(вже|нарешті)\b/i.test(text))return {text,woven:false};
    if(/\b(може|можуть|стає|стають)\b/i.test(text))out=text.replace(/\b(може|можуть|стає|стають)\b/i,'на завершенні $1');
  }

  // Якщо безпечного вплітання не знайшлося, лишаємо оригінальний зміст.
  if(out===text)return {text,woven:false};
  return {text:out,woven:true};
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
  const woven=weaveStage(item.position,meaning);
  const shade=structuralShade(structural,item,meaning,advice);
  return {explanation:[woven.text,shade].filter(Boolean).join(' '),advice,hasShade:Boolean(shade),stageWoven:woven.woven};
}

function auditStructuralReadings(){
  const issues=[];
  let checked=0,withShade=0,stageWoven=0,stageAlreadyPresent=0,stageUntouched=0;
  const forbidden=['центральне положення','центральна позиція','будова гексаграми','структурн','відповідність','ян ','інь ','позиція','інша сторона ситуації','реальна опора','зовнішня підтримка','наявний зв’язок','наявний зв\'язок','тема міри','для самого змісту лінії','частиною самого шляху зміни','випливає з напруги самої ситуації','загальний фон ситуації','самого змісту','самої лінії'];

  for(let h=1;h<=64;h++){
    const hexagram=getHexagramData(h);
    if(!hexagram){issues.push({id:String(h),type:'missing-hexagram'});continue;}
    for(let position=1;position<=6;position++){
      checked++;
      const line=getChangingLine(hexagram,position);
      const result=integratedText(h,line);
      if(!result?.explanation){issues.push({id:`${h}.${position}`,type:'missing-reading'});continue;}
      if(result.hasShade)withShade++;
      if(result.stageWoven)stageWoven++;
      else if(alreadyCarriesStage(position,line.meaning))stageAlreadyPresent++;
      else stageUntouched++;

      const text=`${result.explanation} ${result.advice}`.toLowerCase();
      const technical=forbidden.filter(term=>text.includes(term));
      if(technical.length)issues.push({id:`${h}.${position}`,type:'meta-risk-or-invented-fact',terms:technical});
      if(result.explanation.length>460)issues.push({id:`${h}.${position}`,type:'too-long',chars:result.explanation.length});
      if(/\bна завершенні на завершенні\b|\bперехід до переход/i.test(result.explanation))issues.push({id:`${h}.${position}`,type:'weave-duplication',text:result.explanation});
    }
  }

  const report={ok:issues.length===0,checked,total:384,withShade,stageWoven,stageAlreadyPresent,stageUntouched,issues};
  globalThis.__structuralAudit=report;
  console.info(`[structural-audit] ${checked}/384; woven: ${stageWoven}; already carried: ${stageAlreadyPresent}; untouched for safety: ${stageUntouched}; shade: ${withShade}; ${issues.length} issue(s).`,report);
  return report;
}

function markExperiment(){
  const result=$('#answer-result');
  if(!result||result.classList.contains('hidden'))return;
  if(!$('#structural-test-badge')){
    const badge=document.createElement('p');
    badge.id='structural-test-badge';
    badge.className='structural-test-badge';
    badge.textContent='Експеримент: структура вплетена в зміст';
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
  return variants.find(item=>item.title===title&&item.meaning===originalMeaning)||variants.find(item=>item.title===title)||variants.find(item=>item.meaning===originalMeaning)||null;
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
