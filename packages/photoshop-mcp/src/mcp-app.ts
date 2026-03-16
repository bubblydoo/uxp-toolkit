import type { UxpConnection } from '@bubblydoo/uxp-devtools-common';
import fs from 'node:fs/promises';
import path from 'node:path';
import { StreamableHTTPTransport } from '@hono/mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { glob } from 'glob';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import z from 'zod';
import { executeInPhotoshop, executeToolSchema } from './execute-tool';
import { getServerIcons } from './icons';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(__dirname, '..');

function createMcpServer(connection: UxpConnection) {
  const mcpServer = new McpServer({
    name: 'Photoshop',
    version: '0.0.1',
    icons: getServerIcons(root),
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
      try {
        const result = await executeInPhotoshop(connection, input);

        return {
          isError: !result.success,
          content: [{
            type: 'text',
            text: result.success ? JSON.stringify(result.result, null, 2) : `Error executing code in Photoshop, in ${result.errorStep}:\n${result.error}`,
          }],
        };
      }
      catch (error) {
        console.error('[photoshop-mcp] Error', error);
        return {
          isError: true,
          content: [{
            type: 'text',
            text: `Error executing code in Photoshop: ${error}`,
          }],
        };
      }
    },
  );

  mcpServer.registerTool(
    'read-schema',
    {
      title: 'Read schema',
      description: 'Read the .d.ts schemas for the given packages',
      inputSchema: z.object({
        package: z.enum(['@bubblydoo/uxp-toolkit', '@adobe-uxp-types/photoshop', '@adobe-uxp-types/uxp']),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
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
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (_input) => {
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
  return mcpServer;
}

export function createMcpApp(connection: UxpConnection) {
  const app = new Hono();

  const mcpServer = createMcpServer(connection);

  app.onError((err, c) => {
    console.error('[photoshop-mcp] Error', err);
    return c.json({ error: 'Internal server error' }, 500);
  });

  // Enable CORS
  app.use('*', cors());

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

  // 404 endpoint
  app.get('*', c => c.json({ error: 'Not found' }, 404));

  return app;
}
