/**
 * Create Test Users for Autonomous Testing Agents
 * Creates dedicated accounts to avoid rate limiting
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/desperados-destiny?directConnection=true';

// User Schema (simplified)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  username: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

const testAccounts = [
  {
    email: 'scout@test.com',
    password: 'ScoutTest123!',
    username: 'ScoutAgent'
  },
  {
    email: 'pioneer@test.com',
    password: 'PioneerTest123!',
    username: 'PioneerAgent'
  }
];

async function createAgentTestUsers() {
  try {
    console.log('🤠 Creating Autonomous Testing Agent Accounts...\n');
    console.log(`Connecting to MongoDB: ${MONGODB_URI}`);

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', userSchema);

    for (const account of testAccounts) {
      // Check if user already exists
      let user = await User.findOne({ email: account.email });

      if (user) {
        console.log(`📧 ${account.email} already exists, updating...`);
        const hashedPassword = await bcrypt.hash(account.password, 12);

        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              passwordHash: hashedPassword,
              emailVerified: true,
              isActive: true
            },
            $unset: { verificationToken: '' }
          }
        );
        console.log(`✅ ${account.email} updated and verified`);
      } else {
        console.log(`📧 Creating ${account.email}...`);
        const hashedPassword = await bcrypt.hash(account.password, 12);

        user = await User.create({
          email: account.email,
          passwordHash: hashedPassword,
          username: account.username,
          emailVerified: true,
          isActive: true,
          verificationToken: undefined,
        });

        console.log(`✅ ${account.email} created and verified`);
      }
    }

    console.log('\n✅ All Agent Test Accounts Ready!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 AUTONOMOUS TESTING AGENT CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    testAccounts.forEach((account, i) => {
      console.log(`\n${i + 1}. ${account.username}`);
      console.log(`   Email:    ${account.email}`);
      console.log(`   Password: ${account.password}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎯 Ready for autonomous testing!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Connection closed');
  }
}

createAgentTestUsers();
