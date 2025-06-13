import path from 'node:path';
import { defineConfig } from '@playwright/test';
import baseConfig from '@config/playwright.config';

export default defineConfig({
  ...baseConfig,

  timeout: 20_000,
  retries: 0,
  workers: 1,
  projects: [
    {
      name: 'backend',
      testMatch: '*.backend.spec.ts',
      retries: 0,
    },
  ],
  reporter: [
    [
      'html',
      {
        outputFolder: path.resolve(
          __dirname,
          '../../playwright-report-backend-tests'
        ),
      },
    ],
  ],
});
