# Comprehensive Testing Guide

Complete guide to automated testing infrastructure for Desperados Destiny.

## Overview

Desperados Destiny has **two layers** of comprehensive automated testing:

1. **API/Database Tests** - Fast backend validation (< 1 second)
2. **E2E/UI Tests** - Full browser automation testing (2-4 minutes)

Both test suites validate **100% of game content**:
- ✅ All 30 locations
- ✅ All 46 actions
- ✅ All major game systems

---

## Quick Reference

### API Tests (Backend)

**Location:** `server/`

```bash
# Fast validation - recommended for frequent use
cd server
npm run validate:all

# Full Jest test suites
npm run test:comprehensive         # All tests
npm run test:all-systems          # Systems only
npm run test:all-locations        # Locations only
npm run test:all-actions          # Actions only
```

**Speed:** < 1 second
**Coverage:** Database + API endpoints
**Use when:** Making backend changes, CI/CD, quick validation

### E2E Tests (Frontend)

**Location:** `client/`

```bash
# Full UI testing with visible browser
cd client
npm run test:comprehensive:e2e

# Headless mode (faster, CI/CD)
npm run test:comprehensive:e2e:headless

# Individual suites
npm run test:locations:e2e        # Locations only
npm run test:actions:e2e          # Actions only
```

**Speed:** 2-4 minutes
**Coverage:** UI + API + Database + User Experience
**Use when:** Testing UI changes, validating UX, before releases

---

## Testing Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TESTING LAYERS                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: API/Database Tests (Backend)                  │
│  ┌────────────────────────────────────────────────┐    │
│  │  • Direct database queries                      │    │
│  │  • API endpoint validation                      │    │
│  │  • Data integrity checks                        │    │
│  │  • Performance: < 1 second                      │    │
│  │  • Files: server/tests/comprehensive/          │    │
│  │  • Runner: server/runComprehensiveTests.js     │    │
│  └────────────────────────────────────────────────┘    │
│                         ↓                                │
│  Layer 2: E2E/UI Tests (Frontend)                       │
│  ┌────────────────────────────────────────────────┐    │
│  │  • Browser automation (Puppeteer)               │    │
│  │  • Physical UI interaction                      │    │
│  │  • Real user workflows                          │    │
│  │  • Performance: 2-4 minutes                     │    │
│  │  • Files: client/tests/playtests/comprehensive/│    │
│  │  • Runner: runComprehensiveE2E.ts              │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Test Coverage

### What Gets Tested

| Component | API Tests | E2E Tests |
|-----------|-----------|-----------|
| **30 Locations** | ✅ Data validation | ✅ UI navigation |
| **46 Actions** | ✅ API execution | ✅ Button clicks |
| **26 Building Types** | ✅ Type checking | ✅ Rendering |
| **16 Game Systems** | ✅ Endpoints | ✅ User workflows |
| **Energy Costs** | ✅ Validation | ✅ UI display |
| **Requirements** | ✅ Logic | ✅ Error messages |
| **Response Times** | ✅ API speed | ✅ UI responsiveness |
| **Error Handling** | ✅ Exceptions | ✅ User feedback |

### Test Results Summary

**Latest API Test Run:**
```
═══════════════════════════════════════════════════════════
📊 FINAL TEST REPORT
═══════════════════════════════════════════════════════════
Total Tests: 76
Validated: 76
Errors: 0
✅ No critical issues detected!

Duration: 0.18s
```

**Expected E2E Test Results:**
```
═══════════════════════════════════════════════════════════
📊 COMPREHENSIVE E2E TEST REPORT
═══════════════════════════════════════════════════════════
Locations Test: ✅ PASS (60s)
Actions Test:   ✅ PASS (90s)
Total Duration: 2.5 minutes
```

---

## When to Use Each Test Suite

### Use API Tests When:

✅ **Making backend changes**
- Modified database models
- Updated API endpoints
- Changed business logic
- Adjusted game balance

✅ **Frequent validation**
- During active development
- Before committing code
- Quick sanity checks
- CI/CD pipeline

✅ **Need speed**
- Running tests 10+ times per hour
- Tight development loops
- Automated testing

### Use E2E Tests When:

✅ **Making frontend changes**
- Updated UI components
- Changed routing
- Modified forms/interactions
- Adjusted styling

✅ **Before releases**
- Pre-deployment validation
- QA testing
- User acceptance testing
- Integration verification

✅ **Testing user experience**
- New features
- Complex workflows
- Multi-step processes
- Visual validation

### Use Both When:

✅ **Major releases**
✅ **Refactoring**
✅ **Adding new systems**
✅ **Fixing critical bugs**

---

## Development Workflow

### Recommended Testing Cadence

**During Development:**
```bash
# After every backend change
cd server && npm run validate:all

# After every frontend change
cd client && npm run dev
# Manual testing in browser
```

**Before Committing:**
```bash
# Run API tests
cd server && npm run validate:all

# Run E2E tests if UI changed
cd client && npm run test:comprehensive:e2e:headless
```

**Before Deploying:**
```bash
# Run all API tests
cd server && npm run test:comprehensive

# Run all E2E tests
cd client && npm run test:comprehensive:e2e:headless

# Check both pass before deploying
```

---

## Setting Up Tests

### Prerequisites

**For API Tests:**
1. MongoDB running locally
2. Server dependencies installed
3. Database seeded with locations/actions

```bash
cd server
npm install
npm run build
npm run validate:all
```

**For E2E Tests:**
1. Backend server running on port 5000
2. Frontend dev server running on port 3001
3. Puppeteer/Chromium installed

```bash
# Terminal 1: Start backend
cd server && npm start

# Terminal 2: Start frontend
cd client && npm run dev

# Terminal 3: Run E2E tests
cd client && npm run test:comprehensive:e2e
```

---

## File Structure

### API Test Files

```
server/
├── tests/comprehensive/
│   ├── allSystems.exhaustive.test.ts      # Tests all game systems
│   ├── allLocations.exhaustive.test.ts    # Tests all locations
│   ├── allActions.exhaustive.test.ts      # Tests all actions
│   ├── runAll.test.ts                     # Master orchestrator
│   └── README.md                          # API test documentation
├── runComprehensiveTests.js               # Fast validation script
├── jest.comprehensive.config.js            # Jest configuration
└── package.json                           # NPM scripts
```

### E2E Test Files

```
client/
├── tests/playtests/comprehensive/
│   ├── AllLocationsE2E.ts                 # Location UI tests
│   ├── AllActionsE2E.ts                   # Action UI tests
│   ├── runComprehensiveE2E.ts             # Master runner
│   └── README.md                          # E2E test documentation
├── tests/playtests/utils/
│   ├── BotBase.ts                         # Base test bot class
│   ├── BotLogger.ts                       # Logging utility
│   ├── BotSelectors.ts                    # UI selectors
│   └── PuppeteerHelpers.ts               # Browser helpers
└── package.json                           # NPM scripts
```

---

## Interpreting Results

### API Test Output

**✅ Success:**
```
✅ Red Gulch (settlement)
✅ Pickpocket Drunk (uncategorized)
```
All data valid, no issues found.

**⚠️ Warning:**
```
⚠️ 5 actions have invalid energy costs
```
Configuration issue that needs fixing.

**❌ Error:**
```
❌ Broken Location - Missing required fields
```
Data corruption or bug that must be fixed.

### E2E Test Output

**✅ Success:**
```
✅ Pickpocket Drunk - Executed successfully (567ms)
```
UI works correctly, action executed.

**⚠️ Requirements Not Met:**
```
⚠️ Bank Heist - Requirements not met (234ms)
```
Action exists but character can't execute (expected).

**❌ Error:**
```
❌ Missing Action - Error: Button not found
```
UI bug - action in database but not in UI.

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Comprehensive Tests

on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Start MongoDB
        uses: supercharge/mongodb-github-action@1.10.0

      - name: Install and test
        run: |
          cd server
          npm install
          npm run build
          npm run validate:all

  e2e-tests:
    runs-on: ubuntu-latest
    needs: api-tests
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd server && npm install
          cd ../client && npm install

      - name: Start servers
        run: |
          cd server && npm run build && npm start &
          cd client && npm run dev &
          sleep 10

      - name: Run E2E tests
        run: |
          cd client
          npm run test:comprehensive:e2e:headless
```

---

## Troubleshooting

### API Tests

**Problem:** Tests timeout
- Check MongoDB is running
- Verify connection string in `.env`
- Ensure database has seed data

**Problem:** All tests fail
- Run `npm run build` to recompile TypeScript
- Check server can start: `npm start`
- Verify models are loading correctly

### E2E Tests

**Problem:** Browser won't start
- Install Chromium: `npx puppeteer browsers install chrome`
- Or use system Chrome with environment variable

**Problem:** Login fails
- Check both servers are running
- Verify correct ports (5000 backend, 3001 frontend)
- Check CORS configuration

**Problem:** Elements not found
- Run in headed mode to see what's happening
- Update selectors in test files
- Add `data-` attributes to UI components

---

## Performance Optimization

### Speed Up API Tests

✅ Already optimized (< 1 second)
- Uses direct database queries
- No HTTP overhead
- Minimal processing

### Speed Up E2E Tests

```bash
# Use headless mode
HEADLESS=true npm run test:comprehensive:e2e

# Reduce slow-motion delay
SLOW_MO=10 npm run test:comprehensive:e2e

# Run individual suites
npm run test:locations:e2e  # Just locations
npm run test:actions:e2e    # Just actions
```

---

## Best Practices

### 1. Run Tests Often

```bash
# Quick check (every code change)
npm run validate:all

# Full check (before commit)
npm run test:comprehensive:e2e:headless
```

### 2. Watch for Patterns

If same tests fail repeatedly:
- Investigate root cause
- Fix underlying issue
- Don't ignore warnings

### 3. Keep Tests Updated

When adding new content:
```bash
# New location added
npm run validate:all  # Should auto-detect

# New action added
npm run validate:all  # Should auto-detect
```

### 4. Use in Development

```bash
# Start dev workflow
cd server && npm start
cd client && npm run dev

# Make changes...

# Quick validation
cd server && npm run validate:all
```

---

## Documentation

- [API Test Report](./COMPREHENSIVE_TEST_REPORT.md) - Latest results
- [API Test README](./server/tests/comprehensive/README.md) - Backend tests
- [E2E Test README](./client/tests/playtests/comprehensive/README.md) - Frontend tests
- [Testing Strategy](./docs/TESTING.md) - Overall approach

---

## Support

**Issues with tests?**
1. Check this guide first
2. Review specific README files
3. Check server/client logs
4. Open GitHub issue with details

**Want to extend tests?**
1. Review existing test files
2. Follow same patterns
3. Add new test methods
4. Update documentation

---

**Last Updated:** November 29, 2025
**Test Infrastructure Version:** 1.0.0
**Coverage:** 76 backend tests + Full UI testing
