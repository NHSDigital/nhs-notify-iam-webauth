/**
 * @jest-environment node
 */
import { mockDeep } from 'jest-mock-extended';
import { cookies } from 'next/headers';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { GET } from '../../../app/signin/route';
import { generateCsrf } from '../../../utils/csrf-utils';

jest.mock('../../../utils/csrf-utils');
jest.mock('next/headers');

test('returns redirect', async () => {
  jest.mocked(generateCsrf).mockResolvedValue('csrf');

  const cookieSetMock = jest.fn();
  const cookiesMock = mockDeep<ReadonlyRequestCookies>({
    set: cookieSetMock,
  });
  jest.mocked(cookies).mockReturnValue(cookiesMock);

  const request = mockDeep<Request>({
    url: 'https://test?redirect=redirect-url',
  });
  const response = await GET(request);

  expect(cookieSetMock).toHaveBeenCalledWith('csrf_token', 'csrf');
  expect(response.status).toEqual(302);
  expect(response.headers.get('Location')).toEqual('redirect-url');
});

test('returns redirect to / if no redirect given', async () => {
  jest.mocked(generateCsrf).mockResolvedValue('csrf');

  const cookieSetMock = jest.fn();
  const cookiesMock = mockDeep<ReadonlyRequestCookies>({
    set: cookieSetMock,
  });
  jest.mocked(cookies).mockReturnValue(cookiesMock);

  const request = mockDeep<Request>({
    url: 'https://test',
  });
  const response = await GET(request);

  expect(cookieSetMock).toHaveBeenCalledWith('csrf_token', 'csrf');
  expect(response.status).toEqual(302);
  expect(response.headers.get('Location')).toEqual('/');
});
