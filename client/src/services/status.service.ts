/**
 * Status Service
 * API methods for checking server status (public endpoint)
 */

import { apiCall } from './api';

/**
 * Server status response
 */
export interface ServerStatus {
  status: 'online' | 'degraded' | 'offline';
  timestamp: string;
  uptime: number;
  uptimeFormatted: string;
  version: string;
  environment: string;
  connections: {
    activePlayers: number;
    socketServer: 'connected' | 'disconnected';
  };
  services: {
    database: {
      status: 'connected' | 'disconnected';
      state: string;
    };
    redis: {
      status: 'connected' | 'disconnected';
    };
    jobQueue: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      pendingJobs: number;
      failedJobs: number;
    };
  };
  responseTimeMs: number;
}

/**
 * Get server status
 * Public endpoint - no authentication required
 */
export async function getServerStatus(): Promise<ServerStatus> {
  return apiCall<ServerStatus>('get', '/health/status');
}

const statusService = {
  getServerStatus,
};

export default statusService;
