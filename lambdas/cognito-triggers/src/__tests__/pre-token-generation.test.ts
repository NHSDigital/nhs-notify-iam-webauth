import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import 'aws-sdk-client-mock-jest';
import {
  PreTokenGenerationLambda,
  type PreTokenGenerationV2Event,
} from '@/src/pre-token-generation';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

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

beforeAll(() => {
  process.env.CLIENT_CONFIG_PARAMETER_PATH_PREFIX =
    '/nhs-notify-unit-tests/clients';
});

afterAll(() => {
  delete process.env.CLIENT_CONFIG_PARAMETER_PATH_PREFIX;
});

const mockUsername = 'NHSIDP-prod_1234567890';

const eventNoGroup = (): PreTokenGenerationV2Event => ({
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

const eventWithGroupAndIdentity = (): PreTokenGenerationV2Event => {
  const event = eventWithGroup();
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
  test('when single client membership is held in DDB client is identified', async () => {
    // arrange
    jest
      .spyOn(DynamoDBDocumentClient.prototype, 'send')
      .mockImplementation(() =>
        Promise.resolve({
          Items: [
            {
              username: mockUsername,
              client_id: 'd4c6208e-8518-4bc4-a451-37e53b915089',
            },
          ],
        })
      );

    // act
    const result = await new PreTokenGenerationLambda().handler(eventNoGroup());

    // assert
    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'd4c6208e-8518-4bc4-a451-37e53b915089',
        },
      },
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'd4c6208e-8518-4bc4-a451-37e53b915089',
        },
      },
    });
  });

  test('when multiple client memberships are held in DDB single client is selected deterministically', async () => {
    // arrange
    jest
      .spyOn(DynamoDBDocumentClient.prototype, 'send')
      .mockImplementation(() =>
        Promise.resolve({
          Items: [
            {
              username: mockUsername,
              client_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
            },
            {
              username: mockUsername,
              client_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            },
            {
              username: mockUsername,
              client_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            },
          ],
        })
      );

    // act
    const result = await new PreTokenGenerationLambda().handler(eventNoGroup());

    // assert
    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        },
      },
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        },
      },
    });
  });

  test('when no client memberships are held in DDB client and no groups exist then no client identity is assumed', async () => {
    // arrange
    jest
      .spyOn(DynamoDBDocumentClient.prototype, 'send')
      .mockImplementation(() => Promise.resolve({}));

    // act
    const result = await new PreTokenGenerationLambda().handler(eventNoGroup());

    // assert
    expect(result.response.claimsAndScopeOverrideDetails).toBeNull();
  });
});

describe('pre-token-generation: Client membership held in SSM', () => {
  beforeEach(() => {
    jest
      .spyOn(DynamoDBDocumentClient.prototype, 'send')
      .mockImplementation(() => Promise.resolve({ Items: [] }));
  });

  describe('when user has no client group', () => {
    test('does not add any claims', async () => {
      const result = await new PreTokenGenerationLambda().handler(
        eventNoGroup()
      );

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
      const sendSpy = jest.spyOn(SSMClient.prototype, 'send');
      sendSpy.mockImplementation(() => Promise.reject(new Error('SSM Error')));

      const result = await new PreTokenGenerationLambda().handler(
        eventWithGroup()
      );

      expect(sendSpy).toHaveBeenCalledWith(expect.any(GetParameterCommand));
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: '/nhs-notify-unit-tests/clients/f58d4b65-870c-42c0-8bb6-2941c5be2bec',
            WithDecryption: true,
          },
        })
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
      const sendSpy = jest.spyOn(SSMClient.prototype, 'send');
      sendSpy.mockImplementation(() => Promise.resolve({}));

      const result = await new PreTokenGenerationLambda().handler(
        eventWithGroup()
      );

      expect(sendSpy).toHaveBeenCalledWith(expect.any(GetParameterCommand));
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: '/nhs-notify-unit-tests/clients/f58d4b65-870c-42c0-8bb6-2941c5be2bec',
            WithDecryption: true,
          },
        })
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

      const result = await new PreTokenGenerationLambda().handler(
        eventWithGroup()
      );

      expect(sendSpy).toHaveBeenCalledWith(expect.any(GetParameterCommand));
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: '/nhs-notify-unit-tests/clients/f58d4b65-870c-42c0-8bb6-2941c5be2bec',
            WithDecryption: true,
          },
        })
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
      const sendSpy = jest.spyOn(SSMClient.prototype, 'send');
      sendSpy.mockImplementation(() =>
        Promise.resolve({
          Parameter: {
            Value: JSON.stringify({}),
          },
        })
      );

      const result = await new PreTokenGenerationLambda().handler(
        eventWithGroup()
      );

      expect(sendSpy).toHaveBeenCalledWith(expect.any(GetParameterCommand));
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: '/nhs-notify-unit-tests/clients/f58d4b65-870c-42c0-8bb6-2941c5be2bec',
            WithDecryption: true,
          },
        })
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

      const result = await lambda.handler(eventWithGroup());

      expect(sendSpy).toHaveBeenCalledWith(expect.any(GetParameterCommand));
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: '/nhs-notify-unit-tests/clients/f58d4b65-870c-42c0-8bb6-2941c5be2bec',
            WithDecryption: true,
          },
        })
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

      expect(sendSpy).toHaveBeenCalledTimes(1);

      const result2 = await lambda.handler(eventWithGroup());

      // subsequent invocations for the same client should not hit ssm again
      expect(sendSpy).toHaveBeenCalledTimes(1);

      // but give the same result
      expect(result2).toEqual(result);
    });

    test('merges client claims with identity claims when identity present', async () => {
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

      const result = await new PreTokenGenerationLambda().handler(
        eventWithGroupAndIdentity()
      );

      expect(sendSpy).toHaveBeenCalledWith(expect.any(GetParameterCommand));
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: '/nhs-notify-unit-tests/clients/f58d4b65-870c-42c0-8bb6-2941c5be2bec',
            WithDecryption: true,
          },
        })
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
});
