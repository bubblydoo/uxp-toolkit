import type { UxpManifest } from '@bubblydoo/vite-uxp-plugin';
import { version } from './package.json';

export const id = 'co.bubblydoo.example-layers-plugin';
const name = 'Example Layers Plugin';

export const manifest: UxpManifest = {
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
      domains: 'all',
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
