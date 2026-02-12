/**
 * @jest-environment node
 */
import { mockDeep } from 'jest-mock-extended';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { GET } from '@/app/signin/route';
import { getSession, getSessionId } from '@/utils/amplify-utils';
import { generateSessionCsrfToken } from '@/utils/csrf-utils';

jest.mock('@/utils/amplify-utils');
jest.mock('@/utils/csrf-utils');
jest.mock('next/headers');
jest.mock('@/utils/get-environment-variable', () => ({
  getEnvironmentVariable: jest.fn((name: string) => name),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

function setupMockCookieStore(mock: Partial<ReadonlyRequestCookies> = {}) {
  const cookieStore = mockDeep<ReadonlyRequestCookies>({
    getAll: jest.fn(() => []),
    ...mock,
  });

  jest.mocked(cookies).mockResolvedValue(cookieStore);

  return cookieStore;
}

test('returns redirect', async () => {
  jest.mocked(getSessionId).mockResolvedValue('session-id');
  jest.mocked(generateSessionCsrfToken).mockResolvedValue('csrf');

  const cookieSetMock = jest.fn();
  setupMockCookieStore({ set: cookieSetMock });

  const request = new NextRequest('https://test?redirect=/redirect-url');
  const response = await GET(request);

  expect(cookieSetMock).toHaveBeenCalledWith('csrf_token', 'csrf', {
    sameSite: 'strict',
    secure: true,
  });
  expect(response.status).toEqual(307);
  expect(response.headers.get('Location')).toEqual('/redirect-url');
});

test('returns redirect - sanitizes redirect path', async () => {
  jest.mocked(getSessionId).mockResolvedValue('session-id');
  jest.mocked(generateSessionCsrfToken).mockResolvedValue('csrf');
  setupMockCookieStore();

  const request = new NextRequest('https://test?redirect=redirect-url'); // no leading slash in redirect search param value
  const response = await GET(request);

  expect(response.status).toEqual(307);
  expect(response.headers.get('Location')).toEqual('/redirect-url');
});

test('returns redirect to /templates/message-templates if no redirect given', async () => {
  jest.mocked(getSessionId).mockResolvedValue('session-id');
  jest.mocked(generateSessionCsrfToken).mockResolvedValue('csrf');
  setupMockCookieStore();

  const request = new NextRequest('https://test');
  const response = await GET(request);

  expect(response.status).toEqual(307);
  expect(response.headers.get('Location')).toEqual(
    '/templates/message-templates'
  );
});

test('returns redirect to /auth if no session detected', async () => {
  jest.mocked(getSessionId).mockResolvedValue('');
  const cookiesMock = setupMockCookieStore();

  const request = new NextRequest('https://test');
  const response = await GET(request);

  expect(cookiesMock.delete).toHaveBeenCalledWith('csrf_token');

  expect(response.status).toEqual(307);
  expect(response.headers.get('Location')).toEqual('/auth');
});

test('retains redirect search param on /auth redirect', async () => {
  jest.mocked(getSessionId).mockResolvedValue('');
  const cookiesMock = setupMockCookieStore();

  const request = new NextRequest('https://test?redirect=/redirect-path');
  const response = await GET(request);

  expect(cookiesMock.delete).toHaveBeenCalledWith('csrf_token');

  expect(response.status).toEqual(307);
  expect(response.headers.get('Location')).toEqual(
    '/auth?redirect=%2Fredirect-path'
  );
});

describe('cognito cookie cleanup', () => {
  const deleteSpy = jest.fn();

  beforeEach(() => {
    jest.mocked(getSessionId).mockResolvedValue('session-id');

    setupMockCookieStore({
      delete: deleteSpy,
      getAll: jest.fn(() => [
        {
          name: 'CognitoIdentityServiceProvider.anotherUserPoolClient.current-user-sub.accessToken',
          value: 'old.access.token',
        },
        {
          name: 'CognitoIdentityServiceProvider.NEXT_PUBLIC_USER_POOL_CLIENT_ID.current-user-sub.accessToken',
          value: 'current.access.token',
        },
        {
          name: 'CognitoIdentityServiceProvider.NEXT_PUBLIC_USER_POOL_CLIENT_ID.another-user-sub.accessToken',
          value: 'different.access.token',
        },
        {
          name: 'non_cognito_cookie',
          value: 'some value',
        },
      ]),
    });
  });
  test('deletes all cognito cookies not related to the current cognito user pool client and user', async () => {
    jest.mocked(getSession).mockResolvedValue({
      userSub: 'current-user-sub',
    });

    const request = new NextRequest('https://test');

    await GET(request);

    expect(deleteSpy).toHaveBeenCalledTimes(2);
    expect(deleteSpy).toHaveBeenCalledWith(
      'CognitoIdentityServiceProvider.anotherUserPoolClient.current-user-sub.accessToken'
    );
    expect(deleteSpy).toHaveBeenCalledWith(
      'CognitoIdentityServiceProvider.NEXT_PUBLIC_USER_POOL_CLIENT_ID.another-user-sub.accessToken'
    );
  });

  test('deletes all cognito cookies from different user pool clients if there is no userSub on the session', async () => {
    jest.mocked(getSession).mockResolvedValue({});

    const request = new NextRequest('https://test');

    await GET(request);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(
      'CognitoIdentityServiceProvider.anotherUserPoolClient.current-user-sub.accessToken'
    );
  });

  test('deletes all cognito cookies if there is no session', async () => {
    const session = undefined;
    jest.mocked(getSession).mockResolvedValue(session);

    const request = new NextRequest('https://test');

    await GET(request);

    expect(deleteSpy).toHaveBeenCalledTimes(3);
    expect(deleteSpy).toHaveBeenCalledWith(
      'CognitoIdentityServiceProvider.anotherUserPoolClient.current-user-sub.accessToken'
    );
    expect(deleteSpy).toHaveBeenCalledWith(
      'CognitoIdentityServiceProvider.NEXT_PUBLIC_USER_POOL_CLIENT_ID.current-user-sub.accessToken'
    );
    expect(deleteSpy).toHaveBeenCalledWith(
      'CognitoIdentityServiceProvider.NEXT_PUBLIC_USER_POOL_CLIENT_ID.another-user-sub.accessToken'
    );
  });
});
