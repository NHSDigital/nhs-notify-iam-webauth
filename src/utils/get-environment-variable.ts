export const getEnvironmentVariable = (name: string) => {
  const secret = process.env[name];

  if (!secret) {
    throw new Error('Missing environment variable');
  }

  return secret;
};
