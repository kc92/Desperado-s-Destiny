const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createTestUser() {
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
    const hashedPassword = await bcrypt.hash('Test123!', 12);

    // Upsert test user
    const result = await User.updateOne(
      { email: 'test@test.com' },
      {
        $set: {
          email: 'test@test.com',
          passwordHash: hashedPassword,
          emailVerified: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('\n✅ Test user created/updated successfully!');
    console.log('----------------------------------------');
    console.log('Email: test@test.com');
    console.log('Password: Test123!');
    console.log('----------------------------------------\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUser();
