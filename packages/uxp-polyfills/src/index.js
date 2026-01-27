import "matchmedia-polyfill";
import "matchmedia-polyfill/matchMedia.addListener";
import "mutationobserver-shim/MutationObserver";

// this polyfill is needed, because performance.measure is incorrectly implemented in the UXP API
// breaking React performance measurements
import { performanceMeasurePolyfill } from "./performance-measure";
performance.measure = performanceMeasurePolyfill;