/**
 * Screen Reader Announcer
 * Utility for announcing dynamic content changes to screen readers
 * Uses ARIA live regions for accessibility
 */

/**
 * Priority levels for announcements
 * - polite: Wait for the user to be idle before announcing
 * - assertive: Interrupt current speech to announce immediately
 */
export type AnnouncementPriority = 'polite' | 'assertive';

/**
 * Screen reader announcer class
 * Creates and manages ARIA live region elements for accessibility
 */
class ScreenReaderAnnouncer {
  private politeContainer: HTMLElement | null = null;
  private assertiveContainer: HTMLElement | null = null;
  private initialized = false;

  /**
   * Initialize the announcer by creating ARIA live region elements
   * Should be called once when the app loads
   */
  initialize(): void {
    if (this.initialized || typeof document === 'undefined') return;

    // Create polite announcer (waits for idle)
    this.politeContainer = document.createElement('div');
    this.politeContainer.setAttribute('role', 'status');
    this.politeContainer.setAttribute('aria-live', 'polite');
    this.politeContainer.setAttribute('aria-atomic', 'true');
    this.politeContainer.className = 'sr-only';
    this.politeContainer.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;

    // Create assertive announcer (interrupts)
    this.assertiveContainer = document.createElement('div');
    this.assertiveContainer.setAttribute('role', 'alert');
    this.assertiveContainer.setAttribute('aria-live', 'assertive');
    this.assertiveContainer.setAttribute('aria-atomic', 'true');
    this.assertiveContainer.className = 'sr-only';
    this.assertiveContainer.style.cssText = this.politeContainer.style.cssText;

    document.body.appendChild(this.politeContainer);
    document.body.appendChild(this.assertiveContainer);

    this.initialized = true;
  }

  /**
   * Announce a message to screen readers
   * @param message - The message to announce
   * @param priority - 'polite' (default) or 'assertive'
   */
  announce(message: string, priority: AnnouncementPriority = 'polite'): void {
    if (!this.initialized) {
      this.initialize();
    }

    const container = priority === 'assertive'
      ? this.assertiveContainer
      : this.politeContainer;

    if (!container) return;

    // Clear and re-set to trigger announcement
    container.textContent = '';

    // Use requestAnimationFrame to ensure the clear is processed
    requestAnimationFrame(() => {
      if (container) {
        container.textContent = message;
      }
    });
  }

  /**
   * Announce game result to screen readers
   */
  announceGameResult(
    success: boolean,
    handName: string,
    score: number,
    goldGained?: number,
    xpGained?: number
  ): void {
    let message = success
      ? `Success! Your hand: ${handName}. Score: ${score}.`
      : `Action failed. Your hand: ${handName}. Score: ${score}.`;

    if (goldGained && goldGained > 0) {
      message += ` Gained ${goldGained} gold.`;
    }

    if (xpGained && xpGained > 0) {
      message += ` Gained ${xpGained} experience.`;
    }

    this.announce(message, 'assertive');
  }

  /**
   * Announce card reveal
   */
  announceCardReveal(cardName: string, index: number): void {
    this.announce(`Card ${index + 1}: ${cardName}`, 'polite');
  }

  /**
   * Announce hand name when all cards revealed
   */
  announceHandRevealed(handName: string): void {
    this.announce(`Your hand: ${handName}`, 'assertive');
  }

  /**
   * Announce suit bonus
   */
  announceSuitBonus(suitName: string, matchCount: number, multiplier: number): void {
    this.announce(
      `${matchCount} ${suitName} cards matched! ${multiplier}x bonus applied.`,
      'polite'
    );
  }

  /**
   * Clean up announcer elements
   */
  destroy(): void {
    if (this.politeContainer) {
      document.body.removeChild(this.politeContainer);
      this.politeContainer = null;
    }
    if (this.assertiveContainer) {
      document.body.removeChild(this.assertiveContainer);
      this.assertiveContainer = null;
    }
    this.initialized = false;
  }
}

// Singleton instance
export const announcer = new ScreenReaderAnnouncer();

// Initialize on module load (client-side only)
if (typeof window !== 'undefined') {
  announcer.initialize();
}

export default announcer;
