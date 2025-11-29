/**
 * Sound Test Page
 * Developer page for testing all sound effects
 *
 * This page can be accessed at /sound-test (add to router)
 * Useful for verifying all sound files are present and working
 */

import React, { useState } from 'react';
import { useSoundEffects, type SoundEffect } from '@/hooks/useSoundEffects';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Card } from '@/components/ui';

// All sound effects organized by category
const SOUND_CATEGORIES: Record<string, SoundEffect[]> = {
  'Destiny Deck Cards': [
    'deal',
    'flip',
    'discard',
    'select',
    'reveal_weak',
    'reveal_good',
    'reveal_strong',
    'reveal_epic',
  ],
  'Game Actions': [
    'success',
    'failure',
    'gold_gained',
    'gold_spent',
    'xp_gained',
    'level_up',
    'suit_bonus',
  ],
  'Combat': [
    'combat_hit',
    'combat_miss',
    'combat_critical',
    'combat_start',
    'combat_victory',
    'combat_defeat',
    'damage_taken',
  ],
  'Notifications': [
    'notification',
    'message',
    'whisper',
    'mention',
  ],
  'UI': [
    'ui_click',
    'ui_hover',
    'button_click',
    'menu_open',
    'menu_close',
  ],
  'Other Events': [
    'quest_complete',
    'achievement',
    'item_pickup',
    'energy_restore',
  ],
};

/**
 * Sound test page component
 */
export const SoundTest: React.FC = () => {
  const { playSound, preloadSounds, isEnabled, volume } = useSoundEffects();
  const { soundEnabled, soundVolume, toggleSound, setSoundVolume } = useSettingsStore();
  const [lastPlayed, setLastPlayed] = useState<SoundEffect | null>(null);
  const [preloaded, setPreloaded] = useState(false);

  // Play a sound and track it
  const handlePlaySound = (sound: SoundEffect) => {
    playSound(sound);
    setLastPlayed(sound);
    setTimeout(() => setLastPlayed(null), 500);
  };

  // Preload all sounds
  const handlePreloadAll = () => {
    const allSounds = Object.values(SOUND_CATEGORIES).flat();
    preloadSounds(allSounds);
    setPreloaded(true);
  };

  // Play all sounds in sequence
  const handlePlayAll = () => {
    const allSounds = Object.values(SOUND_CATEGORIES).flat();
    allSounds.forEach((sound, index) => {
      setTimeout(() => {
        handlePlaySound(sound);
      }, index * 1000);
    });
  };

  // Format sound name for display
  const formatSoundName = (sound: SoundEffect): string => {
    return sound.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card variant="leather">
        <div className="p-6">
          <h1 className="text-3xl font-western text-gold-light mb-2">
            🔊 Sound Effects Test Page
          </h1>
          <p className="text-desert-sand font-serif">
            Test all sound effects to verify audio files are present and working correctly.
          </p>
        </div>
      </Card>

      {/* Controls */}
      <Card variant="parchment">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-western text-wood-dark">Controls</h2>

          {/* Sound Enabled */}
          <div className="flex items-center justify-between p-4 bg-wood-grain/10 rounded">
            <div>
              <h3 className="font-bold">Sound System</h3>
              <p className="text-sm text-wood-medium">
                Status: {soundEnabled ? '✅ Enabled' : '❌ Disabled'}
              </p>
            </div>
            <button
              onClick={toggleSound}
              className={`
                px-4 py-2 rounded font-semibold transition-colors
                ${soundEnabled
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-400 text-white hover:bg-gray-500'
                }
              `}
            >
              {soundEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>

          {/* Volume Control */}
          {soundEnabled && (
            <div className="p-4 bg-wood-grain/5 rounded space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="test-volume" className="font-semibold">
                  Volume
                </label>
                <span className="text-sm">{Math.round(soundVolume * 100)}%</span>
              </div>
              <input
                id="test-volume"
                type="range"
                min="0"
                max="100"
                value={soundVolume * 100}
                onChange={(e) => setSoundVolume(Number(e.target.value) / 100)}
                className="w-full h-2 bg-wood-medium rounded-lg appearance-none cursor-pointer accent-gold-dark"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePreloadAll}
              disabled={!soundEnabled}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {preloaded ? '✓ Preloaded' : 'Preload All Sounds'}
            </button>
            <button
              onClick={handlePlayAll}
              disabled={!soundEnabled}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Play All (1s apart)
            </button>
          </div>
        </div>
      </Card>

      {/* Sound Categories */}
      {Object.entries(SOUND_CATEGORIES).map(([category, sounds]) => (
        <Card key={category} variant="parchment">
          <div className="p-6">
            <h2 className="text-xl font-western text-wood-dark mb-4">
              {category} ({sounds.length} sounds)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {sounds.map((sound) => (
                <button
                  key={sound}
                  onClick={() => handlePlaySound(sound)}
                  disabled={!soundEnabled}
                  className={`
                    p-4 rounded text-left transition-all
                    ${lastPlayed === sound
                      ? 'bg-gold-dark text-wood-dark scale-95'
                      : 'bg-wood-grain/10 hover:bg-wood-grain/20'
                    }
                    ${!soundEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="font-bold text-sm">{formatSoundName(sound)}</div>
                  <div className="text-xs text-wood-medium mt-1 font-mono">
                    {sound}.mp3
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      ))}

      {/* Debug Info */}
      <Card variant="wood">
        <div className="p-4">
          <h3 className="text-sm font-bold text-desert-sand mb-2">Debug Info</h3>
          <div className="text-xs text-desert-stone space-y-1 font-mono">
            <div>Sound Enabled: {String(isEnabled)}</div>
            <div>Volume: {(volume * 100).toFixed(0)}%</div>
            <div>Total Sounds: {Object.values(SOUND_CATEGORIES).flat().length}</div>
            <div>Last Played: {lastPlayed || 'None'}</div>
            <div>Preloaded: {String(preloaded)}</div>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card variant="leather">
        <div className="p-6">
          <h2 className="text-xl font-western text-gold-light mb-3">
            📖 Instructions
          </h2>
          <ul className="text-desert-sand space-y-2 font-serif">
            <li>• Click any sound button to play that effect</li>
            <li>• Use "Preload All Sounds" to cache all audio files</li>
            <li>• Use "Play All" to test all sounds in sequence</li>
            <li>• Adjust volume slider to test different levels</li>
            <li>• If a sound doesn't play, the MP3 file may be missing</li>
            <li>• Check browser console for errors or warnings</li>
            <li>• Sound files should be in: <code className="bg-wood-dark px-1">client/public/sounds/</code></li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default SoundTest;
