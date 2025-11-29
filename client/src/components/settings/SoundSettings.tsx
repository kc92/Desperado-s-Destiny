/**
 * SoundSettings Component
 * UI controls for sound and music settings
 */

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Card } from '@/components/ui';
import { useSoundEffects } from '@/hooks/useSoundEffects';

/**
 * Sound settings panel for user preferences
 */
export const SoundSettings: React.FC = () => {
  const {
    soundEnabled,
    soundVolume,
    musicEnabled,
    musicVolume,
    notificationSoundsEnabled,
    toggleSound,
    setSoundVolume,
    toggleMusic,
    setMusicVolume,
    toggleNotificationSounds,
  } = useSettingsStore();

  const { playSound } = useSoundEffects();

  // Play test sound when volume changes
  const handleVolumeChange = (newVolume: number) => {
    setSoundVolume(newVolume);
    // Play test sound at new volume
    if (soundEnabled) {
      setTimeout(() => playSound('button_click'), 100);
    }
  };

  // Test notification sound
  const testNotificationSound = () => {
    playSound('notification');
  };

  // Test combat sound
  const testCombatSound = () => {
    playSound('combat_hit');
  };

  // Test gold sound
  const testGoldSound = () => {
    playSound('gold_gained');
  };

  return (
    <div className="space-y-6">
      <Card variant="parchment">
        <div className="p-6">
          <h2 className="text-2xl font-western text-wood-dark mb-4">
            🔊 Sound Settings
          </h2>

          {/* Sound Effects */}
          <div className="space-y-4">
            {/* Enable/Disable Sound */}
            <div className="flex items-center justify-between p-4 bg-wood-grain/10 rounded">
              <div>
                <h3 className="font-bold text-wood-dark">Sound Effects</h3>
                <p className="text-sm text-wood-medium">
                  Play sounds for game actions, combat, and UI interactions
                </p>
              </div>
              <button
                onClick={toggleSound}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${soundEnabled ? 'bg-green-600' : 'bg-gray-400'}
                `}
                role="switch"
                aria-checked={soundEnabled}
                aria-label="Toggle sound effects"
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Sound Volume */}
            {soundEnabled && (
              <div className="p-4 bg-wood-grain/5 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="sound-volume" className="font-semibold text-wood-dark">
                    Volume
                  </label>
                  <span className="text-sm text-wood-medium">
                    {Math.round(soundVolume * 100)}%
                  </span>
                </div>
                <input
                  id="sound-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={soundVolume * 100}
                  onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
                  className="w-full h-2 bg-wood-medium rounded-lg appearance-none cursor-pointer accent-gold-dark"
                  aria-label="Sound volume"
                />

                {/* Test Sounds */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={testNotificationSound}
                    className="px-3 py-1 text-xs bg-wood-dark text-desert-sand rounded hover:bg-wood-dark/80 transition-colors"
                  >
                    Test Notification
                  </button>
                  <button
                    onClick={testCombatSound}
                    className="px-3 py-1 text-xs bg-blood-red text-desert-sand rounded hover:bg-blood-red/80 transition-colors"
                  >
                    Test Combat
                  </button>
                  <button
                    onClick={testGoldSound}
                    className="px-3 py-1 text-xs bg-gold-dark text-wood-dark rounded hover:bg-gold-dark/80 transition-colors"
                  >
                    Test Gold
                  </button>
                </div>
              </div>
            )}

            {/* Notification Sounds */}
            <div className="flex items-center justify-between p-4 bg-wood-grain/10 rounded">
              <div>
                <h3 className="font-bold text-wood-dark">Notification Sounds</h3>
                <p className="text-sm text-wood-medium">
                  Play sounds for chat messages and game notifications
                </p>
              </div>
              <button
                onClick={toggleNotificationSounds}
                disabled={!soundEnabled}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${notificationSoundsEnabled && soundEnabled ? 'bg-green-600' : 'bg-gray-400'}
                  ${!soundEnabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                role="switch"
                aria-checked={notificationSoundsEnabled && soundEnabled}
                aria-label="Toggle notification sounds"
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${notificationSoundsEnabled && soundEnabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="parchment">
        <div className="p-6">
          <h2 className="text-2xl font-western text-wood-dark mb-4">
            🎵 Music Settings
          </h2>

          {/* Background Music */}
          <div className="space-y-4">
            {/* Enable/Disable Music */}
            <div className="flex items-center justify-between p-4 bg-wood-grain/10 rounded">
              <div>
                <h3 className="font-bold text-wood-dark">Background Music</h3>
                <p className="text-sm text-wood-medium">
                  Play ambient Western music while exploring
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Coming soon - music tracks not yet implemented
                </p>
              </div>
              <button
                onClick={toggleMusic}
                disabled
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-400 opacity-50 cursor-not-allowed"
                role="switch"
                aria-checked={musicEnabled}
                aria-label="Toggle background music (coming soon)"
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${musicEnabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Music Volume */}
            {musicEnabled && (
              <div className="p-4 bg-wood-grain/5 rounded space-y-2 opacity-50">
                <div className="flex items-center justify-between">
                  <label htmlFor="music-volume" className="font-semibold text-wood-dark">
                    Music Volume
                  </label>
                  <span className="text-sm text-wood-medium">
                    {Math.round(musicVolume * 100)}%
                  </span>
                </div>
                <input
                  id="music-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume * 100}
                  onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
                  disabled
                  className="w-full h-2 bg-wood-medium rounded-lg appearance-none cursor-not-allowed"
                  aria-label="Music volume"
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card variant="wood">
        <div className="p-4">
          <h3 className="text-sm font-bold text-desert-sand mb-2">
            ℹ️ About Sounds
          </h3>
          <p className="text-xs text-desert-stone">
            Sound effects enhance the Wild West experience with audio feedback for your actions.
            All sounds are optional and can be adjusted or disabled at any time. Settings are saved
            automatically to your browser.
          </p>
          <p className="text-xs text-orange-400 mt-2">
            Note: Some sound files may not be available yet. The game works perfectly without audio.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SoundSettings;
