/**
 * Visual UI Analysis E2E Test
 * Comprehensive test that takes screenshots at each step, analyzes UI, and reports issues
 */

const { delay } = require('../../helpers/navigation.helper');
const { capture, captureElement } = require('../../helpers/screenshot.helper');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const ANALYSIS_DIR = path.join(__dirname, '../../screenshots/analysis');

// Ensure analysis directory exists
if (!fs.existsSync(ANALYSIS_DIR)) {
  fs.mkdirSync(ANALYSIS_DIR, { recursive: true });
}

// Analysis log
const analysisLog = {
  timestamp: new Date().toISOString(),
  steps: [],
  issues: [],
  screenshots: []
};

/**
 * Log analysis step
 */
function logStep(stepName, status, details = {}) {
  const step = {
    step: stepName,
    status,
    timestamp: new Date().toISOString(),
    ...details
  };
  analysisLog.steps.push(step);
  console.log(`[${status}] ${stepName}`);
  if (details.error) {
    console.error(`  Error: ${details.error}`);
  }
}

/**
 * Log UI issue
 */
function logIssue(severity, category, description, screenshot = null) {
  const issue = {
    severity, // 'critical', 'high', 'medium', 'low'
    category, // 'accessibility', 'layout', 'performance', 'functionality'
    description,
    screenshot,
    timestamp: new Date().toISOString()
  };
  analysisLog.issues.push(issue);
  console.warn(`[${severity.toUpperCase()}] ${category}: ${description}`);
}

/**
 * Analyze page for common issues
 */
async function analyzePage(page, pageName) {
  const analysis = {
    pageName,
    consoleErrors: [],
    missingAlt: 0,
    emptyLinks: 0,
    loadTime: 0,
    viewportIssues: []
  };

  // Check console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      analysis.consoleErrors.push(msg.text());
    }
  });

  // Check accessibility
  const accessibilityIssues = await page.evaluate(() => {
    const issues = [];

    // Check images without alt text
    const images = document.querySelectorAll('img');
    let missingAlt = 0;
    images.forEach(img => {
      if (!img.alt || img.alt.trim() === '') {
        missingAlt++;
      }
    });
    issues.push({ type: 'missing-alt', count: missingAlt });

    // Check links without text
    const links = document.querySelectorAll('a');
    let emptyLinks = 0;
    links.forEach(link => {
      if (!link.textContent.trim() && !link.querySelector('img[alt]')) {
        emptyLinks++;
      }
    });
    issues.push({ type: 'empty-links', count: emptyLinks });

    // Check for very small click targets
    const buttons = document.querySelectorAll('button, a');
    let smallTargets = 0;
    buttons.forEach(btn => {
      const rect = btn.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        smallTargets++;
      }
    });
    issues.push({ type: 'small-click-targets', count: smallTargets });

    // Check for text contrast issues (simplified)
    const elements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    let lowContrast = 0;
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const bg = style.backgroundColor;
      // Simplified check - in reality would calculate contrast ratio
      if (color === bg || color === 'transparent' || bg === 'transparent') {
        lowContrast++;
      }
    });
    issues.push({ type: 'potential-contrast-issues', count: lowContrast });

    return issues;
  });

  accessibilityIssues.forEach(issue => {
    if (issue.count > 0) {
      const severity = issue.count > 10 ? 'high' : issue.count > 5 ? 'medium' : 'low';
      logIssue(severity, 'accessibility', `${pageName}: Found ${issue.count} ${issue.type}`);
    }
  });

  return analysis;
}

describe('Visual UI Analysis - Complete Flow', () => {
  const testUsername = `testuser_${Date.now()}`;
  const testEmail = `${testUsername}@example.com`;
  const testPassword = 'TestPass123!';
  const characterName = `Hero_${Date.now()}`;

  beforeAll(async () => {
    await page.setViewport({ width: 1920, height: 1080 });

    // Monitor network requests
    await page.setRequestInterception(true);
    page.on('request', request => {
      request.continue();
    });

    // Monitor console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Error:', msg.text());
      }
    });

    // Monitor page errors
    page.on('pageerror', error => {
      logIssue('critical', 'functionality', `Page Error: ${error.message}`);
    });

    // Monitor failed requests
    page.on('requestfailed', request => {
      logIssue('high', 'performance', `Failed Request: ${request.url()}`);
    });
  });

  afterAll(async () => {
    // Save analysis report
    const reportPath = path.join(ANALYSIS_DIR, `analysis-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(analysisLog, null, 2));
    console.log(`\n=== Analysis Report Saved: ${reportPath} ===`);

    // Print summary
    console.log('\n=== ANALYSIS SUMMARY ===');
    console.log(`Total Steps: ${analysisLog.steps.length}`);
    console.log(`Total Issues: ${analysisLog.issues.length}`);
    console.log('\nIssues by Severity:');
    const bySeverity = analysisLog.issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {});
    Object.entries(bySeverity).forEach(([severity, count]) => {
      console.log(`  ${severity}: ${count}`);
    });
  });

  it('Step 1: Landing Page - Load and Analyze', async () => {
    logStep('Landing Page Load', 'RUNNING');

    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    const loadTime = Date.now() - startTime;

    // Screenshot
    const screenshotPath = await capture(page, '01-landing-page');
    analysisLog.screenshots.push({ step: 'landing', path: screenshotPath });

    // Analyze
    await analyzePage(page, 'Landing Page');

    // Check load time
    if (loadTime > 3000) {
      logIssue('medium', 'performance', `Landing page took ${loadTime}ms to load (target: <3000ms)`);
    }

    // Verify basic elements
    const bodyText = await page.evaluate(() => document.body.textContent);
    const hasGameName = bodyText.includes('Desperado') || bodyText.includes('Destiny');

    if (!hasGameName) {
      logIssue('high', 'functionality', 'Landing page missing game branding');
    }

    logStep('Landing Page Load', 'PASS', { loadTime, hasGameName });
  });

  it('Step 2: Navigate to Registration', async () => {
    logStep('Navigate to Registration', 'RUNNING');

    try {
      // Look for registration link/button
      const registerButton = await page.evaluate(() => {
        const elements = [...document.querySelectorAll('a, button')];
        const found = elements.find(el =>
          el.textContent && (
            el.textContent.toLowerCase().includes('register') ||
            el.textContent.toLowerCase().includes('sign up') ||
            el.textContent.toLowerCase().includes('create account')
          )
        );
        return found ? true : false;
      });

      if (!registerButton) {
        logIssue('critical', 'functionality', 'No visible registration button found on landing page');
        // Try direct navigation
        await page.goto(`${BASE_URL}/register`);
      } else {
        // Click the registration button
        await page.evaluate(() => {
          const elements = [...document.querySelectorAll('a, button')];
          const found = elements.find(el =>
            el.textContent && (
              el.textContent.toLowerCase().includes('register') ||
              el.textContent.toLowerCase().includes('sign up')
            )
          );
          if (found) found.click();
        });
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
      }

      // Screenshot
      const screenshotPath = await capture(page, '02-register-page');
      analysisLog.screenshots.push({ step: 'register-page', path: screenshotPath });

      // Analyze
      await analyzePage(page, 'Registration Page');

      // Verify we're on registration page
      const url = page.url();
      if (!url.includes('/register') && !url.includes('/signup')) {
        logIssue('critical', 'functionality', `Navigation failed - ended on ${url}`);
      }

      logStep('Navigate to Registration', 'PASS');
    } catch (error) {
      logStep('Navigate to Registration', 'FAIL', { error: error.message });
      throw error;
    }
  });

  it('Step 3: Fill Registration Form', async () => {
    logStep('Fill Registration Form', 'RUNNING');

    try {
      // Wait for form elements
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });

      // Check form labels
      const hasLabels = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
        let labeledInputs = 0;
        inputs.forEach(input => {
          const label = document.querySelector(`label[for="${input.id}"]`) ||
                       input.closest('label') ||
                       input.previousElementSibling?.tagName === 'LABEL';
          if (label) labeledInputs++;
        });
        return labeledInputs >= inputs.length;
      });

      if (!hasLabels) {
        logIssue('high', 'accessibility', 'Registration form inputs missing proper labels');
      }

      // Fill username (if exists)
      const usernameField = await page.$('input[name="username"], input[placeholder*="username" i]');
      if (usernameField) {
        await usernameField.type(testUsername);
        await delay(500);
      }

      // Fill email
      const emailField = await page.$('input[type="email"], input[name="email"]');
      await emailField.type(testEmail);
      await delay(500);

      // Fill password
      const passwordFields = await page.$$('input[type="password"]');
      if (passwordFields.length === 0) {
        logIssue('critical', 'functionality', 'No password field found on registration page');
      }

      await passwordFields[0].type(testPassword);
      await delay(500);

      // Fill password confirmation
      if (passwordFields.length > 1) {
        await passwordFields[1].type(testPassword);
        await delay(500);
      }

      // Screenshot filled form
      const screenshotPath = await capture(page, '03-register-form-filled');
      analysisLog.screenshots.push({ step: 'register-filled', path: screenshotPath });

      logStep('Fill Registration Form', 'PASS', {
        hasLabels,
        fieldsCount: passwordFields.length
      });
    } catch (error) {
      const screenshotPath = await capture(page, '03-ERROR-register-form');
      analysisLog.screenshots.push({ step: 'register-error', path: screenshotPath });
      logStep('Fill Registration Form', 'FAIL', { error: error.message });
      throw error;
    }
  });

  it('Step 4: Submit Registration', async () => {
    logStep('Submit Registration', 'RUNNING');

    try {
      const submitButton = await page.$('button[type="submit"]');
      if (!submitButton) {
        logIssue('critical', 'functionality', 'No submit button found on registration form');
        throw new Error('Submit button not found');
      }

      // Check button text
      const buttonText = await page.evaluate(btn => btn.textContent, submitButton);
      if (!buttonText || buttonText.trim() === '') {
        logIssue('high', 'accessibility', 'Submit button has no visible text');
      }

      await submitButton.click();

      // Wait for response
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        page.waitForSelector('[role="alert"], .error, .success', { timeout: 5000 }),
        delay(3000)
      ]);

      // Screenshot result
      const screenshotPath = await capture(page, '04-register-submitted');
      analysisLog.screenshots.push({ step: 'register-submitted', path: screenshotPath });

      // Check for error messages
      const errorMessage = await page.evaluate(() => {
        const error = document.querySelector('[role="alert"], .error, .text-red-500');
        return error ? error.textContent : null;
      });

      if (errorMessage) {
        logIssue('high', 'functionality', `Registration error: ${errorMessage}`);
        logStep('Submit Registration', 'FAIL', { error: errorMessage });
      } else {
        logStep('Submit Registration', 'PASS');
      }
    } catch (error) {
      const screenshotPath = await capture(page, '04-ERROR-submit-registration');
      analysisLog.screenshots.push({ step: 'submit-error', path: screenshotPath });
      logStep('Submit Registration', 'FAIL', { error: error.message });
      throw error;
    }
  });

  it('Step 5: Login (if needed)', async () => {
    logStep('Login Check', 'RUNNING');

    const url = page.url();

    if (url.includes('/login')) {
      // Need to login
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      await page.type('input[type="email"]', testEmail);
      await page.type('input[type="password"]', testPassword);

      const screenshotPath = await capture(page, '05-login-page');
      analysisLog.screenshots.push({ step: 'login', path: screenshotPath });

      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });

      logStep('Login Check', 'PASS', { loginRequired: true });
    } else {
      logStep('Login Check', 'PASS', { loginRequired: false });
    }
  });

  it('Step 6: Character Creation - Name and Faction', async () => {
    logStep('Character Creation Start', 'RUNNING');

    try {
      await delay(2000);

      // Should be on characters page first
      const url = page.url();
      if (!url.includes('/characters')) {
        logIssue('high', 'functionality', `Expected characters page, got: ${url}`);
      }

      // Screenshot characters page
      const screenshotPath1 = await capture(page, '06-character-creation-start');
      analysisLog.screenshots.push({ step: 'character-start', path: screenshotPath1 });

      // Click "Create Your First Character" button to open modal
      const createButton = await page.$('[data-testid="create-first-character-button"]');
      if (!createButton) {
        logIssue('critical', 'functionality', 'Create character button not found on characters page');
        throw new Error('Create character button not found');
      }

      await createButton.click();
      await delay(1500);

      // Analyze character creation modal
      await analyzePage(page, 'Character Creation');

      // Enter character name
      await page.waitForSelector('#character-name, input[id="character-name"]', { timeout: 10000 });

      const nameInput = await page.$('#character-name');
      await nameInput.type(characterName);
      await delay(1000);

      // Screenshot with name entered
      const screenshotPath2 = await capture(page, '07-character-name-entered');
      analysisLog.screenshots.push({ step: 'character-name', path: screenshotPath2 });

      // Select faction - use data-testid from Sprint 1 implementation
      const factionCards = await page.$$('[data-testid^="faction-card-"]');

      if (factionCards.length === 0) {
        logIssue('critical', 'functionality', 'No faction selection options found');
      } else {
        // Click first faction
        await factionCards[0].click();
        await delay(1000);

        // Screenshot faction selected
        const screenshotPath3 = await capture(page, '08-faction-selected');
        analysisLog.screenshots.push({ step: 'faction-selected', path: screenshotPath3 });

        // Check if faction is visually highlighted
        const isHighlighted = await page.evaluate(() => {
          const factions = document.querySelectorAll('[data-testid^="faction-card-"]');
          return Array.from(factions).some(f =>
            f.classList.contains('selected') ||
            f.classList.contains('active') ||
            f.getAttribute('aria-selected') === 'true'
          );
        });

        if (!isHighlighted) {
          logIssue('medium', 'accessibility', 'Selected faction has no visual indication');
        }
      }

      // Try to proceed - use data-testid from Sprint 1 implementation
      const nextButton = await page.$('[data-testid="character-next-button"]');

      if (nextButton) {
        await nextButton.click();
        await delay(2000);

        const screenshotPath4 = await capture(page, '09-after-next-step');
        analysisLog.screenshots.push({ step: 'after-next', path: screenshotPath4 });
      } else {
        logIssue('high', 'functionality', 'No "Next" or "Continue" button found');
      }

      logStep('Character Creation Start', 'PASS');
    } catch (error) {
      const screenshotPath = await capture(page, '06-ERROR-character-creation');
      analysisLog.screenshots.push({ step: 'character-error', path: screenshotPath });
      logStep('Character Creation Start', 'FAIL', { error: error.message });
      throw error;
    }
  });

  it('Step 7: Complete Character Creation', async () => {
    logStep('Complete Character Creation', 'RUNNING');

    try {
      // Check for additional steps (appearance, skills, etc.)
      await delay(1000);

      // Look for final "Create" or "Confirm" button - use data-testid from Sprint 1 implementation
      const createButton = await page.$('[data-testid="character-create-button"]');

      if (createButton) {
        await createButton.click();

        await Promise.race([
          page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
          delay(5000)
        ]);

        const screenshotPath = await capture(page, '10-character-created');
        analysisLog.screenshots.push({ step: 'character-created', path: screenshotPath });
      } else {
        logIssue('high', 'functionality', 'No final "Create Character" button found');
      }

      logStep('Complete Character Creation', 'PASS');
    } catch (error) {
      const screenshotPath = await capture(page, '10-ERROR-complete-character');
      analysisLog.screenshots.push({ step: 'complete-error', path: screenshotPath });
      logStep('Complete Character Creation', 'FAIL', { error: error.message });
      throw error;
    }
  });

  it('Step 8: Verify Game Dashboard', async () => {
    logStep('Verify Game Dashboard', 'RUNNING');

    try {
      await delay(3000);

      const url = page.url();
      const screenshotPath = await capture(page, '11-game-dashboard');
      analysisLog.screenshots.push({ step: 'dashboard', path: screenshotPath });

      // Analyze dashboard
      await analyzePage(page, 'Game Dashboard');

      // Check if on game page
      const isOnGame = url.includes('/game') ||
                       url.includes('/dashboard') ||
                       url.includes('/play');

      if (!isOnGame) {
        logIssue('critical', 'functionality', `Not on game page after character creation: ${url}`);
      }

      // Verify essential UI elements
      const uiElements = await page.evaluate(() => {
        const text = document.body.textContent;
        return {
          hasEnergy: text.includes('Energy') || text.includes('energy'),
          hasGold: text.includes('Gold') || text.includes('gold') || text.includes('$'),
          hasLevel: text.includes('Level') || text.includes('level') || text.includes('Lvl'),
          hasHealth: text.includes('Health') || text.includes('HP') || text.includes('health'),
          hasNavigation: document.querySelector('nav, [role="navigation"]') !== null
        };
      });

      Object.entries(uiElements).forEach(([element, present]) => {
        if (!present) {
          logIssue('high', 'functionality', `Dashboard missing: ${element}`);
        }
      });

      // Check for tutorial or welcome message
      const hasTutorial = await page.evaluate(() => {
        const text = document.body.textContent.toLowerCase();
        return text.includes('tutorial') ||
               text.includes('welcome') ||
               text.includes('getting started') ||
               text.includes('help');
      });

      if (!hasTutorial) {
        logIssue('medium', 'functionality', 'No tutorial or welcome message for new players');
      }

      logStep('Verify Game Dashboard', 'PASS', {
        url,
        uiElements,
        hasTutorial
      });
    } catch (error) {
      const screenshotPath = await capture(page, '11-ERROR-dashboard');
      analysisLog.screenshots.push({ step: 'dashboard-error', path: screenshotPath });
      logStep('Verify Game Dashboard', 'FAIL', { error: error.message });
      throw error;
    }
  });

  it('Step 9: Test Navigation and Core Features', async () => {
    logStep('Test Navigation', 'RUNNING');

    try {
      // Find navigation elements
      const navLinks = await page.evaluate(() => {
        const nav = document.querySelector('nav, [role="navigation"]');
        if (!nav) return [];

        const links = Array.from(nav.querySelectorAll('a, button'));
        return links.map(link => ({
          text: link.textContent?.trim() || '',
          href: link.getAttribute('href') || '',
          isButton: link.tagName === 'BUTTON'
        })).filter(link => link.text);
      });

      if (navLinks.length === 0) {
        logIssue('critical', 'functionality', 'No navigation links found');
      }

      // Test a few navigation items
      const navItemsToTest = Math.min(3, navLinks.length);
      for (let i = 0; i < navItemsToTest; i++) {
        const link = navLinks[i];

        try {
          // Click navigation item
          await page.evaluate((text) => {
            const elements = [...document.querySelectorAll('nav a, nav button, [role="navigation"] a, [role="navigation"] button')];
            const found = elements.find(el => el.textContent?.trim() === text);
            if (found) found.click();
          }, link.text);

          await delay(2000);

          // Screenshot
          const screenshotPath = await capture(page, `12-nav-${link.text.replace(/\s+/g, '-').toLowerCase()}`);
          analysisLog.screenshots.push({
            step: `nav-${link.text}`,
            path: screenshotPath
          });

          // Analyze page
          await analyzePage(page, `Navigation: ${link.text}`);

        } catch (error) {
          logIssue('medium', 'functionality', `Navigation to "${link.text}" failed: ${error.message}`);
        }
      }

      logStep('Test Navigation', 'PASS', {
        navLinksCount: navLinks.length
      });
    } catch (error) {
      logStep('Test Navigation', 'FAIL', { error: error.message });
    }
  });

  it('Step 10: Test Responsive Design', async () => {
    logStep('Test Responsive Design', 'RUNNING');

    const viewports = [
      { width: 375, height: 667, name: 'mobile' },      // iPhone SE
      { width: 768, height: 1024, name: 'tablet' },     // iPad
      { width: 1920, height: 1080, name: 'desktop' }    // Desktop
    ];

    for (const viewport of viewports) {
      try {
        await page.setViewport(viewport);
        await delay(1000);

        const screenshotPath = await capture(page, `13-responsive-${viewport.name}`);
        analysisLog.screenshots.push({
          step: `responsive-${viewport.name}`,
          path: screenshotPath
        });

        // Check for horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        if (hasHorizontalScroll) {
          logIssue('high', 'layout', `Horizontal scroll detected on ${viewport.name}`);
        }

        // Check for overlapping elements (simplified)
        const hasOverlap = await page.evaluate(() => {
          const elements = document.querySelectorAll('button, a, input');
          let overlaps = 0;

          for (let i = 0; i < elements.length - 1; i++) {
            const rect1 = elements[i].getBoundingClientRect();
            const rect2 = elements[i + 1].getBoundingClientRect();

            if (rect1.bottom > rect2.top && rect1.right > rect2.left) {
              overlaps++;
            }
          }

          return overlaps;
        });

        if (hasOverlap > 5) {
          logIssue('medium', 'layout', `${hasOverlap} potential overlapping elements on ${viewport.name}`);
        }

      } catch (error) {
        logIssue('medium', 'layout', `Responsive test failed for ${viewport.name}: ${error.message}`);
      }
    }

    // Reset to desktop
    await page.setViewport({ width: 1920, height: 1080 });

    logStep('Test Responsive Design', 'PASS');
  });
});
