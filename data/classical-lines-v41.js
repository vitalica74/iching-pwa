import {getClassicalLineInterpretations as getLegacyClassicalLineInterpretations} from './classical-lines.js';
import {WILHELM_01_02,SHCHUTSKY_01_02} from './classical-lines-01-02.js';

export function getClassicalLineInterpretations(hexagramNumber,lineNumber){
  const h=Number(hexagramNumber),l=Number(lineNumber);
  const wilhelm=WILHELM_01_02[h]?.[l]||null;
  const shchutsky=SHCHUTSKY_01_02[h]?.[l]||null;
  if(wilhelm||shchutsky){
    return {
      available:true,
      verified:Boolean(wilhelm&&shchutsky),
      corpusVersion:'4.1.0',
      wilhelm,
      shchutsky
    };
  }
  return getLegacyClassicalLineInterpretations(h,l);
}
