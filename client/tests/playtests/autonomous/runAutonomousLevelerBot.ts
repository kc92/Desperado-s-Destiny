/**
 * Runner script for Autonomous Leveler Bot
 *
 * This bot will:
 * 1. Register a new account
 * 2. Create a character
 * 3. Play the game autonomously with intelligent decision-making
 * 4. Level up to target level and earn target gold
 * 5. Test multiple game systems along the way
 */

import { AutonomousLevelerBot } from './AutonomousLevelerBot.js';

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🤖 AUTONOMOUS LEVELER BOT - Starting...');
  console.log('='.repeat(70) + '\n');

  const botConfig = {
    name: 'AutonomousLeveler',
    username: 'test',
    email: 'test@test.com',  // Using existing test account
    password: 'Test123!',
    characterName: `Auto Desperado ${Date.now()}`,
    baseUrl: 'http://localhost:3001',
    headless: false, // Set to true for background operation
    slowMo: 100, // Slightly slower for better stability
  };

  console.log('📝 Bot Configuration:');
  console.log(`   Name: ${botConfig.name}`);
  console.log(`   Email: ${botConfig.email}`);
  console.log(`   Character: ${botConfig.characterName}`);
  console.log(`   URL: ${botConfig.baseUrl}`);
  console.log(`   Headless: ${botConfig.headless}`);
  console.log();

  const bot = new AutonomousLevelerBot(botConfig);

  try {
    console.log('🚀 Initializing bot...');
    await bot.initialize();

    console.log('🔐 Logging in...');
    await bot.login();

    console.log('🎭 Setting up character...');
    await bot.selectCharacter(); // This will create a character if none exists

    console.log('🎮 Starting autonomous gameplay loop...');
    console.log('   Target: Level 20 | 10,000 gold');
    console.log('   The bot will make intelligent decisions based on game state');
    console.log('   Press Ctrl+C to stop\n');

    // Set bot as running so shouldContinue() returns true
    (bot as any).isRunning = true;
    (bot as any).shouldStop = false;

    await bot.runBehaviorLoop();

    console.log('\n✅ Bot completed successfully!');

  } catch (error: any) {
    console.error('\n❌ Bot encountered an error:', error.message);
    console.error(error.stack);
  } finally {
    console.log('\n🛑 Shutting down bot...');
    await bot.stop();
    console.log('👋 Bot shutdown complete\n');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Received interrupt signal, shutting down gracefully...');
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
