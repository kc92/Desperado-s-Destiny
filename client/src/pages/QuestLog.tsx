/**
 * Quest Log Page
 * Track missions and objectives
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { Card, Button, Modal } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

type QuestTab = 'active' | 'available' | 'completed';
type QuestType = 'main' | 'side' | 'daily' | 'weekly' | 'event';

interface QuestObjective {
  id: string;
  description: string;
  type: string;
  target: string;
  required: number;
  current: number;
}

interface QuestReward {
  type: 'gold' | 'xp' | 'item' | 'reputation';
  amount?: number;
  itemId?: string;
}

interface QuestDefinition {
  questId: string;
  name: string;
  description: string;
  type: QuestType;
  levelRequired: number;
  objectives: Omit<QuestObjective, 'current'>[];
  rewards: QuestReward[];
  timeLimit?: number;
  repeatable: boolean;
}

interface CharacterQuest {
  _id: string;
  questId: string;
  status: string;
  objectives: QuestObjective[];
  startedAt: string;
  completedAt?: string;
  expiresAt?: string;
  definition?: QuestDefinition;
}

const QUEST_TYPE_COLORS: Record<QuestType, string> = {
  main: 'text-gold-light border-gold-light',
  side: 'text-blue-400 border-blue-400',
  daily: 'text-green-400 border-green-400',
  weekly: 'text-purple-400 border-purple-400',
  event: 'text-red-400 border-red-400'
};

const QUEST_TYPE_LABELS: Record<QuestType, string> = {
  main: 'Main Quest',
  side: 'Side Quest',
  daily: 'Daily',
  weekly: 'Weekly',
  event: 'Event'
};

export const QuestLog: React.FC = () => {
  const [activeTab, setActiveTab] = useState<QuestTab>('active');
  const [activeQuests, setActiveQuests] = useState<CharacterQuest[]>([]);
  const [availableQuests, setAvailableQuests] = useState<QuestDefinition[]>([]);
  const [completedQuests, setCompletedQuests] = useState<CharacterQuest[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<CharacterQuest | QuestDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

  const fetchQuests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [activeRes, availableRes, completedRes] = await Promise.all([
        api.get<{ data: { quests: CharacterQuest[] } }>('/quests/active'),
        api.get<{ data: { quests: QuestDefinition[] } }>('/quests/available'),
        api.get<{ data: { quests: CharacterQuest[] } }>('/quests/completed')
      ]);
      setActiveQuests(activeRes.data.data.quests);
      setAvailableQuests(availableRes.data.data.quests);
      setCompletedQuests(completedRes.data.data.quests);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch quests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const handleAcceptQuest = async (questId: string) => {
    try {
      await api.post('/quests/accept', { questId });
      setMessage({ text: 'Quest accepted!', success: true });
      setTimeout(() => setMessage(null), 3000);
      setSelectedQuest(null);
      fetchQuests();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Failed to accept quest', success: false });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAbandonQuest = async (questId: string) => {
    try {
      await api.post('/quests/abandon', { questId });
      setMessage({ text: 'Quest abandoned', success: true });
      setTimeout(() => setMessage(null), 3000);
      setSelectedQuest(null);
      fetchQuests();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Failed to abandon quest', success: false });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const renderReward = (reward: QuestReward) => {
    switch (reward.type) {
      case 'gold':
        return <span className="text-gold-light">{reward.amount} Gold</span>;
      case 'xp':
        return <span className="text-blue-400">{reward.amount} XP</span>;
      case 'item':
        return <span className="text-purple-400">Item: {reward.itemId}</span>;
      case 'reputation':
        return <span className="text-green-400">+{reward.amount} Rep</span>;
      default:
        return null;
    }
  };

  const isQuestDefinition = (quest: any): quest is QuestDefinition => {
    return 'objectives' in quest && !('status' in quest);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-western text-gold-light">Quest Log</h1>
        <p className="text-desert-stone">Track your missions and progress</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 mb-6 text-center ${
          message.success
            ? 'bg-green-900/50 border border-green-500/50'
            : 'bg-red-900/50 border border-red-500/50'
        }`}>
          <p className="text-desert-sand">{message.text}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'active', label: 'Active', count: activeQuests.length },
          { id: 'available', label: 'Available', count: availableQuests.length },
          { id: 'completed', label: 'Completed', count: completedQuests.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as QuestTab)}
            className={`px-4 py-2 rounded-lg font-serif transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gold-light text-wood-dark'
                : 'bg-wood-dark border border-wood-grain text-desert-sand hover:border-gold-light/50'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-wood-dark text-gold-light' : 'bg-wood-grain/30'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div aria-busy="true" aria-live="polite">
          <CardGridSkeleton count={3} columns={1} />
        </div>
      )}

      {/* Active Quests */}
      {!isLoading && activeTab === 'active' && (
        <div className="space-y-4">
          {activeQuests.length === 0 ? (
            <EmptyState
              icon="📜"
              title="No Bounties"
              description="You have no active missions, partner. Check the Quest Hall for available bounties!"
              actionText="View Available"
              onAction={() => setActiveTab('available')}
              size="md"
            />
          ) : (
            activeQuests.map((quest) => (
              <Card
                key={quest._id}
                variant="leather"
                className="p-4 cursor-pointer hover:border-gold-light/50 transition-colors"
                onClick={() => setSelectedQuest(quest)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-western text-lg text-gold-light">
                      {quest.definition?.name || quest.questId}
                    </h3>
                    <span className={`text-xs border px-2 py-0.5 rounded ${
                      QUEST_TYPE_COLORS[quest.definition?.type || 'side']
                    }`}>
                      {QUEST_TYPE_LABELS[quest.definition?.type || 'side']}
                    </span>
                  </div>
                  {quest.expiresAt && (
                    <span className="text-xs text-red-400">
                      Expires: {new Date(quest.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  {quest.objectives.map((obj) => {
                    const progress = Math.min((obj.current / obj.required) * 100, 100);
                    const isComplete = obj.current >= obj.required;
                    return (
                      <div key={obj.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={isComplete ? 'text-green-500' : 'text-desert-sand'}>
                            {isComplete ? '✓ ' : ''}{obj.description}
                          </span>
                          <span className="text-desert-stone">{obj.current}/{obj.required}</span>
                        </div>
                        <div className="h-2 bg-wood-dark rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${isComplete ? 'bg-green-500' : 'bg-gold-light'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Available Quests */}
      {!isLoading && activeTab === 'available' && (
        <div className="space-y-4">
          {availableQuests.length === 0 ? (
            <EmptyState
              icon="🗺️"
              title="No Bounties Posted"
              description="All bounties have been claimed. Check back at the Quest Hall later for new opportunities!"
              size="sm"
            />
          ) : (
            availableQuests.map((quest) => (
              <Card
                key={quest.questId}
                variant="wood"
                className="p-4 cursor-pointer hover:border-gold-light/50 transition-colors"
                onClick={() => setSelectedQuest(quest)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-western text-lg text-desert-sand">{quest.name}</h3>
                    <span className={`text-xs border px-2 py-0.5 rounded ${QUEST_TYPE_COLORS[quest.type]}`}>
                      {QUEST_TYPE_LABELS[quest.type]}
                    </span>
                  </div>
                  {quest.levelRequired > 1 && (
                    <span className="text-xs text-desert-stone">Lvl {quest.levelRequired}</span>
                  )}
                </div>
                <p className="text-sm text-desert-stone mb-3">{quest.description}</p>
                <div className="flex flex-wrap gap-2">
                  {quest.rewards.map((reward, i) => (
                    <span key={i} className="text-xs bg-wood-dark px-2 py-1 rounded">
                      {renderReward(reward)}
                    </span>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Completed Quests */}
      {!isLoading && activeTab === 'completed' && (
        <div className="space-y-4">
          {completedQuests.length === 0 ? (
            <EmptyState
              icon="✅"
              title="No Bounties Collected"
              description="Complete your first bounty to build your reputation in these parts!"
              size="sm"
            />
          ) : (
            completedQuests.map((quest) => (
              <Card key={quest._id} variant="wood" className="p-4 opacity-75">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-western text-desert-sand">{quest.questId}</h3>
                    <span className="text-xs text-green-500">✓ Completed</span>
                  </div>
                  {quest.completedAt && (
                    <span className="text-xs text-desert-stone">
                      {new Date(quest.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Quest Detail Modal */}
      {selectedQuest && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedQuest(null)}
          title={isQuestDefinition(selectedQuest) ? selectedQuest.name : (selectedQuest.definition?.name || selectedQuest.questId)}
        >
          <div className="space-y-4">
            {/* Type Badge */}
            <div className="text-center">
              <span className={`text-sm border px-3 py-1 rounded ${
                QUEST_TYPE_COLORS[isQuestDefinition(selectedQuest) ? selectedQuest.type : (selectedQuest.definition?.type || 'side')]
              }`}>
                {QUEST_TYPE_LABELS[isQuestDefinition(selectedQuest) ? selectedQuest.type : (selectedQuest.definition?.type || 'side')]}
              </span>
            </div>

            {/* Description */}
            <p className="text-desert-sand text-center font-serif">
              {isQuestDefinition(selectedQuest) ? selectedQuest.description : selectedQuest.definition?.description}
            </p>

            {/* Objectives */}
            <Card variant="wood" className="p-3">
              <h4 className="text-sm font-western text-desert-sand mb-2">Objectives</h4>
              <ul className="space-y-2">
                {isQuestDefinition(selectedQuest)
                  ? selectedQuest.objectives.map((obj) => (
                      <li key={obj.id} className="text-sm text-desert-sand">
                        • {obj.description} (0/{obj.required})
                      </li>
                    ))
                  : selectedQuest.objectives.map((obj) => (
                      <li key={obj.id} className={`text-sm ${obj.current >= obj.required ? 'text-green-500' : 'text-desert-sand'}`}>
                        • {obj.description} ({obj.current}/{obj.required})
                      </li>
                    ))
                }
              </ul>
            </Card>

            {/* Rewards */}
            <Card variant="wood" className="p-3">
              <h4 className="text-sm font-western text-desert-sand mb-2">Rewards</h4>
              <div className="flex flex-wrap gap-2">
                {(isQuestDefinition(selectedQuest) ? selectedQuest.rewards : selectedQuest.definition?.rewards || []).map((reward, i) => (
                  <span key={i} className="text-sm bg-wood-dark px-2 py-1 rounded">
                    {renderReward(reward)}
                  </span>
                ))}
              </div>
            </Card>

            {/* Actions */}
            <div className="pt-4 border-t border-wood-grain/30">
              {isQuestDefinition(selectedQuest) ? (
                <Button onClick={() => handleAcceptQuest(selectedQuest.questId)} fullWidth>
                  Accept Quest
                </Button>
              ) : (
                <Button
                  variant="danger"
                  onClick={() => handleAbandonQuest(selectedQuest.questId)}
                  fullWidth
                >
                  Abandon Quest
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default QuestLog;
