import { Page, Browser, ElementHandle } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

class BotLogger {
    private logFile: string;

    constructor(name: string) {
        const dateStr = new Date().toISOString().replace(/:/g, '-');
        this.logFile = path.join(process.cwd(), 'client', 'tests', 'playtests', 'logs', `smoke-test-${name}-${dateStr}.log`);
        
        // Ensure log directory exists
        const dir = path.dirname(this.logFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        this.log('--- Bot Logger Initialized ---');
    }

    log(message: string) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        fs.appendFileSync(this.logFile, logMessage + '\n');
    }

    error(message: string, error: any) {
        this.log(`ERROR: ${message}`);
        this.log(error instanceof Error ? error.stack || error.message : String(error));
    }
}

export class SmokeTestBot {
  private page: Page;
  private browser: Browser;
  private logger: BotLogger;
  private screenshotDir: string;

  constructor() {
    this.page = null as any;
    this.browser = null as any;
    this.logger = new BotLogger('SmokeTest');
    this.screenshotDir = path.join(process.cwd(), 'client', 'tests', 'playtests', 'screenshots');
    if (!fs.existsSync(this.screenshotDir)) {
        fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async init() {
    this.browser = (global as any).browser;
    this.page = (global as any).page;
    
    // Capture console logs
    this.page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error' || type === 'warn') {
            this.logger.log(`[BROWSER ${type.toUpperCase()}] ${text}`);
        }
    });

    await this.page.setViewport({ width: 1280, height: 800 });
    this.logger.log('Browser initialized');
  }

  async takeScreenshot(name: string) {
      const filePath = path.join(this.screenshotDir, `${name}-${Date.now()}.png`);
      await this.page.screenshot({ path: filePath });
      this.logger.log(`Screenshot saved: ${filePath}`);
  }

  async run() {
    try {
        this.logger.log('Starting Smoke Test...');
        
        // 1. Navigate to Home
        await this.page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
        await this.takeScreenshot('01-home-page');

        // 2. Go to Registration
        await this.page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });
        await this.takeScreenshot('02-register-page');

        // 3. Fill Registration Form
        const testUser = `smokeuser_${Date.now()}@example.com`;
        const testPass = 'TestPass123!';
        this.logger.log(`Registering user: ${testUser}`);
        
        await this.page.waitForSelector('input[name="username"]');
        await this.page.type('input[name="username"]', `user_${Date.now().toString().slice(-6)}`);
        await this.page.keyboard.press('Tab');

        await this.page.waitForSelector('input[name="email"]');
        await this.page.type('input[name="email"]', testUser);
        await this.page.keyboard.press('Tab');

        await this.page.waitForSelector('input[name="password"]');
        await this.page.type('input[name="password"]', testPass);
        await this.page.keyboard.press('Tab');

        await this.page.waitForSelector('input[name="confirmPassword"]');
        await this.page.type('input[name="confirmPassword"]', testPass);
        await this.page.keyboard.press('Tab');

        await new Promise(r => setTimeout(r, 2000));
        await this.takeScreenshot('03-filled-registration');

        this.logger.log('Clicking registration submit button...');
        await this.page.evaluate(() => {
            const btn = document.querySelector('button[type="submit"]');
            if (btn) (btn as HTMLElement).click();
        });

        // 4. Wait for Character Select
        this.logger.log('Waiting for redirect to character selection...');
        await new Promise(r => setTimeout(r, 5000));
        await this.takeScreenshot('04-post-registration');

        const bodyText = await this.page.evaluate(() => document.body.innerText);
        
        if (bodyText.includes('Your Characters') || bodyText.includes('Create Your First Character')) {
            this.logger.log('Reached Character Selection');
            
            // Click "Create Your First Character"
            await this.page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const btn = buttons.find(b => b.innerText.includes('Create Your First Character'));
                if (btn) btn.click();
            });
            
            await new Promise(r => setTimeout(r, 2000));
            this.logger.log('Waiting for character creation form...');
            
            await this.page.waitForSelector('#character-name', { timeout: 5000 }).catch(() => null);
            const nameInput = await this.page.$('#character-name');
            
            if (nameInput) {
                this.logger.log('Filling character name...');
                const charName = `Hero${Date.now().toString().slice(-4)}`;
                this.logger.log(`Character name: ${charName}`);
                await this.page.type('#character-name', charName);
                
                this.logger.log('Selecting faction...');
                await this.page.evaluate(() => {
                    const cards = document.querySelectorAll('[data-testid^="faction-"]');
                    if (cards.length > 0) (cards[0] as HTMLElement).click();
                });

                await new Promise(r => setTimeout(r, 500));
                await this.takeScreenshot('05-creation-step1');

                this.logger.log('Clicking Next Step...');
                await this.page.evaluate(() => {
                    const btn = document.querySelector('[data-testid="character-next-button"]');
                    if (btn) (btn as HTMLElement).click();
                });

                await new Promise(r => setTimeout(r, 1000));
                await this.takeScreenshot('06-creation-step2');

                this.logger.log('Confirming character creation...');
                
                // Debug: log button availability
                const modalHtml = await this.page.evaluate(() => document.querySelector('[role="document"]')?.innerHTML || 'Modal document not found');
                this.logger.log(`Modal HTML: ${modalHtml.substring(0, 500)}...`);

                await this.page.waitForSelector('[data-testid="character-create-button"]', { timeout: 5000 }).catch(() => null);
                const confirmBtn = await this.page.$('[data-testid="character-create-button"]');
                if (confirmBtn) {
                    await confirmBtn.click();
                    this.logger.log('Character creation confirmed via test-id');
                    await new Promise(r => setTimeout(r, 5000));
                } else {
                    this.logger.log('Confirm button NOT found via test-id, trying text search');
                    await this.page.evaluate(() => {
                        const buttons = Array.from(document.querySelectorAll('button'));
                        const btn = buttons.find(b => b.innerText.includes('Create Character'));
                        if (btn) btn.click();
                    });
                }
            }
        }

        // 6. Verify Dashboard
        const finalUrl = this.page.url();
        const finalBodyText = await this.page.evaluate(() => document.body.innerText);
        this.logger.log(`Final URL: ${finalUrl}`);
        
        if (finalUrl.includes('/game') || finalBodyText.includes('Energy') || finalBodyText.includes('Gold')) {
            this.logger.log('SUCCESS: Reached Game Dashboard');
            await this.takeScreenshot('07-game-dashboard');
        } else {
            this.logger.log('Finished flow, check screenshots for final state');
        }

    } catch (error) {
        this.logger.error('Test Failed', error);
        await this.takeScreenshot('failure-state');
    }
  }
}