/**
 * Quest Log Page
 * Track missions and objectives
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { StateView } from '@/components/ui/StateView';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { useQuestStore } from '@/store/useQuestStore';
import type { Quest, QuestDefinition } from '@/services/quest.service';

type QuestTab = 'active' | 'available' | 'completed';
type QuestType = 'main' | 'side' | 'daily' | 'weekly' | 'event' | 'repeatable' | 'legendary' | 'faction';

interface QuestReward {
  experience?: number;
  gold?: number;
  reputation?: number;
  items?: {
    itemId: string;
    name: string;
    quantity: number;
  }[];
  skillPoints?: number;
  title?: string;
}

const QUEST_TYPE_COLORS: Record<QuestType, string> = {
  main: 'text-gold-light border-gold-light',
  side: 'text-blue-400 border-blue-400',
  daily: 'text-green-400 border-green-400',
  weekly: 'text-purple-400 border-purple-400',
  event: 'text-red-400 border-red-400',
  repeatable: 'text-cyan-400 border-cyan-400',
  legendary: 'text-orange-400 border-orange-400',
  faction: 'text-indigo-400 border-indigo-400'
};

const QUEST_TYPE_LABELS: Record<QuestType, string> = {
  main: 'Main Quest',
  side: 'Side Quest',
  daily: 'Daily',
  weekly: 'Weekly',
  event: 'Event',
  repeatable: 'Repeatable',
  legendary: 'Legendary',
  faction: 'Faction'
};

export const QuestLog: React.FC = () => {
  // Store state
  const {
    quests: availableQuests,
    activeQuests,
    completedQuests,
    isLoading,
    error,
    fetchQuests,
    fetchActiveQuests,
    fetchCompletedQuests,
    acceptQuest,
    abandonQuest,
  } = useQuestStore();

  // Local UI state
  const [activeTab, setActiveTab] = useState<QuestTab>('active');
  const [selectedQuest, setSelectedQuest] = useState<Quest | QuestDefinition | null>(null);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Fetch all quests on mount
  useEffect(() => {
    const loadQuests = async () => {
      await Promise.all([
        fetchQuests(),
        fetchActiveQuests(),
        fetchCompletedQuests(),
      ]);
    };
    loadQuests();
  }, [fetchQuests, fetchActiveQuests, fetchCompletedQuests]);

  const handleAcceptQuest = async (questId: string) => {
    try {
      await acceptQuest(questId);
      setMessage({ text: 'Quest accepted!', success: true });
      setTimeout(() => setMessage(null), 3000);
      setSelectedQuest(null);
      // Refresh available quests list
      await fetchQuests();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to accept quest', success: false });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAbandonQuest = async (questId: string) => {
    try {
      await abandonQuest(questId);
      setMessage({ text: 'Quest abandoned', success: true });
      setTimeout(() => setMessage(null), 3000);
      setSelectedQuest(null);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to abandon quest', success: false });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const renderRewards = (rewards: QuestReward | any[] | undefined) => {
    const rewardElements: JSX.Element[] = [];

    if (!rewards) return rewardElements;

    // Handle array format from server: [{ type: 'gold', amount: 100 }]
    if (Array.isArray(rewards)) {
      rewards.forEach((reward, idx) => {
        const type = reward.type?.toLowerCase();
        const amount = reward.amount ?? reward.value ?? 0;

        if (type === 'gold') {
          rewardElements.push(
            <span key={`gold-${idx}`} className="text-gold-light">${amount}</span>
          );
        } else if (type === 'xp' || type === 'experience') {
          rewardElements.push(
            <span key={`xp-${idx}`} className="text-blue-400">{amount} XP</span>
          );
        } else if (type === 'reputation' || type === 'rep') {
          rewardElements.push(
            <span key={`rep-${idx}`} className="text-green-400">+{amount} Rep</span>
          );
        } else if (type === 'skillpoints' || type === 'skill') {
          rewardElements.push(
            <span key={`skill-${idx}`} className="text-purple-400">{amount} Skill Points</span>
          );
        } else if (type === 'item') {
          rewardElements.push(
            <span key={`item-${idx}`} className="text-purple-400">
              {reward.name || reward.itemId} x{reward.quantity || 1}
            </span>
          );
        } else if (type === 'title') {
          rewardElements.push(
            <span key={`title-${idx}`} className="text-orange-400">Title: {reward.name || amount}</span>
          );
        }
      });
      return rewardElements;
    }

    // Handle object format: { gold: 100, experience: 50 }
    if (rewards.gold) {
      rewardElements.push(
        <span key="gold" className="text-gold-light">${rewards.gold}</span>
      );
    }
    if (rewards.experience) {
      rewardElements.push(
        <span key="xp" className="text-blue-400">{rewards.experience} XP</span>
      );
    }
    if (rewards.reputation) {
      rewardElements.push(
        <span key="rep" className="text-green-400">+{rewards.reputation} Rep</span>
      );
    }
    if (rewards.skillPoints) {
      rewardElements.push(
        <span key="skill" className="text-purple-400">{rewards.skillPoints} Skill Points</span>
      );
    }
    if (rewards.items && rewards.items.length > 0) {
      rewards.items.forEach((item, idx) => {
        rewardElements.push(
          <span key={`item-${idx}`} className="text-purple-400">
            {item.name} x{item.quantity}
          </span>
        );
      });
    }
    if (rewards.title) {
      rewardElements.push(
        <span key="title" className="text-orange-400">Title: {rewards.title}</span>
      );
    }

    return rewardElements;
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

      {/* Tabs */}
      <TabNavigation
        tabs={[
          { id: 'active', label: 'Active', count: activeQuests.length },
          { id: 'available', label: 'Available', count: availableQuests.length },
          { id: 'completed', label: 'Completed', count: completedQuests.length }
        ]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as QuestTab)}
        className="mb-6"
      />

      {/* Active Quests */}
      {activeTab === 'active' && (
        <StateView
          isLoading={isLoading}
          loadingComponent={
            <div aria-busy="true" aria-live="polite">
              <CardGridSkeleton count={3} columns={2} />
            </div>
          }
          error={error}
          onRetry={() => fetchActiveQuests()}
          isEmpty={activeQuests.length === 0}
          emptyProps={{
            icon: '📜',
            title: 'No Bounties',
            description: "You have no active missions, partner. Check the Quest Hall for available bounties!",
            actionText: 'View Available',
            onAction: () => setActiveTab('available')
          }}
          size="md"
        >
          <div className="space-y-4">
            {activeQuests.map((quest) => (
              <Card
                key={quest._id}
                variant="leather"
                className="p-4 cursor-pointer hover:border-gold-light/50 hover:bg-leather-dark/30 hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
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
            ))}
          </div>
        </StateView>
      )}

      {/* Available Quests */}
      {activeTab === 'available' && (
        <StateView
          isLoading={isLoading}
          loadingComponent={
            <div aria-busy="true" aria-live="polite">
              <CardGridSkeleton count={3} columns={2} />
            </div>
          }
          error={error}
          onRetry={() => fetchQuests()}
          isEmpty={availableQuests.length === 0}
          emptyProps={{
            icon: '🗺️',
            title: 'No Bounties Posted',
            description: 'All bounties have been claimed. Check back at the Quest Hall later for new opportunities!'
          }}
          size="sm"
        >
          <div className="space-y-4">
            {availableQuests.map((quest) => (
              <Card
                key={quest.questId}
                variant="wood"
                className="p-4 cursor-pointer hover:border-gold-light/50 hover:bg-wood-dark/30 hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
                onClick={() => setSelectedQuest(quest)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-western text-lg text-desert-sand">{quest.name}</h3>
                    <span className={`text-xs border px-2 py-0.5 rounded ${QUEST_TYPE_COLORS[quest.type]}`}>
                      {QUEST_TYPE_LABELS[quest.type]}
                    </span>
                  </div>
                  {quest.level > 1 && (
                    <span className="text-xs text-desert-stone">Lvl {quest.level}</span>
                  )}
                </div>
                <p className="text-sm text-desert-stone mb-3">{quest.description}</p>
                <div className="flex flex-wrap gap-2">
                  {renderRewards(quest.rewards).map((rewardElement, i) => (
                    <span key={i} className="text-xs bg-wood-dark px-2 py-1 rounded">
                      {rewardElement}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </StateView>
      )}

      {/* Completed Quests */}
      {activeTab === 'completed' && (
        <StateView
          isLoading={isLoading}
          loadingComponent={
            <div aria-busy="true" aria-live="polite">
              <CardGridSkeleton count={3} columns={2} />
            </div>
          }
          error={error}
          onRetry={() => fetchCompletedQuests()}
          isEmpty={completedQuests.length === 0}
          emptyProps={{
            icon: '✅',
            title: 'No Bounties Collected',
            description: 'Complete your first bounty to build your reputation in these parts!'
          }}
          size="sm"
        >
          <div className="space-y-4">
            {completedQuests.map((quest) => (
              <Card key={quest._id} variant="wood" className="p-4 opacity-75">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-western text-desert-sand">
                      {quest.definition?.name || quest.questId}
                    </h3>
                    <span className="text-xs text-green-500">✓ Completed</span>
                  </div>
                  {quest.completedAt && (
                    <span className="text-xs text-desert-stone">
                      {new Date(quest.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </StateView>
      )}

      {/* Quest Detail Modal */}
      {selectedQuest && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedQuest(null)}
          title={isQuestDefinition(selectedQuest) ? selectedQuest.name : (selectedQuest.definition?.name || selectedQuest.questId)}
          className="!z-[10000]"
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
                {renderRewards(
                  isQuestDefinition(selectedQuest)
                    ? selectedQuest.rewards
                    : selectedQuest.definition?.rewards || {}
                ).map((rewardElement, i) => (
                  <span key={i} className="text-sm bg-wood-dark px-2 py-1 rounded">
                    {rewardElement}
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
