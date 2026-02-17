import type { Document } from 'adobe:photoshop';
import { action, app } from 'adobe:photoshop';
import { useSyncExternalStore } from 'react';

const DOCUMENT_CHANGE_EVENTS = [
  'select',
  'open',
  'close',
  'smartBrushWorkspace',
  'layersFiltered',
];

const activeDocumentExternalStore = {
  subscribe: (fn: () => void) => {
    action.addNotificationListener(DOCUMENT_CHANGE_EVENTS, fn);
    return () => {
      action.removeNotificationListener(DOCUMENT_CHANGE_EVENTS, fn);
    };
  },
  getSnapshot: (): Document | null => app.activeDocument,
};

export function useActiveDocument() {
  return useSyncExternalStore(
    activeDocumentExternalStore.subscribe,
    activeDocumentExternalStore.getSnapshot,
  );
}
