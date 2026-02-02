/**
 * Runtime code that gets injected into the Photoshop UXP context
 * before executing user code. This provides convenient globals
 * matching uxp-toolkit's API.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import * as esbuild from 'esbuild';

const __dirname = new URL('.', import.meta.url).pathname;

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
  console.log('wrapping this code:', userCode);
  try {
    const runtimeCode = await fs.readFile(path.join(__dirname, '../dist-runtime/runtime-code.cjs'), 'utf8');
    const result = await esbuild.build({
      entryPoints: ['main-code'],
      bundle: true,
      format: 'cjs',
      target: 'es2020',
      external: ['uxp', 'photoshop', 'path', 'fs', 'process', 'os', 'shell'],
      define: {
        __dirname: JSON.stringify('/photoshop-mcp'),
        __filename: JSON.stringify('/photoshop-mcp/index.js'),
      },
      write: false,
      plugins: [
        {
          name: 'inline-code',
          setup(build) {
            build.onResolve({ filter: /main-code$/ }, async () => {
              return {
                path: '/main-code.js',
                namespace: 'file',
              };
            });
            build.onLoad({ filter: /main-code\.js$/ }, async () => {
              return {
                // contents: `window.result = require("user-code"); typeof window.result === 'object' && 'default' in window.result ? window.result.default : window.result;`,
                contents: `globalThis.MAIN_EXPORT = require("user-code")`,
                loader: 'js',
              };
            });
            build.onResolve({ filter: /user-code$/ }, async () => {
              return {
                path: '/user-code.js',
                namespace: 'file',
              };
            });
            build.onLoad({ filter: /user-code\.js$/ }, async () => {
              return {
                contents: userCode,
                loader: 'js',
              };
            });
            build.onResolve({ filter: /runtime-code$/ }, async () => {
              return {
                path: '/runtime-code.js',
                namespace: 'file',
              };
            });
            build.onLoad({ filter: /runtime-code\.js$/ }, async () => {
              return {
                contents: runtimeCode,
                loader: 'js',
              };
            });
            build.onResolve({ filter: /@bubblydoo\/uxp-toolkit$/ }, async () => {
              return {
                path: '/@bubblydoo/uxp-toolkit/index.js',
                namespace: 'file',
              };
            });
            build.onLoad({ filter: /@bubblydoo\/uxp-toolkit\/index\.js$/ }, async () => {
              return {
                contents: 'module.exports = require("runtime-code").uxpToolkit;',
                loader: 'js',
              };
            });
            build.onResolve({ filter: /@bubblydoo\/uxp-toolkit\/commands$/ }, async () => {
              return {
                path: '/@bubblydoo/uxp-toolkit/commands/index.js',
                namespace: 'file',
              };
            });
            build.onLoad({ filter: /@bubblydoo\/uxp-toolkit\/commands\/index\.js$/ }, async () => {
              return {
                contents: 'module.exports = require("runtime-code").uxpToolkitCommands;',
                loader: 'js',
              };
            });
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
