import morgan from 'morgan';
import { stream } from '../utils/logger';
import { config } from '../config';

/**
 * Morgan format tokens for custom logging
 */
morgan.token('real-ip', (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    return forwardedFor;
  }
  return 'unknown';
});

/**
 * Request logger middleware using Morgan
 * Logs HTTP requests with different formats based on environment
 */
export const requestLogger = morgan(
  config.isDevelopment
    ? ':method :url :status :res[content-length] - :response-time ms - :real-ip'
    : ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms',
  {
    stream,
    skip: (req) => {
      // Skip logging for health check endpoints to reduce noise
      return req.url === '/health' || req.url === '/api/health';
    },
  }
);

export default requestLogger;
