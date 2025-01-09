import { basicCredentialsInterceptor } from '@/src/utils/basic-credentials-interceptor';

jest.mock('@/src/utils/client-secret-handler', () => ({
  generateClientSecretHash: () => Promise.resolve('testhash'),
}));

const authInitiationBody = {
  AuthFlow: 'USER_SRP_AUTH',
  AuthParameters: {
    USERNAME: 'test.test@nhs.net',
    SRP_A: 'testcredentials',
  },
  ClientId: 'testclient',
};

const challengeResponseBody = {
  ChallengeName: 'PASSWORD_VERIFIER',
  ChallengeResponses: {
    USERNAME: 'testusername',
    PASSWORD_CLAIM_SECRET_BLOCK: 'testsecretblock',
    TIMESTAMP: 'Wed Jan 8 15:29:07 UTC 2025',
    PASSWORD_CLAIM_SIGNATURE: 'testsignature',
  },
  ClientId: 'testclient',
};

const testAuthInitiationBody = JSON.stringify(authInitiationBody);
const testChallengeResponseBody = JSON.stringify(challengeResponseBody);

describe('basic-credentials-interceptor', () => {
  it('should inject secret hash into auth initiation', async () => {
    // act
    const result = basicCredentialsInterceptor.request!(
      'https://test.nhs.uk/test',
      {
        headers: {
          'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        },
        body: testAuthInitiationBody,
      }
    );

    // assert
    const [url, config] = await (result as Promise<unknown[]>);
    expect(url).toBe('https://test.nhs.uk/test');
    expect(config).toMatchObject({
      headers: {
        'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth',
      },
      body: JSON.stringify({
        AuthFlow: 'USER_SRP_AUTH',
        AuthParameters: {
          USERNAME: 'test.test@nhs.net',
          SRP_A: 'testcredentials',
          SECRET_HASH: 'testhash',
        },
        ClientId: 'testclient',
      }),
    });
  });

  it('should inject secret hash into auth challenge response', async () => {
    // act
    const result = basicCredentialsInterceptor.request!(
      'https://test.nhs.uk/test',
      {
        headers: {
          'x-amz-target':
            'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
        },
        body: testChallengeResponseBody,
      }
    );

    // assert
    const [url, config] = await (result as Promise<unknown[]>);
    expect(url).toBe('https://test.nhs.uk/test');
    expect(config).toMatchObject({
      headers: {
        'x-amz-target':
          'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
      },
      body: JSON.stringify({
        ChallengeName: 'PASSWORD_VERIFIER',
        ChallengeResponses: {
          USERNAME: 'testusername',
          PASSWORD_CLAIM_SECRET_BLOCK: 'testsecretblock',
          TIMESTAMP: 'Wed Jan 8 15:29:07 UTC 2025',
          PASSWORD_CLAIM_SIGNATURE: 'testsignature',
          SECRET_HASH: 'testhash',
        },
        ClientId: 'testclient',
      }),
    });
  });

  it('should ignore requests without config', () => {
    // act
    const result = basicCredentialsInterceptor.request!(
      'https://test.nhs.uk/test'
    );

    // assert
    const [url, config] = result as unknown[];
    expect(url).toBe('https://test.nhs.uk/test');
    expect(config).toBe(undefined);
  });

  it('should ignore requests without headers', () => {
    // act
    const result = basicCredentialsInterceptor.request!(
      'https://test.nhs.uk/test',
      {}
    );

    // assert
    const [url, config] = result as unknown[];
    expect(url).toBe('https://test.nhs.uk/test');
    expect(config).toMatchObject({});
  });

  it('should ignore requests for other AWS services', () => {
    // act
    const result = basicCredentialsInterceptor.request!(
      'https://test.nhs.uk/test',
      {
        headers: {
          'x-amz-target': 'AWSMisc',
        },
        body: '{"test":123}',
      }
    );

    // assert
    const [url, config] = result as unknown[];
    expect(url).toBe('https://test.nhs.uk/test');
    expect(config).toMatchObject({
      headers: {
        'x-amz-target': 'AWSMisc',
      },
      body: '{"test":123}',
    });
  });

  it('should ignore requests for non-AWS services', () => {
    // act
    const result = basicCredentialsInterceptor.request!(
      'https://test.nhs.uk/test',
      {
        headers: {},
        body: '{"test":123}',
      }
    );

    // assert
    const [url, config] = result as unknown[];
    expect(url).toBe('https://test.nhs.uk/test');
    expect(config).toMatchObject({
      headers: {},
      body: '{"test":123}',
    });
  });
});
