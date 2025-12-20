/**
 * Gameplay Helper
 * Utilities for common gameplay operations and state tracking
 */

/**
 * Simple delay utility
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get character's current gold balance from UI
 * Looks for gold display elements and extracts numeric value
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<number>} - Current gold balance
 */
async function getGoldBalance(page) {
  return page.evaluate(() => {
    // Try multiple selectors for gold display
    const goldSelectors = [
      '[data-testid="gold-balance"]',
      '[class*="gold"]'
      // Note: Removed Playwright text selector - not compatible with querySelector
    ];

    for (const selector of goldSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent || element.innerText;
        const match = text.match(/(\d+(?:,\d{3})*)/);
        if (match) {
          return parseInt(match[1].replace(/,/g, ''), 10);
        }
      }
    }

    // Fallback: search entire document for gold amount
    const bodyText = document.body.innerText;
    const goldMatch = bodyText.match(/(\d+(?:,\d{3})*)\s*gold/i);
    if (goldMatch) {
      return parseInt(goldMatch[1].replace(/,/g, ''), 10);
    }

    return 0; // Return 0 if not found
  });
}

/**
 * Wait for gold balance to update to expected value
 * Polls the gold balance until it matches expected amount or times out
 * @param {Page} page - Puppeteer page object
 * @param {number} expectedAmount - Expected gold amount
 * @param {number} [timeout=5000] - Timeout in milliseconds
 * @returns {Promise<boolean>} - True if balance matched within timeout
 */
async function waitForGoldUpdate(page, expectedAmount, timeout = 5000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const currentGold = await getGoldBalance(page);

    if (currentGold === expectedAmount) {
      return true;
    }

    await delay(500); // Check every 500ms
  }

  return false; // Timeout reached
}

/**
 * Get character stats from UI (XP, level, energy, health, etc.)
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<Object>} - Character stats object
 */
async function getCharacterStats(page) {
  return page.evaluate(() => {
    const stats = {
      gold: 0,
      energy: 0,
      level: 1,
      currentXP: 0,
      xpToNextLevel: 0,
      health: 0
    };

    // Helper to extract number from text
    const extractNumber = (text) => {
      if (!text) return 0;
      const match = text.match(/(\d+(?:,\d{3})*)/);
      return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
    };

    // Try to find gold
    const goldElement = document.querySelector('[data-testid="gold-balance"], [class*="gold"]');
    if (goldElement) {
      stats.gold = extractNumber(goldElement.textContent);
    }

    // Try to find energy
    const energyElement = document.querySelector('[data-testid="energy"], [class*="energy"]');
    if (energyElement) {
      stats.energy = extractNumber(energyElement.textContent);
    }

    // Try to find level
    const levelElement = document.querySelector('[data-testid="level"], [class*="level"]');
    if (levelElement) {
      stats.level = extractNumber(levelElement.textContent);
    }

    // Try to find XP from progress bar or text
    const xpElement = document.querySelector('[data-testid="xp"], [class*="xp"], [class*="experience"]');
    if (xpElement) {
      const xpText = xpElement.textContent || xpElement.getAttribute('aria-label') || '';
      // Match patterns like "50/100" or "50 / 100"
      const xpMatch = xpText.match(/(\d+)\s*\/\s*(\d+)/);
      if (xpMatch) {
        stats.currentXP = parseInt(xpMatch[1], 10);
        stats.xpToNextLevel = parseInt(xpMatch[2], 10);
      }
    }

    // Try to find health
    const healthElement = document.querySelector('[data-testid="health"], [class*="health"]');
    if (healthElement) {
      stats.health = extractNumber(healthElement.textContent);
    }

    return stats;
  });
}

/**
 * Navigate to a specific game page by clicking navigation link
 * @param {Page} page - Puppeteer page object
 * @param {string} pageName - Name of page (e.g., 'Actions', 'Skills', 'Combat')
 * @returns {Promise<boolean>} - True if navigation successful
 */
async function navigateToGamePage(page, pageName) {
  try {
    // Try data-testid first
    const navButton = await page.$(`[data-testid="nav-${pageName.toLowerCase()}"]`);

    if (navButton) {
      await navButton.click();
      await delay(1000);
      return true;
    }

    // Fallback: find by text content
    const navElement = await page.evaluateHandle((name) => {
      const links = Array.from(document.querySelectorAll('a, button'));
      return links.find(el => {
        const text = el.textContent || '';
        return text.trim().toLowerCase() === name.toLowerCase();
      });
    }, pageName);

    if (navElement && navElement.asElement()) {
      await navElement.asElement().click();
      await delay(1000);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Failed to navigate to ${pageName}:`, error.message);
    return false;
  }
}

/**
 * Wait for modal to appear or disappear
 * @param {Page} page - Puppeteer page object
 * @param {boolean} [shouldExist=true] - True to wait for modal, false to wait for it to disappear
 * @param {number} [timeout=5000] - Timeout in milliseconds
 * @returns {Promise<boolean>} - True if condition met within timeout
 */
async function waitForModal(page, shouldExist = true, timeout = 5000) {
  try {
    if (shouldExist) {
      await page.waitForSelector('[role="dialog"], .modal, [class*="modal"]', {
        visible: true,
        timeout
      });
    } else {
      await page.waitForSelector('[role="dialog"], .modal, [class*="modal"]', {
        hidden: true,
        timeout
      });
    }
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Find and click button by text content
 * @param {Page} page - Puppeteer page object
 * @param {string} buttonText - Text to search for in button
 * @param {boolean} [exact=false] - True for exact match, false for contains
 * @returns {Promise<boolean>} - True if button found and clicked
 */
async function clickButtonByText(page, buttonText, exact = false) {
  try {
    const button = await page.evaluateHandle((text, exactMatch) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => {
        const btnText = btn.textContent || '';
        return exactMatch
          ? btnText.trim() === text.trim()
          : btnText.toLowerCase().includes(text.toLowerCase());
      });
    }, buttonText, exact);

    if (button && button.asElement()) {
      await button.asElement().click();
      await delay(500);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Failed to click button "${buttonText}":`, error.message);
    return false;
  }
}

/**
 * Check if element exists on page
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector or XPath
 * @returns {Promise<boolean>} - True if element exists
 */
async function elementExists(page, selector) {
  try {
    const element = await page.$(selector);
    return element !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Get text content from element
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector
 * @returns {Promise<string|null>} - Element text content or null
 */
async function getElementText(page, selector) {
  try {
    const element = await page.$(selector);
    if (!element) return null;

    return page.evaluate(el => el.textContent || el.innerText, element);
  } catch (error) {
    return null;
  }
}

/**
 * Wait for loading spinners/indicators to disappear
 * @param {Page} page - Puppeteer page object
 * @param {number} [timeout=10000] - Timeout in milliseconds
 * @returns {Promise<void>}
 */
async function waitForLoading(page, timeout = 10000) {
  try {
    // Wait for common loading indicators to disappear
    await page.waitForSelector(
      '.animate-spin, .loading, .spinner, [class*="loading"]',
      { hidden: true, timeout }
    );
  } catch (error) {
    // No loading indicator found or it disappeared, that's okay
  }
}

/**
 * Wait for specific URL path
 * @param {Page} page - Puppeteer page object
 * @param {string} path - URL path to wait for
 * @param {number} [timeout=5000] - Timeout in milliseconds
 * @returns {Promise<boolean>} - True if URL matched within timeout
 */
async function waitForPath(page, path, timeout = 5000) {
  try {
    await page.waitForFunction(
      (expectedPath) => window.location.pathname.includes(expectedPath),
      { timeout },
      path
    );
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get current URL path
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<string>} - Current URL path
 */
async function getCurrentPath(page) {
  return page.evaluate(() => window.location.pathname);
}

/**
 * Scroll element into view
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector
 * @returns {Promise<boolean>} - True if scrolled successfully
 */
async function scrollToElement(page, selector) {
  try {
    const element = await page.$(selector);
    if (!element) return false;

    await page.evaluate(el => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, element);

    await delay(500); // Wait for scroll
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Wait for element to be visible and enabled
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector
 * @param {number} [timeout=5000] - Timeout in milliseconds
 * @returns {Promise<boolean>} - True if element ready
 */
async function waitForElement(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { visible: true, timeout });

    // Check if element is not disabled
    const isEnabled = await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return false;
      return !element.disabled && !element.hasAttribute('aria-disabled');
    }, selector);

    return isEnabled;
  } catch (error) {
    return false;
  }
}

/**
 * Fill form input field
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector for input
 * @param {string} value - Value to type
 * @param {number} [delayAfter=500] - Delay after typing
 * @returns {Promise<boolean>} - True if filled successfully
 */
async function fillInput(page, selector, value, delayAfter = 500) {
  try {
    await page.waitForSelector(selector, { visible: true, timeout: 5000 });
    const input = await page.$(selector);

    if (!input) return false;

    // Clear existing value
    await input.click({ clickCount: 3 }); // Select all
    await page.keyboard.press('Backspace');

    // Type new value
    await input.type(value);
    await delay(delayAfter);

    return true;
  } catch (error) {
    console.error(`Failed to fill input "${selector}":`, error.message);
    return false;
  }
}

/**
 * Select option from dropdown
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector for select element
 * @param {string} value - Option value to select
 * @returns {Promise<boolean>} - True if selected successfully
 */
async function selectOption(page, selector, value) {
  try {
    await page.waitForSelector(selector, { visible: true, timeout: 5000 });
    await page.select(selector, value);
    await delay(500);
    return true;
  } catch (error) {
    console.error(`Failed to select option "${value}" in "${selector}":`, error.message);
    return false;
  }
}

/**
 * Check if text exists anywhere on page
 * @param {Page} page - Puppeteer page object
 * @param {string} text - Text to search for
 * @param {boolean} [caseSensitive=false] - Whether to match case
 * @returns {Promise<boolean>} - True if text found
 */
async function pageContainsText(page, text, caseSensitive = false) {
  return page.evaluate((searchText, matchCase) => {
    const bodyText = document.body.innerText;
    return matchCase
      ? bodyText.includes(searchText)
      : bodyText.toLowerCase().includes(searchText.toLowerCase());
  }, text, caseSensitive);
}

/**
 * Get all error messages currently displayed on page
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<string[]>} - Array of error message texts
 */
async function getErrorMessages(page) {
  return page.evaluate(() => {
    const errorSelectors = [
      '[role="alert"]',
      '.error',
      '.text-red-500',
      '[class*="error"]',
      '.alert-error'
    ];

    const errors = [];
    for (const selector of errorSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = (el.textContent || '').trim();
        if (text && !errors.includes(text)) {
          errors.push(text);
        }
      });
    }

    return errors;
  });
}

module.exports = {
  delay,
  getGoldBalance,
  waitForGoldUpdate,
  getCharacterStats,
  navigateToGamePage,
  waitForModal,
  clickButtonByText,
  elementExists,
  getElementText,
  waitForLoading,
  waitForPath,
  getCurrentPath,
  scrollToElement,
  waitForElement,
  fillInput,
  selectOption,
  pageContainsText,
  getErrorMessages
};
