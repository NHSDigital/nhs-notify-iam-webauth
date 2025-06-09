/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */
import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const config: Config = {
  preset: 'ts-jest',

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: './.reports/unit/coverage',

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: -10,
    },
  },

  collectCoverageFrom: ['src/**/*.ts*'],

  // Set the absolute path for imports
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),

  // Use this configuration option to add custom reporters to Jest
  reporters: [
    'default',
    [
      '../../node_modules/jest-html-reporter',
      {
        pageTitle: 'Test Report',
        outputPath: './.reports/unit/test-report.html',
        includeFailureMsg: true,
      },
    ],
  ],

  // The test environment that will be used for testing
  testEnvironment: 'node',

  testPathIgnorePatterns: ['/node_modules/', '/tests/'],

  // Set the path for imports
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/$1',
  },
};

export default config;
