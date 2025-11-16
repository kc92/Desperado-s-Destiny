/**
 * Authentication Test Helpers
 *
 * Helper functions for authentication in tests
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { mockUser, mockUserRegistration } from '@desperados/shared';

/**
 * Test JWT secret (should match your test environment configuration)
 */
const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

/**
 * Creates a test JWT token for a user
 */
export function createTestToken(userId: string, email: string, expiresIn: string = '24h'): string {
  return jwt.sign(
    { userId, email },
    TEST_JWT_SECRET,
    { expiresIn }
  );
}

/**
 * Creates a test user with hashed password
 */
export async function createTestUserWithPassword(email: string, password: string = 'TestPassword123') {
  const hashedPassword = await hashPassword(password);
  const user = mockUser();

  return {
    ...user,
    email,
    passwordHash: hashedPassword,
    plainPassword: password // Include plain password for testing
  };
}

/**
 * Hashes a password for testing
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Verifies a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Decodes a JWT token without verification (for testing)
 */
export function decodeToken(token: string): any {
  return jwt.decode(token);
}

/**
 * Verifies a JWT token
 */
export function verifyToken(token: string): any {
  return jwt.verify(token, TEST_JWT_SECRET);
}

/**
 * Creates an expired JWT token (for testing expired tokens)
 */
export function createExpiredToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    TEST_JWT_SECRET,
    { expiresIn: '-1h' } // Expired 1 hour ago
  );
}

/**
 * Creates a malformed JWT token (for testing invalid tokens)
 */
export function createMalformedToken(): string {
  return 'malformed.token.here';
}

/**
 * Creates registration credentials for testing
 */
export function createTestCredentials(
  email?: string,
  password: string = 'TestPassword123'
) {
  return mockUserRegistration({
    email: email || `test${Date.now()}@example.com`,
    password
  });
}

/**
 * Extracts bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
