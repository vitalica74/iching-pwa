import {getChangingLine as b,getChangingLines as bs} from './lines-49-56-registry.js';
import {getClassicalLineInterpretations as c} from './classical-lines-57-64-registry.js';
import {LINES_57 as A} from './changing-lines-57.js';
import {LINES_58_64 as B} from './changing-lines-58-64.js';
const L={...A,...B};
export function getChangingLine(h,p){const d=L[h.number]?.[p];return d?{id:`${h.number}.${p}`,hexagram:h.number,position:p,...d,classical:c(h.number,p)}:b(h,p)}
export function getChangingLines(h,ps){return L[h.number]?ps.map(p=>getChangingLine(h,p)):bs(h,ps)}
