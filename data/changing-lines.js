import {getClassicalLineInterpretations} from './classical-lines.js';
import {getCrossroads} from './crossroads.js';
import {LINES_01_04} from './changing-lines-01-04.js';
import {LINES_05_10} from './changing-lines-05-10.js';
import {LINES_11_16} from './changing-lines-11-16.js';
import {LINES_17_24} from './changing-lines-17-24.js';
import {LINES_25_32} from './changing-lines-25-32.js';
import {LINES_33_40} from './changing-lines-33-40.js';
import {LINES_41_48} from './changing-lines-41-48.js';
import {LINES_49_56} from './changing-lines-49-56.js';
import {LINES_57_64} from './changing-lines-57-64.js';

const POSITION={
  1:{stage:'Початок процесу',focus:'основа й перший крок',advice:'Перевірте основу й перший крок.'},
  2:{stage:'Внутрішня опора',focus:'підтримка, зв’язки та внутрішня рівновага',advice:'Спирайтеся на надійні зв’язки та внутрішню рівновагу.'},
  3:{stage:'Перехід від задуму до дії',focus:'готовність до переходу',advice:'Оцініть готовність опори перед переходом.'},
  4:{stage:'Входження у зовнішню ситуацію',focus:'роль, відповідальність і наслідки для інших',advice:'Врахуйте роль, відповідальність і наслідки для інших.'},
  5:{stage:'Центр рішення',focus:'головний вибір і міра відповідальності',advice:'Обирайте міру, справедливість і те, що служить цілому.'},
  6:{stage:'Завершення або надмірність',focus:'межа процесу й вихід у новий стан',advice:'Не доводьте принцип до крайності; підготуйте вихід у новий стан.'}
};

const LINES={...LINES_01_04,...LINES_05_10,...LINES_11_16,...LINES_17_24,...LINES_25_32,...LINES_33_40,...LINES_41_48,...LINES_49_56,...LINES_57_64};

export function getChangingLine(hexagram,position){
  const fallback=POSITION[position]||POSITION[1];
  const data=LINES[hexagram.number]?.[position]||{
    title:`Лінія ${position} — ${fallback.stage}`,
    stage:fallback.stage,
    meaning:`У гексаграмі «${hexagram.name}» найбільша рухливість припадає на ${fallback.focus}.`,
    advice:fallback.advice
  };
  return {id:`${hexagram.number}.${position}`,hexagram:hexagram.number,position,...data,crossroads:getCrossroads(hexagram.number,position),classical:getClassicalLineInterpretations(hexagram.number,position)};
}

export function getChangingLines(hexagram,positions){return positions.map(position=>getChangingLine(hexagram,position));}

export function validateChangingLinesCorpus(){
  const required=['title','stage','meaning','advice'];
  const missing=[];
  const malformed=[];
  for(let h=1;h<=64;h++){
    for(let line=1;line<=6;line++){
      const entry=LINES[h]?.[line];
      if(!entry){missing.push(`${h}.${line}`);continue;}
      const bad=required.filter(key=>typeof entry[key]!=='string'||!entry[key].trim());
      if(bad.length)malformed.push({id:`${h}.${line}`,fields:bad});
    }
  }
  return {ok:missing.length===0&&malformed.length===0,totalPossible:384,complete:384-missing.length,missing,malformed};
}
