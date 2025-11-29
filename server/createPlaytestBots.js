const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createPlaytestBots() {
  try {
    await mongoose.connect('mongodb://localhost:27017/desperados-destiny?directConnection=true');
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      passwordHash: String,
      emailVerified: Boolean,
      isActive: Boolean,
      createdAt: Date,
      updatedAt: Date
    }));

    // Hash password
    const hashedPassword = await bcrypt.hash('TestBot123!', 12);

    // Create three bot accounts
    const bots = [
      { email: 'combat.bot@playtest.local', name: 'Combat Bot' },
      { email: 'economy.bot@playtest.local', name: 'Economy Bot' },
      { email: 'social.bot@playtest.local', name: 'Social Bot' }
    ];

    console.log('\nCreating playtest bot accounts...\n');

    for (const bot of bots) {
      const result = await User.updateOne(
        { email: bot.email },
        {
          $set: {
            email: bot.email,
            passwordHash: hashedPassword,
            emailVerified: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      console.log(`✅ ${bot.name} created/updated`);
      console.log(`   Email: ${bot.email}`);
      console.log(`   Password: TestBot123!`);
    }

    console.log('\n----------------------------------------');
    console.log('All playtest bot accounts ready!');
    console.log('You can now run: npm run playtest');
    console.log('----------------------------------------\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createPlaytestBots();
