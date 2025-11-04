import {
  findInternalUserIdentifier,
  retrieveInternalUser,
} from '@/src/utils/users-repository';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

jest.mock('@nhs-notify-iam-webauth/utils-logger', () => ({
  logger: {
    child: jest.fn().mockReturnThis(),
    error: jest.fn(),
  },
}));
jest.mock('@aws-sdk/client-dynamodb', () => ({
  ...jest.requireActual('@aws-sdk/client-dynamodb'),
}));
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  ...jest.requireActual('@aws-sdk/lib-dynamodb'),
}));

describe('users-repository', () => {
  const OLD_ENV = { ...process.env };

  beforeAll(() => {
    process.env.USERS_TABLE = 'UsersTable';
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('findInternalUserIdentifier', () => {
    test('should find internal user identifier', async () => {
      // arrange
      const userName = 'external-user-123';
      const internalUserId = 'internal-user-456';
      const mockExternalUserMapping = {
        PK: `EXTERNAL_USER#${userName}`,
        SK: `INTERNAL_USER#${internalUserId}`,
      };
      const mockDdbClient = jest.spyOn(
        DynamoDBDocumentClient.prototype,
        'send'
      );
      mockDdbClient.mockImplementation(() =>
        Promise.resolve({
          Items: [mockExternalUserMapping],
        })
      );

      // act
      const result = await findInternalUserIdentifier(userName);

      // assert
      expect(result).toBe(internalUserId);
      expect(mockDdbClient).toHaveBeenCalledTimes(1);
      expect(mockDdbClient).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            TableName: 'UsersTable',
            KeyConditionExpression: 'PK = :partitionKey',
            ExpressionAttributeValues: {
              ':partitionKey': `EXTERNAL_USER#${userName}`,
            },
          },
        })
      );
    });

    test('should handle no external mapping', async () => {
      // arrange
      const userName = 'external-user-123';
      const mockDdbClient = jest.spyOn(
        DynamoDBDocumentClient.prototype,
        'send'
      );
      mockDdbClient.mockImplementation(() => Promise.resolve({}));

      // act
      const result = await findInternalUserIdentifier(userName);

      // assert
      expect(result).toBeNull();
    });

    test('should reject multiple external mappings', async () => {
      // arrange
      const userName = 'external-user-123';
      const mockExternalUserMapping1 = {
        PK: `EXTERNAL_USER#${userName}`,
        SK: 'INTERNAL_USER#internal-user-123',
      };
      const mockExternalUserMapping2 = {
        PK: `EXTERNAL_USER#${userName}`,
        SK: 'INTERNAL_USER#internal-user-456',
      };
      const mockDdbClient = jest.spyOn(
        DynamoDBDocumentClient.prototype,
        'send'
      );
      mockDdbClient.mockImplementation(() =>
        Promise.resolve({
          Items: [mockExternalUserMapping1, mockExternalUserMapping2],
        })
      );

      // act/assert
      await expect(() => findInternalUserIdentifier(userName)).rejects.toThrow(
        'Multiple internal user identifiers found for external user external-user-123'
      );
    });
  });

  describe('retrieveInternalUser', () => {
    test('should retrieve internal user', async () => {
      // arrange
      const internalUserId = 'internal-user-456';
      const mockUser = {
        PK: `INTERNAL_USER#${internalUserId}`,
        SK: `CLIENT#client-789`,
        client_id: 'client-789',
      };
      const mockDdbClient = jest.spyOn(
        DynamoDBDocumentClient.prototype,
        'send'
      );
      mockDdbClient.mockImplementation(() =>
        Promise.resolve({
          Items: [mockUser],
        })
      );

      // act
      const result = await retrieveInternalUser(internalUserId);

      // assert
      expect(result).toEqual(mockUser);
      expect(mockDdbClient).toHaveBeenCalledTimes(1);
      expect(mockDdbClient).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            TableName: 'UsersTable',
            KeyConditionExpression: 'PK = :partitionKey',
            ExpressionAttributeValues: {
              ':partitionKey': `INTERNAL_USER#${internalUserId}`,
            },
          },
        })
      );
    });

    test('should handle data error (missing internal user)', async () => {
      // arrange
      const internalUserId = 'internal-user-456';
      const mockDdbClient = jest.spyOn(
        DynamoDBDocumentClient.prototype,
        'send'
      );
      mockDdbClient.mockImplementation(() => Promise.resolve({}));

      // act
      const result = await retrieveInternalUser(internalUserId);

      // assert
      expect(result).toBeNull();
    });

    test('should handle data error (multiple internal users)', async () => {
      // arrange
      const internalUserId = 'internal-user-456';
      const mockUser = {
        PK: `INTERNAL_USER#${internalUserId}`,
        SK: `CLIENT#client-789`,
        client_id: 'client-789',
      };
      const mockDdbClient = jest.spyOn(
        DynamoDBDocumentClient.prototype,
        'send'
      );
      mockDdbClient.mockImplementation(() =>
        Promise.resolve({
          Items: [mockUser, mockUser],
        })
      );

      // act
      const result = await retrieveInternalUser(internalUserId);

      // assert
      expect(result).toBeNull();
    });
  });
});
