import { Request, Response } from 'express';
import { HealthCheckResponse } from '../types';
import { isMongoDBConnected, getMongoDBConnectionState } from '../config/database';
import { isRedisConnected, redisHealthCheck } from '../config/redis';
import { config } from '../config';
import { asyncHandler } from '../middleware';
import { sendSuccess } from '../utils/responseHelpers';
import packageJson from '../../package.json';
import { getJobStatistics } from '../jobs/queues';
import logger from '../utils/logger';
import { getConnectionCount, getIO } from '../config/socket';

/**
 * Health check controller
 * Provides information about the server and its dependencies
 */
export const getHealthStatus = asyncHandler(async (_req: Request, res: Response): Promise<Response> => {
  const startTime = Date.now();

  // Check MongoDB connection
  const mongoConnected = isMongoDBConnected();
  const mongoState = getMongoDBConnectionState();

  // Check Redis connection
  const redisConnected = isRedisConnected();
  const redisHealthy = await redisHealthCheck();

  const mongoLatency = mongoConnected ? Date.now() - startTime : undefined;
  const redisLatency = redisConnected ? Date.now() - startTime : undefined;

  // Check Bull queue health
  let queueHealth: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    queues?: Record<string, { waiting: number; active: number; failed: number; delayed: number }>;
    error?: string;
  } = { status: 'healthy' };

  try {
    const queueStats = await getJobStatistics();
    let hasIssues = false;
    let totalFailed = 0;
    let totalBacklog = 0;

    for (const [_name, stats] of Object.entries(queueStats)) {
      totalFailed += stats.failed;
      totalBacklog += stats.waiting;
      if (stats.failed > 10) hasIssues = true;
      if (stats.waiting > 1000) hasIssues = true;
    }

    queueHealth = {
      status: hasIssues ? 'degraded' : 'healthy',
      queues: queueStats
    };

    if (totalFailed > 50) {
      logger.warn(`[HEALTH] High number of failed jobs: ${totalFailed}`);
    }
    if (totalBacklog > 5000) {
      logger.warn(`[HEALTH] High job backlog: ${totalBacklog}`);
    }
  } catch (error) {
    logger.error('[HEALTH] Failed to get queue statistics', { error });
    queueHealth = { status: 'unhealthy', error: 'Queue connection failed' };
  }

  // Determine overall health status
  let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

  if (!mongoConnected || !redisHealthy) {
    status = 'unhealthy';
  } else if (mongoState !== 'connected' || queueHealth.status === 'degraded') {
    status = 'degraded';
  } else if (queueHealth.status === 'unhealthy') {
    status = 'degraded'; // Queue issues shouldn't make whole service unhealthy
  }

  // Get memory usage for monitoring
  const memoryUsage = process.memoryUsage();
  const memoryMB = {
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024),
  };

  const healthCheck: HealthCheckResponse & { queues?: typeof queueHealth; memory?: typeof memoryMB } = {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: {
        status: mongoConnected ? 'connected' : 'disconnected',
        latency: mongoLatency,
      },
      redis: {
        status: redisHealthy ? 'connected' : 'disconnected',
        latency: redisLatency,
      },
    },
    queues: queueHealth,
    memory: memoryMB,
    version: packageJson.version,
    environment: config.env as 'development' | 'production' | 'test',
  };

  // Return appropriate HTTP status code for Kubernetes/load balancer probes
  if (status === 'unhealthy') {
    return res.status(503).json({
      success: false,
      data: healthCheck,
      timestamp: new Date().toISOString(),
    });
  }

  return sendSuccess(res, healthCheck);
});

/**
 * Get server status for public status dashboard
 * Returns essential status info without requiring authentication
 */
export const getServerStatus = asyncHandler(async (_req: Request, res: Response): Promise<Response> => {
  const startTime = Date.now();

  // Check services
  const mongoConnected = isMongoDBConnected();
  const mongoState = getMongoDBConnectionState();
  const redisHealthy = await redisHealthCheck();

  // Get connection count
  let connectionCount = 0;
  let socketStatus: 'connected' | 'disconnected' = 'disconnected';
  try {
    const io = getIO();
    if (io) {
      socketStatus = 'connected';
      connectionCount = await getConnectionCount();
    }
  } catch {
    // Socket not initialized
  }

  // Get queue status
  let queueStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  let totalJobs = 0;
  let failedJobs = 0;
  try {
    const queueStats = await getJobStatistics();
    for (const [_name, stats] of Object.entries(queueStats)) {
      totalJobs += stats.waiting + stats.active;
      failedJobs += stats.failed;
      if (stats.failed > 10 || stats.waiting > 1000) {
        queueStatus = 'degraded';
      }
    }
    if (failedJobs > 50) {
      queueStatus = 'unhealthy';
    }
  } catch {
    queueStatus = 'unhealthy';
  }

  // Determine overall status
  let overallStatus: 'online' | 'degraded' | 'offline' = 'online';
  if (!mongoConnected || !redisHealthy) {
    overallStatus = 'offline';
  } else if (mongoState !== 'connected' || queueStatus === 'degraded') {
    overallStatus = 'degraded';
  }

  const responseTimeMs = Date.now() - startTime;

  const status = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    uptimeFormatted: formatUptime(process.uptime()),
    version: packageJson.version,
    environment: config.env,
    connections: {
      activePlayers: connectionCount,
      socketServer: socketStatus,
    },
    services: {
      database: {
        status: mongoConnected ? 'connected' : 'disconnected',
        state: mongoState,
      },
      redis: {
        status: redisHealthy ? 'connected' : 'disconnected',
      },
      jobQueue: {
        status: queueStatus,
        pendingJobs: totalJobs,
        failedJobs: failedJobs,
      },
    },
    responseTimeMs,
  };

  return sendSuccess(res, status);
});

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

export default {
  getHealthStatus,
  getServerStatus,
};
