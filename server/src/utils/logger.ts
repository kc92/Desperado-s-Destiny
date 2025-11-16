import winston from 'winston';
import { config } from '../config';

/**
 * Custom log format that includes timestamp, level, and message
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Console log format with colors for development
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = '\n' + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

/**
 * Winston logger instance
 * Logs to console in development and to files in production
 */
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'desperados-destiny-backend' },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: config.isDevelopment ? consoleFormat : logFormat,
    }),
  ],
  // Don't exit on uncaught exceptions
  exitOnError: false,
});

/**
 * Add file transports in production
 */
if (config.isProduction) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Stream for Morgan HTTP logger
 */
export const stream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};

export default logger;
