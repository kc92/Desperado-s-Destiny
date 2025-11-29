/**
 * Chat Settings Component
 *
 * Modal for managing chat preferences and settings
 */

import { useState, useEffect } from 'react';
import type { ChatSettings as ChatSettingsType } from '@desperados/shared';

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChatSettingsType;
  onSave: (settings: Partial<ChatSettingsType>) => void;
}

export function ChatSettings({ isOpen, onClose, settings, onSave }: ChatSettingsProps) {
  const [localSettings, setLocalSettings] = useState<ChatSettingsType>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleToggle = (key: keyof ChatSettingsType) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleVolumeChange = (volume: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      notificationVolume: volume,
    }));
  };

  const handleTimestampFormatChange = (format: 'relative' | 'absolute') => {
    setLocalSettings((prev) => ({
      ...prev,
      timestampFormat: format,
    }));
  };

  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
    setLocalSettings((prev) => ({
      ...prev,
      fontSize,
    }));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setLocalSettings((prev) => ({
          ...prev,
          browserNotificationsEnabled: true,
        }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className="bg-desert-sand rounded-lg shadow-wood max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-wood-grain bg-wood-dark">
          <h2 id="settings-title" className="text-xl font-western text-western-text-light">
            Chat Settings
          </h2>
          <button
            onClick={onClose}
            className="text-western-text-light hover:text-gold-light transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Settings */}
        <div className="p-6 space-y-6">
          {/* Sound Settings */}
          <div>
            <h3 className="text-lg font-semibold text-wood-dark mb-4">Sound</h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-wood-dark">Enable sound notifications</span>
                <button
                  onClick={() => handleToggle('soundEnabled')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.soundEnabled ? 'bg-gold-medium' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={localSettings.soundEnabled}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>

              {localSettings.soundEnabled && (
                <div>
                  <label className="text-sm text-wood-dark block mb-2">
                    Notification volume: {localSettings.notificationVolume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={localSettings.notificationVolume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                    aria-label="Notification volume"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Browser Notifications */}
          <div>
            <h3 className="text-lg font-semibold text-wood-dark mb-4">Notifications</h3>

            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-wood-dark">Browser notifications</span>
                  <button
                    onClick={() => {
                      if (!localSettings.browserNotificationsEnabled) {
                        requestNotificationPermission();
                      } else {
                        handleToggle('browserNotificationsEnabled');
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.browserNotificationsEnabled ? 'bg-gold-medium' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={localSettings.browserNotificationsEnabled}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.browserNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
                {!('Notification' in window) && (
                  <p className="text-xs text-blood-crimson mt-1">
                    Browser notifications are not supported
                  </p>
                )}
                {Notification.permission === 'denied' && (
                  <p className="text-xs text-blood-crimson mt-1">
                    Notification permission denied. Enable in browser settings.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div>
            <h3 className="text-lg font-semibold text-wood-dark mb-4">Display</h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-wood-dark">Show typing indicators</span>
                <button
                  onClick={() => handleToggle('showTypingIndicators')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.showTypingIndicators ? 'bg-gold-medium' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={localSettings.showTypingIndicators}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.showTypingIndicators ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-wood-dark">Show online users</span>
                <button
                  onClick={() => handleToggle('showOnlineUsers')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.showOnlineUsers ? 'bg-gold-medium' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={localSettings.showOnlineUsers}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.showOnlineUsers ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>

              <div>
                <label className="text-sm text-wood-dark block mb-2">Timestamp format</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTimestampFormatChange('relative')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      localSettings.timestampFormat === 'relative'
                        ? 'bg-gold-medium text-wood-dark'
                        : 'bg-gray-200 text-wood-grain hover:bg-gray-300'
                    }`}
                  >
                    Relative (2m ago)
                  </button>
                  <button
                    onClick={() => handleTimestampFormatChange('absolute')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      localSettings.timestampFormat === 'absolute'
                        ? 'bg-gold-medium text-wood-dark'
                        : 'bg-gray-200 text-wood-grain hover:bg-gray-300'
                    }`}
                  >
                    Absolute (12:34 PM)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-wood-dark block mb-2">Message font size</label>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFontSizeChange(size)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors capitalize ${
                        localSettings.fontSize === size
                          ? 'bg-gold-medium text-wood-dark'
                          : 'bg-gray-200 text-wood-grain hover:bg-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content Filters */}
          <div>
            <h3 className="text-lg font-semibold text-wood-dark mb-4">Content</h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-wood-dark block">Profanity filter</span>
                  <span className="text-xs text-wood-grain">
                    Additional client-side filtering
                  </span>
                </div>
                <button
                  onClick={() => handleToggle('profanityFilterEnabled')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.profanityFilterEnabled ? 'bg-gold-medium' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={localSettings.profanityFilterEnabled}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.profanityFilterEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-wood-grain bg-desert-dust">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-wood-dark font-semibold rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gold-medium text-wood-dark font-semibold rounded-lg hover:bg-gold-light transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
