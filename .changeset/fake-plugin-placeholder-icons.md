---
"@bubblydoo/uxp-devtools-common": patch
---

Add the three icon files the bundled `fake-plugin` manifest references.

`fake-plugin/manifest.json` declares `icons/dark.png`, `icons/light.png` (panel
entrypoint, 23x23) and `icons/plugin-icon.png` (plugin list, 48x48), but none of them
are in the published package -- only `manifest.json` and `index.html` ship. On Photoshop
27.9.1 / 27.10 on Windows this makes Photoshop refuse to load the plugin at all
(`Devtools: Failed to load the devtools plugin.`), which blocks the first
`photoshop-mcp` connection when `PHOTOSHOP_MCP_PLUGIN_PATH` is unset.

These are minimal placeholder PNGs at the manifest's declared dimensions -- happy to
swap in real branded icons if you'd prefer.
