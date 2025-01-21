import type { PreAuthenticationTriggerHandler } from 'aws-lambda';
import { differenceInSeconds } from 'date-fns';

const getEnv = () => {

    if (!process.env.EXPECTED_ID_ASSURANCE_LEVEL || !process.env.EXPECTED_AUTHENTICATION_ASSURANCE_LEVEL || !process.env.MAXIMUM_EXPECTED_AUTH_TIME_DIVERGENCE_SECONDS) {
        throw new Error('Lambda misconfiguration');
    }
    
    return {
  expectedIdAssuranceLevel: process.env.EXPECTED_ID_ASSURANCE_LEVEL,
  expectedAuthenticationAssuranceLevel:
    process.env.EXPECTED_AUTHENTICATION_ASSURANCE_LEVEL,
  maximumExpectedAuthTimeDivergenceSeconds:
    process.env.MAXIMUM_EXPECTED_AUTH_TIME_DIVERGENCE_SECONDS,
};};

export const handler: PreAuthenticationTriggerHandler = async (event) => {
  const { userName } = event;

  // only run these checks on cis2 users
  if (!userName.startsWith('CIS2-')) {
    return event;
  }

  const {
    id_assurance_level: idAssuranceLevel,
    auth_assurance_level: authenticationAssuranceLevel,
    auth_time: authTime,
  } = event.request.userAttributes;
  const {
    expectedIdAssuranceLevel,
    expectedAuthenticationAssuranceLevel,
    maximumExpectedAuthTimeDivergenceSeconds,
  } = getEnv();

  if (
    Number.parseInt(idAssuranceLevel, 10) <
    Number.parseInt(expectedIdAssuranceLevel, 10)
  ) {
    throw new Error(
      `Invalid id_assurance_level. Expected ${expectedIdAssuranceLevel}`
    );
  }

  if (
    Number.parseInt(authenticationAssuranceLevel, 10) <
    Number.parseInt(expectedAuthenticationAssuranceLevel, 10)
  ) {
    throw new Error(
      `Invalid authentication_assurance_level. Expected ${expectedAuthenticationAssuranceLevel}`
    );
  }

  const currentDateTime = Date.now();
  if (
    Math.abs(differenceInSeconds(currentDateTime, Number.parseInt(authTime, 10) * 1000)) >
    Number.parseInt(maximumExpectedAuthTimeDivergenceSeconds, 10)
  ) {
    throw new Error('auth_time claim does not match current time');
  }

  return event;
};
