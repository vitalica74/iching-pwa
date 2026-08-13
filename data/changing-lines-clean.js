import {getClassicalLineInterpretations} from './classical-lines-v41.js';
import {LINES_01_04} from './changing-lines-01-04.js';
import {LINES_05_10} from './changing-lines-05-10.js';
import {LINES_11_16} from './changing-lines-11-16.js';
import {LINES_17_24} from './changing-lines-17-24.js';
export const LINES={...LINES_01_04,...LINES_05_10,...LINES_11_16,...LINES_17_24};
export function getChangingLines(hexagram,positions){return positions.map(position=>{const data=LINES[hexagram.number]?.[position];if(!data)return null;return {id:`${hexagram.number}.${position}`,hexagram:hexagram.number,position,...data,classical:getClassicalLineInterpretations(hexagram.number,position)};}).filter(Boolean);}
