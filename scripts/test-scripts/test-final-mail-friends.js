/**
 * Final test - Manual verification of Mail and Friends pages
 * This assumes you're already logged in with a character selected
 */

const puppeteer = require('puppeteer');

async function test() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  console.log('\n=== FINAL MAIL & FRIENDS TEST ===\n');
  console.log('📌 MANUAL STEP: Please log in and select a character in the browser window');
  console.log('📌 Then navigate to /game/mail and /game/friends');
  console.log('📌 This script will take screenshots in 30 seconds...\n');

  await page.goto('http://localhost:3000');

  // Wait for user to log in
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Test Mail page
  console.log('1. Capturing Mail page...');
  await page.goto('http://localhost:3000/game/mail', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 2000));
  await page.screenshot({ path: 'FINAL-MAIL-PAGE.png', fullPage: true });

  const mailContent = await page.evaluate(() => ({
    text: document.body.textContent.substring(0, 300),
    hasHeading: !!document.querySelector('h1'),
    headingText: document.querySelector('h1')?.textContent
  }));

  console.log('   Mail page heading:', mailContent.headingText);
  console.log('   Screenshot saved: FINAL-MAIL-PAGE.png');

  // Test Friends page
  console.log('\n2. Capturing Friends page...');
  await page.goto('http://localhost:3000/game/friends', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 2000));
  await page.screenshot({ path: 'FINAL-FRIENDS-PAGE.png', fullPage: true });

  const friendsContent = await page.evaluate(() => ({
    text: document.body.textContent.substring(0, 300),
    hasHeading: !!document.querySelector('h1'),
    headingText: document.querySelector('h1')?.textContent
  }));

  console.log('   Friends page heading:', friendsContent.headingText);
  console.log('   Screenshot saved: FINAL-FRIENDS-PAGE.png');

  console.log('\n=== TEST COMPLETE ===');
  console.log('\n📸 Check these screenshots:');
  console.log('  - FINAL-MAIL-PAGE.png');
  console.log('  - FINAL-FRIENDS-PAGE.png\n');

  await new Promise(resolve => setTimeout(resolve, 5000));
  await browser.close();
}

test().catch(console.error);
