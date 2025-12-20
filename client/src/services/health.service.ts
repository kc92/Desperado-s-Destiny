/**
 * Health Service
 * API methods for checking server and service health status
 */

import { apiCall } from './api';

/**
 * Node environment types
 */
export type NodeEnvironment = 'development' | 'production' | 'test';

/**
 * Service status types
 */
export type ServiceStatus = 'connected' | 'disconnected';
export type HealthStatus = 'healthy' | 'unhealthy' | 'degraded';

/**
 * Service health information
 */
export interface ServiceHealth {
  status: ServiceStatus;
  latency?: number;
}

/**
 * Health check response interface
 */
export interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
  };
  version: string;
  environment: NodeEnvironment;
}

/**
 * Get health status of the server and its dependencies
 * @returns Health check information including service statuses
 */
export async function getHealthStatus(): Promise<HealthCheckResponse> {
  return apiCall<HealthCheckResponse>('get', '/health');
}

const healthService = {
  getHealthStatus,
};

export default healthService;
