// MongoDB Initialization Script
// This runs when MongoDB container is first created

db = db.getSiblingDB('desperados-destiny');

// Create collections
db.createCollection('users');
db.createCollection('characters');
db.createCollection('gangs');
db.createCollection('territories');
db.createCollection('sessions');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.characters.createIndex({ userId: 1 });
db.characters.createIndex({ name: 1 }, { unique: true });
db.gangs.createIndex({ name: 1 }, { unique: true });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print('Database initialized successfully!');
