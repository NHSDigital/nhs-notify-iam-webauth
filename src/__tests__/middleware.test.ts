/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

const cspRegex =
  /^base-uri 'self'; form-action 'self'; frame-ancestors 'none'; default-src 'none'; connect-src 'self'; font-src 'self' https:\/\/assets.nhs.uk; img-src 'self'; script-src 'self' 'nonce-[\dA-Za-z]+'; style-src 'self'; upgrade-insecure-requests$/;

describe('middleware function', () => {
  it('sets CSP in response', () => {
    const request = new NextRequest(
      new URL('https://main.web-gateway.dev.nhsnotify.national.nhs.uk')
    );
    const response = middleware(request);
    const csp = response.headers.get('Content-Security-Policy');
    expect(csp).toMatch(cspRegex);
  });
});
