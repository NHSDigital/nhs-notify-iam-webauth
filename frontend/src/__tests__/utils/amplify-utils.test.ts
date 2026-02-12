/**
 * @jest-environment node
 */
import { sign } from 'jsonwebtoken';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import {
  getAccessTokenServer,
  getSession,
  getSessionId,
} from '@/utils/amplify-utils';
import { AuthSession } from '@aws-amplify/auth';

jest.mock('aws-amplify/auth/server');
jest.mock('@aws-amplify/adapter-nextjs/api');
jest.mock('next/headers', () => ({
  cookies: () => ({
    getAll: jest.fn(),
  }),
}));
jest.mock('@amplify_outputs', () => ({
  name: 'mockConfig',
}));

const fetchAuthSessionMock = jest.mocked(fetchAuthSession);

describe('amplify-utils', () => {
  describe('getSession', () => {
    test('should return the auth session', async () => {
      const session: AuthSession = {
        userSub: 'sub',
        tokens: {
          accessToken: {
            payload: {},
          },
        },
      };

      fetchAuthSessionMock.mockResolvedValueOnce(session);

      const result = await getSession();

      expect(result).toEqual(session);
    });

    test('should return undefined an error occurs', async () => {
      fetchAuthSessionMock.mockImplementationOnce(() => {
        throw new Error('JWT Expired');
      });

      const result = await getSession();

      expect(result).toBeUndefined();
    });
  });

  describe('getAccessTokenServer', () => {
    test('should return the auth token', async () => {
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

    test('should return undefined when no auth session', async () => {
      fetchAuthSessionMock.mockResolvedValueOnce({});

      const result = await getAccessTokenServer();

      expect(result).toBeUndefined();
    });

    test('should return undefined an error occurs', async () => {
      fetchAuthSessionMock.mockImplementationOnce(() => {
        throw new Error('JWT Expired');
      });

      const result = await getAccessTokenServer();

      expect(result).toBeUndefined();
    });
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
