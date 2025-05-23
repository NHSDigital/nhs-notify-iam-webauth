/* eslint-disable no-underscore-dangle */
import jest from 'eslint-plugin-jest';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import * as eslintImportResolverTypescript from 'eslint-import-resolver-typescript';
import react from 'eslint-plugin-react';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import json from 'eslint-plugin-json';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import html from 'eslint-plugin-html';
import tseslint from 'typescript-eslint';
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys';
// import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import {
  configs as airbnbConfigs,
  plugins as airbnbPlugins,
} from 'eslint-config-airbnb-extended';
import { rules as prettierConfigRules } from 'eslint-config-prettier';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig([
  globalIgnores(['**/*/coverage/*', '**/.build', '**/node_modules', '**/dist']),

  // js
  js.configs.recommended,
  airbnbPlugins.stylistic,
  airbnbPlugins.importX,
  airbnbConfigs.base.recommended,

  // ts
  // tseslint.configs.recommendedTypeChecked,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,

  // {
  //   languageOptions: {
  //     parserOptions: {
  //       projectService: true,
  //       tsconfigRootDir: import.meta.dirname,
  //     },
  //   },
  // },

  // {
  //   files: ['**/*.ts', '**/*.tsx'],
  //   extends: [tseslint.configs.recommendedTypeChecked],
  //   languageOptions: {
  //     parserOptions: {
  //       projectService: true,
  //       tsconfigRootDir: import.meta.dirname,
  //     },
  //   },
  // },

  {
    settings: {
      'import-x/resolver': {
        name: 'tsResolver',
        resolver: eslintImportResolverTypescript,
      },
    },
  },

  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        2,
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  airbnbConfigs.base.typescript,
  airbnbPlugins.typescriptEslint,

  // unicorn
  unicorn.configs['recommended'],
  {
    rules: {
      'unicorn/prevent-abbreviations': 0,
      'unicorn/filename-case': [
        2,
        {
          case: 'kebabCase',
          ignore: ['.tsx'],
        },
      ],
      'unicorn/no-null': 0,
    },
  },

  // react
  react.configs.flat.recommended,
  airbnbConfigs.react.recommended,
  airbnbConfigs.react.typescript,
  airbnbPlugins.react,
  airbnbPlugins.reactHooks,
  airbnbPlugins.reactA11y,

  // jest
  jest.configs['flat/recommended'],

  // prettier
  prettierRecommended,
  { rules: { ...prettierConfigRules, 'prettier/prettier': 2 } },

  // jsxA11y
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // security
  security.configs.recommended,

  // sonar
  sonarjs.configs.recommended,

  // html
  {
    files: ['**/*.html'],
    plugins: { html },
  },

  // Next.js
  ...compat.config({
    extends: ['next', 'next/core-web-vitals', 'next/typescript'],
    settings: {
      next: {
        rootDir: 'frontend',
      },
    },
    rules: {
      // needed because next lint rules look for a pages directory
      '@next/next/no-html-link-for-pages': 0,
    },
  }),

  // json
  {
    files: ['**/*.json'],
    ...json.configs['recommended'],
  },

  // destructure sorting
  {
    name: 'eslint-plugin-sort-destructure-keys',
    plugins: {
      'sort-destructure-keys': sortDestructureKeys,
    },
    rules: {
      'sort-destructure-keys/sort-destructure-keys': 2,
    },
  },

  {
    rules: {
      'sort-imports': [
        2,
        {
          ignoreDeclarationSort: true,
        },
      ],
    },
  },
]);
