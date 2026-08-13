import {getClassicalLineInterpretations} from './classical-lines-clean.js';
import {LINES_01_04} from './changing-lines-01-04.js';
import {LINES_05_10} from './changing-lines-05-10.js';
import {LINES_11_16} from './changing-lines-11-16.js';
import {LINES_17_24} from './changing-lines-17-24.js';
import {LINES_25_32} from './changing-lines-25-32.js';

const POSITION={1:['Початок процесу','основа й перший крок'],2:['Внутрішня опора','підтримка, зв’язки та внутрішня рівновага'],3:['Перехід від задуму до дії','готовність до переходу'],4:['Входження у зовнішню ситуацію','роль, відповідальність і наслідки для інших'],5:['Центр рішення','головний вибір і міра відповідальності'],6:['Завершення або надмірність','межа процесу й вихід у новий стан']};
const LINES={...LINES_01_04,...LINES_05_10,...LINES_11_16,...LINES_17_24,...LINES_25_32};

export function getChangingLine(hexagram,position){
  const [stage,focus]=POSITION[position]||POSITION[1];
  const data=LINES[hexagram.number]?.[position]||{title:`Лінія ${position} — ${stage}`,stage,meaning:`У гексаграмі «${hexagram.name}» найбільша рухливість припадає на ${focus}.`,advice:'Дійте відповідно до цієї стадії й не форсуйте перехід.'};
  return {id:`${hexagram.number}.${position}`,hexagram:hexagram.number,position,...data,classical:getClassicalLineInterpretations(hexagram.number,position)};
}
export function getChangingLines(hexagram,positions){return positions.map(position=>getChangingLine(hexagram,position));}
