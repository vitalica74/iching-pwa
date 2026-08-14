import {HEXAGRAM_CYCLES_01_10} from './hexagram-cycles-01-10.js';
import {HEXAGRAM_CYCLES_11_16} from './hexagram-cycles-11-16.js';
import {HEXAGRAM_CYCLES_17_24} from './hexagram-cycles-17-24.js';
import {HEXAGRAM_CYCLES_25_32} from './hexagram-cycles-25-32.js';
import {HEXAGRAM_CYCLES_33_40} from './hexagram-cycles-33-40.js';
import {HEXAGRAM_CYCLES_41_48} from './hexagram-cycles-41-48.js';
import {HEXAGRAM_CYCLES_49_56} from './hexagram-cycles-49-56.js';
import {HEXAGRAM_CYCLES_57_64} from './hexagram-cycles-57-64.js';

const CYCLES={...HEXAGRAM_CYCLES_01_10,...HEXAGRAM_CYCLES_11_16,...HEXAGRAM_CYCLES_17_24,...HEXAGRAM_CYCLES_25_32,...HEXAGRAM_CYCLES_33_40,...HEXAGRAM_CYCLES_41_48,...HEXAGRAM_CYCLES_49_56,...HEXAGRAM_CYCLES_57_64};

export function getHexagramCycle(number){return CYCLES[Number(number)]||null;}
