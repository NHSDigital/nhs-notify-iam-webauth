const { performCheck } = require('./helpers');

const baseUrl = 'http://localhost:3000/auth';

module.exports = {
  urls: [
    performCheck({ url: baseUrl, name: 'landing-page' }),
    performCheck({ url: `${baseUrl}/signout`, name: 'signout' }),
    performCheck({ url: `${baseUrl}/oauth2`, name: 'oauth2' }),
    performCheck({ url: `${baseUrl}/inactive`, name: 'inactive' }),
    performCheck({ url: `${baseUrl}/some-404`, name: '404-test' }),
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
    standard: 'WCAG2AAA',
    agent: 'pa11y',
  }
};

