import { NextRequest, NextResponse } from 'next/server';
import { getConstants } from '@/utils/public-constants';

const { COGNITO_DOMAIN, USER_POOL_CLIENT_ID } = getConstants();

const COGNITO_COOKIE_PREFIX = 'CognitoIdentityServiceProvider.';

function getContentSecurityPolicy(nonce: string) {
  const contentSecurityPolicyDirective: Record<string, string[]> = {
    'base-uri': [`'self'`],
    'default-src': [`'none'`],
    'frame-ancestors': [`'none'`],
    'font-src': [`'self'`, 'https://assets.nhs.uk'],
    'form-action': [`'self'`],
    'frame-src': [`'self'`],
    'connect-src': [
      `'self'`,
      'https://cognito-idp.eu-west-2.amazonaws.com',
      `https://${COGNITO_DOMAIN}/oauth2/token`,
    ],
    'img-src': [`'self'`],
    'manifest-src': [`'self'`],
    'object-src': [`'none'`],
    'script-src': [`'self'`, `'nonce-${nonce}'`],
    'style-src': [`'self'`, `'nonce-${nonce}'`],
  };

  if (process.env.NODE_ENV === 'development') {
    contentSecurityPolicyDirective['script-src'].push(`'unsafe-eval'`);
  } else {
    contentSecurityPolicyDirective['upgrade-insecure-requests'] = [];
  }

  return Object.entries(contentSecurityPolicyDirective)
    .map(([key, value]) => `${key} ${value.join(' ')}`)
    .join('; ')
    .concat(';');
}

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const csp = getContentSecurityPolicy(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('Content-Security-Policy', csp);

  const cookies = request.cookies.getAll();

  for (const cookie of cookies) {
    if (
      cookie.name.startsWith(COGNITO_COOKIE_PREFIX) &&
      !cookie.name.startsWith(`${COGNITO_COOKIE_PREFIX}${USER_POOL_CLIENT_ID}.`)
    ) {
      response.cookies.delete(cookie.name);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - lib/ (our static content)
     */
    '/',
    '/((?!_next/static|_next/image|favicon.ico|lib/).*)',
  ],
};
