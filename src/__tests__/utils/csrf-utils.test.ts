/**
 * @jest-environment node
 */
import { mockDeep } from 'jest-mock-extended';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { BinaryLike, BinaryToTextEncoding } from 'node:crypto';
import {
  generateCsrf,
  getSessionId,
  verifyCsrfToken,
  verifyCsrfTokenFull,
} from '../../utils/csrf-utils';
import { getAccessTokenServer } from '../../utils/amplify-utils';

class MockHmac {
  update(_: BinaryLike) {
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  digest(_: BinaryToTextEncoding) {
    return 'hmac';
  }
}

const mockJwt = sign(
  {
    origin_jti: 'jti',
  },
  'key'
);

jest.mock('next/headers');
jest.mock('node:crypto', () => ({
  createHmac: () => new MockHmac(),
  randomBytes: () => 'salt',
}));
jest.mock('../../utils/amplify-utils');

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

describe('getSessionId', () => {
  test('errors when access token not found', async () => {
    jest.mocked(getAccessTokenServer).mockResolvedValue('');

    await expect(() => getSessionId()).rejects.toThrow(
      'Could not get access token'
    );
  });

  test('errors when session ID not found', async () => {
    const mockEmptyJwt = sign(
      {
        origin_jti: undefined,
      },
      'key'
    );

    jest.mocked(getAccessTokenServer).mockResolvedValue(mockEmptyJwt);

    await expect(() => getSessionId()).rejects.toThrow(
      'Could not get session ID'
    );
  });

  test('returns session id', async () => {
    jest.mocked(getAccessTokenServer).mockResolvedValue(mockJwt);

    const sessionId = await getSessionId();

    expect(sessionId).toEqual('jti');
  });
});

test('generateCsrf', async () => {
  const csrf = await generateCsrf();
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

describe('verifyCsrfTokenFull', () => {
  test('missing CSRF cookie', async () => {
    const formData = mockDeep<FormData>();

    jest.mocked(getAccessTokenServer).mockResolvedValue(mockJwt);

    jest.mocked(cookies).mockResolvedValue(
      mockDeep<ReadonlyRequestCookies>({
        get: (_: string): undefined => {},
      })
    );

    await expect(() => verifyCsrfTokenFull(formData)).rejects.toThrow(
      'missing CSRF cookie'
    );
  });

  test('missing CSRF form field', async () => {
    const formData = mockDeep<FormData>({
      get: () => null,
    });

    jest.mocked(getAccessTokenServer).mockResolvedValue(mockJwt);
    jest.mocked(cookies).mockResolvedValue(
      mockDeep<ReadonlyRequestCookies>({
        get: (_: string) => ({
          name: 'csrf_token',
          value: 'hmac.salt',
        }),
      })
    );

    await expect(() => verifyCsrfTokenFull(formData)).rejects.toThrow(
      'missing CSRF form field'
    );
  });

  test('CSRF mismatch', async () => {
    const formData = mockDeep<FormData>({
      get: () => 'hmac2.salt',
    });

    jest.mocked(getAccessTokenServer).mockResolvedValue(mockJwt);
    jest.mocked(cookies).mockResolvedValue(
      mockDeep<ReadonlyRequestCookies>({
        get: (_: string) => ({
          name: 'csrf_token',
          value: 'hmac.salt',
        }),
      })
    );

    await expect(() => verifyCsrfTokenFull(formData)).rejects.toThrow(
      'CSRF mismatch'
    );
  });

  test('invalid CSRF form field', async () => {
    const formData = mockDeep<FormData>({
      get: () => 'hmac2.salt',
    });

    jest.mocked(getAccessTokenServer).mockResolvedValue(mockJwt);
    jest.mocked(cookies).mockResolvedValue(
      mockDeep<ReadonlyRequestCookies>({
        get: (_: string) => ({
          name: 'csrf_token',
          value: 'hmac2.salt',
        }),
      })
    );

    await expect(() => verifyCsrfTokenFull(formData)).rejects.toThrow(
      'CSRF error'
    );
  });

  test('valid CSRF', async () => {
    const formData = mockDeep<FormData>({
      get: () => 'hmac.salt',
    });

    jest.mocked(getAccessTokenServer).mockResolvedValue(mockJwt);
    jest.mocked(cookies).mockResolvedValue(
      mockDeep<ReadonlyRequestCookies>({
        get: (_: string) => ({
          name: 'csrf_token',
          value: 'hmac.salt',
        }),
      })
    );

    const csrfVerification = await verifyCsrfTokenFull(formData);

    expect(csrfVerification).toEqual(true);
  });
});
