import { defineConfig } from '@playwright/test';
import baseConfig from '../playwright.config';

export default defineConfig({
  ...baseConfig,

  timeout: 10_000,
  workers: 1,
  projects: [
    {
      name: 'backend:setup',
      testMatch: 'backend.setup.ts',
    },
    {
      name: 'backend',
      testMatch: '*.backend.spec.ts',
      dependencies: ['backend:setup'],
    },
  ],
});
