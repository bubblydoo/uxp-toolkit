import { uxp } from "vite-uxp-plugin";
import { createUxpConfig } from "./uxp.config";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "module";
import { viteStaticCopy } from "vite-plugin-static-copy";
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
    alias: z.record(z.string(), z.string().refine((val) => path.isAbsolute(val), "Path must be absolute")).optional().default({}),
  }).optional().default({ alias: {} }),
});

type ResolvedConfig = z.infer<typeof resolvedConfigSchema>;

const nativeModules = ["photoshop", "uxp", "fs", "os", "path", "process", "shell"];

export function createViteConfig(opts: ResolvedConfig, mode: "dev" | "build") {
  resolvedConfigSchema.parse(opts);

  const adjustedConfig = createUxpConfig({
    id: opts.plugin.id,
    name: opts.plugin.name + " - UXP Test Framework Plugin",
    version: "0.0.1",
  });
  return defineConfig({
    root,
    plugins: [
      uxp(adjustedConfig, mode === "dev" ? "dev" : "build") as any,
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
        ...opts.vite.alias,
        TESTS: opts.testsFile,
      },
    },
    build: {
      sourcemap: true,
      outDir: opts.outDir,
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
