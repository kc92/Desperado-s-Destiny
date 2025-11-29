/**
 * E2E Test Helpers - TypeScript
 * Type-safe utilities for end-to-end testing with Puppeteer
 */

import { Page, ElementHandle } from 'puppeteer';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

/**
 * Delay utility
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Login with credentials
 */
export async function login(
  page: Page,
  email: string,
  password: string
): Promise<void> {
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
export async function selectCharacter(
  page: Page,
  characterIndex: number = 0
): Promise<void> {
  await page.waitForSelector(
    '[data-testid="character-card"], .character-card',
    { timeout: 10000 }
  );

  const cards = await page.$$(
    '[data-testid="character-card"], .character-card'
  );
  if (cards.length > characterIndex) {
    await cards[characterIndex].click();
  }

  // Click play/select button
  const playButton = await page.evaluateHandle(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (
        btn.textContent &&
        (btn.textContent.includes('Play') || btn.textContent.includes('Select'))
      ) {
        return btn;
      }
    }
    return null;
  });

  if (playButton && playButton.asElement()) {
    await playButton.asElement()!.click();
  }

  await page.waitForNavigation({ waitUntil: 'networkidle0' });
}

/**
 * Full login flow: login + character selection
 */
export async function loginAndSelectCharacter(
  page: Page,
  email: string,
  password: string,
  characterIndex: number = 0
): Promise<void> {
  await login(page, email, password);

  // Check if redirected to character selection
  if (page.url().includes('/characters')) {
    await selectCharacter(page, characterIndex);
  }
}

/**
 * Logout
 */
export async function logout(page: Page): Promise<void> {
  // Try to find and click logout button
  let logoutButton = await page.$('[data-testid="logout"]');
  if (!logoutButton) {
    logoutButton = (await page.evaluateHandle(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent && btn.textContent.includes('Logout')) {
          return btn;
        }
      }
      return null;
    })) as any;
  }

  if (logoutButton && (logoutButton.asElement ? logoutButton.asElement() : logoutButton)) {
    await (logoutButton.asElement
      ? logoutButton.asElement()!
      : logoutButton
    ).click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.cookies();
  return cookies.some(c => c.name === 'token');
}

/**
 * Get current user from page state
 */
export async function getCurrentUser(page: Page): Promise<any> {
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
 * Wait for loading spinners to disappear
 */
export async function waitForLoading(
  page: Page,
  timeout: number = 10000
): Promise<void> {
  try {
    await page.waitForSelector('.animate-spin', { hidden: true, timeout });
  } catch (e) {
    // No spinner found, that's okay
  }
}

/**
 * Navigate to a specific game page
 */
export async function goToPage(page: Page, path: string): Promise<void> {
  await page.goto(`${BASE_URL}${path}`);
  await waitForLoading(page);
}

/**
 * Find and click button by text content
 */
export async function clickButtonByText(
  page: Page,
  text: string
): Promise<boolean> {
  const button = await page.evaluateHandle((searchText: string) => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent && btn.textContent.includes(searchText)) {
        return btn;
      }
    }
    return null;
  }, text);

  if (button && button.asElement()) {
    await button.asElement()!.click();
    return true;
  }
  return false;
}

/**
 * Find and click link by text content
 */
export async function clickLinkByText(
  page: Page,
  text: string
): Promise<boolean> {
  const link = await page.evaluateHandle((searchText: string) => {
    const links = document.querySelectorAll('a');
    for (const link of links) {
      if (link.textContent && link.textContent.includes(searchText)) {
        return link;
      }
    }
    return null;
  }, text);

  if (link && link.asElement()) {
    await link.asElement()!.click();
    return true;
  }
  return false;
}

/**
 * Get text content from page body
 */
export async function getBodyText(page: Page): Promise<string> {
  return page.evaluate(() => document.body.textContent || '');
}

/**
 * Check if text exists on page
 */
export async function hasText(page: Page, text: string): Promise<boolean> {
  const bodyText = await getBodyText(page);
  return bodyText.includes(text);
}

/**
 * Extract gold amount from page
 */
export async function getGoldAmount(page: Page): Promise<number | null> {
  const bodyText = await getBodyText(page);
  const goldMatch = bodyText.match(/(\d+)\s*(?:Gold|Coins|\$)/i);
  return goldMatch ? parseInt(goldMatch[1]) : null;
}

/**
 * Extract energy amount from page
 */
export async function getEnergyAmount(page: Page): Promise<number | null> {
  const bodyText = await getBodyText(page);
  const energyMatch = bodyText.match(/(\d+)\s*(?:Energy|⚡)/i);
  return energyMatch ? parseInt(energyMatch[1]) : null;
}

/**
 * Capture screenshot with timestamp
 */
export async function captureScreenshot(
  page: Page,
  name: string,
  directory: string = '../screenshots'
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = `${directory}/${filename}`;

  await page.screenshot({
    path: filepath,
    fullPage: true,
  });

  console.log(`Screenshot saved: ${filepath}`);
  return filepath;
}

/**
 * Wait for URL to contain path
 */
export async function waitForPath(
  page: Page,
  path: string,
  timeout: number = 5000
): Promise<void> {
  await page.waitForFunction(
    (p: string) => window.location.pathname.includes(p),
    { timeout },
    path
  );
}

/**
 * Check if element exists on page
 */
export async function elementExists(
  page: Page,
  selector: string
): Promise<boolean> {
  const element = await page.$(selector);
  return element !== null;
}

/**
 * Count elements matching selector
 */
export async function countElements(
  page: Page,
  selector: string
): Promise<number> {
  const elements = await page.$$(selector);
  return elements.length;
}

/**
 * Type into input field safely
 */
export async function typeIntoField(
  page: Page,
  selector: string,
  text: string
): Promise<boolean> {
  const input = await page.$(selector);
  if (input) {
    await input.type(text);
    return true;
  }
  return false;
}

/**
 * Clear and type into input field
 */
export async function clearAndType(
  page: Page,
  selector: string,
  text: string
): Promise<boolean> {
  const input = await page.$(selector);
  if (input) {
    await input.click({ clickCount: 3 }); // Select all
    await page.keyboard.press('Backspace');
    await input.type(text);
    return true;
  }
  return false;
}

/**
 * Wait for text to appear on page
 */
export async function waitForText(
  page: Page,
  text: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    await page.waitForFunction(
      (searchText: string) => document.body.textContent?.includes(searchText),
      { timeout },
      text
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Get character stats from page
 */
export async function getCharacterStats(page: Page): Promise<{
  level?: number;
  hp?: number;
  gold?: number;
  energy?: number;
}> {
  const bodyText = await getBodyText(page);

  const levelMatch = bodyText.match(/Level\s*:?\s*(\d+)/i);
  const hpMatch = bodyText.match(/HP\s*:?\s*(\d+)/i);
  const goldMatch = bodyText.match(/(\d+)\s*(?:Gold|Coins|\$)/i);
  const energyMatch = bodyText.match(/(\d+)\s*(?:Energy|⚡)/i);

  return {
    level: levelMatch ? parseInt(levelMatch[1]) : undefined,
    hp: hpMatch ? parseInt(hpMatch[1]) : undefined,
    gold: goldMatch ? parseInt(goldMatch[1]) : undefined,
    energy: energyMatch ? parseInt(energyMatch[1]) : undefined,
  };
}

export { BASE_URL };
