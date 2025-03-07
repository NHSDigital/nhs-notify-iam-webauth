/**
 * @jest-environment node
 */
import { fetchAuthSession } from '@aws-amplify/auth/server';
import { getAccessTokenServer } from '../../utils/amplify-utils';

jest.mock('@aws-amplify/auth/server');
jest.mock('@aws-amplify/adapter-nextjs/api');
jest.mock('next/headers', () => ({
  cookies: () => ({
    getAll: jest.fn(),
  }),
}));
jest.mock('@/amplify_outputs.json', () => ({
  name: 'mockConfig',
}));

const fetchAuthSessionMock = jest.mocked(fetchAuthSession);

describe('amplify-utils', () => {
  test('getAccessTokenServer - should return the auth token', async () => {
    fetchAuthSessionMock.mockResolvedValue({
      tokens: {
        accessToken: {
          toString: () => 'mockSub',
          payload: {
            sub: 'mockSub',
          },
        },
      },
    });

    const result = await getAccessTokenServer();

    expect(result).toEqual('mockSub');
  });

  test('getAccessTokenServer - should return undefined when no auth session', async () => {
    fetchAuthSessionMock.mockResolvedValue({});

    const result = await getAccessTokenServer();

    expect(result).toBeUndefined();
  });

  test('getAccessTokenServer - should return undefined an error occurs', async () => {
    fetchAuthSessionMock.mockImplementationOnce(() => {
      throw new Error('JWT Expired');
    });

    const result = await getAccessTokenServer();

    expect(result).toBeUndefined();
  });
});
