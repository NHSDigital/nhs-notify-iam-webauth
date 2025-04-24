import { createKmsKey } from '@/src/utils/aws/kms-util';
import {
  CreateKeyCommand,
  KeySpec,
  KeyUsageType,
  KMSClient,
} from '@aws-sdk/client-kms';

jest.mock('@/src/utils/logger');
jest.mock('@aws-sdk/client-kms', () => ({
  ...jest.requireActual('@aws-sdk/client-kms'),
}));

describe('kms-util', () => {
  describe('createKmsKey', () => {
    test('should create asymmetric KMS key', async () => {
      // arrange
      const sendSpy = jest.spyOn(KMSClient.prototype, 'send');
      sendSpy.mockImplementation(() => ({
        KeyMetadata: { KeyId: 'test-key-id' },
      }));

      const testCreateKeyCommand = new CreateKeyCommand({
        Policy: '{\"Statement\":[]}',
        Description: 'Test description',
        KeyUsage: KeyUsageType.SIGN_VERIFY,
        KeySpec: KeySpec.RSA_4096,
        Tags: [],
      });

      // act
      const result = await createKmsKey(testCreateKeyCommand);

      // assert
      expect(sendSpy).toHaveBeenCalledWith(testCreateKeyCommand);
      expect(result).toBe('test-key-id');
    });

    test('should propagate missing key ID error', async () => {
      // arrange
      const sendSpy = jest.spyOn(KMSClient.prototype, 'send');
      sendSpy.mockImplementation(() => ({
        KeyMetadata: {},
      }));

      const testCreateKeyCommand = new CreateKeyCommand({
        Policy: '{\"Statement\":[]}',
        Description: 'Test description',
        KeyUsage: KeyUsageType.SIGN_VERIFY,
        KeySpec: KeySpec.RSA_4096,
        Tags: [],
      });

      // act
      let error;
      try {
        await createKmsKey(testCreateKeyCommand);
      } catch (caughtError) {
        error = caughtError;
      }

      // assert
      expect(error).toBeTruthy();
      expect((error as Error).message).toBe('Failed to create key');
    });
  });
});
