// Initialize Sentry error tracking FIRST - at the very top before any other imports
import { initializeSentry, setupSentryRequestHandler, setupSentryErrorHandler, closeSentry } from './config/sentry';
initializeSentry();

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';

import { config } from './config';
import { connectMongoDB, disconnectMongoDB } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import logger from './utils/logger';
import { performanceMiddleware, performanceMonitor } from './utils/performanceMonitor';
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
  rateLimiter,
  sanitizeInput,
} from './middleware';
import { auditLogMiddleware } from './middleware/auditLog.middleware';
import { requireCsrfToken } from './middleware/csrf.middleware';
import routes from './routes';
import { metricsMiddleware, getMetrics } from './services/metrics.service';
import { KeyRotationService } from './services/keyRotation.service';

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

  // Trust X-Forwarded-For from reverse proxy (Docker, Kubernetes, AWS ELB, Railway)
  // Required for correct client IP detection in rate limiting and security checks
  app.set('trust proxy', 1);

  // Performance monitoring - track request timing and percentiles
  app.use(performanceMiddleware);

  // Prometheus metrics middleware - track HTTP request metrics
  app.use(metricsMiddleware);

  // Response compression - reduce response size by ~70%
  // Should be before other middleware to compress their output
  app.use(compression({
    // Only compress responses larger than 1kb
    threshold: 1024,
    // Compression level (1-9, default 6)
    level: 6,
    // Filter function to decide what to compress
    filter: (req, res) => {
      // Don't compress if client doesn't support it
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Use default filter (compresses text/* and application/* types)
      return compression.filter(req, res);
    },
  }));

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

  // CORS configuration - Environment-aware origin handling
  // Production: Only allow configured FRONTEND_URL
  // Development: Allow localhost variants for easier testing
  const getAllowedOrigins = (): Set<string> => {
    const origins = new Set<string>();

    // Always include the configured frontend URL
    if (config.server.frontendUrl) {
      origins.add(config.server.frontendUrl);
    }

    // In development, allow localhost variants
    if (config.isDevelopment || config.isTest) {
      // Common React/Next.js ports
      for (let port = 3000; port <= 3010; port++) {
        origins.add(`http://localhost:${port}`);
      }
      // Common Vite ports
      for (let port = 5173; port <= 5200; port++) {
        origins.add(`http://localhost:${port}`);
      }
    }

    return origins;
  };

  const allowedOrigins = getAllowedOrigins();

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests) in development/test only
      if (!origin) {
        if (config.isTest) {
          logger.debug('[CORS] Test mode: allowing request without origin header');
          return callback(null, true);
        }
        if (config.isDevelopment) {
          logger.debug('[CORS] Development mode: allowing request without origin header');
          return callback(null, true);
        }
        // SECURITY: In production, reject requests without origin
        // This prevents CSRF attacks from curl/mobile apps that don't set Origin header
        logger.warn('[CORS] SECURITY: Blocked request without Origin header in production');
        return callback(new Error('CORS: Origin header required in production'), false);
      }

      if (allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS: Blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-CSRF-Token', 'sentry-trace', 'baggage'],
    exposedHeaders: ['Set-Cookie', 'X-CSRF-Token'],
  }));

  // Request parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Sanitize all user input
  app.use(sanitizeInput);

  // NoSQL injection protection
  // Replaces MongoDB operators like $where, $ne with underscores
  app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      logger.warn(`[SECURITY] NoSQL injection attempt blocked: ${key}`, {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
    }
  }));

  // Request logging
  app.use(requestLogger);

  // Audit logging for admin actions (before rate limiting)
  app.use(auditLogMiddleware);

  // Global rate limiting
  app.use(rateLimiter);
}

/**
 * Configure application routes
 */
function configureRoutes(): void {
  // Prometheus metrics endpoint (before API routes, no auth required for scraping)
  app.get('/metrics', getMetrics);

  // API routes
  app.use('/api', routes);

  // Global CSRF protection for all mutation requests
  // This ensures 100% coverage without modifying each route file
  app.use('/api', (req, res, next) => {
    // Skip GET, HEAD, OPTIONS - these are safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    // Require CSRF token for all mutations (POST, PUT, PATCH, DELETE)
    return requireCsrfToken(req, res, next);
  });

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

    // Initialize JWT key rotation (requires Redis)
    await KeyRotationService.initialize();

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

    // Seed starter NPCs (basic 15 NPCs)
    const { initializeNPCs } = await import('./models/NPC.model');
    await initializeNPCs();

    // Seed regional NPCs for combat arena
    const { seedNewNPCs } = await import('./seeds/npcs_new');
    await seedNewNPCs();

    // Seed quests
    const { seedQuests } = await import('./seeds/quests.seed');
    await seedQuests();

    // Seed items
    const { seedItems } = await import('./seeds/items.seed');
    await seedItems();

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
async function initializeSocketIO(httpServer: Server): Promise<void> {
  // Import and initialize Socket.io from config
  const { initializeSocketIO: initSocket } = require('./config/socket');
  io = await initSocket(httpServer);
  logger.info('Socket.io initialized with Redis adapter and handlers');
}

/**
 * Initialize distributed job system (Bull queues)
 */
async function initializeJobSystem(): Promise<void> {
  try {
    const { initializeJobSystem: initJobs } = await import('./jobs/queues');
    await initJobs();
    logger.info('Bull job system initialized');
  } catch (error) {
    logger.error('Failed to initialize Bull job system:', error);
    // Don't throw - jobs are important but not critical for server startup
    // The server can run without jobs for a short time
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

    // Initialize Socket.io with Redis adapter
    await initializeSocketIO(server);

    // Initialize distributed job system (Bull queues)
    await initializeJobSystem();

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
    // Shutdown Bull job system
    try {
      const { shutdownJobSystem } = await import('./jobs/queues');
      await shutdownJobSystem();
      logger.info('Bull job system shut down');
    } catch (error) {
      logger.warn('Failed to shutdown Bull job system:', error);
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



