function performCheck(options) {
  const defaultOptions = {
    ...options,
  };

  if (!defaultOptions.name) {
    throw new Error('options.name is required');
  }

  if (!defaultOptions.url) {
    throw new Error('options.url is required');
  }

  return {
    ...defaultOptions,
    url: `${defaultOptions.url}?pageName=${defaultOptions.name}`,
    screenCapture: `./.reports/accessibility/${defaultOptions.name}.png`,
    ignore: [
      'WCAG2AA.Principle1.Guideline1_4.1_4_3.G145.Fail', // Ignore colour contrast from CIS2 button
      'WCAG2AA.Principle1.Guideline1_3.1_3_1.H71.NoLegend' // Fieldset missing a legend - relates to Amplify login form
    ]
  };
}

module.exports = {
  performCheck,
};
