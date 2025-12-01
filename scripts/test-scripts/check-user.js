const mongoose = require('mongoose');

async function checkUser() {
  await mongoose.connect('mongodb://localhost:27017/desperados-destiny?directConnection=true');

  const User = mongoose.model('User', new mongoose.Schema({
    email: String,
    emailVerified: Boolean,
    passwordHash: String
  }));

  const user = await User.findOne({ email: 'test@test.com' });
  console.log('\nUser verification status:', {
    email: user.email,
    emailVerified: user.emailVerified,
    hasPassword: !!user.passwordHash
  });

  await mongoose.disconnect();
  process.exit(0);
}

checkUser().catch(console.error);
