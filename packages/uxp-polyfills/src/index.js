// this polyfill is needed, because performance.measure is incorrectly implemented in the UXP API
// breaking React performance measurements
import { performanceMeasurePolyfill } from './performance-measure';
import 'matchmedia-polyfill';
import 'matchmedia-polyfill/matchMedia.addListener';

import 'mutationobserver-shim/MutationObserver';

// mostly for Error.cause
import 'core-js/actual/error';

performance.measure = performanceMeasurePolyfill;
