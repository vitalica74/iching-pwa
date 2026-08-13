import {getClassicalLineInterpretations as base} from './lines-classics-33-40-registry.js';
import {WILHELM_41,SHCHUTSKY_41} from './classical-lines-41.js';
import {WILHELM_42} from './classical-lines-42-w.js';
import {SHCHUTSKY_42} from './classical-lines-42-s.js';
import {WILHELM_43,SHCHUTSKY_43} from './classical-lines-43.js';
import {WILHELM_44,SHCHUTSKY_44} from './classical-lines-44.js';
import {WILHELM_45,SHCHUTSKY_45} from './classical-lines-45.js';
import {WILHELM_46} from './classical-lines-46-w.js';
import {SHCHUTSKY_46} from './classical-lines-46-s.js';
import {WILHELM_47} from './classical-lines-47-w.js';
import {SHCHUTSKY_47} from './classical-lines-47-s.js';
import {WILHELM_48} from './classical-lines-48-w.js';
import {SHCHUTSKY_48} from './classical-lines-48-s.js';
const W={...WILHELM_41,...WILHELM_42,...WILHELM_43,...WILHELM_44,...WILHELM_45,...WILHELM_46,...WILHELM_47,...WILHELM_48};
const S={...SHCHUTSKY_41,...SHCHUTSKY_42,...SHCHUTSKY_43,...SHCHUTSKY_44,...SHCHUTSKY_45,...SHCHUTSKY_46,...SHCHUTSKY_47,...SHCHUTSKY_48};
export function getClassicalLineInterpretations(h,l){h=+h;l=+l;if(W[h]?.[l]||S[h]?.[l])return {available:true,verified:!!(W[h]?.[l]&&S[h]?.[l]),corpusVersion:'4.1.0',wilhelm:W[h]?.[l]||null,shchutsky:S[h]?.[l]||null};return base(h,l);}
