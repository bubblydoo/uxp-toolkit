// UT tree – layer descriptors & Photoshop tree
export { createMultiGetDocumentCommand } from './commands-library/multiGetDocument';
// Core wrappers
export { executeAsModalAndSuspendHistory } from './core-wrappers/executeAsModalAndSuspendHistory';

// Core – batchPlay & command building
export { batchPlay } from './core/batchPlay';
export {
  batchPlayCommand,
  batchPlayCommands,
  createCommand,
  createModifyingBatchPlayContext,
  type UTCommandBase,
  type UTCommandModifying,
  type UTCommandNonModifying,
  type UTCommandResult,
} from './core/command';

// Core – execution context
export {
  executeAsModal,
  type ExtendedExecutionContext,
} from './core/executeAsModal';

export {
  suspendHistory,
  type SuspendHistoryContext,
} from './core/suspendHistory';
// DOM – layers
export { getFlattenedDomLayersList } from './dom/getFlattenedDomLayersList';

export { photoshopDomLayersToTree } from './dom/photoshopDomLayersToTree';

// Error sourcemaps
export {
  type BasicStackFrame,
  getBasicStackFrameAbsoluteFilePath,
  parseUxpErrorSourcemaps,
} from './error-sourcemaps/sourcemaps';
// Filesystem
export { isFile, isFolder } from './filesystem/isFileOrFolder';
export { openFileByPath } from './filesystem/openFileByPath';
// General tree
export { flattenTree } from './general-tree/flattenTree';
export { type LayerRef } from './general-tree/layerRef';
export { mapTree } from './general-tree/mapTree';

export { mapTreeRef } from './general-tree/mapTreeRef';
export { type Tree } from './general-tree/treeTypes';
// Other
export { photoshopGetApplicationInfo } from './other/applicationInfo';

export { copyToClipboard, readFromClipboard } from './other/clipboard';
export { uxpEntrypointsSchema } from './other/uxpEntrypoints';
export { getDocumentLayerDescriptors, type LayerDescriptor } from './ut-tree/getDocumentLayerDescriptors';
export { getLayerEffects } from './ut-tree/getLayerEffects';
export {
  photoshopLayerDescriptorsToUTLayers,
  type UTLayer,
} from './ut-tree/photoshopLayerDescriptorsToUTLayers';
export { type PsLayerRef } from './ut-tree/psLayerRef';

// UT tree – text
export { utLayersToText as utTreeToText } from './ut-tree/utLayersToText';

export {
  utLayersToTree,
  type UTLayerWithoutChildren,
} from './ut-tree/utLayersToTree';
export { type UTLayerPickKeys } from './util/utLayerPickKeysType';

// Util
export { utLayersToDomLayers, utLayerToDomLayer } from './util/utLayerToLayer';
