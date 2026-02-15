import type { Plugin } from 'vitest/config';
import dedent from 'dedent';

const nativeModules = [
  'photoshop',
  'uxp',
];

const pluginPrefix = 'photoshop-builtin';

const minimalModules = {
  photoshop: dedent`
export const core = UNIMPLEMENTED;
export const action = UNIMPLEMENTED;
export const app = UNIMPLEMENTED;
  `,
  uxp: dedent`
export const entrypoints = UNIMPLEMENTED;
export const storage = UNIMPLEMENTED;
  `,
};

export function vitestPhotoshopAliasPlugin(): Plugin {
  return {
    name: 'vitest-photoshop-alias',
    resolveId(id) {
      if (nativeModules.includes(id)) {
        return `${id}?${pluginPrefix}`;
      }
    },
    load(id) {
      if (id.endsWith(`?${pluginPrefix}`)) {
        const origModuleId = id.replace(`?${pluginPrefix}`, '');
        const mod = dedent`
        // This is a photoshop builtin module, not available in Vitest. This is an alias to provide minimal compatibility.
        const UNIMPLEMENTED = { __vitest_photoshop_alias_unimplemented__: true };
        ${minimalModules[origModuleId]}
      `;
        return mod;
      }
    },
  };
}
