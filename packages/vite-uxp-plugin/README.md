# @bubblydoo/vite-uxp-plugin

Vite plugin for Adobe UXP Photoshop projects.

## What it does

- emits `manifest.json` into build output
- forces output directory to `dist/`
- externalizes UXP/Photoshop native modules (`photoshop`, `uxp`, `fs`, `os`, `path`, `process`, `shell`)
- outputs CommonJS bundle format (required by UXP)
- rewrites `<script type="module"...>` to `<script...>` in `index.html`
- provides `@bubblydoo/vite-uxp-plugin/runtime` virtual runtime:
  - in development mode (`--mode development`), enables websocket hot reload
  - in production mode, resolves to an empty runtime module
- in development mode, adds `ws://localhost:<port>` to `manifest.requiredPermissions.network.domains`

## Important runtime model

`vite serve` is intentionally not supported for UXP projects.

Use:

- development/watch: `vite build --watch --mode development`
- production build: `vite build`

## Install

```bash
pnpm add -D @bubblydoo/vite-uxp-plugin vite
```

## Usage

`vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { uxp } from '@bubblydoo/vite-uxp-plugin';
import { manifest } from './uxp.config';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    uxp(manifest),
  ],
});
```

Plugin entry file (for hot reload runtime):

```ts
import '@bubblydoo/vite-uxp-plugin/runtime';
```

## API

### `uxp(manifest, config?)`

- `manifest`: `UxpManifest`
- `config.hotReloadPort?`: number (default: `8081`)

### Exports

- `uxp`
- `PHOTOSHOP_NATIVE_MODULES`
- `UxpManifest`
- `UxpViteConfig`
