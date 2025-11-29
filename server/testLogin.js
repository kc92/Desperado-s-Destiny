/**
 * Quick test to verify login credentials work
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/desperados-destiny?directConnection=true';

async function testLogin() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.connection.collection('users');

    // Test scout@test.com
    const scout = await User.findOne({ email: 'scout@test.com' });

    if (scout) {
      console.log('📧 Scout Account Found:');
      console.log('   Email:', scout.email);
      console.log('   Username:', scout.username);
      console.log('   Email Verified:', scout.emailVerified);
      console.log('   Is Active:', scout.isActive);
      console.log('   Has passwordHash:', !!scout.passwordHash);

      // Test password
      const testPassword = 'ScoutTest123!';
      const match = await bcrypt.compare(testPassword, scout.passwordHash);
      console.log('   Password matches:', match);

      if (!match) {
        console.log('   ❌ PASSWORD MISMATCH!');
      } else {
        console.log('   ✅ Password is correct');
      }
    } else {
      console.log('❌ Scout account not found');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test pioneer@test.com
    const pioneer = await User.findOne({ email: 'pioneer@test.com' });

    if (pioneer) {
      console.log('📧 Pioneer Account Found:');
      console.log('   Email:', pioneer.email);
      console.log('   Username:', pioneer.username);
      console.log('   Email Verified:', pioneer.emailVerified);
      console.log('   Is Active:', pioneer.isActive);
      console.log('   Has passwordHash:', !!pioneer.passwordHash);

      // Test password
      const testPassword = 'PioneerTest123!';
      const match = await bcrypt.compare(testPassword, pioneer.passwordHash);
      console.log('   Password matches:', match);

      if (!match) {
        console.log('   ❌ PASSWORD MISMATCH!');
      } else {
        console.log('   ✅ Password is correct');
      }
    } else {
      console.log('❌ Pioneer account not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Connection closed');
  }
}

testLogin();
