import {getHexagramCycle as base} from './hexagram-cycles-49-56-registry.js';
import {HEXAGRAM_CYCLES_57_64 as C} from './hexagram-cycles-57-64.js';
export function getHexagramCycle(number){return C[Number(number)]||base(number);}
