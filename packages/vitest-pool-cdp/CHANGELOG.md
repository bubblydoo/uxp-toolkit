# @bubblydoo/vitest-pool-cdp

## 0.0.9

### Patch Changes

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

- db4cf94: Add ui bridge to vitest pool
- 29972e4: Add a hotkey to open devtools

## 0.0.6

### Patch Changes

- a5ba336: Add snapshot support to vitest pool, add uxp connection to devtools common
- Updated dependencies [a5ba336]
  - @bubblydoo/uxp-devtools-common@0.0.7

## 0.0.5

### Patch Changes

- Updated dependencies [c378b02]
  - @bubblydoo/uxp-devtools-common@0.0.6

## 0.0.4

### Patch Changes

- 9dd7d73: Improve stacktraces and add uxp inspect option
- e5911d6: Better inspect output, fix Vitest watch mode
- Updated dependencies [9dd7d73]
- Updated dependencies [e5911d6]
  - @bubblydoo/uxp-devtools-common@0.0.5

## 0.0.3

### Patch Changes

- 4f6d7f6: Vitest improvements
- Updated dependencies [4f6d7f6]
  - @bubblydoo/uxp-devtools-common@0.0.4

## 0.0.2

### Patch Changes

- 7370ae5: Get Vitest pool to work
- Updated dependencies [7370ae5]
  - @bubblydoo/uxp-devtools-common@0.0.3

## 0.0.1

### Initial Release

- Custom Vitest v4+ pool for CDP-connected environments
- Support for browsers, Photoshop UXP, Electron, and other CDP-enabled runtimes
- Bidirectional message passing via Runtime.evaluate and consoleAPICalled
- RPC protocol for communication between pool and worker
- Configurable CDP WebSocket URL (static or dynamic)
- Optional execution context filtering
- Debug logging support
