# @bubblydoo/esbuild-adobe-protocol-plugin

Tiny reusable esbuild plugin that strips the `adobe:` protocol from module specifiers and marks them as external.

Example:

- `adobe:photoshop` -> `photoshop`
- `adobe:uxp` -> `uxp`

## Install

```bash
pnpm add -D @bubblydoo/esbuild-adobe-protocol-plugin
```

## Usage

```ts
import { stripAdobeProtocolPlugin } from '@bubblydoo/esbuild-adobe-protocol-plugin';

// esbuild
plugins: [
  stripAdobeProtocolPlugin(),
];

// tsup
esbuildPlugins: [
  stripAdobeProtocolPlugin(),
];
```
