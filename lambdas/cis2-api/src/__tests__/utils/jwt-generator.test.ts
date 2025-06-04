import { getPayloadSignature } from '@/src/utils/aws/kms-util';
import { generateJwt } from '@/src/utils/jwt-generator';
import { readFileSync } from 'node:fs';

const TEST_JWT = 'src/__tests__/utils/test-jwt.txt.bin';

jest.mock('@/src/utils/aws/kms-util');
jest.mock('node:crypto', () => ({
  randomUUID: () => '00000000-0000-0000-0000-000000000000',
}));

describe('jwt-generator', () => {
  describe('generateJwt', () => {
    const OLD_ENV = { ...process.env };
    afterAll(() => {
      process.env = OLD_ENV;
    });

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-06-03 09:00:00.000Z'));
      jest.resetAllMocks();
    });

    test('should generate JWT', async () => {
      // arrange
      process.env.CIS2_URL = 'https://mock-cis2-service.nhs.uk/oidc';
      const mockSignature = Buffer.from('mock-signature', 'utf8').toString(
        'base64url'
      );
      const expectedJwt = readFileSync(TEST_JWT).toString('utf8');

      jest
        .mocked(getPayloadSignature)
        .mockImplementation(() => Promise.resolve(mockSignature));

      // act
      const result = await generateJwt('test-key-id', 'test-client-id');

      // assert
      expect(result).toBe(expectedJwt);
    });
  });
});
