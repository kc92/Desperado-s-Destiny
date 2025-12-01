const puppeteer = require('puppeteer');

async function debugPage() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Listen for console logs from the browser
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  // Listen for errors
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });

  // Wait a bit more for React to render
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Get the full HTML
  const html = await page.content();
  console.log('\n📄 PAGE HTML (first 1000 chars):');
  console.log(html.substring(0, 1000));

  // Get body text
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('\n📝 BODY TEXT:');
  console.log(bodyText.substring(0, 500));

  // Check for specific elements
  const rootDiv = await page.$('#root');
  console.log('\n🎯 #root div found:', !!rootDiv);

  const buttons = await page.$$('button');
  console.log('🔘 Buttons found:', buttons.length);

  const inputs = await page.$$('input');
  console.log('📝 Inputs found:', inputs.length);

  const links = await page.$$('a');
  console.log('🔗 Links found:', links.length);

  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
  console.log('\n📸 Screenshot saved to debug-screenshot.png');

  console.log('\n⏸️  Browser staying open for manual inspection...');
  console.log('Press Ctrl+C to close');

  // Keep browser open for manual inspection
  await new Promise(() => {});
}

debugPage().catch(console.error);
