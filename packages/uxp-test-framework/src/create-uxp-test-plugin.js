#!/usr/bin/env node

import { build } from 'vite'
import { createViteConfig } from '@bubblydoo/uxp-test-framework-plugin/create-vite-config';
import arg from 'arg';
import path from 'path';

const args = arg({
  '--id': String,
  '--name': String,
  '--tests': String,
  '--fixtures': String,
  '--out': String,
  '--at-alias': String,
});

if (!args['--id']) {
  console.error('--id is required');
  process.exit(1);
}
if (!args['--name']) {
  console.error('--name is required');
  process.exit(1);
}
if (!args['--tests']) {
  console.error('--tests is required');
  process.exit(1);
}

const testsFile = path.resolve(process.cwd(), args['--tests']);
const testFixturesDir = path.resolve(process.cwd(), args['--fixtures']);
const atAliasDir = path.resolve(process.cwd(), args['--at-alias']);

await build(
  createViteConfig({
    id: args['--id'],
    name: args['--name'],
    testsFile,
    testFixturesDir,
    atAlias: atAliasDir,
    outDir: path.resolve(process.cwd(), args['--out'] || 'uxp-tests-plugin'),
  }),
);
// await server.build();

// server.printUrls()
// server.bindCLIShortcuts({ print: true })