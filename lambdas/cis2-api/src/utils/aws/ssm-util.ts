import {
  GetParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({
  region: process.env.REGION,
  retryMode: 'standard',
  maxAttempts: 10,
});

const parameterCache: Record<string, { value: string; cacheTime: number }> = {};
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function getParameter(name = ''): Promise<string> {
  if (!name) {
    throw new Error('Missing parameter name');
  }

  const now = Date.now();
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
  parameterCache[name] = { value, cacheTime: now };
  return value;
}
