/**
 * useMentors Hook
 * Handles mentor system API operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

/** Mentor specialization categories */
export type MentorSpecialization =
  | 'combat'
  | 'marksmanship'
  | 'stealth'
  | 'survival'
  | 'trading'
  | 'crafting'
  | 'leadership'
  | 'diplomacy'
  | 'gambling'
  | 'medicine'
  | 'tracking'
  | 'horsemanship';

/** Mentor availability status */
export type MentorAvailability = 'available' | 'busy' | 'traveling' | 'unavailable';

/** Training session type */
export type TrainingType = 'basic' | 'advanced' | 'master' | 'special';

/** Ability unlock status */
export type AbilityStatus = 'locked' | 'available' | 'unlocked' | 'mastered';

/** Mentor ability that can be unlocked */
export interface MentorAbility {
  id: string;
  name: string;
  description: string;
  tier: number;
  type: 'passive' | 'active' | 'ultimate';
  status: AbilityStatus;
  requirements: {
    trainingLevel: number;
    skillLevel?: number;
    gold?: number;
    reputation?: number;
  };
  effects: {
    stat?: string;
    value?: number;
    duration?: number;
    cooldown?: number;
  };
  iconEmoji: string;
}

/** Mentor training session */
export interface TrainingSession {
  id: string;
  mentorId: string;
  type: TrainingType;
  duration: number; // in minutes
  cost: number;
  energyCost: number;
  rewards: {
    xp: number;
    skillXp: Record<string, number>;
    abilityProgress?: number;
  };
  completed: boolean;
  startedAt?: Date;
  completesAt?: Date;
}

/** Full mentor data */
export interface Mentor {
  id: string;
  name: string;
  title: string;
  description: string;
  specialization: MentorSpecialization;
  availability: MentorAvailability;
  location: string;
  locationName: string;
  portrait: string;
  iconEmoji: string;
  backstory: string;
  personality: string;
  teachingStyle: string;
  faction?: string;

  // Requirements to train
  requirements: {
    level: number;
    reputation?: number;
    gold?: number;
    skills?: Record<string, number>;
    quests?: string[];
  };

  // Training benefits
  trainingBenefits: {
    primarySkill: string;
    secondarySkills: string[];
    bonuses: string[];
  };

  // Abilities taught by this mentor
  abilities: MentorAbility[];

  // Dialogue
  dialogue: {
    greeting: string[];
    training: string[];
    farewell: string[];
    tips: string[];
  };

  // Costs
  trainingCosts: {
    basic: number;
    advanced: number;
    master: number;
    special: number;
  };
}

/** Player's relationship with a mentor */
export interface MentorRelationship {
  mentorId: string;
  mentorName: string;
  trainingLevel: number;
  totalTrainingSessions: number;
  totalXpGained: number;
  unlockedAbilities: string[];
  currentAbilityProgress: number;
  nextAbilityId?: string;
  favorPoints: number;
  lastTrainingDate?: Date;
  isCurrentMentor: boolean;
}

/** Current active mentorship */
export interface ActiveMentorship {
  mentor: Mentor;
  relationship: MentorRelationship;
  activeSession?: TrainingSession;
  availableSessions: TrainingSession[];
}

/** Mentorship statistics */
export interface MentorshipStats {
  totalMentors: number;
  mentorsUnlocked: number;
  totalTrainingSessions: number;
  totalAbilitiesUnlocked: number;
  favoriteSpecialization: MentorSpecialization;
  highestTrainingLevel: number;
  currentMentor?: string;
}

/** Result of training request */
export interface TrainingResult {
  success: boolean;
  message: string;
  session?: TrainingSession;
  rewards?: {
    xp: number;
    skillXp: Record<string, number>;
    abilityUnlocked?: string;
  };
  newTrainingLevel?: number;
  error?: string;
}

/** Result of ability use */
export interface AbilityUseResult {
  success: boolean;
  message: string;
  effects?: {
    stat: string;
    change: number;
    duration?: number;
  }[];
  cooldownUntil?: Date;
}

interface UseMentorsReturn {
  // State
  mentors: Mentor[];
  availableMentors: Mentor[];
  currentMentor: ActiveMentorship | null;
  relationships: MentorRelationship[];
  unlockedAbilities: MentorAbility[];
  stats: MentorshipStats | null;
  selectedMentor: Mentor | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllMentors: () => Promise<void>;
  fetchAvailableMentors: () => Promise<void>;
  fetchMentorDetails: (mentorId: string) => Promise<void>;
  fetchCurrentMentor: () => Promise<void>;
  fetchRelationships: () => Promise<void>;
  fetchUnlockedAbilities: () => Promise<void>;
  fetchStats: () => Promise<void>;
  requestMentorship: (mentorId: string) => Promise<TrainingResult>;
  startTraining: (mentorId: string, type: TrainingType) => Promise<TrainingResult>;
  leaveMentor: () => Promise<{ success: boolean; message: string }>;
  useAbility: (abilityId: string) => Promise<AbilityUseResult>;
  clearSelectedMentor: () => void;
  clearError: () => void;
}

export const useMentors = (): UseMentorsReturn => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [availableMentors, setAvailableMentors] = useState<Mentor[]>([]);
  const [currentMentor, setCurrentMentor] = useState<ActiveMentorship | null>(null);
  const [relationships, setRelationships] = useState<MentorRelationship[]>([]);
  const [unlockedAbilities, setUnlockedAbilities] = useState<MentorAbility[]>([]);
  const [stats, setStats] = useState<MentorshipStats | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  const fetchAllMentors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { mentors: Mentor[] } }>('/mentors');
      setMentors(response.data.data.mentors || []);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch mentors';
      setError(message);
      // Set default mentors for fallback
      setMentors(getDefaultMentors());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAvailableMentors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { mentors: Mentor[] } }>('/mentors/available');
      setAvailableMentors(response.data.data.mentors || []);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch available mentors';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMentorDetails = useCallback(async (mentorId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { mentor: Mentor } }>(`/mentors/${mentorId}`);
      setSelectedMentor(response.data.data.mentor);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch mentor details';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentMentor = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: ActiveMentorship | null }>('/mentors/current');
      setCurrentMentor(response.data.data);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch current mentor';
      setError(message);
      setCurrentMentor(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRelationships = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { relationships: MentorRelationship[] } }>('/mentors/relationships');
      setRelationships(response.data.data.relationships || []);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch relationships';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUnlockedAbilities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { abilities: MentorAbility[] } }>('/mentors/abilities');
      setUnlockedAbilities(response.data.data.abilities || []);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch abilities';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: MentorshipStats }>('/mentors/stats');
      setStats(response.data.data);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch stats';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestMentorship = useCallback(async (mentorId: string): Promise<TrainingResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: TrainingResult }>(`/mentors/${mentorId}/request`);
      await refreshCharacter();
      await fetchCurrentMentor();
      await fetchAvailableMentors();
      return response.data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to request mentorship';
      setError(message);
      return { success: false, message, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter, fetchCurrentMentor, fetchAvailableMentors]);

  const startTraining = useCallback(async (mentorId: string, type: TrainingType): Promise<TrainingResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: TrainingResult }>(`/mentors/${mentorId}/train`, { type });
      await refreshCharacter();
      await fetchCurrentMentor();
      return response.data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to start training';
      setError(message);
      return { success: false, message, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter, fetchCurrentMentor]);

  const leaveMentor = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: { success: boolean; message: string } }>('/mentors/leave');
      setCurrentMentor(null);
      await fetchAvailableMentors();
      return response.data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to leave mentor';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [fetchAvailableMentors]);

  const useAbility = useCallback(async (abilityId: string): Promise<AbilityUseResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: AbilityUseResult }>(`/mentors/abilities/${abilityId}/use`);
      await refreshCharacter();
      return response.data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to use ability';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter]);

  const clearSelectedMentor = useCallback(() => {
    setSelectedMentor(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    mentors,
    availableMentors,
    currentMentor,
    relationships,
    unlockedAbilities,
    stats,
    selectedMentor,
    isLoading,
    error,
    fetchAllMentors,
    fetchAvailableMentors,
    fetchMentorDetails,
    fetchCurrentMentor,
    fetchRelationships,
    fetchUnlockedAbilities,
    fetchStats,
    requestMentorship,
    startTraining,
    leaveMentor,
    useAbility,
    clearSelectedMentor,
    clearError,
  };
};

// Default mentors for fallback/demo
function getDefaultMentors(): Mentor[] {
  return [
    {
      id: 'quick-draw-mcgraw',
      name: 'Quick Draw McGraw',
      title: 'Legendary Gunslinger',
      description: 'The fastest draw in the West, retired after an undefeated career.',
      specialization: 'marksmanship',
      availability: 'available',
      location: 'saloon',
      locationName: 'Dusty Spurs Saloon',
      portrait: '/images/mentors/quickdraw.png',
      iconEmoji: '🔫',
      backstory: 'Quick Draw earned his name in a famous duel where he outdrew three opponents simultaneously.',
      personality: 'Calm and methodical, believes speed comes from patience.',
      teachingStyle: 'Repetitive drills until muscle memory takes over.',
      faction: 'Settler Alliance',
      requirements: {
        level: 5,
        reputation: 100,
        gold: 500,
      },
      trainingBenefits: {
        primarySkill: 'Marksmanship',
        secondarySkills: ['Reflexes', 'Perception'],
        bonuses: ['+10% Draw Speed', '+5% Critical Hit Chance'],
      },
      abilities: [
        {
          id: 'quick-draw',
          name: 'Quick Draw',
          description: 'Draw and fire before your opponent can react',
          tier: 1,
          type: 'active',
          status: 'available',
          requirements: { trainingLevel: 1 },
          effects: { stat: 'drawSpeed', value: 25, cooldown: 60 },
          iconEmoji: '💨',
        },
        {
          id: 'steady-aim',
          name: 'Steady Aim',
          description: 'Take your time for a guaranteed hit',
          tier: 2,
          type: 'active',
          status: 'locked',
          requirements: { trainingLevel: 3, skillLevel: 20 },
          effects: { stat: 'accuracy', value: 50, duration: 10 },
          iconEmoji: '🎯',
        },
        {
          id: 'dead-eye',
          name: 'Dead Eye',
          description: 'Time slows as you line up the perfect shot',
          tier: 3,
          type: 'ultimate',
          status: 'locked',
          requirements: { trainingLevel: 5, skillLevel: 40, gold: 1000 },
          effects: { stat: 'criticalDamage', value: 100, cooldown: 300 },
          iconEmoji: '👁️',
        },
      ],
      dialogue: {
        greeting: ['Well, well. Another young gun looking to learn.', 'Speed alone won\'t save you. Discipline will.'],
        training: ['Again. Faster.', 'Your draw is sloppy. Reset.', 'Better. Again.'],
        farewell: ['Remember: the fastest gun is the one that doesn\'t need to be drawn.'],
        tips: ['Practice your draw 100 times before breakfast.', 'A steady hand beats a quick hand.'],
      },
      trainingCosts: {
        basic: 100,
        advanced: 250,
        master: 500,
        special: 1000,
      },
    },
    {
      id: 'shadow-walker',
      name: 'Shadow Walker',
      title: 'Ghost of the Night',
      description: 'An Apache scout who can move through any terrain unseen.',
      specialization: 'stealth',
      availability: 'available',
      location: 'wilderness',
      locationName: 'Hidden Grove',
      portrait: '/images/mentors/shadow.png',
      iconEmoji: '👤',
      backstory: 'Shadow Walker learned his skills from his grandfather, a legendary scout.',
      personality: 'Quiet and observant, speaks only when necessary.',
      teachingStyle: 'Learning by doing. You will make mistakes. Learn from them.',
      faction: 'Nahi Coalition',
      requirements: {
        level: 8,
        reputation: 200,
        skills: { stealth: 10 },
      },
      trainingBenefits: {
        primarySkill: 'Stealth',
        secondarySkills: ['Tracking', 'Survival'],
        bonuses: ['+15% Sneak Success', '-20% Detection Range'],
      },
      abilities: [
        {
          id: 'blend-shadows',
          name: 'Blend with Shadows',
          description: 'Become nearly invisible in dark areas',
          tier: 1,
          type: 'active',
          status: 'available',
          requirements: { trainingLevel: 1 },
          effects: { stat: 'stealth', value: 30, duration: 30 },
          iconEmoji: '🌑',
        },
        {
          id: 'silent-step',
          name: 'Silent Step',
          description: 'Move without making a sound',
          tier: 2,
          type: 'passive',
          status: 'locked',
          requirements: { trainingLevel: 3, skillLevel: 25 },
          effects: { stat: 'noiseReduction', value: 50 },
          iconEmoji: '🦶',
        },
        {
          id: 'ghost-walk',
          name: 'Ghost Walk',
          description: 'Phase through enemy awareness completely',
          tier: 3,
          type: 'ultimate',
          status: 'locked',
          requirements: { trainingLevel: 5, skillLevel: 50, reputation: 500 },
          effects: { stat: 'invisibility', value: 100, duration: 15, cooldown: 600 },
          iconEmoji: '👻',
        },
      ],
      dialogue: {
        greeting: ['...', 'You move like a buffalo in a china shop.'],
        training: ['Watch. Listen. Learn.', 'The earth tells many secrets.', 'You are too loud. Start again.'],
        farewell: ['May the shadows be your ally.'],
        tips: ['Move with the wind, not against it.', 'Patience is the hunter\'s greatest weapon.'],
      },
      trainingCosts: {
        basic: 150,
        advanced: 300,
        master: 600,
        special: 1200,
      },
    },
    {
      id: 'iron-fist-chen',
      name: 'Iron Fist Chen',
      title: 'Master of the Iron Palm',
      description: 'A Chinese martial arts master who came West with the railroad.',
      specialization: 'combat',
      availability: 'available',
      location: 'chinatown',
      locationName: 'Dragon Gate Temple',
      portrait: '/images/mentors/chen.png',
      iconEmoji: '👊',
      backstory: 'Chen was a bodyguard for a wealthy merchant before seeking a quieter life teaching.',
      personality: 'Patient and philosophical, sees combat as moving meditation.',
      teachingStyle: 'Balance body and mind. Strength without wisdom is dangerous.',
      faction: 'Chinese Diaspora',
      requirements: {
        level: 10,
        gold: 750,
        skills: { combat: 15 },
      },
      trainingBenefits: {
        primarySkill: 'Combat',
        secondarySkills: ['Endurance', 'Discipline'],
        bonuses: ['+20% Unarmed Damage', '+10% Block Chance'],
      },
      abilities: [
        {
          id: 'iron-palm',
          name: 'Iron Palm',
          description: 'Strike with devastating force',
          tier: 1,
          type: 'active',
          status: 'available',
          requirements: { trainingLevel: 1 },
          effects: { stat: 'unarmedDamage', value: 35, cooldown: 30 },
          iconEmoji: '🖐️',
        },
        {
          id: 'flowing-defense',
          name: 'Flowing Defense',
          description: 'Redirect enemy attacks harmlessly',
          tier: 2,
          type: 'passive',
          status: 'locked',
          requirements: { trainingLevel: 3, skillLevel: 30 },
          effects: { stat: 'parryChance', value: 25 },
          iconEmoji: '🌊',
        },
        {
          id: 'dragons-breath',
          name: 'Dragon\'s Breath',
          description: 'Unleash a devastating combination attack',
          tier: 3,
          type: 'ultimate',
          status: 'locked',
          requirements: { trainingLevel: 5, skillLevel: 50, gold: 2000 },
          effects: { stat: 'comboDamage', value: 150, cooldown: 180 },
          iconEmoji: '🐉',
        },
      ],
      dialogue: {
        greeting: ['Welcome, student.', 'The journey of a thousand miles begins with a single step.'],
        training: ['Breathe. Center yourself.', 'Again. Smoother this time.', 'Good. Your form improves.'],
        farewell: ['Walk in balance, fight with wisdom.'],
        tips: ['A calm mind sees clearly.', 'True strength comes from within.'],
      },
      trainingCosts: {
        basic: 200,
        advanced: 400,
        master: 800,
        special: 1500,
      },
    },
    {
      id: 'doc-morrison',
      name: 'Doc Morrison',
      title: 'Frontier Physician',
      description: 'A former army surgeon who now tends to the wounds of the Wild West.',
      specialization: 'medicine',
      availability: 'available',
      location: 'clinic',
      locationName: 'Morrison Medical',
      portrait: '/images/mentors/doc.png',
      iconEmoji: '💉',
      backstory: 'Doc served in the Civil War and has seen every kind of wound imaginable.',
      personality: 'Gruff but caring, no patience for fools but endless patience for the sick.',
      teachingStyle: 'Learn by doing. Every patient is a lesson.',
      faction: 'Settler Alliance',
      requirements: {
        level: 7,
        gold: 600,
      },
      trainingBenefits: {
        primarySkill: 'Medicine',
        secondarySkills: ['Herbalism', 'Surgery'],
        bonuses: ['+25% Healing Effectiveness', '-15% Recovery Time'],
      },
      abilities: [
        {
          id: 'field-medicine',
          name: 'Field Medicine',
          description: 'Quickly patch up wounds in combat',
          tier: 1,
          type: 'active',
          status: 'available',
          requirements: { trainingLevel: 1 },
          effects: { stat: 'healing', value: 30, cooldown: 45 },
          iconEmoji: '🩹',
        },
        {
          id: 'steady-hands',
          name: 'Steady Hands',
          description: 'Perform precise medical procedures under pressure',
          tier: 2,
          type: 'passive',
          status: 'locked',
          requirements: { trainingLevel: 3, skillLevel: 20 },
          effects: { stat: 'surgerySuccess', value: 20 },
          iconEmoji: '🖐️',
        },
        {
          id: 'miracle-cure',
          name: 'Miracle Cure',
          description: 'Bring someone back from the brink of death',
          tier: 3,
          type: 'ultimate',
          status: 'locked',
          requirements: { trainingLevel: 5, skillLevel: 45, gold: 1500 },
          effects: { stat: 'revive', value: 50, cooldown: 900 },
          iconEmoji: '✨',
        },
      ],
      dialogue: {
        greeting: ['Don\'t got all day. What\'s your ailment?', 'Another one wanting to learn medicine, eh?'],
        training: ['Hold this. No, not like that.', 'Stitch smaller. You\'re not sewing a saddle.', 'Better. You might not kill someone after all.'],
        farewell: ['Don\'t come back unless you\'re dying. Or bringing whiskey.'],
        tips: ['Clean hands save lives.', 'When in doubt, pour whiskey on it.'],
      },
      trainingCosts: {
        basic: 175,
        advanced: 350,
        master: 700,
        special: 1400,
      },
    },
    {
      id: 'lucky-liz',
      name: 'Lucky Liz',
      title: 'Queen of Cards',
      description: 'A legendary card shark who has never lost a high-stakes game.',
      specialization: 'gambling',
      availability: 'available',
      location: 'casino',
      locationName: 'The Golden Horseshoe',
      portrait: '/images/mentors/liz.png',
      iconEmoji: '🃏',
      backstory: 'Liz learned cards from her grandmother, a former riverboat gambler.',
      personality: 'Charming and unpredictable, always keeps you guessing.',
      teachingStyle: 'The cards don\'t lie. Learn to read them, and the people holding them.',
      faction: 'Independent',
      requirements: {
        level: 6,
        gold: 1000,
      },
      trainingBenefits: {
        primarySkill: 'Gambling',
        secondarySkills: ['Perception', 'Charisma'],
        bonuses: ['+15% Win Rate', '+10% Bluff Success'],
      },
      abilities: [
        {
          id: 'poker-face',
          name: 'Poker Face',
          description: 'Completely mask your intentions',
          tier: 1,
          type: 'passive',
          status: 'available',
          requirements: { trainingLevel: 1 },
          effects: { stat: 'bluffDefense', value: 25 },
          iconEmoji: '😐',
        },
        {
          id: 'card-counting',
          name: 'Card Counting',
          description: 'Track cards to predict what\'s coming',
          tier: 2,
          type: 'passive',
          status: 'locked',
          requirements: { trainingLevel: 3, skillLevel: 25 },
          effects: { stat: 'cardPrediction', value: 30 },
          iconEmoji: '🧮',
        },
        {
          id: 'luckys-blessing',
          name: 'Lucky\'s Blessing',
          description: 'Fortune favors the bold',
          tier: 3,
          type: 'ultimate',
          status: 'locked',
          requirements: { trainingLevel: 5, skillLevel: 50, gold: 2500 },
          effects: { stat: 'criticalLuck', value: 50, duration: 60, cooldown: 600 },
          iconEmoji: '🍀',
        },
      ],
      dialogue: {
        greeting: ['Care for a friendly game?', 'Ah, another student of fortune.'],
        training: ['Watch the eyes, not the cards.', 'The tell is in the twitch.', 'Good read. You\'re learning.'],
        farewell: ['May Lady Luck ride with you.'],
        tips: ['Never gamble more than you can afford to lose.', 'The best bluff is the truth no one believes.'],
      },
      trainingCosts: {
        basic: 250,
        advanced: 500,
        master: 1000,
        special: 2000,
      },
    },
  ];
}

export default useMentors;
