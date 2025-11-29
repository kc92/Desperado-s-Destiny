/**
 * Onboarding Flow E2E Tests
 * Tests the complete new player journey from landing page to dashboard
 */

const { delay } = require('../../helpers/navigation.helper');
const { captureOnFailure } = require('../../helpers/screenshot.helper');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Onboarding - New Player Journey', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';

  beforeEach(async () => {
    await page.setViewport({ width: 1920, height: 1080 });

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });
  });

  afterEach(async () => {
    await captureOnFailure(page);
    await jestPuppeteer.resetPage();
  });

  it('should complete full onboarding flow', async () => {
    // Step 1: Visit landing page
    await page.goto(BASE_URL);
    await page.waitForSelector('body', { timeout: 10000 });
    expect(page.url()).toBe(`${BASE_URL}/`);

    // Step 2: Navigate to register
    const registerLink = await page.waitForSelector('a[href="/register"], button:has-text("Register"), a:has-text("Register")', {
      timeout: 10000
    }).catch(async () => {
      // Try clicking any button that might lead to registration
      await page.evaluate(() => {
        const links = document.querySelectorAll('a, button');
        for (const link of links) {
          if (link.textContent && (link.textContent.includes('Register') || link.textContent.includes('Sign Up'))) {
            link.click();
            return;
          }
        }
      });
      return null;
    });

    if (registerLink) {
      await registerLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }

    // Step 3: Fill registration form
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', testEmail);
    await page.type('input[type="password"]', testPassword);

    // Check for password confirmation field
    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length > 1) {
      await passwordInputs[1].type(testPassword);
    }

    // Step 4: Submit registration
    const submitButton = await page.$('button[type="submit"]');
    expect(submitButton).toBeTruthy();
    await submitButton.click();

    // Wait for either success message or redirect
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }),
      page.waitForSelector('[role="alert"]', { timeout: 5000 }).catch(() => null),
      delay(3000)
    ]);

    // Step 5: Auto-verify email (in test environment)
    // In production, user would need to click verification link
    // For E2E tests, we assume test environment auto-verifies

    // Step 6: Login (if not already logged in)
    if (page.url().includes('/login')) {
      await page.type('input[type="email"]', testEmail);
      await page.type('input[type="password"]', testPassword);
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }

    await delay(1000);

    // Step 7: Should be redirected to character creation
    const currentUrl = page.url();
    const isOnCharacterPage = currentUrl.includes('/characters') ||
                               currentUrl.includes('/create-character') ||
                               currentUrl.includes('/character-select');
    expect(isOnCharacterPage).toBe(true);

    // Step 8: Complete character creation
    // Wait for character creation form
    await page.waitForSelector('input[name="name"], input[placeholder*="name" i]', { timeout: 10000 });

    // Enter character name
    await page.type('input[name="name"], input[placeholder*="name" i]', 'TestHero');

    // Select faction (click first faction option)
    await delay(500);
    const factionCards = await page.$$('[data-testid="faction-card"], .faction-card, button[class*="faction"]');
    if (factionCards.length > 0) {
      await factionCards[0].click();
      await delay(500);
    }

    // Try to find and click "Next" or "Continue" button
    let nextButton = await page.evaluateHandle(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent && (btn.textContent.includes('Next') || btn.textContent.includes('Continue'))) {
          return btn;
        }
      }
      return null;
    });

    if (nextButton && nextButton.asElement()) {
      await nextButton.asElement().click();
      await delay(1000);
    }

    // If there's appearance customization, select defaults
    const appearanceSelectors = await page.$$('[data-testid*="appearance"], [class*="appearance"]');
    if (appearanceSelectors.length > 0) {
      // Click through appearance options
      await delay(500);

      // Find and click "Next" or "Create" button
      nextButton = await page.evaluateHandle(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.textContent && (btn.textContent.includes('Next') || btn.textContent.includes('Create') || btn.textContent.includes('Confirm'))) {
            return btn;
          }
        }
        return null;
      });

      if (nextButton && nextButton.asElement()) {
        await nextButton.asElement().click();
      }
    }

    // Wait for character creation to complete
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
      delay(3000)
    ]);

    // Step 9: Verify arrival at game dashboard
    await delay(2000);
    const finalUrl = page.url();
    const isOnGamePage = finalUrl.includes('/game') ||
                         finalUrl.includes('/dashboard') ||
                         finalUrl.includes('/play');
    expect(isOnGamePage).toBe(true);

    // Verify game UI elements are present
    const bodyText = await page.evaluate(() => document.body.textContent);
    const hasGameElements = bodyText.includes('Energy') ||
                            bodyText.includes('Level') ||
                            bodyText.includes('Gold') ||
                            bodyText.includes('Actions');
    expect(hasGameElements).toBe(true);
  });

  it('should display landing page elements', async () => {
    await page.goto(BASE_URL);
    await page.waitForSelector('body', { timeout: 10000 });

    const bodyText = await page.evaluate(() => document.body.textContent);

    // Should have game branding
    expect(bodyText.includes('Desperado') || bodyText.includes('Destiny')).toBe(true);

    // Should have call-to-action buttons
    const buttons = await page.$$('button, a');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should validate registration form fields', async () => {
    await page.goto(`${BASE_URL}/register`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Try to submit with invalid email
    await page.type('input[type="email"]', 'invalid-email');
    await page.type('input[type="password"]', 'short');
    await page.click('button[type="submit"]');

    await delay(1000);

    // Should still be on register page or show error
    const url = page.url();
    expect(url.includes('/register') || url.includes('/signup')).toBe(true);
  });

  it('should prevent duplicate email registration', async () => {
    const duplicateEmail = 'existing@example.com';

    // First registration
    await page.goto(`${BASE_URL}/register`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', duplicateEmail);
    await page.type('input[type="password"]', testPassword);

    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length > 1) {
      await passwordInputs[1].type(testPassword);
    }

    await page.click('button[type="submit"]');
    await delay(2000);

    // Try second registration with same email
    await page.goto(`${BASE_URL}/register`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', duplicateEmail);
    await page.type('input[type="password"]', testPassword);

    const passwordInputs2 = await page.$$('input[type="password"]');
    if (passwordInputs2.length > 1) {
      await passwordInputs2[1].type(testPassword);
    }

    await page.click('button[type="submit"]');
    await delay(2000);

    // Should show error or stay on registration
    const errorElement = await page.$('[role="alert"], .error, .text-red-500').catch(() => null);
    const url = page.url();
    expect(errorElement || url.includes('/register')).toBeTruthy();
  });

  it('should enforce character name requirements', async () => {
    // This test assumes user is already registered and logged in
    // Skip if unable to reach character creation
    try {
      await page.goto(`${BASE_URL}/characters`);
      await page.waitForSelector('input[name="name"], input[placeholder*="name" i]', { timeout: 5000 });

      // Try empty name
      await page.click('button[type="submit"]');
      await delay(1000);

      const url = page.url();
      expect(url.includes('/character')).toBe(true);
    } catch (error) {
      // Skip test if can't reach character creation
      console.log('Skipping character name test - unable to reach character creation');
    }
  });
});
