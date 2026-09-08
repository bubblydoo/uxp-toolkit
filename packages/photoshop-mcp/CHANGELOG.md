# @bubblydoo/photoshop-mcp

## 0.0.13

### Patch Changes

- Updated dependencies [9232a23]
  - @bubblydoo/uxp-devtools-common@0.0.12

## 0.0.12

### Patch Changes

- 65f293e: Fix Windows compatibility:

  - Replace `new URL(import.meta.url).pathname` with `fileURLToPath` (5 occurrences) — the URL form produces an invalid leading-slash path on Windows (`/C:/Users/...`).
  - Use a virtual esbuild namespace for `runtime-wrapper.ts`'s inline modules instead of platform-absolute `file`-namespace paths.

## 0.0.11

### Patch Changes

- 6d2312d: Change package metadata
- Updated dependencies [6d2312d]
  - @bubblydoo/esbuild-adobe-protocol-plugin@0.0.3
  - @bubblydoo/uxp-devtools-common@0.0.11

## 0.0.10

### Patch Changes

- 92a2f01: Improve mcp, cdp sessions
- Updated dependencies [92a2f01]
  - @bubblydoo/uxp-devtools-common@0.0.10

## 0.0.9

### Patch Changes

- f034514: Add devtoolsConnection to uxp connection
- Updated dependencies [f034514]
  - @bubblydoo/uxp-devtools-common@0.0.9

## 0.0.8

### Patch Changes

- 7de7d7a: Add adobe protocol
- Updated dependencies [7de7d7a]
  - @bubblydoo/esbuild-adobe-protocol-plugin@0.0.2
  - @bubblydoo/uxp-devtools-common@0.0.8

## 0.0.7

### Patch Changes

- a5ba336: Add snapshot support to vitest pool, add uxp connection to devtools common
- Updated dependencies [a5ba336]
  - @bubblydoo/uxp-devtools-common@0.0.7

## 0.0.6

### Patch Changes

- Updated dependencies [c378b02]
  - @bubblydoo/uxp-devtools-common@0.0.6

## 0.0.5

### Patch Changes

- Updated dependencies [9dd7d73]
- Updated dependencies [e5911d6]
  - @bubblydoo/uxp-devtools-common@0.0.5

## 0.0.4

### Patch Changes

- Updated dependencies [4f6d7f6]
  - @bubblydoo/uxp-devtools-common@0.0.4

## 0.0.3

### Patch Changes

- 7370ae5: Get Vitest pool to work
- Updated dependencies [7370ae5]
  - @bubblydoo/uxp-devtools-common@0.0.3

## 0.0.2

### Patch Changes

- 8e43414: Add Photoshop mcp server
