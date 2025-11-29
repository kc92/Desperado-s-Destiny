/**
 * Puppeteer Helper Functions
 * Provides utility functions for working with Puppeteer selectors
 */

import { Page, ElementHandle } from 'puppeteer';

/**
 * Find button by text content using XPath
 */
export async function findButtonByText(page: Page, ...texts: string[]): Promise<ElementHandle | null> {
  for (const text of texts) {
    const xpath = `//button[contains(text(), "${text}")]`;
    const elements = await page.$x(xpath);
    if (elements.length > 0) {
      return elements[0] as ElementHandle;
    }
  }
  return null;
}

/**
 * Find all buttons by text content using XPath
 */
export async function findButtonsByText(page: Page, ...texts: string[]): Promise<ElementHandle[]> {
  const allElements: ElementHandle[] = [];

  for (const text of texts) {
    const xpath = `//button[contains(text(), "${text}")]`;
    const elements = await page.$x(xpath);
    allElements.push(...(elements as ElementHandle[]));
  }

  return allElements;
}

/**
 * Find link by text content using XPath
 */
export async function findLinkByText(page: Page, ...texts: string[]): Promise<ElementHandle | null> {
  for (const text of texts) {
    const xpath = `//a[contains(text(), "${text}")]`;
    const elements = await page.$x(xpath);
    if (elements.length > 0) {
      return elements[0] as ElementHandle;
    }
  }
  return null;
}

/**
 * Click button by text content
 */
export async function clickButtonByText(page: Page, ...texts: string[]): Promise<boolean> {
  const button = await findButtonByText(page, ...texts);
  if (button) {
    await button.click();
    return true;
  }
  return false;
}

/**
 * Wait for and click button by text
 */
export async function waitAndClickButton(page: Page, text: string, timeout = 5000): Promise<boolean> {
  try {
    await page.waitForXPath(`//button[contains(text(), "${text}")]`, { timeout });
    return await clickButtonByText(page, text);
  } catch {
    return false;
  }
}
