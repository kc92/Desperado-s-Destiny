/**
 * Achievements Page
 * View and track achievement progress
 */

import React, { useEffect, useState } from 'react';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import { api } from '@/services/api';

type AchievementCategory = 'combat' | 'crime' | 'social' | 'economy' | 'exploration' | 'special';

interface Achievement {
  _id: string;
  achievementType: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: 'bronze' | 'silver' | 'gold' | 'legendary';
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: string;
  reward: {
    gold?: number;
    experience?: number;
    item?: string;
  };
}

interface AchievementData {
  achievements: Record<AchievementCategory, Achievement[]>;
  stats: {
    completed: number;
    total: number;
    percentage: number;
  };
  recentlyCompleted: Achievement[];
}

export const Achievements: React.FC = () => {
  const [data, setData] = useState<AchievementData | null>(null);
  const [activeCategory, setActiveCategory] = useState<AchievementCategory>('combat');
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const response = await api.get('/achievements');
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const claimReward = async (achievementId: string) => {
    setClaimingId(achievementId);
    try {
      await api.post(`/achievements/${achievementId}/claim`);
      // Reload to update data
      loadAchievements();
    } catch (error) {
      console.error('Failed to claim reward:', error);
    } finally {
      setClaimingId(null);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600';
      case 'silver': return 'text-gray-400';
      case 'gold': return 'text-yellow-400';
      case 'legendary': return 'text-purple-400';
      default: return 'text-desert-sand';
    }
  };

  const getTierBg = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-900/20 border-amber-600/30';
      case 'silver': return 'bg-gray-700/20 border-gray-500/30';
      case 'gold': return 'bg-yellow-900/20 border-yellow-500/30';
      case 'legendary': return 'bg-purple-900/20 border-purple-500/30';
      default: return 'bg-wood-dark/20 border-wood-grain/30';
    }
  };

  const getCategoryIcon = (category: AchievementCategory) => {
    switch (category) {
      case 'combat': return '⚔️';
      case 'crime': return '🎭';
      case 'social': return '👥';
      case 'economy': return '💰';
      case 'exploration': return '🗺️';
      case 'special': return '⭐';
    }
  };

  const categories: { id: AchievementCategory; label: string }[] = [
    { id: 'combat', label: 'Combat' },
    { id: 'crime', label: 'Crime' },
    { id: 'social', label: 'Social' },
    { id: 'economy', label: 'Economy' },
    { id: 'exploration', label: 'Exploration' },
    { id: 'special', label: 'Special' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) {
    return (
      <Card variant="leather" className="p-6 text-center">
        <p className="text-desert-sand">Failed to load achievements</p>
        <Button onClick={loadAchievements} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header with Stats */}
      <Card variant="leather">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-western text-gold-light">
                Achievements
              </h1>
              <p className="text-desert-sand font-serif mt-1">
                Track your progress and earn rewards
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gold-light">
                {data.stats.completed}/{data.stats.total}
              </div>
              <div className="text-sm text-desert-stone">
                {data.stats.percentage}% Complete
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-3 bg-wood-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-500"
              style={{ width: `${data.stats.percentage}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Recently Completed */}
      {data.recentlyCompleted.length > 0 && (
        <Card variant="parchment">
          <div className="p-4">
            <h3 className="text-lg font-western text-wood-dark mb-3">
              Recently Completed
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {data.recentlyCompleted.map(achievement => (
                <div
                  key={achievement._id}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg border ${getTierBg(achievement.tier)}`}
                >
                  <div className={`font-bold ${getTierColor(achievement.tier)}`}>
                    {achievement.title}
                  </div>
                  <div className="text-xs text-wood-grain">
                    {new Date(achievement.completedAt!).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              px-4 py-2 rounded font-serif transition-all
              ${activeCategory === cat.id
                ? 'bg-gold-light text-wood-dark'
                : 'bg-wood-dark/50 text-desert-sand hover:bg-wood-dark/70'
              }
            `}
          >
            {getCategoryIcon(cat.id)} {cat.label}
            <span className="ml-2 text-xs">
              ({data.achievements[cat.id]?.filter(a => a.completed).length || 0}/
              {data.achievements[cat.id]?.length || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Achievement List */}
      <Card variant="parchment">
        <div className="p-6 space-y-4">
          {data.achievements[activeCategory]?.length === 0 ? (
            <p className="text-center text-wood-grain py-8">
              No achievements in this category yet
            </p>
          ) : (
            data.achievements[activeCategory]?.map(achievement => (
              <div
                key={achievement._id}
                className={`
                  p-4 rounded-lg border transition-all
                  ${achievement.completed
                    ? getTierBg(achievement.tier)
                    : 'bg-wood-grain/5 border-wood-grain/20'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${achievement.completed ? getTierColor(achievement.tier) : 'text-wood-dark'}`}>
                        {achievement.title}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded capitalize ${getTierBg(achievement.tier)} ${getTierColor(achievement.tier)}`}>
                        {achievement.tier}
                      </span>
                      {achievement.completed && (
                        <span className="text-green-500 text-sm">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-wood-grain mt-1">
                      {achievement.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-wood-grain mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.target}</span>
                      </div>
                      <div className="h-2 bg-wood-grain/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            achievement.completed
                              ? 'bg-green-500'
                              : 'bg-gold-light'
                          }`}
                          style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="ml-4 text-right">
                    <div className="text-xs text-wood-grain mb-1">Rewards</div>
                    {achievement.reward.gold && (
                      <div className="text-gold-light text-sm">
                        +{achievement.reward.gold} gold
                      </div>
                    )}
                    {achievement.reward.experience && (
                      <div className="text-blue-400 text-sm">
                        +{achievement.reward.experience} XP
                      </div>
                    )}
                    {achievement.completed && (
                      <Button
                        size="sm"
                        variant="primary"
                        className="mt-2"
                        onClick={() => claimReward(achievement._id)}
                        disabled={claimingId === achievement._id}
                      >
                        {claimingId === achievement._id ? 'Claiming...' : 'Claim'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default Achievements;
