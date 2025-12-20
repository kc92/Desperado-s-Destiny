/**
 * Authentication Helper for Playwright
 * Utilities for login, logout, and character selection
 */
import { Page, expect } from '@playwright/test';
import { TestUser, TestCharacter, delay } from '../fixtures/test-data';

/**
 * Register a new test user
 */
export async function registerTestUser(page: Page, userData: TestUser): Promise<boolean> {
  const { username, email, password } = userData;

  try {
    await page.goto('/register');
    await page.waitForSelector('input[name="username"], input[type="text"]', { timeout: 10000 });

    // Fill username first and wait for async validation
    const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
    await usernameInput.fill(username);
    await delay(1000); // Wait for debounced validation

    // Fill email
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    await emailInput.fill(email);
    await delay(500);

    // Fill password fields
    const passwordInputs = page.locator('input[type="password"]');
    const count = await passwordInputs.count();
    if (count >= 2) {
      await passwordInputs.nth(0).fill(password);
      await delay(200);
      await passwordInputs.nth(1).fill(password);
      await delay(500);
    }

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for navigation or error
    await Promise.race([
      page.waitForURL('**/characters', { timeout: 10000 }),
      page.waitForSelector('[role="alert"], .error, .success, .text-red-500', { timeout: 5000 })
        .catch(() => null)
    ]);

    // Check if registration successful
    if (page.url().includes('/characters')) {
      console.log(`✅ Registration successful: ${email}`);
      return true;
    }

    // Check for error messages
    const errorElement = page.locator('[role="alert"], .error, .text-red-500').first();
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      console.error(`❌ Registration failed: ${errorText}`);
      return false;
    }

    console.log(`⚠️ Registration outcome unclear for: ${email}`);
    return false;
  } catch (error) {
    console.error(`❌ Registration error for ${email}:`, error);
    return false;
  }
}

/**
 * Login with credentials
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.waitForSelector('input[type="email"]');

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  // Wait for navigation or error
  await Promise.race([
    page.waitForURL('**/characters', { timeout: 10000 }),
    page.waitForURL('**/game/**', { timeout: 10000 }),
    page.waitForSelector('.text-red-500', { timeout: 5000 }).catch(() => null)
  ]);
}

/**
 * Create a character
 */
export async function createCharacter(page: Page, character: TestCharacter): Promise<boolean> {
  try {
    // Wait for character creation button or existing character cards
    await page.waitForSelector('[data-testid="create-first-character-button"], .character-card', { timeout: 5000 });

    // Click create button if it exists
    const createButton = page.locator('[data-testid="create-first-character-button"]');
    if (await createButton.isVisible()) {
      await createButton.click();
      console.log('✅ Clicked "Create Your First Character" button');

      // Wait for character creator modal
      await page.waitForSelector('[data-testid^="faction-card"]', { timeout: 3000 });
      console.log('✅ Character creator modal opened');
    }

    // Fill character name
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill(character.name);
      console.log(`✅ Entered character name: ${character.name}`);
    }

    await delay(500);

    // Select faction
    let factionButton = page.locator(`[data-testid="faction-card-${character.faction}"]`);
    if (!(await factionButton.isVisible())) {
      factionButton = page.locator('[data-testid^="faction-card-"]').first();
    }
    await factionButton.click();
    console.log('✅ Selected faction');

    await delay(1000);

    // Click Next
    const nextButton = page.locator('[data-testid="character-next-button"]');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      console.log('✅ Clicked Next button');
    }

    await delay(1000);

    // Click Create
    const createCharacterButton = page.locator('[data-testid="character-create-button"]');
    if (await createCharacterButton.isVisible()) {
      await createCharacterButton.click();
      console.log('✅ Clicked Create Character button');
    }

    // Wait for modal to close
    await page.waitForFunction(() => {
      const hasModal = document.querySelector('[role="dialog"], .modal, [class*="modal"]');
      return !hasModal;
    }, { timeout: 15000 });

    // Wait for character to be fully loaded (check for gold display)
    await page.waitForFunction(() => {
      const goldElements = document.querySelectorAll('[class*="gold"], [class*="Gold"]');
      for (const el of goldElements) {
        const text = el.textContent || '';
        const goldMatch = text.match(/(\d+)/);
        if (goldMatch && parseInt(goldMatch[1]) > 0) return true;
      }
      return false;
    }, { timeout: 15000 });

    console.log('✅ Character created successfully');
    return true;
  } catch (error) {
    console.error('❌ Character creation failed:', error);
    return false;
  }
}

/**
 * Full registration and character creation flow
 */
export async function registerAndCreateCharacter(
  page: Page,
  user: TestUser,
  character: TestCharacter
): Promise<boolean> {
  console.log('📝 Registering test user...');
  const registered = await registerTestUser(page, user);
  if (!registered) {
    throw new Error('Failed to register test user');
  }
  console.log('✅ Test user registered successfully');

  console.log('🎭 Creating test character...');
  await delay(2000);
  const created = await createCharacter(page, character);
  if (!created) {
    throw new Error('Failed to create character');
  }
  console.log('✅ Character created and authenticated');

  return true;
}

/**
 * Logout
 */
export async function logout(page: Page): Promise<void> {
  try {
    // Try to find and click logout button
    const logoutButton = page.locator('[data-testid="logout"], button:has-text("Logout"), button:has-text("Log out")').first();

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await delay(2000);
    }

    // Clear all cookies and local storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.context().clearCookies();
  } catch (error) {
    console.error('Logout error:', error);
    // Even if logout button fails, clear session data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some(c => c.name === 'token');
}

/**
 * Wait for authentication state to be ready
 */
export async function waitForAuthState(page: Page, timeout = 10000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const url = page.url();
      const cookies = await page.context().cookies();
      const hasAuthCookie = cookies.some(c => c.name === 'token');

      if (url.includes('/game') && hasAuthCookie) {
        console.log('✅ Auth state confirmed: on /game with auth cookie');
        return true;
      }

      await delay(200);
    } catch {
      await delay(200);
    }
  }

  console.log('⚠️ Timeout waiting for auth state');
  return false;
}
