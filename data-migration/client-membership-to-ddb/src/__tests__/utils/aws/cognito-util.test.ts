import {
  deleteEmptyClientGroups,
  discoverUserPoolId,
  populateInternalUserId,
  removeUserFromGroup,
  retrieveUserGroups,
  retrieveUsers,
} from '@/src/utils/aws/cognito-util';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';

jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  ...jest.requireActual('@aws-sdk/client-cognito-identity-provider'),
}));
jest.mock('@/src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
  },
}));

describe('cognito-util', () => {
  describe('discoverUserPoolId', () => {
    test('should discover user pool ID by name', async () => {
      // arrange
      const listUserPoolsSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'listUserPools'
      );
      listUserPoolsSpy
        .mockImplementationOnce(() => ({
          UserPools: [
            { Id: 'eu-west-2_ABC123', Name: 'nhs-notify-test1-app' },
            { Id: 'eu-west-2_DEF456', Name: 'nhs-notify-test2-app' },
          ],
          NextToken: 'page2',
        }))
        .mockImplementationOnce(() => ({
          UserPools: [
            { Id: 'eu-west-2_GHI789', Name: 'nhs-notify-test3-app' },
            { Id: 'eu-west-2_JKL012', Name: 'nhs-notify-test4-app' },
          ],
          NextToken: 'page3',
        }))
        .mockImplementationOnce(() => ({}));

      // act
      const result = await discoverUserPoolId('test3');

      // assert
      expect(result).toBe('eu-west-2_GHI789');
      expect(listUserPoolsSpy).toHaveBeenCalledTimes(3);
      expect(listUserPoolsSpy).toHaveBeenNthCalledWith(1, {
        MaxResults: 60,
        NextToken: undefined,
      });
      expect(listUserPoolsSpy).toHaveBeenNthCalledWith(2, {
        MaxResults: 60,
        NextToken: 'page2',
      });
      expect(listUserPoolsSpy).toHaveBeenNthCalledWith(3, {
        MaxResults: 60,
        NextToken: 'page3',
      });
    });

    test('should throw error if user pool not found', async () => {
      // arrange
      const listUserPoolsSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'listUserPools'
      );
      listUserPoolsSpy.mockImplementation(() => ({
        UserPools: [
          { Id: 'eu-west-2_ABC123', Name: 'nhs-notify-test1-app' },
          { Id: 'eu-west-2_DEF456', Name: 'nhs-notify-test2-app' },
        ],
        NextToken: undefined,
      }));

      // act
      let caughtError;
      try {
        await discoverUserPoolId('nonexistent');
      } catch (error) {
        caughtError = error;
      }

      // assert
      expect(caughtError).toBeTruthy();
      expect((caughtError as Error).message).toBe(
        'User pool nhs-notify-nonexistent-app not found'
      );
    });
  });

  describe('retrieveUsers', () => {
    test('should retrieve users from user pool', async () => {
      // arrange
      const listUsersSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'listUsers'
      );
      listUsersSpy
        .mockImplementationOnce(() => ({
          Users: [{ Username: 'user1' }, { Username: 'user2' }],
          PaginationToken: 'page2',
        }))
        .mockImplementationOnce(() => ({
          Users: [{ Username: 'user3' }],
          PaginationToken: 'page3',
        }))
        .mockImplementationOnce(() => ({}));

      // act
      const result = await retrieveUsers('eu-west-2_ABC123');

      // assert
      expect(result.map((u) => u.Username)).toEqual([
        'user1',
        'user2',
        'user3',
      ]);
      expect(listUsersSpy).toHaveBeenCalledTimes(3);
      expect(listUsersSpy).toHaveBeenNthCalledWith(1, {
        UserPoolId: 'eu-west-2_ABC123',
        PaginationToken: undefined,
        Limit: 60,
      });
      expect(listUsersSpy).toHaveBeenNthCalledWith(2, {
        UserPoolId: 'eu-west-2_ABC123',
        PaginationToken: 'page2',
        Limit: 60,
      });
      expect(listUsersSpy).toHaveBeenNthCalledWith(3, {
        UserPoolId: 'eu-west-2_ABC123',
        PaginationToken: 'page3',
        Limit: 60,
      });
    });
  });

  describe('retrieveUserGroups', () => {
    test('should retrieve user groups for users', async () => {
      // arrange
      const adminListGroupsForUserSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'adminListGroupsForUser'
      );
      adminListGroupsForUserSpy
        .mockImplementationOnce(() => ({
          Groups: [{ GroupName: 'group1' }, { GroupName: 'group2' }],
        }))
        .mockImplementationOnce(() => ({
          Groups: [{ GroupName: 'group2' }, { GroupName: 'group3' }],
        }))
        .mockImplementationOnce(() => ({}));

      const users = [
        { Username: 'user1' },
        { Username: 'user2' },
        { Username: 'user3' },
      ];

      // act
      const result = await retrieveUserGroups(users, 'eu-west-2_ABC123');

      // assert
      expect(result).toEqual([
        { user: { Username: 'user1' }, groups: ['group1', 'group2'] },
        { user: { Username: 'user2' }, groups: ['group2', 'group3'] },
        { user: { Username: 'user3' }, groups: [] },
      ]);
      expect(adminListGroupsForUserSpy).toHaveBeenCalledTimes(3);
      expect(adminListGroupsForUserSpy).toHaveBeenNthCalledWith(1, {
        UserPoolId: 'eu-west-2_ABC123',
        Username: 'user1',
      });
      expect(adminListGroupsForUserSpy).toHaveBeenNthCalledWith(2, {
        UserPoolId: 'eu-west-2_ABC123',
        Username: 'user2',
      });
      expect(adminListGroupsForUserSpy).toHaveBeenNthCalledWith(3, {
        UserPoolId: 'eu-west-2_ABC123',
        Username: 'user3',
      });
    });
  });

  describe('populateInternalUserId', () => {
    test('should update user with internal user ID', async () => {
      // arrange
      const adminUpdateUserAttributesSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'adminUpdateUserAttributes'
      );
      adminUpdateUserAttributesSpy.mockImplementation(() => ({}));

      // act
      await populateInternalUserId(
        'user1',
        'internal-123',
        'eu-west-2_ABC123',
        false
      );

      // assert
      expect(adminUpdateUserAttributesSpy).toHaveBeenCalledWith({
        UserPoolId: 'eu-west-2_ABC123',
        Username: 'user1',
        UserAttributes: [
          {
            Name: 'custom:nhs_notify_user_id',
            Value: 'internal-123',
          },
        ],
      });
    });

    test('should log action in dry run mode', async () => {
      // act
      await populateInternalUserId(
        'user1',
        'internal-123',
        'eu-west-2_ABC123',
        true
      );

      // assert
      expect(
        CognitoIdentityProvider.prototype.adminUpdateUserAttributes
      ).not.toHaveBeenCalled();
    });
  });

  describe('removeUserFromGroup', () => {
    test('should remove user from group', async () => {
      // arrange
      const adminRemoveUserFromGroupSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'adminRemoveUserFromGroup'
      );
      adminRemoveUserFromGroupSpy.mockImplementation(() => ({}));

      // act
      await removeUserFromGroup('eu-west-2_ABC123', 'user1', 'group1', false);

      // assert
      expect(adminRemoveUserFromGroupSpy).toHaveBeenCalledWith({
        UserPoolId: 'eu-west-2_ABC123',
        Username: 'user1',
        GroupName: 'group1',
      });
    });

    test('should log action in dry run mode', async () => {
      // act
      await removeUserFromGroup('eu-west-2_ABC123', 'user1', 'group1', true);

      // assert
      expect(
        CognitoIdentityProvider.prototype.adminRemoveUserFromGroup
      ).not.toHaveBeenCalled();
    });
  });

  describe('deleteEmptyClientGroups', () => {
    test('should delete empty client groups', async () => {
      // arrange
      const listGroupsSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'listGroups'
      );
      listGroupsSpy.mockImplementation(() => ({
        Groups: [
          { GroupName: 'client:group1' },
          { GroupName: 'client:group2' },
          { GroupName: 'other-group' },
        ],
      }));

      const listUsersInGroupSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'listUsersInGroup'
      );
      listUsersInGroupSpy
        .mockImplementationOnce(() => ({
          Users: [],
        }))
        .mockImplementationOnce(() => ({
          Users: [{ Username: 'user1' }],
        }));

      const deleteGroupSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'deleteGroup'
      );
      deleteGroupSpy.mockImplementation(() => ({}));

      // act
      await deleteEmptyClientGroups('eu-west-2_ABC123', false);

      // assert
      expect(listGroupsSpy).toHaveBeenCalledWith({
        UserPoolId: 'eu-west-2_ABC123',
      });
      expect(listUsersInGroupSpy).toHaveBeenCalledTimes(2);
      expect(listUsersInGroupSpy).toHaveBeenNthCalledWith(1, {
        UserPoolId: 'eu-west-2_ABC123',
        GroupName: 'client:group1',
      });
      expect(listUsersInGroupSpy).toHaveBeenNthCalledWith(2, {
        UserPoolId: 'eu-west-2_ABC123',
        GroupName: 'client:group2',
      });
      expect(deleteGroupSpy).toHaveBeenCalledWith({
        UserPoolId: 'eu-west-2_ABC123',
        GroupName: 'client:group1',
      });
    });

    test('should handle absent client groups', async () => {
      // arrange
      const listGroupsSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'listGroups'
      );
      listGroupsSpy.mockImplementation(() => ({}));

      // act
      await deleteEmptyClientGroups('eu-west-2_ABC123', false);

      // assert
      expect(listGroupsSpy).toHaveBeenCalledWith({
        UserPoolId: 'eu-west-2_ABC123',
      });
    });

    test('should handle absent users', async () => {
      // arrange
      const listGroupsSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'listGroups'
      );
      listGroupsSpy.mockImplementation(() => ({
        Groups: [{ GroupName: 'client:group1' }],
      }));

      const listUsersInGroupSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'listUsersInGroup'
      );
      listUsersInGroupSpy.mockImplementationOnce(() => ({}));

      const deleteGroupSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'deleteGroup'
      );
      deleteGroupSpy.mockImplementation(() => ({}));

      // act
      await deleteEmptyClientGroups('eu-west-2_ABC123', false);

      // assert
      expect(deleteGroupSpy).toHaveBeenCalledWith({
        UserPoolId: 'eu-west-2_ABC123',
        GroupName: 'client:group1',
      });
    });

    test('should log actions in dry run mode', async () => {
      // arrange
      const listGroupsSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'listGroups'
      );
      listGroupsSpy.mockImplementation(() => ({
        Groups: [{ GroupName: 'client:group1' }],
      }));

      const listUsersInGroupSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'listUsersInGroup'
      );
      listUsersInGroupSpy.mockImplementationOnce(() => ({
        Users: [],
      }));

      const deleteGroupSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'deleteGroup'
      );
      deleteGroupSpy.mockImplementation(() => ({}));

      // act
      await deleteEmptyClientGroups('eu-west-2_ABC123', true);

      // assert
      expect(deleteGroupSpy).not.toHaveBeenCalled();
    });
  });
});
