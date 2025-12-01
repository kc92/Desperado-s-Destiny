# Comprehensive Testing Suite

This directory contains exhaustive test suites that systematically validate every system, location, and action in Desperados Destiny.

## Overview

The comprehensive testing suite provides automated validation of:
- ✅ All 30 locations and building types
- ✅ All 46 game actions
- ✅ All major game systems (16+ systems)
- ✅ Data integrity and relationships
- ✅ Energy costs and requirements
- ✅ Location connections

## Quick Start

### Run Fast Validation (Recommended)

From the `server` directory:

```bash
npm run validate:all
```

This runs the optimized validation script that tests everything in under 1 second.

### Run Full Jest Test Suites

```bash
# Run all comprehensive tests
npm run test:comprehensive

# Run specific test suites
npm run test:all-systems      # Game systems
npm run test:all-locations    # Locations & buildings
npm run test:all-actions      # Actions & validation
npm run test:orchestrator     # Unified report
```

## Test Files

### `runAll.test.ts`
**Master orchestrator** that runs all tests in sequence and generates a unified report.

**Features:**
- Runs all test phases
- Generates comprehensive reports
- Identifies critical issues
- Provides recommendations

**Usage:**
```bash
npm run test:orchestrator
```

### `allSystems.exhaustive.test.ts`
Tests all major game systems end-to-end via API endpoints.

**Systems tested:**
- Location System (travel, current location)
- Combat System (encounters, initiation)
- Action System (execution, validation)
- Economy System (gold, bank, shop)
- Gang System (creation, listing)
- Skills System (retrieval, training)
- Territory System
- Mail System
- Friends System
- Notification System
- Achievement System
- Leaderboard System
- World State (time, weather)
- Energy System

**Usage:**
```bash
npm run test:all-systems
```

### `allLocations.exhaustive.test.ts`
Validates every location and building in the game database.

**Tests:**
- ✅ Location data integrity
- ✅ Required field validation
- ✅ Building type categorization
- ✅ Location connections (bidirectional)
- ✅ Special building features (saloons, banks, stores, etc.)
- ✅ Travel system functionality

**Usage:**
```bash
npm run test:all-locations
```

### `allActions.exhaustive.test.ts`
Tests every action in the database for proper configuration.

**Tests:**
- ✅ Action execution
- ✅ Energy cost validation (0-100 range)
- ✅ Gold cost validation
- ✅ Skill requirement validation
- ✅ Success/failure mechanics
- ✅ Action categorization
- ✅ Requirements checking

**Usage:**
```bash
npm run test:all-actions
```

## Fast Validation Script

### `runComprehensiveTests.js` (in server root)

A lightweight Node.js script that directly queries the database to validate all game content without Jest overhead.

**Advantages:**
- ⚡ Fast (< 1 second)
- 📊 Clear reporting
- 🎯 Focused on data validation
- 💾 Low memory usage

**Usage:**
```bash
npm run validate:all
# or
node runComprehensiveTests.js
```

**Output:**
```
═══════════════════════════════════════════════════════════
🎮 DESPERADOS DESTINY - COMPREHENSIVE SYSTEM TEST
═══════════════════════════════════════════════════════════

📍 PHASE 1: Testing Locations
  ✅ Red Gulch (settlement)
  ✅ The Frontera (settlement)
  ... [all locations]

🎯 PHASE 2: Testing Actions
  ✅ Pickpocket Drunk
  ✅ Steal from Market
  ... [all actions]

📊 FINAL TEST REPORT
  Total Tests: 76
  Validated: 76
  Errors: 0
  ✅ No critical issues detected!
```

## Test Configuration

### `jest.comprehensive.config.js`

Jest configuration optimized for comprehensive testing:

```javascript
{
  testEnvironment: 'node',
  testTimeout: 300000,        // 5 minutes
  maxWorkers: 1,              // Sequential execution
  detectOpenHandles: true,
  forceExit: true
}
```

## When to Run Tests

### Before Every Deployment
```bash
npm run validate:all
```

### After Database Changes
```bash
npm run validate:all
```

### After Adding New Content
- New locations → `npm run test:all-locations`
- New actions → `npm run test:all-actions`
- New systems → `npm run test:all-systems`

### In CI/CD Pipeline
Add to your GitHub Actions or deployment pipeline:
```yaml
- name: Validate game content
  run: |
    cd server
    npm run validate:all
```

## Understanding Test Results

### Success (✅)
```
✅ Pickpocket Drunk (criminal)
```
Action is properly configured and passes all validation checks.

### Warning (⚠️)
```
⚠️ Rob Bank - Requirements not met
```
Action exists but has requirements that prevent immediate execution (expected behavior).

### Error (❌)
```
❌ Broken Action - Invalid energy cost: -5
```
Action has a configuration error that needs to be fixed.

## Critical Issue Detection

The test suite automatically detects critical issues:

- ❌ More than 30% of systems failing
- ❌ More than 20% of locations inaccessible
- ❌ More than 10% of actions have hard errors
- ❌ Actions with invalid energy costs
- ❌ Excessive location connection issues (>10)

## Adding New Tests

### 1. Create Test File
```typescript
// tests/comprehensive/newTest.exhaustive.test.ts
import request from 'supertest';
import { Express } from 'express';

describe('🎯 NEW SYSTEM TEST', () => {
  let app: Express;

  beforeAll(async () => {
    const { default: createApp } = await import('../testApp');
    app = createApp();
  });

  it('should test new system', async () => {
    // Your test code
  });
});
```

### 2. Add NPM Script
```json
{
  "scripts": {
    "test:new-system": "jest --config jest.comprehensive.config.js tests/comprehensive/newTest.exhaustive.test.ts --runInBand"
  }
}
```

### 3. Run Test
```bash
npm run test:new-system
```

## Troubleshooting

### Tests Timeout
- Increase timeout in `jest.comprehensive.config.js`
- Check database connection
- Ensure MongoDB is running

### Open Handles Warning
- Background timers in services
- Not critical - tests still complete
- Can be suppressed with `forceExit: true`

### Database Connection Errors
```bash
# Check MongoDB is running
mongosh

# Check .env configuration
cat .env | grep MONGODB_URI
```

## Performance

| Test Type | Duration | Tests Run |
|-----------|----------|-----------|
| Fast Validation | < 1s | 76 |
| Jest Systems | ~10s | ~50 |
| Jest Locations | ~8s | ~30 |
| Jest Actions | ~10s | ~46 |
| Full Suite | ~30s | ~130+ |

## Best Practices

1. **Run fast validation frequently** - It's quick and catches most issues
2. **Run full Jest suite before major releases** - More thorough
3. **Add tests for new features** - Keep coverage high
4. **Check test output** - Don't ignore warnings
5. **Keep tests independent** - Each test should work in isolation

## Example Output

### Successful Run
```
═══════════════════════════════════════════════════════════
📊 FINAL TEST REPORT
═══════════════════════════════════════════════════════════

📈 OVERALL SUMMARY
  Total Tests: 76
  Passed: 76 (100%)
  Failed: 0 (0%)

🚨 CRITICAL ISSUES
  ✅ No critical issues detected!

💡 RECOMMENDATIONS
  [No issues to address]
```

### Run with Issues
```
🚨 CRITICAL ISSUES
  ⚠️  5 actions have invalid energy costs
  ⚠️  12 location connection issues found

💡 RECOMMENDATIONS
  1. Update action energy costs to valid range (0-100)
     Actions with invalid energy costs:
       - Broken Action: undefined
       - Bad Action: -10
  2. Fix location connection references
```

## Related Documentation

- [COMPREHENSIVE_TEST_REPORT.md](../../COMPREHENSIVE_TEST_REPORT.md) - Latest test results
- [TESTING.md](../../docs/TESTING.md) - General testing guide
- [README.md](../../README.md) - Project overview

---

**Last Updated:** November 29, 2025
**Test Suite Version:** 1.0.0
