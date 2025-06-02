import type { APIGatewayProxyHandler } from 'aws-lambda';
import { jwtDecode } from 'jwt-decode';
import { differenceInSeconds } from 'date-fns/differenceInSeconds';
import axios from 'axios';
import { logger } from './utils/logger';
import { extractStringRecord } from './utils/extract-string-record';
import { getKmsSigningKeyId } from './utils/key-directory-repository';
import { generateJwt } from './utils/jwt-generator';

const getEnvironmentVariables = () => {
  if (
    !process.env.EXPECTED_ID_ASSURANCE_LEVEL ||
    !process.env.EXPECTED_AUTHENTICATION_ASSURANCE_LEVEL ||
    !process.env.MAXIMUM_EXPECTED_AUTH_TIME_DIVERGENCE_SECONDS
  ) {
    throw new Error('Lambda misconfiguration');
  }

  return {
    expectedIdAssuranceLevel: process.env.EXPECTED_ID_ASSURANCE_LEVEL,
    expectedAuthenticationAssuranceLevel:
      process.env.EXPECTED_AUTHENTICATION_ASSURANCE_LEVEL,
    maximumExpectedAuthTimeDivergenceSeconds:
      process.env.MAXIMUM_EXPECTED_AUTH_TIME_DIVERGENCE_SECONDS,
  };
};

type Cis2TokenResponse = {
  access_token: string;
  id_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

export type Cis2IdToken = {
  auth_time: number;
  authentication_assurance_level: number;
  id_assurance_level: number;
};

export const validateStatus = () => true;

export const handler: APIGatewayProxyHandler = async (event) => {
  const {
    expectedIdAssuranceLevel,
    expectedAuthenticationAssuranceLevel,
    maximumExpectedAuthTimeDivergenceSeconds,
  } = getEnvironmentVariables();

  const tokenUrl = `${process.env.CIS2_URL}/access_token`;

  if (!event.body) {
    return {
      statusCode: 400,
      body: 'Missing event body',
    };
  }

  const accessTokenBody = new URLSearchParams(event.body);
  if (process.env.CIS2_AUTH_MODE === 'jwks') {
    const clientId = accessTokenBody.get('client_id');
    if (!clientId) {
      throw new Error('Missing client_id');
    }

    const keyId = await getKmsSigningKeyId();
    const jwt = await generateJwt(keyId, clientId);
    accessTokenBody.set('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
    accessTokenBody.set('client_assertion', jwt);
    accessTokenBody.delete('client_secret');
  }

  console.log(`Sending to ${tokenUrl}, payload ${accessTokenBody.toString()}`);
  const cis2Response = await axios.post<Cis2TokenResponse>(
    tokenUrl,
    accessTokenBody.toString(),
    {
      validateStatus,
    }
  );
  console.log(`Got response ${JSON.stringify({ status: cis2Response.status, headers: cis2Response.headers, data: cis2Response.data })}`);

  const { status, headers, data } = cis2Response;

  const apiGatewayResponse = {
    statusCode: status,
    headers: extractStringRecord(headers),
    body: JSON.stringify(data),
  };

  if (status !== 200) {
    return apiGatewayResponse;
  }

  // Cognito will do some verification checks:
  // - validate iss
  // - validate aud
  // - validate exp
  // - verify signature
  // but we need to do some additional checks here to comply with CIS2 requirements

  const idToken = jwtDecode<Cis2IdToken>(data.id_token);

  logger.info({
    description: 'Starting validation checks',
    event,
  });

  const {
    id_assurance_level: idAssuranceLevel,
    authentication_assurance_level: authenticationAssuranceLevel,
    auth_time: authTime,
  } = idToken;

  if (idAssuranceLevel < Number.parseInt(expectedIdAssuranceLevel, 10)) {
    logger.info({
      description:
        'User attempted to log in with insufficient id_assurance_level',
      expectedIdAssuranceLevel,
      event,
    });
    return {
      statusCode: 403,
      body: 'ID token failed validation',
    };
  }

  if (
    authenticationAssuranceLevel <
    Number.parseInt(expectedAuthenticationAssuranceLevel, 10)
  ) {
    logger.info({
      description:
        'User attempted to log in with insufficient authentication_assurance_level',
      expectedAuthenticationAssuranceLevel,
      event,
    });
    return {
      statusCode: 403,
      body: 'ID token failed validation',
    };
  }

  const currentDateTime = Date.now();
  if (
    Math.abs(differenceInSeconds(currentDateTime, authTime * 1000)) >
    Number.parseInt(maximumExpectedAuthTimeDivergenceSeconds, 10)
  ) {
    logger.info({
      description:
        'Difference between auth_time claim and system time was too large',
      maximumExpectedAuthTimeDivergenceSeconds,
      event,
    });
    return {
      statusCode: 403,
      body: 'ID token failed validation',
    };
  }

  logger.info({
    description: 'User has passed validation checks',
    event,
  });

  return apiGatewayResponse;
};
