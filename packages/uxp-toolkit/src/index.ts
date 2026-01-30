// Core – batchPlay & command building
export { batchPlay, type CorrectBatchPlayOptions } from "./core/batchPlay";
export {
  createCommand,
  batchPlayCommand,
  batchPlayCommands,
  createModifyingBatchPlayContext,
  type UTCommandBase,
  type UTCommandModifying,
  type UTCommandNonModifying,
  type UTCommandResult,
} from "./core/command";

// Core – execution context
export {
  executeAsModal,
  type CorrectExecutionContext,
  type CorrectExecuteAsModalOptions,
  type ExtendedExecutionContext,
} from "./core/executeAsModal";
export {
  suspendHistory,
  type SuspendHistoryContext,
} from "./core/suspendHistory";

// Core wrappers
export { executeAsModalAndSuspendHistory } from "./core-wrappers/executeAsModalAndSuspendHistory";

// Commands library
export { createRenameLayerCommand } from "./commands-library/renameLayer";
export { createGetDocumentCommand, createGetDocumentHasBackgroundLayerCommand } from "./commands-library/getDocument";
export { createGetBackgroundLayerCommand } from "./commands-library/getLayer";

// DOM – layers
export { getFlattenedDomLayersList } from "./dom/getFlattenedDomLayersList";
export { photoshopDomLayersToTree } from "./dom/photoshopDomLayersToTree";

// Filesystem
export { openFileByPath } from "./filesystem/openFileByPath";

// General tree
export { flattenTree } from "./general-tree/flattenTree";
export { mapTree } from "./general-tree/mapTree";
export { mapTreeRef } from "./general-tree/mapTreeRef";
export { type Tree } from "./general-tree/treeTypes";
export { type LayerRef } from "./general-tree/layerRef";

// Other
export { photoshopGetApplicationInfo } from "./other/applicationInfo";
export { copyToClipboard, readFromClipboard } from "./other/clipboard";
export { uxpEntrypointsSchema } from "./other/uxpEntrypoints";

// UT tree – layer descriptors & Photoshop tree
export {
  createGetLayerPropertiesCommand,
  getDocumentLayerDescriptors as getLayerPropertiesFromUtTree,
} from "./ut-tree/getLayerProperties";
export { getLayerEffects } from "./ut-tree/getLayerEffects";
export { type UTLayer } from "./ut-tree/photoshopLayerDescriptorsToUTLayers";
export { type PsLayerRef } from "./ut-tree/psLayerRef";
export {
  utLayersToTree,
  type UTLayerWithoutChildren,
} from "./ut-tree/utLayersToTree";

// UT tree – text
export { utLayersToText as utTreeToText } from "./ut-tree/utLayersToText";

// Util
export { utLayerToDomLayer, utLayersToDomLayers } from "./util/utLayerToLayer";
export { type UTLayerPickKeys } from "./util/utLayerPickKeysType";

// Error sourcemaps
export {
  parseUxpErrorSourcemaps,
  getBasicStackFrameAbsoluteFilePath,
  type BasicStackFrame,
} from "./error-sourcemaps/sourcemaps";
