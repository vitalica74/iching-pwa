import {getClassicalLineInterpretations as base} from './classical-lines-49-56-registry.js';
import {WILHELM_57_60,SHCHUTSKY_57_60} from './classical-lines-57-60.js';
import {WILHELM_61_64,SHCHUTSKY_61_64} from './classical-lines-61-64-lite.js';
const W={...WILHELM_57_60,...WILHELM_61_64};
const S={...SHCHUTSKY_57_60,...SHCHUTSKY_61_64};
export function getClassicalLineInterpretations(h,l){h=+h;l=+l;if(W[h]?.[l]||S[h]?.[l])return {available:true,verified:!!(W[h]?.[l]&&S[h]?.[l]),corpusVersion:'4.1.0',wilhelm:W[h]?.[l]||null,shchutsky:S[h]?.[l]||null};return base(h,l);}
