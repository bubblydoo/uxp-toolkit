# @bubblydoo/vitest-pool-uxp

Vitest pool for running tests inside Adobe UXP environments (Photoshop, etc.).

## Overview

This package provides a custom Vitest pool that executes tests inside Adobe Photoshop via the UXP (Unified Extensibility Platform) runtime. It wraps `@bubblydoo/vitest-pool-cdp` and `@bubblydoo/uxp-devtools-common` to handle the complexity of connecting to Photoshop's debugging interface.

## Installation

```bash
pnpm add -D @bubblydoo/vitest-pool-uxp vitest
```

## Usage

Create a vitest config file (e.g., `vitest.uxp.config.ts`):

```typescript
import { defineConfig } from "vitest/config";
import { uxpPool } from "@bubblydoo/vitest-pool-uxp";

export default defineConfig({
  test: {
    include: ["src/**/*.uxp-test.ts"],
    pool: uxpPool(),
    // Required settings - see "Vulcan System Limitations" below
    isolate: false,
    fileParallelism: false,
    maxWorkers: 1,
    // Recommended settings
    testTimeout: 30000,
    watch: false,
  },
});
```

Run your tests:

```bash
vitest run --config vitest.uxp.config.ts
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pluginPath` | `string` | Built-in plugin | Path to a UXP plugin directory. The plugin will be loaded into Photoshop to establish the debugging connection. |
| `debug` | `boolean` | `false` | Enable debug logging |
| `connectionTimeout` | `number` | `10000` | Timeout in milliseconds for establishing the CDP connection |
| `rpcTimeout` | `number` | `10000` | Timeout in milliseconds for RPC calls |

### Using a Custom Plugin

By default, vitest-pool-uxp uses a built-in "Vitest UXP Test Runner" plugin. You can use your own plugin if needed:

```typescript
pool: uxpPool({
  pluginPath: "./my-uxp-plugin",
  debug: true,
}),
```

## Requirements

- **Photoshop must be running** before starting the tests
- **Adobe Creative Cloud** must be installed (provides the Vulcan communication system)
- Vitest v4 or later

## Vulcan System Limitations

Adobe's Vulcan system is the inter-process communication (IPC) mechanism that allows external tools to communicate with Adobe applications. Understanding its limitations is crucial for reliable test execution.

### Single Connection Per Process

**The Vulcan system only supports a single connection per Node.js process.** Attempting to create multiple connections will cause a native assertion failure:

```
Assertion failed: (vulcan_), function initSelf, file vulcanadapter.cc, line 504.
```

This happens because:
1. The `VulcanAdapter` native module maintains a singleton connection to the Vulcan service
2. When a second instance tries to initialize, it finds the global state already in use
3. The native code asserts and crashes the process

### Required Vitest Configuration

To prevent multiple Vulcan connections, you **must** configure vitest to run tests sequentially with a single worker:

```typescript
{
  test: {
    // Disable VM isolation - prevents vitest from creating
    // separate V8 contexts that don't share module state
    isolate: false,

    // Run test files sequentially, not in parallel
    fileParallelism: false,

    // Use only one worker
    maxWorkers: 1,
  }
}
```

**Why `isolate: false` is critical:**

Without this setting, vitest creates isolated V8 contexts for each test file. Even though they run in the same Node.js process, module-level variables (including singleton state) are not shared between these contexts. This means each context tries to create its own Vulcan connection, causing the crash.

### Technical Details

The Vulcan system works through these components:

1. **VulcanControl.dylib** - Native library that interfaces with Adobe's Vulcan IPC
2. **node-napi.node** - Node.js native addon that wraps VulcanControl
3. **DevToolsHelper** - JavaScript wrapper that manages the connection

When `DevToolsHelper` is instantiated, it creates a `VulcanAdapter` which:
1. Calls `IVulcanMessageDispatcher::GetInstance()` to get the singleton dispatcher
2. Calls `SetConfig()` to configure the endpoint
3. Waits for the dispatcher to become ready (up to 100 retries with 50ms delays)
4. If the dispatcher is still null after setup, the native code asserts

The assertion at line 504 specifically checks that `vulcan_` (the dispatcher instance) is not null after initialization. Multiple concurrent initializations can race and corrupt this state.

### Debugging Connection Issues

If you encounter Vulcan-related errors:

1. **Kill any running Adobe UXP Developer Tools** - they also use Vulcan and can conflict
2. **Ensure Photoshop is running** - the Vulcan connection requires an active Adobe app
3. **Check for zombie processes** - previous test runs may have left Vulcan in a bad state
4. **Use `debug: true`** - enables logging to see connection progress

```typescript
pool: uxpPool({ debug: true })
```

## How It Works

```
┌─────────────────────┐                    ┌─────────────────────┐
│   Vitest (Node.js)  │                    │     Photoshop       │
│                     │                    │                     │
│  ┌───────────────┐  │                    │  ┌───────────────┐  │
│  │ vitest-pool-  │  │                    │  │  UXP Plugin   │  │
│  │     uxp       │  │                    │  │  (injected)   │  │
│  └───────┬───────┘  │                    │  └───────┬───────┘  │
│          │          │                    │          │          │
│  ┌───────▼───────┐  │   Vulcan IPC       │          │          │
│  │   DevTools    │──┼────────────────────┼──────────┘          │
│  │    Helper     │  │                    │                     │
│  └───────┬───────┘  │                    │                     │
│          │          │                    │                     │
│  ┌───────▼───────┐  │   CDP WebSocket    │  ┌───────────────┐  │
│  │ vitest-pool-  │──┼────────────────────┼──│  CDP Server   │  │
│  │     cdp       │  │                    │  └───────────────┘  │
│  └───────────────┘  │                    │                     │
└─────────────────────┘                    └─────────────────────┘
```

1. **Vulcan IPC** - Used to discover Photoshop and load the test plugin
2. **CDP (Chrome DevTools Protocol)** - Used to execute JavaScript in the UXP context
3. **Test execution** - Vitest tests run inside Photoshop's UXP runtime with full access to the Photoshop API

## License

MIT
