#!/usr/bin/env node

import { build, createServer } from 'vite'
import { createViteConfig } from '@bubblydoo/uxp-test-framework-plugin/create-vite-config';
import arg from 'arg';
import path from 'path';
import z from 'zod';
import fs from 'fs';

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

const args = arg({
  '--config': String,
  '-c': '--config',
});

if (!args['--config']) {
  console.error('--config is required');
  process.exit(1);
}

const configFile = path.resolve(process.cwd(), args['--config']);
const configString = fs.readFileSync(configFile, 'utf8');
const config = configSchema.parse(JSON.parse(configString));

const configDirName = path.dirname(configFile);

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

const viteConfig = createViteConfig(resolvedConfig);

console.log(viteConfig);

const server = await createServer(viteConfig);

await build(viteConfig);

await server.listen();

server.bindCLIShortcuts({ print: true });