import { getParameter, putParameter } from '@/src/utils/aws/ssm-util';
import {
  GetParameterCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';

jest.mock('@aws-sdk/client-ssm', () => ({
  ...jest.requireActual('@aws-sdk/client-ssm'),
}));
jest.mock('@/src/utils/logger');

describe('ssm-util', () => {
  describe('getParameter', () => {
    test('should get SSM parameter', async () => {
      // arrange
      const mockResponse = {
        Parameter: { Value: 'test value' },
      };
      const ssmClientSpy = jest
        .spyOn(SSMClient.prototype, 'send')
        .mockImplementation(() => mockResponse);

      // act
      const result = await getParameter('test_parameter/name');

      // assert
      expect(result).toMatchObject(mockResponse);
      expect(ssmClientSpy).toHaveBeenCalledWith(
        expect.any(GetParameterCommand)
      );
      expect(ssmClientSpy).toHaveBeenCalledWith(
        expect.objectContaining({ input: { Name: 'test_parameter/name' } })
      );
    });

    test('should reject missing parmeter name', async () => {
      // act
      let error;
      try {
        await getParameter();
      } catch (caughtError) {
        error = caughtError;
      }

      // assert
      expect(error).toBeTruthy();
      expect((error as Error).message).toBe('Missing parameter name');
    });
  });

  describe('putParameter', () => {
    test('should update SSM parameter', async () => {
      // arrange
      const ssmClientSpy = jest
        .spyOn(SSMClient.prototype, 'send')
        .mockImplementation(() => ({}));

      // act
      await putParameter('{"test":123}', 'test_parameter/name');

      // assert
      expect(ssmClientSpy).toHaveBeenCalledWith(
        expect.any(PutParameterCommand)
      );
      expect(ssmClientSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: 'test_parameter/name',
            Overwrite: true,
            Value: '{"test":123}',
          },
        })
      );
    });

    test('should reject missing parmeter name', async () => {
      // act
      let error;
      try {
        await putParameter('{"test":123}');
      } catch (caughtError) {
        error = caughtError;
      }

      // assert
      expect(error).toBeTruthy();
      expect((error as Error).message).toBe('Missing parameter name');
    });
  });
});
