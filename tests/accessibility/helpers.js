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
  };
}

module.exports = {
  performCheck,
};
