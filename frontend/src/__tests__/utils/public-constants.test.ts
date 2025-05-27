import { getConstants } from '@/src/utils/public-constants';

interface TestCase {
  name: string;
  env: string;
  defaultValue: string;
}

const testCases: TestCase[] = [
  { name: 'BASE_PATH', env: 'NEXT_PUBLIC_BASE_PATH', defaultValue: '/auth' },
  { name: 'USER_POOL_ID', env: 'NEXT_PUBLIC_USER_POOL_ID', defaultValue: '' },
  {
    name: 'USER_POOL_CLIENT_ID',
    env: 'NEXT_PUBLIC_USER_POOL_CLIENT_ID',
    defaultValue: '',
  },
  {
    name: 'COGNITO_DOMAIN',
    env: 'NEXT_PUBLIC_COGNITO_DOMAIN',
    defaultValue: '',
  },
  {
    name: 'REDIRECT_DOMAIN',
    env: 'NEXT_PUBLIC_REDIRECT_DOMAIN',
    defaultValue: '',
  },
  {
    name: 'CIS2_PROVIDER_NAME',
    env: 'NEXT_PUBLIC_CIS2_PROVIDER_NAME',
    defaultValue: '',
  },
];

describe('public-constants', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = originalEnv;
  });

  test.each(testCases)('should define %p', (testCase: TestCase) => {
    delete process.env[testCase.env];

    const defaultResult = getConstants()[testCase.name];
    const testValue = `testing-${testCase.name}`;
    process.env[testCase.env] = testValue;

    const result = getConstants()[testCase.name];

    expect(defaultResult).toBe(testCase.defaultValue);
    expect(result).toBe(testValue);
  });
});
