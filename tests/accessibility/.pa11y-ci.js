const { performCheck } = require('./helpers');

const baseUrl = 'http://localhost:3000/auth';

module.exports = {
  urls: [
    performCheck({ url: 'http://localhost:3000/auth/some-404', name: '404-test' }),
  ],
  defaults: {
    reporters: [
      'cli',
      [
        'pa11y-ci-reporter-html',
        {
          destination: './.reports/accessibility',
          includeZeroIssues: true
        }
      ],
    ],
    rules: [
      'Principle1.Guideline1_3.1_3_1_AAA',
    ],
    chromeLaunchConfig: {
      args: ['--no-sandbox']
    },
    standard: 'WCAG2AA',
    agent: 'pa11y',
  }
};

