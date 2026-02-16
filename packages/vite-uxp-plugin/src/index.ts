import type { Plugin, UserConfig } from 'vite';
import type { HotReloadServer } from './hot-reload-server';
import type { UxpManifest } from './manifest-type';
import * as fs from 'fs';
import * as path from 'path';
import { createHotReloadServer } from './hot-reload-server';

export type { UxpManifest } from './manifest-type';

const __dirname = new URL('.', import.meta.url).pathname;

export interface UxpViteConfig {
  hotReloadPort?: number;
}

export const PHOTOSHOP_NATIVE_MODULES = [
  'photoshop',
  'uxp',
  'fs',
  'os',
  'path',
  'process',
  'shell',
] as const;

export type PhotoshopNativeModule = typeof PHOTOSHOP_NATIVE_MODULES[number];

const nativeModuleRegexes = PHOTOSHOP_NATIVE_MODULES.map(module => new RegExp(`^${module}\\b`));

type External = NonNullable<NonNullable<UserConfig['build']>['rollupOptions']>['external'];

function mergeExternal(
  existing: External,
  extras: RegExp[],
): External {
  if (!existing) {
    return extras;
  }

  if (typeof existing === 'function') {
    return (source: string, importer: string | undefined, isResolved: boolean) => {
      if (extras.some(regex => regex.test(source))) {
        return true;
      }
      return existing(source, importer, isResolved);
    };
  }

  if (Array.isArray(existing)) {
    return [...existing, ...extras];
  }

  return [existing, ...extras];
}

const VIRTUAL_RUNTIME_ID = 'virtual:vite-uxp-plugin-runtime';

/**
 * Vite UXP Plugin
 *
 * - Adds the UXP native modules as external, so they are not bundled
 * - Emits the manifest.json into build output
 * - Replaces the <script type="module"> tags with <script> tags in index.html
 * - Sets output format to CommonJS
 * - Sets up the /runtime virtual module
 * - In dev mode: starts a hot reload server and adds the websocket permission to the manifest
 */
export function uxp(manifest: UxpManifest, config?: UxpViteConfig): Plugin {
  const {
    hotReloadPort = 8081,
  } = config ?? {};

  let configState: {
    hotReloadServer: HotReloadServer;
    isDevMode: true;
  } | {
    hotReloadServer: null;
    isDevMode: false;
  } | null = null;

  return {
    name: '@bubblydoo/vite-uxp-plugin',
    enforce: 'pre',
    config(userConfig, env) {
      if (env.command === 'serve') {
        throw new Error('The Uxp Vite Plugin cannot be used in serve/dev mode. Use `vite build --watch --mode development` instead.');
      }

      const existingExclude = userConfig.optimizeDeps?.exclude ?? [];
      const build = userConfig.build ?? {};
      const rollupOptions = build.rollupOptions ?? {};

      const isDevMode = env.mode === 'development';
      configState = isDevMode
        ? {
            hotReloadServer: createHotReloadServer(hotReloadPort),
            isDevMode: true,
          }
        : { hotReloadServer: null, isDevMode: false };

      return {
        optimizeDeps: {
          exclude: [...existingExclude, ...PHOTOSHOP_NATIVE_MODULES],
        },
        build: {
          outDir: 'dist',
          rollupOptions: {
            ...rollupOptions,
            external: mergeExternal(rollupOptions.external, nativeModuleRegexes),
            output: rollupOptions.output ?? { format: 'cjs' },
            plugins: rollupOptions.plugins,
          },
        },
      };
    },
    resolveId(id) {
      if (id === '@bubblydoo/vite-uxp-plugin/runtime') {
        return VIRTUAL_RUNTIME_ID;
      }
      return null;
    },
    async load(id) {
      if (id === VIRTUAL_RUNTIME_ID) {
        if (configState!.isDevMode) {
          const runtimeCode = await fs.promises.readFile(path.join(__dirname, '../dist/runtime.cjs'), 'utf8');
          return `var UXP_HOT_RELOAD_PORT = ${hotReloadPort}; ${runtimeCode}`;
        }
        return `module.exports = {}; // UXP Vite Plugin Runtime is empty in production`;
      }
      return null;
    },
    transformIndexHtml(html) {
      // UXP does not support ES Modules
      return html.replace('<script type="module" crossorigin', '<script');
    },
    generateBundle(this) {
      const emittedManifest = configState!.isDevMode ? addHotReloadToPermissions(manifest, hotReloadPort) : manifest;
      this.emitFile({
        type: 'asset',
        source: JSON.stringify(emittedManifest, null, '\t'),
        name: 'UXP Manifest',
        fileName: 'manifest.json',
      });
    },
    writeBundle(this) {
      if (configState!.isDevMode) {
        configState!.hotReloadServer!.triggerReload(manifest.id);
      }
    },
  };
}

function addHotReloadToPermissions(manifest: UxpManifest, hotReloadPort: number): UxpManifest {
  return {
    ...manifest,
    requiredPermissions: {
      ...manifest.requiredPermissions,
      network: {
        ...manifest.requiredPermissions?.network,
        domains: manifest.requiredPermissions?.network?.domains === 'all' ? 'all' : [...(manifest.requiredPermissions?.network?.domains ?? []), `ws://localhost:${hotReloadPort}`],
      },
    },
  };
}
