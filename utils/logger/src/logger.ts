import winston from 'winston';

const { combine, errors, json, timestamp } = winston.format;

export const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json(), errors({ stack: true, cause: true })),
  transports: [
    new winston.transports.Stream({
      stream: process.stdout,
    }),
  ],
});
