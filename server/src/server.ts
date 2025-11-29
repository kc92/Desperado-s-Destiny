// Initialize Sentry error tracking FIRST - at the very top before any other imports
import { initializeSentry, setupSentryRequestHandler, setupSentryErrorHandler, closeSentry } from './config/sentry';
initializeSentry();

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
  sanitizeInput,
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
  // Sentry request handler - must be first middleware
  setupSentryRequestHandler(app);

  // Security middleware - Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", config.server.frontendUrl],
      },
    },
    crossOriginEmbedderPolicy: false,
    // Additional security headers
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    frameguard: {
      action: 'deny' // Prevent clickjacking
    },
    noSniff: true, // Prevent MIME sniffing
    xssFilter: true, // Enable XSS filter
    hidePoweredBy: true // Hide X-Powered-By header
  }));

  // CORS configuration - Allow multiple origins for development
  const allowedOrigins = [
    config.server.frontendUrl,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:3007'
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'sentry-trace', 'baggage'],
    exposedHeaders: ['Set-Cookie'],
  }));

  // Request parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Sanitize all user input
  app.use(sanitizeInput);

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

  // Sentry error handler - must be before custom error handlers
  setupSentryErrorHandler(app);

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

    // Seed starter actions
    await seedStarterData();
  } catch (error) {
    logger.error('Failed to connect to databases:', error);
    throw error;
  }
}

/**
 * Seed starter data (actions, territories, locations, buildings, etc.)
 */
async function seedStarterData(): Promise<void> {
  try {
    logger.info('Seeding starter data...');

    // Import Action model dynamically to avoid circular dependencies
    const { Action } = await import('./models/Action.model');

    // Seed starter actions
    await Action.seedStarterActions();

    // Seed territories
    const { TerritoryService } = await import('./services/territory.service');
    await TerritoryService.seedTerritories();

    // Seed territory zones
    const { seedTerritoryZones } = await import('./seeds/territoryZones.seed');
    await seedTerritoryZones();

    // Seed locations first (buildings depend on locations)
    const { seedLocations } = await import('./seeds/locations.seed');
    await seedLocations();

    // Seed buildings after locations
    const { seedRedGulchBuildings } = await import('./seeds/redGulchBuildings.seed');
    await seedRedGulchBuildings();

    // Seed test user for development
    if (config.isDevelopment) {
      const { seedTestUser } = await import('./seeds/testUser.seed');
      await seedTestUser();
    }

    logger.info('Starter data seeded successfully');
  } catch (error) {
    logger.warn('Error seeding starter data (may already exist):', error);
  }
}

/**
 * Initialize Socket.io
 */
function initializeSocketIO(httpServer: Server): void {
  // Import and initialize Socket.io from config
  const { initializeSocketIO: initSocket } = require('./config/socket');
  io = initSocket(httpServer);
  logger.info('Socket.io initialized with authentication and chat handlers');
}

/**
 * Initialize CRON jobs
 */
function initializeCronJobs(): void {
  try {
    const { initializeWarResolutionJob } = require('./jobs/warResolution');
    const { initializeBountyJobs } = require('./jobs/bountyCleanup');
    const { scheduleTerritoryMaintenance } = require('./jobs/territoryMaintenance');
    const { initializeMarketplaceJobs } = require('./jobs/marketplace.job');

    initializeWarResolutionJob();
    initializeBountyJobs();
    scheduleTerritoryMaintenance();
    initializeMarketplaceJobs();

    logger.info('CRON jobs initialized');
  } catch (error) {
    logger.error('Failed to initialize CRON jobs:', error);
  }
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

    // Initialize CRON jobs
    initializeCronJobs();

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
    // Stop CRON jobs
    try {
      const { stopWarResolutionJob } = require('./jobs/warResolution');
      const { stopBountyJobs } = require('./jobs/bountyCleanup');
      const { stopMarketplaceJobs } = require('./jobs/marketplace.job');

      stopWarResolutionJob();
      stopBountyJobs();
      stopMarketplaceJobs();
    } catch (error) {
      logger.warn('Failed to stop CRON jobs:', error);
    }

    // Close Socket.io connections
    if (io) {
      logger.info('Closing Socket.io connections...');
      const { shutdownSocketIO } = require('./config/socket');
      await shutdownSocketIO();
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

    // Close Sentry and flush remaining events
    await closeSentry();

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

// Configure middleware and routes immediately for test environments
// This ensures the app is ready when imported in tests
if (process.env.NODE_ENV === 'test') {
  configureMiddleware();
  configureRoutes();
}

// Start the application if this file is run directly
if (require.main === module) {
  void main();
}

// Export for testing
export { app, io };
export default app;



