import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import {
  PreTokenGenerationLambda,
  type PreTokenGenerationV2Event,
} from '@/src/pre-token-generation';

jest.mock('@nhs-notify-iam-webauth/utils-logger', () => ({
  logger: {
    child: jest.fn().mockReturnThis(),
    error: jest.fn(),
  },
}));

const ssmMock = mockClient(SSMClient);

beforeAll(() => {
  process.env.CLIENT_CONFIG_PARAMETER_PATH_PREFIX =
    '/nhs-notify-unit-tests/clients';
});

beforeEach(() => {
  ssmMock.reset();
});

afterAll(() => {
  delete process.env.CLIENT_CONFIG_PARAMETER_PATH_PREFIX;
});

const eventNoGroup = (): PreTokenGenerationV2Event => ({
  callerContext: {
    awsSdkVersion: 'aws-sdk-unknown-unknown',
    clientId: '1633rn1feb68eltvtqkugqlml',
  },
  region: 'eu-west-2',
  request: {
    groupConfiguration: {
      groupsToOverride: [],
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
  userName: '76c25234-b041-70f2-8ba4-caf538363b35',
  userPoolId: 'eu-west-2_W8aROHYoW',
  version: '2',
});

const eventNoGroupWithIdentity = (): PreTokenGenerationV2Event => {
  const event = eventNoGroup();
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

const eventWithGroup = (): PreTokenGenerationV2Event => ({
  callerContext: {
    awsSdkVersion: 'aws-sdk-unknown-unknown',
    clientId: '1633rn1feb68eltvtqkugqlml',
  },
  region: 'eu-west-2',
  request: {
    groupConfiguration: {
      groupsToOverride: ['client:f58d4b65-870c-42c0-8bb6-2941c5be2bec'],
      iamRolesToOverride: [],
    },
    scopes: ['aws.cognito.signin.user.admin'],
    userAttributes: {
      'cognito:user_status': 'CONFIRMED',
      email: 'example@example.com',
      email_verified: 'True',
      given_name: 'Test',
      family_name: 'Example',
      display_name: 'Dr Test Example',
      sub: '76c25234-b041-70f2-8ba4-caf538363b35',
    },
  },
  response: {
    claimsAndScopeOverrideDetails: null,
  },
  triggerSource: 'TokenGeneration_Authentication',
  userName: '76c25234-b041-70f2-8ba4-caf538363b35',
  userPoolId: 'eu-west-2_W8aROHYoW',
  version: '2',
});

describe('when user has no client group', () => {
  test('does not add any claims', async () => {
    const result = await new PreTokenGenerationLambda().handler(eventNoGroup());

    expect(result.response.claimsAndScopeOverrideDetails).toBe(null);
  });

  test('adds preferred_username, given_name and family_name when present', async () => {
    const result = await new PreTokenGenerationLambda().handler(
      eventNoGroupWithIdentity()
    );

    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      idTokenGeneration: {
        claimsToAddOrOverride: {
          preferred_username: 'Dr Test Example',
          given_name: 'Test',
          family_name: 'Example',
        },
      },
    });
  });
});

describe('when user has client group', () => {
  test('adds nhs-notify:client-id claim from group in event, handles ssm errors', async () => {
    ssmMock
      .on(GetParameterCommand, {
        Name: '/nhs-notify-unit-tests/clients/f58d4b65-870c-42c0-8bb6-2941c5be2bec',
      })
      .rejectsOnce(new Error('SSM Error'));

    const result = await new PreTokenGenerationLambda().handler(
      eventWithGroup()
    );

    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
        },
      },
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
        },
      },
    });
  });

  test('handles empty get parameter response from ssm', async () => {
    ssmMock
      .on(GetParameterCommand, {
        Name: '/nhs-notify-unit-tests/clients/f58d4b65-870c-42c0-8bb6-2941c5be2bec',
      })
      .resolvesOnce({});

    const result = await new PreTokenGenerationLambda().handler(
      eventWithGroup()
    );

    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
        },
      },
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
        },
      },
    });
  });

  test('adds nhs-notify:client-name claim from ssm response', async () => {
    ssmMock
      .on(GetParameterCommand, {
        Name: '/nhs-notify-unit-tests/clients/f58d4b65-870c-42c0-8bb6-2941c5be2bec',
      })
      .resolvesOnce({
        Parameter: {
          Value: JSON.stringify({
            name: 'test-client',
          }),
        },
      });

    const result = await new PreTokenGenerationLambda().handler(
      eventWithGroup()
    );

    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
        },
      },
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
          'nhs-notify:client-name': 'test-client',
        },
      },
    });
  });

  test('handles missing client-name in ssm response', async () => {
    ssmMock
      .on(GetParameterCommand, {
        Name: '/nhs-notify-unit-tests/clients/f58d4b65-870c-42c0-8bb6-2941c5be2bec',
      })
      .resolvesOnce({
        Parameter: {
          Value: JSON.stringify({}),
        },
      });

    const result = await new PreTokenGenerationLambda().handler(
      eventWithGroup()
    );

    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
        },
      },
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
        },
      },
    });
  });

  test('caches client response from ssm', async () => {
    ssmMock
      .on(GetParameterCommand, {
        Name: '/nhs-notify-unit-tests/clients/f58d4b65-870c-42c0-8bb6-2941c5be2bec',
      })
      .resolvesOnce({
        Parameter: {
          Value: JSON.stringify({
            name: 'test-client',
          }),
        },
      });

    const lambda = new PreTokenGenerationLambda();

    const result = await lambda.handler(eventWithGroup());

    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
        },
      },
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
          'nhs-notify:client-name': 'test-client',
        },
      },
    });

    expect(ssmMock).toHaveReceivedCommandTimes(GetParameterCommand, 1);

    const result2 = await lambda.handler(eventWithGroup());

    // subsequent invocations for the same client should not hit ssm again
    expect(ssmMock).toHaveReceivedCommandTimes(GetParameterCommand, 1);

    // but give the same result
    expect(result2).toEqual(result);
  });

  test('merges client claims with identity claims when identity present', async () => {
    ssmMock
      .on(GetParameterCommand, {
        Name: '/nhs-notify-unit-tests/clients/f58d4b65-870c-42c0-8bb6-2941c5be2bec',
      })
      .resolvesOnce({
        Parameter: {
          Value: JSON.stringify({ name: 'test-client' }),
        },
      });

    const result = await new PreTokenGenerationLambda().handler(
      eventWithGroup()
    );

    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
        },
      },
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
          'nhs-notify:client-name': 'test-client',
          preferred_username: 'Dr Test Example',
          given_name: 'Test',
          family_name: 'Example',
        },
      },
    });
  });
});
