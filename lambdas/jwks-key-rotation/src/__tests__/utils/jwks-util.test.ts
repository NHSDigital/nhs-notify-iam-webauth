import { readFileSync } from 'node:fs';
import { updateJwksFile } from '../../utils/jwks-util';
import { writeJsonToFile } from '@/src/utils/aws/s3-util';

jest.mock('@/src/utils/aws/s3-util');

const TEST_PUBLIC_KEY_FILE_1 = 'src/__tests__/utils/test-public-key-1.der';
const TEST_PUBLIC_KEY_FILE_2 = 'src/__tests__/utils/test-public-key-2.der';
const TEST_JWKS_FILE = 'src/__tests__/utils/test-public-key.jwks';
const MOCK_BUCKET_NAME =
  'nhs-notify-000000000000-eu-west-2-abcd12-sbx-public-keys';

describe('jwks-util', () => {
  describe('updateJwksFile', () => {
    const OLD_ENV = { ...process.env };
    afterAll(() => {
      process.env = OLD_ENV;
    });

    test('should generate jwks format public key', async () => {
      // arrange
      const fileWriteMock = jest.mocked(writeJsonToFile);

      const publicKey1 = readFileSync(TEST_PUBLIC_KEY_FILE_1);
      const publicKey2 = readFileSync(TEST_PUBLIC_KEY_FILE_2);
      const expectedJwks = JSON.stringify(
        JSON.parse(readFileSync(TEST_JWKS_FILE).toString('utf8'))
      );
      process.env.S3_PUBLIC_KEYS_BUCKET_NAME = MOCK_BUCKET_NAME;

      // act
      await updateJwksFile([
        {
          keyId: 'test-key-id-1',
          publicKey: publicKey1,
        },
        {
          keyId: 'test-key-id-2',
          publicKey: publicKey2,
        },
      ]);

      // assert
      expect(fileWriteMock).toHaveBeenCalledWith(
        'jwks',
        expectedJwks,
        MOCK_BUCKET_NAME
      );
    });
  });
});
