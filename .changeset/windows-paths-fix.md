---
"@bubblydoo/photoshop-mcp": patch
"@bubblydoo/vite-uxp-plugin": patch
---

Fix Windows compatibility:

- Replace `new URL(import.meta.url).pathname` with `fileURLToPath` (5 occurrences) — the URL form produces an invalid leading-slash path on Windows (`/C:/Users/...`).
- Use a virtual esbuild namespace for `runtime-wrapper.ts`'s inline modules instead of platform-absolute `file`-namespace paths.
