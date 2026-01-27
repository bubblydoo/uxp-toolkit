import { defineConfig } from "vite";
import { uxp } from "vite-uxp-plugin";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

import { config } from "./uxp.config";

const mode = process.env.MODE;

const shouldNotEmptyDir =
  mode === "dev" && config.manifest.requiredPermissions?.enableAddon;

const nativeModules = [
  "photoshop",
  "uxp",
  "fs",
  "os",
  "path",
  "process",
  "shell",
];

export default defineConfig({
  plugins: [uxp(config, mode, { disablePolyfills: true }), react(), tsconfigPaths()],
  build: {
    sourcemap: mode && ["dev", "build"].includes(mode) ? true : false,
    minify: false,
    emptyOutDir: !shouldNotEmptyDir,
    rollupOptions: {
      external: nativeModules.map((module) => new RegExp(`^${module}\\b`)),
      output: {
        format: "cjs",
      },
    },
  },
  publicDir: "public",
  optimizeDeps: {
    exclude: nativeModules,
  },
});
