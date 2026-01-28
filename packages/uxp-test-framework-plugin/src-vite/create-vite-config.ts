import { uxp } from "vite-uxp-plugin";
import { createUxpConfig } from "../uxp.config";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tsconfigPaths from "vite-tsconfig-paths";
import z from "zod";
import { fileURLToPath } from "node:url";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const uxpBuiltinModules = [
  "photoshop",
  "uxp",
  "fs",
  "os",
  "path",
  "process",
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const resolvedConfigSchema = z.object({
  plugin: z.object({
    id: z.string(),
    name: z.string(),
  }),
  outDir: z
    .string()
    .refine((val) => path.isAbsolute(val), "Path must be absolute"),
  testsFile: z
    .string()
    .refine((val) => path.isAbsolute(val), "Path must be absolute"),
  testFixturesDir: z
    .string()
    .refine((val) => path.isAbsolute(val), "Path must be absolute")
    .optional(),
  vite: z
    .object({
      hotReloadPort: z.number(),
      enableTsconfigPathsPlugin: z.boolean(),
      alias: z
        .record(
          z.string(),
          z
            .string()
            .refine((val) => path.isAbsolute(val), "Path must be absolute"),
        )
    })
});

type ResolvedConfig = z.infer<typeof resolvedConfigSchema>;

export function createViteConfig(config: ResolvedConfig, mode: "dev" | "build") {
  resolvedConfigSchema.parse(config);

  console.log({ config });

  const uxpConfig = createUxpConfig({
    id: config.plugin.id,
    name: config.plugin.name + " - UXP Test Framework Plugin",
    version: "0.0.1",
    hotReloadPort: config.vite.hotReloadPort,
  });

  return defineConfig({
    root,
    define: {
      BOLT_UXP_HOT_RELOAD_PORT: uxpConfig.hotReloadPort,
    },
    plugins: [
      uxp(uxpConfig, mode, { disablePolyfills: true }) as any,
      react(),
      ...(config.vite.enableTsconfigPathsPlugin ? [tsconfigPaths()] : []),
      // copy the test fixtures to the dist directory
      ...(config.testFixturesDir
        ? [
            viteStaticCopy({
              targets: [
                {
                  src: config.testFixturesDir,
                  dest: ".",
                },
              ],
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        ...config.vite.alias,
        TESTS: config.testsFile,
      },
    },
    css: {
      postcss: {
        plugins: [
          tailwindcss({
            config: {
              content: [
                root + "/src-plugin/index.html",
                root + "/src-plugin/**/*.{js,ts,jsx,tsx}",
              ],
              theme: {
                extend: {},
              },
              plugins: [],
            },
          }),
          autoprefixer(),
        ],
      },
    },
    build: {
      sourcemap: true,
      outDir: config.outDir,
      watch: mode === "dev" ? {} : undefined,
      minify: false,
      emptyOutDir: true,
      rollupOptions: {
        external: uxpBuiltinModules.map((module) => new RegExp(`^${module}\\b`)),
        output: {
          format: "cjs",
        },
      },
    },
    publicDir: "public",
    optimizeDeps: {
      exclude: uxpBuiltinModules,
    },
  });
}
