import winston from 'winston';

const { combine, json, timestamp } = winston.format;

export const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.Stream({
      stream: process.stdout,
    }),
  ],
});
