/**
 * Agent 3: The Gunslinger
 * Actually plays the game like a normal player
 *
 * Mission: Complete real gameplay loops - perform actions, earn rewards, level up
 */

const TestRunner = require('../core/TestRunner');

class GunslingerAgent extends TestRunner {
  constructor() {
    super('Agent-3-Gunslinger');
    this.initialStats = null;
    this.actionsPerformed = 0;
    this.goldEarned = 0;
    this.xpEarned = 0;
  }

  async runMission() {
    console.log('\n🔫 THE GUNSLINGER - Playing the game like a normal player...');
    console.log('=' .repeat(60));

    try {
      await this.initialize();

      // Login and select character
      const hasCharacter = await this.loginAndSelectCharacter();
      if (!hasCharacter) {
        throw new Error('Could not login and select character');
      }

      // Capture initial stats
      await this.captureInitialStats();

      // Main gameplay loop
      await this.playGameLoop();

      // Compare final stats
      await this.compareFinalStats();

      // Generate gameplay report
      await this.generateGameplayReport();

    } catch (error) {
      console.error('❌ Gunslinger mission failed:', error);
      await this.reportBug('P0', 'Gunslinger Mission Failure', error.message, error.stack);
    } finally {
      return await this.cleanup();
    }
  }

  async loginAndSelectCharacter() {
    console.log('\n🔍 Step 1: Login and select character...');

    await this.goto('/login');
    const loginSuccess = await this.loginAs('pioneer@test.com', 'PioneerTest123!');

    if (!loginSuccess) {
      await this.reportBug('P0', 'Login Failed', 'Could not login to game');
      return false;
    }

    await this.takeScreenshot('after-login');

    // Wait for characters page
    await this.wait(2000);

    // Find and click Play button on first character
    console.log('   Looking for character to play...');

    const playClicked = await this.evaluate(() => {
      // Find all buttons
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        const text = btn.textContent || '';
        if (text.includes('Play') && !btn.disabled) {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (!playClicked) {
      await this.reportBug('P1', 'No Play Button', 'Could not find Play button on character card');
      return false;
    }

    await this.wait(3000);

    // Verify we're in the game
    const url = this.page.url();
    if (!url.includes('/game')) {
      await this.reportBug('P1', 'Not In Game', `Expected /game but got ${url}`);
      return false;
    }

    console.log('   ✅ Successfully entered game!');
    await this.takeScreenshot('game-dashboard');
    return true;
  }

  async captureInitialStats() {
    console.log('\n📊 Step 2: Capturing initial stats...');
    await this.wait(1000);

    this.initialStats = await this.evaluate(() => {
      const bodyText = document.body.textContent || '';

      // Extract gold - look for $ amounts
      const goldMatch = bodyText.match(/\$[\d,]+/g);
      let gold = 0;
      if (goldMatch) {
        // Take the first match that looks like gold
        gold = parseInt(goldMatch[0].replace(/[$,]/g, ''), 10) || 0;
      }

      // Extract energy - look for "Energy: X" or "⚡ X"
      const energyMatch = bodyText.match(/Energy[:\s]*(\d+)/i) || bodyText.match(/⚡\s*(\d+)/);
      const energy = energyMatch ? parseInt(energyMatch[1], 10) : 0;

      // Extract level
      const levelMatch = bodyText.match(/Level\s*(\d+)/i);
      const level = levelMatch ? parseInt(levelMatch[1], 10) : 1;

      return { gold, energy, level, capturedAt: new Date().toISOString() };
    });

    console.log('   Initial stats:', this.initialStats);
    return this.initialStats;
  }

  async playGameLoop() {
    console.log('\n🎮 Step 3: Playing the game...');

    // Navigate to Actions page
    await this.navigateToActions();

    // Perform up to 3 actions
    const maxActions = 3;
    for (let i = 0; i < maxActions; i++) {
      console.log(`\n   --- Action attempt ${i + 1}/${maxActions} ---`);

      const result = await this.performAction();
      if (!result.performed) {
        console.log(`   ⚠️ Could not perform action: ${result.reason}`);
        if (result.reason === 'no energy') {
          console.log('   No energy left, stopping action loop');
          break;
        }
      } else {
        this.actionsPerformed++;
        console.log(`   ✅ Action completed! Total actions: ${this.actionsPerformed}`);
      }

      await this.wait(2000);
    }

    // Test navigation to other game sections
    await this.testOtherSections();
  }

  async navigateToActions() {
    console.log('   Navigating to Actions page...');

    // Try clicking nav link first
    const navClicked = await this.evaluate(() => {
      const navItems = document.querySelectorAll('[data-testid="nav-actions"], nav a, nav button');
      for (const item of navItems) {
        if (item.textContent && item.textContent.includes('Action')) {
          item.click();
          return true;
        }
      }
      return false;
    });

    if (!navClicked) {
      // Fallback to direct navigation
      await this.goto('/game/actions');
    }

    await this.wait(2000);
    await this.takeScreenshot('actions-page');
  }

  async performAction() {
    console.log('   Looking for available action...');

    // Check current energy - look for the header energy display (format: ⚡ X / Y)
    const currentEnergy = await this.evaluate(() => {
      const bodyText = document.body.textContent || '';
      // Look for energy display in header format: "⚡ X / Y" or "Energy X / Y"
      const energyWithMaxMatch = bodyText.match(/⚡\s*(\d+)\s*\/\s*\d+/) ||
                                  bodyText.match(/Energy[:\s]*(\d+)\s*\/\s*\d+/i);
      if (energyWithMaxMatch) {
        return parseInt(energyWithMaxMatch[1], 10);
      }
      // Fallback: look for energy in stats area (not action costs which show "⚡ X energy")
      const statsMatch = bodyText.match(/Energy[:\s]*(\d+)/i);
      return statsMatch ? parseInt(statsMatch[1], 10) : 0;
    });

    console.log(`   Current energy: ${currentEnergy}`);

    // Note: Energy display on Actions page may show 0 due to store sync bug
    // We'll try to perform action anyway - server will validate
    if (currentEnergy < 5 && currentEnergy !== 0) {
      // Only skip if we actually detected low energy (not zero which might be display bug)
      return { performed: false, reason: 'no energy' };
    }

    if (currentEnergy === 0) {
      console.log('   ⚠️ Energy shows 0 (possible UI sync bug), attempting action anyway...');
    }

    // Find and click an "Attempt" button
    const actionStarted = await this.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        const text = (btn.textContent || '').toLowerCase();
        // Look for Attempt buttons that aren't disabled
        if (text.includes('attempt') && !btn.disabled) {
          console.log('Found Attempt button, clicking...');
          btn.click();
          return { started: true, buttonText: btn.textContent };
        }
      }
      return { started: false };
    });

    if (!actionStarted.started) {
      console.log('   No available Attempt button found');
      return { performed: false, reason: 'no available action' };
    }

    console.log(`   Started action: "${actionStarted.buttonText}"`);
    await this.wait(1500);
    await this.takeScreenshot('deck-game-started');

    // Check if deck game modal appeared
    const hasGameModal = await this.evaluate(() => {
      // Look for deck game indicators
      return !!(
        document.querySelector('.fixed.inset-0') || // Modal overlay
        document.body.textContent.includes('Relevant Suit') ||
        document.body.textContent.includes('Hold') ||
        document.body.textContent.includes('Draw')
      );
    });

    if (!hasGameModal) {
      console.log('   ⚠️ Deck game modal did not appear');
      return { performed: false, reason: 'game modal not shown' };
    }

    console.log('   Deck game modal appeared, playing the game...');

    // Play the deck game
    const gameResult = await this.playDeckGame();
    return { performed: true, result: gameResult };
  }

  async playDeckGame() {
    console.log('   Playing deck game...');

    // Wait for game to fully load
    await this.wait(1000);

    // Get game type and available actions
    const gameInfo = await this.evaluate(() => {
      const bodyText = document.body.textContent || '';
      return {
        hasHold: bodyText.includes('Hold'),
        hasDraw: bodyText.includes('Draw'),
        hasHit: bodyText.includes('Hit'),
        hasStand: bodyText.includes('Stand'),
        hasCards: !!document.querySelector('[class*="card"]'),
        text: bodyText.substring(0, 500)
      };
    });

    console.log('   Game info:', { hasHold: gameInfo.hasHold, hasDraw: gameInfo.hasDraw });

    // Strategy: For poker-style games, just hold all cards and draw
    // For blackjack, stand immediately (conservative)

    if (gameInfo.hasHold || gameInfo.hasDraw) {
      // Poker Hold/Draw style game
      return await this.playPokerGame();
    } else if (gameInfo.hasHit || gameInfo.hasStand) {
      // Blackjack style game
      return await this.playBlackjackGame();
    } else {
      // Unknown game type, try to find any action button
      return await this.playGenericGame();
    }
  }

  async playPokerGame() {
    console.log('   Playing poker-style game...');

    // Select some cards (toggle selection on first 3 cards)
    await this.evaluate(() => {
      const cards = document.querySelectorAll('[class*="card"], [data-card]');
      // Click first 3 cards to select them
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        const card = cards[i];
        if (card && typeof card.click === 'function') {
          card.click();
        }
      }
    });

    await this.wait(500);

    // Click Hold/Draw button (or Stand)
    const actionClicked = await this.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));

      // Priority: Stand > Hold & Draw > Draw > any action button
      const priorities = ['stand', 'hold', 'draw', 'play', 'confirm'];

      for (const priority of priorities) {
        for (const btn of buttons) {
          const text = (btn.textContent || '').toLowerCase();
          if (text.includes(priority) && !btn.disabled) {
            btn.click();
            return { clicked: true, action: priority };
          }
        }
      }
      return { clicked: false };
    });

    console.log('   Action clicked:', actionClicked);
    await this.wait(2000);
    await this.takeScreenshot('game-result');

    // Check for result and dismiss modal
    return await this.dismissGameResult();
  }

  async playBlackjackGame() {
    console.log('   Playing blackjack-style game...');

    // Conservative strategy: Stand immediately
    const stood = await this.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        const text = (btn.textContent || '').toLowerCase();
        if (text.includes('stand') && !btn.disabled) {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (!stood) {
      console.log('   Could not find Stand button');
    }

    await this.wait(2000);
    return await this.dismissGameResult();
  }

  async playGenericGame() {
    console.log('   Playing generic game (finding any action button)...');

    // Find any clickable action button
    const actionClicked = await this.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        const text = (btn.textContent || '').toLowerCase();
        // Skip forfeit and cancel buttons
        if (text.includes('forfeit') || text.includes('cancel')) continue;
        if (!btn.disabled) {
          btn.click();
          return { clicked: true, text: btn.textContent };
        }
      }
      return { clicked: false };
    });

    console.log('   Generic action:', actionClicked);
    await this.wait(2000);
    return await this.dismissGameResult();
  }

  async dismissGameResult() {
    console.log('   Looking for game result...');

    // Check if there's a result showing
    const resultInfo = await this.evaluate(() => {
      const bodyText = document.body.textContent || '';
      return {
        hasSuccess: bodyText.includes('Success') || bodyText.includes('✓'),
        hasFailed: bodyText.includes('Failed') || bodyText.includes('✗'),
        hasGold: /\+\$?\d+/.test(bodyText),
        hasXP: /\+\d+\s*XP/i.test(bodyText)
      };
    });

    console.log('   Result info:', resultInfo);

    // Click Continue/Dismiss button
    const dismissed = await this.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        const text = (btn.textContent || '').toLowerCase();
        if (text.includes('continue') || text.includes('close') || text.includes('dismiss') || text.includes('ok')) {
          btn.click();
          return true;
        }
      }
      // Click outside modal to close
      const overlay = document.querySelector('.fixed.inset-0');
      if (overlay) {
        overlay.click();
        return true;
      }
      return false;
    });

    await this.wait(1000);

    return {
      success: resultInfo.hasSuccess,
      failed: resultInfo.hasFailed,
      earnedGold: resultInfo.hasGold,
      earnedXP: resultInfo.hasXP,
      dismissed
    };
  }

  async testOtherSections() {
    console.log('\n   Testing other game sections...');

    const sections = [
      { name: 'Territory', path: '/game/territory', nav: 'nav-territory' },
      { name: 'Gang', path: '/game/gang', nav: 'nav-gang' },
      { name: 'Crimes', path: '/game/crimes', nav: 'nav-crimes' }
    ];

    for (const section of sections) {
      console.log(`\n   Testing ${section.name}...`);

      // Try nav click first
      const clicked = await this.evaluate((navId) => {
        const nav = document.querySelector(`[data-testid="${navId}"]`);
        if (nav) {
          nav.click();
          return true;
        }
        // Fallback: find by text
        const links = document.querySelectorAll('nav a, nav button, [role="navigation"] a');
        for (const link of links) {
          if (link.textContent && link.textContent.includes(navId.replace('nav-', ''))) {
            link.click();
            return true;
          }
        }
        return false;
      }, section.nav);

      if (!clicked) {
        await this.goto(section.path);
      }

      await this.wait(1500);

      // Check for errors
      const hasError = await this.exists('[role="alert"], .error, .error-message');
      if (hasError) {
        await this.reportBug('P2', `${section.name} Page Error`, 'Error displayed on page');
      }

      // Check page loaded correctly
      const pageInfo = await this.evaluate((sectionName) => {
        const bodyText = document.body.textContent || '';
        return {
          hasContent: bodyText.length > 100,
          hasTitle: bodyText.toLowerCase().includes(sectionName.toLowerCase()),
          url: window.location.pathname
        };
      }, section.name);

      console.log(`   ${section.name} page:`, pageInfo);
      await this.takeScreenshot(`section-${section.name.toLowerCase()}`);
    }
  }

  async compareFinalStats() {
    console.log('\n📊 Step 4: Comparing final stats...');

    // Navigate back to dashboard
    await this.goto('/game');
    await this.wait(2000);

    const finalStats = await this.evaluate(() => {
      const bodyText = document.body.textContent || '';

      const goldMatch = bodyText.match(/\$[\d,]+/g);
      let gold = 0;
      if (goldMatch) {
        gold = parseInt(goldMatch[0].replace(/[$,]/g, ''), 10) || 0;
      }

      const energyMatch = bodyText.match(/⚡\s*(\d+)/) || bodyText.match(/Energy[:\s]*(\d+)/i);
      const energy = energyMatch ? parseInt(energyMatch[1], 10) : 0;

      const levelMatch = bodyText.match(/Level\s*(\d+)/i);
      const level = levelMatch ? parseInt(levelMatch[1], 10) : 1;

      return { gold, energy, level };
    });

    console.log('   Final stats:', finalStats);
    console.log('   Initial stats:', this.initialStats);

    // Calculate differences
    if (this.initialStats) {
      this.goldEarned = finalStats.gold - this.initialStats.gold;
      const energyUsed = this.initialStats.energy - finalStats.energy;

      console.log(`   Gold earned: ${this.goldEarned >= 0 ? '+' : ''}${this.goldEarned}`);
      console.log(`   Energy used: ${energyUsed}`);
      console.log(`   Actions performed: ${this.actionsPerformed}`);

      // Verify game progression
      if (this.actionsPerformed > 0 && energyUsed <= 0) {
        await this.reportBug('P1', 'Energy Not Consumed',
          `Performed ${this.actionsPerformed} actions but energy did not decrease`);
      }
    }

    await this.takeScreenshot('final-stats');
  }

  async generateGameplayReport() {
    console.log('\n📊 GUNSLINGER GAMEPLAY REPORT');
    console.log('=' .repeat(60));

    console.log(`\n🎮 Gameplay Summary:`);
    console.log(`   Actions Performed: ${this.actionsPerformed}`);
    console.log(`   Gold Earned: ${this.goldEarned >= 0 ? '+' : ''}$${this.goldEarned}`);
    console.log(`   XP Earned: ${this.xpEarned}`);

    console.log(`\n🐛 Bugs Found: ${this.bugs.length}`);
    console.log(`   P0: ${this.bugs.filter(b => b.severity === 'P0').length}`);
    console.log(`   P1: ${this.bugs.filter(b => b.severity === 'P1').length}`);
    console.log(`   P2: ${this.bugs.filter(b => b.severity === 'P2').length}`);

    console.log(`\n📸 Screenshots: ${this.screenshots.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);

    return {
      gameplayTested: true,
      actionsPerformed: this.actionsPerformed,
      goldEarned: this.goldEarned,
      bugsFound: this.bugs.length,
      screenshotsTaken: this.screenshots.length
    };
  }
}

// Run if executed directly
if (require.main === module) {
  const gunslinger = new GunslingerAgent();
  gunslinger.runMission().then(report => {
    console.log('\n🏁 Gunslinger mission complete!');
    // Handle both report formats (from cleanup vs direct)
    const p0Bugs = report.bugsByPriority ? report.bugsByPriority.P0 : 0;
    process.exit(p0Bugs > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = GunslingerAgent;
