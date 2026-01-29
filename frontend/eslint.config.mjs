import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import nextPlugin from '@next/eslint-plugin-next';
import rootConfig from '../eslint.config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  ...rootConfig,

  // Override tsconfigRootDir for frontend workspace
  {
    ignores: ['**/*.json'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  },

  // Next.js specific plugin and rules
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // Disable this rule as we use App Router, not Pages Router
      '@next/next/no-html-link-for-pages': 0,
    },
  },
];
