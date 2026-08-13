import {getHexagramCycle as base} from './hexagram-cycles.js';
import {HEXAGRAM_CYCLES_33_40 as X} from './hexagram-cycles-33-40.js';
export function getHexagramCycle(number){return X[Number(number)]||base(number);}
