#!/usr/bin/env node
/* eslint-disable antfu/no-top-level-await */
/* eslint-disable no-console */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupDevtoolsConnection } from '@bubblydoo/uxp-devtools-common';
import arg from 'arg';
import { openDevtoolsSessionInChrome } from './open-devtools-session';

Error.stackTraceLimit = Infinity;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function showHelp() {
  console.log(`
Usage: uxp-cli <action> [options]

Actions:
  open-devtools    Open Chrome DevTools for a UXP plugin
  create-cdp-url   Print the CDP devtools URL without opening Chrome

Options:
  --plugin-path, -p <path>    Path to the UXP plugin directory
  --help, -h                  Show this help message

Examples:
  # Open devtools with empty CDP connector plugin
  uxp-cli open-devtools

  # Open devtools with custom plugin
  uxp-cli open-devtools --plugin-path ./my-plugin

  # Print the CDP URL
  uxp-cli create-cdp-url
  uxp-cli create-cdp-url --plugin-path ./my-plugin
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

if (!['open-devtools', 'create-cdp-url'].includes(action)) {
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

async function getPluginInfo(useCdpConnectorPlugin: boolean) {
  const cdpConnectorPluginPath = path.resolve(__dirname, '../../uxp-devtools-common/cdp-connector-plugin');

  if (useCdpConnectorPlugin) {
    console.log('Using CDP connector plugin:');
    console.log(`  Plugin Path: ${cdpConnectorPluginPath}`);
    return { pluginPath: cdpConnectorPluginPath };
  }

  let pluginPath = actionArgs['--plugin-path'];

  // Default to cdp-connector-plugin if not provided
  if (!pluginPath) {
    pluginPath = pluginPath || cdpConnectorPluginPath;

    console.log('Using default CDP connector plugin:');
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
  const devtoolsConnection = await setupDevtoolsConnection(pluginPath);
  console.log(`DevTools URL: ${devtoolsConnection.url}\n`);

  await openDevtoolsSessionInChrome(devtoolsConnection.url);
  console.log('Chrome DevTools opened');

  console.log('\nPress Ctrl+C to exit...');
  await new Promise(() => {});
}

async function createCdpUrl() {
  const { pluginPath } = await getPluginInfo(false);

  console.log('\nSetting up devtools URL...');
  const devtoolsConnection = await setupDevtoolsConnection(pluginPath);
  console.log(`DevTools URL: ${devtoolsConnection.url}`);

  console.log('\nPress Ctrl+C to exit...');
  await new Promise(() => {});
}

// Handle actions
if (action === 'open-devtools') {
  await openDevtools();
}
else if (action === 'create-cdp-url') {
  await createCdpUrl();
}

process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, exiting...');
  process.exit(0);
});
