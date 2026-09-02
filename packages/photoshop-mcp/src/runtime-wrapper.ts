/**
 * Runtime code that gets injected into the Photoshop UXP context
 * before executing user code. This provides convenient globals
 * matching uxp-toolkit's API.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripAdobeProtocolPlugin } from '@bubblydoo/esbuild-adobe-protocol-plugin';
import * as esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SPECIAL_EXPORT_STRING = 'globalThis.MAIN_EXPORT = ';

/**
 * Wraps user code with the runtime, creating an async IIFE
 * that returns the result of the user's code.
 */
export async function wrapCodeWithRuntime(userCode: string): Promise<{
  success: true;
  result: string;
} | {
  success: false;
  error: string;
}> {
  try {
    const runtimeCode = await fs.readFile(path.join(__dirname, '../dist-runtime/runtime-code.cjs'), 'utf8');
    const result = await esbuild.build({
      entryPoints: ['main-code'],
      bundle: true,
      format: 'cjs',
      target: 'es2020',
      external: ['uxp', 'photoshop', 'path', 'fs', 'process', 'os'],
      define: {
        __dirname: JSON.stringify('/photoshop-mcp'),
        __filename: JSON.stringify('/photoshop-mcp/index.js'),
      },
      write: false,
      plugins: [
        stripAdobeProtocolPlugin(),
        {
          name: 'inline-code',
          setup(build) {
            const NS = 'virtual';

            build.onResolve({ filter: /main-code$/ }, () => ({
              path: 'main-code.js',
              namespace: NS,
            }));
            build.onLoad({ filter: /main-code\.js$/, namespace: NS }, () => ({
              contents: `${SPECIAL_EXPORT_STRING}require("user-code")`,
              loader: 'js',
            }));
            build.onResolve({ filter: /user-code$/ }, () => ({
              path: 'user-code.js',
              namespace: NS,
            }));
            build.onLoad({ filter: /user-code\.js$/, namespace: NS }, () => ({
              contents: userCode,
              loader: 'js',
            }));
            build.onResolve({ filter: /runtime-code$/ }, () => ({
              path: 'runtime-code.js',
              namespace: NS,
            }));
            build.onLoad({ filter: /runtime-code\.js$/, namespace: NS }, () => ({
              contents: runtimeCode,
              loader: 'js',
            }));
            build.onResolve({ filter: /@bubblydoo\/uxp-toolkit$/ }, () => ({
              path: '@bubblydoo/uxp-toolkit/index.js',
              namespace: NS,
            }));
            build.onLoad({ filter: /uxp-toolkit\/index\.js$/, namespace: NS }, () => ({
              contents: 'module.exports = require("runtime-code").uxpToolkit;',
              loader: 'js',
            }));
            build.onResolve({ filter: /@bubblydoo\/uxp-toolkit\/commands$/ }, () => ({
              path: '@bubblydoo/uxp-toolkit/commands/index.js',
              namespace: NS,
            }));
            build.onLoad({ filter: /uxp-toolkit\/commands\/index\.js$/, namespace: NS }, () => ({
              contents: 'module.exports = require("runtime-code").uxpToolkitCommands;',
              loader: 'js',
            }));
          },
        },
      ],
    });

    const code = result.outputFiles![0].text;
    let codeWithoutSpecialExport = code.replace(SPECIAL_EXPORT_STRING, 'var MAIN_EXPORT = ');
    codeWithoutSpecialExport += '\ntypeof MAIN_EXPORT === \'object\' && \'default\' in MAIN_EXPORT ? MAIN_EXPORT.default : MAIN_EXPORT;';
    return {
      success: true,
      result: codeWithoutSpecialExport,
    };
  }
  catch (error) {
    console.error('Error wrapping code with runtime', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
