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

  const cookieStore = setupMockCookieStore();

  const request = new NextRequest('https://test?redirect=/redirect-url');
  const response = await GET(request);

  expect(getSessionId).toHaveBeenCalledWith({ forceRefresh: true });

  expect(cookieStore.set).toHaveBeenCalledWith('csrf_token', 'csrf', {
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
