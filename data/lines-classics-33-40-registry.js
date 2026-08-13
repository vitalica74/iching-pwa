import {getClassicalLineInterpretations as base} from './classical-lines-clean.js';
import {WILHELM_33_40 as W,SHCHUTSKY_33_40 as S} from './classical-lines-33-40.js';
export function getClassicalLineInterpretations(h,l){h=+h;l=+l;return W[h]?.[l]||S[h]?.[l]?{available:true,verified:!!(W[h]?.[l]&&S[h]?.[l]),corpusVersion:'4.1.0',wilhelm:W[h]?.[l]||null,shchutsky:S[h]?.[l]||null}:base(h,l);}
