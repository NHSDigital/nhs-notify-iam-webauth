import type { PreTokenGenerationV2TriggerEvent } from 'aws-lambda';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { logger } from '@nhs-notify-iam-webauth/utils-logger';

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
  campaignId?: string;
  name?: string;
};

export class PreTokenGenerationLambda {
  private clientConfigCache = new Map<string, ClientConfig>();

  private ssm = new SSMClient();

  handler = async (event: PreTokenGenerationV2Event) => {
    let clientId = '';
    let clientConfig: ClientConfig | null = null;

    const groups = event.request.groupConfiguration.groupsToOverride;

    if (groups) {
      const clientGroup = groups.find((group) => group.startsWith('client:'));

      if (clientGroup) {
        clientId = clientGroup.replace(/^client:/, '');
      }
    }

    if (clientId) {
      PreTokenGenerationLambda.setAccessTokenClaims(event, {
        'nhs-notify:client-id': clientId,
      });

      PreTokenGenerationLambda.setIdTokenClaims(event, {
        'nhs-notify:client-id': clientId,
      });

      clientConfig = await this.getClientConfig(clientId);
    }

    if (clientConfig?.campaignId) {
      PreTokenGenerationLambda.setAccessTokenClaims(event, {
        'nhs-notify:campaign-id': clientConfig.campaignId,
      });

      PreTokenGenerationLambda.setIdTokenClaims(event, {
        'nhs-notify:campaign-id': clientConfig.campaignId,
      });
    }

    if (clientConfig?.name) {
      PreTokenGenerationLambda.setIdTokenClaims(event, {
        'nhs-notify:client-name': clientConfig.name,
      });
    }

    return event;
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
        .error('Unable to retrieve campaign id from SSM', error);
    }

    if (config) {
      this.clientConfigCache.set(clientId, config);
    }

    return config;
  }

  private static setIdTokenClaims(
    event: PreTokenGenerationV2Event,
    claim: Record<string, string>
  ) {
    const idTokenGeneration =
      event.response.claimsAndScopeOverrideDetails?.idTokenGeneration || {};

    event.response.claimsAndScopeOverrideDetails = {
      ...event.response.claimsAndScopeOverrideDetails,
      idTokenGeneration: {
        ...idTokenGeneration,
        claimsToAddOrOverride: {
          ...idTokenGeneration.claimsToAddOrOverride,
          ...claim,
        },
      },
    };
  }

  private static setAccessTokenClaims(
    event: PreTokenGenerationV2Event,
    claim: Record<string, string>
  ) {
    const accessTokenGeneration =
      event.response.claimsAndScopeOverrideDetails?.accessTokenGeneration || {};

    event.response.claimsAndScopeOverrideDetails = {
      ...event.response.claimsAndScopeOverrideDetails,
      accessTokenGeneration: {
        ...accessTokenGeneration,
        claimsToAddOrOverride: {
          ...accessTokenGeneration.claimsToAddOrOverride,
          ...claim,
        },
      },
    };
  }
}

export const { handler } = new PreTokenGenerationLambda();
