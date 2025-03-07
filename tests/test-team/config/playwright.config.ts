import path from 'node:path';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: path.resolve(__dirname, '../'),
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 4 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['line'],
    [
      'html',
      {
        outputFolder: path.resolve(__dirname, '../playwright-report'),
        open: process.env.CI ? 'never' : 'on-failure',
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  globalSetup: path.resolve(__dirname, 'global.setup.ts'),
});
