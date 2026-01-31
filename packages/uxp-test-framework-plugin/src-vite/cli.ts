import fs from 'node:fs/promises';
import path from 'node:path';
import arg from 'arg';
import { build } from 'vite';
import z from 'zod';
import { createViteConfig } from './create-vite-config';

const configSchema = z.object({
  testsFile: z.string(),
  testFixturesDir: z.string().optional(),
  outDir: z.string().optional().default('uxp-tests-plugin'),
  plugin: z.object({
    id: z.string(),
    name: z.string(),
  }),
  vite: z
    .object({
      hotReloadPort: z.number().optional().default(8080),
      enableTsconfigPathsPlugin: z.boolean().optional().default(false),
      alias: z.record(z.string(), z.string()).optional().default({}),
    })
    .optional()
    .default({
      hotReloadPort: 8080,
      enableTsconfigPathsPlugin: false,
      alias: {},
    }),
});

const actionSchema = z.enum(['build', 'dev']);

export async function runCli(processArgv: string[], cwd: string) {
  const args = arg(
    {
      '--config': String,
      '-c': '--config',
    },
    {
      argv: processArgv,
    },
  );

  const action = actionSchema.parse(args._[0]);

  const configFileName = args['--config'] || 'uxp-tests.json';
  const configFilePath = path.resolve(cwd, configFileName);

  if (!(await fileExists(configFilePath))) {
    console.error(`Config file ${configFilePath} does not exist`);

    process.exit(1);
  }

  const configString = await fs.readFile(configFilePath, 'utf8');
  const config = configSchema.parse(JSON.parse(configString));
  const configDirName = path.dirname(configFilePath);

  const resolvedConfig = {
    outDir: path.resolve(configDirName, config.outDir),
    testsFile: path.resolve(configDirName, config.testsFile),
    testFixturesDir: config.testFixturesDir
      ? path.resolve(configDirName, config.testFixturesDir)
      : undefined,
    plugin: {
      id: config.plugin.id,
      name: config.plugin.name,
    },
    vite: {
      hotReloadPort: config.vite.hotReloadPort,
      enableTsconfigPathsPlugin: config.vite.enableTsconfigPathsPlugin,
      alias: Object.fromEntries(
        Object.entries(config.vite.alias).map(([key, value]) => [
          key,
          path.resolve(configDirName, value),
        ]),
      ),
    },
  };

  const viteConfig = createViteConfig(resolvedConfig, action);

  console.log(resolvedConfig);

  await build(viteConfig);
}

async function fileExists(path: string) {
  try {
    await fs.stat(path);
    return true;
  }
  catch {
    return false;
  }
}
