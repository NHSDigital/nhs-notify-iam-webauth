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

const baseUrl = 'https://test';

test('returns redirect', async () => {
  jest.mocked(getSessionId).mockResolvedValue('session-id');
  jest.mocked(generateSessionCsrfToken).mockResolvedValue('csrf');

  const cookieSetMock = jest.fn();
  const cookiesMock = mockDeep<ReadonlyRequestCookies>({
    set: cookieSetMock,
  });
  jest.mocked(cookies).mockResolvedValue(cookiesMock);

  const request = new NextRequest(`${baseUrl}?redirect=/redirect-url`);
  const response = await GET(request);

  expect(cookieSetMock).toHaveBeenCalledWith('csrf_token', 'csrf', {
    sameSite: 'strict',
    secure: true,
  });
  expect(response.status).toEqual(307);
  expect(response.headers.get('Location')).toEqual(`${baseUrl}/redirect-url`);
});

test('returns redirect - sanitizes redirect path', async () => {
  jest.mocked(getSessionId).mockResolvedValue('session-id');
  jest.mocked(generateSessionCsrfToken).mockResolvedValue('csrf');
  jest.mocked(cookies).mockResolvedValue(mockDeep<ReadonlyRequestCookies>());

  const request = new NextRequest(`${baseUrl}?redirect=redirect-url`);
  const response = await GET(request);

  expect(response.status).toEqual(307);
  expect(response.headers.get('Location')).toEqual(`${baseUrl}/redirect-url`);
});

test('returns redirect to /templates/message-templates if no redirect given', async () => {
  jest.mocked(getSessionId).mockResolvedValue('session-id');
  jest.mocked(generateSessionCsrfToken).mockResolvedValue('csrf');
  jest.mocked(cookies).mockResolvedValue(mockDeep<ReadonlyRequestCookies>({}));

  const request = new NextRequest(baseUrl);
  const response = await GET(request);

  expect(response.status).toEqual(307);
  expect(response.headers.get('Location')).toEqual(
    `${baseUrl}/templates/message-templates`
  );
});

test('returns redirect to /auth if no session detected', async () => {
  jest.mocked(getSessionId).mockResolvedValue('');
  const cookiesMock = mockDeep<ReadonlyRequestCookies>();
  jest.mocked(cookies).mockResolvedValue(cookiesMock);

  const request = new NextRequest(baseUrl);
  const response = await GET(request);

  expect(cookiesMock.delete).toHaveBeenCalledWith('csrf_token');
  expect(response.status).toEqual(307);
  expect(response.headers.get('Location')).toEqual(`${baseUrl}/auth`);
});

test('retains redirect search param on /auth redirect', async () => {
  jest.mocked(getSessionId).mockResolvedValue('');
  const cookiesMock = mockDeep<ReadonlyRequestCookies>();
  jest.mocked(cookies).mockResolvedValue(cookiesMock);

  const request = new NextRequest(`${baseUrl}?redirect=/redirect-path`);
  const response = await GET(request);

  expect(cookiesMock.delete).toHaveBeenCalledWith('csrf_token');
  expect(response.status).toEqual(307);
  expect(response.headers.get('Location')).toEqual(
    `${baseUrl}/auth?redirect=%2Fredirect-path`
  );
});
