import {getClassicalLineInterpretations as base} from './classical-lines-41-48-registry.js';
import {WILHELM_49_56 as W,SHCHUTSKY_49_56 as S} from './classical-lines-49-56.js';
export function getClassicalLineInterpretations(h,l){h=+h;l=+l;if(W[h]?.[l]||S[h]?.[l])return {available:true,verified:!!(W[h]?.[l]&&S[h]?.[l]),corpusVersion:'4.1.0',wilhelm:W[h]?.[l]||null,shchutsky:S[h]?.[l]||null};return base(h,l);}
