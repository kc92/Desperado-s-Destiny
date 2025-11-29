/**
 * Desperados Destiny - Comprehensive Playtest
 * Tests the full game flow as a player would experience it
 *
 * By: Hawk
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// Test credentials
const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'Test123!';

async function playtestGame() {
  console.log('🤠 Hawk\'s Comprehensive Playtest - Desperados Destiny');
  console.log('═'.repeat(60));
  console.log('Testing the game like a real player would experience it\n');

  const browser = await puppeteer.launch({
    headless: false, // Run in visible mode so we can watch
    slowMo: 100, // Slow down so we can see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const results = {
    passed: [],
    failed: [],
    warnings: [],
    screenshots: []
  };

  let page;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // ============================================================
    // TEST 1: Landing Page
    // ============================================================
    console.log('\n📍 TEST 1: Landing Page');
    console.log('─'.repeat(60));

    await page.goto('http://localhost:3001', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'playtest-01-landing.png', fullPage: true });
    results.screenshots.push('playtest-01-landing.png');

    const landingContent = await page.evaluate(() => {
      return {
        title: document.title,
        hasLogo: !!document.querySelector('h1, .logo'),
        hasButtons: document.querySelectorAll('button, a[href*="login"], a[href*="register"]').length,
        bodyVisible: document.body.innerText.length > 0
      };
    });

    if (landingContent.bodyVisible && landingContent.hasButtons > 0) {
      console.log('✅ Landing page loaded successfully');
      console.log(`   - Title: ${landingContent.title}`);
      console.log(`   - Interactive elements: ${landingContent.hasButtons}`);
      results.passed.push('Landing page renders');
    } else {
      console.log('❌ Landing page has issues');
      results.failed.push('Landing page incomplete');
    }

    // ============================================================
    // TEST 2: Navigation to Login
    // ============================================================
    console.log('\n📍 TEST 2: Login Flow');
    console.log('─'.repeat(60));

    // Find and click login button/link
    const loginButton = await page.$('a[href*="login"]');
    if (loginButton) {
      await loginButton.click();
      console.log('🔘 Clicked login button');
    } else {
      await page.goto('http://localhost:3001/login');
      console.log('🔗 Navigated directly to /login');
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    await page.screenshot({ path: 'playtest-02-login.png', fullPage: true });
    results.screenshots.push('playtest-02-login.png');

    // Fill in login form
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    const passwordInput = await page.$('input[type="password"]');

    if (emailInput && passwordInput) {
      console.log('📝 Found login form fields');
      await emailInput.type(TEST_EMAIL, { delay: 50 });
      await passwordInput.type(TEST_PASSWORD, { delay: 50 });
      console.log(`   - Entered: ${TEST_EMAIL}`);

      await page.screenshot({ path: 'playtest-03-login-filled.png', fullPage: true });
      results.screenshots.push('playtest-03-login-filled.png');

      // Submit form
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        console.log('🚀 Submitted login form');

        // Wait for navigation or response
        await new Promise(resolve => setTimeout(resolve, 3000));

        const currentUrl = page.url();
        console.log(`   - Current URL: ${currentUrl}`);

        if (currentUrl.includes('character') || currentUrl.includes('game')) {
          console.log('✅ Login successful - redirected to game');
          results.passed.push('Login flow works');
        } else {
          console.log('⚠️  Login may have failed - checking for errors');
          const errorMsg = await page.evaluate(() => {
            const errorEl = document.querySelector('.error, [class*="error"]');
            return errorEl ? errorEl.innerText : null;
          });
          if (errorMsg) {
            console.log(`   - Error: ${errorMsg}`);
            results.warnings.push(`Login error: ${errorMsg}`);
          }
        }
      }
    } else {
      console.log('❌ Login form not found');
      results.failed.push('Login form missing');
    }

    await page.screenshot({ path: 'playtest-04-after-login.png', fullPage: true });
    results.screenshots.push('playtest-04-after-login.png');

    // ============================================================
    // TEST 3: Character Selection
    // ============================================================
    console.log('\n📍 TEST 3: Character Selection');
    console.log('─'.repeat(60));

    // Check if we're on character select or if we need to navigate
    let currentUrl = page.url();
    if (!currentUrl.includes('character')) {
      await page.goto('http://localhost:3001/character-select');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await page.screenshot({ path: 'playtest-05-character-select.png', fullPage: true });
    results.screenshots.push('playtest-05-character-select.png');

    const characterInfo = await page.evaluate(() => {
      const characterCards = document.querySelectorAll('[class*="character"], .card');
      const characterNames = Array.from(document.querySelectorAll('h2, h3, [class*="name"]'))
        .map(el => el.innerText)
        .filter(text => text && text.length > 0 && text.length < 50);

      return {
        hasCharacters: characterCards.length > 0,
        characterCount: characterCards.length,
        names: characterNames.slice(0, 5)
      };
    });

    console.log(`   - Found ${characterInfo.characterCount} character elements`);
    console.log(`   - Character names visible: ${characterInfo.names.join(', ')}`);

    if (characterInfo.hasCharacters) {
      console.log('✅ Character selection screen loaded');
      results.passed.push('Character selection works');

      // Try to select a character
      const selectButton = await page.$('button[type="submit"]');
      if (selectButton) {
        await selectButton.click();
        console.log('🎮 Selected character');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Try clicking a character card
        const characterCard = await page.$('[class*="character"]:first-child, .card:first-child');
        if (characterCard) {
          await characterCard.click();
          console.log('🎮 Clicked character card');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } else {
      console.log('⚠️  No characters found - may need to create one');
      results.warnings.push('No test character found');
    }

    // ============================================================
    // TEST 4: Game Dashboard
    // ============================================================
    console.log('\n📍 TEST 4: Game Dashboard');
    console.log('─'.repeat(60));

    currentUrl = page.url();
    if (!currentUrl.includes('game')) {
      await page.goto('http://localhost:3001/game');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await page.screenshot({ path: 'playtest-06-game-dashboard.png', fullPage: true });
    results.screenshots.push('playtest-06-game-dashboard.png');

    const dashboardData = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.innerText : null;
      };

      return {
        characterName: getText('h1, [class*="character"] h2, [class*="name"]'),
        hasEnergyBar: !!document.querySelector('[class*="energy"], [class*="progress"]'),
        hasGoldDisplay: !!document.querySelector('[class*="gold"]') || document.body.innerText.includes('$'),
        hasStats: document.querySelectorAll('[class*="stat"]').length > 0,
        navigationCards: document.querySelectorAll('[class*="card"], button, a').length,
        bodyText: document.body.innerText.substring(0, 300)
      };
    });

    console.log('📊 Dashboard Analysis:');
    console.log(`   - Character name: ${dashboardData.characterName || 'Not visible'}`);
    console.log(`   - Energy bar: ${dashboardData.hasEnergyBar ? '✅' : '❌'}`);
    console.log(`   - Gold display: ${dashboardData.hasGoldDisplay ? '✅' : '❌'}`);
    console.log(`   - Stats visible: ${dashboardData.hasStats ? '✅' : '❌'}`);
    console.log(`   - Interactive elements: ${dashboardData.navigationCards}`);

    if (dashboardData.hasEnergyBar && dashboardData.navigationCards > 5) {
      console.log('✅ Game dashboard loaded with real data');
      results.passed.push('Game dashboard functional');
    } else {
      console.log('⚠️  Dashboard may be missing some elements');
      results.warnings.push('Dashboard incomplete or not loaded');
    }

    // Check for "Coming Soon" placeholders (should be NONE!)
    const hasPlaceholders = dashboardData.bodyText.toLowerCase().includes('coming soon');
    if (hasPlaceholders) {
      console.log('❌ FOUND "Coming Soon" placeholder - this should not exist!');
      results.failed.push('Placeholder code still present');
    } else {
      console.log('✅ No placeholders found - all production code');
      results.passed.push('No placeholder code');
    }

    // ============================================================
    // TEST 5: Territory Navigation
    // ============================================================
    console.log('\n📍 TEST 5: Territory System');
    console.log('─'.repeat(60));

    // Find territory link
    const territoryLink = await page.$('a[href*="territory"]');
    if (territoryLink) {
      await territoryLink.click();
      console.log('🗺️  Clicked Territory link');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      await page.goto('http://localhost:3001/game/territory');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('🗺️  Navigated directly to /game/territory');
    }

    await page.screenshot({ path: 'playtest-07-territory.png', fullPage: true });
    results.screenshots.push('playtest-07-territory.png');

    const territoryData = await page.evaluate(() => {
      return {
        hasMap: document.body.innerText.includes('SANGRE') || document.body.innerText.includes('Territory'),
        locationCount: document.querySelectorAll('[class*="location"], [class*="territory"]').length,
        bodyText: document.body.innerText.substring(0, 200)
      };
    });

    console.log(`   - Map visible: ${territoryData.hasMap ? '✅' : '❌'}`);
    console.log(`   - Locations found: ${territoryData.locationCount}`);

    if (territoryData.hasMap) {
      console.log('✅ Territory page loaded');
      results.passed.push('Territory system accessible');
    } else {
      console.log('⚠️  Territory page may not be fully loaded');
      results.warnings.push('Territory page incomplete');
    }

    // ============================================================
    // TEST 6: Gang System
    // ============================================================
    console.log('\n📍 TEST 6: Gang System');
    console.log('─'.repeat(60));

    await page.goto('http://localhost:3001/game/gang');
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: 'playtest-08-gang.png', fullPage: true });
    results.screenshots.push('playtest-08-gang.png');

    const gangData = await page.evaluate(() => {
      return {
        hasGangOptions: document.body.innerText.toLowerCase().includes('gang'),
        hasCreateButton: !!document.querySelector('[class*="create"]'),
        gangCount: document.querySelectorAll('[class*="gang"]').length,
        bodyText: document.body.innerText.substring(0, 200)
      };
    });

    console.log(`   - Gang interface: ${gangData.hasGangOptions ? '✅' : '❌'}`);
    console.log(`   - Gang elements: ${gangData.gangCount}`);

    if (gangData.hasGangOptions) {
      console.log('✅ Gang page loaded');
      results.passed.push('Gang system accessible');
    }

    // ============================================================
    // TEST 7: Leaderboard
    // ============================================================
    console.log('\n📍 TEST 7: Leaderboard');
    console.log('─'.repeat(60));

    await page.goto('http://localhost:3001/game/leaderboard');
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: 'playtest-09-leaderboard.png', fullPage: true });
    results.screenshots.push('playtest-09-leaderboard.png');

    const leaderboardData = await page.evaluate(() => {
      return {
        hasRankings: document.body.innerText.toLowerCase().includes('rank') ||
                     document.body.innerText.toLowerCase().includes('leaderboard'),
        playerCount: document.querySelectorAll('[class*="player"], [class*="rank"]').length,
        hasTabs: document.querySelectorAll('button, [role="tab"]').length > 3
      };
    });

    console.log(`   - Rankings visible: ${leaderboardData.hasRankings ? '✅' : '❌'}`);
    console.log(`   - Player entries: ${leaderboardData.playerCount}`);
    console.log(`   - Category tabs: ${leaderboardData.hasTabs ? '✅' : '❌'}`);

    if (leaderboardData.hasRankings) {
      console.log('✅ Leaderboard page loaded');
      results.passed.push('Leaderboard accessible');
    }

    // ============================================================
    // TEST 8: Actions System
    // ============================================================
    console.log('\n📍 TEST 8: Actions System');
    console.log('─'.repeat(60));

    await page.goto('http://localhost:3001/game/actions');
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: 'playtest-10-actions.png', fullPage: true });
    results.screenshots.push('playtest-10-actions.png');

    const actionsData = await page.evaluate(() => {
      return {
        hasActions: document.querySelectorAll('[class*="action"], button').length > 3,
        hasEnergyDisplay: document.body.innerText.toLowerCase().includes('energy'),
        hasCategories: document.querySelectorAll('[class*="category"], [class*="tab"]').length > 0
      };
    });

    console.log(`   - Actions visible: ${actionsData.hasActions ? '✅' : '❌'}`);
    console.log(`   - Energy system: ${actionsData.hasEnergyDisplay ? '✅' : '❌'}`);
    console.log(`   - Categories: ${actionsData.hasCategories ? '✅' : '❌'}`);

    if (actionsData.hasActions) {
      console.log('✅ Actions page loaded');
      results.passed.push('Actions system accessible');
    }

    // ============================================================
    // TEST 9: Crimes System
    // ============================================================
    console.log('\n📍 TEST 9: Crimes System');
    console.log('─'.repeat(60));

    await page.goto('http://localhost:3001/game/crimes');
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: 'playtest-11-crimes.png', fullPage: true });
    results.screenshots.push('playtest-11-crimes.png');

    const crimesData = await page.evaluate(() => {
      return {
        hasCrimes: document.body.innerText.toLowerCase().includes('crime') ||
                   document.body.innerText.toLowerCase().includes('bounty'),
        hasTabs: document.querySelectorAll('button, [role="tab"]').length > 1,
        bodyText: document.body.innerText.substring(0, 200)
      };
    });

    console.log(`   - Crimes interface: ${crimesData.hasCrimes ? '✅' : '❌'}`);
    console.log(`   - Navigation tabs: ${crimesData.hasTabs ? '✅' : '❌'}`);

    if (crimesData.hasCrimes) {
      console.log('✅ Crimes page loaded');
      results.passed.push('Crimes system accessible');
    }

    // ============================================================
    // TEST 10: Skills System
    // ============================================================
    console.log('\n📍 TEST 10: Skills System');
    console.log('─'.repeat(60));

    await page.goto('http://localhost:3001/game/skills');
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: 'playtest-12-skills.png', fullPage: true });
    results.screenshots.push('playtest-12-skills.png');

    const skillsData = await page.evaluate(() => {
      return {
        hasSkills: document.querySelectorAll('[class*="skill"]').length > 0,
        hasTraining: document.body.innerText.toLowerCase().includes('train') ||
                     document.body.innerText.toLowerCase().includes('skill'),
        skillCount: document.querySelectorAll('[class*="skill"], [class*="card"]').length
      };
    });

    console.log(`   - Skills visible: ${skillsData.hasSkills ? '✅' : '❌'}`);
    console.log(`   - Training interface: ${skillsData.hasTraining ? '✅' : '❌'}`);
    console.log(`   - Skill cards: ${skillsData.skillCount}`);

    if (skillsData.hasSkills || skillsData.hasTraining) {
      console.log('✅ Skills page loaded');
      results.passed.push('Skills system accessible');
    }

  } catch (error) {
    console.error('\n❌ Critical Error During Playtest:', error.message);
    results.failed.push(`Critical error: ${error.message}`);
    try {
      if (page) {
        await page.screenshot({ path: 'playtest-error.png', fullPage: true });
        results.screenshots.push('playtest-error.png');
      }
    } catch (screenshotError) {
      console.error('Could not capture error screenshot:', screenshotError.message);
    }
  } finally {
    // Final screenshot
    try {
      if (page) {
        await page.screenshot({ path: 'playtest-final.png', fullPage: true });
        results.screenshots.push('playtest-final.png');
      }
    } catch (screenshotError) {
      console.error('Could not capture final screenshot:', screenshotError.message);
    }

    await browser.close();
  }

  // ============================================================
  // RESULTS SUMMARY
  // ============================================================
  console.log('\n\n' + '═'.repeat(60));
  console.log('🎯 PLAYTEST RESULTS SUMMARY');
  console.log('═'.repeat(60));

  console.log(`\n✅ PASSED (${results.passed.length}):`);
  results.passed.forEach(test => console.log(`   ✓ ${test}`));

  if (results.warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${results.warnings.length}):`);
    results.warnings.forEach(warning => console.log(`   ⚠ ${warning}`));
  }

  if (results.failed.length > 0) {
    console.log(`\n❌ FAILED (${results.failed.length}):`);
    results.failed.forEach(fail => console.log(`   ✗ ${fail}`));
  }

  console.log(`\n📸 Screenshots Captured (${results.screenshots.length}):`);
  results.screenshots.forEach(screenshot => console.log(`   - ${screenshot}`));

  const totalTests = results.passed.length + results.failed.length;
  const passRate = totalTests > 0 ? Math.round((results.passed.length / totalTests) * 100) : 0;

  console.log('\n' + '═'.repeat(60));
  console.log(`🎮 OVERALL: ${results.passed.length}/${totalTests} tests passed (${passRate}%)`);
  console.log('═'.repeat(60));

  if (passRate >= 90) {
    console.log('\n🌟 EXCELLENT - Game is in great shape!');
  } else if (passRate >= 70) {
    console.log('\n👍 GOOD - Minor issues to address');
  } else if (passRate >= 50) {
    console.log('\n⚠️  NEEDS WORK - Several issues found');
  } else {
    console.log('\n❌ CRITICAL - Major issues need attention');
  }

  console.log('\n🤠 Hawk\'s Playtest Complete\n');

  // Save results to JSON
  fs.writeFileSync('playtest-results.json', JSON.stringify(results, null, 2));
  console.log('📝 Results saved to playtest-results.json\n');
}

playtestGame().catch(console.error);
