import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,

  timeout: 10_000,

  projects: [
    {
      name: 'component',
      testMatch: '*.component.ts',
      use: {
        screenshot: 'only-on-failure',
        baseURL: 'http://localhost:3000',
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
    {
      name: 'e2e-local',
      testMatch: '*.e2e.spec.ts',
      use: {
        baseURL: 'http://localhost:3000',
        ...devices['Desktop Chrome'],
      },
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run build && npm run start',
    cwd: path.resolve(__dirname, '../../..'),
    url: 'http://localhost:3000/auth',
    reuseExistingServer: !process.env.CI,
    stderr: 'pipe',
  },
});
