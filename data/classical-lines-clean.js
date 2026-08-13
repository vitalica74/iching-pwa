import {getClassicalLineInterpretations as getBase} from './classical-lines-v41.js';
import {WILHELM_17_24,SHCHUTSKY_17_24} from './classical-lines-17-24.js';

export function getClassicalLineInterpretations(hexagramNumber,lineNumber){
  const h=Number(hexagramNumber),l=Number(lineNumber);
  const wilhelm=WILHELM_17_24[h]?.[l]||null;
  const shchutsky=SHCHUTSKY_17_24[h]?.[l]||null;
  if(wilhelm||shchutsky)return {available:true,verified:Boolean(wilhelm&&shchutsky),corpusVersion:'4.1.0',wilhelm,shchutsky};
  return getBase(h,l);
}
