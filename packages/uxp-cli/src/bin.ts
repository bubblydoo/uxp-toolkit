#!/usr/bin/env node
/* eslint-disable antfu/no-top-level-await */
/* eslint-disable no-console */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupCdpSession, setupCdpSessionWithUxpDefaults, setupDevtoolsUrl, waitForExecutionContextCreated } from '@bubblydoo/uxp-devtools-common';
import arg from 'arg';
import { openDevtoolsSessionInChrome } from './open-devtools-session';

Error.stackTraceLimit = Infinity;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function showHelp() {
  console.log(`
Usage: uxp-cli <action> [options]

Actions:
  open-devtools    Open Chrome DevTools for a UXP plugin
  dump-object      Dump object properties to dump.json (always uses fake plugin)

Options:
  --plugin-path, -p <path>    Path to the UXP plugin directory
  --help, -h                  Show this help message

Examples:
  # Open devtools with fake plugin
  uxp-cli open-devtools

  # Open devtools with custom plugin
  uxp-cli open-devtools --plugin-path ./my-plugin

  # Dump object properties (always uses fake plugin)
  uxp-cli dump-object
`);
}

// Parse action
const args = arg({
  '--help': Boolean,
  '-h': '--help',
}, {
  permissive: true,
});

if (args['--help'] || args._.length === 0) {
  showHelp();
  process.exit(args['--help'] ? 0 : 1);
}

const action = args._[0];

if (!['open-devtools', 'dump-object'].includes(action)) {
  console.error(`Error: Unknown action "${action}"\n`);
  showHelp();
  process.exit(1);
}

// Parse action-specific options
const actionArgs = arg({
  '--plugin-path': String,
  '--help': Boolean,
  '-p': '--plugin-path',
  '-h': '--help',
}, {
  argv: args._.slice(1),
});

if (actionArgs['--help']) {
  showHelp();
  process.exit(0);
}

async function getPluginInfo(useFakePlugin: boolean) {
  const fakePluginPath = path.resolve(__dirname, '../../uxp-devtools-common/fake-plugin');

  if (useFakePlugin) {
    console.log('Using fake plugin:');
    console.log(`  Plugin Path: ${fakePluginPath}`);
    return { pluginPath: fakePluginPath };
  }

  let pluginPath = actionArgs['--plugin-path'];

  // Default to fake-plugin if not provided
  if (!pluginPath) {
    pluginPath = pluginPath || fakePluginPath;

    console.log('Using default fake plugin:');
    console.log(`  Plugin Path: ${pluginPath}`);
  }

  // Ensure plugin path is absolute
  if (!path.isAbsolute(pluginPath)) {
    pluginPath = path.resolve(process.cwd(), pluginPath);
  }

  // Verify plugin directory exists
  try {
    await fs.access(pluginPath);
  }
  catch {
    console.error(`Error: Plugin directory not found: ${pluginPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(await fs.readFile(path.resolve(pluginPath, 'manifest.json'), 'utf8'));

  return { pluginPath, pluginId: manifest.id };
}

async function openDevtools() {
  const { pluginPath } = await getPluginInfo(false);

  console.log('\nSetting up devtools URL...');
  const cdtUrl = await setupDevtoolsUrl(pluginPath);
  console.log(`DevTools URL: ${cdtUrl}\n`);

  await openDevtoolsSessionInChrome(cdtUrl);
  console.log('Chrome DevTools opened');

  console.log('\nPress Ctrl+C to exit...');
  await new Promise(() => {});
}

async function dumpObject() {
  const { pluginPath } = await getPluginInfo(true);

  console.log('\nSetting up devtools URL...');
  const cdtUrl = await setupDevtoolsUrl(pluginPath);
  console.log(`DevTools URL: ${cdtUrl}\n`);

  console.log('Setting up CDP session...');
  const cdp = await setupCdpSession(cdtUrl);

  const executionContextCreatedPromise = waitForExecutionContextCreated(cdp);

  await setupCdpSessionWithUxpDefaults(cdp);

  console.log('Waiting for execution context...');
  const executionContext = await executionContextCreatedPromise;

  console.log('Evaluating expression...');
  const result = await cdp.Runtime.evaluate({
    expression: `
      (() => {
        const app = require("photoshop").app;
        const activeDocumentGetter = Object.getOwnPropertyDescriptor(Reflect.getPrototypeOf(app), "activeDocument").get;
        return activeDocumentGetter;
      })();
    `,
    uniqueContextId: executionContext.uniqueId,
  });

  console.log('Getting properties...');
  const properties = await cdp.Runtime.getProperties({
    objectId: result.result.objectId!,
    accessorPropertiesOnly: false,
    generatePreview: false,
    nonIndexedPropertiesOnly: false,
    ownProperties: false,
  });

  const _functionLocation = properties.internalProperties?.find((property: any) => property.name === '[[FunctionLocation]]')?.value;
  const scopes = properties.internalProperties?.find((property: any) => property.name === '[[Scopes]]')?.value;

  const scopesProperties = await cdp.Runtime.getProperties({
    objectId: scopes!.objectId!,
    ownProperties: true,
  });

  const allScopesResolved = await Promise.all(
    scopesProperties.result.map((property: any) => cdp.Runtime.getProperties({
      objectId: property.value!.objectId!,
      ownProperties: true,
    })),
  );

  const dump = {
    subject: result.result,
    properties,
    scopes: allScopesResolved,
  };

  const dumpPath = path.resolve(process.cwd(), 'dump.json');
  await fs.writeFile(dumpPath, JSON.stringify(dump, null, 2));
  console.log(`\nDump written to: ${dumpPath}`);
}

// Handle actions
if (action === 'open-devtools') {
  await openDevtools();
}
else if (action === 'dump-object') {
  await dumpObject();
}

process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, exiting...');
  process.exit(0);
});
