import {getClassicalLineInterpretations} from './classical-lines-v41.js';
import {LINES_01_04} from './changing-lines-01-04.js';
import {LINES_05_10} from './changing-lines-05-10.js';

const POSITION = {
  1:{stage:'Початок процесу',focus:'основа й перший крок',advice:'Не поспішайте: перевірте основу й перший крок.'},
  2:{stage:'Внутрішня опора',focus:'підтримка, зв’язки та внутрішня рівновага',advice:'Дійте природно, без показовості, спираючись на надійні зв’язки.'},
  3:{stage:'Перехід від задуму до дії',focus:'ризик переходу й готовність опори',advice:'Оцініть ризик переходу; не тисніть, коли опора ще слабка.'},
  4:{stage:'Входження у зовнішню ситуацію',focus:'роль, відповідальність і наслідки для інших',advice:'Будьте уважні до ролі, відповідальності та наслідків для інших.'},
  5:{stage:'Центр рішення',focus:'головний вибір і міра відповідальності',advice:'Обирайте міру, справедливість і те, що служить цілому.'},
  6:{stage:'Завершення або надмірність',focus:'межа процесу й вихід у новий стан',advice:'Не доводьте принцип до крайності; підготуйте вихід у новий стан.'}
};

const LINES = {
  ...LINES_01_04,
  ...LINES_05_10
};

export function getChangingLine(hexagram,position){
  const fallback=POSITION[position]||POSITION[1];
  const specific=LINES[hexagram.number]?.[position];
  const data=specific||{
    title:`Лінія ${position} — ${fallback.stage}`,
    stage:fallback.stage,
    meaning:`У гексаграмі «${hexagram.name}» найбільша рухливість припадає на ${fallback.focus}.`,
    advice:fallback.advice
  };

  return {
    id:`${hexagram.number}.${position}`,
    hexagram:hexagram.number,
    position,
    title:data.title,
    stage:data.stage,
    meaning:data.meaning,
    advice:data.advice,
    transition:`Ця точка бере участь у переході від стану №${hexagram.number} до результуючої гексаграми.`,
    classical:getClassicalLineInterpretations(hexagram.number,position)
  };
}

export function getChangingLines(hexagram,positions){
  return positions.map(position=>getChangingLine(hexagram,position));
}
