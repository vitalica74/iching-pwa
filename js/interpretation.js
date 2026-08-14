import {getChangingLines} from '../data/changing-lines.js';
import {getTransition} from '../data/transitions.js';
import {CONTEXTS} from '../data/profiles.js';
import {getClassicalInterpretations} from '../data/classical-sources.js';
import {getHexagramCycle} from '../data/hexagram-cycles.js';

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
  if(lines.length===1)return `Ключова зміна відбувається на рівні «${stages}».`;
  return `Зміни торкаються рівнів: ${stages}.`;
}
function synthesizeAction(lines,primary,transition,context){
  if(!lines.length)return contextualize(primary.advice,context);
  if(lines.length===1)return contextualize(lines[0].advice,context);
  const first=lines[0]?.advice;
  const last=lines[lines.length-1]?.advice;
  const combined=first===last?first:`Почніть із нижчої активної точки: ${lowerFirst(first)} Далі врахуйте верхню межу змін: ${lowerFirst(last)}`;
  return contextualize(combined||transition.recommendation||primary.advice,context);
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

  const essence=firstSentence(primary.desc);
  const action=synthesizeAction(lines,primary,transition,context);
  const development=hasChanges?firstSentence(secondary.desc):'Окремого напрямку переходу немає: головним залишається поточний стан.';

  return {
    schemaVersion:5,
    mode,
    answer:{essence,action,development},
    rationale:{lines:lineFocus,transition:hasChanges?'Поточна гексаграма задає стан, змінні лінії показують активні точки, результуюча гексаграма — напрямок розвитку.':'Без змінних ліній головним орієнтиром залишається поточна гексаграма.'},
    primary:{meaning:ensurePeriod(primary.desc),caution:ensurePeriod(primary.caution),cycle:primaryCycle},
    lines,
    transition,
    secondary:{meaning:ensurePeriod(secondary.desc),cycle:secondaryCycle},
    classics,
    conclusion:[essence,action,development].filter(Boolean).join(' ')
  };
}
