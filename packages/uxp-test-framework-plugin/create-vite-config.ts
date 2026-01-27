import { uxp } from "vite-uxp-plugin";
import { config } from "./uxp.config";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "module";
import { viteStaticCopy } from "vite-plugin-static-copy";

const require = createRequire(import.meta.url);
const pkg =
  require.resolve("@bubblydoo/uxp-test-framework-plugin/package.json");
const root = path.dirname(pkg);

const mode = "dev";

export function createViteConfig(opts: {
  id: string;
  name: string;
  outDir?: string;
  testsFile: string;
  testFixturesDir?: string;
  atAlias?: string;
}) {
  const adjustedManifest = {
    ...config.manifest,
    id: opts.id,
    name: opts.name + " - UXP Test Framework Plugin",
  };
  const adjustedConfig = {
    ...config,
    manifest: adjustedManifest,
  };
  return defineConfig({
    root,
    plugins: [
      uxp(adjustedConfig, mode) as any,
      react(),
      // copy the test fixtures to the dist directory
      ...(opts.testFixturesDir
        ? [
            viteStaticCopy({
              targets: [
                {
                  src: opts.testFixturesDir,
                  dest: ".",
                },
              ],
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        TESTS: opts.testsFile,
        ...(opts.atAlias ? { "@": opts.atAlias } : {}),
      },
    },
    build: {
      sourcemap: true,
      outDir: opts.outDir,
      minify: false,
      emptyOutDir: true,
      rollupOptions: {
        external: [/^photoshop\b/, /^uxp\b/, /^fs\b/, /^os\b/, /^path\b/, /^process\b/, /^shell\b/],
        output: {
          format: "cjs",
        },
      },
    },
    publicDir: "public",
  });
}
