import type { Document } from 'adobe:photoshop';
import { action, app } from 'adobe:photoshop';
import { useEventListenerSkippable } from './useEventListenerSkippable';
import { useIsAnyPluginPanelVisible } from './useIsPluginVisible';

export function useOnEvent(
  document: Document,
  events: string[],
  trigger: () => void,
) {
  const isPluginPanelVisible = useIsAnyPluginPanelVisible() ?? true;

  useEventListenerSkippable({
    trigger,
    subscribe: (boundTrigger) => {
      action.addNotificationListener(events, boundTrigger);
      return () => {
        action.removeNotificationListener(events, boundTrigger);
      };
    },
    skip: !isPluginPanelVisible,
    filter: document === app.activeDocument,
  });
}
