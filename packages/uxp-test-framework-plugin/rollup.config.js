import { builtinModules } from 'node:module';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const external = [...builtinModules, 'vite', 'typescript', 'chokidar', 'tailwindcss'];

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src-vite/cli.ts',
  output: {
    dir: 'dist-vite',
    format: 'esm',
    sourcemap: true,
  },
  external(id) {
    return external.includes(id) || id.startsWith('node:');
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    typescript({
      tsconfig: 'tsconfig.json',
      compilerOptions: {
        outDir: 'dist-vite',
      },
    }),
    json(),
  ],
};
