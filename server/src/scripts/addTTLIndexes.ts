/**
 * Migration Script: Add TTL Indexes
 *
 * This script adds TTL (Time To Live) indexes to the Duel and Gossip collections.
 * These indexes automatically delete documents after their expiration date.
 *
 * Run this script once on existing databases to create the indexes:
 *   npx ts-node src/scripts/addTTLIndexes.ts
 *
 * For new databases, the indexes are automatically created when Mongoose models initialize.
 *
 * SECURITY: TTL indexes prevent database bloat from accumulating expired documents.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function addTTLIndexes(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/desperados';

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }

  // Add TTL index to Duels collection
  console.log('\n--- Processing Duels collection ---');
  try {
    const duelsCollection = db.collection('duels');

    // Check if a non-TTL index exists on expiresAt and drop it
    const duelIndexes = await duelsCollection.indexes();
    const existingDuelExpiresAtIndex = duelIndexes.find(
      (idx) => idx.key && idx.key.expiresAt === 1 && !idx.expireAfterSeconds
    );

    if (existingDuelExpiresAtIndex && existingDuelExpiresAtIndex.name) {
      console.log(`Dropping existing non-TTL index: ${existingDuelExpiresAtIndex.name}`);
      await duelsCollection.dropIndex(existingDuelExpiresAtIndex.name);
    }

    // Check if TTL index already exists
    const existingDuelTTLIndex = duelIndexes.find(
      (idx) =>
        idx.key &&
        idx.key.expiresAt === 1 &&
        typeof idx.expireAfterSeconds === 'number'
    );

    if (existingDuelTTLIndex) {
      console.log('TTL index already exists on Duels collection');
    } else {
      // Create TTL index (24 hours grace period)
      await duelsCollection.createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 86400 }
      );
      console.log('Created TTL index on Duels collection (24 hour grace period)');
    }
  } catch (error) {
    console.error('Error processing Duels collection:', error);
  }

  // Add TTL index to Gossip collection
  console.log('\n--- Processing Gossip collection ---');
  try {
    const gossipCollection = db.collection('gossips');

    // Check if a non-TTL index exists on expiresAt alone and drop it
    const gossipIndexes = await gossipCollection.indexes();
    const existingGossipExpiresAtIndex = gossipIndexes.find(
      (idx) =>
        idx.key &&
        Object.keys(idx.key).length === 1 &&
        idx.key.expiresAt === 1 &&
        !idx.expireAfterSeconds
    );

    if (existingGossipExpiresAtIndex && existingGossipExpiresAtIndex.name) {
      console.log(`Dropping existing non-TTL index: ${existingGossipExpiresAtIndex.name}`);
      await gossipCollection.dropIndex(existingGossipExpiresAtIndex.name);
    }

    // Check if TTL index already exists
    const existingGossipTTLIndex = gossipIndexes.find(
      (idx) =>
        idx.key &&
        idx.key.expiresAt === 1 &&
        typeof idx.expireAfterSeconds === 'number'
    );

    if (existingGossipTTLIndex) {
      console.log('TTL index already exists on Gossip collection');
    } else {
      // Create TTL index (delete immediately on expiry)
      await gossipCollection.createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
      );
      console.log('Created TTL index on Gossip collection (immediate expiry)');
    }
  } catch (error) {
    console.error('Error processing Gossip collection:', error);
  }

  console.log('\n--- TTL Index Migration Complete ---');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

// Run the migration
addTTLIndexes()
  .then(() => {
    console.log('\nMigration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration failed:', error);
    process.exit(1);
  });
