import {CROSSROADS_01_04} from './crossroads-01-04.js';

const CROSSROADS={...CROSSROADS_01_04};

export function getCrossroads(hexagramNumber,position){
  const paths=CROSSROADS[hexagramNumber]?.[position];
  return Array.isArray(paths)?paths.filter(Boolean):[];
}

export const CROSSROADS_PRINCIPLE='Текст показує лише частину шляхів, видимих із поточного стану. Користувач може побачити інший і створити власний.';
