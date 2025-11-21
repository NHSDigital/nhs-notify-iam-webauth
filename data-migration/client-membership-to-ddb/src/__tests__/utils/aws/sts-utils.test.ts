import { getAccountId } from '@/src/utils/aws/sts-utils';
import { STSClient } from '@aws-sdk/client-sts';

jest.mock('@aws-sdk/client-sts', () => ({
  ...jest.requireActual('@aws-sdk/client-sts'),
}));

describe('sts-utils', () => {
  describe('getAccountId', () => {
    test('should get account ID from current auth context', async () => {
      // arrange
      const sendSpy = jest.spyOn(STSClient.prototype, 'send');
      sendSpy.mockImplementation(() => ({
        Account: '000000000000',
      }));

      // act
      const result = await getAccountId();

      // assert
      expect(result).toBe('000000000000');
    });

    test('should reject missing account ID', async () => {
      // arrange
      const sendSpy = jest.spyOn(STSClient.prototype, 'send');
      sendSpy.mockImplementation(() => ({}));

      // act
      let caughtError;
      try {
        await getAccountId();
      } catch (error) {
        caughtError = error;
      }

      // assert
      expect(caughtError).toBeTruthy();
      expect((caughtError as Error).message).toBe(
        'Unable to get account ID from caller'
      );
    });
  });
});
