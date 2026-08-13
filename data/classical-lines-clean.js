import {getClassicalLineInterpretations as getBase} from './classical-lines-v41.js';
import {WILHELM_17_24,SHCHUTSKY_17_24} from './classical-lines-17-24.js';
import {WILHELM_25_32,SHCHUTSKY_25_32} from './classical-lines-25-32.js';

const WILHELM={...WILHELM_17_24,...WILHELM_25_32};
const SHCHUTSKY={...SHCHUTSKY_17_24,...SHCHUTSKY_25_32};

export function getClassicalLineInterpretations(hexagramNumber,lineNumber){
  const h=Number(hexagramNumber),l=Number(lineNumber);
  const wilhelm=WILHELM[h]?.[l]||null;
  const shchutsky=SHCHUTSKY[h]?.[l]||null;
  if(wilhelm||shchutsky)return {available:true,verified:Boolean(wilhelm&&shchutsky),corpusVersion:'4.1.0',wilhelm,shchutsky};
  return getBase(h,l);
}
