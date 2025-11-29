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
  // Try to find and click logout button
  let logoutButton = await page.$('[data-testid="logout"]');
  if (!logoutButton) {
    logoutButton = await page.evaluateHandle(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent && btn.textContent.includes('Logout')) {
          return btn;
        }
      }
      return null;
    });
  }

  if (logoutButton && (logoutButton.asElement ? logoutButton.asElement() : logoutButton)) {
    await (logoutButton.asElement ? logoutButton.asElement() : logoutButton).click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
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

module.exports = {
  login,
  selectCharacter,
  loginAndSelectCharacter,
  logout,
  isAuthenticated,
  getCurrentUser,
};
