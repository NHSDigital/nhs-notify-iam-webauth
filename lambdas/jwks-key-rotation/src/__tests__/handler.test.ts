import { handler } from '@/src/handler';
import { Context, EventBridgeEvent, Callback } from 'aws-lambda';
import {
  getKeyDirectory,
  SigningKeyDirectory,
  writeKeyDirectory,
} from '@/src/utils/key-directory-repository';
import { generateKey, getPublicKey } from '@/src/utils/key-util';
import { updateJwksFile } from '@/src/utils/jwks-util';
import { deleteKey } from '@/src/utils/aws/kms-util';

jest.mock('@/src/utils/key-directory-repository', () => ({
  ...jest.requireActual('@/src/utils/key-directory-repository'),
  getKeyDirectory: jest.fn(),
  writeKeyDirectory: jest.fn(),
}));
jest.mock('@/src/utils/key-util');
jest.mock('@/src/utils/jwks-util');
jest.mock('@/src/utils/aws/kms-util');

describe('handler', () => {
  describe('perform key rotation (generate new KMS key, update public jwks file, update key directory and delete old keys)', () => {
    test('should perform key rotation with no existing keys', async () => {
      // arrange
      const mockEvent = {} as EventBridgeEvent<'Scheduled Event', unknown>;
      const mockContext = {} as Context;
      const mockCallback = (() => {}) as Callback;
      const mockKeyDirectory: SigningKeyDirectory = [];
      const mockPublicKey = Uint8Array.from([1, 2, 3]);
      const todayFormatted = new Date().toISOString().split('T')[0];

      const mockedGetKeyDirectory = jest.mocked(getKeyDirectory);
      const mockedGenerateKey = jest.mocked(generateKey);
      const mockedGetPublicKey = jest.mocked(getPublicKey);
      const mockedWriteKeyDirectory = jest.mocked(writeKeyDirectory);

      mockedGetKeyDirectory.mockImplementation(() =>
        Promise.resolve(mockKeyDirectory)
      );
      mockedGenerateKey.mockImplementation(() =>
        Promise.resolve('new-test-key-id')
      );
      mockedGetPublicKey.mockImplementation((keyId) =>
        Promise.resolve({ keyId, publicKey: mockPublicKey })
      );

      // act
      await handler(mockEvent, mockContext, mockCallback);

      // assert
      expect(mockedGenerateKey).toHaveBeenCalled();
      expect(updateJwksFile).toHaveBeenCalledWith([
        { keyId: 'new-test-key-id', publicKey: mockPublicKey },
      ]);
      expect(mockedWriteKeyDirectory).toHaveBeenCalledWith([
        { createdDate: todayFormatted, kid: 'new-test-key-id' },
      ]);
      expect(deleteKey).not.toHaveBeenCalled();
    });

    test('should perform key rotation with one existing key', async () => {
      // arrange
      const mockEvent = {} as EventBridgeEvent<'Scheduled Event', unknown>;
      const mockContext = {} as Context;
      const mockCallback = (() => {}) as Callback;
      const startOfMonth = new Date();
      startOfMonth.setDate(1);

      const todayFormatted = new Date().toISOString().split('T')[0];
      const startOfMonthFormatted = startOfMonth.toISOString().split('T')[0];

      const mockKeyDirectory: SigningKeyDirectory = [
        {
          createdDate: startOfMonthFormatted,
          kid: '00000000-0000-0000-0000-000000000001',
        },
      ];
      const mockPublicKey = Uint8Array.from([1, 2, 3]);

      const mockedGetKeyDirectory = jest.mocked(getKeyDirectory);
      const mockedGenerateKey = jest.mocked(generateKey);
      const mockedGetPublicKey = jest.mocked(getPublicKey);
      const mockedWriteKeyDirectory = jest.mocked(writeKeyDirectory);

      mockedGetKeyDirectory.mockImplementation(() =>
        Promise.resolve(mockKeyDirectory)
      );
      mockedGenerateKey.mockImplementation(() =>
        Promise.resolve('new-test-key-id')
      );
      mockedGetPublicKey.mockImplementation((keyId) =>
        Promise.resolve({ keyId, publicKey: mockPublicKey })
      );

      // act
      await handler(mockEvent, mockContext, mockCallback);

      // assert
      expect(mockedGenerateKey).toHaveBeenCalled();
      expect(updateJwksFile).toHaveBeenCalledWith([
        {
          keyId: '00000000-0000-0000-0000-000000000001',
          publicKey: mockPublicKey,
        },
        { keyId: 'new-test-key-id', publicKey: mockPublicKey },
      ]);
      expect(mockedWriteKeyDirectory).toHaveBeenCalledWith([
        {
          createdDate: startOfMonthFormatted,
          kid: '00000000-0000-0000-0000-000000000001',
        },
        { createdDate: todayFormatted, kid: 'new-test-key-id' },
      ]);
      expect(deleteKey).not.toHaveBeenCalled();
    });

    test('should perform key rotation with two existing keys', async () => {
      // arrange
      const mockEvent = {} as EventBridgeEvent<'Scheduled Event', unknown>;
      const mockContext = {} as Context;
      const mockCallback = (() => {}) as Callback;
      const startOfMonth = new Date();
      startOfMonth.setDate(1);

      const startOfPreviousMonth = new Date(
        startOfMonth.getTime() - 25 * 60 * 60 * 1000
      );
      startOfPreviousMonth.setDate(1);
      const todayFormatted = new Date().toISOString().split('T')[0];
      const startOfMonthFormatted = startOfMonth.toISOString().split('T')[0];
      const startOfPreviousMonthFormatted = startOfPreviousMonth
        .toISOString()
        .split('T')[0];

      const mockKeyDirectory: SigningKeyDirectory = [
        {
          createdDate: startOfPreviousMonthFormatted,
          kid: '00000000-0000-0000-0000-000000000000',
        },
        {
          createdDate: startOfMonthFormatted,
          kid: '00000000-0000-0000-0000-000000000001',
        },
      ];
      const mockPublicKey = Uint8Array.from([1, 2, 3]);

      const mockedGetKeyDirectory = jest.mocked(getKeyDirectory);
      const mockedGenerateKey = jest.mocked(generateKey);
      const mockedGetPublicKey = jest.mocked(getPublicKey);
      const mockedWriteKeyDirectory = jest.mocked(writeKeyDirectory);

      mockedGetKeyDirectory.mockImplementation(() =>
        Promise.resolve(mockKeyDirectory)
      );
      mockedGenerateKey.mockImplementation(() =>
        Promise.resolve('new-test-key-id')
      );
      mockedGetPublicKey.mockImplementation((keyId) =>
        Promise.resolve({ keyId, publicKey: mockPublicKey })
      );

      // act
      await handler(mockEvent, mockContext, mockCallback);

      // assert
      expect(mockedGenerateKey).toHaveBeenCalled();
      expect(updateJwksFile).toHaveBeenCalledWith([
        {
          keyId: '00000000-0000-0000-0000-000000000001',
          publicKey: mockPublicKey,
        },
        { keyId: 'new-test-key-id', publicKey: mockPublicKey },
      ]);
      expect(mockedWriteKeyDirectory).toHaveBeenCalledWith([
        {
          createdDate: startOfMonthFormatted,
          kid: '00000000-0000-0000-0000-000000000001',
        },
        { createdDate: todayFormatted, kid: 'new-test-key-id' },
      ]);
      expect(deleteKey).toHaveBeenCalledTimes(1);
      expect(deleteKey).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000000'
      );
    });
  });
});
