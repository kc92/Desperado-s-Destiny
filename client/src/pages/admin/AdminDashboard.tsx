/**
 * Admin Dashboard
 * Main admin control panel for user management, economy monitoring, and system analytics
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useAdminStore } from '@/store/useAdminStore';
import { Card } from '@/components/ui';
import { UserManagement } from './UserManagement';
import { EconomyMonitor } from './EconomyMonitor';
import { ServerHealth } from './ServerHealth';

type Tab = 'overview' | 'users' | 'characters' | 'economy' | 'gangs' | 'server';

/**
 * Admin Dashboard - Main Panel
 */
export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { analytics, fetchAnalytics, isLoading } = useAdminStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/game');
      return;
    }

    // Load analytics on mount
    fetchAnalytics().catch(console.error);
  }, [isAuthenticated, user, navigate, fetchAnalytics]);

  // Redirect non-admins
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-frontier-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-western text-frontier-gold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-frontier-silver">
            System Administration & Monitoring
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </TabButton>
          <TabButton
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </TabButton>
          <TabButton
            active={activeTab === 'characters'}
            onClick={() => setActiveTab('characters')}
          >
            Characters
          </TabButton>
          <TabButton
            active={activeTab === 'economy'}
            onClick={() => setActiveTab('economy')}
          >
            Economy
          </TabButton>
          <TabButton
            active={activeTab === 'gangs'}
            onClick={() => setActiveTab('gangs')}
          >
            Gangs
          </TabButton>
          <TabButton
            active={activeTab === 'server'}
            onClick={() => setActiveTab('server')}
          >
            Server Health
          </TabButton>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab analytics={analytics} isLoading={isLoading} />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'characters' && <CharactersTab />}
          {activeTab === 'economy' && <EconomyMonitor />}
          {activeTab === 'gangs' && <GangsTab />}
          {activeTab === 'server' && <ServerHealth />}
        </div>
      </div>
    </div>
  );
};

/**
 * Tab Button Component
 */
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`
      px-6 py-3 font-western rounded-lg transition-all whitespace-nowrap
      ${active
        ? 'bg-frontier-gold text-frontier-dark shadow-lg'
        : 'bg-frontier-wood text-frontier-silver hover:bg-frontier-wood-dark'
      }
    `}
  >
    {children}
  </button>
);

/**
 * Overview Tab - System-wide statistics
 */
const OverviewTab: React.FC<{
  analytics: any;
  isLoading: boolean;
}> = ({ analytics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-frontier-wood rounded w-20 mb-4"></div>
              <div className="h-8 bg-frontier-wood rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-6">
        <p className="text-frontier-silver">Failed to load analytics data.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Users Section */}
      <div>
        <h2 className="text-2xl font-western text-frontier-gold mb-4">Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={analytics.users.total} />
          <StatCard label="Active Users" value={analytics.users.active} color="green" />
          <StatCard label="Inactive Users" value={analytics.users.inactive} color="red" />
          <StatCard label="New This Week" value={analytics.users.newThisWeek} color="blue" />
        </div>
      </div>

      {/* Characters Section */}
      <div>
        <h2 className="text-2xl font-western text-frontier-gold mb-4">Characters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Characters" value={analytics.characters.total} />
          <StatCard label="Gangs" value={analytics.gangs.total} />
        </div>
      </div>

      {/* Economy Section */}
      <div>
        <h2 className="text-2xl font-western text-frontier-gold mb-4">Economy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Gold"
            value={analytics.economy.totalGoldInCirculation.toLocaleString()}
          />
          <StatCard
            label="Avg Gold/Char"
            value={analytics.economy.averageGoldPerCharacter.toLocaleString()}
          />
          <StatCard
            label="Total Transactions"
            value={analytics.economy.totalTransactions.toLocaleString()}
          />
          <StatCard
            label="Volume (24h)"
            value={analytics.economy.transactionVolume24h.toLocaleString()}
            color="blue"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Stat Card Component
 */
const StatCard: React.FC<{
  label: string;
  value: string | number;
  color?: 'default' | 'green' | 'red' | 'blue';
}> = ({ label, value, color = 'default' }) => {
  const colors = {
    default: 'text-frontier-silver',
    green: 'text-green-400',
    red: 'text-red-400',
    blue: 'text-blue-400'
  };

  return (
    <Card className="p-6">
      <div className="text-sm text-frontier-silver mb-2">{label}</div>
      <div className={`text-3xl font-western ${colors[color]}`}>{value}</div>
    </Card>
  );
};

/**
 * Characters Tab Placeholder
 */
const CharactersTab: React.FC = () => {
  const { characters, fetchCharacters, deleteCharacter, isLoading } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCharacters().catch(console.error);
  }, []);

  const handleDelete = async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteCharacter(characterId);
    } catch (error) {
      console.error('Failed to delete character:', error);
    }
  };

  const filteredCharacters = characters.filter(char =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-western text-frontier-gold mb-4">Character Management</h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Search characters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-frontier-dark border border-frontier-wood rounded-lg text-frontier-silver mb-4"
        />

        {/* Character List */}
        {isLoading ? (
          <div className="text-frontier-silver">Loading...</div>
        ) : (
          <div className="space-y-2">
            {filteredCharacters.map((char) => (
              <div
                key={char._id}
                className="flex items-center justify-between p-4 bg-frontier-wood rounded-lg"
              >
                <div>
                  <div className="text-frontier-silver font-semibold">{char.name}</div>
                  <div className="text-sm text-frontier-silver-dark">
                    Level {char.level} • {char.faction} • {char.gold.toLocaleString()} gold
                    {char.userId?.email && ` • ${char.userId.email}`}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(char._id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

/**
 * Gangs Tab Placeholder
 */
const GangsTab: React.FC = () => {
  const { gangs, fetchGangs, disbandGang, isLoading } = useAdminStore();

  useEffect(() => {
    fetchGangs().catch(console.error);
  }, []);

  const handleDisband = async (gangId: string) => {
    if (!confirm('Are you sure you want to disband this gang? This action cannot be undone.')) {
      return;
    }

    try {
      await disbandGang(gangId);
    } catch (error) {
      console.error('Failed to disband gang:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-western text-frontier-gold mb-4">Gang Management</h2>

        {isLoading ? (
          <div className="text-frontier-silver">Loading...</div>
        ) : (
          <div className="space-y-2">
            {gangs.map((gang) => (
              <div
                key={gang._id}
                className="flex items-center justify-between p-4 bg-frontier-wood rounded-lg"
              >
                <div>
                  <div className="text-frontier-silver font-semibold">
                    {gang.name} [{gang.tag}]
                  </div>
                  <div className="text-sm text-frontier-silver-dark">
                    Bank: {gang.bankBalance.toLocaleString()} gold
                    {gang.leaderId?.name && ` • Leader: ${gang.leaderId.name}`}
                  </div>
                </div>
                <button
                  onClick={() => handleDisband(gang._id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Disband
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
