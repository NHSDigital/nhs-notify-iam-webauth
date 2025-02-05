/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

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
      "connect-src 'self' https://cognito-idp.eu-west-2.amazonaws.com",
      "img-src 'self'",
      "manifest-src 'self'",
      "object-src 'none'",
      expect.stringMatching(/^script-src 'self' 'nonce-[\dA-Za-z]+'$/),
      "style-src 'self' 'unsafe-inline'",
      'upgrade-insecure-requests',
      '',
    ]);
  });

  it('sets CSP in response in dev mode, including unsafe-eval scripts to allow for source maps', () => {
    // @ts-expect-error assignment to readonly
    process.env.NODE_ENV = 'development';

    expect(getCsp()).toEqual([
      "base-uri 'self'",
      "default-src 'none'",
      "frame-ancestors 'none'",
      "font-src 'self' https://assets.nhs.uk",
      "form-action 'self'",
      "frame-src 'self'",
      "connect-src 'self' https://cognito-idp.eu-west-2.amazonaws.com",
      "img-src 'self'",
      "manifest-src 'self'",
      "object-src 'none'",
      expect.stringMatching(
        /^script-src 'self' 'nonce-[\dA-Za-z]+' 'unsafe-eval'$/
      ),
      "style-src 'self' 'unsafe-inline'",
      'upgrade-insecure-requests',
      '',
    ]);
  });
});
