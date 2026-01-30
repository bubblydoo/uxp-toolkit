export const DOCUMENT_EDITED_EVENTS = [
  "select",
  "delete",
  "make",
  "set",
  "move",
  "close",
  "show",
  "hide",
  "convertToProfile",
  "selectNoLayers",
  "historyStateChanged" // this might have changed the document
];

export const DOCUMENT_LAYERS_EDITED_EVENTS = [
  // "select",
  "delete",
  "make",
  "set",
  "move",
  "close",
  // "show",
  // "hide",
  // "convertToProfile",
  // "selectNoLayers",
  "historyStateChanged" // this might have changed the layers
];

export const DOCUMENT_LAYERS_SELECTION_EVENTS = [
  "select",
  "deselect",
  // "delete",
  // "make",
  // "set",
  // "move",
  // "close",
  // "show",
  // "hide",
  // "convertToProfile",
  // "selectNoLayers",
  "historyStateChanged" // this might have changed the layers selection, e.g. when deleting an undo
];
