import {
  filterKeyDirectoryToActiveKeys,
  getKeyDirectory,
  writeKeyDirectory,
} from '@/src/utils/key-directory-repository';
import { getParameter, putParameter } from '@/src/utils/aws/ssm-util';
import { getKeyState } from '@/src/utils/aws/kms-util';
import { KeyState } from '@aws-sdk/client-kms';

jest.mock('@/src/utils/aws/ssm-util');
jest.mock('@/src/utils/logger');
jest.mock('@/src/utils/aws/kms-util');

const mockKeyDirectory = [
  { createdDate: '2025-04-01', kid: '00000000-0000-0000-0000-000000000000' },
  { createdDate: '2025-05-01', kid: '00000000-0000-0000-0000-000000000001' },
  { createdDate: '2025-06-01', kid: '00000000-0000-0000-0000-000000000002' },
];

describe('key-directory-repository', () => {
  const OLD_ENV = { ...process.env };
  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('getKeyDirectory', () => {
    test('should get key directory from SSM', async () => {
      // arrange
      const mockKeyDirectorySsm = '/nhs-notify-abcd12-sbx-psk/key_directory';
      process.env.SSM_KEY_DIRECTORY_NAME = mockKeyDirectorySsm;
      const mockGetParameter = jest.mocked(getParameter);
      mockGetParameter.mockImplementation(() =>
        Promise.resolve({
          $metadata: {},
          Parameter: {
            Value: JSON.stringify(mockKeyDirectory),
          },
        })
      );

      // act
      const result = await getKeyDirectory();

      // assert
      expect(result).toMatchObject(mockKeyDirectory);
      expect(mockGetParameter.mock.lastCall?.[0]).toBe(mockKeyDirectorySsm);
    });

    test('should handle empty parameter', async () => {
      // arrange
      const mockGetParameter = jest.mocked(getParameter);
      mockGetParameter.mockImplementation(() =>
        Promise.resolve({
          $metadata: {},
        })
      );

      // act
      const result = await getKeyDirectory();

      // assert
      expect(result).toMatchObject([]);
    });

    test('should propagate parsing errors', async () => {
      // arrange
      const mockGetParameter = jest.mocked(getParameter);
      mockGetParameter.mockImplementation(() =>
        Promise.resolve({
          $metadata: {},
          Parameter: {
            Value: '[{"a":"b"}]',
          },
        })
      );

      // act
      let error;
      try {
        await getKeyDirectory();
      } catch (caughtError) {
        error = caughtError;
      }

      // assert
      expect(error).toBeTruthy();
      expect((error as Error).message).toBe('Failed to parse key directory');
    });
  });

  describe('writeKeyDirectory', () => {
    test('should store key directory to SSM', async () => {
      // arrange
      const MOCK_KEY_DIRECTORY_SSM = '/nhs-notify-abcd12-sbx-psk/key_directory';
      const mockPutParameter = jest.mocked(putParameter);
      process.env.SSM_KEY_DIRECTORY_NAME = MOCK_KEY_DIRECTORY_SSM;

      // act
      await writeKeyDirectory(mockKeyDirectory);

      // assert
      expect(mockPutParameter).toHaveBeenCalledWith(
        JSON.stringify(mockKeyDirectory),
        MOCK_KEY_DIRECTORY_SSM
      );
    });
  });

  describe('filterKeyDirectoryToActiveKeys', () => {
    test('should filter key directory to retain only active keys', async () => {
      // arrange
      const mockGetKeyState = jest.mocked(getKeyState);

      mockGetKeyState
        .mockImplementationOnce(() =>
          Promise.resolve({
            keyId: mockKeyDirectory[0].kid,
            keyState: KeyState.Enabled,
          })
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            keyId: mockKeyDirectory[1].kid,
            keyState: KeyState.PendingDeletion,
          })
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            keyId: mockKeyDirectory[2].kid,
            keyState: KeyState.Unavailable,
          })
        );

      // act
      const result = await filterKeyDirectoryToActiveKeys(mockKeyDirectory);

      // assert
      expect(result).toEqual([mockKeyDirectory[0]]);
    });
  });
});
