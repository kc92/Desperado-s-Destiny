/**
 * Seed NPC Relationships
 *
 * Populates the database with NPC relationships and relationship clusters
 * Part of Phase 3, Wave 3.1 - NPC Cross-references System
 */

import mongoose from 'mongoose';
import { NPCRelationship } from '../models/NPCRelationship.model';
import {
  ALL_NPC_RELATIONSHIPS,
  RELATIONSHIP_CLUSTERS,
  getRelationshipCount,
  getClusterCount
} from '../data/npcRelationships';
import { config } from '../config';
import logger from '../utils/logger';

/**
 * Connect to database
 */
async function connectDB() {
  try {
    await mongoose.connect(config.database.mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error', { error: error instanceof Error ? error.message : error });
    process.exit(1);
  }
}

/**
 * Clear existing relationships
 */
async function clearRelationships() {
  console.log('Clearing existing relationships...');
  const result = await NPCRelationship.deleteMany({});
  console.log(`Deleted ${result.deletedCount} existing relationships`);
}

/**
 * Seed relationships
 */
async function seedRelationships() {
  console.log('Seeding NPC relationships...');

  let successCount = 0;
  let errorCount = 0;

  for (const relationshipData of ALL_NPC_RELATIONSHIPS) {
    try {
      // Generate unique ID if not provided
      const id = relationshipData.id ||
        `${relationshipData.npcId}-${relationshipData.relatedNpcId}-${relationshipData.relationshipType}`;

      await NPCRelationship.create({
        ...relationshipData,
        id
      });

      successCount++;
    } catch (error) {
      logger.error('Error creating relationship', { error: error instanceof Error ? error.message : error });
      errorCount++;
    }
  }

  console.log(`\nRelationships seeded: ${successCount} successful, ${errorCount} errors`);
}

/**
 * Verify seeded data
 */
async function verifyData() {
  console.log('\nVerifying seeded data...');

  const totalRelationships = await NPCRelationship.countDocuments();
  console.log(`Total relationships in database: ${totalRelationships}`);

  // Count by relationship type
  const publicRelationships = await NPCRelationship.countDocuments({ isPublic: true });
  const secretRelationships = await NPCRelationship.countDocuments({ isSecret: true });

  console.log(`Public relationships: ${publicRelationships}`);
  console.log(`Secret relationships: ${secretRelationships}`);

  // Show sample relationships
  console.log('\nSample relationships:');
  const samples = await NPCRelationship.find().limit(5);
  samples.forEach(rel => {
    console.log(`  - ${rel.npcId} -> ${rel.relatedNpcId} (${rel.relationshipType})`);
  });

  // Show relationship clusters
  console.log(`\nRelationship clusters defined: ${RELATIONSHIP_CLUSTERS.length}`);
  RELATIONSHIP_CLUSTERS.forEach(cluster => {
    console.log(`  - ${cluster.name} (${cluster.type}): ${cluster.npcIds.length} NPCs`);
  });
}

/**
 * Display statistics
 */
async function displayStatistics() {
  console.log('\n=== NPC Relationship Network Statistics ===\n');

  // Total counts
  console.log(`Total relationships defined: ${getRelationshipCount()}`);
  console.log(`Total clusters defined: ${getClusterCount()}`);

  // Relationships by type
  const familyRels = ALL_NPC_RELATIONSHIPS.filter(r => r.relationshipType === 'family');
  const friendRels = ALL_NPC_RELATIONSHIPS.filter(r => r.relationshipType === 'friend');
  const enemyRels = ALL_NPC_RELATIONSHIPS.filter(r => r.relationshipType === 'enemy');
  const criminalRels = ALL_NPC_RELATIONSHIPS.filter(r => r.relationshipType === 'criminal_associate');

  console.log('\nRelationships by type:');
  console.log(`  Family: ${familyRels.length}`);
  console.log(`  Friends: ${friendRels.length}`);
  console.log(`  Enemies: ${enemyRels.length}`);
  console.log(`  Criminal Associates: ${criminalRels.length}`);

  // Secret vs public
  const secretRels = ALL_NPC_RELATIONSHIPS.filter(r => r.isSecret);
  const publicRels = ALL_NPC_RELATIONSHIPS.filter(r => r.isPublic);

  console.log('\nVisibility:');
  console.log(`  Public: ${publicRels.length}`);
  console.log(`  Secret: ${secretRels.length}`);

  // Family groups
  console.log('\nFamily groups:');
  const familyClusters = RELATIONSHIP_CLUSTERS.filter(c => c.type === 'family');
  familyClusters.forEach(cluster => {
    console.log(`  - ${cluster.name}: ${cluster.npcIds.length} members`);
  });

  // Criminal networks
  console.log('\nCriminal networks:');
  const criminalClusters = RELATIONSHIP_CLUSTERS.filter(c => c.type === 'criminal');
  criminalClusters.forEach(cluster => {
    console.log(`  - ${cluster.name}: ${cluster.npcIds.length} members${cluster.isSecret ? ' (SECRET)' : ''}`);
  });
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('=== NPC Relationship Seed Script ===\n');

    // Display statistics about what will be seeded
    await displayStatistics();

    // Connect to database
    await connectDB();

    // Clear and seed
    await clearRelationships();
    await seedRelationships();

    // Verify
    await verifyData();

    console.log('\n=== Seed Complete ===\n');
  } catch (error) {
    logger.error('Seed script error', { error: error instanceof Error ? error.message : error });
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the script
main();
