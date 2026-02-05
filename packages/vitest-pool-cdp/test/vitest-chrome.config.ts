import { defineConfig } from 'vitest/config';
import { cdpPool } from '../src';
import { startChromium } from './start-chromium';

export default defineConfig({
  test: {
    include: ['./**/*.chrome-test.ts'],
    pool: cdpPool({
      cdp: () => startChromium(),
      debug: true,
    }),
  },
});
