import type { Cookie, Page } from '@playwright/test';

type CookieName =
  | 'lastAuthUser'
  | 'accessToken'
  | 'idToken'
  | 'refreshToken'
  | 'signInDetails'
  | 'clockDrift'
  | 'csrf_token';

export async function getCookies(
  page: Page
): Promise<Partial<Record<CookieName, Cookie>>> {
  const cookieList = await page.context().cookies();

  const cognitoCookies = cookieList.filter((cookie) =>
    cookie.name.startsWith('CognitoIdentityServiceProvider.')
  );

  const cookies: Partial<Record<CookieName, Cookie>> = {};

  const lastAuthUser = cognitoCookies.find((cookie) =>
    cookie.name.endsWith('LastAuthUser')
  );

  if (lastAuthUser) {
    cookies.lastAuthUser = lastAuthUser;
  }

  const accessToken = cognitoCookies.find((cookie) =>
    cookie.name.endsWith('accessToken')
  );

  if (accessToken) {
    cookies.accessToken = accessToken;
  }

  const idToken = cognitoCookies.find((cookie) =>
    cookie.name.endsWith('idToken')
  );

  if (idToken) {
    cookies.idToken = idToken;
  }

  const refreshToken = cognitoCookies.find((cookie) =>
    cookie.name.endsWith('refreshToken')
  );

  if (refreshToken) {
    cookies.refreshToken = refreshToken;
  }

  const signInDetails = cognitoCookies.find((cookie) =>
    cookie.name.endsWith('signInDetails')
  );

  if (signInDetails) {
    cookies.signInDetails = signInDetails;
  }
  const clockDrift = cognitoCookies.find((cookie) =>
    cookie.name.endsWith('clockDrift')
  );

  if (clockDrift) {
    cookies.clockDrift = clockDrift;
  }

  const csrfToken = cookieList.find((cookie) => cookie.name === 'csrf_token');

  if (csrfToken) {
    cookies.csrf_token = csrfToken;
  }

  return cookies;
}
