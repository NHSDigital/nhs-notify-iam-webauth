import { getEnvironmentVariable } from '@/utils/get-environment-variable';

test('throws on missing environment variable', () => {
  delete process.env.TEST_VAR;

  expect(() => getEnvironmentVariable('TEST_VAR')).toThrow(
    'Missing environment variable'
  );
});

test('returns environment variable value', () => {
  process.env.TEST_VAR = 'value';

  expect(getEnvironmentVariable('TEST_VAR')).toEqual('value');
});
