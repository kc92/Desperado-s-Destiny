/**
 * Settings Page
 * User preferences and account management
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useTutorialStore } from '@/store/useTutorialStore';
import { Card, Button, ConfirmDialog } from '@/components/ui';
import { api } from '@/services/api';
import { logger } from '@/services/logger.service';
import twoFactorService, { TwoFactorStatusResponse } from '@/services/twoFactor.service';

type SettingsSection = 'account' | 'security' | 'notifications' | 'privacy' | 'display' | 'help';

// Faction intro map for starting tutorial
const FACTION_INTRO_MAP: Record<string, string> = {
  'SETTLER_ALLIANCE': 'intro_settler',
  'NAHI_COALITION': 'intro_nahi',
  'FRONTERA': 'intro_frontera',
};

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout: _logout } = useAuthStore();
  const { currentCharacter, deleteCharacter } = useCharacterStore();
  const {
    tutorialCompleted,
    resetTutorial,
    startTutorial,
    getTotalProgress,
    completedSections,
  } = useTutorialStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Character deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingCharacter, setIsDeletingCharacter] = useState(false);

  // Ref to track message auto-hide timer for cleanup
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup message timer on unmount
  useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  // 2FA state
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatusResponse | null>(null);
  const [disablePassword, setDisablePassword] = useState('');
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    email: true,
    mailReceived: true,
    friendRequest: true,
    gangInvite: true,
    combatChallenge: true,
    warUpdates: true,
  });

  // Privacy preferences state
  const [privacy, setPrivacy] = useState({
    showOnlineStatus: true,
    allowFriendRequests: true,
    allowGangInvites: true,
    allowChallenges: true,
  });

  // Load preferences and 2FA status on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // PRODUCTION FIX: suppressErrorToast because preferences endpoint may not exist yet
        const response = await api.get('/auth/preferences', { suppressErrorToast: true } as any);
        const prefs = response.data.data.preferences;
        if (prefs) {
          if (prefs.notifications) setNotifications(prefs.notifications);
          if (prefs.privacy) setPrivacy(prefs.privacy);
        }
      } catch {
        // Silently handle - preferences endpoint not implemented yet
        logger.debug('Preferences not available', { context: 'Settings' });
      }
    };

    const load2FAStatus = async () => {
      // getStatus() now handles errors internally and returns safe default
      const status = await twoFactorService.getStatus();
      setTwoFactorStatus(status);
    };

    loadPreferences();
    load2FAStatus();
  }, []);

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setMessage(null);
    // Clear any existing timer
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }
    try {
      await api.put('/auth/preferences', { notifications });
      setMessage({ text: 'Notification preferences saved!', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.error || 'Failed to save preferences', type: 'error' });
    } finally {
      setIsSaving(false);
      messageTimerRef.current = setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSavePrivacy = async () => {
    setIsSaving(true);
    setMessage(null);
    // Clear any existing timer
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }
    try {
      await api.put('/auth/preferences', { privacy });
      setMessage({ text: 'Privacy settings saved!', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.error || 'Failed to save settings', type: 'error' });
    } finally {
      setIsSaving(false);
      messageTimerRef.current = setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      setMessage({ text: 'Please enter your password', type: 'error' });
      return;
    }

    setIsDisabling2FA(true);
    setMessage(null);
    // Clear any existing timer
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }
    try {
      await twoFactorService.disable(disablePassword);
      setTwoFactorStatus({ enabled: false, pendingSetup: false });
      setDisablePassword('');
      setMessage({ text: 'Two-factor authentication disabled', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.message || 'Failed to disable 2FA', type: 'error' });
    } finally {
      setIsDisabling2FA(false);
      messageTimerRef.current = setTimeout(() => setMessage(null), 3000);
    }
  };

  // Handle character deletion
  const handleDeleteCharacter = async () => {
    if (!currentCharacter?._id) return;

    setIsDeletingCharacter(true);
    // Clear any existing timer
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }
    try {
      await deleteCharacter(currentCharacter._id);
      setShowDeleteConfirm(false);
      setMessage({ text: `Character "${currentCharacter.name}" has been deleted`, type: 'success' });
      // Navigate to character select after deletion
      setTimeout(() => {
        navigate('/game/character-select');
      }, 1500);
    } catch (error: any) {
      setMessage({ text: error.message || 'Failed to delete character', type: 'error' });
      messageTimerRef.current = setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsDeletingCharacter(false);
    }
  };

  const NavItem: React.FC<{ section: SettingsSection; icon: string; label: string }> = ({
    section,
    icon,
    label,
  }) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
        activeSection === section
          ? 'bg-gold-light/20 text-gold-light'
          : 'text-desert-sand hover:bg-wood-dark/50'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );

  const Toggle: React.FC<{
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }> = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b border-wood-grain/20 last:border-0">
      <div>
        <p className="text-desert-sand font-medium">{label}</p>
        {description && <p className="text-xs text-desert-stone mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-gold-light' : 'bg-wood-dark'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-western text-gold-light mb-6">Settings</h1>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-900/50 border border-green-500/50 text-green-200'
            : 'bg-red-900/50 border border-red-500/50 text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-48 flex-shrink-0 space-y-1">
          <NavItem section="account" icon="👤" label="Account" />
          <NavItem section="security" icon="🛡️" label="Security" />
          <NavItem section="notifications" icon="🔔" label="Notifications" />
          <NavItem section="privacy" icon="🔒" label="Privacy" />
          <NavItem section="display" icon="🎨" label="Display" />
          <NavItem section="help" icon="❓" label="Help & Tutorial" />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Account Settings */}
          {activeSection === 'account' && (
            <Card variant="leather" className="p-6">
              <h2 className="text-xl font-western text-gold-light mb-6">
                Account Information
              </h2>

              <div className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm text-desert-stone mb-2">Email</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="flex-1 bg-wood-dark/50 border border-wood-grain rounded px-3 py-2 text-desert-sand"
                    />
                    <Button size="sm" variant="secondary" disabled>
                      Change
                    </Button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-desert-stone mb-2">Password</label>
                  <Button variant="secondary" disabled>
                    Change Password
                  </Button>
                  <p className="text-xs text-desert-stone mt-2">
                    Password change coming soon
                  </p>
                </div>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-wood-grain/30">
                  <h3 className="text-lg font-western text-red-500 mb-4">Danger Zone</h3>

                  {/* Delete Character */}
                  {currentCharacter && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <p className="text-sm text-desert-sand mb-2">
                        <strong>Delete Character:</strong> {currentCharacter.name}
                      </p>
                      <p className="text-sm text-desert-stone mb-4">
                        This will permanently delete your character. All progress, items, and stats will be lost.
                        This action cannot be undone.
                      </p>
                      <Button
                        variant="danger"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete Character
                      </Button>
                    </div>
                  )}

                  {/* Delete Account */}
                  <p className="text-sm text-desert-stone mb-4">
                    Once you delete your account, there is no going back.
                    All characters and progress will be permanently lost.
                  </p>
                  <Button variant="danger" disabled>
                    Delete Account
                  </Button>
                  <p className="text-xs text-desert-stone mt-2">
                    Account deletion coming soon
                  </p>
                </div>

                {/* Character Deletion Confirmation Dialog */}
                <ConfirmDialog
                  isOpen={showDeleteConfirm}
                  title="Delete Character?"
                  message={`Are you sure you want to permanently delete "${currentCharacter?.name}"? This will remove all progress, items, inventory, skills, and currency. This action CANNOT be undone.`}
                  confirmText="Delete Forever"
                  cancelText="Cancel"
                  confirmVariant="danger"
                  onConfirm={handleDeleteCharacter}
                  onCancel={() => setShowDeleteConfirm(false)}
                  isLoading={isDeletingCharacter}
                  icon="💀"
                />
              </div>
            </Card>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <Card variant="leather" className="p-6">
              <h2 className="text-xl font-western text-gold-light mb-6">
                Security Settings
              </h2>

              {/* Two-Factor Authentication */}
              <div className="mb-8">
                <h3 className="text-lg font-western text-desert-sand mb-4">
                  Two-Factor Authentication
                </h3>

                {twoFactorStatus === null ? (
                  <div className="animate-pulse bg-wood-dark/30 h-20 rounded" />
                ) : twoFactorStatus?.enabled ? (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-green-400">2FA is enabled</span>
                    </div>
                    <p className="text-sm text-desert-stone mb-4">
                      Your account is protected with two-factor authentication.
                      To disable it, enter your password below.
                    </p>
                    <div className="flex gap-3">
                      <input
                        type="password"
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        placeholder="Enter password to disable"
                        className="flex-1 bg-wood-dark/50 border border-wood-grain rounded px-3 py-2 text-desert-sand"
                      />
                      <Button
                        variant="danger"
                        onClick={handleDisable2FA}
                        disabled={!disablePassword || isDisabling2FA}
                        isLoading={isDisabling2FA}
                      >
                        Disable 2FA
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-yellow-400">2FA is not enabled</span>
                    </div>
                    <p className="text-sm text-desert-stone mb-4">
                      Add an extra layer of security to your account by enabling
                      two-factor authentication with an authenticator app.
                    </p>
                    <Button onClick={() => navigate('/game/settings/2fa-setup')}>
                      Enable Two-Factor Authentication
                    </Button>
                  </div>
                )}
              </div>

              {/* Active Sessions - Future Feature */}
              <div className="pt-6 border-t border-wood-grain/30">
                <h3 className="text-lg font-western text-desert-sand mb-4">
                  Active Sessions
                </h3>
                <p className="text-sm text-desert-stone">
                  View and manage your active login sessions.
                </p>
                <p className="text-xs text-desert-stone mt-2 italic">
                  Coming soon
                </p>
              </div>
            </Card>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <Card variant="leather" className="p-6">
              <h2 className="text-xl font-western text-gold-light mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-1">
                <Toggle
                  label="Email Notifications"
                  description="Receive important updates via email"
                  checked={notifications.email}
                  onChange={(v) => setNotifications({ ...notifications, email: v })}
                />
                <Toggle
                  label="New Mail"
                  description="Notify when you receive in-game mail"
                  checked={notifications.mailReceived}
                  onChange={(v) => setNotifications({ ...notifications, mailReceived: v })}
                />
                <Toggle
                  label="Friend Requests"
                  description="Notify when someone sends a friend request"
                  checked={notifications.friendRequest}
                  onChange={(v) => setNotifications({ ...notifications, friendRequest: v })}
                />
                <Toggle
                  label="Gang Invitations"
                  description="Notify when invited to join a gang"
                  checked={notifications.gangInvite}
                  onChange={(v) => setNotifications({ ...notifications, gangInvite: v })}
                />
                <Toggle
                  label="Combat Challenges"
                  description="Notify when challenged to a duel"
                  checked={notifications.combatChallenge}
                  onChange={(v) => setNotifications({ ...notifications, combatChallenge: v })}
                />
                <Toggle
                  label="Gang War Updates"
                  description="Notify on war progress and results"
                  checked={notifications.warUpdates}
                  onChange={(v) => setNotifications({ ...notifications, warUpdates: v })}
                />
              </div>

              <div className="mt-6">
                <Button onClick={handleSaveNotifications} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </Card>
          )}

          {/* Privacy Settings */}
          {activeSection === 'privacy' && (
            <Card variant="leather" className="p-6">
              <h2 className="text-xl font-western text-gold-light mb-6">
                Privacy Settings
              </h2>

              <div className="space-y-1">
                <Toggle
                  label="Show Online Status"
                  description="Let others see when you're online"
                  checked={privacy.showOnlineStatus}
                  onChange={(v) => setPrivacy({ ...privacy, showOnlineStatus: v })}
                />
                <Toggle
                  label="Allow Friend Requests"
                  description="Receive friend requests from other players"
                  checked={privacy.allowFriendRequests}
                  onChange={(v) => setPrivacy({ ...privacy, allowFriendRequests: v })}
                />
                <Toggle
                  label="Allow Gang Invitations"
                  description="Receive gang invitations"
                  checked={privacy.allowGangInvites}
                  onChange={(v) => setPrivacy({ ...privacy, allowGangInvites: v })}
                />
                <Toggle
                  label="Allow Combat Challenges"
                  description="Allow other players to challenge you"
                  checked={privacy.allowChallenges}
                  onChange={(v) => setPrivacy({ ...privacy, allowChallenges: v })}
                />
              </div>

              <div className="mt-6">
                <Button onClick={handleSavePrivacy} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </Card>
          )}

          {/* Display Settings */}
          {activeSection === 'display' && (
            <Card variant="leather" className="p-6">
              <h2 className="text-xl font-western text-gold-light mb-6">
                Display Settings
              </h2>

              <div className="space-y-6">
                {/* Theme */}
                <div>
                  <label className="block text-sm text-desert-stone mb-2">Theme</label>
                  <select
                    className="bg-wood-dark border border-wood-grain rounded px-3 py-2 text-desert-sand w-full"
                    defaultValue="dark"
                  >
                    <option value="dark">Dark (Default)</option>
                    <option value="light" disabled>Light (Coming Soon)</option>
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm text-desert-stone mb-2">Font Size</label>
                  <select
                    className="bg-wood-dark border border-wood-grain rounded px-3 py-2 text-desert-sand w-full"
                    defaultValue="medium"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium (Default)</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <p className="text-xs text-desert-stone">
                  Additional display options coming soon
                </p>
              </div>
            </Card>
          )}

          {/* Help & Tutorial Settings */}
          {activeSection === 'help' && (
            <Card variant="leather" className="p-6">
              <h2 className="text-xl font-western text-gold-light mb-6">
                Help & Tutorial
              </h2>

              <div className="space-y-6">
                {/* Tutorial Section */}
                <div>
                  <h3 className="text-lg font-western text-desert-sand mb-4">
                    Tutorial
                  </h3>

                  <div className="bg-wood-dark/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      {tutorialCompleted ? (
                        <>
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-green-400">Tutorial Completed</span>
                        </>
                      ) : completedSections.length > 0 ? (
                        <>
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span className="text-yellow-400">Tutorial In Progress ({getTotalProgress()}%)</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 rounded-full bg-gray-500" />
                          <span className="text-desert-stone">Tutorial Not Started</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-desert-stone">
                      Learn the basics of the frontier with Hawk, your mentor.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="primary"
                      onClick={() => {
                        resetTutorial();
                        const factionId = currentCharacter?.faction || 'SETTLER_ALLIANCE';
                        const section = FACTION_INTRO_MAP[factionId] || 'intro_settler';
                        startTutorial(section, 'core', factionId);
                        navigate('/game/dashboard');
                      }}
                    >
                      {tutorialCompleted ? 'Replay Tutorial' : 'Start Tutorial'}
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => navigate('/game/tutorial')}
                    >
                      View Tutorial Page
                    </Button>
                  </div>
                </div>

                {/* Help Links */}
                <div className="pt-6 border-t border-wood-grain/30">
                  <h3 className="text-lg font-western text-desert-sand mb-4">
                    Help Resources
                  </h3>

                  <div className="space-y-3">
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => navigate('/game/help')}
                      className="justify-start"
                    >
                      <span className="mr-3">📖</span>
                      Game Guide
                    </Button>

                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => navigate('/game/deck-guide')}
                      className="justify-start"
                    >
                      <span className="mr-3">🃏</span>
                      Destiny Deck Guide
                    </Button>
                  </div>
                </div>

                {/* Keyboard Shortcuts - Future */}
                <div className="pt-6 border-t border-wood-grain/30">
                  <h3 className="text-lg font-western text-desert-sand mb-4">
                    Keyboard Shortcuts
                  </h3>
                  <p className="text-sm text-desert-stone italic">
                    Coming soon
                  </p>
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
