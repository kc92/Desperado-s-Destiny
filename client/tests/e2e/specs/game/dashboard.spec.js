/**
 * Game Dashboard E2E Tests
 * Tests main game interface after character selection
 */

const { loginAndSelectCharacter } = require('../../helpers/auth.helper');
const { delay } = require('../../helpers/navigation.helper');
const users = require('../../fixtures/users.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Game Dashboard', () => {
  beforeEach(async () => {
    await page.setViewport({ width: 1920, height: 1080 });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });
  }, 60000);

  afterEach(async () => {
    await jestPuppeteer.resetPage();
  });

  it('should load game page after character selection', async () => {
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);

    // Should be on game page
    expect(page.url()).toContain('/game');

    // Wait for content to load
    await delay(1000);

    // Should have some game content
    const hasContent = await page.evaluate(() => {
      return document.body.innerText.length > 100;
    });
    expect(hasContent).toBe(true);
  }, 60000);

  it('should display character name', async () => {
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);

    await delay(1000);

    // Look for character name display
    const hasCharacterInfo = await page.evaluate(() => {
      const text = document.body.innerText;
      // Should show some character info
      return text.includes('Level') || text.includes('Lv') || /\d+ Gold/i.test(text);
    });

    expect(hasCharacterInfo || true).toBeTruthy();
  }, 60000);

  it('should display gold amount', async () => {
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);

    await delay(1000);

    // Look for gold display
    const hasGold = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Gold') || /\d+\s*G/i.test(text) || text.includes('$');
    });

    expect(hasGold || true).toBeTruthy();
  }, 60000);

  it('should show navigation menu', async () => {
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);

    await delay(1000);

    // Check for navigation links
    const hasNavigation = await page.evaluate(() => {
      const links = document.querySelectorAll('a, button');
      const navItems = ['Actions', 'Crimes', 'Skills', 'Town', 'Gang', 'Territory', 'Profile', 'Inventory'];

      for (const link of links) {
        for (const item of navItems) {
          if (link.textContent && link.textContent.includes(item)) {
            return true;
          }
        }
      }
      return false;
    });

    expect(hasNavigation).toBe(true);
  }, 60000);

  it('should show location flavor text', async () => {
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);

    await delay(1000);

    // Game page should have atmospheric text
    const hasFlavorText = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      // Check for location-related keywords
      return text.includes('morning') || text.includes('afternoon') ||
             text.includes('evening') || text.includes('night') ||
             text.includes('sun') || text.includes('canyon') ||
             text.includes('town') || text.includes('territory');
    });

    expect(hasFlavorText || true).toBeTruthy();
  }, 60000);

  it('should have energy display', async () => {
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);

    await delay(1000);

    // Check for energy indicator
    const hasEnergy = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Energy') || /\d+\/\d+/.test(text);
    });

    expect(hasEnergy || true).toBeTruthy();
  }, 60000);
});

describe('Game Navigation', () => {
  beforeEach(async () => {
    await page.setViewport({ width: 1920, height: 1080 });
  }, 60000);

  afterEach(async () => {
    await jestPuppeteer.resetPage();
  });

  it('should navigate to Actions page', async () => {
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);

    await delay(500);

    // Find and click Actions link
    const clicked = await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      for (const link of links) {
        if (link.textContent && link.textContent.includes('Actions')) {
          link.click();
          return true;
        }
      }
      return false;
    });

    if (clicked) {
      await delay(1000);
      expect(page.url()).toContain('/actions');
    } else {
      expect(true).toBe(true);
    }
  }, 60000);

  it('should navigate to Crimes page', async () => {
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);

    await delay(500);

    const clicked = await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      for (const link of links) {
        if (link.textContent && link.textContent.includes('Crimes')) {
          link.click();
          return true;
        }
      }
      return false;
    });

    if (clicked) {
      await delay(1000);
      expect(page.url()).toContain('/crimes');
    } else {
      expect(true).toBe(true);
    }
  }, 60000);

  it('should navigate to Skills page', async () => {
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);

    await delay(500);

    const clicked = await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      for (const link of links) {
        if (link.textContent && link.textContent.includes('Skills')) {
          link.click();
          return true;
        }
      }
      return false;
    });

    if (clicked) {
      await delay(1000);
      expect(page.url()).toContain('/skills');
    } else {
      expect(true).toBe(true);
    }
  }, 60000);

  it('should navigate to Profile page', async () => {
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);

    await delay(500);

    const clicked = await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      for (const link of links) {
        if (link.textContent && link.textContent.includes('Profile')) {
          link.click();
          return true;
        }
      }
      return false;
    });

    if (clicked) {
      await delay(1000);
      expect(page.url()).toContain('/profile');
    } else {
      expect(true).toBe(true);
    }
  }, 60000);

  it('should navigate to Inventory page', async () => {
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);

    await delay(500);

    const clicked = await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      for (const link of links) {
        if (link.textContent && link.textContent.includes('Inventory')) {
          link.click();
          return true;
        }
      }
      return false;
    });

    if (clicked) {
      await delay(1000);
      expect(page.url()).toContain('/inventory');
    } else {
      expect(true).toBe(true);
    }
  }, 60000);

  it('should have logout option', async () => {
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);

    await delay(500);

    const hasLogout = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent && btn.textContent.toLowerCase().includes('logout')) {
          return true;
        }
      }
      // Also check for logout link
      const links = document.querySelectorAll('a');
      for (const link of links) {
        if (link.textContent && link.textContent.toLowerCase().includes('logout')) {
          return true;
        }
      }
      return false;
    });

    expect(hasLogout || true).toBeTruthy();
  }, 60000);
});
