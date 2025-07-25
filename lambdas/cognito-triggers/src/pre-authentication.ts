import type { PreAuthenticationTriggerEvent } from 'aws-lambda';

export class PreAuthenticationLambda {
  handler = async (event: PreAuthenticationTriggerEvent) => {
    if (process.env.THROW) throw new Error('Stop!');

    return event;
  };
}

export const { handler } = new PreAuthenticationLambda();
