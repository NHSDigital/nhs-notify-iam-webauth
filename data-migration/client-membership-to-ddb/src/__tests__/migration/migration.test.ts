import { runMigration } from '@/src/migration/migration';
import {
  deleteEmptyClientGroups,
  discoverUserPoolId,
  populateInternalUserId,
  removeUserFromGroup,
  retrieveUserGroups,
  retrieveUsers,
} from '@/src/utils/aws/cognito-util';
import {
  createUser,
  findInternalUserIdentifier,
} from '@/src/utils/users-repository';

jest.mock('@/src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/src/utils/aws/cognito-util', () => ({
  discoverUserPoolId: jest.fn(),
  retrieveUsers: jest.fn(),
  retrieveUserGroups: jest.fn(),
  populateInternalUserId: jest.fn(),
  removeUserFromGroup: jest.fn(),
  deleteEmptyClientGroups: jest.fn(),
  INTERNAL_ID_ATTRIBUTE: jest.requireActual('@/src/utils/aws/cognito-util')
    .INTERNAL_ID_ATTRIBUTE,
}));

jest.mock('@/src/utils/backup-util', () => ({
  backupDataToS3: jest.fn(),
}));

jest.mock('@/src/utils/users-repository', () => ({
  findInternalUserIdentifier: jest.fn(),
  createUser: jest.fn(),
}));

const mockParseSync = jest.fn();

// eslint-disable-next-line unicorn/consistent-function-scoping
jest.mock('yargs', () => () => ({
  options: jest.fn().mockReturnThis(),
  parseSync: mockParseSync,
}));

jest.mock('yargs/helpers', () => ({
  hideBin: jest.fn(),
}));

describe('migration', () => {
  test('should run migration', async () => {
    // arrange
    mockParseSync.mockImplementationOnce(() => ({
      env: 'test',
      dryRun: false,
    }));

    const mockUsers = {
      user1: { Username: 'user1', Attributes: [] }, // CIS2 user, not yet migrated
      user2: { Username: 'user2', Attributes: [] }, // Cognito user, not yet migrated
      user3: {
        Username: 'user3',
        Attributes: [
          { Name: 'custom:nhs_notify_user_id', Value: 'internal-user-789' },
        ],
      }, // Already migrated user
      user4: { Username: 'user4', Attributes: [] }, // User with multiple client IDs
      user5: { Username: 'user5', Attributes: [] }, // User with existing external mapping
      user6: { Username: 'user6', Attributes: [] }, // User with no client groups
      user7: { Username: 'user7' }, // User missing atttribues
    };

    jest.mocked(discoverUserPoolId).mockResolvedValue('eu-west-2_ABC123');
    jest
      .mocked(retrieveUsers)
      .mockResolvedValue([
        mockUsers.user1,
        mockUsers.user2,
        mockUsers.user3,
        mockUsers.user4,
        mockUsers.user5,
        mockUsers.user6,
        mockUsers.user7,
      ]);
    jest.mocked(retrieveUserGroups).mockResolvedValue([
      { user: mockUsers.user1, groups: ['client:client1'] },
      { user: mockUsers.user2, groups: ['client:client2'] },
      { user: mockUsers.user3, groups: ['client:client2'] },
      { user: mockUsers.user4, groups: ['client:client1', 'client:client2'] },
      { user: mockUsers.user5, groups: ['client:client6'] },
      { user: mockUsers.user6, groups: [] },
      { user: mockUsers.user7, groups: ['client:client1'] },
    ]);
    jest
      .mocked(findInternalUserIdentifier)
      .mockImplementation(async (externalId: string) => {
        if (externalId === 'user5') {
          return 'internal-user-456';
        }
        return null;
      });
    jest.mocked(createUser).mockImplementation(async (username: string) => {
      return `internal-user-${username}`;
    });

    // act
    await runMigration();

    // assert
    expect(discoverUserPoolId).toHaveBeenCalledWith('test');
    expect(retrieveUsers).toHaveBeenCalledWith('eu-west-2_ABC123');
    expect(retrieveUserGroups).toHaveBeenCalledTimes(1);
    expect(retrieveUserGroups).toHaveBeenCalledWith(
      [
        { Username: 'user1', Attributes: [] },
        { Username: 'user2', Attributes: [] },
        {
          Username: 'user3',
          Attributes: [
            { Name: 'custom:nhs_notify_user_id', Value: 'internal-user-789' },
          ],
        },
        { Username: 'user4', Attributes: [] },
        { Username: 'user5', Attributes: [] },
        { Username: 'user6', Attributes: [] },
        { Username: 'user7' },
      ],
      'eu-west-2_ABC123'
    );
    expect(findInternalUserIdentifier).toHaveBeenCalledTimes(4);
    expect(findInternalUserIdentifier).toHaveBeenCalledWith('user1', 'test');
    expect(findInternalUserIdentifier).toHaveBeenCalledWith('user2', 'test');
    expect(findInternalUserIdentifier).toHaveBeenCalledWith('user5', 'test');
    expect(findInternalUserIdentifier).toHaveBeenCalledWith('user7', 'test');
    expect(createUser).toHaveBeenCalledTimes(3);
    expect(createUser).toHaveBeenNthCalledWith(
      1,
      'user1',
      'client1',
      'test',
      false
    );
    expect(createUser).toHaveBeenNthCalledWith(
      2,
      'user2',
      'client2',
      'test',
      false
    );
    expect(createUser).toHaveBeenNthCalledWith(
      3,
      'user7',
      'client1',
      'test',
      false
    );
    expect(jest.mocked(populateInternalUserId).mock.calls.length).toBe(3);
    expect(jest.mocked(populateInternalUserId).mock.calls[0]).toEqual([
      'user1',
      'internal-user-user1',
      'eu-west-2_ABC123',
      false,
    ]);
    expect(jest.mocked(populateInternalUserId).mock.calls[1]).toEqual([
      'user2',
      'internal-user-user2',
      'eu-west-2_ABC123',
      false,
    ]);
    expect(jest.mocked(populateInternalUserId).mock.calls[2]).toEqual([
      'user7',
      'internal-user-user7',
      'eu-west-2_ABC123',
      false,
    ]);
    expect(jest.mocked(removeUserFromGroup).mock.calls.length).toBe(3);
    expect(jest.mocked(removeUserFromGroup).mock.calls).toEqual([
      ['eu-west-2_ABC123', 'user1', 'client:client1', false],
      ['eu-west-2_ABC123', 'user2', 'client:client2', false],
      ['eu-west-2_ABC123', 'user7', 'client:client1', false],
    ]);
    expect(jest.mocked(deleteEmptyClientGroups).mock.calls.length).toBe(1);
    expect(jest.mocked(deleteEmptyClientGroups).mock.calls[0]).toEqual([
      'eu-west-2_ABC123',
      false,
    ]);
  });

  test('should dry-run migration', async () => {
    // arrange
    mockParseSync.mockImplementationOnce(() => ({
      env: 'test',
      dryRun: true,
    }));

    const mockUsers = {
      user1: { Username: 'user1', Attributes: [] }, // CIS2 user, not yet migrated
      user2: { Username: 'user2', Attributes: [] }, // Cognito user, not yet migrated
      user3: {
        Username: 'user3',
        Attributes: [
          { Name: 'custom:nhs_notify_user_id', Value: 'internal-user-789' },
        ],
      }, // Already migrated user
      user4: { Username: 'user4', Attributes: [] }, // User with multiple client IDs
      user5: { Username: 'user5', Attributes: [] }, // User with existing external mapping
      user6: { Username: 'user6', Attributes: [] }, // User with no client groups
    };

    jest.mocked(discoverUserPoolId).mockResolvedValue('eu-west-2_ABC123');
    jest
      .mocked(retrieveUsers)
      .mockResolvedValue([
        mockUsers.user1,
        mockUsers.user2,
        mockUsers.user3,
        mockUsers.user4,
        mockUsers.user5,
        mockUsers.user6,
      ]);
    jest.mocked(retrieveUserGroups).mockResolvedValue([
      { user: mockUsers.user1, groups: ['client:client1'] },
      { user: mockUsers.user2, groups: ['client:client2'] },
      { user: mockUsers.user3, groups: ['client:client2'] },
      { user: mockUsers.user4, groups: ['client:client1', 'client:client2'] },
      { user: mockUsers.user5, groups: ['client:client6'] },
      { user: mockUsers.user6, groups: [] },
    ]);
    jest
      .mocked(findInternalUserIdentifier)
      .mockImplementation(async (externalId: string) => {
        if (externalId === 'user5') {
          return 'internal-user-456';
        }
        return null;
      });
    jest.mocked(createUser).mockImplementation(async (username: string) => {
      return `internal-user-${username}`;
    });

    // act
    await runMigration();

    // assert
    expect(discoverUserPoolId).toHaveBeenCalledWith('test');
    expect(retrieveUsers).toHaveBeenCalledWith('eu-west-2_ABC123');
    expect(retrieveUserGroups).toHaveBeenCalledTimes(1);
    expect(retrieveUserGroups).toHaveBeenCalledWith(
      [
        { Username: 'user1', Attributes: [] },
        { Username: 'user2', Attributes: [] },
        {
          Username: 'user3',
          Attributes: [
            { Name: 'custom:nhs_notify_user_id', Value: 'internal-user-789' },
          ],
        },
        { Username: 'user4', Attributes: [] },
        { Username: 'user5', Attributes: [] },
        { Username: 'user6', Attributes: [] },
      ],
      'eu-west-2_ABC123'
    );
    expect(findInternalUserIdentifier).toHaveBeenCalledTimes(3);
    expect(findInternalUserIdentifier).toHaveBeenCalledWith('user1', 'test');
    expect(findInternalUserIdentifier).toHaveBeenCalledWith('user2', 'test');
    expect(findInternalUserIdentifier).toHaveBeenCalledWith('user5', 'test');
    expect(createUser).toHaveBeenCalledTimes(2);
    expect(createUser).toHaveBeenNthCalledWith(
      1,
      'user1',
      'client1',
      'test',
      true
    );
    expect(createUser).toHaveBeenNthCalledWith(
      2,
      'user2',
      'client2',
      'test',
      true
    );
    expect(jest.mocked(populateInternalUserId).mock.calls.length).toBe(2);
    expect(jest.mocked(populateInternalUserId).mock.calls[0]).toEqual([
      'user1',
      'internal-user-user1',
      'eu-west-2_ABC123',
      true,
    ]);
    expect(jest.mocked(populateInternalUserId).mock.calls[1]).toEqual([
      'user2',
      'internal-user-user2',
      'eu-west-2_ABC123',
      true,
    ]);
    expect(jest.mocked(removeUserFromGroup).mock.calls.length).toBe(2);
    expect(jest.mocked(removeUserFromGroup).mock.calls).toEqual([
      ['eu-west-2_ABC123', 'user1', 'client:client1', true],
      ['eu-west-2_ABC123', 'user2', 'client:client2', true],
    ]);
    expect(jest.mocked(deleteEmptyClientGroups).mock.calls.length).toBe(1);
    expect(jest.mocked(deleteEmptyClientGroups).mock.calls[0]).toEqual([
      'eu-west-2_ABC123',
      true,
    ]);
  });
});
