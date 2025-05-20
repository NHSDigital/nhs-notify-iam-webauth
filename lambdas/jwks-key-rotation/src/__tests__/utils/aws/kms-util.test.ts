import {
  createKmsKey,
  deleteKey,
  getKeyState,
  getKmsPublicKey,
} from '@/src/utils/aws/kms-util';
import { KMS_NO_OP_ERRORS } from '@/src/utils/constants';
import {
  CreateKeyCommand,
  DescribeKeyCommand,
  GetPublicKeyCommand,
  KeySpec,
  KeyState,
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

  describe('getKeyState', () => {
    test('should get key state', async () => {
      // arrange
      const sendSpy = jest.spyOn(KMSClient.prototype, 'send');
      sendSpy.mockImplementation(() =>
        Promise.resolve({
          KeyMetadata: {
            KeyState: KeyState.PendingDeletion,
          },
        })
      );

      // act
      const result = await getKeyState('00000000-0000-0000-0000-000000000000');

      // assert
      expect(result).toEqual({
        keyId: '00000000-0000-0000-0000-000000000000',
        keyState: KeyState.PendingDeletion,
      });
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: { KeyId: '00000000-0000-0000-0000-000000000000' },
        })
      );
      expect(sendSpy).toHaveBeenCalledWith(expect.any(DescribeKeyCommand));
    });

    test('should ignore no-op errors', async () => {
      // arrange
      class TestError1 extends Error {}

      (jest.mocked(KMS_NO_OP_ERRORS) as Array<unknown>).push(TestError1);

      const sendSpy = jest.spyOn(KMSClient.prototype, 'send');
      sendSpy.mockImplementation(() => Promise.reject(new TestError1('TEST')));

      // act
      const result = await getKeyState('00000000-0000-0000-0000-000000000000');

      // assert
      expect(result).toEqual({
        keyId: '00000000-0000-0000-0000-000000000000',
        keyState: KeyState.Unavailable,
      });
    });

    test('should propagate general errors', async () => {
      // arrange
      const sendSpy = jest.spyOn(KMSClient.prototype, 'send');
      sendSpy.mockImplementation(() => Promise.reject(new Error('TEST')));

      // act
      let caughtError;
      try {
        await getKeyState('00000000-0000-0000-0000-000000000000');
      } catch (error) {
        caughtError = error;
      }

      // assert
      expect(caughtError).toBeTruthy();
      expect((caughtError as Error).message).toBe('TEST');
    });

    test('should handle missing state', async () => {
      // arrange
      const sendSpy = jest.spyOn(KMSClient.prototype, 'send');
      sendSpy.mockImplementation(() =>
        Promise.resolve({
          KeyMetadata: {},
        })
      );

      // act
      const result = await getKeyState('00000000-0000-0000-0000-000000000000');

      // assert
      expect(result).toEqual({
        keyId: '00000000-0000-0000-0000-000000000000',
        keyState: KeyState.Unavailable,
      });
    });

    test('should handle missing metadata', async () => {
      // arrange
      const sendSpy = jest.spyOn(KMSClient.prototype, 'send');
      sendSpy.mockImplementation(() => Promise.resolve({}));

      // act
      const result = await getKeyState('00000000-0000-0000-0000-000000000000');

      // assert
      expect(result).toEqual({
        keyId: '00000000-0000-0000-0000-000000000000',
        keyState: KeyState.Unavailable,
      });
    });
  });
});
