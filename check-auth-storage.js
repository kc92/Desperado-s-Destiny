// Quick script to check auth storage in the browser
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log('Navigating to app...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Get localStorage content
  const localStorage = await page.evaluate(() => {
    const items = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      items[key] = window.localStorage.getItem(key);
    }
    return items;
  });

  console.log('LocalStorage contents:');
  console.log(JSON.stringify(localStorage, null, 2));

  // Check if auth-store exists
  if (localStorage['auth-store']) {
    console.log('\nAuth Store Found:');
    const authStore = JSON.parse(localStorage['auth-store']);
    console.log(JSON.stringify(authStore, null, 2));
  } else {
    console.log('\nNo auth-store found in localStorage');
  }

  await browser.close();
})();