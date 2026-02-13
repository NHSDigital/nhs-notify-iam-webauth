/**
 * @jest-environment node
 */
import { mockDeep } from 'jest-mock-extended';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { GET } from '@/app/signin/route';
import { getSessionId } from '@/utils/amplify-utils';
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

  expect(getSessionId).toHaveBeenCalledWith({ forceRefresh: true });

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

  expect(getSessionId).toHaveBeenCalledWith({ forceRefresh: true });

  expect(response.status).toEqual(307);
  expect(response.headers.get('Location')).toEqual('/redirect-url');
});

test('returns redirect to /templates/message-templates if no redirect given', async () => {
  jest.mocked(getSessionId).mockResolvedValue('session-id');
  jest.mocked(generateSessionCsrfToken).mockResolvedValue('csrf');
  setupMockCookieStore();

  const request = new NextRequest('https://test');
  const response = await GET(request);

  expect(getSessionId).toHaveBeenCalledWith({ forceRefresh: true });

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

  expect(getSessionId).toHaveBeenCalledWith({ forceRefresh: true });

  expect(cookiesMock.delete).toHaveBeenCalledWith('csrf_token');

  expect(response.status).toEqual(307);
  expect(response.headers.get('Location')).toEqual('/auth');
});

test('retains redirect search param on /auth redirect', async () => {
  jest.mocked(getSessionId).mockResolvedValue('');
  const cookiesMock = setupMockCookieStore();

  const request = new NextRequest('https://test?redirect=/redirect-path');
  const response = await GET(request);

  expect(getSessionId).toHaveBeenCalledWith({ forceRefresh: true });

  expect(cookiesMock.delete).toHaveBeenCalledWith('csrf_token');

  expect(response.status).toEqual(307);
  expect(response.headers.get('Location')).toEqual(
    '/auth?redirect=%2Fredirect-path'
  );
});

describe('cognito cookie cleanup', () => {
  test('deletes all cognito cookies not related to the current cognito user pool client', async () => {
    jest.mocked(getSessionId).mockResolvedValue('session-id');

    const cookieStore = setupMockCookieStore({
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
          name: 'CognitoIdentityServiceProvider.NEXT_PUBLIC_USER_POOL_CLIENT_ID.LastAuthUser',
          value: 'userId1',
        },
        {
          name: 'CognitoIdentityServiceProvider.anotherUserPoolClient.LastAuthUser',
          value: 'userId2',
        },
        {
          name: 'non_cognito_cookie',
          value: 'some value',
        },
      ]),
    });

    const request = new NextRequest('https://test');

    await GET(request);

    expect(getSessionId).toHaveBeenCalledWith({ forceRefresh: true });

    expect(cookieStore.delete).toHaveBeenCalledTimes(2);
    expect(cookieStore.delete).toHaveBeenCalledWith(
      'CognitoIdentityServiceProvider.anotherUserPoolClient.current-user-sub.accessToken'
    );
    expect(cookieStore.delete).toHaveBeenCalledWith(
      'CognitoIdentityServiceProvider.anotherUserPoolClient.LastAuthUser'
    );
  });

  test('does not delete anything if there are no irrelevant cognito cookies', async () => {
    jest.mocked(getSessionId).mockResolvedValue('session-id');

    const cookieStore = setupMockCookieStore({
      getAll: jest.fn(() => [
        {
          name: 'CognitoIdentityServiceProvider.NEXT_PUBLIC_USER_POOL_CLIENT_ID.current-user-sub.accessToken',
          value: 'current.access.token',
        },
        {
          name: 'CognitoIdentityServiceProvider.NEXT_PUBLIC_USER_POOL_CLIENT_ID.LastAuthUser',
          value: 'userId1',
        },
        {
          name: 'non_cognito_cookie',
          value: 'some value',
        },
      ]),
    });

    const request = new NextRequest('https://test');

    await GET(request);

    expect(getSessionId).toHaveBeenCalledWith({ forceRefresh: true });

    expect(cookieStore.delete).not.toHaveBeenCalled();
  });

  test('deletes irrelevant cognito cookies and the csrf token if there is no session', async () => {
    const session = undefined;
    jest.mocked(getSessionId).mockResolvedValue(session);

    const cookieStore = setupMockCookieStore({
      getAll: jest.fn(() => [
        {
          name: 'CognitoIdentityServiceProvider.anotherUserPoolClient.current-user-sub.accessToken',
          value: 'old.access.token',
        },
        {
          name: 'CognitoIdentityServiceProvider.anotherUserPoolClient.LastAuthUser',
          value: 'userId2',
        },
        {
          name: 'non_cognito_cookie',
          value: 'some value',
        },
        {
          name: 'csrf_token',
          value: 'some value',
        },
      ]),
    });

    const request = new NextRequest('https://test');

    await GET(request);

    // when called with `forceRefresh` then `getSessionId` clears the existing auth cookies
    expect(getSessionId).toHaveBeenCalledWith({ forceRefresh: true });

    expect(cookieStore.delete).toHaveBeenCalledTimes(3);
    expect(cookieStore.delete).toHaveBeenCalledWith(
      'CognitoIdentityServiceProvider.anotherUserPoolClient.current-user-sub.accessToken'
    );
    expect(cookieStore.delete).toHaveBeenCalledWith(
      'CognitoIdentityServiceProvider.anotherUserPoolClient.LastAuthUser'
    );
    expect(cookieStore.delete).toHaveBeenCalledWith('csrf_token');
  });
});
