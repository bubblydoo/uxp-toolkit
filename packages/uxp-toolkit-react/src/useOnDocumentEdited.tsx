import { action, app } from "photoshop";
import { useSyncExternalStore } from "react";
import { Document } from "photoshop/dom/Document";
import { useIsAnyPluginPanelVisible } from "./useIsPluginVisible";
import { useEventListenerSkippable } from "./useEventListenerSkippable";

const EVENTS = [
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

export function useOnDocumentEdited(document: Document, trigger: () => void) {
  const isPluginPanelVisible = useIsAnyPluginPanelVisible() ?? true;

  useEventListenerSkippable({
    trigger,
    subscribe: (boundTrigger) => {
      action.addNotificationListener(EVENTS, boundTrigger);
      return () => {
        action.removeNotificationListener(EVENTS, boundTrigger);
      };
    },
    skip: !isPluginPanelVisible,
    filter: document === app.activeDocument,
  });
}

// from https://forums.creativeclouddeveloper.com/t/how-can-i-detect-when-activedocument-changed/2681/15

const DOCUMENT_CHANGE_EVENTS = [
  "select",
  "open",
  "close",
  "smartBrushWorkspace",
  "layersFiltered",
];

const activeDocumentExternalStore = {
  subscribe: (fn: () => void) => {
    action.addNotificationListener(DOCUMENT_CHANGE_EVENTS, fn);
    return () => {
      action.removeNotificationListener(DOCUMENT_CHANGE_EVENTS, fn);
    };
  },
  getSnapshot: () => app.activeDocument,
};

export function useActiveDocument() {
  return useSyncExternalStore(
    activeDocumentExternalStore.subscribe,
    activeDocumentExternalStore.getSnapshot
  );
}
