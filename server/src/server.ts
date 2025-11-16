import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';

import { config } from './config';
import { connectMongoDB, disconnectMongoDB } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import logger from './utils/logger';
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
  rateLimiter,
} from './middleware';
import routes from './routes';

/**
 * Express application instance
 */
const app: Application = express();

/**
 * HTTP server instance
 */
let server: Server | null = null;

/**
 * Socket.io instance
 */
let io: SocketServer | null = null;

/**
 * Configure Express middleware
 */
function configureMiddleware(): void {
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

  // Request logging
  app.use(requestLogger);

  // Global rate limiting
  app.use(rateLimiter);
}

/**
 * Configure application routes
 */
function configureRoutes(): void {
  // API routes
  app.use('/api', routes);

  // Root route
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Desperados Destiny API Server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Error handling middleware (must be last)
  app.use(errorHandler);
}

/**
 * Initialize database connections
 */
async function initializeDatabases(): Promise<void> {
  try {
    logger.info('Connecting to databases...');

    // Connect to MongoDB
    await connectMongoDB();

    // Connect to Redis
    await connectRedis();

    logger.info('All databases connected successfully');
  } catch (error) {
    logger.error('Failed to connect to databases:', error);
    throw error;
  }
}

/**
 * Initialize Socket.io
 */
function initializeSocketIO(httpServer: Server): void {
  io = new SocketServer(httpServer, {
    cors: {
      origin: config.server.frontendUrl,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} - Reason: ${reason}`);
    });

    // Add more socket event handlers here as needed
  });

  logger.info('Socket.io initialized');
}

/**
 * Start the server
 */
export async function startServer(): Promise<Server> {
  try {
    logger.info('Starting Desperados Destiny server...');
    logger.info(`Environment: ${config.env}`);
    logger.info(`Node version: ${process.version}`);

    // Configure middleware
    configureMiddleware();

    // Configure routes
    configureRoutes();

    // Initialize databases
    await initializeDatabases();

    // Create HTTP server
    server = app.listen(config.server.port, () => {
      logger.info(`Server running on port ${config.server.port}`);
      logger.info(`Health check available at http://localhost:${config.server.port}/api/health`);
    });

    // Initialize Socket.io
    initializeSocketIO(server);

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.server.port} is already in use`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received, starting graceful shutdown...`);

  try {
    // Close Socket.io connections
    if (io) {
      logger.info('Closing Socket.io connections...');
      io.close();
    }

    // Close HTTP server
    if (server) {
      logger.info('Closing HTTP server...');
      await new Promise<void>((resolve, reject) => {
        server?.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    // Disconnect from databases
    logger.info('Disconnecting from databases...');
    await Promise.all([
      disconnectMongoDB(),
      disconnectRedis(),
    ]);

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

/**
 * Register shutdown handlers
 */
function registerShutdownHandlers(): void {
  // Handle SIGTERM (Docker, Kubernetes)
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    void shutdown('UNCAUGHT_EXCEPTION');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Promise Rejection:', reason);
    void shutdown('UNHANDLED_REJECTION');
  });
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    // Register shutdown handlers
    registerShutdownHandlers();

    // Start the server
    await startServer();
  } catch (error) {
    logger.error('Fatal error during startup:', error);
    process.exit(1);
  }
}

// Start the application if this file is run directly
if (require.main === module) {
  void main();
}

// Export for testing
export { app, io };
export default app;
