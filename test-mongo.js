const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect('mongodb://admin:password@127.0.0.1:27017/desperados-destiny?authSource=admin&directConnection=true', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Successfully connected to MongoDB!');

    // Test the connection
    const result = await mongoose.connection.db.admin().ping();
    console.log('Ping result:', result);

    // Check if replica set
    const status = await mongoose.connection.db.admin().replSetGetStatus();
    console.log('Replica set status:', status.set);

    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();