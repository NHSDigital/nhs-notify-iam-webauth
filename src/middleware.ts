import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const cspUnsafeEval =
    process.env.NODE_ENV === 'production' ? '' : `'unsafe-eval'`;

  const csp = `base-uri 'self'; form-action 'self'; frame-ancestors 'none'; default-src 'none'; connect-src 'self' https://cognito-idp.eu-west-2.amazonaws.com; font-src 'self' https://assets.nhs.uk; img-src 'self'; script-src 'self' 'nonce-${nonce}' https: http: ${cspUnsafeEval}; style-src 'self' 'nonce-${nonce}'; upgrade-insecure-requests;`;

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

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
