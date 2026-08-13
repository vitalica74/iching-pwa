import {HEXAGRAM_CYCLES_01_10} from './hexagram-cycles-01-10-data.js';
import {HEXAGRAM_CYCLES_11_16_DATA} from './hexagram-cycles-11-16-data.js';
import {HEXAGRAM_CYCLES_17_24} from './hexagram-cycles-17-24.js';
import {HEXAGRAM_CYCLES_25_32} from './hexagram-cycles-25-32.js';
import {HEXAGRAM_CYCLES_33_40} from './hexagram-cycles-33-40.js';
import {HEXAGRAM_CYCLES_41_48} from './hexagram-cycles-41-48.js';
const CYCLES={...HEXAGRAM_CYCLES_01_10,...HEXAGRAM_CYCLES_11_16_DATA,...HEXAGRAM_CYCLES_17_24,...HEXAGRAM_CYCLES_25_32,...HEXAGRAM_CYCLES_33_40,...HEXAGRAM_CYCLES_41_48};
export function getHexagramCycle(number){return CYCLES[Number(number)]||null;}
