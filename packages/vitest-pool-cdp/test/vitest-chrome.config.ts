import { defineConfig } from 'vitest/config';
import { cdpPool } from '../src';
import { startChromium } from './start-chromium';

const startChromiumPromise = startChromium();

export default defineConfig({
  test: {
    include: ['./**/*.chrome-test.ts'],
    pool: cdpPool({
      cdpUrl: async () => await startChromiumPromise,
      debug: true,
    }),
  },
});
