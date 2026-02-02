/* eslint-disable antfu/no-top-level-await */
// find all schemas in @adobe-uxp-types/uxp, @adobe-uxp-types/photoshop, @bubblydoo/uxp-toolkit, @bubblydoo/uxp-toolkit/commands
// and copy them to the schemas folder

import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';

const schemas = [
  '@adobe-uxp-types/uxp',
  '@adobe-uxp-types/photoshop',
  '@bubblydoo/uxp-toolkit',
];

const nodeModulesPath = path.resolve('node_modules');
const __dirname = new URL('.', import.meta.url).pathname;

for (const schema of schemas) {
  const schemaPath = path.resolve(nodeModulesPath, schema);
  const schemaFiles = await glob(`${schemaPath}/**/*.d.ts`);
  const ignoreNestedNodeModules = schemaFiles.filter(file => countAppearances(file, 'node_modules') <= 1);
  for (const file of ignoreNestedNodeModules) {
    const relativePath = path.relative(nodeModulesPath, file);
    const targetDirPath = path.resolve(__dirname, 'dist-schemas', path.dirname(relativePath));
    await fs.mkdir(targetDirPath, { recursive: true });
    console.log('copying', file, 'to', targetDirPath);
    await fs.copyFile(file, path.resolve(targetDirPath, path.basename(file)));
  }
}

function countAppearances(string: string, substring: string) {
  return (string.match(new RegExp(substring, 'g')) || []).length;
}
