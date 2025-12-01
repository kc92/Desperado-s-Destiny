# E2E Character Selection Failure - Critical Findings

**Date:** November 29, 2025
**Status:** 🔴 CRITICAL - Character Selection Redirecting to Login
**Impact:** Tests cannot proceed past character selection

---

## Executive Summary

The E2E tests are failing because **character selection itself is causing a redirect to the login page**. This indicates either:
1. The character selection API is failing with an authentication error
2. The authentication token is not being sent with the request
3. The server is rejecting the character selection request

### Test Evidence

```
[INFO] Logging in...
[INFO] Login complete
[INFO] Selecting character...
[INFO] Character selected via submit button, waiting for navigation...
[INFO] Character selection complete, at: http://localhost:3001/login  ← PROBLEM!
[ERROR] Character selection failed: Error: Character selection failed - redirected to login
```

**The flow:**
1. ✅ Login successful - user authenticated
2. ✅ Navigate to character selection page
3. ✅ Find and click character "Play" button
4. ❌ **Page redirects to LOGIN instead of /game**
5. ❌ Tests fail

---

## Root Cause Analysis

### Hypothesis 1: Character Selection API Failure

When the user clicks the "Play" button in `CharacterSelect.tsx`:

```typescript
const handleSelectCharacter = async (id: string) => {
  try {
    await selectCharacter(id);  // API call
    navigate('/game');           // If successful
  } catch (error) {
    console.error('Failed to select character:', error);
  }
}
```

If `selectCharacter(id)` throws an error due to authentication failure:
- The `navigate('/game')` never executes
- React Router's `ProtectedRoute` kicks in
- User is redirected to `/login`

### Hypothesis 2: Test User Has No Characters

The test is trying to select a character that doesn't exist:
- Test expects character "Quick Draw McGraw"
- But the test user (test@example.com) may not have any characters
- Clicking a non-existent character button fails

### Hypothesis 3: Puppeteer Not Waiting for Character Load

The character selection screen may not have finished loading when the test clicks:
- Characters are fetched via API (`loadCharacters()`)
- Test clicks before characters are rendered
- Wrong button is clicked (maybe a submit button that doesn't do anything)

---

## Investigation Required

### 1. Check if Test User Has Characters

Run this MongoDB query:

```bash
docker exec -it desperados-mongo mongosh desperados-destiny
db.characters.find({ userId: ObjectId("...") })  # Find test user's ID first
```

Or via the API:

```bash
curl http://localhost:5000/api/characters \
  -H "Authorization: Bearer <test_user_token>"
```

### 2. Check Character Selection API

The character selection endpoint is likely:
```
POST /api/characters/select/:characterId
```

Check if this endpoint:
- Requires authentication (should use `requireAuth` middleware)
- Validates the character belongs to the user
- Returns proper error codes

### 3. Check Frontend Error Handling

In `CharacterSelect.tsx`, check if errors are being swallowed:

```typescript
const handleSelectCharacter = async (id: string) => {
  try {
    await selectCharacter(id);
    navigate('/game');
  } catch (error) {
    console.error('Failed to select character:', error);  // Is this being logged?
  }
}
```

The error might be logged to console but not visible in Puppeteer.

### 4. Add Puppeteer Console Logging

Update the test to capture browser console logs:

```typescript
this.page.on('console', msg => {
  this.testLogger.info(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
});

this.page.on('pageerror', error => {
  this.testLogger.error(`[BROWSER ERROR] ${error.message}`);
});
```

---

## Immediate Next Steps

### Step 1: Create Test Character (5 minutes)

Create a character for the test user manually:

```typescript
// In server/createTestUser.js or similar
const character = await Character.create({
  userId: testUser._id,
  name: "Quick Draw McGraw",
  level: 1,
  // ... other required fields
});
```

### Step 2: Update Test to Check for Characters (10 minutes)

Before clicking the Play button, verify characters are loaded:

```typescript
private async selectCharacter(): Promise<void> {
  // Wait for characters to load
  await this.page.waitForSelector('.character-card', { timeout: 10000 });

  const characterCount = await this.page.evaluate(() => {
    return document.querySelectorAll('.character-card').length;
  });

  this.testLogger.info(`Found ${characterCount} characters`);

  if (characterCount === 0) {
    throw new Error('No characters found for test user');
  }

  // Now click Play button...
}
```

###Step 3: Add Console Logging (5 minutes)

```typescript
// In AllLocationsE2E.ts and AllActionsE2E.ts, in run() method
this.page!.on('console', msg => {
  this.testLogger.info(`[BROWSER] ${msg.type()}: ${msg.text()}`);
});

this.page!.on('pageerror', error => {
  this.testLogger.error(`[BROWSER ERROR] ${error.message}`);
});

this.page!.on('requestfailed', request => {
  this.testLogger.error(`[REQUEST FAILED] ${request.url()}: ${request.failure()?.errorText}`);
});
```

### Step 4: Take Screenshot Before Character Selection (2 minutes)

```typescript
await this.page.screenshot({
  path: `./test-screenshots/before-character-select-${Date.now()}.png`,
  fullPage: true
});
```

This will show us:
- Are characters visible?
- What buttons are available?
- What's the actual state of the page?

---

## Expected Results After Investigation

**If test user has no characters:**
- Create characters via seed script
- Tests should pass character selection

**If API is failing:**
- Fix authentication middleware
- Fix character selection endpoint
- Tests should work

**If Puppeteer timing issue:**
- Add proper waits for character loading
- Tests should work

---

## Files to Modify

### 1. Create Test Data Script

**File:** `server/createTestCharacter.js`

```javascript
const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const Character = require('./src/models/Character.model');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/desperados-destiny');

  const testUser = await User.findOne({ email: 'test@example.com' });
  if (!testUser) {
    console.error('Test user not found!');
    process.exit(1);
  }

  // Delete existing test characters
  await Character.deleteMany({ userId: testUser._id });

  // Create new test character
  const character = await Character.create({
    userId: testUser._id,
    name: "Quick Draw McGraw",
    level: 1,
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    gold: 1000,
    currentLocation: 'red-gulch',  // Or whatever the default starting location is
    // Add other required fields
  });

  console.log('Test character created:', character.name);
  process.exit(0);
}

main();
```

### 2. Update Tests with Console Logging

**Files:**
- `client/tests/playtests/comprehensive/AllLocationsE2E.ts`
- `client/tests/playtests/comprehensive/AllActionsE2E.ts`

Add at the start of `run()` method:

```typescript
// Capture browser console logs
this.page!.on('console', msg => {
  const type = msg.type();
  const text = msg.text();
  if (type === 'error') {
    this.testLogger.error(`[BROWSER] ${text}`);
  } else if (type === 'warning') {
    this.testLogger.warn(`[BROWSER] ${text}`);
  } else {
    this.testLogger.info(`[BROWSER] ${text}`);
  }
});

// Capture page errors
this.page!.on('pageerror', error => {
  this.testLogger.error(`[BROWSER ERROR] ${error.message}\\n${error.stack}`);
});

// Capture failed requests
this.page!.on('requestfailed', request => {
  const failure = request.failure();
  this.testLogger.error(`[REQUEST FAILED] ${request.method()} ${request.url()}: ${failure?.errorText}`);
});
```

### 3. Update Character Selection with Better Checks

In `selectCharacter()` method:

```typescript
private async selectCharacter(): Promise<void> {
  if (!this.page) throw new Error('Page not initialized');

  this.testLogger.info('Selecting character...');

  try {
    // Take screenshot BEFORE character selection
    await this.page.screenshot({
      path: `./test-screenshots/before-char-select-${Date.now()}.png`,
      fullPage: true
    });

    // Wait for character selection screen
    await this.page.waitForSelector('.character-card, button[type="submit"]', {
      timeout: 10000,
    });

    await this.waitRandom(1000, 2000);

    // Count characters on page
    const characterInfo = await this.page.evaluate(() => {
      const cards = document.querySelectorAll('.character-card');
      const playButtons = document.querySelectorAll('button');
      return {
        cardCount: cards.length,
        buttonCount: playButtons.length,
        pageUrl: window.location.href,
        pageTitle: document.title
      };
    });

    this.testLogger.info(`Page state: ${JSON.stringify(characterInfo)}`);

    // Rest of character selection logic...
  } catch (error) {
    // Take screenshot on error
    await this.page.screenshot({
      path: `./test-screenshots/char-select-error-${Date.now()}.png`,
      fullPage: true
    });

    this.testLogger.error(`Character selection failed: ${error}`);
    throw error;
  }
}
```

---

## Timeline

**Investigation:** 20-30 minutes
**Fix implementation:** 15-30 minutes (depending on root cause)
**Total:** 35-60 minutes

---

## Conclusion

The character selection is failing and causing a redirect to login. This is likely due to:
1. Missing test character data
2. API authentication failure
3. Timing issues with page load

We need to:
1. Add console/network logging to see what's failing
2. Verify test user has characters
3. Take screenshots to see actual page state
4. Debug the character selection API call

This is blocking all E2E tests and must be resolved before we can test navigation fixes.
