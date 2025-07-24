import type { PreAuthenticationTriggerEvent } from 'aws-lambda';

export class PreAuthenticationLambda {
  handler = async (event: PreAuthenticationTriggerEvent) => {
    const response = { ...event };

    console.dir(event, { depth: Infinity });

    if (process.env.THROW) throw new Error('Stop!');

    return response;
  };
}

export const { handler } = new PreAuthenticationLambda();
