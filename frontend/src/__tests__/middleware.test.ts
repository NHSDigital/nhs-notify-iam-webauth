/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

jest.mock('@/utils/public-constants', () => ({
  getConstants: () => ({
    COGNITO_DOMAIN: 'auth.env.iam.dev.nhsnotify.national.nhs.uk',
    USER_POOL_CLIENT_ID: 'abc',
  }),
}));

const OLD_ENV = { ...process.env };
afterAll(() => {
  process.env = OLD_ENV;
});

function getCsp() {
  const url = new URL('https://main.web-gateway.dev.nhsnotify.national.nhs.uk');
  const request = new NextRequest(url);
  const response = middleware(request);
  const csp = response.headers.get('Content-Security-Policy');
  return csp?.split(';').map((s) => s.trim());
}

describe('middleware function', () => {
  it('sets CSP in response', () => {
    // @ts-expect-error assignment to readonly
    process.env.NODE_ENV = 'production';

    expect(getCsp()).toEqual([
      "base-uri 'self'",
      "default-src 'none'",
      "frame-ancestors 'none'",
      "font-src 'self' https://assets.nhs.uk",
      "form-action 'self'",
      "frame-src 'self'",
      "connect-src 'self' https://cognito-idp.eu-west-2.amazonaws.com https://auth.env.iam.dev.nhsnotify.national.nhs.uk/oauth2/token",
      "img-src 'self'",
      "manifest-src 'self'",
      "object-src 'none'",
      expect.stringMatching(/^script-src 'self' 'nonce-[\dA-Za-z]+'$/),
      expect.stringMatching(/^style-src 'self' 'nonce-[\dA-Za-z]+'$/),
      'upgrade-insecure-requests',
      '',
    ]);
  });

  it('sets CSP in response in dev mode, including unsafe-eval scripts to allow for source maps and does not upgrade insecure requests', () => {
    // @ts-expect-error assignment to readonly
    process.env.NODE_ENV = 'development';

    expect(getCsp()).toEqual([
      "base-uri 'self'",
      "default-src 'none'",
      "frame-ancestors 'none'",
      "font-src 'self' https://assets.nhs.uk",
      "form-action 'self'",
      "frame-src 'self'",
      "connect-src 'self' https://cognito-idp.eu-west-2.amazonaws.com https://auth.env.iam.dev.nhsnotify.national.nhs.uk/oauth2/token",
      "img-src 'self'",
      "manifest-src 'self'",
      "object-src 'none'",
      expect.stringMatching(
        /^script-src 'self' 'nonce-[\dA-Za-z]+' 'unsafe-eval'$/
      ),
      expect.stringMatching(/^style-src 'self' 'nonce-[\dA-Za-z]+'$/),
      '',
    ]);
  });
});

describe('cognito cookie cleanup', () => {
  test('deletes all cognito cookies not related to the current cognito user pool client', async () => {
    const url = new URL(
      'https://main.web-gateway.dev.nhsnotify.national.nhs.uk'
    );

    const request = new NextRequest(url);

    const invalidCookies = [
      {
        name: 'CognitoIdentityServiceProvider.xyz.user-sub.accessToken',
        value: 'old.access.token',
      },
      {
        name: 'CognitoIdentityServiceProvider.xyz.LastAuthUser',
        value: 'userId2',
      },
    ];

    const validCookies = [
      {
        name: 'CognitoIdentityServiceProvider.abc.user-sub.accessToken',
        value: 'current.access.token',
      },
      {
        name: 'CognitoIdentityServiceProvider.abc.LastAuthUser',
        value: 'userId1',
      },

      {
        name: 'non_cognito_cookie',
        value: 'some value',
      },
      {
        name: 'csrf_token',
        value: 'some csrf token',
      },
    ];

    for (const cookie of [...validCookies, ...invalidCookies]) {
      request.cookies.set(cookie.name, cookie.value);
    }

    const response = middleware(request);

    const setCookieHeaders = response.headers.getSetCookie();

    for (const { name } of invalidCookies) {
      // Deleted cookies WILL appear in response.cookies (with deletion headers)
      expect(response.cookies.has(name)).toBe(true);
      const cookie = response.cookies.get(name);

      // Value is unset
      expect(cookie?.value).toBe('');

      // Expiry is set to past date
      expect(
        setCookieHeaders.some(
          (header) =>
            header.startsWith(`${name}=`) &&
            header.includes('Expires=Thu, 01 Jan 1970 00:00:00 GMT')
        )
      ).toBe(true);
    }

    for (const { name } of validCookies) {
      // Kept cookies will NOT appear in response.cookies  as the middleware does not touch them
      expect(response.cookies.has(name)).toBe(false);
    }
  });
});
