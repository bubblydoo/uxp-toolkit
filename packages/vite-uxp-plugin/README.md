# @bubblydoo/vite-uxp-plugin

![NPM Version](https://img.shields.io/npm/v/@bubblydoo/vite-uxp-plugin)

Vite plugin for Adobe UXP Photoshop projects.

## What it does

- emits `manifest.json` into build output
- forces output directory to `dist/`
- externalizes UXP/Photoshop native modules (`photoshop`, `uxp`, `fs`, `os`, `path`, `process`, `shell`)
- outputs CommonJS bundle format (required by UXP)
- rewrites `<script type="module"...>` to `<script...>` in `index.html`
- strips `adobe:` protocol from module specifiers in final JS output, so you can use `adobe:photoshop` instead of `photoshop` in your source code (similar to how `node:` protocol works)
- provides `@bubblydoo/vite-uxp-plugin/runtime` virtual runtime:
  - in development mode (`--mode development`), enables websocket hot reload
  - in production mode, resolves to an empty runtime module
- in development mode, adds `ws://localhost:<port>` to `manifest.requiredPermissions.network.domains`

## Important runtime model

`vite serve` or `vite dev` and HMR are not supported for UXP projects.

There are a couple of reasons:
- We need to output the files to a folder, not serve them over HTTP
- UXP projects do not support ES modules (`<script type="module">` does not work), and Vite HMR relies on ES modules.
- `@vite/plugin-legacy` could work, but it does not support dev mode.

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

Native module imports can use either form in source code:

```ts
import { app } from 'photoshop'; // => const { app } = require('photoshop');
import { app as app2 } from 'adobe:photoshop'; // => const { app: app2 } = require('photoshop');
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
