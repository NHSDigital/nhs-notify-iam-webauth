/* eslint-disable security/detect-object-injection */
import type { PreTokenGenerationV2TriggerEvent } from 'aws-lambda';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { logger } from '@nhs-notify-iam-webauth/utils-logger';
import { INTERNAL_ID_ATTRIBUTE } from '@/src/utils/cognito-customisation-util';
import { retrieveInternalUser } from '@/src/utils/users-repository';

// Based on actual events received in testing, response.claimsAndScopeOverrideDetails can be null
// This conflicts with the type definition
// Manually override the provided type definition to allow nulls
export type PreTokenGenerationV2Event = Omit<
  PreTokenGenerationV2TriggerEvent,
  'response'
> & {
  response: Omit<
    PreTokenGenerationV2TriggerEvent['response'],
    'claimsAndScopeOverrideDetails'
  > & {
    claimsAndScopeOverrideDetails:
      | PreTokenGenerationV2TriggerEvent['response']['claimsAndScopeOverrideDetails']
      | null;
  };
};

export type ClientConfig = {
  name?: string;
};

export class PreTokenGenerationLambda {
  private clientConfigCache = new Map<string, ClientConfig>();

  private ssm = new SSMClient();

  handler = async (event: PreTokenGenerationV2Event) => {
    let response = { ...event };
    let clientId = '';
    let clientConfig: ClientConfig | null = null;

    const { userName } = event;
    const internalUserId = event.request.userAttributes[INTERNAL_ID_ATTRIBUTE];
    const userLogger = logger.child({ userName, internalUserId });

    userLogger.info('Processing event');

    if (internalUserId) {
      const internalUser = await retrieveInternalUser(internalUserId);
      if (!internalUser) {
        throw new Error('Internal user not found in DynamoDB');
      }
      clientId = internalUser.client_id;

      userLogger.info(`Found client ID from DynamoDB: ${clientId}`);

      response = PreTokenGenerationLambda.setTokenClaims(response, 'idToken', {
        'nhs-notify:internal-user-id': internalUserId,
      });
      response = PreTokenGenerationLambda.setTokenClaims(
        response,
        'accessToken',
        {
          'nhs-notify:internal-user-id': internalUserId,
        }
      );
    }

    userLogger.info(`clientId=${clientId}`);

    if (clientId) {
      response = PreTokenGenerationLambda.setTokenClaims(
        response,
        'accessToken',
        {
          'nhs-notify:client-id': clientId,
        }
      );
      response = PreTokenGenerationLambda.setTokenClaims(response, 'idToken', {
        'nhs-notify:client-id': clientId,
      });

      clientConfig = await this.getClientConfig(clientId);
    }

    if (clientConfig?.name) {
      response = PreTokenGenerationLambda.setTokenClaims(response, 'idToken', {
        'nhs-notify:client-name': clientConfig.name,
      });
    }

    const { userAttributes } = event.request;

    const preferredUsername =
      userAttributes.preferred_username || userAttributes.display_name;

    if (preferredUsername) {
      response = PreTokenGenerationLambda.setTokenClaims(response, 'idToken', {
        preferred_username: preferredUsername,
      });
    }
    if (userAttributes.given_name) {
      response = PreTokenGenerationLambda.setTokenClaims(response, 'idToken', {
        given_name: userAttributes.given_name,
      });
    }
    if (userAttributes.family_name) {
      response = PreTokenGenerationLambda.setTokenClaims(response, 'idToken', {
        family_name: userAttributes.family_name,
      });
    }

    return response;
  };

  private async getClientConfig(
    clientId: string
  ): Promise<ClientConfig | null> {
    let config: ClientConfig | null = null;

    const cached = this.clientConfigCache.get(clientId);

    if (cached) return cached;

    try {
      const getParameterResponse = await this.ssm.send(
        new GetParameterCommand({
          Name: `${process.env.CLIENT_CONFIG_PARAMETER_PATH_PREFIX}/${clientId}`,
          WithDecryption: true,
        })
      );

      if (getParameterResponse.Parameter?.Value) {
        config = JSON.parse(getParameterResponse.Parameter.Value);
      }
    } catch (error) {
      logger
        .child({ clientId })
        .error('Unable to retrieve client config from SSM', error);
    }

    if (config) {
      this.clientConfigCache.set(clientId, config);
    }

    return config;
  }

  private static setTokenClaims(
    event: PreTokenGenerationV2Event,
    token: 'accessToken' | 'idToken',
    claim: Record<string, string>
  ): PreTokenGenerationV2Event {
    const e = { ...event };

    const key =
      token === 'accessToken' ? 'accessTokenGeneration' : 'idTokenGeneration';

    const tokenGeneration =
      e.response.claimsAndScopeOverrideDetails?.[key] || {};

    e.response.claimsAndScopeOverrideDetails = {
      ...e.response.claimsAndScopeOverrideDetails,
      [key]: {
        ...tokenGeneration,
        claimsToAddOrOverride: {
          ...tokenGeneration.claimsToAddOrOverride,
          ...claim,
        },
      },
    };

    return e;
  }
}

export const { handler } = new PreTokenGenerationLambda();
