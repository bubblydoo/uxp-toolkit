# @bubblydoo/vitest-pool-cdp

Custom Vitest pool that runs tests in CDP-connected environments (browsers, Photoshop UXP, Electron, etc.).

## Overview

This package provides a custom Vitest v4+ pool that executes tests in any environment that supports the Chrome DevTools Protocol (CDP). This enables running Vitest tests inside:

- Browsers (Chrome, Edge, etc.)
- Adobe Photoshop UXP plugins
- Electron applications
- Any other CDP-enabled runtime

## Installation

```bash
pnpm add -D @bubblydoo/vitest-pool-cdp vitest
```

## Usage

### Basic Usage

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import { cdpPool } from "@bubblydoo/vitest-pool-cdp";

export default defineConfig({
  test: {
    pool: cdpPool({
      cdpUrl: "ws://localhost:9222/devtools/page/ABC123",
    }),
  },
});
```

### Dynamic URL (e.g., Photoshop UXP)

For environments where the CDP URL is determined at runtime:

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import { cdpPool } from "@bubblydoo/vitest-pool-cdp";
import { setupDevtoolsUrl } from "@bubblydoo/uxp-cli-common";

const pluginPath = "./my-uxp-plugin";
const pluginId = "com.example.myplugin";

export default defineConfig({
  test: {
    pool: cdpPool({
      cdpUrl: () => setupDevtoolsUrl(pluginPath, pluginId),
      debug: true,
    }),
  },
});
```

### With Execution Context Filter

If the CDP target has multiple execution contexts, you can filter to select a specific one:

```typescript
export default defineConfig({
  test: {
    pool: cdpPool({
      cdpUrl: "ws://localhost:9222/devtools/page/ABC123",
      contextFilter: (context) => context.origin.includes("my-app"),
    }),
  },
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cdpUrl` | `string \| () => Promise<string>` | *required* | WebSocket URL for CDP connection, or async function returning one |
| `contextFilter` | `(context: ExecutionContextDescription) => boolean` | `undefined` | Filter function to select a specific execution context |
| `debug` | `boolean` | `false` | Enable debug logging |
| `connectionTimeout` | `number` | `30000` | Timeout in milliseconds for establishing the CDP connection |

## How It Works

```
┌─────────────────────┐                    ┌─────────────────────┐
│   Vitest (Node.js)  │                    │   CDP Target        │
│                     │                    │   (Browser/UXP/etc) │
├─────────────────────┤                    ├─────────────────────┤
│   CdpPoolWorker     │                    │   Worker Runtime    │
│                     │                    │   (injected)        │
│   ┌─────────────┐   │   CDP WebSocket    │   ┌─────────────┐   │
│   │ send()      │───┼──Runtime.evaluate──┼──►│ receive()   │   │
│   └─────────────┘   │                    │   └─────────────┘   │
│                     │                    │                     │
│   ┌─────────────┐   │  consoleAPICalled  │   ┌─────────────┐   │
│   │ on('msg')   │◄──┼────────────────────┼───│ post()      │   │
│   └─────────────┘   │                    │   └─────────────┘   │
└─────────────────────┘                    └─────────────────────┘
```

1. **Pool to Worker**: Messages are sent via `Runtime.evaluate()` calling a global function
2. **Worker to Pool**: Responses are sent via `console.debug()` with a special prefix, captured by `Runtime.consoleAPICalled` events
3. **Serialization**: Uses `devalue` for structured cloneable data (same as Vitest internally)

## Requirements

- Vitest v4 or later
- A CDP-enabled target environment
- The target environment must support:
  - `console.debug()` for sending messages
  - Global function assignment for receiving messages

## Limitations

- Tests run in a single CDP execution context (no parallel test isolation within the same context)
- The target environment must have a JavaScript runtime that supports ES2022+
- Some Vitest features that rely on Node.js-specific APIs may not work in all CDP environments

## License

MIT
