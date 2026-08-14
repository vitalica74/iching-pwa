import {getClassicalLineInterpretations as getLegacyClassicalLineInterpretations} from './classical-lines.js';
import {WILHELM_01_04,SHCHUTSKY_01_04} from './classical-lines-01-04.js';
import {WILHELM_05_10,SHCHUTSKY_05_10} from './classical-lines-05-10.js';
import {WILHELM_11_16,SHCHUTSKY_11_16} from './classical-lines-11-16.js';
import {WILHELM_17_24,SHCHUTSKY_17_24} from './classical-lines-17-24.js';
import {WILHELM_25_32,SHCHUTSKY_25_32} from './classical-lines-25-32.js';
import {WILHELM_33_40,SHCHUTSKY_33_40} from './classical-lines-33-40.js';
import {WILHELM_41_48,SHCHUTSKY_41_48} from './classical-lines-41-48.js';
import {WILHELM_49_56,SHCHUTSKY_49_56} from './classical-lines-49-56.js';
import {WILHELM_57_64,SHCHUTSKY_57_64} from './classical-lines-57-64.js';

const WILHELM={...WILHELM_01_04,...WILHELM_05_10,...WILHELM_11_16,...WILHELM_17_24,...WILHELM_25_32,...WILHELM_33_40,...WILHELM_41_48,...WILHELM_49_56,...WILHELM_57_64};
const SHCHUTSKY={...SHCHUTSKY_01_04,...SHCHUTSKY_05_10,...SHCHUTSKY_11_16,...SHCHUTSKY_17_24,...SHCHUTSKY_25_32,...SHCHUTSKY_33_40,...SHCHUTSKY_41_48,...SHCHUTSKY_49_56,...SHCHUTSKY_57_64};

export function getClassicalLineInterpretations(hexagramNumber,lineNumber){
  const h=Number(hexagramNumber),l=Number(lineNumber);
  const wilhelm=WILHELM[h]?.[l]||null;
  const shchutsky=SHCHUTSKY[h]?.[l]||null;
  if(wilhelm||shchutsky)return {available:true,verified:Boolean(wilhelm&&shchutsky),corpusVersion:'4.1.0',wilhelm,shchutsky};
  return getLegacyClassicalLineInterpretations(h,l);
}
