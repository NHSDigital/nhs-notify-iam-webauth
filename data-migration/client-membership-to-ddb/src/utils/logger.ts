import winston from 'winston';

const { combine, errors, json, timestamp } = winston.format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: [
    new winston.transports.Stream({
      stream: process.stdout,
    }),
  ],
});

export { logger };
