/**
 * useSoundEffects Hook
 * Comprehensive sound effect system for Desperados Destiny
 * Handles all game audio feedback with Western-themed sounds
 */

import { useCallback, useRef, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

// Sound effect types for the game
export type SoundEffect =
  // Destiny Deck Card sounds
  | 'deal'          // Card being dealt from deck
  | 'flip'          // Card flipping to reveal (also used for card draws)
  | 'discard'       // Card being discarded
  | 'select'        // Card being selected/held
  | 'reveal_weak'   // Hand reveal - weak hand (Pair or less)
  | 'reveal_good'   // Hand reveal - good hand (Two Pair to Straight)
  | 'reveal_strong' // Hand reveal - strong hand (Flush to Four of a Kind)
  | 'reveal_epic'   // Hand reveal - legendary hand (Straight Flush, Royal Flush)
  // Game Action sounds
  | 'success'       // Action succeeded
  | 'failure'       // Action failed
  | 'gold_gained'   // Gold reward received (coins sound)
  | 'gold_spent'    // Gold spent (coins sound, similar to gained)
  | 'xp_gained'     // XP reward received
  | 'level_up'      // Character leveled up
  | 'suit_bonus'    // Suit bonus activated
  // Combat sounds
  | 'combat_hit'    // Successful attack hit
  | 'combat_miss'   // Attack missed
  | 'combat_critical' // Critical hit
  | 'combat_start'  // Combat initiated
  | 'combat_victory' // Combat won
  | 'combat_defeat' // Combat lost
  | 'damage_taken'  // Player takes damage
  // Notification sounds
  | 'notification'  // General notification
  | 'message'       // Chat message received
  | 'whisper'       // Private message received
  | 'mention'       // User mentioned in chat
  // UI sounds
  | 'ui_click'      // General UI click
  | 'ui_hover'      // General UI hover
  | 'button_click'  // Button click
  | 'menu_open'     // Menu/modal opened
  | 'menu_close'    // Menu/modal closed
  // Other game sounds
  | 'quest_complete' // Quest completed
  | 'achievement'   // Achievement unlocked
  | 'item_pickup'   // Item obtained
  | 'energy_restore'; // Energy restored

// Sound configuration
interface SoundConfig {
  volume: number;
  enabled: boolean;
}

// Sound file paths mapping
// These are loaded from /public/sounds/
const SOUND_PATHS: Record<SoundEffect, string> = {
  // Destiny Deck Card sounds
  deal: '/sounds/card-deal.mp3',
  flip: '/sounds/card-flip.mp3',
  discard: '/sounds/card-discard.mp3',
  select: '/sounds/card-select.mp3',
  reveal_weak: '/sounds/reveal-weak.mp3',
  reveal_good: '/sounds/reveal-good.mp3',
  reveal_strong: '/sounds/reveal-strong.mp3',
  reveal_epic: '/sounds/reveal-epic.mp3',
  // Game Action sounds
  success: '/sounds/success.mp3',
  failure: '/sounds/failure.mp3',
  gold_gained: '/sounds/coins.mp3',
  gold_spent: '/sounds/coins.mp3',
  xp_gained: '/sounds/xp.mp3',
  level_up: '/sounds/level-up.mp3',
  suit_bonus: '/sounds/suit-bonus.mp3',
  // Combat sounds
  combat_hit: '/sounds/hit.mp3',
  combat_miss: '/sounds/miss.mp3',
  combat_critical: '/sounds/critical.mp3',
  combat_start: '/sounds/combat-start.mp3',
  combat_victory: '/sounds/victory.mp3',
  combat_defeat: '/sounds/defeat.mp3',
  damage_taken: '/sounds/damage.mp3',
  // Notification sounds
  notification: '/sounds/notification.mp3',
  message: '/sounds/message.mp3',
  whisper: '/sounds/whisper.mp3',
  mention: '/sounds/mention.mp3',
  // UI sounds
  ui_click: '/sounds/ui-click.mp3',
  ui_hover: '/sounds/ui-hover.mp3',
  button_click: '/sounds/click.mp3',
  menu_open: '/sounds/menu-open.mp3',
  menu_close: '/sounds/menu-close.mp3',
  // Other game sounds
  quest_complete: '/sounds/quest-complete.mp3',
  achievement: '/sounds/achievement.mp3',
  item_pickup: '/sounds/item.mp3',
  energy_restore: '/sounds/energy.mp3',
};

// Audio cache to preload and reuse Audio elements
const audioCache = new Map<SoundEffect, HTMLAudioElement>();

// Track if audio is initialized (requires user interaction)
let audioInitialized = false;

/**
 * Hook for playing sound effects in Desperados Destiny
 *
 * Integrates with the settings store for volume and enable/disable controls
 * Supports caching and preloading for better performance
 */
export function useSoundEffects() {
  const { soundEnabled, soundVolume } = useSettingsStore();

  // Track if user has interacted with the page (required for audio)
  const hasInteractedRef = useRef(false);

  // Initialize audio on user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioInitialized) {
        audioInitialized = true;
        hasInteractedRef.current = true;
      }
    };

    // Audio must be initialized after user interaction
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  /**
   * Play a sound effect
   *
   * @param effect - The sound effect to play
   * @param volumeOverride - Optional volume override (0-1)
   */
  const playSound = useCallback((effect: SoundEffect, volumeOverride?: number) => {
    // Check if sounds are enabled
    if (!soundEnabled || !hasInteractedRef.current) {
      return;
    }

    try {
      const path = SOUND_PATHS[effect];
      if (!path) {
        // Silently ignore unknown sound effects
        return;
      }

      // Get or create cached audio element
      let audio = audioCache.get(effect);

      if (!audio) {
        // Create new audio element
        audio = new Audio(path);
        audio.preload = 'auto';
        audioCache.set(effect, audio);
      }

      // Clone the audio to allow overlapping sounds
      const soundInstance = audio.cloneNode() as HTMLAudioElement;

      // Set volume (use override if provided, otherwise use global setting)
      soundInstance.volume = volumeOverride !== undefined
        ? Math.max(0, Math.min(1, volumeOverride))
        : soundVolume;

      // Play the sound - fail completely silently
      soundInstance.play().catch(() => {
        // Silently ignore all audio errors (missing files, autoplay restrictions, etc.)
        // This ensures missing sound files never break gameplay
      });
    } catch {
      // Fail silently - don't break the game if sound fails
      // No logging to keep console clean when sounds aren't loaded
    }
  }, [soundEnabled, soundVolume]);

  /**
   * Preload specific sound effects for better performance
   */
  const preloadSounds = useCallback((effects: SoundEffect[]) => {
    effects.forEach((effect) => {
      const path = SOUND_PATHS[effect];
      if (path && !audioCache.has(effect)) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audioCache.set(effect, audio);
      }
    });
  }, []);

  /**
   * Clear the audio cache
   */
  const clearCache = useCallback(() => {
    audioCache.clear();
  }, []);

  return {
    playSound,
    preloadSounds,
    clearCache,
    isEnabled: soundEnabled,
    volume: soundVolume,
  };
}

/**
 * Helper to get appropriate reveal sound based on hand rank
 */
export function getRevealSound(handRank: number): SoundEffect {
  if (handRank >= 9) return 'reveal_epic';      // Straight Flush, Royal Flush
  if (handRank >= 6) return 'reveal_strong';    // Flush, Full House, Four of a Kind
  if (handRank >= 3) return 'reveal_good';      // Two Pair, Three of a Kind, Straight
  return 'reveal_weak';                          // High Card, Pair
}

export default useSoundEffects;
