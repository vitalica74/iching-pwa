import {getChangingLine as baseLine,getChangingLines as baseLines} from './changing-lines-clean.js';
import {getClassicalLineInterpretations as classics} from './lines-classics-33-40-registry.js';
import {LINES_33_40 as L} from './changing-lines-33-40.js';
export function getChangingLine(h,p){const d=L[h.number]&&L[h.number][p];if(!d)return baseLine(h,p);return {id:String(h.number)+'.'+String(p),hexagram:h.number,position:p,title:d.title,stage:d.stage,meaning:d.meaning,advice:d.advice,classical:classics(h.number,p)};}
export function getChangingLines(h,ps){if(!L[h.number])return baseLines(h,ps);return ps.map(function(p){return getChangingLine(h,p);});}
