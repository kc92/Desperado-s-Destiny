const puppeteer = require('puppeteer');

async function registerUser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const timestamp = Date.now();
  const username = `PlaytestBot${timestamp}`;
  const email = `playtest${timestamp}@test.com`;
  const password = 'TestPassword123!';

  try {
    console.log('Navigating to register page...');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });

    console.log('Filling registration form...');
    // Selectors might need adjustment based on actual UI
    await page.type('input[name="username"]', username);
    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', password);
    await page.type('input[name="confirmPassword"]', password);

    console.log('Submitting form...');
    // Click submit button - assuming button type="submit"
    await page.click('button[type="submit"]');

    // Wait for navigation or success message
    // If successful, it usually redirects to /verify-email or shows a toast
    await page.waitForNavigation({ timeout: 5000 }).catch(() => console.log('No navigation occurred, checking for success message...'));

    // Output the email for the next step
    console.log(`REGISTERED_EMAIL:${email}`);
    console.log(`REGISTERED_PASSWORD:${password}`);
    console.log(`REGISTERED_USERNAME:${username}`);

  } catch (error) {
    console.error('Registration failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

registerUser();