/**
 * Navigation Helper
 * Utilities for page navigation and waiting
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

/**
 * Simple delay utility
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for loading spinners to disappear
 */
async function waitForLoading(page, timeout = 10000) {
  try {
    await page.waitForSelector('.animate-spin', { hidden: true, timeout });
  } catch (e) {
    // No spinner found, that's okay
  }
}

/**
 * Navigate to town page
 */
async function goToTown(page) {
  await page.goto(`${BASE_URL}/game/town`);
  await waitForLoading(page);
}

/**
 * Navigate to game dashboard
 */
async function goToDashboard(page) {
  await page.goto(`${BASE_URL}/game/dashboard`);
  await waitForLoading(page);
}

/**
 * Navigate to a specific game page
 */
async function goToPage(page, path) {
  await page.goto(`${BASE_URL}${path}`);
  await waitForLoading(page);
}

/**
 * Click a building in the town view
 */
async function clickBuilding(page, buildingType) {
  // Find button containing the building type
  const button = await page.$(`button[data-building="${buildingType}"]`);
  if (button) {
    await button.click();
    return true;
  }

  // Fallback: find by text content
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.toLowerCase().includes(buildingType.replace('_', ' '))) {
      await btn.click();
      return true;
    }
  }

  return false;
}

/**
 * Click a quick action button
 */
async function clickQuickAction(page, actionName) {
  const button = await page.$(`button:has-text("${actionName}")`);
  if (button) {
    await button.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    return true;
  }
  return false;
}

/**
 * Get current page URL path
 */
function getPath(page) {
  const url = new URL(page.url());
  return url.pathname;
}

/**
 * Wait for URL to contain path
 */
async function waitForPath(page, path, timeout = 5000) {
  await page.waitForFunction(
    (p) => window.location.pathname.includes(p),
    { timeout },
    path
  );
}

module.exports = {
  delay,
  waitForLoading,
  goToTown,
  goToDashboard,
  goToPage,
  clickBuilding,
  clickQuickAction,
  getPath,
  waitForPath,
};
