import handler from '@/src/post-confirmation';
import { PostConfirmationTriggerEvent } from 'aws-lambda';
import { findInternalUserIdentifier } from '@/src/utils/users-repository';
import { populateInternalUserId } from '@/src/utils/cognito-customisation-util';

jest.mock('@nhs-notify-iam-webauth/utils-logger', () => ({
  logger: {
    info: jest.fn(),
    child: jest.fn().mockReturnThis(),
  },
}));
jest.mock('@/src/utils/cognito-customisation-util');
jest.mock('@/src/utils/users-repository');

describe('post-confirmation', () => {
  test('should populate internal user identifier custom Cognito attribute for user with external user mapping', async () => {
    // arrange
    const event = {
      userName: 'test-user',
      userPoolId: 'test-user-pool-id',
    } as PostConfirmationTriggerEvent;

    jest
      .mocked(findInternalUserIdentifier)
      .mockResolvedValue('internal-user-id-123');

    // act
    const result = await handler(event);

    // assert
    expect(result).toBe(event);
    expect(findInternalUserIdentifier).toHaveBeenCalledWith('test-user');
    expect(populateInternalUserId).toHaveBeenCalledWith(
      'test-user',
      'internal-user-id-123',
      'test-user-pool-id'
    );
  });

  test('should handle user without external user mapping', async () => {
    // arrange
    const event = {
      userName: 'test-user',
      userPoolId: 'test-user-pool-id',
    } as PostConfirmationTriggerEvent;

    jest.mocked(findInternalUserIdentifier).mockResolvedValue(null);

    // act
    const result = await handler(event);

    // assert
    expect(result).toBe(event);
    expect(populateInternalUserId).not.toHaveBeenCalled();
  });
});
