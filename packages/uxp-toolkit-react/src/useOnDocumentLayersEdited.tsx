import { action, app } from "photoshop";
import { Document } from "photoshop/dom/Document";
import { useEventListenerSkippable } from "./useEventListenerSkippable";
import { useIsAnyPluginPanelVisible } from "./useIsPluginVisible";

const EVENTS = [
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

export function useOnDocumentLayersEdited(
  document: Document,
  trigger: () => void
) {
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
