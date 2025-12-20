/**
 * Production Database Index Creation Script
 *
 * This script ensures all MongoDB indexes are properly created and synced.
 * Run this script during deployment to ensure optimal query performance.
 *
 * Usage: npx ts-node -r tsconfig-paths/register src/scripts/createIndexes.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Import all models to register their schemas
import '../models/User.model';
import '../models/Character.model';
import '../models/Message.model';
import '../models/Territory.model';
import '../models/Gang.model';
import '../models/Quest.model';
import '../models/Item.model';
import '../models/Action.model';
import '../models/ActionResult.model';
import '../models/Mail.model';
import '../models/Notification.model';
import '../models/GoldTransaction.model';
import '../models/MarketListing.model';
import '../models/AuditLog.model';
import '../models/RefreshToken.model';

interface IndexInfo {
  collection: string;
  indexes: Array<{
    name: string;
    keys: Record<string, number>;
    unique?: boolean;
    sparse?: boolean;
    background?: boolean;
  }>;
}

/**
 * Additional production-critical indexes not defined in schemas
 * These are optimized for common production query patterns
 */
const additionalIndexes: IndexInfo[] = [
  {
    collection: 'users',
    indexes: [
      // For subscription expiry checks
      { name: 'subscription_expiry', keys: { subscriptionExpiresAt: 1 }, background: true },
      // For admin user queries
      { name: 'role_active', keys: { role: 1, isActive: 1 }, background: true },
    ]
  },
  {
    collection: 'characters',
    indexes: [
      // For location-based queries (e.g., who's at this location)
      { name: 'location_active', keys: { currentLocation: 1, isActive: 1 }, background: true },
      // For finding characters with active training
      { name: 'training_completes', keys: { 'skills.trainingCompletes': 1 }, sparse: true, background: true },
      // For gang member queries
      { name: 'gang_id', keys: { gangId: 1 }, sparse: true, background: true },
      // For jailed character queries
      { name: 'is_jailed', keys: { isJailed: 1 }, sparse: true, background: true },
      // For user+faction queries
      { name: 'user_faction', keys: { userId: 1, faction: 1 }, background: true },
      // For active characters only
      { name: 'is_active', keys: { isActive: 1 }, background: true },
    ]
  },
  {
    collection: 'combatencounters',
    indexes: [
      // For checking if character has fought this NPC
      { name: 'char_npc_status', keys: { characterId: 1, npcId: 1, status: 1 }, background: true },
      // For combat history queries
      { name: 'char_ended', keys: { characterId: 1, endedAt: -1 }, background: true },
    ]
  },
  {
    collection: 'territoryinfluences',
    indexes: [
      // For territory lookup
      { name: 'territory_id', keys: { territoryId: 1 }, background: true },
      // For faction control queries
      { name: 'controlling_faction', keys: { controllingFaction: 1 }, background: true },
    ]
  },
  {
    collection: 'npcs',
    indexes: [
      // For boss queries (type + level combination)
      { name: 'type_level', keys: { type: 1, level: 1 }, background: true },
      // For location NPC queries
      { name: 'location_id', keys: { locationId: 1 }, background: true },
    ]
  },
  {
    collection: 'locations',
    indexes: [
      // For child location queries
      { name: 'parent_id', keys: { parentId: 1 }, sparse: true, background: true },
    ]
  },
  {
    collection: 'goldtransactions',
    indexes: [
      // For transaction history queries
      { name: 'character_created', keys: { characterId: 1, createdAt: -1 }, background: true },
      // For source analytics
      { name: 'source_created', keys: { source: 1, createdAt: -1 }, background: true },
    ]
  },
  {
    collection: 'mails',
    indexes: [
      // For unread mail queries
      { name: 'recipient_read', keys: { recipientId: 1, read: 1, createdAt: -1 }, background: true },
    ]
  },
  {
    collection: 'notifications',
    indexes: [
      // For unread notification queries
      { name: 'character_read', keys: { characterId: 1, read: 1, createdAt: -1 }, background: true },
    ]
  },
  {
    collection: 'marketlistings',
    indexes: [
      // For active listings by item type
      { name: 'status_type_price', keys: { status: 1, itemId: 1, price: 1 }, background: true },
      // For seller listings
      { name: 'seller_status', keys: { sellerId: 1, status: 1, createdAt: -1 }, background: true },
    ]
  },
  {
    collection: 'auditlogs',
    indexes: [
      // For audit trail queries
      { name: 'user_action_time', keys: { userId: 1, action: 1, createdAt: -1 }, background: true },
      // For entity audit queries
      { name: 'entity_time', keys: { entityType: 1, entityId: 1, createdAt: -1 }, background: true },
    ]
  },
  {
    collection: 'refreshtokens',
    indexes: [
      // For token cleanup (TTL index)
      { name: 'expires_at_ttl', keys: { expiresAt: 1 }, background: true },
      // For token lookup
      { name: 'user_active', keys: { userId: 1, isActive: 1 }, background: true },
    ]
  },
];

/**
 * Create all indexes for a collection
 */
async function createCollectionIndexes(db: mongoose.Connection, indexInfo: IndexInfo): Promise<void> {
  const collection = db.collection(indexInfo.collection);

  for (const index of indexInfo.indexes) {
    try {
      // Check if index already exists
      const existingIndexes = await collection.indexes();
      const exists = existingIndexes.some(existing => existing.name === index.name);

      if (exists) {
        console.log(`  ✓ Index "${index.name}" already exists`);
        continue;
      }

      // Create the index
      const options: mongoose.mongo.CreateIndexesOptions = {
        name: index.name,
        background: index.background ?? true,
      };

      if (index.unique) options.unique = true;
      if (index.sparse) options.sparse = true;

      await collection.createIndex(index.keys, options);
      console.log(`  ✓ Created index "${index.name}"`);
    } catch (error) {
      logger.error(`Failed to create index "${index.name}"`, { error: error instanceof Error ? error.message : error });
    }
  }
}

/**
 * Sync all Mongoose schema indexes
 */
async function syncSchemaIndexes(): Promise<void> {
  console.log('\n📊 Syncing Mongoose schema indexes...\n');

  const models = mongoose.modelNames();

  for (const modelName of models) {
    const model = mongoose.model(modelName);
    try {
      console.log(`Syncing ${modelName}...`);
      await model.syncIndexes();
      console.log(`  ✓ ${modelName} indexes synced`);
    } catch (error) {
      logger.error(`Failed to sync ${modelName}`, { error: error instanceof Error ? error.message : error });
    }
  }
}

/**
 * Create additional production indexes
 */
async function createAdditionalIndexes(db: mongoose.Connection): Promise<void> {
  console.log('\n📊 Creating additional production indexes...\n');

  for (const indexInfo of additionalIndexes) {
    console.log(`\nCollection: ${indexInfo.collection}`);
    await createCollectionIndexes(db, indexInfo);
  }
}

/**
 * Print index statistics
 */
async function printIndexStats(db: mongoose.Connection): Promise<void> {
  console.log('\n📈 Index Statistics:\n');

  const collections = await db.db?.listCollections().toArray();
  if (!collections) return;

  let totalIndexes = 0;
  let totalSize = 0;

  for (const col of collections) {
    try {
      const collection = db.collection(col.name);
      const indexes = await collection.indexes();
      // Use aggregate with $collStats for modern MongoDB driver
      const statsResult = await db.db?.command({ collStats: col.name });
      const indexSize = statsResult?.totalIndexSize || 0;

      totalIndexes += indexes.length;
      totalSize += indexSize;

      console.log(`  ${col.name}: ${indexes.length} indexes (${formatBytes(indexSize)})`);
    } catch {
      // Skip collections that can't be accessed
      console.log(`  ${col.name}: (unable to get stats)`);
    }
  }

  console.log(`\n  Total: ${totalIndexes} indexes (${formatBytes(totalSize)})`);
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Desperados Destiny - Database Index Creation Script');
  console.log('═══════════════════════════════════════════════════════════\n');

  const mongoUri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/desperados-destiny';

  console.log(`Connecting to: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')}\n`);

  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    const db = mongoose.connection;

    // Step 1: Sync all Mongoose schema indexes
    await syncSchemaIndexes();

    // Step 2: Create additional production indexes
    await createAdditionalIndexes(db);

    // Step 3: Print index statistics
    await printIndexStats(db);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  ✓ Index creation complete!');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    logger.error('Failed to create indexes', { error: error instanceof Error ? error.message : error });
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB\n');
  }
}

// Run the script
main().catch((error) => {
  logger.error('Fatal error in main', { error: error instanceof Error ? error.message : error });
  process.exit(1);
});
