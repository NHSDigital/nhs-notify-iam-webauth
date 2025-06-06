import { getParameter } from '@/src/utils/aws/ssm-util';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

jest.mock('@aws-sdk/client-ssm', () => ({
  ...jest.requireActual('@aws-sdk/client-ssm'),
}));

describe('ssm-util', () => {
  describe('getParameter', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-06-03 09:00:00'));
      jest.resetAllMocks();
    });

    test('should get SSM parameter value with empty cache', async () => {
      // arrange
      const mockResponse = {
        Parameter: { Value: 'test value' },
      };
      const ssmClientSpy = jest
        .spyOn(SSMClient.prototype, 'send')
        .mockImplementation(() => mockResponse);

      // act
      const result = await getParameter('/test/param');

      // assert
      expect(result).toBe('test value');
      expect(ssmClientSpy).toHaveBeenCalledWith(
        expect.any(GetParameterCommand)
      );
      expect(ssmClientSpy).toHaveBeenCalledWith(
        expect.objectContaining({ input: { Name: '/test/param' } })
      );
    });

    test('should get SSM parameter value from cache', async () => {
      // arrange
      const mockResponse = {
        Parameter: { Value: 'test value' },
      };
      const ssmClientSpy = jest
        .spyOn(SSMClient.prototype, 'send')
        .mockImplementation(() => mockResponse);

      // act
      const result1 = await getParameter('/test/param2');
      const result2 = await getParameter('/test/param2');
      const result3 = await getParameter('/test/param2');

      // assert
      expect(result1).toBe('test value');
      expect(result2).toBe('test value');
      expect(result3).toBe('test value');
      expect(ssmClientSpy).toHaveBeenCalledTimes(1);
    });

    test('should expire cached items', async () => {
      // arrange
      const mockResponse = {
        Parameter: { Value: 'test value' },
      };
      const ssmClientSpy = jest
        .spyOn(SSMClient.prototype, 'send')
        .mockImplementation(() => mockResponse);

      // act
      const result1 = await getParameter('/test/param3');
      jest.setSystemTime(new Date('2025-06-03 09:14:59'));
      const result2 = await getParameter('/test/param3');
      jest.setSystemTime(new Date('2025-06-03 09:15:00'));
      const result3 = await getParameter('/test/param3');

      // assert
      expect(result1).toBe('test value');
      expect(result2).toBe('test value');
      expect(result3).toBe('test value');
      expect(ssmClientSpy).toHaveBeenCalledTimes(2);
    });

    test('should handle missing value', async () => {
      // arrange
      const mockResponse = {
        Parameter: {},
      };
      jest
        .spyOn(SSMClient.prototype, 'send')
        .mockImplementation(() => mockResponse);

      // act
      const result = await getParameter('/test/param4');

      // assert
      expect(result).toBe('');
    });

    test('should handle missing parameter', async () => {
      // arrange
      const mockResponse = {};
      jest
        .spyOn(SSMClient.prototype, 'send')
        .mockImplementation(() => mockResponse);

      // act
      const result = await getParameter('/test/param4');

      // assert
      expect(result).toBe('');
    });

    test('should reject missing parameter name', async () => {
      // act
      let caughtError;
      try {
        await getParameter();
      } catch (error) {
        caughtError = error;
      }

      // assert
      expect(caughtError).toBeTruthy();
      expect((caughtError as Error).message).toBe('Missing parameter name');
    });
  });
});
