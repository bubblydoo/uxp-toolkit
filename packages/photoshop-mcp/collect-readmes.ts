/* eslint-disable antfu/no-top-level-await */
// Copy the root README to dist-readmes for bundling with the MCP server

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rootReadmePath = path.resolve(__dirname, '../../README.md');
const targetDir = path.resolve(__dirname, 'dist-readmes');

await fs.mkdir(targetDir, { recursive: true });

console.log('copying', rootReadmePath, 'to', targetDir);
await fs.copyFile(rootReadmePath, path.resolve(targetDir, 'README.md'));
