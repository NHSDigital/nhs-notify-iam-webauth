import type { APIGatewayProxyHandler } from 'aws-lambda';
import { differenceInSeconds } from 'date-fns';
import { logger } from './logger';
import axios, { AxiosHeaderValue} from 'axios';

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

export const extractStringRecord = (
  object: Record<string, AxiosHeaderValue | undefined>
): Record<string, string> => {
  const entries = Object.entries(object);

  const stringEntries: [string, string][] = entries.flatMap(([key, value]) => {
    if (!value) {
      return [];
    }

    return [[key, value.toString()]];
  });

  return Object.fromEntries(stringEntries);
};

export const handler: APIGatewayProxyHandler = async (event) => {
  const tokenUrl = `${process.env.CIS2_URL}/authorize`;

  if (!event.body) {
    throw new Error('Missing event body');
  }

  logger.info(event);

  const response = await axios.post(tokenUrl, event.body, {
    headers: event.headers,
  });

  logger.info(response);

  return {
    statusCode: response.status,
    headers: extractStringRecord(response.headers),
    body: response.data,
  };

  /*

  logger.info({
    description: 'Starting validation checks',
    event,
  });


  // only run these checks on cis2 users
  if (!userName.startsWith('CIS2-')) {
    logger.info({
      description: 'Not running validation checks on non-CIS2 user',
      event,
    });
    return event;
  }

  const {
    'custom:id_assurance_level': idAssuranceLevel,
    'custom:auth_assurance_level': authenticationAssuranceLevel,
    'custom:auth_time': authTime,
  } = event.request.userAttributes;
  const {
    expectedIdAssuranceLevel,
    expectedAuthenticationAssuranceLevel,
    maximumExpectedAuthTimeDivergenceSeconds,
  } = getEnvironmentVariables();

  if (
    Number.parseInt(idAssuranceLevel, 10) <
    Number.parseInt(expectedIdAssuranceLevel, 10)
  ) {
    logger.info({
      description:
        'User attempted to log in with insufficient id_assurance_level',
      expectedIdAssuranceLevel,
      event,
    });
    throw new Error('User failed validation checks');
  }

  if (
    Number.parseInt(authenticationAssuranceLevel, 10) <
    Number.parseInt(expectedAuthenticationAssuranceLevel, 10)
  ) {
    logger.info({
      description:
        'User attempted to log in with insufficient authentication_assurance_level',
      expectedAuthenticationAssuranceLevel,
      event,
    });
    throw new Error('User failed validation checks');
  }

  const currentDateTime = Date.now();
  if (
    Math.abs(
      differenceInSeconds(currentDateTime, Number.parseInt(authTime, 10) * 1000)
    ) > Number.parseInt(maximumExpectedAuthTimeDivergenceSeconds, 10)
  ) {
    logger.info({
      description:
        'Difference between auth_time claim and system time was too large',
      maximumExpectedAuthTimeDivergenceSeconds,
      event,
    });
    throw new Error('User failed validation checks');
  }

  logger.info({
    description: 'User has passed validation checks',
    event,
  });

  return event;*/
};
