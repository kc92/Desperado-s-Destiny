/**
 * HumanBehaviorSimulator
 *
 * Models realistic human behavior patterns including cognitive states, mistakes,
 * variable timing, and break-taking behavior. Makes bots feel organic and natural
 * rather than mechanical and perfect.
 *
 * @module HumanBehaviorSimulator
 */

/**
 * Represents a game action that can be performed
 */
export interface GameAction {
  type: 'combat' | 'crime' | 'travel' | 'shop' | 'social' | 'menu' | 'input';
  complexity: number;  // 0-1 scale, affects thinking time
  repetitive?: boolean;  // Whether this action has been done recently
  important?: boolean;  // Whether failure has high consequences
}

/**
 * Tracks the cognitive state of a simulated human
 * All values range from 0 to 1
 */
export interface CognitiveState {
  attention: number;      // 0-1: decreases over time, affects error rate
  fatigue: number;        // 0-1: increases with actions, affects speed
  boredom: number;        // 0-1: increases with repetition, affects variety
  frustration: number;    // 0-1: increases with failures, affects risk-taking
}

/**
 * Types of mistakes humans commonly make
 */
export interface MistakeType {
  type: 'click_wrong_button' | 'typo_in_input' | 'navigate_wrong_page' | 'close_modal_accident';
  probability: number;
  recoveryTime: number;  // milliseconds
}

/**
 * Patterns for when and how long to take breaks
 */
export interface BreakPattern {
  minFatigue: number;
  minBoredom: number;
  breakDuration: number;  // milliseconds
  breakType: 'micro' | 'short' | 'long';
}

/**
 * Configuration options for the behavior simulator
 */
export interface BehaviorConfig {
  /** Multiplier for all timing delays (default: 1.0) */
  timingMultiplier?: number;

  /** Enable/disable mistake simulation (default: true) */
  enableMistakes?: boolean;

  /** Enable/disable break-taking (default: true) */
  enableBreaks?: boolean;

  /** Base mistake rate multiplier (default: 1.0) */
  mistakeMultiplier?: number;

  /** Enable verbose logging (default: false) */
  verbose?: boolean;
}

/**
 * Simulates realistic human behavior patterns including cognitive states,
 * mistakes, variable timing, and break-taking.
 *
 * @example
 * ```typescript
 * const simulator = new HumanBehaviorSimulator({ verbose: true });
 *
 * // Execute an action with human-like behavior
 * await simulator.performActionWithHumanBehavior(
 *   { type: 'combat', complexity: 0.8, important: true },
 *   async () => {
 *     // Actual game action
 *     await page.click('[data-testid="attack-button"]');
 *   }
 * );
 *
 * // Record result to update cognitive state
 * simulator.recordActionResult(true);
 *
 * // Check cognitive state
 * const state = simulator.getCognitiveState();
 * console.log(`Fatigue: ${state.fatigue}, Attention: ${state.attention}`);
 * ```
 */
export class HumanBehaviorSimulator {
  private cognitiveState: CognitiveState = {
    attention: 1.0,
    fatigue: 0.0,
    boredom: 0.0,
    frustration: 0.0
  };

  private lastActions: string[] = [];  // Track for repetition detection
  private actionCount: number = 0;
  private config: Required<BehaviorConfig>;

  /**
   * Creates a new HumanBehaviorSimulator
   *
   * @param config - Configuration options for behavior simulation
   */
  constructor(config: BehaviorConfig = {}) {
    this.config = {
      timingMultiplier: config.timingMultiplier ?? 1.0,
      enableMistakes: config.enableMistakes ?? true,
      enableBreaks: config.enableBreaks ?? true,
      mistakeMultiplier: config.mistakeMultiplier ?? 1.0,
      verbose: config.verbose ?? false
    };
  }

  /**
   * Execute action with human-like behavior including thinking delays,
   * mistakes, timing variance, and break-taking.
   *
   * @param action - The game action being performed
   * @param executeFunction - The actual function to execute
   *
   * @example
   * ```typescript
   * await simulator.performActionWithHumanBehavior(
   *   { type: 'crime', complexity: 0.5 },
   *   async () => await page.click('#commit-crime')
   * );
   * ```
   */
  async performActionWithHumanBehavior(
    action: GameAction,
    executeFunction: () => Promise<void>
  ): Promise<void> {
    this.actionCount++;

    // 1. Pre-action thinking delay
    await this.thinkingDelay(action);

    // 2. Possibility of making a mistake
    if (this.config.enableMistakes && this.shouldMakeMistake(action)) {
      await this.makeRealisticMistake(action);
    }

    // 3. Execute action with human-like timing variance
    await this.executeWithVariance(executeFunction, action);

    // 4. Update cognitive state
    this.updateCognitiveState(action);

    // 5. Post-action reading delay
    await this.readingDelay(action);

    // 6. Check if need break
    if (this.config.enableBreaks && this.shouldTakeBreak()) {
      await this.takeBreak();
    }
  }

  /**
   * Pre-action thinking delay - humans don't act instantly.
   * Factors in action complexity, fatigue, and attention level.
   *
   * @param action - The action being considered
   */
  private async thinkingDelay(action: GameAction): Promise<void> {
    // Complex decisions take longer (0.5-2 seconds base)
    const baseDelay = (0.5 + action.complexity * 1.5) * 1000;  // milliseconds

    // Fatigue increases thinking time (up to 2x slower)
    const fatigueMultiplier = 1 + this.cognitiveState.fatigue;

    // Low attention adds variance (up to 50% more random variation)
    const attentionVariance = (1 - this.cognitiveState.attention) * 0.5;

    // Important actions get extra consideration time
    const importanceMultiplier = action.important ? 1.3 : 1.0;

    const delay = baseDelay *
                 fatigueMultiplier *
                 importanceMultiplier *
                 (1 + Math.random() * attentionVariance) *
                 this.config.timingMultiplier;

    if (this.config.verbose) {
      console.log(`[Thinking] ${Math.round(delay)}ms for ${action.type} (complexity: ${action.complexity})`);
    }

    await sleep(delay);
  }

  /**
   * Determine if bot should make a mistake based on cognitive state.
   *
   * @param action - The action being performed
   * @returns Whether a mistake should occur
   */
  private shouldMakeMistake(action: GameAction): boolean {
    // Base mistake rates by cognitive factors
    const inattentionRate = (1 - this.cognitiveState.attention) * 0.1;  // Up to 10%
    const fatigueRate = this.cognitiveState.fatigue * 0.05;             // Up to 5%
    const frustrationRate = this.cognitiveState.frustration * 0.03;     // Up to 3%

    // Important actions reduce mistake rate (more careful)
    const importanceReduction = action.important ? 0.5 : 1.0;

    // Complex actions slightly increase mistake rate
    const complexityIncrease = 1 + (action.complexity * 0.2);

    const mistakeRate =
      (inattentionRate + fatigueRate + frustrationRate) *
      importanceReduction *
      complexityIncrease *
      this.config.mistakeMultiplier;

    const shouldMistake = Math.random() < mistakeRate;

    if (shouldMistake && this.config.verbose) {
      console.log(`[Mistake] Triggered (rate: ${(mistakeRate * 100).toFixed(1)}%)`);
    }

    return shouldMistake;
  }

  /**
   * Simulate a realistic human mistake and recovery process.
   *
   * @param action - The action being attempted
   */
  private async makeRealisticMistake(action: GameAction): Promise<void> {
    const mistakes: MistakeType[] = [
      { type: 'click_wrong_button', probability: 0.4, recoveryTime: 1500 },
      { type: 'typo_in_input', probability: 0.3, recoveryTime: 2000 },
      { type: 'navigate_wrong_page', probability: 0.2, recoveryTime: 3000 },
      { type: 'close_modal_accident', probability: 0.1, recoveryTime: 2500 }
    ];

    // Weighted random selection based on action type
    let weightedMistakes = [...mistakes];

    // Input actions more likely to have typos
    if (action.type === 'input') {
      weightedMistakes = weightedMistakes.map(m =>
        m.type === 'typo_in_input'
          ? { ...m, probability: m.probability * 2 }
          : m
      );
    }

    // Normalize probabilities
    const totalProb = weightedMistakes.reduce((sum, m) => sum + m.probability, 0);
    const normalizedMistakes = weightedMistakes.map(m => ({
      ...m,
      probability: m.probability / totalProb
    }));

    // Select mistake
    const rand = Math.random();
    let cumulative = 0;
    let selectedMistake = normalizedMistakes[0];

    for (const mistake of normalizedMistakes) {
      cumulative += mistake.probability;
      if (rand <= cumulative) {
        selectedMistake = mistake;
        break;
      }
    }

    console.log(`[Human Behavior] Made mistake: ${selectedMistake.type}`);

    // Pause for "realization" time (humans take a moment to notice)
    const realizationTime = 500 + Math.random() * 1000;
    await sleep(realizationTime * this.config.timingMultiplier);

    // Recovery delay (fixing the mistake)
    const recoveryTime = selectedMistake.recoveryTime * (0.8 + Math.random() * 0.4);
    await sleep(recoveryTime * this.config.timingMultiplier);

    // Mistakes slightly increase frustration
    this.cognitiveState.frustration = Math.min(1, this.cognitiveState.frustration + 0.03);
  }

  /**
   * Execute action with human-like timing variance.
   * Adds small random delays before and after execution.
   *
   * @param executeFunction - The function to execute
   * @param action - The action being performed
   */
  private async executeWithVariance(
    executeFunction: () => Promise<void>,
    action: GameAction
  ): Promise<void> {
    // Add small random delay before execution (hand movement, mouse positioning)
    const preDelay = (100 + Math.random() * 300) * this.config.timingMultiplier;
    await sleep(preDelay);

    // Execute actual action
    try {
      await executeFunction();
    } catch (error) {
      if (this.config.verbose) {
        console.log(`[Execution] Action failed: ${error}`);
      }
      // Increase frustration on execution failure
      this.cognitiveState.frustration = Math.min(1, this.cognitiveState.frustration + 0.1);
      throw error;
    }

    // Add small random delay after execution (visual confirmation)
    const postDelay = (50 + Math.random() * 200) * this.config.timingMultiplier;
    await sleep(postDelay);
  }

  /**
   * Post-action reading delay - humans read and process results.
   *
   * @param action - The action that was performed
   */
  private async readingDelay(action: GameAction): Promise<void> {
    // Different actions have different reading requirements
    const baseReadingTimes: Record<string, number> = {
      combat: 2000,    // Combat results need careful reading
      crime: 1500,     // Crime outcomes are important
      social: 1000,    // Social interactions require attention
      shop: 800,       // Shop confirmations are quick
      menu: 500,       // Menu navigation is fast
      travel: 600,     // Travel confirmations are brief
      input: 400       // Input feedback is quick
    };

    const baseReadingTime = baseReadingTimes[action.type] || 500;

    // Attention affects reading speed (low attention = slower reading)
    const attentionFactor = 0.5 + (this.cognitiveState.attention * 0.5);

    // Important actions get extra reading time
    const importanceFactor = action.important ? 1.5 : 1.0;

    // Fatigue makes reading slower
    const fatigueFactor = 1 + (this.cognitiveState.fatigue * 0.3);

    const readingTime = baseReadingTime *
                       attentionFactor *
                       importanceFactor *
                       fatigueFactor *
                       this.config.timingMultiplier;

    // Add natural variance (humans don't read at constant speed)
    const variance = readingTime * (0.5 + Math.random());

    if (this.config.verbose) {
      console.log(`[Reading] ${Math.round(readingTime + variance)}ms for ${action.type} result`);
    }

    await sleep(readingTime + variance);
  }

  /**
   * Update cognitive state based on performed action.
   * Tracks attention decay, fatigue accumulation, and boredom from repetition.
   *
   * @param action - The action that was performed
   */
  private updateCognitiveState(action: GameAction): void {
    // Attention decreases over time (diminishing focus)
    // Rate depends on current attention (faster decay when already low)
    const attentionDecay = 0.01 * (1 + (1 - this.cognitiveState.attention) * 0.5);
    this.cognitiveState.attention = Math.max(0, this.cognitiveState.attention - attentionDecay);

    // Fatigue increases with each action
    // Complex actions are more tiring
    const fatigueIncrease = 0.015 + (action.complexity * 0.015);
    this.cognitiveState.fatigue = Math.min(1, this.cognitiveState.fatigue + fatigueIncrease);

    // Track repetition for boredom
    this.lastActions.push(action.type);
    if (this.lastActions.length > 10) {
      this.lastActions.shift();
    }

    // Boredom increases with repetitive actions
    const uniqueActions = new Set(this.lastActions).size;
    if (uniqueActions < 3) {  // Less than 3 different actions in last 10
      this.cognitiveState.boredom = Math.min(1, this.cognitiveState.boredom + 0.05);
    } else if (uniqueActions > 6) {  // High variety
      this.cognitiveState.boredom = Math.max(0, this.cognitiveState.boredom - 0.02);
    }

    // Log state changes if verbose
    if (this.config.verbose && this.actionCount % 5 === 0) {
      console.log(`[Cognitive State] Attention: ${this.cognitiveState.attention.toFixed(2)}, ` +
                 `Fatigue: ${this.cognitiveState.fatigue.toFixed(2)}, ` +
                 `Boredom: ${this.cognitiveState.boredom.toFixed(2)}, ` +
                 `Frustration: ${this.cognitiveState.frustration.toFixed(2)}`);
    }
  }

  /**
   * Record the result of an action to adjust frustration level.
   *
   * @param success - Whether the action succeeded
   * @param wasImportant - Whether this was an important action (affects frustration more)
   *
   * @example
   * ```typescript
   * // After combat
   * const won = await checkCombatResult();
   * simulator.recordActionResult(won, true);
   * ```
   */
  recordActionResult(success: boolean, wasImportant: boolean = false): void {
    if (!success) {
      // Failures increase frustration (more for important actions)
      const increase = wasImportant ? 0.15 : 0.1;
      this.cognitiveState.frustration = Math.min(1, this.cognitiveState.frustration + increase);

      if (this.config.verbose) {
        console.log(`[Result] Failure increased frustration to ${this.cognitiveState.frustration.toFixed(2)}`);
      }
    } else {
      // Successes reduce frustration
      const decrease = wasImportant ? 0.08 : 0.05;
      this.cognitiveState.frustration = Math.max(0, this.cognitiveState.frustration - decrease);

      if (this.config.verbose) {
        console.log(`[Result] Success reduced frustration to ${this.cognitiveState.frustration.toFixed(2)}`);
      }
    }
  }

  /**
   * Check if bot should take a break based on cognitive state.
   *
   * @returns Whether a break should be taken
   */
  private shouldTakeBreak(): boolean {
    // High fatigue or boredom triggers break
    const needsBreak = this.cognitiveState.fatigue > 0.8 || this.cognitiveState.boredom > 0.7;

    // Extreme frustration can also trigger a break (rage quit prevention)
    const extremelyFrustrated = this.cognitiveState.frustration > 0.9;

    return needsBreak || extremelyFrustrated;
  }

  /**
   * Take a break to refresh cognitive state.
   * Break duration depends on severity of fatigue/boredom.
   */
  private async takeBreak(): Promise<void> {
    let breakType: 'micro' | 'short' | 'long';
    let breakDuration: number;

    // Determine break type and duration based on cognitive state
    if (this.cognitiveState.fatigue > 0.9 ||
        this.cognitiveState.boredom > 0.9 ||
        this.cognitiveState.frustration > 0.9) {
      // Long break (5-15 minutes) for severe exhaustion/frustration
      breakType = 'long';
      breakDuration = (5 + Math.random() * 10) * 60 * 1000;
    } else if (this.cognitiveState.fatigue > 0.7 || this.cognitiveState.boredom > 0.7) {
      // Short break (1-5 minutes) for moderate fatigue
      breakType = 'short';
      breakDuration = (1 + Math.random() * 4) * 60 * 1000;
    } else {
      // Micro break (30-120 seconds) for mild fatigue
      breakType = 'micro';
      breakDuration = (30 + Math.random() * 90) * 1000;
    }

    // Apply timing multiplier
    breakDuration *= this.config.timingMultiplier;

    console.log(`[Human Behavior] Taking ${breakType} break for ${Math.round(breakDuration / 1000)}s`);
    console.log(`  Reason: Fatigue=${this.cognitiveState.fatigue.toFixed(2)}, ` +
               `Boredom=${this.cognitiveState.boredom.toFixed(2)}, ` +
               `Frustration=${this.cognitiveState.frustration.toFixed(2)}`);

    await sleep(breakDuration);

    // Refresh cognitive state based on break type
    if (breakType === 'long') {
      // Full refresh
      this.cognitiveState.attention = 1.0;
      this.cognitiveState.fatigue = 0.0;
      this.cognitiveState.boredom = 0.0;
      this.cognitiveState.frustration = Math.max(0, this.cognitiveState.frustration - 0.5);
    } else if (breakType === 'short') {
      // Substantial refresh
      this.cognitiveState.attention = Math.min(1.0, this.cognitiveState.attention + 0.5);
      this.cognitiveState.fatigue = Math.max(0, this.cognitiveState.fatigue - 0.5);
      this.cognitiveState.boredom = Math.max(0, this.cognitiveState.boredom - 0.3);
      this.cognitiveState.frustration = Math.max(0, this.cognitiveState.frustration - 0.2);
    } else {
      // Minor refresh
      this.cognitiveState.attention = Math.min(1.0, this.cognitiveState.attention + 0.2);
      this.cognitiveState.fatigue = Math.max(0, this.cognitiveState.fatigue - 0.2);
      this.cognitiveState.frustration = Math.max(0, this.cognitiveState.frustration - 0.1);
    }

    this.lastActions = [];  // Reset repetition tracking after break

    console.log(`[Human Behavior] Break complete. Refreshed state: ` +
               `Attention=${this.cognitiveState.attention.toFixed(2)}, ` +
               `Fatigue=${this.cognitiveState.fatigue.toFixed(2)}`);
  }

  /**
   * Get current cognitive state (for debugging/logging).
   *
   * @returns A copy of the current cognitive state
   */
  getCognitiveState(): CognitiveState {
    return { ...this.cognitiveState };
  }

  /**
   * Get action statistics.
   *
   * @returns Statistics about actions performed
   */
  getStatistics() {
    return {
      totalActions: this.actionCount,
      recentActions: [...this.lastActions],
      uniqueRecentActions: new Set(this.lastActions).size
    };
  }

  /**
   * Reset to fresh state (e.g., after login, new session).
   * Simulates a well-rested human starting fresh.
   */
  reset(): void {
    this.cognitiveState = {
      attention: 1.0,
      fatigue: 0.0,
      boredom: 0.0,
      frustration: 0.0
    };
    this.lastActions = [];
    this.actionCount = 0;

    if (this.config.verbose) {
      console.log('[Human Behavior] Reset to fresh state');
    }
  }

  /**
   * Manually adjust cognitive state (for testing scenarios).
   *
   * @param adjustments - Partial cognitive state to merge
   *
   * @example
   * ```typescript
   * // Simulate a tired user
   * simulator.adjustCognitiveState({ fatigue: 0.8, attention: 0.3 });
   * ```
   */
  adjustCognitiveState(adjustments: Partial<CognitiveState>): void {
    this.cognitiveState = {
      ...this.cognitiveState,
      ...adjustments
    };

    // Clamp values to valid range
    this.cognitiveState.attention = Math.max(0, Math.min(1, this.cognitiveState.attention));
    this.cognitiveState.fatigue = Math.max(0, Math.min(1, this.cognitiveState.fatigue));
    this.cognitiveState.boredom = Math.max(0, Math.min(1, this.cognitiveState.boredom));
    this.cognitiveState.frustration = Math.max(0, Math.min(1, this.cognitiveState.frustration));

    if (this.config.verbose) {
      console.log('[Human Behavior] Manual cognitive state adjustment:', this.cognitiveState);
    }
  }
}

/**
 * Calculate overall mistake probability from cognitive state.
 *
 * @param cognitive - Current cognitive state
 * @returns Mistake probability (0-1)
 *
 * @example
 * ```typescript
 * const state = simulator.getCognitiveState();
 * const mistakeChance = calculateMistakeRate(state);
 * console.log(`${(mistakeChance * 100).toFixed(1)}% chance of mistake`);
 * ```
 */
export function calculateMistakeRate(cognitive: CognitiveState): number {
  const inattentionRate = (1 - cognitive.attention) * 0.1;
  const fatigueRate = cognitive.fatigue * 0.05;
  const frustrationRate = cognitive.frustration * 0.03;

  return Math.min(0.25, inattentionRate + fatigueRate + frustrationRate);  // Cap at 25%
}

/**
 * Calculate realistic typing delay for text input.
 * Includes variance based on cognitive state and occasional typos.
 *
 * @param text - The text being typed
 * @param cognitive - Current cognitive state
 * @returns Total typing time in milliseconds
 *
 * @example
 * ```typescript
 * const state = simulator.getCognitiveState();
 * const delay = getTypingDelay("MyPassword123", state);
 * await typeWithDelay(input, "MyPassword123", delay);
 * ```
 */
export function getTypingDelay(text: string, cognitive: CognitiveState): number {
  // Base typing speed: 40-60 WPM for average human
  // ~200-300ms per character with variance
  const baseCharDelay = 200 + Math.random() * 100;

  // Fatigue slows typing
  const fatigueMultiplier = 1 + cognitive.fatigue * 0.5;

  // Low attention increases variance (inconsistent speed)
  const attentionVariance = (1 - cognitive.attention) * 0.3;

  let totalDelay = 0;

  for (let i = 0; i < text.length; i++) {
    // Each character has slightly different timing
    const charDelay = baseCharDelay *
                     fatigueMultiplier *
                     (1 + (Math.random() - 0.5) * attentionVariance);

    totalDelay += charDelay;

    // Occasional typo requires backspace and retype (5% base chance)
    const typoChance = 0.05 + (1 - cognitive.attention) * 0.05;
    if (Math.random() < typoChance) {
      // Time to realize mistake, backspace, and retype
      totalDelay += 500 + Math.random() * 500;
    }
  }

  return totalDelay;
}

/**
 * Check if user should briefly zone out (stop paying attention).
 * Happens more often when fatigued or bored.
 *
 * @param cognitive - Current cognitive state
 * @returns Whether a zone-out moment should occur
 *
 * @example
 * ```typescript
 * if (shouldZoneOut(simulator.getCognitiveState())) {
 *   console.log("User zoned out for a moment...");
 *   await sleep(2000 + Math.random() * 3000);
 * }
 * ```
 */
export function shouldZoneOut(cognitive: CognitiveState): boolean {
  // Zone out chance increases with low attention, high fatigue, high boredom
  const zoneOutRate =
    (1 - cognitive.attention) * 0.02 +  // Up to 2%
    cognitive.fatigue * 0.03 +          // Up to 3%
    cognitive.boredom * 0.05;           // Up to 5%

  return Math.random() < zoneOutRate;
}

/**
 * Get a random zone-out duration in milliseconds.
 * Ranges from brief (2-5s) to extended (10-30s) based on cognitive state.
 *
 * @param cognitive - Current cognitive state
 * @returns Zone-out duration in milliseconds
 */
export function getZoneOutDuration(cognitive: CognitiveState): number {
  // Base zone-out: 2-5 seconds
  let duration = 2000 + Math.random() * 3000;

  // Fatigue and boredom can extend zone-outs
  if (cognitive.fatigue > 0.7 || cognitive.boredom > 0.7) {
    duration += 5000 + Math.random() * 10000;  // +5-15s
  }

  return duration;
}

/**
 * Sleep utility function.
 *
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Example usage demonstrating the HumanBehaviorSimulator
 */
export async function exampleUsage() {
  console.log('=== HumanBehaviorSimulator Example Usage ===\n');

  // Create simulator with verbose logging
  const simulator = new HumanBehaviorSimulator({
    verbose: true,
    timingMultiplier: 0.1  // Speed up for example (10x faster)
  });

  // Simulate a combat action
  console.log('1. Performing combat action...');
  await simulator.performActionWithHumanBehavior(
    { type: 'combat', complexity: 0.8, important: true },
    async () => {
      console.log('  [Action] Clicking attack button');
      // In real usage: await page.click('[data-testid="attack-button"]');
    }
  );
  simulator.recordActionResult(true, true);  // Won the combat

  // Simulate repetitive actions (will increase boredom)
  console.log('\n2. Performing repetitive crime actions...');
  for (let i = 0; i < 5; i++) {
    await simulator.performActionWithHumanBehavior(
      { type: 'crime', complexity: 0.3 },
      async () => {
        console.log(`  [Action] Committing crime #${i + 1}`);
      }
    );
    simulator.recordActionResult(Math.random() > 0.3);  // 70% success rate
  }

  // Check cognitive state
  console.log('\n3. Current cognitive state:');
  const state = simulator.getCognitiveState();
  console.log(`  Attention: ${(state.attention * 100).toFixed(0)}%`);
  console.log(`  Fatigue: ${(state.fatigue * 100).toFixed(0)}%`);
  console.log(`  Boredom: ${(state.boredom * 100).toFixed(0)}%`);
  console.log(`  Frustration: ${(state.frustration * 100).toFixed(0)}%`);

  // Get statistics
  console.log('\n4. Action statistics:');
  const stats = simulator.getStatistics();
  console.log(`  Total actions: ${stats.totalActions}`);
  console.log(`  Recent actions: ${stats.recentActions.join(', ')}`);
  console.log(`  Unique recent: ${stats.uniqueRecentActions}`);

  // Demonstrate utility functions
  console.log('\n5. Utility function examples:');
  const mistakeRate = calculateMistakeRate(state);
  console.log(`  Mistake rate: ${(mistakeRate * 100).toFixed(1)}%`);

  const typingTime = getTypingDelay('testpassword123', state);
  console.log(`  Typing delay: ${Math.round(typingTime)}ms`);

  const willZoneOut = shouldZoneOut(state);
  console.log(`  Will zone out: ${willZoneOut}`);
  if (willZoneOut) {
    const zoneOutTime = getZoneOutDuration(state);
    console.log(`  Zone out duration: ${Math.round(zoneOutTime)}ms`);
  }

  console.log('\n=== Example Complete ===');
}

// Uncomment to run example:
// exampleUsage().catch(console.error);
