/**
 * Integration Test Helpers
 *
 * Extended helpers for integration testing with authenticated contexts,
 * multi-user scenarios, and complex game state setup.
 */

import request, { Response, SuperAgentTest } from 'supertest';
import { Express } from 'express';
import speakeasy from 'speakeasy';
import { createTestToken, hashPassword } from './auth.helpers';
import { extractCookie } from './api.helpers';
import { User } from '../../src/models/User.model';
import { Character } from '../../src/models/Character.model';
import { Types } from 'mongoose';

/**
 * Authenticated context with user, token, and optionally character
 */
export interface AuthenticatedContext {
  user: InstanceType<typeof User>;
  token: string;
  cookies: string;  // Cookie string for .set('Cookie', cookies)
  cookiesArray: string[];  // Original array of cookies
  agent: SuperAgentTest;
  character?: InstanceType<typeof Character>;
}

/**
 * Options for creating an authenticated context
 */
export interface CreateContextOptions {
  email?: string;
  password?: string;
  withCharacter?: boolean;
  characterName?: string;
  characterFaction?: 'lawmen' | 'outlaws' | 'natives' | 'settlers';
  enable2FA?: boolean;
}

/**
 * Create an authenticated user context for testing
 * Registers a user, logs in, and optionally creates a character
 */
export async function createAuthenticatedContext(
  app: Express,
  options: CreateContextOptions = {}
): Promise<AuthenticatedContext> {
  const {
    email = `test${Date.now()}${Math.random().toString(36).substring(7)}@example.com`,
    password = 'TestPassword123!',
    withCharacter = false,
    characterName,
    characterFaction = 'outlaws',
    enable2FA = false,
  } = options;

  // Create user directly in database for faster testing
  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email,
    passwordHash,
    emailVerified: true,
    role: 'user',
  });

  // Create JWT token
  const token = createTestToken(user._id.toString(), email);

  // Create agent for cookie-based requests
  const agent = request.agent(app);

  // Login to get session cookies
  const loginResponse = await agent
    .post('/api/auth/login')
    .send({ email, password });

  const cookiesArray = loginResponse.headers['set-cookie'] || [];
  // Convert cookies array to string for .set('Cookie', cookies)
  // Extract just the cookie=value part from each Set-Cookie header
  const cookies = cookiesArray
    .map((c: string) => c.split(';')[0])
    .join('; ');

  const context: AuthenticatedContext = {
    user,
    token,
    cookies,
    cookiesArray,
    agent,
  };

  // Create character if requested
  if (withCharacter) {
    const charName = characterName || `TestChar${Date.now()}`;
    const charResponse = await agent
      .post('/api/characters')
      .set('Cookie', cookies)  // cookies is now a string
      .send({
        name: charName,
        faction: characterFaction,
      });

    if (charResponse.body.success && charResponse.body.data) {
      // Fetch actual Mongoose document for instance methods
      context.character = await Character.findById(charResponse.body.data._id) || charResponse.body.data;
    }
  }

  // Enable 2FA if requested
  if (enable2FA) {
    await enable2FAForUser(user);
  }

  return context;
}

/**
 * Enable 2FA for a user (for testing 2FA flows)
 */
export async function enable2FAForUser(user: InstanceType<typeof User>): Promise<string> {
  const secret = speakeasy.generateSecret({
    length: 32,
    name: `Desperados Destiny (${user.email})`,
    issuer: 'Desperados Destiny Test',
  });

  // Generate backup codes
  const backupCodes: string[] = [];
  for (let i = 0; i < 10; i++) {
    backupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
  }

  // Hash backup codes
  const hashedCodes = await Promise.all(
    backupCodes.map(async (code) => {
      const crypto = await import('crypto');
      return crypto.createHash('sha256').update(code).digest('hex');
    })
  );

  // Update user with 2FA enabled
  await User.findByIdAndUpdate(user._id, {
    twoFactorEnabled: true,
    twoFactorSecret: secret.base32,
    twoFactorBackupCodes: hashedCodes,
    twoFactorPendingSetup: false,
  });

  return secret.base32;
}

/**
 * Generate a valid TOTP code for testing
 */
export function generateTOTPCode(secret: string): string {
  return speakeasy.totp({
    secret,
    encoding: 'base32',
  });
}

/**
 * Create multiple authenticated contexts for multi-user testing
 */
export async function createMultiUserContext(
  app: Express,
  count: number,
  options: CreateContextOptions = {}
): Promise<AuthenticatedContext[]> {
  const contexts: AuthenticatedContext[] = [];

  for (let i = 0; i < count; i++) {
    const context = await createAuthenticatedContext(app, {
      ...options,
      email: `testuser${i}_${Date.now()}@example.com`,
      characterName: options.characterName ? `${options.characterName}${i}` : undefined,
    });
    contexts.push(context);
  }

  return contexts;
}

/**
 * Clean up test user and related data
 */
export async function cleanupContext(context: AuthenticatedContext): Promise<void> {
  try {
    // Delete character if exists
    if (context.character) {
      await Character.findByIdAndDelete(context.character._id);
    }

    // Delete user
    await User.findByIdAndDelete(context.user._id);
  } catch (error) {
    console.warn('Error cleaning up test context:', error);
  }
}

/**
 * Clean up multiple test contexts
 */
export async function cleanupContexts(contexts: AuthenticatedContext[]): Promise<void> {
  await Promise.all(contexts.map(cleanupContext));
}

/**
 * Make an authenticated request using context
 */
export function authenticatedRequest(
  context: AuthenticatedContext,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  path: string
) {
  const req = context.agent[method](path);
  if (context.cookies) {
    req.set('Cookie', context.cookies);  // cookies is now a string
  }
  return req;
}

/**
 * Wait for a condition to be true with timeout
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<boolean> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  return false;
}

/**
 * Advance game time by modifying character's last action times
 */
export async function advanceGameTime(
  characterId: string | Types.ObjectId,
  hoursBack: number
): Promise<void> {
  const pastTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  await Character.findByIdAndUpdate(characterId, {
    $set: {
      'energy.lastRegenTime': pastTime,
      lastActionTime: pastTime,
    },
  });
}

/**
 * Set character energy for testing
 */
export async function setCharacterEnergy(
  characterId: string | Types.ObjectId,
  current: number,
  max?: number
): Promise<void> {
  const update: any = { 'energy.current': current };
  if (max !== undefined) {
    update['energy.max'] = max;
  }

  await Character.findByIdAndUpdate(characterId, { $set: update });
}

/**
 * Set character gold for testing
 */
export async function setCharacterGold(
  characterId: string | Types.ObjectId,
  amount: number
): Promise<void> {
  await Character.findByIdAndUpdate(characterId, {
    $set: { gold: amount },
  });
}

/**
 * Get character's current state from database
 */
export async function getCharacterState(
  characterId: string | Types.ObjectId
): Promise<InstanceType<typeof Character> | null> {
  return Character.findById(characterId);
}

/**
 * Assert response is successful with expected data shape
 */
export function assertSuccessResponse(
  response: Response,
  expectedFields?: string[]
): void {
  expect(response.status).toBeGreaterThanOrEqual(200);
  expect(response.status).toBeLessThan(300);
  expect(response.body.success).toBe(true);

  if (expectedFields && response.body.data) {
    for (const field of expectedFields) {
      expect(response.body.data).toHaveProperty(field);
    }
  }
}

/**
 * Assert 2FA is required in login response
 */
export function assert2FARequired(response: Response): void {
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.requires2FA).toBe(true);

  // Should have 2fa_pending cookie
  const cookies = response.headers['set-cookie'];
  expect(cookies).toBeDefined();
  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
  const hasPendingCookie = cookieArray.some((c: string) => c.includes('2fa_pending'));
  expect(hasPendingCookie).toBe(true);
}

/**
 * Extract 2FA pending token from response
 */
export function extract2FAPendingToken(response: Response): string | null {
  return extractCookie(response, '2fa_pending');
}

export default {
  createAuthenticatedContext,
  createMultiUserContext,
  enable2FAForUser,
  generateTOTPCode,
  cleanupContext,
  cleanupContexts,
  authenticatedRequest,
  waitFor,
  advanceGameTime,
  setCharacterEnergy,
  setCharacterGold,
  getCharacterState,
  assertSuccessResponse,
  assert2FARequired,
  extract2FAPendingToken,
};
