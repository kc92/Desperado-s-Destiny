# Comprehensive E2E Testing Suite

Physical UI testing that validates **every location and every action** through actual browser automation using Puppeteer.

## Overview

The comprehensive E2E test suite automates a real browser to:
- ✅ Navigate to all 30 locations
- ✅ Execute all 46 game actions
- ✅ Validate UI responsiveness
- ✅ Measure performance
- ✅ Detect UI/UX issues
- ✅ Test real user workflows

## Quick Start

### Prerequisites

1. **Backend server must be running:**
   ```bash
   cd server
   npm start
   ```

2. **Frontend dev server must be running:**
   ```bash
   cd client
   npm run dev
   ```

### Run All Comprehensive Tests

From the `client` directory:

```bash
# Run with visible browser (recommended for first run)
npm run test:comprehensive:e2e

# Run headless (faster, for CI/CD)
npm run test:comprehensive:e2e:headless
```

### Run Individual Test Suites

```bash
# Test all locations only
npm run test:locations:e2e

# Test all actions only
npm run test:actions:e2e
```

## Test Files

### `AllLocationsE2E.ts`
Tests every location by physically navigating the UI.

**What it tests:**
- Location availability in UI
- Travel functionality
- Location rendering
- Navigation performance
- Building types
- Connection validation

**Output:**
```
═══════════════════════════════════════════════════════════
🗺️ COMPREHENSIVE LOCATION E2E TEST
═══════════════════════════════════════════════════════════

Testing: Red Gulch (settlement)...
  ✅ Red Gulch - Accessible (234ms)

Testing: The Frontera (settlement)...
  ✅ The Frontera - Accessible (456ms)

... [all 30 locations]

📊 LOCATION E2E TEST REPORT
═══════════════════════════════════════════════════════════

Total Locations Tested: 30
Accessible: 28 (93.3%)
Failed: 2 (6.7%)
Errors: 0

Results by Building Type:
  settlement: 3/3 accessible
  saloon: 2/2 accessible
  bank: 1/1 accessible
  ...
```

### `AllActionsE2E.ts`
Tests every action by clicking through the UI.

**What it tests:**
- Action availability
- Button/UI interaction
- Action execution
- Success/failure handling
- Energy costs
- Requirement validation
- Response times

**Output:**
```
═══════════════════════════════════════════════════════════
🎯 COMPREHENSIVE ACTION E2E TEST
═══════════════════════════════════════════════════════════

Testing: Pickpocket Drunk...
  ✅ Pickpocket Drunk - Executed successfully (567ms)

Testing: Bank Heist...
  ⚠️  Bank Heist - Requirements not met (234ms)

... [all 46 actions]

📊 ACTION E2E TEST REPORT
═══════════════════════════════════════════════════════════

Total Actions Tested: 46
Executable: 12 (26.1%)
Requirements Not Met: 32 (69.6%)
Failed: 2 (4.3%)
Errors: 0

Results by Category:
  criminal: 8/12 executable
  combat: 4/9 executable
  crafting: 0/4 executable (requires materials)
  ...

Average Response Time: 345ms
```

### `runComprehensiveE2E.ts`
Master orchestrator that runs both test suites in sequence.

**Features:**
- Unified reporting
- Total execution time
- Pass/fail summary
- CI/CD friendly (exits with code 1 on failure)

## Configuration

Set environment variables to customize test behavior:

```bash
# Base URL (default: http://localhost:3001)
export BASE_URL=http://localhost:3001

# Headless mode (default: false)
export HEADLESS=true

# Browser slow-motion delay in ms (default: 50)
export SLOW_MO=100

# Test user credentials
export TEST_EMAIL=e2e-tester@test.com
export TEST_PASSWORD=TestPassword123!
export TEST_CHARACTER=E2E Tester
```

## How It Works

### Test Flow

1. **Initialize Browser**
   - Launches Puppeteer
   - Sets up console/error monitoring
   - Configures viewport (1920x1080)

2. **Login**
   - Navigates to landing page
   - Clicks login link
   - Fills credentials
   - Submits form

3. **Select Character**
   - Waits for character selection screen
   - Selects configured character
   - Navigates to game dashboard

4. **Run Tests**
   - **Locations:** Navigates to each location, validates travel
   - **Actions:** Executes each action, checks response

5. **Generate Report**
   - Compiles results
   - Calculates statistics
   - Outputs formatted report

6. **Cleanup**
   - Closes browser
   - Exits with appropriate code

### UI Navigation Strategies

The tests use multiple fallback strategies to find UI elements:

**For Locations:**
1. Data attributes (`[data-location-name]`)
2. Dropdown/select elements
3. XPath text search
4. Direct URL navigation

**For Actions:**
1. Data attributes (`[data-action-name]`)
2. Button text matching
3. XPath text search
4. CSS class selectors

## Test Results Interpretation

### ✅ Success
```
✅ Pickpocket Drunk - Executed successfully (567ms)
```
Action button was found and clicked, received success response.

### ⚠️ Requirements Not Met
```
⚠️ Bank Heist - Requirements not met (234ms)
```
Action exists and is clickable, but character doesn't meet requirements (expected behavior).

### ❌ Error
```
❌ Broken Action - Error: Button not found
```
Action is in database but not visible/clickable in UI (actual bug).

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd server && npm install
          cd ../client && npm install

      - name: Build server
        run: cd server && npm run build

      - name: Start server
        run: cd server && npm start &

      - name: Start client
        run: cd client && npm run dev &

      - name: Wait for servers
        run: sleep 10

      - name: Run comprehensive E2E tests
        run: cd client && npm run test:comprehensive:e2e:headless
        env:
          BASE_URL: http://localhost:3001
          HEADLESS: true
```

## Debugging

### View tests in action

Run with visible browser:
```bash
npm run test:comprehensive:e2e
```

### Slow down execution

Increase slow-motion delay:
```bash
SLOW_MO=200 npm run test:comprehensive:e2e
```

### Check console output

The tests automatically log browser console messages. Check terminal output for:
- `ERROR` messages from browser
- Page errors
- Network failures

### Screenshots on failure

Modify the test files to add screenshot capture:

```typescript
try {
  // ... test code
} catch (error) {
  await this.page!.screenshot({
    path: `./screenshots/error-${Date.now()}.png`
  });
  throw error;
}
```

## Performance Benchmarks

Expected execution times:

| Test Suite | Locations | Actions | Total |
|------------|-----------|---------|-------|
| **Duration** | ~60-90s | ~90-120s | ~3-4min |
| **Headless** | ~40-60s | ~60-90s | ~2-3min |

Factors affecting performance:
- Network speed
- Server response time
- Database queries
- UI rendering
- Animation delays

## Comparison with API Tests

| Aspect | E2E Tests | API Tests |
|--------|-----------|-----------|
| **Speed** | Slower (~3min) | Fast (<1s) |
| **Coverage** | UI + API + Database | API + Database only |
| **Accuracy** | Tests real user experience | Tests backend logic |
| **Debugging** | Visual - can see failures | Code-level errors |
| **CI/CD** | Heavier (needs browser) | Lightweight |

**Best Practice:** Use both!
- **API tests** for fast validation and CI/CD
- **E2E tests** for comprehensive UI/UX validation before releases

## Extending Tests

### Add new location test

```typescript
private async testSpecialLocation(location: string): Promise<void> {
  // Navigate to location
  await this.travelToLocation(location);

  // Custom validation
  const hasSpecialFeature = await this.page!.evaluate(() => {
    return document.querySelector('.special-feature') !== null;
  });

  expect(hasSpecialFeature).toBe(true);
}
```

### Add new action test

```typescript
private async testComplexAction(actionName: string): Promise<void> {
  // Click action
  await this.executeAction(actionName);

  // Wait for result modal
  await this.page!.waitForSelector('.result-modal');

  // Validate result details
  const result = await this.page!.evaluate(() => {
    return document.querySelector('.result-details')?.textContent;
  });

  expect(result).toContain('Success');
}
```

## Troubleshooting

### Tests fail to login

- Check server is running
- Verify credentials
- Check for CORS errors
- Ensure frontend is on correct port

### Browser won't start

```bash
# Install Chromium dependencies (Linux)
sudo apt-get install -y chromium-browser

# Or use system Chrome
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

### Timeouts

Increase timeout in test files:
```typescript
await this.page.waitForSelector('.element', { timeout: 30000 }); // 30 seconds
```

### Element not found

The test will try multiple strategies. If all fail:
1. Inspect page HTML
2. Update selectors in test file
3. Add data attributes to UI components

## Related Documentation

- [BotBase.ts](../utils/BotBase.ts) - Base class for all test bots
- [PuppeteerHelpers.ts](../utils/PuppeteerHelpers.ts) - Shared UI interaction helpers
- [COMPREHENSIVE_TEST_REPORT.md](../../../COMPREHENSIVE_TEST_REPORT.md) - API test results

---

**Last Updated:** November 29, 2025
**Test Suite Version:** 1.0.0
