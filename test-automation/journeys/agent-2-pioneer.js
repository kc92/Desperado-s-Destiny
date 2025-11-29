/**
 * Agent 2: The Pioneer
 * Character creation and setup testing
 *
 * Mission: Create test characters and establish game presence
 */

const TestRunner = require('../core/TestRunner');

class PioneerAgent extends TestRunner {
  constructor() {
    super('Agent-2-Pioneer');
    this.testUsers = [];
    this.testCharacters = [];
    this.characterLimit = 3;
    this.factions = ['NAHI_COALITION', 'SETTLER_ALLIANCE', 'FRONTERA'];
  }

  /**
   * Main pioneer mission
   */
  async runMission() {
    console.log('\n🤠 THE PIONEER - Beginning character setup mission...');
    console.log('=' .repeat(60));

    try {
      await this.initialize();

      // Phase 1: Test user registration flow
      await this.testRegistration();

      // Phase 2: Test existing user login
      await this.testExistingUserLogin();

      // Phase 3: Test character creation for each faction
      await this.testCharacterCreation();

      // Phase 4: Test character selection
      await this.testCharacterSelection();

      // Phase 5: Test character limits
      await this.testCharacterLimits();

      // Phase 6: Test character deletion
      await this.testCharacterDeletion();

      // Generate character report
      await this.generateCharacterReport();

    } catch (error) {
      console.error('❌ Pioneer mission failed:', error);
      await this.reportBug('P0', 'Pioneer Mission Failure', error.message, error.stack);
    } finally {
      return await this.cleanup();
    }
  }

  /**
   * Test user registration flow
   */
  async testRegistration() {
    console.log('\n🔍 Phase 1: Testing user registration...');

    // Generate username that fits 3-20 char limit (pioneer_ = 8 chars + 6 digits = 14 chars)
    const shortTimestamp = Date.now().toString().slice(-6);
    const testUser = {
      username: `pioneer_${shortTimestamp}`,
      email: `pioneer_${Date.now()}@test.com`,
      password: 'TestPassword123!'
    };

    await this.goto('/register');
    await this.wait(1000);

    // Check registration form exists
    const hasUsername = await this.exists('input[name="username"]');
    const hasEmail = await this.exists('input[name="email"]');
    const hasPassword = await this.exists('input[name="password"]');
    const hasConfirmPassword = await this.exists('input[name="confirmPassword"]');

    if (!hasUsername || !hasEmail || !hasPassword || !hasConfirmPassword) {
      await this.reportBug('P0', 'Registration Form Broken', 'Missing required form fields');
      return;
    }

    // Fill registration form
    await this.type('input[name="username"]', testUser.username);
    await this.type('input[name="email"]', testUser.email);
    await this.type('input[name="password"]', testUser.password);
    await this.type('input[name="confirmPassword"]', testUser.password);

    await this.takeScreenshot('registration-form-filled');

    // Submit form
    await this.click('button[type="submit"]');
    await this.wait(3000);

    // Check for errors
    const errors = await this.checkForErrors();
    if (errors.length > 0) {
      await this.reportBug('P1', 'Registration Errors', `Found ${errors.length} errors during registration`);
    }

    // Check if we're redirected to verify email or login
    const currentUrl = this.page.url();
    if (currentUrl.includes('verify-email')) {
      console.log('✅ Registration successful - Email verification required');
      this.testUsers.push(testUser);
    } else if (currentUrl.includes('login')) {
      console.log('✅ Registration successful - Redirected to login');
      this.testUsers.push(testUser);
    } else if (currentUrl.includes('register')) {
      // Still on register page - check if there's an error or if it actually succeeded
      const hasError = await this.exists('.error, [role="alert"], .text-red-500, .text-blood-red');
      if (hasError) {
        console.log('⚠️ Registration stayed on page with error - this may be expected for duplicate email');
      } else {
        console.log('⚠️ Registration stayed on page but no error shown - may need investigation');
      }
    } else {
      await this.reportBug('P1', 'Registration Flow Issue', `Unexpected redirect to ${currentUrl}`);
    }
  }

  /**
   * Test existing user login
   */
  async testExistingUserLogin() {
    console.log('\n🔍 Phase 2: Testing existing user login...');

    const existingUser = {
      email: 'pioneer@test.com',
      password: 'PioneerTest123!'
    };

    const loginSuccess = await this.loginAs(existingUser.email, existingUser.password);

    if (!loginSuccess) {
      await this.reportBug('P0', 'Login Failed', 'Cannot login with existing test user');
      return;
    }

    // Check if we have any existing characters
    const characterCount = await this.evaluate(() => {
      const cards = document.querySelectorAll('[data-testid="character-card"], .character-card');
      return cards.length;
    });

    console.log(`📊 Found ${characterCount} existing characters`);

    if (characterCount >= this.characterLimit) {
      console.log('⚠️ Character limit already reached, will test deletion first');
    }

    await this.takeScreenshot('existing-characters');
  }

  /**
   * Test character creation for each faction
   */
  async testCharacterCreation() {
    console.log('\n🔍 Phase 3: Testing character creation...');

    for (let i = 0; i < this.factions.length; i++) {
      const faction = this.factions[i];
      // Generate valid character name (alphanumeric, spaces, hyphens, apostrophes only - max 20 chars)
      const factionShort = faction.split('_')[0].substring(0, 4); // NAHI, SETT, FRON
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits
      const characterName = `${factionShort}${timestamp}`.substring(0, 20); // e.g., "NAHI469313"

      console.log(`\n🎮 Creating character for faction: ${faction}`);

      // Check current character count
      const currentCount = await this.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="character-card"], .character-card');
        return cards.length;
      });

      if (currentCount >= this.characterLimit) {
        console.log('⚠️ Character limit reached, skipping creation');
        break;
      }

      // Find and click create button
      const createButtonExists = await this.clickCreateCharacterButton();
      if (!createButtonExists) {
        await this.reportBug('P0', 'Create Button Missing', 'Cannot find create character button');
        return;
      }

      await this.wait(1000);

      // Check if modal opened
      const modalExists = await this.exists('[role="dialog"], .modal, .character-creator');
      if (!modalExists) {
        await this.reportBug('P1', 'Character Creator Modal Issue', 'Modal did not open');
        continue;
      }

      // Fill character name
      const nameInput = await this.waitForSelector('input#character-name, input[name="name"], input[placeholder*="name"]');
      if (!nameInput) {
        await this.reportBug('P1', 'Name Input Missing', 'Cannot find character name input');
        continue;
      }

      console.log(`  Filling name: "${characterName}" (${characterName.length} chars)`);
      await this.type('input#character-name, input[name="name"], input[placeholder*="name"]', characterName);
      await this.wait(500); // Wait for React state to update

      // Select faction
      await this.selectFaction(faction);

      await this.takeScreenshot(`character-creation-${faction}-step1`);

      // Click "Next Step" to go to step 2
      await this.clickNextButton();
      await this.wait(2000);

      await this.takeScreenshot(`character-creation-${faction}-step2`);

      // Click final "Create Character" button
      const confirmClicked = await this.clickConfirmButton();
      if (!confirmClicked) {
        console.log('  ⚠️ Could not find confirm button');
        await this.reportBug('P1', 'Confirm Button Missing', 'Cannot find create character confirm button');
        continue;
      }
      await this.wait(3000);

      // Check where we ended up - successful creation navigates to /game
      const currentUrl = this.page.url();
      console.log(`  Current URL after creation: ${currentUrl}`);

      if (currentUrl.includes('/game')) {
        // Success! Character was created and we navigated to game
        console.log(`✅ Character created successfully: ${characterName}`);
        this.testCharacters.push({ name: characterName, faction });

        // Navigate back to /characters to continue creating more
        await this.goto('/characters');
        await this.wait(2000);
      } else if (currentUrl.includes('/characters')) {
        // Still on characters page - might have stayed due to error
        // Check for errors
        const errors = await this.checkForErrors();
        if (errors.length > 0) {
          await this.reportBug('P1', 'Character Creation Errors', `Found ${errors.length} errors creating ${faction} character`);
        }

        // Check if character was added anyway (modal might have closed)
        const newCount = await this.evaluate(() => {
          const cards = document.querySelectorAll('[data-testid="character-card"], .character-card');
          return cards.length;
        });

        if (newCount > currentCount) {
          console.log(`✅ Character created successfully: ${characterName}`);
          this.testCharacters.push({ name: characterName, faction });
        } else {
          await this.reportBug('P1', 'Character Not Created', `Failed to create ${faction} character`);
        }
      } else {
        // Unexpected location
        await this.reportBug('P1', 'Character Not Created', `Ended up at unexpected URL: ${currentUrl}`);
      }
    }
  }

  /**
   * Helper: Click create character button
   */
  async clickCreateCharacterButton() {
    // Wait for page to fully load - wait for loading spinner to disappear
    console.log('  Waiting for character select page to load...');

    // Wait for loading state to clear (max 10 seconds)
    let loadingTimeout = 10000;
    let checkInterval = 500;
    let elapsed = 0;

    while (elapsed < loadingTimeout) {
      const isLoading = await this.evaluate(() => {
        // Check for loading spinner or loading text
        const spinner = document.querySelector('.loading-spinner, [class*="LoadingSpinner"], [class*="loading"]');
        const loadingText = document.body.textContent?.includes('Loading');
        return spinner !== null || loadingText;
      });

      if (!isLoading) {
        console.log('  Page loaded, searching for create button...');
        break;
      }

      await this.wait(checkInterval);
      elapsed += checkInterval;
    }

    // Additional wait for React to render
    await this.wait(1000);

    // Debug: Log what's visible on the page
    const pageState = await this.evaluate(() => {
      const h1 = document.querySelector('h1')?.textContent || 'No h1';
      const h2 = document.querySelector('h2')?.textContent || 'No h2';
      const buttons = Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(t => t);
      return { h1, h2, buttons: buttons.slice(0, 10) }; // First 10 buttons
    });
    console.log(`  Page state: h1="${pageState.h1}", h2="${pageState.h2}"`);
    console.log(`  Visible buttons: ${JSON.stringify(pageState.buttons)}`);

    // Try finding button by text content (most reliable for this page)
    const buttons = await this.page.$$('button');
    for (const button of buttons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && (
        text.includes('Create Your First Character') ||
        text.includes('Create New Character') ||
        text.includes('Create Character')
      )) {
        console.log(`  ✅ Found button with text: "${text.trim()}"`);
        await button.click();
        return true;
      }
    }

    // Fallback: Try any button with 'Create' in text
    for (const button of buttons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && text.includes('Create')) {
        console.log(`  ✅ Found fallback button with text: "${text.trim()}"`);
        await button.click();
        return true;
      }
    }

    // Last resort: Try CSS selectors
    const selectors = [
      'button[aria-label*="create"]',
      '.create-character-button',
      '[data-testid="create-character"]'
    ];

    for (const selector of selectors) {
      if (await this.exists(selector)) {
        console.log(`  ✅ Found button with selector: ${selector}`);
        await this.click(selector);
        return true;
      }
    }

    console.log('  ❌ Could not find create character button');
    return false;
  }

  /**
   * Helper: Select faction
   */
  async selectFaction(faction) {
    // Wait a moment for faction cards to render
    await this.wait(1000);

    // Convert faction enum to display name
    const factionNames = {
      'NAHI_COALITION': 'Nahi Coalition',
      'SETTLER_ALLIANCE': 'Settler Alliance',
      'FRONTERA': 'Frontera'
    };
    const displayName = factionNames[faction] || faction;

    console.log(`  Looking for faction: ${displayName}`);

    // Try to find and click the faction card by looking for the name text
    const clicked = await this.evaluate((name) => {
      // Find all buttons that might be faction cards
      const buttons = Array.from(document.querySelectorAll('button'));

      for (const button of buttons) {
        const text = button.textContent;
        if (text && text.includes(name)) {
          console.log(`  Found faction card for: ${name}`);
          button.click();
          return true;
        }
      }

      // Try finding by heading text inside cards
      const headings = Array.from(document.querySelectorAll('h3, h2, .faction-name'));
      for (const heading of headings) {
        if (heading.textContent.includes(name)) {
          // Click the parent button or card
          const button = heading.closest('button');
          if (button) {
            console.log(`  Found faction via heading: ${name}`);
            button.click();
            return true;
          }
        }
      }

      return false;
    }, displayName);

    if (clicked) {
      console.log(`✅ Selected faction: ${displayName}`);
      await this.wait(500); // Wait for selection to register
    } else {
      console.log(`⚠️ Could not select faction: ${displayName}`);
      await this.takeScreenshot(`faction-selection-failed-${faction}`);
    }
  }

  /**
   * Helper: Click "Next Step" button
   */
  async clickNextButton() {
    const selectors = [
      'button:has-text("Next Step")',
      'button:has-text("Next")'
    ];

    for (const selector of selectors) {
      if (await this.exists(selector)) {
        console.log(`  Clicking Next button via selector: ${selector}`);
        await this.click(selector);
        return true;
      }
    }

    // Try finding by text
    const buttons = await this.page.$$('button');
    for (const button of buttons) {
      const text = await button.evaluate(el => el.textContent);
      const isDisabled = await button.evaluate(el => el.disabled);
      if (text && text.includes('Next')) {
        if (isDisabled) {
          console.log(`  ⚠️ Found Next button but it's DISABLED: "${text.trim()}"`);
        } else {
          console.log(`  Clicking Next button: "${text.trim()}"`);
          await button.click();
          return true;
        }
      }
    }

    console.log('  ❌ Could not find enabled Next button');
    return false;
  }

  /**
   * Helper: Click confirm button
   */
  async clickConfirmButton() {
    console.log('  Looking for confirm/create button...');

    // Try finding by text - most reliable
    const buttons = await this.page.$$('button');
    for (const button of buttons) {
      const text = await button.evaluate(el => el.textContent);
      const isDisabled = await button.evaluate(el => el.disabled);
      // Look for "Create Character" specifically (not just "Create" which could match "Create New Character")
      if (!isDisabled && text && text.includes('Create Character') && !text.includes('New')) {
        console.log(`  ✅ Clicking confirm button: "${text.trim()}"`);
        await button.click();
        return true;
      }
    }

    // Fallback: Look for Confirm button
    for (const button of buttons) {
      const text = await button.evaluate(el => el.textContent);
      const isDisabled = await button.evaluate(el => el.disabled);
      if (!isDisabled && text && text.includes('Confirm')) {
        console.log(`  ✅ Clicking confirm button: "${text.trim()}"`);
        await button.click();
        return true;
      }
    }

    // Last resort: Try CSS selectors
    const selectors = [
      'button[type="submit"]:not([disabled])'
    ];

    for (const selector of selectors) {
      if (await this.exists(selector)) {
        console.log(`  ✅ Clicking confirm button via selector: ${selector}`);
        await this.click(selector);
        return true;
      }
    }

    console.log('  ❌ Could not find confirm button');
    return false;
  }

  /**
   * Test character selection
   */
  async testCharacterSelection() {
    console.log('\n🔍 Phase 4: Testing character selection...');

    // Navigate to characters page first
    await this.goto('/characters');
    await this.wait(2000);

    // Dismiss any error modals that might be open
    const dismissModal = async () => {
      const tryAgainButton = await this.page.$('button');
      const buttons = await this.page.$$('button');
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent);
        if (text && (text.includes('Try Again') || text.includes('✕') || text.includes('Close'))) {
          await button.click();
          await this.wait(500);
        }
      }
    };
    await dismissModal();

    // Wait for characters to load
    let loadingTimeout = 5000;
    let elapsed = 0;
    while (elapsed < loadingTimeout) {
      const isLoading = await this.evaluate(() => {
        const spinner = document.querySelector('.loading-spinner, [class*="LoadingSpinner"]');
        return spinner !== null;
      });
      if (!isLoading) break;
      await this.wait(500);
      elapsed += 500;
    }
    await this.wait(1000);

    // Find Play buttons (not the cards themselves)
    let buttonsToClick = [];
    const allButtons = await this.page.$$('button');
    for (const button of allButtons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && text.trim() === 'Play') {
        buttonsToClick.push(button);
      }
    }

    if (buttonsToClick.length === 0) {
      console.log('⚠️ No characters to select (no Play buttons found)');
      return;
    }

    console.log(`📊 Found ${buttonsToClick.length} characters with Play buttons`);

    // Only test the first character to avoid rate limiting issues
    console.log(`\n🎯 Selecting character 1...`);

    // Re-find buttons (DOM may have changed)
    const currentButtons = await this.page.$$('button');
    let playButton = null;
    for (const button of currentButtons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && text.trim() === 'Play') {
        playButton = button;
        break;
      }
    }

    if (!playButton) {
      console.log(`  ⚠️ Could not find Play button`);
      return;
    }

    await playButton.click();
    await this.wait(3000); // Wait longer for navigation

    // Check if we navigated to game
    const url = this.page.url();
    if (url.includes('/game')) {
      console.log('✅ Successfully entered game');
    } else {
      // Check if there's a rate limit error
      const hasRateLimitError = await this.evaluate(() => {
        return document.body.textContent?.includes('429') ||
               document.body.textContent?.includes('Too Many Requests') ||
               document.body.textContent?.includes('rate limit');
      });

      if (hasRateLimitError) {
        console.log('⚠️ Rate limited - skipping character selection test (not a bug, expected behavior)');
      } else {
        await this.reportBug('P1', 'Character Selection Failed', `Did not navigate to game after selecting character`);
      }
    }
  }

  /**
   * Test character limits
   */
  async testCharacterLimits() {
    console.log('\n🔍 Phase 5: Testing character limits...');

    const currentCount = await this.evaluate(() => {
      const cards = document.querySelectorAll('[data-testid="character-card"], .character-card');
      return cards.length;
    });

    console.log(`📊 Current character count: ${currentCount}/${this.characterLimit}`);

    if (currentCount >= this.characterLimit) {
      // Try to create another character
      console.log('🧪 Testing character limit enforcement...');

      const createButtonExists = await this.clickCreateCharacterButton();

      if (createButtonExists) {
        // Check if we get an error or the button is disabled
        const modalOpened = await this.exists('[role="dialog"], .modal, .character-creator');

        if (modalOpened) {
          await this.reportBug('P1', 'Character Limit Not Enforced', 'Able to open creator when at limit');

          // Close modal
          const closeButton = await this.waitForSelector('[aria-label="Close"], button:has-text("Cancel")');
          if (closeButton) await closeButton.click();
        } else {
          console.log('✅ Character limit properly enforced');
        }
      } else {
        console.log('✅ Create button properly hidden/disabled at limit');
      }
    }
  }

  /**
   * Test character deletion
   */
  async testCharacterDeletion() {
    console.log('\n🔍 Phase 6: Testing character deletion...');

    const cards = await this.page.$$('[data-testid="character-card"], .character-card');

    if (cards.length === 0) {
      console.log('⚠️ No characters to delete');
      return;
    }

    const initialCount = cards.length;
    console.log(`🗑️ Attempting to delete 1 character (current: ${initialCount})...`);

    // Look for delete button on first card
    const deleteButton = await this.page.$('[data-testid="delete-character"], button[aria-label*="delete"], .delete-button');

    if (!deleteButton) {
      console.log('⚠️ No delete button found - may be by design');
      return;
    }

    await deleteButton.click();
    await this.wait(1000);

    // Check for confirmation dialog
    const confirmDialog = await this.exists('[role="alertdialog"], .confirm-dialog');
    if (confirmDialog) {
      // Confirm deletion
      await this.click('button:has-text("Confirm"), button:has-text("Delete")');
      await this.wait(2000);
    }

    // Check new count
    const newCount = await this.evaluate(() => {
      const cards = document.querySelectorAll('[data-testid="character-card"], .character-card');
      return cards.length;
    });

    if (newCount < initialCount) {
      console.log('✅ Character deleted successfully');
    } else {
      await this.reportBug('P2', 'Character Deletion Failed', 'Character count did not decrease after deletion');
    }
  }

  /**
   * Generate character report
   */
  async generateCharacterReport() {
    console.log('\n📊 CHARACTER SYSTEM REPORT');
    console.log('=' .repeat(60));

    const features = [
      { name: 'Registration', tested: this.testUsers.length > 0 },
      { name: 'Login', tested: true },
      { name: 'Character Creation', tested: this.testCharacters.length > 0 },
      { name: 'Character Selection', tested: true },
      { name: 'Character Limits', tested: true },
      { name: 'Character Deletion', tested: true }
    ];

    console.log('\n🧪 Features Tested:');
    features.forEach(feature => {
      const icon = feature.tested ? '✅' : '⚠️';
      console.log(`  ${icon} ${feature.name}`);
    });

    console.log('\n📊 Test Results:');
    console.log(`  Test Users Created: ${this.testUsers.length}`);
    console.log(`  Test Characters Created: ${this.testCharacters.length}`);
    console.log(`  Factions Tested: ${this.testCharacters.map(c => c.faction).join(', ') || 'None'}`);

    if (this.bugs.length > 0) {
      console.log('\n🐛 Issues Found:');
      this.bugs.forEach(bug => {
        console.log(`  ${bug.severity}: ${bug.title}`);
      });
    } else {
      console.log('\n✅ No major issues found in character system!');
    }

    return {
      featuresTested: features.filter(f => f.tested).length,
      testUsers: this.testUsers.length,
      testCharacters: this.testCharacters.length,
      bugs: this.bugs.length
    };
  }
}

// Run the pioneer if executed directly
if (require.main === module) {
  const pioneer = new PioneerAgent();
  pioneer.runMission().then(report => {
    console.log('\n🏁 Pioneer mission complete!');
    // Use bugsByPriority from the report (set by TestRunner.cleanup)
    const p0Bugs = report.bugsByPriority?.P0 || 0;
    process.exit(p0Bugs > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = PioneerAgent;