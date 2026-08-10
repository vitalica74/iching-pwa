import {getChangingLines} from '../data/changing-lines.js';
import {getTransition} from '../data/transitions.js';
import {CONTEXTS} from '../data/profiles.js';
import {getClassicalInterpretations} from '../data/classical-sources.js';
import {getHexagramCycle} from '../data/hexagram-cycles-01-10.js';

const ensurePeriod=text=>{const value=String(text??'').trim();return value&&!/[.!?…]$/.test(value)?`${value}.`:value};
const lowerFirst=text=>{const value=String(text??'').trim();return value?value[0].toLocaleLowerCase('uk-UA')+value.slice(1):value};
const firstSentence=text=>{const value=String(text??'').trim();const match=value.match(/^.*?[.!?](?:\s|$)/);return (match?.[0]??value).trim()};
const joinNatural=items=>{const clean=[...new Set(items.filter(Boolean))];if(clean.length<=1)return clean[0]??'';return `${clean.slice(0,-1).join(', ')} та ${clean[clean.length-1]}`};

function contextualize(text,context){
  if(context==='general')return ensurePeriod(text);
  const profile=CONTEXTS[context]??CONTEXTS.general;
  return `${profile.lead}: ${lowerFirst(ensurePeriod(text))}`;
}
function summarizeLineFocus(lines){
  if(!lines.length)return 'Змінних ліній немає: ситуація радше просить правильно прожити наявний стан, ніж шукати різкий перелом.';
  const stages=joinNatural(lines.map(line=>line.stage));
  if(lines.length===1)return `Ключова зміна відбувається на рівні «${stages}»: ${lowerFirst(lines[0].advice)}`;
  return `Зміни торкаються рівнів: ${stages}. Не перебудовуйте все одразу; починайте з найнижчої змінної лінії.`;
}
function fallbackTransition(primary,secondary,hasChanges){
  if(!hasChanges)return {summary:`Стан «${primary.name}» залишається головним орієнтиром.`,change:'Окремого переходу до іншої гексаграми не показано.',recommendation:primary.advice,danger:primary.caution,future:'Подальший розвиток залежить від того, наскільки послідовно буде втілена порада основної гексаграми.',exact:false};
  return {summary:`«${primary.name}» переходить у «${secondary.name}».`,change:`Тема «${primary.name}» поступово відходить на другий план, а як наступний напрям проявляється «${secondary.name}».`,recommendation:primary.advice,danger:primary.caution,future:`Напрям розвитку: ${lowerFirst(secondary.desc)}`,exact:false};
}

export function buildInterpretation({primary,secondary,changingPositions,context='general',mode='practical'}){
  const lines=getChangingLines(primary,changingPositions);
  const exact=getTransition(primary.number,secondary.number);
  const hasChanges=changingPositions.length>0;
  const transition=exact?{...exact,exact:true}:fallbackTransition(primary,secondary,hasChanges);
  const lineFocus=summarizeLineFocus(lines);
  const classics=getClassicalInterpretations(primary.number);
  const primaryCycle=getHexagramCycle(primary.number);
  const secondaryCycle=getHexagramCycle(secondary.number);

  // Свідомо стискаємо головну відповідь до трьох різних функцій, без повторення одного сенсу.
  const essence=firstSentence(hasChanges?transition.summary:primary.desc);
  const action=contextualize(transition.recommendation||primary.advice,context);
  const development=hasChanges?firstSentence(transition.future||secondary.desc):firstSentence(primary.desc);

  return {
    schemaVersion:4,
    mode,
    answer:{essence,action,development},
    rationale:{lines:lineFocus,transition:hasChanges?'Основна гексаграма показує теперішній стан, змінні лінії — місце зміни, додаткова — напрям розвитку.':'Без змінних ліній головним орієнтиром залишається основна гексаграма.'},
    primary:{meaning:ensurePeriod(primary.desc),advice:ensurePeriod(primary.advice),caution:ensurePeriod(primary.caution),cycle:primaryCycle},
    lines,
    transition,
    secondary:{meaning:ensurePeriod(secondary.desc),advice:ensurePeriod(secondary.advice),caution:ensurePeriod(secondary.caution),cycle:secondaryCycle},
    classics,
    conclusion:[essence,action,development].filter(Boolean).join(' ')
  };
}
