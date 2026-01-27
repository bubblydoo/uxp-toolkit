import { uxp } from "vite-uxp-plugin";
import { createUxpConfig } from "./uxp.config";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "module";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tsconfigPaths from "vite-tsconfig-paths";
import z from "zod";

const require = createRequire(import.meta.url);
const pkg =
  require.resolve("@bubblydoo/uxp-test-framework-plugin/package.json");
const root = path.dirname(pkg);

const resolvedConfigSchema = z.object({
  plugin: z.object({
    id: z.string(),
    name: z.string(),
  }),
  outDir: z.string().refine((val) => path.isAbsolute(val), "Path must be absolute"),
  testsFile: z.string().refine((val) => path.isAbsolute(val), "Path must be absolute"),
  testFixturesDir: z.string().refine((val) => path.isAbsolute(val), "Path must be absolute").optional(),
  vite: z.object({
    enableTsconfigPathsPlugin: z.boolean().optional().default(false),
    alias: z.record(z.string(), z.string().refine((val) => path.isAbsolute(val), "Path must be absolute")).optional().default({}),
  }).optional().default({ enableTsconfigPathsPlugin: false, alias: {} }),
});

type ResolvedConfig = z.infer<typeof resolvedConfigSchema>;

const nativeModules = ["photoshop", "uxp", "fs", "os", "path", "process", "shell"];

export function createViteConfig(opts: ResolvedConfig, mode: "dev" | "build") {
  resolvedConfigSchema.parse(opts);

  const uxpConfig = createUxpConfig({
    id: opts.plugin.id,
    name: opts.plugin.name + " - UXP Test Framework Plugin",
    version: "0.0.1",
  });

  return defineConfig({
    root,
    define: {
      BOLT_UXP_HOT_RELOAD_PORT: uxpConfig.hotReloadPort,
      BOLT_UXP_MANIFEST_ID: JSON.stringify(uxpConfig.manifest.id),
    },
    plugins: [
      uxp(uxpConfig, mode, { disablePolyfills: true }) as any,
      react(),
      ...(opts.vite.enableTsconfigPathsPlugin ? [tsconfigPaths()] : []),
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
        ...opts.vite.alias,
        TESTS: opts.testsFile,
      },
    },
    build: {
      sourcemap: true,
      outDir: opts.outDir,
      watch: mode === 'dev' ? {} : undefined,
      minify: false,
      emptyOutDir: true,
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
    }
  });
}
