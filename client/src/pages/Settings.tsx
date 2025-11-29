/**
 * Settings Page
 * User preferences and account management
 */

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, Button } from '@/components/ui';
import { api } from '@/services/api';

type SettingsSection = 'account' | 'notifications' | 'privacy' | 'display';

export const Settings: React.FC = () => {
  const { user, logout: _logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await api.get('/auth/preferences');
        const prefs = response.data.data.preferences;
        if (prefs) {
          if (prefs.notifications) setNotifications(prefs.notifications);
          if (prefs.privacy) setPrivacy(prefs.privacy);
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await api.put('/auth/preferences', { notifications });
      setMessage({ text: 'Notification preferences saved!', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.error || 'Failed to save preferences', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSavePrivacy = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await api.put('/auth/preferences', { privacy });
      setMessage({ text: 'Privacy settings saved!', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.error || 'Failed to save settings', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
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
          <NavItem section="notifications" icon="🔔" label="Notifications" />
          <NavItem section="privacy" icon="🔒" label="Privacy" />
          <NavItem section="display" icon="🎨" label="Display" />
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
        </main>
      </div>
    </div>
  );
};

export default Settings;
