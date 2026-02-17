# @bubblydoo/uxp-toolkit-react

![NPM Version](https://img.shields.io/npm/v/@bubblydoo/uxp-toolkit-react)

React hooks for Photoshop UXP plugins. Generic, non–app-specific utilities built on `@bubblydoo/uxp-toolkit`.

## Peer dependencies

- `react` (^18 or ^19)
- `@tanstack/react-query` (^5)
- `@bubblydoo/uxp-toolkit` (workspace)
- `zod` (^4)

## Exports

- **useEventListenerSkippable** – Subscribe to events with optional skip/filter so triggers can be queued or ignored
- **useApplicationInfoQuery** – React Query for Photoshop application info (e.g. panel list)
- **useIsPluginPanelVisible** – Whether the plugin panel is visible (optionally for a given `panelId`)
- **useOnDocumentEdited** – Run a callback when the given document is edited (select, delete, make, set, move, close, show, hide, etc.)
- **useActiveDocument** – Sync external store for the current active document
- **useOnDocumentLayersEdited** – Run a callback when layers change (delete, make, set, move, close)
- **useOnDocumentLayersSelection** – Run a callback when layer selection changes (select, deselect)
- **useOnEvent** – Run a callback for arbitrary Photoshop action events on a given document
- **useOpenDocuments** – Sync external store for the list of open documents

All document/event hooks that take a `document` only fire when that document is the active document and (where applicable) when the plugin panel is visible.
