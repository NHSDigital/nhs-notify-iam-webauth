import type { ScheduledHandler } from 'aws-lambda';
import { logger } from './utils/logger';


export const handler: ScheduledHandler = async (event) => {
  logger.info({
    description: 'Running jwks-key-rotation',
    event,
  });
};
