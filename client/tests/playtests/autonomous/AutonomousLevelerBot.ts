// client/tests/playtests/autonomous/AutonomousLevelerBot.ts
import { Page, Browser } from 'puppeteer';
import fs from 'fs';

class BotLogger {
    private logFile: string;

    constructor(characterName: string) {
        this.logFile = `bot-log-${characterName.replace(/\s+/g, '-')}-${new Date().toISOString().replace(/:/g, '-')}.txt`;
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
        this.log(error.toString());
    }
}

class DecisionEngine {
  decide(state: { energy: { current: number; max: number }; gold: number; level: number; actions: any[], skills: any[] }): { type: string, [key: string]: any } {
    if (state.energy.current >= 20) {
      const cheapestJob = state.actions.sort((a, b) => a.energyCost - b.energyCost)[0];
      if (cheapestJob) {
        return { type: 'job', jobId: cheapestJob.id };
      }
    }

    // Train the lowest-level skill that is not currently training
    const sortedSkills = state.skills.sort((a, b) => a.level - b.level);
    const skillToTrain = sortedSkills.find(skill => !skill.isTraining);
    if (skillToTrain) {
      return { type: 'train', skillId: skillToTrain.id };
    }

    return { type: 'wait' };
  }
}

export class AutonomousLevelerBot {
  private page: Page;
  private browser: Browser;
  private decisionEngine: DecisionEngine;
  private logger: BotLogger | null = null;
  private characterName: string = 'TestBot';
  private isRunning: boolean = false;

  constructor() {
    this.page = null as any;
    this.browser = null as any;
    this.decisionEngine = new DecisionEngine();
  }

  async init() {
    this.browser = (global as any).browser;
    this.page = (global as any).page;
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async close() {
    this.isRunning = false;
  }

  async login(email = 'testuser@example.com', password = 'password123') {
    this.logger?.log(`Logging in as ${email}...`);
    await this.page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

    // Wait for the login form to be visible
    await this.page.waitForSelector('input[name="email"]', { visible: true, timeout: 10000 });
    await this.page.waitForSelector('input[name="password"]', { visible: true, timeout: 10000 });

    await this.page.type('input[name="email"]', email);
    await this.page.type('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
    this.logger?.log('Login successful.');
  }

  async selectCharacter() {
    this.logger?.log('Selecting character...');
    await this.page.waitForSelector('[data-testid="character-card"]');
    this.characterName = await this.page.$eval('[data-testid="character-name"]', el => el.textContent || 'TestBot');
    await this.page.click('[data-testid="character-play-button"]');
    await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
    this.logger = new BotLogger(this.characterName);
    this.logger.log(`Character '${this.characterName}' selected.`);
  }

  async getCurrentEnergy(): Promise<{ current: number; max: number }> {
    await this.page.waitForSelector('[data-tutorial-target="energy-bar"]', { timeout: 5000 }).catch(() => null);
    const energyText = await this.page.$eval('[data-tutorial-target="energy-bar"]', el => el.textContent).catch(() => null);
    if (!energyText) return { current: 0, max: 100 };
    const [current, max] = energyText.split('/').map(s => parseInt(s.trim(), 10));
    return { current, max };
  }

  async getCurrentGold(): Promise<number> {
    const goldText = await this.page.$eval('[data-tutorial-target="currency-gold"]', el => el.textContent);
    if (!goldText) return 0;
    return parseInt(goldText.replace('g', '').trim(), 10);
  }

  async getCurrentLevel(): Promise<number> {
    // Note: This is brittle. A data attribute would be better.
    const levelText = await this.page.$eval('[data-tutorial-target="dashboard-stats"]', el => el.textContent);
    if (!levelText) return 1;
    const match = levelText.match(/Level (\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }

  async getAvailableActions(): Promise<any[]> {
    await this.page.goto('http://localhost:5173/game/actions', { waitUntil: 'networkidle0' });
    await this.page.waitForSelector('[data-job-id]', { timeout: 5000 }).catch(() => null);
    const actions = await this.page.$$eval('[data-job-id]', elements =>
      elements.map(el => ({
        id: el.getAttribute('data-job-id'),
        name: el.querySelector('h3')?.textContent?.trim(),
        energyCost: parseInt(el.querySelector('[data-energy-cost]')?.textContent || '0', 10),
      }))
    ).catch(() => []);
    return actions;
  }

  async getSkillLevels(): Promise<any[]> {
    await this.page.goto('http://localhost:5173/game/skills', { waitUntil: 'networkidle0' });
    await this.page.waitForSelector('[data-skill-id]', { timeout: 5000 }).catch(() => null);
    const skills = await this.page.$$eval('[data-skill-id]', elements =>
        elements.map(el => ({
            id: el.getAttribute('data-skill-id'),
            level: parseInt(el.querySelector('[data-skill-level]')?.textContent || '0', 10),
            isTraining: el.querySelector('[data-training-active="true"]') !== null,
        }))
    ).catch(() => []);
    return skills;
  }

  async performJob(jobId: string) {
    try {
        this.logger?.log(`--- Performing job: ${jobId} ---`);
        await this.page.goto('http://localhost:5173/game/actions', { waitUntil: 'networkidle0' });
        await this.page.click(`[data-job-id="${jobId}"] button`);
        await this.page.waitForSelector('.modal-content'); // Confirmation modal
        await this.page.click('.modal-content button[variant="secondary"]'); // Attempt button
        await this.page.waitForSelector('.modal-content'); // Result modal
        await this.page.click('.modal-content button[variant="secondary"]'); // Continue button
        this.logger?.log('Job completed.');
    } catch (error) {
        this.logger?.error(`Failed to perform job ${jobId}`, error);
    }
  }

  async performTraining(skillId: string) {
    try {
        this.logger?.log(`--- Performing training for: ${skillId} ---`);
        await this.page.goto('http://localhost:5173/game/skills', { waitUntil: 'networkidle0' });
        await this.page.click(`[data-skill-id="${skillId}"] button`);
        this.logger?.log('Training started.');
    } catch (error) {
        this.logger?.error(`Failed to perform training for ${skillId}`, error);
    }
  }

  async run() {
    this.isRunning = true;
    console.log('--- Starting Autonomous Leveler Bot ---');
    
    await this.login();
    await this.selectCharacter();

    // Main loop
    let lastStatusReport = Date.now();
    while (this.isRunning) {
        try {
            this.logger?.log('--- Starting new loop iteration ---');
            const energy = await this.getCurrentEnergy();
            const gold = await this.getCurrentGold();
            const level = await this.getCurrentLevel();
            const actions = await this.getAvailableActions();
            const skills = await this.getSkillLevels();
    
            const state = { energy, gold, level, actions, skills };
            this.logger?.log(`Current state: ${JSON.stringify(state)}`);
            
            const decision = this.decisionEngine.decide(state);
            this.logger?.log(`Decision: ${JSON.stringify(decision)}`);
    
            if (decision.type === 'job') {
                await this.performJob(decision.jobId);
            } else if (decision.type === 'train') {
                await this.performTraining(decision.skillId);
            }
        } catch (error) {
            this.logger?.error('Error in bot loop:', error);
        }
        
        // Periodic status report
        if (Date.now() - lastStatusReport > 1800000) { // 30 minutes
            this.logger?.log('--- 30-Minute Status Report ---');
            const state = { 
                energy: await this.getCurrentEnergy(), 
                gold: await this.getCurrentGold(), 
                level: await this.getCurrentLevel() 
            };
            this.logger?.log(`Current status: ${JSON.stringify(state)}`);
            lastStatusReport = Date.now();
        }

        await this.page.waitForTimeout(10000); // Wait 10 seconds
    }
    this.logger?.log('--- Bot stopped ---');
  }

  stop() {
    this.isRunning = false;
  }
}