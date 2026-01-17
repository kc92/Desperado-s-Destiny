/**
 * Verify test accounts for playtesting
 * This automatically verifies accounts matching test email patterns
 */

import { User } from '../models/User.model';
import logger from '../utils/logger';

// Test email patterns that should be auto-verified
const TEST_EMAIL_STRINGS = [
  'test.outlaw.2026@gmail.com',
  'claude.outlaw.test@gmail.com',
];

export async function verifyTestAccounts(): Promise<void> {
  try {
    // Find unverified users matching test patterns
    // Use $or with both exact matches and regex pattern for emails starting with "test."
    const unverifiedUsers = await User.find({
      emailVerified: false,
      $or: [
        ...TEST_EMAIL_STRINGS.map(email => ({ email })),
        { email: { $regex: /^test\./i } }  // Any email starting with "test."
      ]
    });

    if (unverifiedUsers.length === 0) {
      logger.debug('No unverified test accounts found');
      return;
    }

    for (const user of unverifiedUsers) {
      user.emailVerified = true;
      user.verificationToken = undefined;
      await user.save();
      logger.info(`Auto-verified test account: ${user.email}`);
    }

    logger.info(`Verified ${unverifiedUsers.length} test account(s)`);
  } catch (error) {
    logger.error('Error verifying test accounts:', error);
    // Don't throw - this is optional functionality
  }
}
