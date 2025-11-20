import {
  createUser,
  findInternalUserIdentifier,
} from '@/src/utils/users-repository';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

jest.mock('@aws-sdk/client-dynamodb', () => ({
  ...jest.requireActual('@aws-sdk/client-dynamodb'),
}));
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  ...jest.requireActual('@aws-sdk/lib-dynamodb'),
  DynamoDBClient: jest.fn(),
}));
jest.mock('@/src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
  },
}));

describe('users-repository', () => {
  describe('findInternalUserIdentifier', () => {
    test('should find internal user identifier', async () => {
      // arrange
      const querySpy = jest.spyOn(DynamoDBDocumentClient.prototype, 'send');
      querySpy.mockImplementationOnce(() => ({
        Items: [
          {
            PK: 'EXTERNAL_USER#external-user-123',
            SK: 'INTERNAL_USER#internal-user-456',
          },
        ],
      }));

      // act
      const result = await findInternalUserIdentifier(
        'external-user-123',
        'main'
      );

      // assert
      expect(result).toBe('internal-user-456');
      expect(querySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            TableName: 'nhs-notify-main-app-users',
            KeyConditionExpression: 'PK = :partitionKey',
            ExpressionAttributeValues: {
              ':partitionKey': 'EXTERNAL_USER#external-user-123',
            },
          },
        })
      );
    });

    test('should return null if no internal user identifier found', async () => {
      // arrange
      const querySpy = jest.spyOn(DynamoDBDocumentClient.prototype, 'send');
      querySpy.mockImplementationOnce(() => ({}));

      // act
      const result = await findInternalUserIdentifier(
        'external-user-123',
        'main'
      );

      // assert
      expect(result).toBeFalsy();
    });

    test('should throw error if multiple internal user identifiers found', async () => {
      // arrange
      const querySpy = jest.spyOn(DynamoDBDocumentClient.prototype, 'send');
      querySpy.mockImplementationOnce(() => ({
        Items: [
          {
            PK: 'EXTERNAL_USER#external-user-123',
            SK: 'INTERNAL_USER#internal-user-456',
          },
          {
            PK: 'EXTERNAL_USER#external-user-123',
            SK: 'INTERNAL_USER#internal-user-789',
          },
        ],
      }));

      // act/assert
      await expect(
        findInternalUserIdentifier('external-user-123', 'main')
      ).rejects.toThrow(
        'Multiple internal user identifiers found for external user external-user-123'
      );
    });
  });

  describe('createUser', () => {
    test('should create user records in DynamoDB', async () => {
      // arrange
      const transactWriteSpy = jest.spyOn(
        DynamoDBDocumentClient.prototype,
        'send'
      );
      transactWriteSpy.mockImplementationOnce(() => ({}));

      // act
      const internalUserId = await createUser(
        'external-user-123',
        'client-abc',
        'main',
        false
      );

      // assert
      expect(internalUserId).toMatch(/^[0-9a-fA-F-]{36}$/);
      const internalUserPutRequest = {
        Put: expect.objectContaining({
          TableName: 'nhs-notify-main-app-users',
          Item: expect.objectContaining({
            PK: expect.objectContaining({
              S: `INTERNAL_USER#${internalUserId}`,
            }),
            SK: { S: 'CLIENT#client-abc' },
            client_id: { S: 'client-abc' },
          }),
        }),
      };
      const externalUserPutRequest = {
        Put: expect.objectContaining({
          TableName: 'nhs-notify-main-app-users',
          Item: expect.objectContaining({
            PK: { S: 'EXTERNAL_USER#external-user-123' },
            SK: expect.objectContaining({
              S: `INTERNAL_USER#${internalUserId}`,
            }),
          }),
        }),
      };
      expect(transactWriteSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TransactItems: expect.arrayContaining([
              expect.objectContaining(internalUserPutRequest),
              expect.objectContaining(externalUserPutRequest),
            ]),
          }),
        })
      );
    });

    test('should not create user records in dry run mode', async () => {
      // arrange
      const transactWriteSpy = jest.spyOn(
        DynamoDBDocumentClient.prototype,
        'send'
      );
      transactWriteSpy.mockImplementationOnce(() => ({}));

      // act
      const internalUserId = await createUser(
        'external-user-123',
        'client-abc',
        'main',
        true
      );

      // assert
      expect(internalUserId).toMatch(/^[0-9a-fA-F-]{36}$/);
      expect(transactWriteSpy).not.toHaveBeenCalled();
    });
  });
});
