/**
 * @jest-environment node
 */
import { mockDeep } from 'jest-mock-extended';
import { cookies } from 'next/headers';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import {
  generateSessionCsrfToken,
  verifyCsrfToken,
  verifyFormCsrfToken,
} from '@/utils/csrf-utils';
import { getSessionId } from '@/utils/amplify-utils';

const mockHmac = {
  update: jest.fn().mockReturnThis(),
  digest: jest.fn(() => 'hmac'),
};

jest.mock('next/headers');
jest.mock('node:crypto', () => ({
  createHmac: () => mockHmac,
  randomBytes: () => 'salt',
}));
jest.mock('@/utils/amplify-utils');
jest.mock('@nhs-notify-iam-webauth/utils-logger');

const OLD_ENV = { ...process.env };

beforeAll(() => {
  process.env.CSRF_SECRET = 'secret';
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  process.env = OLD_ENV;
});

test('generateSessionCsrfToken', async () => {
  const sessionId = 'session-id';
  const csrf = await generateSessionCsrfToken(sessionId);
  expect(mockHmac.update).toHaveBeenNthCalledWith(1, sessionId);
  expect(mockHmac.update).toHaveBeenNthCalledWith(2, 'salt');
  expect(csrf).toEqual('hmac.salt');
});

describe('verifyCsrfToken', () => {
  test('valid CSRF token', async () => {
    const csrfVerification = await verifyCsrfToken(
      'hmac.salt',
      'secret',
      'salt'
    );

    expect(csrfVerification).toEqual(true);
  });

  test('invalid CSRF token', async () => {
    const csrfVerification = await verifyCsrfToken(
      'hmac2.salt',
      'secret',
      'salt'
    );

    expect(csrfVerification).toEqual(false);
  });
});

describe('verifyFormCsrfToken', () => {
  test('missing session id', async () => {
    const formData = mockDeep<FormData>();

    await expect(verifyFormCsrfToken(formData)).resolves.toBe(false);
  });

  test('missing CSRF cookie', async () => {
    const formData = mockDeep<FormData>();

    jest.mocked(getSessionId).mockResolvedValueOnce('session-id');

    jest.mocked(cookies).mockResolvedValueOnce(
      mockDeep<ReadonlyRequestCookies>({
        get: (_: string): undefined => {},
      })
    );

    await expect(verifyFormCsrfToken(formData)).resolves.toBe(false);
  });

  test('missing CSRF form field', async () => {
    const formData = mockDeep<FormData>({
      get: () => null,
    });

    jest.mocked(getSessionId).mockResolvedValueOnce('session-id');
    jest.mocked(cookies).mockResolvedValueOnce(
      mockDeep<ReadonlyRequestCookies>({
        get: (_: string) => ({
          name: 'csrf_token',
          value: 'hmac.salt',
        }),
      })
    );

    await expect(verifyFormCsrfToken(formData)).resolves.toBe(false);
  });

  test('CSRF mismatch', async () => {
    const formData = mockDeep<FormData>({
      get: () => 'hmac2.salt',
    });

    jest.mocked(getSessionId).mockResolvedValueOnce('session-id');
    jest.mocked(cookies).mockResolvedValueOnce(
      mockDeep<ReadonlyRequestCookies>({
        get: (_: string) => ({
          name: 'csrf_token',
          value: 'hmac.salt',
        }),
      })
    );

    await expect(verifyFormCsrfToken(formData)).resolves.toBe(false);
  });

  test('invalid CSRF form field', async () => {
    const formData = mockDeep<FormData>({
      get: () => 'hmac2.salt',
    });

    jest.mocked(getSessionId).mockResolvedValueOnce('session-id');
    jest.mocked(cookies).mockResolvedValueOnce(
      mockDeep<ReadonlyRequestCookies>({
        get: (_: string) => ({
          name: 'csrf_token',
          value: 'hmac2.salt',
        }),
      })
    );

    await expect(verifyFormCsrfToken(formData)).resolves.toBe(false);
  });

  test('valid CSRF', async () => {
    const formData = mockDeep<FormData>({
      get: () => 'hmac.salt',
    });

    jest.mocked(getSessionId).mockResolvedValueOnce('session-id');
    jest.mocked(cookies).mockResolvedValueOnce(
      mockDeep<ReadonlyRequestCookies>({
        get: (_: string) => ({
          name: 'csrf_token',
          value: 'hmac.salt',
        }),
      })
    );

    const csrfVerification = await verifyFormCsrfToken(formData);

    expect(csrfVerification).toEqual(true);
  });
});
