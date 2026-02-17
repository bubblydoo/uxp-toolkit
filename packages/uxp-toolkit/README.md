# @bubblydoo/uxp-toolkit

![NPM Version](https://img.shields.io/npm/v/@bubblydoo/uxp-toolkit)

Typed helpers for Adobe Photoshop UXP plugins: safer `batchPlay`, command builders, and utilities around layer/document workflows.

## Install

```bash
pnpm add @bubblydoo/uxp-toolkit
```

Optional type packages:

```bash
pnpm add -D @adobe-uxp-types/uxp @adobe-uxp-types/photoshop
```

## Usage

```ts
import { createCommand, batchPlayCommand } from '@bubblydoo/uxp-toolkit';
import { z } from 'zod';

const result = await batchPlayCommand(createCommand({
  modifying: false,
  descriptor: {
    _obj: 'get',
    _target: [{ _ref: 'layer', _id: 123 }],
  },
  schema: z.object({ name: z.string() }),
}));
```

## Unexpected but useful details

- The package is built around schema-validated command output, so `batchPlay` results become explicit types instead of ad-hoc `any`.
- `@bubblydoo/uxp-toolkit/commands` exposes prebuilt command descriptors for common Photoshop actions.
- Utilities such as layer-tree conversion and sourcemap parsing target practical pain points in large UXP plugins.
