/**
 * @jest-environment node
 */
import { sign } from 'jsonwebtoken';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { getAccessTokenServer, getSessionId } from '../../utils/amplify-utils';

jest.mock('aws-amplify/auth/server');
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
    fetchAuthSessionMock.mockResolvedValueOnce({
      tokens: {
        accessToken: {
          toString: () => 'mockToken',
          payload: {},
        },
      },
    });

    const result = await getAccessTokenServer();

    expect(result).toEqual('mockToken');
  });

  test('getAccessTokenServer - should return undefined when no auth session', async () => {
    fetchAuthSessionMock.mockResolvedValueOnce({});

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

  describe('getSessionId', () => {
    test('returns void when access token not found', async () => {
      fetchAuthSessionMock.mockResolvedValueOnce({});

      await expect(getSessionId()).resolves.toBeUndefined();
    });

    test('errors when session ID not found', async () => {
      fetchAuthSessionMock.mockResolvedValueOnce({
        tokens: {
          accessToken: {
            toString: () => sign({}, 'key'),
            payload: {},
          },
        },
      });

      await expect(getSessionId()).resolves.toBeUndefined();
    });

    test('returns session id', async () => {
      fetchAuthSessionMock.mockResolvedValueOnce({
        tokens: {
          accessToken: {
            toString: () =>
              sign(
                {
                  origin_jti: 'jti',
                },
                'key'
              ),
            payload: {},
          },
        },
      });

      const sessionId = await getSessionId();

      expect(sessionId).toEqual('jti');
    });
  });
});
