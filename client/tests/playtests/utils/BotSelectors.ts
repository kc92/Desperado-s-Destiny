/**
 * BotSelectors - Helper functions for Puppeteer element selection
 * Provides Puppeteer-compatible alternatives to Playwright-style selectors
 */

import { Page, ElementHandle } from 'puppeteer';

/**
 * Find and click a button by text content
 */
export async function clickButtonByText(page: Page, ...texts: string[]): Promise<boolean> {
  return await page.evaluate((textOptions) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    for (const text of textOptions) {
      const button = buttons.find(btn => btn.textContent?.includes(text));
      if (button) {
        (button as HTMLElement).click();
        return true;
      }
    }
    return false;
  }, texts);
}

/**
 * Find and click a link by text content
 */
export async function clickLinkByText(page: Page, ...texts: string[]): Promise<boolean> {
  return await page.evaluate((textOptions) => {
    const links = Array.from(document.querySelectorAll('a'));
    for (const text of textOptions) {
      const link = links.find(a => a.textContent?.includes(text));
      if (link) {
        (link as HTMLElement).click();
        return true;
      }
    }
    return false;
  }, texts);
}

/**
 * Find element by text content in any tag
 */
export async function findElementByText(page: Page, text: string, tag: string = '*'): Promise<ElementHandle | null> {
  const element = await page.evaluateHandle((searchText, searchTag) => {
    const elements = Array.from(document.querySelectorAll(searchTag));
    return elements.find(el => el.textContent?.includes(searchText)) || null;
  }, text, tag);

  return element.asElement();
}

/**
 * Check if element with text exists
 */
export async function hasElementWithText(page: Page, text: string): Promise<boolean> {
  return await page.evaluate((searchText) => {
    const elements = Array.from(document.querySelectorAll('*'));
    return elements.some(el => el.textContent?.includes(searchText));
  }, text);
}

/**
 * Get all buttons matching text patterns
 */
export async function getButtonsByText(page: Page, ...texts: string[]): Promise<number> {
  return await page.evaluate((textOptions) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    let count = 0;
    for (const text of textOptions) {
      count += buttons.filter(btn => btn.textContent?.includes(text)).length;
    }
    return count;
  }, texts);
}

/**
 * Type into an input field by placeholder text
 */
export async function typeByPlaceholder(page: Page, placeholder: string, value: string): Promise<boolean> {
  const input = await page.$(`input[placeholder*="${placeholder}" i], textarea[placeholder*="${placeholder}" i]`);
  if (input) {
    await input.type(value, { delay: 50 });
    return true;
  }
  return false;
}

/**
 * Click a random element from matching selector
 */
export async function clickRandomElement(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const elements = Array.from(document.querySelectorAll(sel));
    if (elements.length > 0) {
      const randomIndex = Math.floor(Math.random() * elements.length);
      (elements[randomIndex] as HTMLElement).click();
      return true;
    }
    return false;
  }, selector);
}

/**
 * Get count of elements matching selector
 */
export async function getElementCount(page: Page, selector: string): Promise<number> {
  return await page.evaluate((sel) => {
    return document.querySelectorAll(sel).length;
  }, selector);
}

/**
 * Wait for and click button by text
 */
export async function waitAndClickButton(page: Page, text: string, timeout: number = 5000): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const clicked = await clickButtonByText(page, text);
    if (clicked) return true;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return false;
}

/**
 * Navigate to href by clicking link
 */
export async function navigateByHref(page: Page, href: string): Promise<boolean> {
  try {
    await page.click(`a[href="${href}"]`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get text content of element
 */
export async function getTextContent(page: Page, selector: string): Promise<string | null> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    return element?.textContent || null;
  }, selector);
}

/**
 * Press Enter on input field
 */
export async function pressEnterOnInput(page: Page, selector: string): Promise<boolean> {
  try {
    const input = await page.$(selector);
    if (input) {
      await input.press('Enter');
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
