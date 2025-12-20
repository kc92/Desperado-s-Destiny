/**
 * Seed test user for development
 */

import { User } from '../models/User.model';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

export async function seedTestUser(): Promise<void> {
  try {
    const testEmail = 'test@test.com';
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: testEmail });
    
    if (existingUser) {
      logger.info('Test user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Test123!', 12);

    // Create test user
    const testUser = await User.create({
      email: testEmail,
      passwordHash: hashedPassword,
      emailVerified: true, // Pre-verified for testing
      verificationToken: undefined,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    logger.info(`Test user created: ${testEmail} (ID: ${testUser._id})`);
    logger.info('Login credentials:');
    logger.info('  Email: test@test.com');
    logger.info('  Password: Test123!');
  } catch (error) {
    logger.error('Error seeding test user:', error);
    throw error;
  }
}
