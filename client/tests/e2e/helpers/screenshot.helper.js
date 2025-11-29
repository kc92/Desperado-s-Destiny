/**
 * Screenshot Helper
 * Utilities for capturing screenshots on failures
 */

const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

module.exports = {
  /**
   * Capture screenshot with timestamp
   */
  async capture(page, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    await page.screenshot({
      path: filepath,
      fullPage: true,
    });

    console.log(`Screenshot saved: ${filepath}`);
    return filepath;
  },

  /**
   * Capture screenshot on test failure
   */
  async captureOnFailure(page, testName) {
    const safeName = testName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    return this.capture(page, `FAIL-${safeName}`);
  },

  /**
   * Capture element screenshot
   */
  async captureElement(page, selector, name) {
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    await element.screenshot({ path: filepath });

    console.log(`Element screenshot saved: ${filepath}`);
    return filepath;
  },

  /**
   * Clean up old screenshots
   */
  cleanUp(olderThanDays = 7) {
    const files = fs.readdirSync(SCREENSHOTS_DIR);
    const now = Date.now();
    const maxAge = olderThanDays * 24 * 60 * 60 * 1000;

    files.forEach(file => {
      const filepath = path.join(SCREENSHOTS_DIR, file);
      const stat = fs.statSync(filepath);
      if (now - stat.mtimeMs > maxAge) {
        fs.unlinkSync(filepath);
        console.log(`Deleted old screenshot: ${file}`);
      }
    });
  },
};
