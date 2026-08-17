import {CROSSROADS_01_04} from './crossroads-01-04.js';
import {CROSSROADS_05_10} from './crossroads-05-10.js';
import {CROSSROADS_11_16} from './crossroads-11-16.js';
import {CROSSROADS_17_24} from './crossroads-17-24.js';
import {CROSSROADS_25_32} from './crossroads-25-32.js';
import {CROSSROADS_33_40} from './crossroads-33-40.js';
import {CROSSROADS_41_48} from './crossroads-41-48.js';

const CROSSROADS={...CROSSROADS_01_04,...CROSSROADS_05_10,...CROSSROADS_11_16,...CROSSROADS_17_24,...CROSSROADS_25_32,...CROSSROADS_33_40,...CROSSROADS_41_48};
export const CROSSROADS_PRINCIPLE='Це лише частина шляхів, які видно звідси. Можна побачити інший і створити власний.';

const unique=items=>[...new Set(items.filter(Boolean))];

export function getCrossroads(hexagramNumber,position){
  const paths=CROSSROADS[hexagramNumber]?.[position];
  return Array.isArray(paths)?paths.filter(Boolean):[];
}

export function buildCrossroads({primary,secondary,lines=[]}){
  const authored=unique(lines.flatMap(line=>getCrossroads(primary.number,line.position)));
  if(authored.length){
    const limit=lines.length>1?4:3;
    return {title:'На роздоріжжі',paths:authored.slice(0,limit),open:CROSSROADS_PRINCIPLE,source:'authored'};
  }

  // Тимчасовий fallback для гексаграм, авторське «Роздоріжжя» яких ще не написане.
  // Після завершення корпусу №1–64 цей блок можна буде прибрати.
  const paths=unique([
    primary.advice?`Збережеш головний орієнтир теперішнього стану — ${primary.advice.charAt(0).toLocaleLowerCase('uk-UA')+primary.advice.slice(1)}`:'',
    lines[0]?.advice?`Підеш за найактивнішою зміною — ${lines[0].advice.charAt(0).toLocaleLowerCase('uk-UA')+lines[0].advice.slice(1)}`:'',
    secondary?.advice&&secondary.number!==primary.number?`Спрямуєш рух до нового стану — ${secondary.advice.charAt(0).toLocaleLowerCase('uk-UA')+secondary.advice.slice(1)}`:''
  ]);
  return {title:'На роздоріжжі',paths,open:CROSSROADS_PRINCIPLE,source:'synthesized'};
}
