import {getChangingLine as baseLine,getChangingLines as baseLines} from './changing-lines-clean.js';
import {getClassicalLineInterpretations as classics} from './classical-lines-49-56-registry.js';
import {LINES_49_56 as L} from './changing-lines-49-56.js';
export function getChangingLine(h,p){const d=L[h.number]?.[p];if(!d)return baseLine(h,p);return {id:`${h.number}.${p}`,hexagram:h.number,position:p,...d,classical:classics(h.number,p)};}
export function getChangingLines(h,ps){if(!L[h.number])return baseLines(h,ps);return ps.map(p=>getChangingLine(h,p));}
