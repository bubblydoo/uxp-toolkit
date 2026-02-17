import type { Document } from 'adobe:photoshop';
import {
  DOCUMENT_EDITED_EVENTS,
  DOCUMENT_LAYERS_EDITED_EVENTS,
  DOCUMENT_LAYERS_SELECTION_EVENTS,
} from './events';
import { useOnEvent } from './useOnEvent';

export function useOnDocumentEdited(document: Document, trigger: () => void) {
  return useOnEvent(document, DOCUMENT_EDITED_EVENTS, trigger);
}

// from https://forums.creativeclouddeveloper.com/t/how-can-i-detect-when-activedocument-changed/2681/15

export function useOnDocumentLayersEdited(
  document: Document,
  trigger: () => void,
) {
  return useOnEvent(document, DOCUMENT_LAYERS_EDITED_EVENTS, trigger);
}

export function useOnDocumentLayersSelection(
  document: Document,
  trigger: () => void,
) {
  return useOnEvent(document, DOCUMENT_LAYERS_SELECTION_EVENTS, trigger);
}
