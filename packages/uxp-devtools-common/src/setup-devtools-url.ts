/* eslint-disable no-console */
import EventEmitter from 'node:events';
import fs from 'node:fs/promises';
import path from 'node:path';
import AppClient from '@adobe-fixed-uxp/uxp-devtools-core/core/service/clients/AppClient';
import Server from '@adobe-fixed-uxp/uxp-devtools-core/core/service/Server';
import z from 'zod';
import { setGlobalUxpLogger } from './uxp-logger';

Error.stackTraceLimit = Infinity;

setGlobalUxpLogger();

const DEFAULT_PORTS = [14001, 14002, 14003, 14004, 14005, 14006, 14007, 14008, 14009, 14010];

const loadReplySchema = z.object({
  command: z.literal('reply'),
  pluginSessionId: z.string(),
  breakOnStart: z.boolean(),
  requestId: z.number(),
});

const validateReplySchema = z.object({
  command: z.literal('reply'),
  requestId: z.number(),
  success: z.boolean(),
});

const debugReplySchema = z.object({
  command: z.literal('reply'),
  wsdebugUrl: z.string(),
  chromeDevToolsUrl: z.string(),
});

async function fileExists(path: string) {
  try {
    await fs.access(path);
    return true;
  }
  catch {
    return false;
  }
}

interface DevtoolsConnectionEventMap {
  connection: [];
}

export interface DevtoolsConnection {
  /** Debugger websocket URL */
  url: string;
  /** Unload the plugin and tear down the Vulcan connection */
  teardown: () => Promise<void>;

  events: EventEmitter<DevtoolsConnectionEventMap>;
}

export async function setupDevtoolsConnection(pluginPath: string, ports: number[] = DEFAULT_PORTS): Promise<DevtoolsConnection> {
  const { default: DevToolsHelper } = await import('@adobe-fixed-uxp/uxp-devtools-helper');

  if (!path.isAbsolute(pluginPath)) {
    throw new Error('pluginPath must be an absolute path');
  }
  const manifestPath = path.join(pluginPath, 'manifest.json');
  if (!await fileExists(manifestPath)) {
    throw new Error('manifest.json not found');
  }

  const devtoolsManager = new DevToolsHelper(true);
  const appsList = devtoolsManager.getAppsList();

  const isPsOpen = appsList.some(app => app.appId === 'PS');
  if (!isPsOpen) {
    throw new Error('Photoshop is not open');
  }

  const PORT = ports[Math.floor(Math.random() * ports.length)]!;

  const server = new Server(PORT);
  server.run();

  // this goes through Adobe's Vulcan system, which is a binary black box
  devtoolsManager.setServerDetails(PORT);

  console.log('port', PORT);

  await new Promise(resolve => setTimeout(resolve, 1500));

  const psClient = server.clients.values().next().value;

  if (!psClient) {
    throw new Error('No PS client found');
  }

  if (!(psClient instanceof AppClient)) {
    throw new TypeError('PS client is not an AppClient');
  }

  // const discoverReplySchema = z.object({
  //   command: z.literal('reply'),
  //   pluginSessionId: z.string(),
  //   breakOnStart: z.boolean(),
  //   requestId: z.number(),
  // });

  /**
   * Helper to promisify handler_Plugin calls with error handling and schema validation
   */
  function callPluginHandler<T extends z.ZodTypeAny>(
    psClient: AppClient,
    message: Parameters<AppClient['handler_Plugin']>[0],
    schema: T,
  ): Promise<z.infer<T>> {
    return new Promise((resolve, reject) => {
      psClient.handler_Plugin(message, (error: Error | null, response: any) => {
        if (response?.error) {
          reject(new Error(response.error));
          return;
        }
        if (error) {
          reject(error);
          return;
        }
        console.log('response for', message.action, response);
        resolve(schema.parse(response));
      });
    });
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const pluginId = manifest.id;

  const validateResult = await callPluginHandler(
    psClient,
    {
      action: 'validate',
      command: 'Plugin',
      params: {
        provider: {
          type: 'disk',
          id: pluginId,
          path: pluginPath,
        },
      },
      manifest,
    },
    validateReplySchema,
  );

  if (!validateResult.success) {
    throw new Error('Validation failed');
  }

  const { pluginSessionId } = await callPluginHandler(
    psClient,
    {
      action: 'load',
      command: 'Plugin',
      params: {
        provider: {
          type: 'disk',
          id: pluginId,
          path: pluginPath,
        },
      },
      breakOnStart: false,
    },
    loadReplySchema,
  );

  const result = await callPluginHandler(
    psClient,
    {
      action: 'debug',
      command: 'Plugin',
      pluginSessionId,
    },
    debugReplySchema,
  );

  const cdtUrl = result.wsdebugUrl.replace('ws=', 'ws://');

  const connection: DevtoolsConnection = {
    url: cdtUrl,
    teardown: async () => {
      // Unload the plugin from Photoshop
      try {
        await callPluginHandler(
          psClient,
          {
            action: 'unload',
            command: 'Plugin',
            pluginSessionId,
          },
          z.object({
            command: z.literal('reply'),
            requestId: z.number(),
          }),
        );
        console.log('Plugin unloaded');
      }
      catch (error) {
        console.error('Error unloading plugin:', error);
      }

      try {
        await server.close();
      }
      catch (error) {
        console.error('Error closing server:', error);
      }

      // Terminate the DevToolsHelper (Adobe Vulcan native library)
      // This is crucial to prevent hanging handles
      try {
        devtoolsManager.terminate();
        console.log('DevToolsHelper terminated');
      }
      catch (error) {
        console.error('Error terminating DevToolsHelper:', error);
      }
    },
    events: new EventEmitter<DevtoolsConnectionEventMap>(),
  };

  (server as any)._io.on('connection', () => {
    connection.events.emit('connection');
  });

  return connection;
}
