import type { UxpManifest } from '@bubblydoo/vite-uxp-plugin';
import { version } from './package.json';

export const id = 'ea305a81';

export const manifest: UxpManifest = {
  id,
  name: 'Example Layers Plugin',
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
        default: 'Example Layers',
      },
      minimumSize: { width: 230, height: 200 },
      maximumSize: { width: 2000, height: 2000 },
      preferredDockedSize: { width: 230, height: 300 },
      preferredFloatingSize: { width: 450, height: 400 },
      icons: [
        { width: 23, height: 23, path: 'icons/dark.png', scale: [1, 2], theme: ['darkest', 'dark'] },
        { width: 23, height: 23, path: 'icons/light.png', scale: [1, 2], theme: ['lightest', 'light', 'all'] },
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
    { width: 48, height: 48, path: 'icons/plugin-dark.png', scale: [1, 2], theme: ['darkest', 'dark'] },
    { width: 48, height: 48, path: 'icons/plugin-light.png', scale: [1, 2], theme: ['lightest', 'light', 'all'] },
  ],
};
