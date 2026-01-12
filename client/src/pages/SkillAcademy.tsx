/**
 * Skill Academy Page
 * Optional tutorial system teaching all 30 skills through mentor quests
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { useQuestStore } from '@/store/useQuestStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import type { Quest, QuestDefinition } from '@/services/quest.service';
import { SkillCategory } from '@desperados/shared';

// Academy mentor data
interface AcademyMentor {
  id: string;
  name: string;
  title: string;
  description: string;
  category: SkillCategory;
  icon: string;
  skills: string[];
  color: string;
}

const ACADEMY_MENTORS: AcademyMentor[] = [
  {
    id: 'iron-jack-thornwood',
    name: '"Iron" Jack Thornwood',
    title: 'Combat Master',
    description:
      'Former Confederate cavalry officer. 20 years as mercenary across Mexico. Teaches combat as survival philosophy.',
    category: SkillCategory.COMBAT,
    icon: '⚔️',
    skills: [
      'melee_combat',
      'ranged_combat',
      'defensive_tactics',
      'mounted_combat',
      'explosives',
    ],
    color: 'border-red-500',
  },
  {
    id: 'silk-viola-marchetti',
    name: '"Silk" Viola Marchetti',
    title: 'Cunning Master',
    description:
      "Born to Italian immigrants in San Francisco. Owned half the city's underworld by 25. Believes cunning is the great equalizer.",
    category: SkillCategory.CUNNING,
    icon: '🎭',
    skills: [
      'lockpicking',
      'stealth',
      'pickpocket',
      'tracking',
      'deception',
      'gambling',
      'duel_instinct',
      'sleight_of_hand',
    ],
    color: 'border-purple-500',
  },
  {
    id: 'walking-moon',
    name: 'Walking Moon',
    title: 'Spirit Master',
    description:
      'Two-spirit medicine person from scattered Plains tribe. Walks between physical and spiritual worlds.',
    category: SkillCategory.SPIRIT,
    icon: '🌙',
    skills: [
      'medicine',
      'persuasion',
      'animal_handling',
      'leadership',
      'ritual_knowledge',
      'performance',
    ],
    color: 'border-blue-500',
  },
  {
    id: 'augustus-hornsby',
    name: 'Augustus "Gus" Hornsby',
    title: 'Craft Master',
    description:
      "Self-taught genius with mechanical prosthetic hand. Believes craft is civilization's foundation.",
    category: SkillCategory.CRAFT,
    icon: '🔨',
    skills: [
      'blacksmithing',
      'leatherworking',
      'cooking',
      'alchemy',
      'engineering',
      'mining',
      'carpentry',
      'gunsmithing',
    ],
    color: 'border-amber-500',
  },
];

// Skill name mapping for display
const SKILL_DISPLAY_NAMES: Record<string, string> = {
  melee_combat: 'Melee Combat',
  ranged_combat: 'Ranged Combat',
  defensive_tactics: 'Defensive Tactics',
  mounted_combat: 'Mounted Combat',
  explosives: 'Explosives',
  lockpicking: 'Lockpicking',
  stealth: 'Stealth',
  pickpocket: 'Pickpocket',
  tracking: 'Tracking',
  deception: 'Deception',
  gambling: 'Gambling',
  duel_instinct: 'Duel Instinct',
  sleight_of_hand: 'Sleight of Hand',
  medicine: 'Medicine',
  persuasion: 'Persuasion',
  animal_handling: 'Animal Handling',
  leadership: 'Leadership',
  ritual_knowledge: 'Ritual Knowledge',
  performance: 'Performance',
  blacksmithing: 'Blacksmithing',
  leatherworking: 'Leatherworking',
  cooking: 'Cooking',
  alchemy: 'Alchemy',
  engineering: 'Engineering',
  mining: 'Mining',
  carpentry: 'Carpentry',
  gunsmithing: 'Gunsmithing',
};

// Level requirements for certain skills
const LEVEL_GATED_SKILLS: Record<string, number> = {
  duel_instinct: 5,
  engineering: 5,
  gunsmithing: 5,
  explosives: 10,
  ritual_knowledge: 10,
};

type AcademyTab = 'overview' | 'combat' | 'cunning' | 'spirit' | 'craft';

export const SkillAcademy: React.FC = () => {
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
  } = useQuestStore();

  const { currentCharacter } = useCharacterStore();

  const [activeTab, setActiveTab] = useState<AcademyTab>('overview');
  const [selectedQuest, setSelectedQuest] = useState<
    Quest | QuestDefinition | null
  >(null);
  const [message, setMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);

  // Fetch quests on mount
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

  // Get academy quests (filter for academy: prefix)
  const activeAcademyQuests = activeQuests.filter(
    (q) => q.questId?.startsWith('academy:')
  );

  const completedAcademyQuests = completedQuests.filter(
    (q) => q.questId?.startsWith('academy:')
  );

  // Helper to get quest name
  const getQuestName = (quest: Quest | QuestDefinition): string => {
    if ('definition' in quest && quest.definition) {
      return quest.definition.name;
    }
    return (quest as QuestDefinition).name || 'Unknown Quest';
  };

  // Helper to get quest description
  const getQuestDescription = (quest: Quest | QuestDefinition): string => {
    if ('definition' in quest && quest.definition) {
      return quest.definition.description;
    }
    return (quest as QuestDefinition).description || '';
  };

  // Helper to get quest rewards
  const getQuestRewards = (quest: Quest | QuestDefinition): any => {
    if ('definition' in quest && quest.definition) {
      return quest.definition.rewards;
    }
    return (quest as QuestDefinition).rewards;
  };

  // Check if a skill tutorial is completed
  const isSkillTutorialCompleted = (skillId: string): boolean => {
    const questId = `academy:${skillId}`;
    return completedAcademyQuests.some((q) => q.questId === questId);
  };

  // Check if a skill tutorial is in progress
  const isSkillTutorialActive = (skillId: string): boolean => {
    const questId = `academy:${skillId}`;
    return activeAcademyQuests.some((q) => q.questId === questId);
  };

  // Check if a skill tutorial is available (not started, not completed)
  const isSkillTutorialAvailable = (skillId: string): boolean => {
    if (isSkillTutorialCompleted(skillId)) return false;
    if (isSkillTutorialActive(skillId)) return false;

    // Check level requirement
    const levelReq = LEVEL_GATED_SKILLS[skillId];
    if (levelReq && (currentCharacter?.level || 1) < levelReq) return false;

    return true;
  };

  // Get quest for skill
  const getQuestForSkill = (
    skillId: string
  ): Quest | QuestDefinition | undefined => {
    const questId = `academy:${skillId}`;
    return (
      availableQuests.find((q) => q.questId === questId) ||
      activeAcademyQuests.find((q) => q.questId === questId) ||
      completedAcademyQuests.find((q) => q.questId === questId)
    );
  };

  // Calculate mentor progress
  const getMentorProgress = (mentor: AcademyMentor) => {
    const completed = mentor.skills.filter(isSkillTutorialCompleted).length;
    return {
      completed,
      total: mentor.skills.length,
      percentage: Math.round((completed / mentor.skills.length) * 100),
    };
  };

  // Calculate total progress
  const getTotalProgress = () => {
    const totalSkills = ACADEMY_MENTORS.reduce(
      (sum, m) => sum + m.skills.length,
      0
    );
    const completedSkills = ACADEMY_MENTORS.reduce(
      (sum, m) => sum + m.skills.filter(isSkillTutorialCompleted).length,
      0
    );
    return {
      completed: completedSkills,
      total: totalSkills,
      percentage: Math.round((completedSkills / totalSkills) * 100),
    };
  };

  // Handle accept quest
  const handleAcceptQuest = async (questId: string) => {
    try {
      await acceptQuest(questId);
      setMessage({ text: 'Tutorial started!', success: true });
      setTimeout(() => setMessage(null), 3000);
      setSelectedQuest(null);
      await fetchQuests();
      await fetchActiveQuests();
    } catch (err: any) {
      setMessage({
        text: err.message || 'Failed to start tutorial',
        success: false,
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'overview' as AcademyTab, label: 'Overview', icon: '🎓' },
    { id: 'combat' as AcademyTab, label: 'Combat', icon: '⚔️' },
    { id: 'cunning' as AcademyTab, label: 'Cunning', icon: '🎭' },
    { id: 'spirit' as AcademyTab, label: 'Spirit', icon: '🌙' },
    { id: 'craft' as AcademyTab, label: 'Craft', icon: '🔨' },
  ];

  // Get mentor for current tab
  const getCurrentMentor = (): AcademyMentor | undefined => {
    const categoryMap: Record<string, SkillCategory> = {
      combat: SkillCategory.COMBAT,
      cunning: SkillCategory.CUNNING,
      spirit: SkillCategory.SPIRIT,
      craft: SkillCategory.CRAFT,
    };
    const category = categoryMap[activeTab];
    return category
      ? ACADEMY_MENTORS.find((m) => m.category === category)
      : undefined;
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gold-light mb-4">
          Desperados Academy
        </h1>
        <CardGridSkeleton count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold text-red-400 mb-2">
          Failed to load Academy
        </h2>
        <p className="text-parchment-dark mb-4">{error}</p>
        <Button
          variant="secondary"
          onClick={() => {
            fetchQuests();
            fetchActiveQuests();
            fetchCompletedQuests();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  const totalProgress = getTotalProgress();
  const currentMentor = getCurrentMentor();

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gold-light flex items-center gap-2">
          🎓 Desperados Academy
        </h1>
        <p className="text-parchment-dark mt-1">
          Learn the 30 skills of survival from legendary masters
        </p>

        {/* Overall Progress */}
        <div className="mt-4 bg-wood-dark rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-parchment-light">Academy Progress</span>
            <span className="text-gold-light font-bold">
              {totalProgress.completed} / {totalProgress.total} Skills
            </span>
          </div>
          <div className="h-3 bg-wood-darker rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-500"
              style={{ width: `${totalProgress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            message.success
              ? 'bg-green-900 border border-green-500'
              : 'bg-red-900 border border-red-500'
          }`}
        >
          <p
            className={
              message.success ? 'text-green-200' : 'text-red-200'
            }
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs.map((t) => ({
          id: t.id,
          label: `${t.icon} ${t.label}`,
        }))}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as AcademyTab)}
        variant="pills"
      />

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'overview' ? (
          // Overview Tab - Show all mentors
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ACADEMY_MENTORS.map((mentor) => {
              const progress = getMentorProgress(mentor);
              return (
                <Card
                  key={mentor.id}
                  className={`${mentor.color} border-2 hover:shadow-lg transition-shadow cursor-pointer`}
                  onClick={() => {
                    setActiveTab(
                      mentor.category.toLowerCase() as AcademyTab
                    );
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{mentor.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gold-light">
                        {mentor.name}
                      </h3>
                      <p className="text-parchment-dark text-sm">
                        {mentor.title}
                      </p>
                      <p className="text-parchment-light mt-2 text-sm">
                        {mentor.description}
                      </p>

                      {/* Progress */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-parchment-dark">
                            Tutorials Completed
                          </span>
                          <span className="text-gold-light">
                            {progress.completed} / {progress.total}
                          </span>
                        </div>
                        <div className="h-2 bg-wood-darker rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold-light transition-all duration-300"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Skills preview */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {mentor.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className={`text-xs px-2 py-0.5 rounded ${
                              isSkillTutorialCompleted(skill)
                                ? 'bg-green-900 text-green-300'
                                : isSkillTutorialActive(skill)
                                  ? 'bg-blue-900 text-blue-300'
                                  : 'bg-wood-darker text-parchment-dark'
                            }`}
                          >
                            {SKILL_DISPLAY_NAMES[skill] || skill}
                          </span>
                        ))}
                        {mentor.skills.length > 4 && (
                          <span className="text-xs px-2 py-0.5 text-parchment-dark">
                            +{mentor.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : currentMentor ? (
          // Mentor Detail Tab
          <div>
            {/* Mentor Header */}
            <Card className={`${currentMentor.color} border-2 mb-6`}>
              <div className="flex items-start gap-4">
                <div className="text-6xl">{currentMentor.icon}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gold-light">
                    {currentMentor.name}
                  </h2>
                  <p className="text-parchment-dark">{currentMentor.title}</p>
                  <p className="text-parchment-light mt-2">
                    {currentMentor.description}
                  </p>
                </div>
              </div>
            </Card>

            {/* Skill Tutorials List */}
            <div className="space-y-3">
              {currentMentor.skills.map((skillId) => {
                const quest = getQuestForSkill(skillId);
                const isCompleted = isSkillTutorialCompleted(skillId);
                const isActive = isSkillTutorialActive(skillId);
                const isAvailable = isSkillTutorialAvailable(skillId);
                const levelReq = LEVEL_GATED_SKILLS[skillId];
                const isLocked =
                  levelReq && (currentCharacter?.level || 1) < levelReq;

                return (
                  <Card
                    key={skillId}
                    className={`border ${
                      isCompleted
                        ? 'border-green-500 bg-green-900/20'
                        : isActive
                          ? 'border-blue-500 bg-blue-900/20'
                          : isLocked
                            ? 'border-gray-600 opacity-60'
                            : 'border-wood-light hover:border-gold-light'
                    } transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Status Icon */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                            isCompleted
                              ? 'bg-green-800'
                              : isActive
                                ? 'bg-blue-800'
                                : isLocked
                                  ? 'bg-gray-800'
                                  : 'bg-wood-dark'
                          }`}
                        >
                          {isCompleted
                            ? '✅'
                            : isActive
                              ? '📖'
                              : isLocked
                                ? '🔒'
                                : '📚'}
                        </div>

                        {/* Skill Info */}
                        <div>
                          <h3 className="font-bold text-gold-light">
                            {SKILL_DISPLAY_NAMES[skillId] || skillId}
                          </h3>
                          <p className="text-sm text-parchment-dark">
                            {isCompleted
                              ? 'Tutorial Completed'
                              : isActive
                                ? 'In Progress'
                                : isLocked
                                  ? `Requires Level ${levelReq}`
                                  : 'Available'}
                          </p>
                          {quest && (
                            <p className="text-sm text-parchment-light mt-1">
                              {getQuestName(quest)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {isCompleted ? (
                          <span className="text-green-400 text-sm">
                            Complete
                          </span>
                        ) : isActive ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              // Navigate to quest log or show quest details
                              if (quest) setSelectedQuest(quest);
                            }}
                          >
                            View Progress
                          </Button>
                        ) : isAvailable && quest ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedQuest(quest)}
                          >
                            Start Tutorial
                          </Button>
                        ) : isLocked ? (
                          <span className="text-gray-500 text-sm">
                            Level {levelReq}+
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {/* Quest Detail Modal */}
      {selectedQuest && (
        <Modal
          isOpen={!!selectedQuest}
          onClose={() => setSelectedQuest(null)}
          title={getQuestName(selectedQuest)}
        >
          <div className="space-y-4">
            <p className="text-parchment-light">{getQuestDescription(selectedQuest)}</p>

            {/* Objectives */}
            {selectedQuest.objectives && selectedQuest.objectives.length > 0 && (
              <div>
                <h4 className="font-bold text-gold-light mb-2">Objectives</h4>
                <ul className="space-y-1">
                  {selectedQuest.objectives.map((obj: any, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-parchment-light"
                    >
                      <span
                        className={
                          obj.current >= obj.required
                            ? 'text-green-400'
                            : 'text-parchment-dark'
                        }
                      >
                        {obj.current >= obj.required ? '✅' : '⬜'}
                      </span>
                      {obj.description}
                      {obj.required > 1 && (
                        <span className="text-parchment-dark">
                          ({obj.current || 0}/{obj.required})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rewards */}
            {(() => {
              const rewards = getQuestRewards(selectedQuest);
              if (!rewards) return null;
              return (
                <div>
                  <h4 className="font-bold text-gold-light mb-2">Rewards</h4>
                  <div className="flex flex-wrap gap-2">
                    {rewards.experience && (
                      <span className="bg-wood-dark px-3 py-1 rounded text-sm">
                        {rewards.experience} XP
                      </span>
                    )}
                    {rewards.gold && (
                      <span className="bg-wood-dark px-3 py-1 rounded text-sm">
                        ${rewards.gold}
                      </span>
                    )}
                    {rewards.items?.length > 0 && (
                      <span className="bg-wood-dark px-3 py-1 rounded text-sm">
                        🎁 Unique Item
                      </span>
                    )}
                    {rewards.skillPoints && (
                      <span className="bg-wood-dark px-3 py-1 rounded text-sm">
                        {rewards.skillPoints} Skill XP
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-wood-light">
              <Button variant="secondary" onClick={() => setSelectedQuest(null)}>
                Close
              </Button>
              {!activeAcademyQuests.some(
                (q) => q.questId === selectedQuest.questId
              ) &&
                !completedAcademyQuests.some(
                  (q) => q.questId === selectedQuest.questId
                ) && (
                  <Button
                    variant="primary"
                    onClick={() =>
                      handleAcceptQuest(selectedQuest.questId || '')
                    }
                  >
                    Start Tutorial
                  </Button>
                )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SkillAcademy;
