import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import {
  PreTokenGenerationLambda,
  type PreTokenGenerationV2Event,
} from '@/src/pre-token-generation';
import { retrieveInternalUser } from '@/src/utils/users-repository';

jest.mock('@nhs-notify-iam-webauth/utils-logger', () => ({
  logger: {
    child: jest.fn().mockReturnThis(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('@aws-sdk/client-ssm', () => ({
  ...jest.requireActual('@aws-sdk/client-ssm'),
}));
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  ...jest.requireActual('@aws-sdk/lib-dynamodb'),
}));
jest.mock('@/src/utils/cognito-customisation-util', () => ({
  INTERNAL_ID_ATTRIBUTE: 'custom:nhs_notify_user_id',
}));
jest.mock('@/src/utils/users-repository');

beforeAll(() => {
  process.env.CLIENT_CONFIG_PARAMETER_PATH_PREFIX =
    '/nhs-notify-unit-tests/clients';
});

afterAll(() => {
  delete process.env.CLIENT_CONFIG_PARAMETER_PATH_PREFIX;
});

const mockUsername = 'NHSIDP-prod_1234567890';

const baseEvent = (): PreTokenGenerationV2Event => ({
  callerContext: {
    awsSdkVersion: 'aws-sdk-unknown-unknown',
    clientId: '1633rn1feb68eltvtqkugqlml',
  },
  region: 'eu-west-2',
  request: {
    groupConfiguration: {
      groupsToOverride: ['eu-west-2_000000000_NHSIDP-prod'],
      iamRolesToOverride: [],
    },
    scopes: ['aws.cognito.signin.user.admin'],
    userAttributes: {
      'cognito:user_status': 'CONFIRMED',
      email: 'example@example.com',
      email_verified: 'True',
      sub: '76c25234-b041-70f2-8ba4-caf538363b35',
    },
  },
  response: {
    claimsAndScopeOverrideDetails: null,
  },
  triggerSource: 'TokenGeneration_Authentication',
  userName: mockUsername,
  userPoolId: 'eu-west-2_W8aROHYoW',
  version: '2',
});

const eventWithIdentity = (): PreTokenGenerationV2Event => {
  const event = baseEvent();
  return {
    ...event,
    request: {
      ...event.request,
      userAttributes: {
        ...event.request.userAttributes,
        display_name: 'Dr Test Example',
        given_name: 'Test',
        family_name: 'Example',
      },
    },
  };
};

describe('pre-token-generation: Client membership held in DDB', () => {
  test('should identify client ID when single client membership is held in DDB', async () => {
    // arrange
    const event = { ...baseEvent() };
    event.request.userAttributes['custom:nhs_notify_user_id'] =
      'internal-user-id-123';
    jest.mocked(retrieveInternalUser).mockImplementation(async () => ({
      PK: 'INTERNAL_USER#internal-user-id-123',
      SK: 'CLIENT#d4c6208e-8518-4bc4-a451-37e53b915089',
      client_id: 'd4c6208e-8518-4bc4-a451-37e53b915089',
    }));
    const ssmSendSpy = jest.spyOn(SSMClient.prototype, 'send');
    ssmSendSpy.mockImplementation(() =>
      Promise.resolve({
        Parameter: {
          Value: JSON.stringify({
            name: 'test-client',
          }),
        },
      })
    );

    // act
    const result = await new PreTokenGenerationLambda().handler(event);

    // assert
    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'd4c6208e-8518-4bc4-a451-37e53b915089',
          'nhs-notify:internal-user-id': 'internal-user-id-123',
        },
      },
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'd4c6208e-8518-4bc4-a451-37e53b915089',
          'nhs-notify:client-name': 'test-client',
          'nhs-notify:internal-user-id': 'internal-user-id-123',
        },
      },
    });
    expect(ssmSendSpy).toHaveBeenCalledWith(expect.any(GetParameterCommand));
    expect(ssmSendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Name: '/nhs-notify-unit-tests/clients/d4c6208e-8518-4bc4-a451-37e53b915089',
          WithDecryption: true,
        },
      })
    );
  });

  test('should throw error if internal user not found', async () => {
    // arrange
    const event = { ...baseEvent() };
    event.request.userAttributes['custom:nhs_notify_user_id'] =
      'internal-user-id-123';
    jest.mocked(retrieveInternalUser).mockImplementation(async () => null);

    // act/assert
    await expect(new PreTokenGenerationLambda().handler(event)).rejects.toThrow(
      'Internal user not found in DynamoDB'
    );
  });

  test('handles ssm errors', async () => {
    const event = { ...baseEvent() };
    event.request.userAttributes['custom:nhs_notify_user_id'] =
      'internal-user-id-123';
    jest.mocked(retrieveInternalUser).mockImplementation(async () => ({
      PK: 'INTERNAL_USER#internal-user-id-123',
      SK: 'CLIENT#d4c6208e-8518-4bc4-a451-37e53b915089',
      client_id: 'd4c6208e-8518-4bc4-a451-37e53b915089',
    }));
    const sendSpy = jest.spyOn(SSMClient.prototype, 'send');
    sendSpy.mockImplementation(() => Promise.reject(new Error('SSM Error')));

    const result = await new PreTokenGenerationLambda().handler(event);

    expect(sendSpy).toHaveBeenCalledWith(expect.any(GetParameterCommand));
    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Name: '/nhs-notify-unit-tests/clients/d4c6208e-8518-4bc4-a451-37e53b915089',
          WithDecryption: true,
        },
      })
    );
    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'd4c6208e-8518-4bc4-a451-37e53b915089',
          'nhs-notify:internal-user-id': 'internal-user-id-123',
        },
      },
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'd4c6208e-8518-4bc4-a451-37e53b915089',
          'nhs-notify:internal-user-id': 'internal-user-id-123',
        },
      },
    });
  });

  test('handles empty get parameter response from ssm', async () => {
    const event = { ...baseEvent() };
    event.request.userAttributes['custom:nhs_notify_user_id'] =
      'internal-user-id-123';
    jest.mocked(retrieveInternalUser).mockImplementation(async () => ({
      PK: 'INTERNAL_USER#internal-user-id-123',
      SK: 'CLIENT#d4c6208e-8518-4bc4-a451-37e53b915089',
      client_id: 'd4c6208e-8518-4bc4-a451-37e53b915089',
    }));
    const sendSpy = jest.spyOn(SSMClient.prototype, 'send');
    sendSpy.mockImplementation(() => Promise.resolve({}));

    const result = await new PreTokenGenerationLambda().handler(event);

    expect(sendSpy).toHaveBeenCalledWith(expect.any(GetParameterCommand));
    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Name: '/nhs-notify-unit-tests/clients/d4c6208e-8518-4bc4-a451-37e53b915089',
          WithDecryption: true,
        },
      })
    );
    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'd4c6208e-8518-4bc4-a451-37e53b915089',
          'nhs-notify:internal-user-id': 'internal-user-id-123',
        },
      },
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'd4c6208e-8518-4bc4-a451-37e53b915089',
          'nhs-notify:internal-user-id': 'internal-user-id-123',
        },
      },
    });
  });

  test('handles missing client-name in ssm response', async () => {
    const event = { ...baseEvent() };
    event.request.userAttributes['custom:nhs_notify_user_id'] =
      'internal-user-id-123';
    jest.mocked(retrieveInternalUser).mockImplementation(async () => ({
      PK: 'INTERNAL_USER#internal-user-id-123',
      SK: 'CLIENT#d4c6208e-8518-4bc4-a451-37e53b915089',
      client_id: 'd4c6208e-8518-4bc4-a451-37e53b915089',
    }));
    const sendSpy = jest.spyOn(SSMClient.prototype, 'send');
    sendSpy.mockImplementation(() =>
      Promise.resolve({
        Parameter: {
          Value: JSON.stringify({}),
        },
      })
    );

    const result = await new PreTokenGenerationLambda().handler(event);

    expect(sendSpy).toHaveBeenCalledWith(expect.any(GetParameterCommand));
    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Name: '/nhs-notify-unit-tests/clients/d4c6208e-8518-4bc4-a451-37e53b915089',
          WithDecryption: true,
        },
      })
    );
    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'd4c6208e-8518-4bc4-a451-37e53b915089',
          'nhs-notify:internal-user-id': 'internal-user-id-123',
        },
      },
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'd4c6208e-8518-4bc4-a451-37e53b915089',
          'nhs-notify:internal-user-id': 'internal-user-id-123',
        },
      },
    });
  });

  test('caches client response from ssm', async () => {
    const event = { ...baseEvent() };
    event.request.userAttributes['custom:nhs_notify_user_id'] =
      'internal-user-id-123';
    jest.mocked(retrieveInternalUser).mockImplementation(async () => ({
      PK: 'INTERNAL_USER#internal-user-id-123',
      SK: 'CLIENT#d4c6208e-8518-4bc4-a451-37e53b915089',
      client_id: 'd4c6208e-8518-4bc4-a451-37e53b915089',
    }));
    const sendSpy = jest.spyOn(SSMClient.prototype, 'send');
    sendSpy.mockImplementation(() =>
      Promise.resolve({
        Parameter: {
          Value: JSON.stringify({
            name: 'test-client',
          }),
        },
      })
    );
    const lambda = new PreTokenGenerationLambda();

    const result = await lambda.handler(event);

    expect(sendSpy).toHaveBeenCalledWith(expect.any(GetParameterCommand));
    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Name: '/nhs-notify-unit-tests/clients/d4c6208e-8518-4bc4-a451-37e53b915089',
          WithDecryption: true,
        },
      })
    );
    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'd4c6208e-8518-4bc4-a451-37e53b915089',
          'nhs-notify:internal-user-id': 'internal-user-id-123',
        },
      },
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'd4c6208e-8518-4bc4-a451-37e53b915089',
          'nhs-notify:internal-user-id': 'internal-user-id-123',
          'nhs-notify:client-name': 'test-client',
        },
      },
    });

    expect(sendSpy).toHaveBeenCalledTimes(1);

    const result2 = await lambda.handler(event);

    // subsequent invocations for the same client should not hit ssm again
    expect(sendSpy).toHaveBeenCalledTimes(1);

    // but give the same result
    expect(result2).toEqual(result);
  });

  test('merges client claims with identity claims when identity present', async () => {
    const event = { ...eventWithIdentity() };
    event.request.userAttributes['custom:nhs_notify_user_id'] =
      'internal-user-id-123';
    jest.mocked(retrieveInternalUser).mockImplementation(async () => ({
      PK: 'INTERNAL_USER#internal-user-id-123',
      SK: 'CLIENT#d4c6208e-8518-4bc4-a451-37e53b915089',
      client_id: 'd4c6208e-8518-4bc4-a451-37e53b915089',
    }));
    const sendSpy = jest.spyOn(SSMClient.prototype, 'send');
    sendSpy.mockImplementation(() =>
      Promise.resolve({
        Parameter: {
          Value: JSON.stringify({
            name: 'test-client',
          }),
        },
      })
    );

    const result = await new PreTokenGenerationLambda().handler(event);

    expect(sendSpy).toHaveBeenCalledWith(expect.any(GetParameterCommand));
    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Name: '/nhs-notify-unit-tests/clients/d4c6208e-8518-4bc4-a451-37e53b915089',
          WithDecryption: true,
        },
      })
    );
    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'd4c6208e-8518-4bc4-a451-37e53b915089',
          'nhs-notify:internal-user-id': 'internal-user-id-123',
        },
      },
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'd4c6208e-8518-4bc4-a451-37e53b915089',
          'nhs-notify:client-name': 'test-client',
          'nhs-notify:internal-user-id': 'internal-user-id-123',
          preferred_username: 'Dr Test Example',
          given_name: 'Test',
          family_name: 'Example',
        },
      },
    });
  });
});
