/**
 * SoundEffectManager Component
 * Global sound effect listener for game events
 *
 * This component should be placed at the app root level to listen for
 * game-wide events and play appropriate sounds.
 */

import { useEffect } from 'react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { initNotificationSounds } from '@/store/useNotificationStore';

/**
 * Global sound manager that listens for custom events
 */
export const SoundEffectManager: React.FC = () => {
  const { playSound, preloadSounds } = useSoundEffects();

  // Preload high-priority sounds on mount
  useEffect(() => {
    preloadSounds([
      'button_click',
      'gold_gained',
      'notification',
      'combat_hit',
      'success',
      'failure',
      'level_up',
    ]);
  }, [preloadSounds]);

  // Initialize notification sounds
  useEffect(() => {
    initNotificationSounds((type) => {
      playSound(type);
    });
  }, [playSound]);

  // Listen for level-up events
  useEffect(() => {
    const handleLevelUp = (event: CustomEvent) => {
      console.log('🎉 Level Up!', event.detail);
      playSound('level_up');
    };

    window.addEventListener('character-level-up', handleLevelUp as EventListener);

    return () => {
      window.removeEventListener('character-level-up', handleLevelUp as EventListener);
    };
  }, [playSound]);

  // Listen for quest completion events
  useEffect(() => {
    const handleQuestComplete = () => {
      playSound('quest_complete');
    };

    window.addEventListener('quest-completed', handleQuestComplete);

    return () => {
      window.removeEventListener('quest-completed', handleQuestComplete);
    };
  }, [playSound]);

  // Listen for achievement unlock events
  useEffect(() => {
    const handleAchievement = () => {
      playSound('achievement');
    };

    window.addEventListener('achievement-unlocked', handleAchievement);

    return () => {
      window.removeEventListener('achievement-unlocked', handleAchievement);
    };
  }, [playSound]);

  // This component doesn't render anything
  return null;
};

export default SoundEffectManager;
