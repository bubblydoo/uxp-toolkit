# @bubblydoo/photoshop-mcp

![NPM Version](https://img.shields.io/npm/v/@bubblydoo/photoshop-mcp)

MCP (Model Context Protocol) server for Photoshop automation via Chrome DevTools Protocol.

This allows AI assistants to execute JavaScript code directly in Adobe Photoshop's UXP environment.

## How it works

1. The MCP server connects to Photoshop via the Chrome DevTools Protocol (CDP)
2. User code is bundled with esbuild (ESM → CJS) along with the `@bubblydoo/uxp-toolkit` runtime
3. The bundled code is evaluated in Photoshop's UXP execution context
4. Results are returned via CDP, with promise awaiting support

## Installation

```bash
pnpm add @bubblydoo/photoshop-mcp
```

## Usage

### Start the server

```bash
# Using the CLI
pnpm photoshop-mcp

# Or with a custom port
PORT=3020 pnpm photoshop-mcp

# Or run directly
node dist/index.js
```

The server starts at `http://localhost:3020/mcp` by default.

### Test with MCP Inspector

```bash
pnpx @modelcontextprotocol/inspector --transport http --server-url http://localhost:3020/mcp
```

### Configure with Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "photoshop": {
      "url": "http://localhost:3020/mcp"
    }
  }
}
```

## Available Tools

### `execute`

Execute JavaScript code in Photoshop's UXP context.

**Input:**
- `name` (string): Descriptive name for the operation (shown in UI)
- `code` (string): ESM JavaScript code to execute

**Features:**
- Code is bundled with esbuild before execution
- `@bubblydoo/uxp-toolkit` and `@bubblydoo/uxp-toolkit/commands` are available as imports
- Use `export default` to return values
- Returned promises are automatically awaited
- Top-level await is not supported (return a promise instead)

**Example:**
```javascript
import { app } from '@bubblydoo/uxp-toolkit';

export default app.activeDocument?.name ?? 'No document open';
```

### `read-schema`

Read the TypeScript type definitions for the toolkit packages.

**Input:**
- `package` (enum): Either `@bubblydoo/uxp-toolkit` or `@bubblydoo/uxp-toolkit/commands`

### `read-docs`

Read the documentation for the toolkit packages.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3020` | HTTP server port |
| `PHOTOSHOP_MCP_PLUGIN_PATH` | (internal fake-plugin) | Path to UXP plugin directory |
| `PHOTOSHOP_MCP_PLUGIN_ID` | `com.example.fakeplugin` | Plugin ID from manifest.json |

## Endpoints

- `POST /mcp` - MCP protocol endpoint (Streamable HTTP transport)
- `GET /mcp` - MCP protocol endpoint (for SSE connections)
- `GET /health` - Health check (returns `{ "status": "ok" }`)

## Requirements

- Adobe Photoshop with UXP support
- Photoshop must have Developer Mode enabled
- The UXP Developer Tools must be accessible

## Architecture

```
┌─────────────────┐     HTTP/MCP      ┌──────────────────┐
│   AI Assistant  │ ◄───────────────► │  photoshop-mcp   │
│  (Cursor, etc)  │                   │   (Hono server)  │
└─────────────────┘                   └────────┬─────────┘
                                               │ CDP
                                               ▼
                                      ┌──────────────────┐
                                      │    Photoshop     │
                                      │  (UXP Runtime)   │
                                      └──────────────────┘
```

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Start server
pnpm start
```
