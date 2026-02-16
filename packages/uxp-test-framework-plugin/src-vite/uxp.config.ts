import type { UxpManifest, UxpViteConfig } from '@bubblydoo/vite-uxp-plugin';

interface CreateManifestOpts {
  id: string;
  name: string;
  version: string;
  hotReloadPort: number;
}

const createUxpManifest: (opts: CreateManifestOpts) => UxpManifest = ({
  id,
  name,
  version,
  hotReloadPort,
}) => {
  return {
    id,
    name,
    version,
    main: 'index.html',
    manifestVersion: 6,
    host: [
      {
        app: 'PS',
        minVersion: '24.2.0',
      },
    ],
    entrypoints: [
      {
        type: 'panel',
        id: `${id}.main`,
        label: {
          default: name,
        },
        minimumSize: { width: 230, height: 200 },
        maximumSize: { width: 2000, height: 2000 },
        preferredDockedSize: { width: 230, height: 300 },
        preferredFloatingSize: { width: 450, height: 400 },
        icons: [
          {
            width: 23,
            height: 23,
            path: 'icons/dark.png',
            scale: [1, 2],
            theme: ['darkest', 'dark', 'medium'],
          },
          {
            width: 23,
            height: 23,
            path: 'icons/light.png',
            scale: [1, 2],
            theme: ['lightest', 'light'],
          },
        ],
      },
    ],
    featureFlags: {
      enableAlerts: true,
    },
    requiredPermissions: {
      localFileSystem: 'fullAccess',
      launchProcess: {
        schemes: ['https', 'slack', 'file', 'ws'],
        extensions: ['.xd', '.psd', '.bat', '.cmd', ''],
      },
      network: {
        domains: [
          `ws://localhost:${hotReloadPort}`, // Required for hot reload
        ],
      },
      clipboard: 'readAndWrite',
      webview: {
        allow: 'yes',
        allowLocalRendering: 'yes',
        domains: 'all',
        enableMessageBridge: 'localAndRemote',
      },
      ipc: {
        enablePluginCommunication: true,
      },
      allowCodeGenerationFromStrings: true,
    },
    icons: [
      {
        width: 48,
        height: 48,
        path: 'icons/plugin-icon.png',
        scale: [1, 2],
        theme: ['darkest', 'dark', 'medium', 'lightest', 'light', 'all'],
        species: ['pluginList'],
      },
    ],
  };
};

interface CreatedUxpConfig {
  manifest: UxpManifest;
  pluginConfig: UxpViteConfig;
}

export const createUxpConfig: (opts: CreateManifestOpts) => CreatedUxpConfig = ({
  id,
  name,
  version,
  hotReloadPort,
}) => {
  return {
    manifest: createUxpManifest({ id, name, version, hotReloadPort }),
    pluginConfig: {
      hotReloadPort,
    },
  };
};
