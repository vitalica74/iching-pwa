import {getHexagramCycle as base} from './hexagram-cycles.js';
import {HEXAGRAM_CYCLES_49_56 as C} from './hexagram-cycles-49-56.js';
export function getHexagramCycle(number){return C[Number(number)]||base(number);}
