#!/usr/bin/env node

import { build, createServer } from 'vite'
import { createViteConfig } from '@bubblydoo/uxp-test-framework-plugin/create-vite-config';
import arg from 'arg';
import path from 'path';
import z from 'zod';
import fs from 'fs/promises';

const configSchema = z.object({
  testsFile: z.string(),
  testFixturesDir: z.string().optional(),
  outDir: z.string().optional().default('uxp-tests-plugin'),
  plugin: z.object({
    id: z.string(),
    name: z.string(),
  }),
  vite: z.object({
    alias: z.record(z.string(), z.string()).optional().default({}),
  }).optional().default({}),
});

const actionSchema = z.enum(['build', 'dev']);

const args = arg({
  '--config': String,
  '-c': '--config',
});

const action = actionSchema.parse(args._[0]);

const configFileName = args['--config'] || 'uxp-tests.json';
const configFilePath = path.resolve(process.cwd(), configFileName);

if (!await fileExists(configFilePath)) {
  console.error(`Config file ${configFilePath} does not exist`);
  process.exit(1);
}

const configString = await fs.readFile(configFilePath, 'utf8');
const config = configSchema.parse(JSON.parse(configString));
const configDirName = path.dirname(configFilePath);

const resolvedConfig = {
  outDir: path.resolve(configDirName, config.outDir),
  testsFile: path.resolve(configDirName, config.testsFile),
  testFixturesDir: config.testFixturesDir ? path.resolve(configDirName, config.testFixturesDir) : undefined,
  plugin: {
    id: config.plugin.id,
    name: config.plugin.name,
  },
  vite: {
    alias: Object.fromEntries(Object.entries(config.vite.alias).map(([key, value]) => [key, path.resolve(configDirName, value)])),
  },
}

const viteConfig = createViteConfig(resolvedConfig, action);

await build(viteConfig);

async function fileExists(path) {
  try {
    await fs.stat(path);
    return true;
  } catch {
    return false;
  }
}