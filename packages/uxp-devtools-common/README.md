# @bubblydoo/uxp-devtools-common

![NPM Version](https://img.shields.io/npm/v/@bubblydoo/uxp-devtools-common)

Shared connection utilities for talking to Photoshop's UXP runtime via Adobe DevTools + CDP.

## Install

```bash
pnpm add @bubblydoo/uxp-devtools-common
```

## Usage

```ts
import { setupDevtoolsConnection } from '@bubblydoo/uxp-devtools-common';

const connection = await setupDevtoolsConnection('/absolute/path/to/plugin');
console.log(connection.url); // ws://... CDP URL
```

## Unexpected but useful details

- Uses patched Adobe devtools packages (`@adobe-fixed-uxp/*`) and wraps the Vulcan handshake needed to load/debug a plugin.
- Returns a teardown function that unloads the plugin and terminates the native DevTools helper, which prevents hanging processes.
- Ships with a `fake-plugin` folder used by tools that need a valid UXP target even when you do not have a plugin project ready.
