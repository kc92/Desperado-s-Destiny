/**
 * API Test Helpers
 *
 * Helper functions for API testing
 */

import request, { Response } from 'supertest';
import { Express } from 'express';

/**
 * Makes a GET request to the API
 */
export async function apiGet(
  app: Express,
  path: string,
  token?: string
): Promise<Response> {
  const req = request(app).get(path);

  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  return await req;
}

/**
 * Makes a POST request to the API
 */
export async function apiPost(
  app: Express,
  path: string,
  data: any,
  token?: string
): Promise<Response> {
  const req = request(app)
    .post(path)
    .send(data);

  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  return await req;
}

/**
 * Makes a PUT request to the API
 */
export async function apiPut(
  app: Express,
  path: string,
  data: any,
  token?: string
): Promise<Response> {
  const req = request(app)
    .put(path)
    .send(data);

  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  return await req;
}

/**
 * Makes a PATCH request to the API
 */
export async function apiPatch(
  app: Express,
  path: string,
  data: any,
  token?: string
): Promise<Response> {
  const req = request(app)
    .patch(path)
    .send(data);

  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  return await req;
}

/**
 * Makes a DELETE request to the API
 */
export async function apiDelete(
  app: Express,
  path: string,
  token?: string
): Promise<Response> {
  const req = request(app).delete(path);

  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  return await req;
}

/**
 * Expects a successful API response (2xx status)
 */
export function expectSuccess(response: Response): void {
  if (response.status < 200 || response.status >= 300) {
    console.error(`Expected success but got ${response.status}:`, JSON.stringify(response.body, null, 2));
  }
  expect(response.status).toBeGreaterThanOrEqual(200);
  expect(response.status).toBeLessThan(300);
  expect(response.body.success).toBe(true);
}

/**
 * Expects an error API response (4xx or 5xx status)
 */
export function expectError(response: Response, expectedStatus?: number): void {
  if (expectedStatus) {
    expect(response.status).toBe(expectedStatus);
  } else {
    expect(response.status).toBeGreaterThanOrEqual(400);
  }
  expect(response.body.success).toBe(false);
  expect(response.body.error).toBeDefined();
}

/**
 * Expects validation error response
 */
export function expectValidationError(response: Response): void {
  expectError(response, 400);
  expect(response.body.code).toBe('VALIDATION_ERROR');
}

/**
 * Expects authentication error response
 */
export function expectAuthError(response: Response): void {
  expectError(response, 401);
  expect(response.body.code).toBe('AUTHENTICATION_ERROR');
}

/**
 * Expects authorization error response
 */
export function expectAuthorizationError(response: Response): void {
  expectError(response, 403);
  expect(response.body.code).toBe('AUTHORIZATION_ERROR');
}

/**
 * Expects not found error response
 */
export function expectNotFoundError(response: Response): void {
  expectError(response, 404);
  expect(response.body.code).toBe('NOT_FOUND');
}

/**
 * Extracts data from successful API response
 */
export function extractData<T>(response: Response): T {
  expectSuccess(response);
  return response.body.data as T;
}

/**
 * Extracts a cookie value from response headers
 */
export function extractCookie(response: Response, cookieName: string): string | null {
  const cookies = response.headers['set-cookie'];
  if (!cookies) {
    return null;
  }

  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];

  for (const cookie of cookieArray) {
    const match = cookie.match(new RegExp(`${cookieName}=([^;]+)`));
    if (match) {
      return match[1];
    }
  }

  return null;
}
