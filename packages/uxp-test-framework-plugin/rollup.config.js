import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import { builtinModules } from "node:module";

const external = [...builtinModules, "vite", "typescript", "chokidar", "tailwindcss"];

/** @type {import('rollup').RollupOptions} */
export default {
  input: "src-vite/cli.ts",
  output: {
    dir: "dist-vite",
    format: "esm",
    sourcemap: true,
  },
  external(id) {
    return external.includes(id) || id.startsWith("node:");
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    typescript({
      tsconfig: "tsconfig.json",
      compilerOptions: {
        outDir: "dist-vite",
      },
    }),
    json(),
  ],
};
