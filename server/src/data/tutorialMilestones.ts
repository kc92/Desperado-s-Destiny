/**
 * Tutorial Milestones Data
 *
 * Achievement badges earned for completing tutorial phases
 * Visible in character profile with XP, gold, and item rewards
 */

import { TutorialPhase } from '../models/TutorialProgress.model';

/**
 * Tutorial milestone definition
 */
export interface ITutorialMilestone {
  id: string;
  phase: TutorialPhase;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  dollarsReward: number;
  itemReward?: { itemId: string; quantity: number };
  // Achievement type for Achievement system integration
  achievementType?: string;
}

/**
 * All tutorial milestones (9 total - one per active phase)
 */
export const TUTORIAL_MILESTONES: ITutorialMilestone[] = [
  {
    id: 'survivor_awakening',
    phase: TutorialPhase.AWAKENING,
    name: 'Survivor',
    description: 'Survived the stagecoach ambush and met Hawk',
    icon: 'sunrise',
    xpReward: 50,
    dollarsReward: 25,
    achievementType: 'tutorial_survivor'
  },
  {
    id: 'first_blood',
    phase: TutorialPhase.FIRST_COMBAT,
    name: 'First Blood',
    description: 'Won your first Destiny Deck duel',
    icon: 'swords',
    xpReward: 75,
    dollarsReward: 50,
    itemReward: { itemId: 'bandages', quantity: 3 },
    achievementType: 'tutorial_first_blood'
  },
  {
    id: 'desert_adapted',
    phase: TutorialPhase.SURVIVAL,
    name: 'Desert Adapted',
    description: 'Learned to manage energy and rest',
    icon: 'cactus',
    xpReward: 75,
    dollarsReward: 50,
    itemReward: { itemId: 'coffee', quantity: 5 },
    achievementType: 'tutorial_desert_adapted'
  },
  {
    id: 'apprentice',
    phase: TutorialPhase.SKILL_TRAINING,
    name: 'Apprentice',
    description: 'Trained your first skill',
    icon: 'book',
    xpReward: 100,
    dollarsReward: 75,
    achievementType: 'tutorial_apprentice'
  },
  {
    id: 'hired_gun',
    phase: TutorialPhase.CONTRACTS,
    name: 'Hired Gun',
    description: 'Completed your first contract',
    icon: 'scroll',
    xpReward: 100,
    dollarsReward: 100,
    achievementType: 'tutorial_hired_gun'
  },
  {
    id: 'known_face',
    phase: TutorialPhase.SOCIAL,
    name: 'Known Face',
    description: 'Built your first reputation',
    icon: 'handshake',
    xpReward: 100,
    dollarsReward: 75,
    achievementType: 'tutorial_known_face'
  },
  {
    id: 'faction_aware',
    phase: TutorialPhase.FACTION_INTRO,
    name: 'Faction Aware',
    description: 'Learned about the three powers',
    icon: 'scale',
    xpReward: 125,
    dollarsReward: 100,
    achievementType: 'tutorial_faction_aware'
  },
  {
    id: 'gang_ready',
    phase: TutorialPhase.GANG_BASICS,
    name: 'Gang Ready',
    description: 'Understands gang territory and benefits',
    icon: 'users',
    xpReward: 150,
    dollarsReward: 125,
    achievementType: 'tutorial_gang_ready'
  },
  {
    id: 'hawks_pride',
    phase: TutorialPhase.GRADUATION,
    name: "Hawk's Pride",
    description: 'Completed mentorship with Hawk',
    icon: 'feather',
    xpReward: 250,
    dollarsReward: 500,
    itemReward: { itemId: 'hawks-feather', quantity: 1 },
    achievementType: 'tutorial_hawks_pride'
  }
];

/**
 * Get milestone for a specific phase
 */
export function getMilestoneForPhase(phase: TutorialPhase): ITutorialMilestone | undefined {
  return TUTORIAL_MILESTONES.find(m => m.phase === phase);
}

/**
 * Get milestone by ID
 */
export function getMilestoneById(id: string): ITutorialMilestone | undefined {
  return TUTORIAL_MILESTONES.find(m => m.id === id);
}

/**
 * Get all milestones up to and including a phase
 */
export function getMilestonesUpToPhase(phase: TutorialPhase): ITutorialMilestone[] {
  const phaseOrder = [
    TutorialPhase.AWAKENING,
    TutorialPhase.FIRST_COMBAT,
    TutorialPhase.SURVIVAL,
    TutorialPhase.SKILL_TRAINING,
    TutorialPhase.CONTRACTS,
    TutorialPhase.SOCIAL,
    TutorialPhase.FACTION_INTRO,
    TutorialPhase.GANG_BASICS,
    TutorialPhase.GRADUATION
  ];

  const phaseIndex = phaseOrder.indexOf(phase);
  if (phaseIndex === -1) return [];

  const phasesToInclude = phaseOrder.slice(0, phaseIndex + 1);
  return TUTORIAL_MILESTONES.filter(m => phasesToInclude.includes(m.phase));
}

/**
 * Calculate total rewards for all milestones
 */
export function calculateTotalMilestoneRewards(): {
  totalXp: number;
  totalDollars: number;
  items: Array<{ itemId: string; quantity: number }>;
} {
  const items: Array<{ itemId: string; quantity: number }> = [];

  let totalXp = 0;
  let totalDollars = 0;

  for (const milestone of TUTORIAL_MILESTONES) {
    totalXp += milestone.xpReward;
    totalDollars += milestone.dollarsReward;

    if (milestone.itemReward) {
      const existingItem = items.find(i => i.itemId === milestone.itemReward!.itemId);
      if (existingItem) {
        existingItem.quantity += milestone.itemReward.quantity;
      } else {
        items.push({ ...milestone.itemReward });
      }
    }
  }

  return { totalXp, totalDollars, items };
}

/**
 * Tutorial graduation rewards summary
 */
export const GRADUATION_REWARDS = {
  totalXp: 1025,      // Sum of all milestone XP
  totalDollars: 1100, // Sum of all milestone dollars
  specialItem: {
    itemId: 'hawks-feather',
    name: "Hawk's Feather",
    description: 'A hawk feather given by your mentor. A symbol of your frontier education.'
  }
};

/**
 * Hawk's Feather - Special tutorial completion item
 * This should be added to consumables.ts
 */
export const HAWKS_FEATHER_ITEM = {
  itemId: 'hawks-feather',
  name: "Hawk's Feather",
  description: 'A weathered hawk feather given to you by your mentor Ezra "Hawk" Hawthorne. A symbol of your frontier education and your bond with the old scout.',
  type: 'accessory' as const,
  rarity: 'rare' as const,
  price: 0,           // Not for sale
  sellPrice: 1,       // Worthless to others, priceless to you
  inShop: false,
  levelRequired: 1,
  icon: 'feather',
  isEquippable: true,
  isConsumable: false,
  isStackable: false,
  maxStack: 1,
  equipSlot: 'accessory' as const,
  stats: {
    spirit: 2
  },
  effects: [
    { type: 'special', value: 5, description: '+5% XP gain (Hawk\'s Wisdom)' }
  ],
  tutorialItem: true,
  flavorText: '"Go on now. The frontier\'s waiting. And remember - you\'ve always got a friend in old Hawk."'
};
