#!/usr/bin/env node
/* eslint-disable antfu/no-top-level-await */
import { serve } from '@hono/node-server';
import { onExit } from 'signal-exit';
import { globalDisconnectFromPhotoshop, globalGetOrReuseUxpConnection } from './connection';
import { createMcpApp } from './mcp-app';

const connection = await globalGetOrReuseUxpConnection();
const app = createMcpApp(connection);

// Handle graceful shutdown for signal and process exits.
onExit(() => {
  console.error('[photoshop-mcp] Shutting down...');
  globalDisconnectFromPhotoshop().catch((error: unknown) => {
    console.error('[photoshop-mcp] Error during disconnect:', error);
  });
});

// Start the server
const port = Number.parseInt(process.env.PORT || '3020');

console.error(`[photoshop-mcp] Starting MCP server on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.error(`[photoshop-mcp] MCP server running at http://localhost:${info.port}/mcp`);
});
