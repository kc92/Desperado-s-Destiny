/**
 * Authentication Helper
 * Utilities for login, logout, and character selection
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

/**
 * Login with credentials
 */
async function login(page, email, password) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('input[type="email"]');

  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for navigation or error
  await Promise.race([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.waitForSelector('.text-red-500', { timeout: 5000 }).catch(() => null),
  ]);
}

/**
 * Select a character by index
 */
async function selectCharacter(page, characterIndex = 0) {
  await page.waitForSelector('[data-testid="character-card"], .character-card', { timeout: 10000 });

  const cards = await page.$$('[data-testid="character-card"], .character-card');
  if (cards.length > characterIndex) {
    await cards[characterIndex].click();
  }

  // Click play/select button by finding button with matching text
  const playButton = await page.evaluateHandle(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent && (btn.textContent.includes('Play') || btn.textContent.includes('Select'))) {
        return btn;
      }
    }
    return null;
  });

  if (playButton && playButton.asElement()) {
    await playButton.asElement().click();
  }

  await page.waitForNavigation({ waitUntil: 'networkidle0' });
}

/**
 * Full login flow: login + character selection
 */
async function loginAndSelectCharacter(page, email, password, characterIndex = 0) {
  await login(page, email, password);

  // Check if redirected to character selection
  if (page.url().includes('/characters')) {
    await selectCharacter(page, characterIndex);
  }
}

/**
 * Logout
 */
async function logout(page) {
  try {
    // Try to find and click logout button
    let logoutButton = await page.$('[data-testid="logout"]');
    if (!logoutButton) {
      logoutButton = await page.evaluateHandle(() => {
        const buttons = document.querySelectorAll('button, a');
        for (const btn of buttons) {
          const text = btn.textContent || '';
          if (text.toLowerCase().includes('logout') || text.toLowerCase().includes('log out')) {
            return btn;
          }
        }
        return null;
      });
    }

    if (logoutButton && (logoutButton.asElement ? logoutButton.asElement() : logoutButton)) {
      await (logoutButton.asElement ? logoutButton.asElement() : logoutButton).click();
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
    }

    // Clear all cookies and local storage to ensure complete logout
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    const cookies = await page.cookies();
    if (cookies.length > 0) {
      await page.deleteCookie(...cookies);
    }
  } catch (error) {
    console.error('Logout error:', error.message);
    // Even if logout button fails, clear session data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    const cookies = await page.cookies();
    if (cookies.length > 0) {
      await page.deleteCookie(...cookies);
    }
  }
}

/**
 * Check if user is authenticated
 */
async function isAuthenticated(page) {
  const cookies = await page.cookies();
  return cookies.some(c => c.name === 'token');
}

/**
 * Get current user from page state
 */
async function getCurrentUser(page) {
  return page.evaluate(() => {
    const state = localStorage.getItem('auth-storage');
    if (state) {
      const parsed = JSON.parse(state);
      return parsed.state?.user || null;
    }
    return null;
  });
}

/**
 * Wait for React auth state to be ready after login
 * Waits for the page to be on a game route (not login/register) and have the auth cookie
 * @param {Page} page - Puppeteer page object
 * @param {number} timeout - Max wait time in ms
 * @returns {Promise<boolean>} - True if authenticated
 */
async function waitForAuthState(page, timeout = 10000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      // Check if we're on a game page (not login/register) and have auth cookie
      const url = page.url();
      const cookies = await page.cookies();
      const hasAuthCookie = cookies.some(c => c.name === 'token');

      // If we're on /game route and have auth cookie, we're authenticated
      if (url.includes('/game') && hasAuthCookie) {
        console.log('✅ Auth state confirmed: on /game with auth cookie');
        return true;
      }

      // Small delay before next check
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      // Page might be navigating, continue waiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  console.log('⚠️  Timeout waiting for auth state - proceeding anyway');
  return false;
}

/**
 * Get current character from page state
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<Object|null>} - Current character object or null
 */
async function getCurrentCharacter(page) {
  return page.evaluate(() => {
    const state = localStorage.getItem('character-storage');
    if (state) {
      const parsed = JSON.parse(state);
      return parsed.state?.currentCharacter || null;
    }
    return null;
  });
}

/**
 * Wait for authentication state to be ready
 * Polls localStorage until auth state is available
 * @param {Page} page - Puppeteer page object
 * @param {number} [timeout=5000] - Timeout in milliseconds
 * @returns {Promise<boolean>} - True if authenticated, false if timeout
 */
async function waitForAuth(page, timeout = 5000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const authenticated = await isAuthenticated(page);
    const user = await getCurrentUser(page);

    if (authenticated && user) {
      return true;
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return false;
}

/**
 * Register a new test user
 * Complete registration flow with all required fields
 * @param {Page} page - Puppeteer page object
 * @param {Object} userData - User data object
 * @param {string} userData.username - Username (3-30 chars)
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password
 * @returns {Promise<boolean>} - True if registration successful
 */
async function registerTestUser(page, userData) {
  const { username, email, password } = userData;

  try {
    // Navigate to registration page
    await page.goto(`${BASE_URL}/register`);
    await page.waitForSelector('input[name="username"], input[type="text"]', { timeout: 10000 });

    // Fill registration form
    // IMPORTANT: Fill username first and wait for async validation
    const usernameInput = await page.$('input[name="username"], input[type="text"]');
    if (usernameInput) {
      await usernameInput.type(username);
      // Wait for debounced username validation (500ms debounce + network time)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Fill email
    const emailInput = await page.$('input[name="email"], input[type="email"]');
    if (emailInput) {
      await emailInput.type(email);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Fill password fields
    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length >= 2) {
      await passwordInputs[0].type(password);
      await new Promise(resolve => setTimeout(resolve, 200));
      await passwordInputs[1].type(password);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Submit form
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
    }

    // Wait for one of three outcomes: navigation, error, or success message
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
      page.waitForSelector('[role="alert"], .error, .success, .text-red-500', { timeout: 5000 }),
      new Promise(resolve => setTimeout(resolve, 3000))
    ]);

    // Check if registration successful (redirected to /characters)
    const currentUrl = page.url();
    if (currentUrl.includes('/characters')) {
      console.log(`✅ Registration successful: ${email}`);
      return true;
    }

    // Check for error messages
    const errorElement = await page.$('[role="alert"], .error, .text-red-500');
    if (errorElement) {
      const errorText = await page.evaluate(el => el.textContent, errorElement);
      console.error(`❌ Registration failed: ${errorText}`);
      return false;
    }

    console.log(`⚠️ Registration outcome unclear for: ${email}`);
    return false;
  } catch (error) {
    console.error(`❌ Registration error for ${email}:`, error.message);
    return false;
  }
}

/**
 * Login and select a specific character by name
 * Alternative to loginAndSelectCharacter that selects by name instead of index
 * @param {Page} page - Puppeteer page object
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} characterName - Name of character to select
 * @returns {Promise<boolean>} - True if login and selection successful
 */
async function loginWithCharacter(page, email, password, characterName) {
  try {
    // Perform login
    await login(page, email, password);

    // Check if redirected to character selection
    if (!page.url().includes('/characters')) {
      console.log(`❌ Not redirected to character selection page`);
      return false;
    }

    // Wait for character cards to load
    await page.waitForSelector('[data-testid="character-card"], .character-card', { timeout: 10000 });

    // Find character card by name
    const characterFound = await page.evaluate((targetName) => {
      const cards = document.querySelectorAll('[data-testid="character-card"], .character-card');

      for (const card of cards) {
        const nameElement = card.querySelector('[data-testid="character-name"], .character-name, h2, h3');
        if (nameElement) {
          const cardName = nameElement.textContent.trim();
          if (cardName === targetName || cardName.includes(targetName)) {
            // Click the card
            card.click();
            return true;
          }
        }
      }

      return false;
    }, characterName);

    if (!characterFound) {
      console.log(`❌ Character not found: ${characterName}`);
      return false;
    }

    // Wait a bit for card selection state
    await new Promise(resolve => setTimeout(resolve, 500));

    // Click play/select button
    const playButton = await page.evaluateHandle(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent && (btn.textContent.includes('Play') || btn.textContent.includes('Select'))) {
          return btn;
        }
      }
      return null;
    });

    if (playButton && playButton.asElement()) {
      await playButton.asElement().click();
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });

      // CRITICAL: Wait for React auth state to be set after navigation
      // The form-based login doesn't set Zustand state, so React's useEffect
      // calls checkAuth() to validate the cookie. We must wait for this.
      console.log('⏳ Waiting for React auth state to initialize...');
      const authReady = await waitForAuthState(page, 10000);

      if (!authReady) {
        console.log(`⚠️  Auth state not ready, but proceeding anyway`);
      }

      console.log(`✅ Logged in and selected character: ${characterName}`);
      return true;
    }

    console.log(`❌ Play button not found after selecting character`);
    return false;
  } catch (error) {
    console.error(`❌ Login with character error:`, error.message);
    return false;
  }
}

module.exports = {
  login,
  selectCharacter,
  loginAndSelectCharacter,
  logout,
  isAuthenticated,
  getCurrentUser,
  getCurrentCharacter,
  waitForAuth,
  waitForAuthState,
  registerTestUser,
  loginWithCharacter,
};
