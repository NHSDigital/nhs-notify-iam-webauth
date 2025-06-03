import { getParameter } from '@/src/utils/aws/ssm-util';
import {
  getKmsSigningKeyId,
  SigningKeyDirectory,
  SigningKeyMetaData,
} from '@/src/utils/key-directory-repository';

jest.mock('@/src/utils/aws/ssm-util');
jest.mock('@/src/utils/logger');

describe('key-directory-repository', () => {
  describe('getKmsSigningKeyId', () => {
    const OLD_ENV = { ...process.env };
    afterAll(() => {
      process.env = OLD_ENV;
    });

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-06-03 09:00:00'));
      jest.resetAllMocks();
    });

    const mockFutureKey: SigningKeyMetaData = {
      kid: 'mockFutureKey',
      createdDate: '2025-06-03',
    };

    const mockAltFutureKey: SigningKeyMetaData = {
      kid: 'mockAltFutureKey',
      createdDate: '2025-06-04',
    };

    const mockCurrentKey: SigningKeyMetaData = {
      kid: 'mockCurrentKey',
      createdDate: '2025-06-02',
    };

    const mockAltCurrentKey: SigningKeyMetaData = {
      kid: 'mockAltCurrentKey',
      createdDate: '2025-06-02',
    };

    const mockDeprecatedKey: SigningKeyMetaData = {
      kid: 'mockDeprecatedKey',
      createdDate: '2025-05-03',
    };

    test('should get only KMS signing key', async () => {
      // arrange
      process.env.SSM_KEY_DIRECTORY_NAME = '/test/key-directory';

      const mockKeyDirectory: SigningKeyDirectory = [mockCurrentKey];

      const mockedGetParameter = jest
        .mocked(getParameter)
        .mockImplementation(() =>
          Promise.resolve(JSON.stringify(mockKeyDirectory))
        );

      // act
      const result = await getKmsSigningKeyId();

      // assert
      expect(result).toBe('mockCurrentKey');
      expect(mockedGetParameter).toHaveBeenCalledWith('/test/key-directory');
    });

    test('should get only KMS signing key even when recent', async () => {
      // arrange
      process.env.SSM_KEY_DIRECTORY_NAME = '/test/key-directory';

      const mockKeyDirectory: SigningKeyDirectory = [mockFutureKey];

      jest
        .mocked(getParameter)
        .mockImplementation(() =>
          Promise.resolve(JSON.stringify(mockKeyDirectory))
        );

      // act
      const result = await getKmsSigningKeyId();

      // assert
      expect(result).toBe('mockFutureKey');
    });

    test('should pick deterministically when created dates are the same', async () => {
      // arrange
      process.env.SSM_KEY_DIRECTORY_NAME = '/test/key-directory';

      const mockKeyDirectory: SigningKeyDirectory = [
        mockCurrentKey,
        mockAltCurrentKey,
      ];

      jest
        .mocked(getParameter)
        .mockImplementation(() =>
          Promise.resolve(JSON.stringify(mockKeyDirectory))
        );

      // act
      const result = await getKmsSigningKeyId();

      // assert
      expect(result).toBe('mockCurrentKey');
    });

    test('should get latest KMS signing key from choice of current and deprecated', async () => {
      // arrange
      process.env.SSM_KEY_DIRECTORY_NAME = '/test/key-directory';

      const mockKeyDirectory: SigningKeyDirectory = [
        mockDeprecatedKey,
        mockCurrentKey,
      ];

      jest
        .mocked(getParameter)
        .mockImplementation(() =>
          Promise.resolve(JSON.stringify(mockKeyDirectory))
        );

      // act
      const result = await getKmsSigningKeyId();

      // assert
      expect(result).toBe('mockCurrentKey');
    });

    test('should get latest KMS signing key outside cooling off period from choice of brand new, current and deprecated', async () => {
      // arrange
      process.env.SSM_KEY_DIRECTORY_NAME = '/test/key-directory';

      const mockKeyDirectory: SigningKeyDirectory = [
        mockDeprecatedKey,
        mockCurrentKey,
        mockFutureKey,
      ];

      jest
        .mocked(getParameter)
        .mockImplementation(() =>
          Promise.resolve(JSON.stringify(mockKeyDirectory))
        );

      // act
      const result = await getKmsSigningKeyId();

      // assert
      expect(result).toBe('mockCurrentKey');
    });

    test('should fallback to future key when no option', async () => {
      // arrange
      process.env.SSM_KEY_DIRECTORY_NAME = '/test/key-directory';

      const mockKeyDirectory: SigningKeyDirectory = [
        mockFutureKey,
        mockAltFutureKey,
      ];

      jest
        .mocked(getParameter)
        .mockImplementation(() =>
          Promise.resolve(JSON.stringify(mockKeyDirectory))
        );

      // act
      const result = await getKmsSigningKeyId();

      // assert
      expect(result).toBe('mockFutureKey');
    });

    test('should propogate missing key error', async () => {
      // arrange
      process.env.SSM_KEY_DIRECTORY_NAME = '/test/key-directory';

      const mockKeyDirectory: SigningKeyDirectory = [];

      jest
        .mocked(getParameter)
        .mockImplementation(() =>
          Promise.resolve(JSON.stringify(mockKeyDirectory))
        );

      // act
      let caughtError;
      try {
        await getKmsSigningKeyId();
      } catch (error) {
        caughtError = error;
      }

      // assert
      expect(caughtError).toBeTruthy();
      expect((caughtError as Error).message).toBe('Empty key directory');
    });

    test('should handle missing SSM value', async () => {
      // arrange
      process.env.SSM_KEY_DIRECTORY_NAME = '/test/key-directory';

      jest
        .mocked(getParameter)
        .mockImplementation(() =>
          Promise.resolve(undefined as unknown as string)
        );

      // act
      let caughtError;
      try {
        await getKmsSigningKeyId();
      } catch (error) {
        caughtError = error;
      }

      // assert
      expect(caughtError).toBeTruthy();
      expect((caughtError as Error).message).toBe('Empty key directory');
    });

    test('should propogate invalid key directory error', async () => {
      // arrange
      process.env.SSM_KEY_DIRECTORY_NAME = '/test/key-directory';

      jest
        .mocked(getParameter)
        .mockImplementation(() =>
          Promise.resolve(JSON.stringify({ not: 'valid' }))
        );

      // act
      let caughtError;
      try {
        await getKmsSigningKeyId();
      } catch (error) {
        caughtError = error;
      }

      // assert
      expect(caughtError).toBeTruthy();
      expect((caughtError as Error).message).toBe('Failed to parse key directory');
    });
  });
});
