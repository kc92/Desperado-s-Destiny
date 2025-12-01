/**
 * COMPREHENSIVE TESTING SCRIPT
 * Bypasses Jest to run quick validation tests on all systems, locations, and actions
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function runComprehensiveTests() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🎮 DESPERADOS DESTINY - COMPREHENSIVE SYSTEM TEST');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Started: ${new Date().toLocaleString()}\n`);

  const startTime = Date.now();
  const results = {
    locations: { total: 0, validated: 0, errors: [] },
    actions: { total: 0, validated: 0, invalidEnergy: 0, categories: new Set(), errors: [] },
    systems: { modelsLoaded: 0, errors: [] }
  };

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/desperados-destiny');
    console.log('✅ Connected to database\n');

    // Load models
    const { Location } = require('./dist/models/Location.model');
    const { Action } = require('./dist/models/Action.model');
    const { Character } = require('./dist/models/Character.model');
    const { Gang } = require('./dist/models/Gang.model');

    results.systems.modelsLoaded = 4;

    // TEST LOCATIONS
    console.log('📍 PHASE 1: Testing Locations');
    console.log('─────────────────────────────────────────────────────────\n');

    const locations = await Location.find({});
    results.locations.total = locations.length;
    console.log(`Found ${locations.length} locations\n`);

    const buildingTypes = new Set();
    let connectionIssues = 0;

    for (const location of locations) {
      try {
        // Validate required fields
        if (!location.name || !location.type) {
          results.locations.errors.push({
            location: location._id,
            error: 'Missing required fields'
          });
          console.log(`  ❌ Location ${location._id} - Missing required fields`);
          continue;
        }

        buildingTypes.add(location.type);

        // Validate connections
        if (location.connections && location.connections.length > 0) {
          for (const conn of location.connections) {
            const target = await Location.findById(conn.targetLocationId);
            if (!target) {
              connectionIssues++;
            }
          }
        }

        results.locations.validated++;
        console.log(`  ✅ ${location.name} (${location.type})`);
      } catch (error) {
        results.locations.errors.push({
          location: location.name,
          error: error.message
        });
        console.log(`  ❌ ${location.name} - ${error.message}`);
      }
    }

    console.log(`\n📊 Location Summary:`);
    console.log(`   Total: ${results.locations.total}`);
    console.log(`   Validated: ${results.locations.validated}`);
    console.log(`   Building Types: ${buildingTypes.size}`);
    console.log(`   Connection Issues: ${connectionIssues}`);
    console.log(`   Errors: ${results.locations.errors.length}\n`);

    // TEST ACTIONS
    console.log('🎯 PHASE 2: Testing Actions');
    console.log('─────────────────────────────────────────────────────────\n');

    const actions = await Action.find({ isActive: true });
    results.actions.total = actions.length;
    console.log(`Found ${actions.length} active actions\n`);

    for (const action of actions) {
      try {
        // Validate required fields
        if (!action.name) {
          results.actions.errors.push({
            action: action._id,
            error: 'Missing name'
          });
          console.log(`  ❌ Action ${action._id} - Missing name`);
          continue;
        }

        // Validate energy cost
        if (
          action.energyCost === undefined ||
          action.energyCost === null ||
          action.energyCost < 0 ||
          action.energyCost > 100
        ) {
          results.actions.invalidEnergy++;
          console.log(`  ⚠️  ${action.name} - Invalid energy cost: ${action.energyCost}`);
        }

        // Track categories
        if (action.category) {
          results.actions.categories.add(action.category);
        }

        results.actions.validated++;
        console.log(`  ✅ ${action.name} (${action.category || 'uncategorized'})`);
      } catch (error) {
        results.actions.errors.push({
          action: action.name,
          error: error.message
        });
        console.log(`  ❌ ${action.name} - ${error.message}`);
      }
    }

    console.log(`\n📊 Action Summary:`);
    console.log(`   Total: ${results.actions.total}`);
    console.log(`   Validated: ${results.actions.validated}`);
    console.log(`   Categories: ${results.actions.categories.size}`);
    console.log(`   Invalid Energy Costs: ${results.actions.invalidEnergy}`);
    console.log(`   Errors: ${results.actions.errors.length}\n`);

    // TEST GAME DATA
    console.log('🎮 PHASE 3: Testing Game Data');
    console.log('─────────────────────────────────────────────────────────\n');

    const characterCount = await Character.countDocuments();
    const gangCount = await Gang.countDocuments();

    console.log(`  Characters: ${characterCount}`);
    console.log(`  Gangs: ${gangCount}`);
    console.log(`  Locations: ${results.locations.total}`);
    console.log(`  Actions: ${results.actions.total}\n`);

    // FINAL REPORT
    const duration = (Date.now() - startTime) / 1000;

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 FINAL TEST REPORT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Completed: ${new Date().toLocaleString()}`);
    console.log(`Duration: ${duration.toFixed(2)}s\n`);

    console.log('📈 OVERALL SUMMARY');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`Total Tests: ${results.locations.total + results.actions.total}`);
    console.log(`Validated: ${results.locations.validated + results.actions.validated}`);
    console.log(`Errors: ${results.locations.errors.length + results.actions.errors.length}\n`);

    // CRITICAL ISSUES
    console.log('🚨 CRITICAL ISSUES');
    console.log('─────────────────────────────────────────────────────────');

    const criticalIssues = [];

    if (results.locations.errors.length > results.locations.total * 0.1) {
      criticalIssues.push(`⚠️  ${results.locations.errors.length} locations have validation errors`);
    }

    if (results.actions.invalidEnergy > 0) {
      criticalIssues.push(`⚠️  ${results.actions.invalidEnergy} actions have invalid energy costs`);
    }

    if (results.actions.errors.length > results.actions.total * 0.1) {
      criticalIssues.push(`⚠️  ${results.actions.errors.length} actions have validation errors`);
    }

    if (connectionIssues > 10) {
      criticalIssues.push(`⚠️  ${connectionIssues} location connection issues found`);
    }

    if (criticalIssues.length === 0) {
      console.log('✅ No critical issues detected!');
    } else {
      criticalIssues.forEach(issue => console.log(issue));
    }
    console.log('');

    // RECOMMENDATIONS
    console.log('💡 RECOMMENDATIONS');
    console.log('─────────────────────────────────────────────────────────');

    if (results.locations.errors.length > 0) {
      console.log('1. Review location validation errors in the database');
    }

    if (results.actions.invalidEnergy > 0) {
      console.log('2. Update action energy costs to valid range (0-100)');
      console.log('   Actions with invalid energy costs:');
      const invalidActions = await Action.find({
        isActive: true,
        $or: [
          { energyCost: { $exists: false } },
          { energyCost: null },
          { energyCost: { $lt: 0 } },
          { energyCost: { $gt: 100 } }
        ]
      }).limit(10);
      invalidActions.forEach(a => {
        console.log(`     - ${a.name}: ${a.energyCost}`);
      });
    }

    if (results.actions.errors.length > 0) {
      console.log('3. Fix action validation errors');
    }

    if (connectionIssues > 0) {
      console.log('4. Fix location connection references - remove orphaned connections');
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Test Report Complete');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runComprehensiveTests();
