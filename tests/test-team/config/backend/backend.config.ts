import path from 'node:path';
import { defineConfig } from '@playwright/test';
import baseConfig from '../playwright.config';

export default defineConfig({
  ...baseConfig,

  timeout: 20_000,
  retries: 0,
  workers: 1,
  projects: [
    {
      name: 'backend:setup',
      testMatch: 'backend.setup.ts',
      retries: 0,
    },
    {
      name: 'backend',
      testMatch: '*.backend.spec.ts',
      dependencies: ['backend:setup'],
      retries: 0,
    },
  ],
  reporter: [
    [
      'html',
      {
        outputFolder: path.resolve(
          // eslint-disable-next-line unicorn/prefer-module
          __dirname,
          '../../playwright-report-backend-tests'
        ),
      },
    ],
  ],
});
