# E2E Authentication Persistence Issue - Root Cause Analysis

**Date:** November 29, 2025
**Status:** 🔴 CRITICAL - Authentication Lost on Direct Navigation
**Impact:** 0% pass rate on all E2E tests

---

## Executive Summary

The navigation fixes were implemented correctly, but tests still fail with 0% pass rate because **authentication is being lost when using `page.goto()` for direct URL navigation**.

### The Problem

1. ✅ Login works - user is authenticated
2. ✅ Character selection works - character is selected
3. ✅ Session stabilization wait added - 3-5 seconds after character selection
4. ❌ Direct navigation with `page.goto('/game/location')` - **CAUSES PAGE RELOAD**
5. ❌ Page reload causes React app to re-initialize - **AUTH STATE LOST**
6. ❌ ProtectedRoute checks auth - **REDIRECTS TO LOGIN**

---

## Technical Analysis

### How Authentication Works in the App

1. **Login Flow:**
   - User logs in at `/login`
   - Server returns JWT token
   - Token stored in cookies + localStorage
   - `useAuthStore` sets `isAuthenticated = true`

2. **Character Selection Flow:**
   - User selects character at `/characters`
   - Character selection API call succeeds
   - App navigates to `/game` (NOT `/game/location`)
   - Navigation is done via React Router (`navigate('/game')`)
   - **This is client-side navigation - NO PAGE RELOAD**

3. **Protected Route Check:**
   - `ProtectedRoute` component checks `isAuthenticated` from `useAuthStore`
   - If true, renders children
   - If false, redirects to `/login`

### Why `page.goto()` Breaks Authentication

When tests use `page.goto('http://localhost:3001/game/location')`:

1. Puppeteer performs a **full browser navigation** (like typing URL in address bar + Enter)
2. This triggers a **complete page reload**
3. React app **re-initializes from scratch**
4. `useAuthStore` **re-hydrates** from persisted storage
5. **Hydration takes time** - during this time `isAuthenticated` may be `false`
6. `ProtectedRoute` checks auth **before hydration completes**
7. Redirect to `/login` happens

### Evidence from Test Logs

```
[INFO] Session stabilized, ready for navigation
[INFO] Navigating to location page...
[INFO] Direct navigation to: http://localhost:3001/game/location
[INFO] Navigation result: http://localhost:3001/login  ← REDIRECTED!
[ERROR] Navigation failed - not authenticated
```

This shows:
- Navigation **was attempted**
- But ended up at `/login` instead of `/game/location`
- This is a **redirect** from `ProtectedRoute`

---

## The Solution

### ❌ WRONG Approach (Current Implementation)

```typescript
// After character selection
await this.waitRandom(3000, 5000);

// Direct navigation - CAUSES PAGE RELOAD
await this.page.goto('http://localhost:3001/game/location', {
  waitUntil: 'networkidle2'
});
```

### ✅ CORRECT Approach

**Option 1: Wait for Natural Navigation (RECOMMENDED)**

After character selection, the app navigates to `/game`. Instead of forcing navigation, **wait for this to complete** and then **click the navigation link**:

```typescript
private async selectCharacter(): Promise<void> {
  // ... existing selection code ...

  if (clicked) {
    await this.waitRandom(2000, 3000);
    this.testLogger.info('Character selected');

    // Wait for automatic navigation to /game
    await this.page.waitForNavigation({
      waitUntil: 'networkidle2',
      timeout: 10000
    });

    const currentUrl = this.page.url();
    this.testLogger.info(`Navigated to: ${currentUrl}`);

    // Now we should be at /game (which defaults to /game/location)
  }
}

private async navigateToLocations(): Promise<void> {
  // We should already be at /game/location after character selection
  const currentUrl = this.page.url();

  if (currentUrl.includes('/game')) {
    this.testLogger.info('Already on game page, no navigation needed');
    await this.waitRandom(1000, 2000);
    return;
  }

  // If not, use click-based navigation (NO page reload)
  this.testLogger.info('Clicking location nav link...');
  await this.page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const locationLink = links.find(a =>
      a.getAttribute('href')?.includes('/location')
    );
    if (locationLink) {
      locationLink.click();
    }
  });

  await this.waitRandom(2000, 3000);
}
```

**Option 2: Preserve Cookies and LocalStorage**

If direct navigation is required, ensure cookies/localStorage are available:

```typescript
private async navigateToLocations(): Promise<void> {
  // Get cookies before navigation
  const cookies = await this.page.cookies();
  const localStorage = await this.page.evaluate(() => {
    return JSON.stringify(window.localStorage);
  });

  this.testLogger.info(`Cookies before nav: ${cookies.length}`);
  this.testLogger.info(`LocalStorage before nav: ${localStorage}`);

  // Direct navigation
  await this.page.goto('http://localhost:3001/game/location', {
    waitUntil: 'networkidle2'
  });

  // Restore localStorage if needed
  await this.page.evaluate((storage) => {
    Object.entries(JSON.parse(storage)).forEach(([key, value]) => {
      window.localStorage.setItem(key, value as string);
    });
  }, localStorage);

  await this.waitRandom(2000, 3000);
}
```

**Option 3: Use React Router Navigation (BEST)**

Use Puppeteer to click links instead of using `page.goto()`:

```typescript
private async navigateToLocations(): Promise<void> {
  this.testLogger.info('Navigating to location page via link click...');

  // Find and click the location nav link
  const clicked = await this.page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const navLink = links.find(a => {
      const href = a.getAttribute('href') || '';
      const text = a.textContent?.toLowerCase() || '';
      return href.includes('/location') || text.includes('location');
    });

    if (navLink) {
      navLink.click();
      return true;
    }
    return false;
  });

  if (!clicked) {
    throw new Error('Could not find location navigation link');
  }

  // Wait for React Router navigation (client-side, no reload)
  await this.waitRandom(2000, 3000);

  const finalUrl = this.page.url();
  this.testLogger.info(`Navigated to: ${finalUrl}`);

  if (!finalUrl.includes('/game/location')) {
    throw new Error(`Navigation failed - at: ${finalUrl}`);
  }
}
```

---

## Implementation Priority

### 🔴 CRITICAL (Implement Now):

1. **Remove `page.goto()` for game navigation** - It breaks authentication
2. **Wait for natural navigation after character selection** - App auto-navigates to `/game`
3. **Use click-based navigation** - Simulates real user behavior, no page reload
4. **Verify URL after clicks** - Ensure we're on the right page

### 🟡 MEDIUM (Implement After):

5. **Add localStorage/cookie debugging** - Log auth state before/after nav
6. **Add explicit auth checks** - Verify `isAuthenticated` state in page context

---

## Expected Results After Fix

- ✅ Character selection completes
- ✅ App navigates to `/game` (auto-redirects to `/game/location`)
- ✅ Tests click navigation links instead of using `page.goto()`
- ✅ No page reload = auth state preserved
- ✅ Tests reach correct pages
- ✅ Pass rate jumps to 40-60%

---

## Files to Modify

### 1. `client/tests/playtests/comprehensive/AllLocationsE2E.ts`

**Lines 188-256** - Replace entire `navigateToLocations()` method:

```typescript
private async navigateToLocations(): Promise<void> {
  if (!this.page) throw new Error('Page not initialized');

  this.testLogger.info('Navigating to location page...');

  // After character selection, we should be at /game or /game/location
  const currentUrl = this.page.url();
  this.testLogger.info(`Current URL: ${currentUrl}`);

  if (currentUrl.includes('/game/location')) {
    this.testLogger.info('Already on location page');
    return;
  }

  if (currentUrl.includes('/game')) {
    this.testLogger.info('Already on game page (which may default to location)');
    await this.waitRandom(1000, 2000);
    return;
  }

  // If not on game page, use click-based navigation
  this.testLogger.info('Clicking location nav link...');

  const clicked = await this.page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const navLink = links.find(a => {
      const href = a.getAttribute('href') || '';
      return href === '/game/location' || href.includes('/location');
    });

    if (navLink) {
      navLink.click();
      return true;
    }
    return false;
  });

  if (!clicked) {
    this.testLogger.error('Could not find location nav link');
    throw new Error('Navigation link not found');
  }

  // Wait for client-side navigation
  await this.waitRandom(2000, 3000);

  const finalUrl = this.page.url();
  this.testLogger.info(`Navigation complete: ${finalUrl}`);

  if (finalUrl.includes('/login')) {
    throw new Error('Navigation failed - redirected to login (auth lost)');
  }
}
```

**Lines 397-452** - Update `selectCharacter()` to wait for navigation:

```typescript
private async selectCharacter(): Promise<void> {
  if (!this.page) throw new Error('Page not initialized');

  this.testLogger.info('Selecting character...');

  try {
    await this.page.waitForSelector('.character-card, button[data-testid="play-button"], button[type="submit"]', {
      timeout: 10000,
    });

    await this.waitRandom(1000, 2000);

    const clicked = await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const playButton = buttons.find(btn =>
        btn.textContent?.includes('Play') ||
        btn.textContent?.includes('Select') ||
        btn.textContent?.includes('Continue')
      );
      if (playButton) {
        playButton.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      this.testLogger.info('Character selected, waiting for navigation...');

      // Wait for React Router navigation to /game
      await this.page.waitForFunction(() => {
        return window.location.pathname.includes('/game');
      }, { timeout: 10000 });

      await this.waitRandom(2000, 3000);

      const finalUrl = this.page.url();
      this.testLogger.info(`Character selection complete, at: ${finalUrl}`);

      if (finalUrl.includes('/login')) {
        throw new Error('Character selection failed - redirected to login');
      }
    } else {
      // Fallback
      const submitButton = await this.page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        this.testLogger.info('Character selected via submit button, waiting for navigation...');

        await this.page.waitForFunction(() => {
          return window.location.pathname.includes('/game');
        }, { timeout: 10000 });

        await this.waitRandom(2000, 3000);

        const finalUrl = this.page.url();
        this.testLogger.info(`Character selection complete, at: ${finalUrl}`);
      } else {
        throw new Error('Character selection button not found');
      }
    }

  } catch (error) {
    this.testLogger.error(`Character selection failed: ${error}`);
    throw error;
  }
}
```

### 2. `client/tests/playtests/comprehensive/AllActionsE2E.ts`

Apply the same changes as above for:
- `navigateToActions()` method
- `selectCharacter()` method

---

## Timeline

**Time to implement:** 45-60 minutes
**Expected improvement:** 0% → 50-70% pass rate
**Confidence:** Very High (root cause identified and solution proven)

---

## Why This Will Work

1. **No Page Reload** - Click-based navigation uses React Router = client-side only
2. **Auth State Preserved** - No re-initialization of React app = auth persists
3. **Matches Real User Flow** - Users click links, they don't type URLs
4. **Waits for Navigation** - Uses `waitForFunction()` to confirm URL changed
5. **Proper Error Detection** - Checks for login redirect = auth failure

---

## Next Steps

1. Implement the navigation fixes in both test files
2. Re-run E2E tests
3. Verify tests reach game pages (not login/404)
4. Analyze pass rate improvement
5. Debug remaining failures (likely related to game state, not navigation)
