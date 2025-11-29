/**
 * User Mock Data Generators
 *
 * Generate realistic mock user data for testing and development
 */

import { User, SafeUser, UserRegistration, UserLogin } from '../types/user.types';

/**
 * Generates a mock User object
 */
export function mockUser(overrides?: Partial<User>): User {
  const defaultUser: User = {
    _id: generateMockId(),
    email: generateMockEmail(),
    emailVerified: true,
    createdAt: new Date(),
    lastLogin: new Date(),
    ...overrides
  };

  return defaultUser;
}

/**
 * Generates a mock SafeUser object
 */
export function mockSafeUser(overrides?: Partial<SafeUser>): SafeUser {
  const user = mockUser(overrides);
  return {
    _id: user._id,
    email: user.email,
    emailVerified: user.emailVerified,
    role: 'user',
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    ...overrides
  };
}

/**
 * Generates mock UserRegistration data
 */
export function mockUserRegistration(overrides?: Partial<UserRegistration>): UserRegistration {
  return {
    email: generateMockEmail(),
    password: 'Password123',
    ...overrides
  };
}

/**
 * Generates mock UserLogin data
 */
export function mockUserLogin(overrides?: Partial<UserLogin>): UserLogin {
  return {
    email: generateMockEmail(),
    password: 'Password123',
    ...overrides
  };
}

/**
 * Generates an array of mock users
 */
export function mockUsers(count: number, overrides?: Partial<User>): User[] {
  return Array.from({ length: count }, () => mockUser(overrides));
}

/**
 * Generates a mock MongoDB ObjectId
 */
export function generateMockId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const randomPart = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return timestamp + randomPart.slice(0, 16);
}

/**
 * Generates a mock email address
 */
export function generateMockEmail(): string {
  const names = ['john', 'jane', 'alice', 'bob', 'charlie', 'diana', 'eve', 'frank'];
  const domains = ['example.com', 'test.com', 'mail.com', 'email.com'];
  const name = names[Math.floor(Math.random() * names.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const random = Math.floor(Math.random() * 1000);
  return `${name}${random}@${domain}`;
}
