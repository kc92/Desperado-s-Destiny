/**
 * Prometheus Metrics Service
 *
 * Exposes application metrics in Prometheus format.
 * Provides counters, gauges, and histograms for monitoring.
 */

import client from 'prom-client';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'desperados_',
});

// ============================================================================
// HTTP Metrics
// ============================================================================

export const httpRequestsTotal = new client.Counter({
  name: 'desperados_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestDuration = new client.Histogram({
  name: 'desperados_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// ============================================================================
// WebSocket Metrics
// ============================================================================

export const activeConnections = new client.Gauge({
  name: 'desperados_active_websocket_connections',
  help: 'Number of active WebSocket connections',
  registers: [register],
});

export const socketEventsTotal = new client.Counter({
  name: 'desperados_socket_events_total',
  help: 'Total number of socket events',
  labelNames: ['event', 'direction'],
  registers: [register],
});

// ============================================================================
// Game Session Metrics
// ============================================================================

export const activeGameSessions = new client.Gauge({
  name: 'desperados_active_game_sessions',
  help: 'Number of active game sessions',
  registers: [register],
});

export const onlinePlayers = new client.Gauge({
  name: 'desperados_online_players',
  help: 'Number of players currently online',
  registers: [register],
});

// ============================================================================
// Database Metrics
// ============================================================================

export const databaseOperations = new client.Counter({
  name: 'desperados_database_operations_total',
  help: 'Total database operations',
  labelNames: ['operation', 'collection', 'success'],
  registers: [register],
});

export const databaseOperationDuration = new client.Histogram({
  name: 'desperados_database_operation_duration_seconds',
  help: 'Duration of database operations',
  labelNames: ['operation', 'collection'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register],
});

// ============================================================================
// Authentication Metrics
// ============================================================================

export const authOperations = new client.Counter({
  name: 'desperados_auth_operations_total',
  help: 'Authentication operations',
  labelNames: ['operation', 'success'],
  registers: [register],
});

export const twoFactorOperations = new client.Counter({
  name: 'desperados_2fa_operations_total',
  help: 'Two-factor authentication operations',
  labelNames: ['operation', 'success'],
  registers: [register],
});

// ============================================================================
// Background Job Metrics
// ============================================================================

export const jobExecutions = new client.Counter({
  name: 'desperados_job_executions_total',
  help: 'Background job executions',
  labelNames: ['job_name', 'success'],
  registers: [register],
});

export const jobDuration = new client.Histogram({
  name: 'desperados_job_duration_seconds',
  help: 'Duration of background jobs',
  labelNames: ['job_name'],
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 300],
  registers: [register],
});

export const jobQueueSize = new client.Gauge({
  name: 'desperados_job_queue_size',
  help: 'Number of jobs in queue',
  labelNames: ['queue_name', 'status'],
  registers: [register],
});

// ============================================================================
// Cache Metrics
// ============================================================================

export const cacheOperations = new client.Counter({
  name: 'desperados_cache_operations_total',
  help: 'Cache hit/miss counts',
  labelNames: ['cache_name', 'result'],
  registers: [register],
});

// ============================================================================
// Economy Metrics
// ============================================================================

export const goldTransactions = new client.Counter({
  name: 'desperados_gold_transactions_total',
  help: 'In-game gold transactions',
  labelNames: ['type', 'success'],
  registers: [register],
});

export const goldTransactionAmount = new client.Histogram({
  name: 'desperados_gold_transaction_amount',
  help: 'Gold transaction amounts',
  labelNames: ['type'],
  buckets: [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000],
  registers: [register],
});

// ============================================================================
// Combat Metrics
// ============================================================================

export const combatSessions = new client.Counter({
  name: 'desperados_combat_sessions_total',
  help: 'Total combat sessions',
  labelNames: ['type', 'outcome'],
  registers: [register],
});

export const combatDuration = new client.Histogram({
  name: 'desperados_combat_duration_seconds',
  help: 'Duration of combat sessions',
  labelNames: ['type'],
  buckets: [10, 30, 60, 120, 300, 600],
  registers: [register],
});

// ============================================================================
// Error Metrics
// ============================================================================

export const errorCount = new client.Counter({
  name: 'desperados_errors_total',
  help: 'Total error count',
  labelNames: ['type', 'code'],
  registers: [register],
});

// ============================================================================
// Middleware for HTTP metrics
// ============================================================================

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip metrics endpoint itself
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e9; // Convert to seconds

    // Normalize route (replace dynamic params with placeholders)
    let route = req.route?.path || req.path;
    route = route
      .replace(/\/[0-9a-fA-F]{24}/g, '/:id') // MongoDB ObjectIds
      .replace(/\/\d+/g, '/:id') // Numeric IDs
      .replace(/\/[0-9a-f-]{36}/g, '/:uuid'); // UUIDs

    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
  });

  next();
}

// ============================================================================
// Metrics endpoint handler
// ============================================================================

export async function getMetrics(_req: Request, res: Response): Promise<void> {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (err) {
    logger.error('Error generating metrics:', err);
    res.status(500).end('Error generating metrics');
  }
}

// ============================================================================
// Helper functions for recording metrics
// ============================================================================

/**
 * Record a database operation
 */
export function recordDatabaseOperation(
  operation: string,
  collection: string,
  durationMs: number,
  success: boolean
): void {
  databaseOperations.inc({
    operation,
    collection,
    success: success.toString(),
  });
  databaseOperationDuration.observe(
    { operation, collection },
    durationMs / 1000
  );
}

/**
 * Record an authentication operation
 */
export function recordAuthOperation(
  operation: 'login' | 'logout' | 'register' | 'password_reset' | 'token_refresh',
  success: boolean
): void {
  authOperations.inc({
    operation,
    success: success.toString(),
  });
}

/**
 * Record a 2FA operation
 */
export function record2FAOperation(
  operation: 'setup' | 'verify' | 'disable' | 'backup_code',
  success: boolean
): void {
  twoFactorOperations.inc({
    operation,
    success: success.toString(),
  });
}

/**
 * Record a gold transaction
 */
export function recordGoldTransaction(
  type: string,
  amount: number,
  success: boolean
): void {
  goldTransactions.inc({
    type,
    success: success.toString(),
  });
  if (success) {
    goldTransactionAmount.observe({ type }, amount);
  }
}

/**
 * Record a job execution
 */
export function recordJobExecution(
  jobName: string,
  durationMs: number,
  success: boolean
): void {
  jobExecutions.inc({
    job_name: jobName,
    success: success.toString(),
  });
  jobDuration.observe({ job_name: jobName }, durationMs / 1000);
}

/**
 * Record a cache operation
 */
export function recordCacheOperation(
  cacheName: string,
  hit: boolean
): void {
  cacheOperations.inc({
    cache_name: cacheName,
    result: hit ? 'hit' : 'miss',
  });
}

/**
 * Record an error
 */
export function recordError(
  type: string,
  code: string | number
): void {
  errorCount.inc({
    type,
    code: code.toString(),
  });
}

// Export the registry for testing
export { register };

export default {
  register,
  metricsMiddleware,
  getMetrics,
  // Metrics
  httpRequestsTotal,
  httpRequestDuration,
  activeConnections,
  socketEventsTotal,
  activeGameSessions,
  onlinePlayers,
  databaseOperations,
  databaseOperationDuration,
  authOperations,
  twoFactorOperations,
  jobExecutions,
  jobDuration,
  jobQueueSize,
  cacheOperations,
  goldTransactions,
  goldTransactionAmount,
  combatSessions,
  combatDuration,
  errorCount,
  // Helper functions
  recordDatabaseOperation,
  recordAuthOperation,
  record2FAOperation,
  recordGoldTransaction,
  recordJobExecution,
  recordCacheOperation,
  recordError,
};
