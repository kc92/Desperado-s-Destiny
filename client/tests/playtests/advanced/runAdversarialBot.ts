/**
 * Run the AdversarialBot - Chaos Agent for Exploit Testing
 *
 * Usage:
 *   npm run test:adversarial
 *
 * This bot will deliberately try to break the game and find exploits.
 * It's designed to be run in a safe testing environment.
 */

import { AdversarialBot } from './AdversarialBot.js';

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║         ADVERSARIAL BOT - CHAOS AGENT ACTIVATED                ║');
  console.log('║                                                                ║');
  console.log('║  WARNING: This bot deliberately tries to break the game!      ║');
  console.log('║  Run in a safe testing environment only.                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Create bot instance with adversarial profile
  const bot = new AdversarialBot({
    name: 'ChaosAgent',
    username: 'chaos_tester',
    email: 'chaos@test.com',
    password: 'Test1234!',
    characterName: 'ChaosTestCharacter',
    baseUrl: process.env.BASE_URL || 'http://localhost:3002',
    headless: process.env.HEADLESS === 'true',
    slowMo: 0, // No delay for rapid-fire testing
  });

  try {
    console.log('Starting adversarial testing...\n');
    await bot.start();
    console.log('\n✓ Adversarial testing completed');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Adversarial testing failed:', error);
    process.exit(1);
  }
}

main();
