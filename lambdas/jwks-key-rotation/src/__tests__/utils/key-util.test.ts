import { getParameter } from '@/src/utils/aws/ssm-util';
import { generateKey, getPublicKey } from '@/src/utils/key-util';
import { getKeyTags } from '@/src/utils/aws/tag-util';
import { createKmsKey, getKmsPublicKey } from '@/src/utils/aws/kms-util';
import { KMS_NO_OP_ERRORS } from '@/src/utils/constants';

jest.mock('@/src/utils/logger');
jest.mock('@/src/utils/aws/ssm-util');
jest.mock('@/src/utils/aws/tag-util');
jest.mock('@/src/utils/aws/kms-util');
jest.mock('@/src/utils/constants');

describe('key-util', () => {
  const OLD_ENV = { ...process.env };
  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('generateKey', () => {
    test('should generate KMS asymmetric key', async () => {
      // arrange
      const mockKeyPolicy = '/nhs-notify-abcd12-sbx-psk/asymmetric_key_policy';
      process.env.SSM_ASYMMETRIC_KEY_POLICY = mockKeyPolicy;

      const mockGetParameter = jest.mocked(getParameter);
      const mockGetKeyTags = jest.mocked(getKeyTags);
      const mockCreateKmsKey = jest.mocked(createKmsKey);

      mockGetParameter.mockImplementation(() =>
        Promise.resolve({
          $metadata: {},
          Parameter: {
            Value: '{"Statement":[]}',
          },
        })
      );

      mockGetKeyTags.mockImplementation(() => [
        { TagKey: 'TEST_1', TagValue: 'v1' },
        { TagKey: 'TEST_2', TagValue: 'v2' },
      ]);

      mockCreateKmsKey.mockImplementation(() =>
        Promise.resolve('12dfbf31-c65e-4966-9010-3dfde426e8f4')
      );

      // act
      const result = await generateKey();

      // assert
      expect(result).toBe('12dfbf31-c65e-4966-9010-3dfde426e8f4');
      expect(mockGetParameter.mock.lastCall?.[0]).toBe(mockKeyPolicy);
      expect(mockCreateKmsKey).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Description: 'Used for JWKS auth for CIS2 login',
            KeySpec: 'RSA_4096',
            KeyUsage: 'SIGN_VERIFY',
            Policy: '{"Statement":[]}',
            Tags: [
              { TagKey: 'TEST_1', TagValue: 'v1' },
              { TagKey: 'TEST_2', TagValue: 'v2' },
            ],
          },
        })
      );
    });

    test('should propagate missing key policy error', async () => {
      // arrange
      const mockKeyPolicy = '/nhs-notify-abcd12-sbx-psk/asymmetric_key_policy';
      process.env.SSM_ASYMMETRIC_KEY_POLICY = mockKeyPolicy;

      const mockGetParameter = jest.mocked(getParameter);
      const mockCreateKmsKey = jest.mocked(createKmsKey);

      mockGetParameter.mockImplementation(() =>
        Promise.resolve({
          $metadata: {},
          Parameter: {},
        })
      );

      // act
      let error;
      try {
        await generateKey();
      } catch (caughtError) {
        error = caughtError;
      }

      // assert
      expect(error).toBeTruthy();
      expect((error as Error).message).toBe(
        'Failed to retrieve key policy from /nhs-notify-abcd12-sbx-psk/asymmetric_key_policy'
      );
      expect(mockCreateKmsKey).not.toHaveBeenCalled();
    });
  });

  describe('getPublicKey', () => {
    test('should get the public key from KMS', async () => {
      // arrange
      const mockGetKmsPublicKey = jest.mocked(getKmsPublicKey);
      const mockPublicKey = Uint8Array.from([1, 2, 3]);

      mockGetKmsPublicKey.mockImplementation(() =>
        Promise.resolve(mockPublicKey)
      );

      // act
      const result = await getPublicKey('12dfbf31-c65e-4966-9010-3dfde426e8f4');

      // assert
      expect(result).toMatchObject({
        keyId: '12dfbf31-c65e-4966-9010-3dfde426e8f4',
        publicKey: mockPublicKey,
      });
    });

    test('should no-op specific KMS errors', async () => {
      // arrange
      const mockGetKmsPublicKey = jest.mocked(getKmsPublicKey);

      class TestError1 extends Error {}

      (jest.mocked(KMS_NO_OP_ERRORS) as Array<unknown>).push(TestError1);

      mockGetKmsPublicKey.mockImplementation(() =>
        Promise.reject(new TestError1('TEST'))
      );

      // act
      const result = await getPublicKey('12dfbf31-c65e-4966-9010-3dfde426e8f4');

      // assert
      expect(result).toMatchObject({
        keyId: '12dfbf31-c65e-4966-9010-3dfde426e8f4',
        publicKey: undefined,
      });
    });

    test('should propagate general errors', async () => {
      // arrange
      const mockGetKmsPublicKey = jest.mocked(getKmsPublicKey);

      mockGetKmsPublicKey.mockImplementation(() =>
        Promise.reject(new Error('TEST'))
      );

      // act
      let error;
      try {
        await getPublicKey('12dfbf31-c65e-4966-9010-3dfde426e8f4');
      } catch (caughtError) {
        error = caughtError;
      }

      // assert
      expect(error).toBeTruthy();
      expect((error as Error).message).toBe('TEST');
    });
  });
});
