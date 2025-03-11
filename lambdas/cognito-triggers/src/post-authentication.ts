import type { PostAuthenticationTriggerEvent } from 'aws-lambda';

export const handler = async (event: PostAuthenticationTriggerEvent) => {
  return event;
};
