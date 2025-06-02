export const getEnvironmentVariable = (name: string) => {
  // eslint-disable-next-line security/detect-object-injection
  const secret = process.env[name];

  if (!secret) {
    throw new Error('Missing environment variable');
  }

  return secret;
};
