import { getParameter } from '@/src/utils/aws/ssm-util';
import { generateKey } from '@/src/utils/key-util';
import { getKeyTags } from '@/src/utils/aws/tag-util';
import { createKmsKey } from '@/src/utils/aws/kms-util';

jest.mock('@/src/utils/logger');
jest.mock('@/src/utils/aws/ssm-util');
jest.mock('@/src/utils/aws/tag-util');
jest.mock('@/src/utils/aws/kms-util');

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

      // act
      const result = await generateKey();

      // assert
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
  });
});
