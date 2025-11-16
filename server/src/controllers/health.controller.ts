import { Request, Response } from 'express';
import { HealthCheckResponse } from '../types';
import { isMongoDBConnected, getMongoDBConnectionState } from '../config/database';
import { isRedisConnected, redisHealthCheck } from '../config/redis';
import { config } from '../config';
import { asyncHandler } from '../middleware';
import { sendSuccess } from '../utils/responseHelpers';
import packageJson from '../../package.json';

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

  // Determine overall health status
  let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

  if (!mongoConnected || !redisHealthy) {
    status = 'unhealthy';
  } else if (mongoState !== 'connected') {
    status = 'degraded';
  }

  const healthCheck: HealthCheckResponse = {
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
    version: packageJson.version,
    environment: config.env as 'development' | 'production' | 'test',
  };

  return sendSuccess(res, healthCheck);
});

export default {
  getHealthStatus,
};
