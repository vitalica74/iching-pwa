import {getClassicalLineInterpretations as getLegacyClassicalLineInterpretations} from './classical-lines.js';
import {WILHELM_01_04,SHCHUTSKY_01_04} from './classical-lines-01-04.js';
import {WILHELM_05_10,SHCHUTSKY_05_10} from './classical-lines-05-10.js';
import {WILHELM_11_16,SHCHUTSKY_11_16} from './classical-lines-11-16-data.js';

const WILHELM={...WILHELM_01_04,...WILHELM_05_10,...WILHELM_11_16};
const SHCHUTSKY={...SHCHUTSKY_01_04,...SHCHUTSKY_05_10,...SHCHUTSKY_11_16};

export function getClassicalLineInterpretations(hexagramNumber,lineNumber){
  const h=Number(hexagramNumber),l=Number(lineNumber);
  const wilhelm=WILHELM[h]?.[l]||null;
  const shchutsky=SHCHUTSKY[h]?.[l]||null;
  if(wilhelm||shchutsky){
    return {available:true,verified:Boolean(wilhelm&&shchutsky),corpusVersion:'4.1.0',wilhelm,shchutsky};
  }
  return getLegacyClassicalLineInterpretations(h,l);
}
