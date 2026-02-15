#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { StreamableHTTPTransport } from '@hono/mcp';
import { serve } from '@hono/node-server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { glob } from 'glob';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import z from 'zod';
import { disconnectFromPhotoshop, getOrReuseUxpConnection } from './connection';

import { executeInPhotoshop, executeToolSchema } from './execute-tool';

const app = new Hono();

app.onError((err, c) => {
  console.error('[photoshop-mcp] Error', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Enable CORS
app.use('*', cors());

const mcpServer = new McpServer({
  name: 'photoshop-mcp',
  version: '0.0.1',
});

// Register the execute tool
mcpServer.registerTool(
  'execute',
  {
    title: 'Execute UXP JavaScript code in Photoshop',
    description: [
      'Execute JavaScript code in Photoshop UXP via Chrome DevTools Protocol.',
      'This uses CDP.Runtime.evaluate under the hood, and returns the result of the evaluation, including objectId.',
      'Two packages are available: @bubblydoo/uxp-toolkit and @bubblydoo/uxp-toolkit/commands.',
      'Documentation for the packages is available in the "Read schema" tool.',
      '## Code structure',
      'At the end, the value exported with "export default" will be returned. Returned promises will be awaited.',
      'The code has to be esm. It will be built into CJS using esbuild.',
      'The name input is purely descriptive for the UI.',
      'Top-level await is not supported, just return a promise, wrap in functions if needed.',
      '## Other information',
      'DOM functions are quite slow. Prefer using the @bubblydoo/uxp-toolkit package. Use read-docs for that.',
    ].join('\n'),
    inputSchema: executeToolSchema,
  },
  async (input) => {
    const connection = await getOrReuseUxpConnection();

    const result = await executeInPhotoshop(connection, input);

    return {
      isError: !result.success,
      content: [{
        type: 'text',
        text: result.success ? JSON.stringify(result.result, null, 2) : `Error executing code in Photoshop, in ${result.errorStep}:\n${result.error}`,
      }],
    };
  },
);

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(__dirname, '..');

mcpServer.registerTool(
  'read-schema',
  {
    title: 'Read schema',
    description: 'Read the .d.ts schemas for the given packages',
    inputSchema: z.object({
      package: z.enum(['@bubblydoo/uxp-toolkit', '@adobe-uxp-types/photoshop', '@adobe-uxp-types/uxp']),
    }),
  },
  async (input) => {
    const schemasPath = path.resolve(root, 'dist-schemas');
    const pattern = path.resolve(schemasPath, input.package, '**/*.d.ts');
    const allFiles = await glob(pattern);

    const content: { type: 'text'; text: string }[] = [];
    for (const file of allFiles) {
      const relativePath = path.relative(schemasPath, file);
      const text = await fs.readFile(file, 'utf8');
      content.push({
        type: 'text',
        text: [
          `// ${relativePath}`,
          text,
        ].join('\n'),
      });
    }

    return {
      content: [
        ...content,
        {
          type: 'text',
          text: `This were the schemas for ${input.package}, import it like this: \`import { x } from '${input.package}';\``,
        },
      ],
    };
  },
);

mcpServer.registerTool(
  'read-docs',
  {
    title: 'Read docs',
    description: 'Read the docs for both @bubblydoo/uxp-toolkit and @bubblydoo/uxp-toolkit/commands',
  },
  async (input) => {
    const docsPath = path.resolve(__dirname, '../dist-readmes/README.md');
    const text = await fs.readFile(docsPath, 'utf8');
    return {
      content: [{
        type: 'text',
        text,
      }],
    };
  },
);

// Initialize the MCP transport
const transport = new StreamableHTTPTransport();

// MCP endpoint
app.all('/mcp', async (c) => {
  if (!mcpServer.isConnected()) {
    await mcpServer.connect(transport);
  }
  return transport.handleRequest(c);
});

// Health check endpoint
app.get('/health', c => c.json({ status: 'ok' }));

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error('[photoshop-mcp] Shutting down...');
  await disconnectFromPhotoshop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('[photoshop-mcp] Shutting down...');
  await disconnectFromPhotoshop();
  process.exit(0);
});

// Start the server
const port = Number.parseInt(process.env.PORT || '3020', 10);

console.error(`[photoshop-mcp] Starting MCP server on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.error(`[photoshop-mcp] MCP server running at http://localhost:${info.port}/mcp`);
});
