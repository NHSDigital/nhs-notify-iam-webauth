import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = `base-uri 'self'; form-action 'self'; frame-ancestors 'none'; default-src 'none'; connect-src 'self'; font-src 'self' https://assets.nhs.uk; img-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self'; upgrade-insecure-requests`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('Content-Security-Policy', csp);

  return response;
}
