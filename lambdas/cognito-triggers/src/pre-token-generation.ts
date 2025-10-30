import type { PreTokenGenerationV2TriggerEvent } from 'aws-lambda';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { logger } from '@nhs-notify-iam-webauth/utils-logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';

const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-2' }),
  {
    marshallOptions: { removeUndefinedValues: true },
  }
);

const USERS_TABLE = process.env.USERS_TABLE ?? '';

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
    const internalUserId = event.request.userAttributes.nhs_notify_user_id;
    const childLogger = logger.child({ userName, internalUserId });

    childLogger.info(`Processing event ${JSON.stringify(event.request.userAttributes)}`);

    const input: QueryCommandInput = {
      TableName: USERS_TABLE,
      KeyConditionExpression: 'PK = :partitionKey',
      ExpressionAttributeValues: {
        ':partitionKey': `INTERNAL_USER#${internalUserId}`,
      },
    };

    type UserClient = { PK: string; client_id: string };

    const userClientsResult = await ddbDocClient.send(new QueryCommand(input));
    const items = userClientsResult.Items ?? ([] as UserClient[]);

    childLogger.info(`Found ${items.length} DB results`);
    if (items.length > 0) {
      const firstUserClient = items.sort((item1, item2) =>
        item1.client_id.localeCompare(item2.client_id)
      )[0];
      clientId = firstUserClient.client_id as string;
    } else {
      const groups = event.request.groupConfiguration.groupsToOverride;

      if (groups) {
        const clientGroup = groups.find((group) => group.startsWith('client:'));

        if (clientGroup) {
          clientId = clientGroup.replace(/^client:/, '');
        }
      }
    }

    childLogger.info(`clientId=${clientId}`);

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
      e.response.claimsAndScopeOverrideDetails?.[key] || {}; // eslint-disable-line security/detect-object-injection

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
