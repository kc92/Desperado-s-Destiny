/**
 * Worker Service
 * API methods for advanced worker management (training, wages, strikes, etc.)
 */

import { apiCall } from './api';
import type { PropertyWorker, WorkerListing } from '@shared/types';

/**
 * Request types
 */
export interface HireWorkerRequest {
  propertyId: string;
  characterId: string;
  listing: WorkerListing;
}

export interface FireWorkerRequest {
  characterId: string;
}

export interface TrainWorkerRequest {
  characterId: string;
}

export interface RestWorkerRequest {
  characterId: string;
}

export interface ResolveStrikeRequest {
  characterId: string;
  bonus?: number;
}

export interface PayWagesRequest {
  characterId: string;
}

export interface WorkerListingsQuery {
  count?: number; // 1-20
  propertyLevel?: number;
}

/**
 * Response types
 */
export interface WorkerListingsResponse {
  listings: WorkerListing[];
  total: number;
}

export interface PropertyWorkersResponse {
  workers: PropertyWorker[];
  total: number;
}

export interface PayWagesResponse {
  workersPaid: number;
  totalCost: number;
  unpaidWorkers: string[];
}

export interface FireWorkerResponse {
  message: string;
  severancePaid?: number;
}

/**
 * GET /api/workers/listings
 * Generate available worker listings for hiring
 */
export async function getWorkerListings(query?: WorkerListingsQuery): Promise<WorkerListingsResponse> {
  const params = new URLSearchParams();

  if (query?.count !== undefined) {
    params.append('count', query.count.toString());
  }

  if (query?.propertyLevel !== undefined) {
    params.append('propertyLevel', query.propertyLevel.toString());
  }

  const url = `/workers/listings${params.toString() ? `?${params.toString()}` : ''}`;
  return apiCall<WorkerListingsResponse>('get', url);
}

/**
 * POST /api/workers/hire
 * Hire a worker from listings
 */
export async function hireWorker(request: HireWorkerRequest): Promise<PropertyWorker> {
  return apiCall<PropertyWorker>('post', '/workers/hire', request);
}

/**
 * POST /api/workers/pay-wages
 * Pay wages to all workers due
 */
export async function payWages(request: PayWagesRequest): Promise<PayWagesResponse> {
  return apiCall<PayWagesResponse>('post', '/workers/pay-wages', request);
}

/**
 * GET /api/workers/property/:propertyId
 * Get all workers for a property
 */
export async function getPropertyWorkers(propertyId: string): Promise<PropertyWorkersResponse> {
  return apiCall<PropertyWorkersResponse>('get', `/workers/property/${propertyId}`);
}

/**
 * GET /api/workers/property/:propertyId/available
 * Get available (unassigned) workers for a property
 */
export async function getAvailableWorkers(propertyId: string): Promise<PropertyWorkersResponse> {
  return apiCall<PropertyWorkersResponse>('get', `/workers/property/${propertyId}/available`);
}

/**
 * GET /api/workers/:workerId
 * Get worker details
 */
export async function getWorkerDetails(workerId: string): Promise<PropertyWorker> {
  return apiCall<PropertyWorker>('get', `/workers/${workerId}`);
}

/**
 * POST /api/workers/:workerId/fire
 * Fire a worker
 */
export async function fireWorker(workerId: string, request: FireWorkerRequest): Promise<FireWorkerResponse> {
  return apiCall<FireWorkerResponse>('post', `/workers/${workerId}/fire`, request);
}

/**
 * POST /api/workers/:workerId/train
 * Train a worker to increase skill
 */
export async function trainWorker(workerId: string, request: TrainWorkerRequest): Promise<PropertyWorker> {
  return apiCall<PropertyWorker>('post', `/workers/${workerId}/train`, request);
}

/**
 * POST /api/workers/:workerId/rest
 * Rest a worker to restore morale
 */
export async function restWorker(workerId: string, request: RestWorkerRequest): Promise<PropertyWorker> {
  return apiCall<PropertyWorker>('post', `/workers/${workerId}/rest`, request);
}

/**
 * POST /api/workers/:workerId/resolve-strike
 * Resolve a worker strike
 */
export async function resolveStrike(workerId: string, request: ResolveStrikeRequest): Promise<PropertyWorker> {
  return apiCall<PropertyWorker>('post', `/workers/${workerId}/resolve-strike`, request);
}

/**
 * Default export - service object with all methods
 */
const workerService = {
  getWorkerListings,
  hireWorker,
  payWages,
  getPropertyWorkers,
  getAvailableWorkers,
  getWorkerDetails,
  fireWorker,
  trainWorker,
  restWorker,
  resolveStrike,
};

export default workerService;
