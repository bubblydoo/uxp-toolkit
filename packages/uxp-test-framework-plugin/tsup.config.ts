import { defineConfig } from "tsup";

export default defineConfig({
  entry: ['create-vite-config.ts'],
  format: "esm",
  target: "node20",
  dts: true,
  external: ["vite", "vite-uxp-plugin", "@vitejs/plugin-react", "autoprefixer", "vite-tsconfig-paths"],
  clean: true,
  outDir: "dist",
})
