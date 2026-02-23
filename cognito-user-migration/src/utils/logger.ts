import winston from 'winston';

const { combine, errors, colorize, simple, timestamp } = winston.format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), errors({ stack: true }), colorize(), simple()),
  transports: [
    new winston.transports.Stream({
      stream: process.stdout,
    }),
  ],
});

export { logger };
