import { populateInternalUserId } from '@/src/utils/cognito-customisation-util';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';

jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  ...jest.requireActual('@aws-sdk/client-cognito-identity-provider'),
}));

describe('cognito-customisation-util', () => {
  test('should populate internal user ID attribute', async () => {
    // arrange
    const userName = 'test-user';
    const internalUserId = 'internal-user-123';
    const userPoolId = 'us-east-1_examplePoolId';

    const cognitoMock = jest.spyOn(
      CognitoIdentityProvider.prototype,
      'adminUpdateUserAttributes'
    );
    cognitoMock.mockImplementation(() => Promise.resolve({}));

    // act
    await populateInternalUserId(userName, internalUserId, userPoolId);

    // assert
    expect(cognitoMock).toHaveBeenCalledWith({
      UserPoolId: userPoolId,
      Username: userName,
      UserAttributes: [
        {
          Name: 'custom:nhs_notify_user_id',
          Value: internalUserId,
        },
      ],
    });
  });
});
