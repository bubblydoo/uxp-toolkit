import { defineConfig } from 'vitest/config';
import { vitestPhotoshopAliasPlugin } from './vitest-photoshop-alias-plugin';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: {
      junit: './test-results/junit.xml',
    },
    typecheck: {
      enabled: true,
      include: ['src/**/*.test-d.ts'],
    },
  },
  plugins: [vitestPhotoshopAliasPlugin()],
});
