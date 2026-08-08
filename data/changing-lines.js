import {getClassicalLineInterpretations} from './classical-lines.js';
const POSITION = {
  1: {stage:'початок процесу',focus:'основа й перший крок',advice:'Не поспішайте: перевірте основу й перший крок.'},
  2: {stage:'внутрішня опора',focus:'підтримка, зв’язки та внутрішня рівновага',advice:'Дійте природно, без показовості, спираючись на надійні зв’язки.'},
  3: {stage:'перехід від задуму до дії',focus:'ризик переходу й готовність опори',advice:'Оцініть ризик переходу; не тисніть, коли опора ще слабка.'},
  4: {stage:'входження у зовнішню ситуацію',focus:'роль, відповідальність і наслідки для інших',advice:'Будьте уважні до ролі, відповідальності та наслідків для інших.'},
  5: {stage:'центр рішення',focus:'головний вибір і міра відповідальності',advice:'Обирайте міру, справедливість і те, що служить цілому.'},
  6: {stage:'завершення або надмірність',focus:'межа процесу й вихід у новий стан',advice:'Не доводьте принцип до крайності; підготуйте вихід у новий стан.'}
};

export function getChangingLine(hexagram, position){
  const data=POSITION[position]||POSITION[1];
  return {
    id:`${hexagram.number}.${position}`,
    hexagram:hexagram.number,
    position,
    title:`Лінія ${position} — ${data.stage}`,
    stage:data.stage,
    focus:data.focus,
    meaning:`У гексаграмі «${hexagram.name}» найбільша рухливість припадає на ${data.focus}.`,
    advice:data.advice,
    transition:`Саме цей рівень бере участь у переході від стану №${hexagram.number} до додаткової гексаграми.`,
    classical:getClassicalLineInterpretations(hexagram.number,position)
  };
}

export function getChangingLines(hexagram, positions){
  return positions.map(position=>getChangingLine(hexagram,position));
}
