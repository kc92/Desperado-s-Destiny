/**
 * Test App - Express app instance for testing
 *
 * Lightweight Express app for testing without full server initialization
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from '../src/config';
import { errorHandler, notFoundHandler } from '../src/middleware';
import routes from '../src/routes';

/**
 * Create a test Express app instance
 */
export function createTestApp(): Application {
  const app: Application = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.use(cors({
    origin: config.server.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Request parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // API routes
  app.use('/api', routes);

  // Root route
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Desperados Destiny Test API Server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

// Export default app instance
export default createTestApp();
