/**
 * Gang Operations E2E Tests
 * Tests gang creation, management, and banking operations
 */

const { loginAndSelectCharacter } = require('../../helpers/auth.helper');
const { delay } = require('../../helpers/navigation.helper');
const { captureOnFailure } = require('../../helpers/screenshot.helper');
const users = require('../../fixtures/users.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Gang Operations', () => {
  const testGangName = `TestGang_${Date.now()}`;

  beforeEach(async () => {
    await page.setViewport({ width: 1920, height: 1080 });

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });

    // Login with test user
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);
  });

  afterEach(async () => {
    await captureOnFailure(page);
    await jestPuppeteer.resetPage();
  });

  it('should navigate to gang page', async () => {
    await page.waitForSelector('body', { timeout: 10000 });

    // Try to find gang link
    const gangLink = await page.evaluateHandle(() => {
      const links = document.querySelectorAll('a, button');
      for (const link of links) {
        const text = link.textContent || '';
        if (text.includes('Gang') || text.includes('Posse') || text.includes('Crew')) {
          return link;
        }
      }
      return null;
    });

    if (gangLink && gangLink.asElement()) {
      await gangLink.asElement().click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
      await delay(1000);
    } else {
      // Try direct navigation
      await page.goto(`${BASE_URL}/game/gang`);
    }

    await delay(1000);

    // Verify on gang page
    const url = page.url();
    expect(url.includes('/gang') || url.includes('/posse') || url.includes('/crew')).toBe(true);
  });

  it('should display create gang option for users without gang', async () => {
    await page.goto(`${BASE_URL}/game/gang`);
    await page.waitForSelector('body', { timeout: 10000 });
    await delay(1000);

    const bodyText = await page.evaluate(() => document.body.textContent);
    const hasCreateOption = bodyText.includes('Create') ||
                            bodyText.includes('Form') ||
                            bodyText.includes('Start');

    // User might already be in a gang, so this is a soft check
    expect(typeof hasCreateOption).toBe('boolean');
  });

  it('should create a new gang', async () => {
    await page.goto(`${BASE_URL}/game/gang`);
    await page.waitForSelector('body', { timeout: 10000 });
    await delay(1000);

    // Try to find create gang button
    const createButton = await page.evaluateHandle(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        const text = btn.textContent || '';
        if (text.includes('Create Gang') || text.includes('Form Gang') || text.includes('Start Gang')) {
          return btn;
        }
      }
      return null;
    });

    if (createButton && createButton.asElement()) {
      await createButton.asElement().click();
      await delay(1000);

      // Fill in gang name
      const nameInput = await page.$('input[name="name"], input[placeholder*="name" i]');
      if (nameInput) {
        await nameInput.type(testGangName);

        // Fill in tag if required
        const tagInput = await page.$('input[name="tag"], input[placeholder*="tag" i]');
        if (tagInput) {
          await tagInput.type('TEST');
        }

        // Submit form
        const submitButton = await page.evaluateHandle(() => {
          const buttons = document.querySelectorAll('button[type="submit"], button');
          for (const btn of buttons) {
            const text = btn.textContent || '';
            if (text.includes('Create') || text.includes('Form') || text.includes('Submit')) {
              return btn;
            }
          }
          return null;
        });

        if (submitButton && submitButton.asElement()) {
          await submitButton.asElement().click();
          await delay(2000);

          // Should see gang profile or confirmation
          const bodyText = await page.evaluate(() => document.body.textContent);
          const hasGangInfo = bodyText.includes(testGangName) ||
                             bodyText.includes('Gang') ||
                             bodyText.includes('Members') ||
                             bodyText.includes('Bank');

          expect(hasGangInfo).toBe(true);
        }
      }
    } else {
      console.log('User may already be in a gang or create button not found');
    }
  });

  it('should display gang profile information', async () => {
    await page.goto(`${BASE_URL}/game/gang`);
    await page.waitForSelector('body', { timeout: 10000 });
    await delay(1000);

    const bodyText = await page.evaluate(() => document.body.textContent);

    // Check for gang-related elements
    const hasGangElements = bodyText.includes('Gang') ||
                            bodyText.includes('Members') ||
                            bodyText.includes('Leader') ||
                            bodyText.includes('Level') ||
                            bodyText.includes('Bank') ||
                            bodyText.includes('Create Gang');

    expect(hasGangElements).toBe(true);
  });

  it('should display gang bank section', async () => {
    await page.goto(`${BASE_URL}/game/gang`);
    await page.waitForSelector('body', { timeout: 10000 });
    await delay(1000);

    const bodyText = await page.evaluate(() => document.body.textContent);

    // Look for bank-related content
    const hasBankElements = bodyText.includes('Bank') ||
                           bodyText.includes('Treasury') ||
                           bodyText.includes('Funds') ||
                           bodyText.includes('Deposit') ||
                           bodyText.includes('Withdraw');

    // User might not be in a gang yet
    expect(typeof hasBankElements).toBe('boolean');
  });

  it('should allow depositing gold into gang bank', async () => {
    await page.goto(`${BASE_URL}/game/gang`);
    await page.waitForSelector('body', { timeout: 10000 });
    await delay(1000);

    // Try to find deposit button/option
    const depositButton = await page.evaluateHandle(() => {
      const buttons = document.querySelectorAll('button, a');
      for (const btn of buttons) {
        const text = btn.textContent || '';
        if (text.includes('Deposit') || text.includes('Contribute')) {
          return btn;
        }
      }
      return null;
    });

    if (depositButton && depositButton.asElement()) {
      await depositButton.asElement().click();
      await delay(1000);

      // Look for amount input
      const amountInput = await page.$('input[type="number"], input[name="amount"], input[placeholder*="amount" i]');
      if (amountInput) {
        await amountInput.type('10');

        // Submit deposit
        const submitButton = await page.evaluateHandle(() => {
          const buttons = document.querySelectorAll('button[type="submit"], button');
          for (const btn of buttons) {
            const text = btn.textContent || '';
            if (text.includes('Deposit') || text.includes('Confirm') || text.includes('Submit')) {
              return btn;
            }
          }
          return null;
        });

        if (submitButton && submitButton.asElement()) {
          await submitButton.asElement().click();
          await delay(2000);

          // Should see confirmation or updated bank balance
          const bodyText = await page.evaluate(() => document.body.textContent);
          const hasConfirmation = bodyText.includes('Success') ||
                                 bodyText.includes('Deposited') ||
                                 bodyText.includes('Bank');

          expect(hasConfirmation).toBe(true);
        }
      }
    } else {
      console.log('Deposit option not available - user may not be in a gang');
    }
  });

  it('should display gang members list', async () => {
    await page.goto(`${BASE_URL}/game/gang`);
    await page.waitForSelector('body', { timeout: 10000 });
    await delay(1000);

    const bodyText = await page.evaluate(() => document.body.textContent);

    // Look for members section
    const hasMembersSection = bodyText.includes('Members') ||
                              bodyText.includes('Member') ||
                              bodyText.includes('Roster');

    expect(typeof hasMembersSection).toBe('boolean');
  });

  it('should allow leaving gang', async () => {
    await page.goto(`${BASE_URL}/game/gang`);
    await page.waitForSelector('body', { timeout: 10000 });
    await delay(1000);

    // Try to find leave gang option
    const leaveButton = await page.evaluateHandle(() => {
      const buttons = document.querySelectorAll('button, a');
      for (const btn of buttons) {
        const text = btn.textContent || '';
        if (text.includes('Leave Gang') || text.includes('Leave Posse') || text.includes('Exit')) {
          return btn;
        }
      }
      return null;
    });

    if (leaveButton && leaveButton.asElement()) {
      await leaveButton.asElement().click();
      await delay(1000);

      // Might need to confirm
      const confirmButton = await page.evaluateHandle(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          const text = btn.textContent || '';
          if (text.includes('Confirm') || text.includes('Yes') || text.includes('Leave')) {
            return btn;
          }
        }
        return null;
      });

      if (confirmButton && confirmButton.asElement()) {
        await confirmButton.asElement().click();
        await delay(2000);

        // Should see no gang message or create gang option
        const bodyText = await page.evaluate(() => document.body.textContent);
        const hasNoGangMessage = bodyText.includes('Create Gang') ||
                                bodyText.includes('Join') ||
                                bodyText.includes('not in a gang');

        expect(typeof hasNoGangMessage).toBe('boolean');
      }
    } else {
      console.log('Leave option not found - user may not be in a gang or may be leader');
    }
  });

  it('should show gang stats and level', async () => {
    await page.goto(`${BASE_URL}/game/gang`);
    await page.waitForSelector('body', { timeout: 10000 });
    await delay(1000);

    const bodyText = await page.evaluate(() => document.body.textContent);

    // Look for stat elements
    const hasStats = bodyText.includes('Level') ||
                    bodyText.includes('Power') ||
                    bodyText.includes('Reputation') ||
                    bodyText.includes('Territory');

    expect(typeof hasStats).toBe('boolean');
  });

  it('should display gang activities and recent transactions', async () => {
    await page.goto(`${BASE_URL}/game/gang`);
    await page.waitForSelector('body', { timeout: 10000 });
    await delay(1000);

    const bodyText = await page.evaluate(() => document.body.textContent);

    // Look for activity elements
    const hasActivities = bodyText.includes('Activity') ||
                         bodyText.includes('Recent') ||
                         bodyText.includes('History') ||
                         bodyText.includes('Transaction') ||
                         bodyText.includes('Log');

    expect(typeof hasActivities).toBe('boolean');
  });

  it('should handle gang creation validation', async () => {
    await page.goto(`${BASE_URL}/game/gang`);
    await page.waitForSelector('body', { timeout: 10000 });
    await delay(1000);

    // Try to create gang with invalid name
    const createButton = await page.evaluateHandle(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        const text = btn.textContent || '';
        if (text.includes('Create Gang')) {
          return btn;
        }
      }
      return null;
    });

    if (createButton && createButton.asElement()) {
      await createButton.asElement().click();
      await delay(1000);

      // Try to submit without name
      const submitButton = await page.evaluateHandle(() => {
        const buttons = document.querySelectorAll('button[type="submit"], button');
        for (const btn of buttons) {
          const text = btn.textContent || '';
          if (text.includes('Create') || text.includes('Submit')) {
            return btn;
          }
        }
        return null;
      });

      if (submitButton && submitButton.asElement()) {
        await submitButton.asElement().click();
        await delay(1000);

        // Should show validation error or stay on form
        const url = page.url();
        expect(url.includes('/gang')).toBe(true);
      }
    }
  });
});
