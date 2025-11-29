/**
 * Global Setup for E2E Tests
 * Runs once before all tests
 */

const puppeteer = require('puppeteer');

module.exports = async () => {
  console.log('Starting E2E test suite...');

  // Launch browser
  const browser = await puppeteer.launch({
    headless: process.env.HEADLESS !== 'false',
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Store browser instance globally
  global.__BROWSER__ = browser;

  // Store websocket endpoint for reconnection
  process.env.PUPPETEER_WS_ENDPOINT = browser.wsEndpoint();
};
