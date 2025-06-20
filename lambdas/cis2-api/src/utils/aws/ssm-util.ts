import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({
  region: process.env.REGION,
  retryMode: 'standard',
  maxAttempts: 10,
});

const parameterCache: Record<string, { value: string; cacheTime: number }> = {};
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function getParameter(name = ''): Promise<string> {
  if (!name) {
    throw new Error('Missing parameter name');
  }

  const now = Date.now();
  // eslint-disable-next-line security/detect-object-injection
  const cachedValue = parameterCache[name];
  if (cachedValue && now - cachedValue.cacheTime < CACHE_DURATION_MS) {
    return cachedValue.value;
  }

  const response = await ssmClient.send(
    new GetParameterCommand({
      Name: name,
    })
  );
  const value = response.Parameter?.Value ?? '';
  // eslint-disable-next-line security/detect-object-injection
  parameterCache[name] = { value, cacheTime: now };
  return value;
}
