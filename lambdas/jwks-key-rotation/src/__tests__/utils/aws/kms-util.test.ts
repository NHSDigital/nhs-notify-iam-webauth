import {
  createKmsKey,
  deleteKey,
  getKmsPublicKey,
} from '@/src/utils/aws/kms-util';
import {
  CreateKeyCommand,
  GetPublicKeyCommand,
  KeySpec,
  KeyUsageType,
  KMSClient,
  ScheduleKeyDeletionCommand,
} from '@aws-sdk/client-kms';

jest.mock('@/src/utils/logger');
jest.mock('@aws-sdk/client-kms', () => ({
  ...jest.requireActual('@aws-sdk/client-kms'),
}));

describe('kms-util', () => {
  const OLD_ENV = { ...process.env };
  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('createKmsKey', () => {
    test('should create asymmetric KMS key', async () => {
      // arrange
      const sendSpy = jest.spyOn(KMSClient.prototype, 'send');
      sendSpy.mockImplementation(() => ({
        KeyMetadata: { KeyId: 'test-key-id' },
      }));

      const testCreateKeyCommand = new CreateKeyCommand({
        Policy: '{"Statement":[]}',
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
        Policy: '',
        Description: '',
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

  describe('getKmsPublicKey', () => {
    test('should key public key from KMS', async () => {
      // arrange
      process.env.REGION = 'eu-west-2';
      process.env.ACCOUNT_ID = '000000000000';
      const testPublicKey = Uint8Array.from([1, 2, 3]);

      const sendSpy = jest.spyOn(KMSClient.prototype, 'send');
      sendSpy.mockImplementation(() => ({
        PublicKey: testPublicKey,
      }));

      // act
      const result = await getKmsPublicKey('test-key-id');

      // assert
      expect(result).toBe(testPublicKey);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            KeyId: 'arn:aws:kms:eu-west-2:000000000000:key/test-key-id',
          },
        })
      );
      expect(sendSpy).toHaveBeenCalledWith(expect.any(GetPublicKeyCommand));
    });

    test('should handle missing key', async () => {
      // arrange
      const sendSpy = jest.spyOn(KMSClient.prototype, 'send');
      sendSpy.mockImplementation(() => ({}));

      // act
      const result = await getKmsPublicKey('test-key-id');

      // assert
      expect(result).toBe(undefined);
    });
  });

  describe('deleteKey', () => {
    test('should schedule KMS key deletion', async () => {
      // arrange
      const sendSpy = jest.spyOn(KMSClient.prototype, 'send');
      sendSpy.mockImplementation(() => ({}));

      // act
      await deleteKey('test-key-id');

      // assert
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({ input: { KeyId: 'test-key-id' } })
      );
      expect(sendSpy).toHaveBeenCalledWith(
        expect.any(ScheduleKeyDeletionCommand)
      );
    });
  });
});
