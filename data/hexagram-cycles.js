import {HEXAGRAM_CYCLES_01_10} from './hexagram-cycles-01-10-data.js';
import {HEXAGRAM_CYCLES_11_16_DATA} from './hexagram-cycles-11-16-data.js';
import {HEXAGRAM_CYCLES_17_24} from './hexagram-cycles-17-24.js';

const CYCLES={...HEXAGRAM_CYCLES_01_10,...HEXAGRAM_CYCLES_11_16_DATA,...HEXAGRAM_CYCLES_17_24};
export function getHexagramCycle(number){return CYCLES[Number(number)]||null;}
