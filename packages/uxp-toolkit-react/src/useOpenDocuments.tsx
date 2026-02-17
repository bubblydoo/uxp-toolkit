import type { Document } from 'adobe:photoshop';
import { action, app } from 'adobe:photoshop';
import { useSyncExternalStore } from 'react';

const OPEN_DOCUMENTS_EVENTS = ['open', 'close'];

// Cache to avoid infinite loops by returning stable references
let cachedDocuments: Document[] | null = null;
let cachedDocumentsSnapshot: string | null = null;

const openDocumentsExternalStore = {
  subscribe: (fn: () => void) => {
    action.addNotificationListener(OPEN_DOCUMENTS_EVENTS, fn);
    return () => {
      action.removeNotificationListener(OPEN_DOCUMENTS_EVENTS, fn);
    };
  },
  getSnapshot: () => {
    const currentDocuments = Array.from(app.documents);

    // Create a simple snapshot string to compare if documents changed
    const currentSnapshot = currentDocuments
      .map(doc => doc.id || doc.name)
      .join(',');

    // Only update cache if the documents actually changed
    if (currentSnapshot !== cachedDocumentsSnapshot) {
      cachedDocuments = currentDocuments;
      cachedDocumentsSnapshot = currentSnapshot;
    }

    return cachedDocuments || [];
  },
};

export function useOpenDocuments() {
  return useSyncExternalStore(
    openDocumentsExternalStore.subscribe,
    openDocumentsExternalStore.getSnapshot,
  );
}
