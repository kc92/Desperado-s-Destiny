import { ObjectId } from 'mongodb';
import { Horse, HorseDocument } from '../models/Horse.model';
import {
  BondActivity,
  BondLevel
} from '@desperados/shared';

// ============================================================================
// BOND ACTIVITIES
// ============================================================================

export const BOND_ACTIVITIES: Record<string, BondActivity> = {
  FEED_BASIC: {
    activity: 'feed',
    bondChange: 2,
    trustChange: 1,
    description: 'Fed your horse basic food'
  },
  FEED_QUALITY: {
    activity: 'feed',
    bondChange: 5,
    trustChange: 2,
    description: 'Fed your horse quality food'
  },
  FEED_PREMIUM: {
    activity: 'feed',
    bondChange: 8,
    trustChange: 3,
    description: 'Fed your horse premium food'
  },
  GROOM: {
    activity: 'groom',
    bondChange: 5,
    trustChange: 2,
    description: 'Groomed your horse'
  },
  RIDE_SHORT: {
    activity: 'ride',
    bondChange: 1,
    description: 'Rode together for a short time'
  },
  RIDE_LONG: {
    activity: 'ride',
    bondChange: 3,
    description: 'Went on a long ride together'
  },
  TRAIN: {
    activity: 'train',
    bondChange: 5,
    trustChange: 3,
    description: 'Trained together'
  },
  COMBAT_VICTORY: {
    activity: 'combat',
    bondChange: 5,
    trustChange: 2,
    description: 'Fought together and won'
  },
  COMBAT_DEFEAT: {
    activity: 'combat',
    bondChange: 2,
    description: 'Fought together but were defeated'
  },
  RESCUE: {
    activity: 'rescue',
    bondChange: 15,
    trustChange: 10,
    description: 'Saved your horse from danger'
  },
  NEGLECT_MINOR: {
    activity: 'neglect',
    bondChange: -5,
    trustChange: -2,
    description: 'Neglected your horse'
  },
  NEGLECT_MAJOR: {
    activity: 'neglect',
    bondChange: -10,
    trustChange: -5,
    description: 'Severely neglected your horse'
  },
  ABUSE: {
    activity: 'abuse',
    bondChange: -20,
    trustChange: -15,
    description: 'Abused your horse'
  }
};

// ============================================================================
// BOND LEVEL DEFINITIONS
// ============================================================================

export const BOND_LEVEL_THRESHOLDS = {
  [BondLevel.STRANGER]: { min: 0, max: 20 },
  [BondLevel.ACQUAINTANCE]: { min: 21, max: 40 },
  [BondLevel.PARTNER]: { min: 41, max: 60 },
  [BondLevel.COMPANION]: { min: 61, max: 80 },
  [BondLevel.BONDED]: { min: 81, max: 100 }
};

export const BOND_LEVEL_BENEFITS = {
  [BondLevel.STRANGER]: {
    description: 'Horse responds to basic commands',
    benefits: [
      'Can ride the horse',
      'Basic control'
    ],
    penalties: [
      'May refuse commands',
      'Will flee from danger',
      'Slow to respond'
    ]
  },
  [BondLevel.ACQUAINTANCE]: {
    description: 'Horse recognizes and trusts you somewhat',
    benefits: [
      'More responsive to commands',
      'Reduced chance of refusal',
      '+5% travel speed'
    ],
    penalties: [
      'Still may flee from serious danger',
      'Won\'t perform complex tasks'
    ]
  },
  [BondLevel.PARTNER]: {
    description: 'True partnership begins',
    benefits: [
      'Can whistle to call from distance',
      'Performs trained tricks',
      '+10% travel speed',
      '+5% combat effectiveness',
      'Reduced stamina consumption'
    ],
    penalties: [
      'May still flee if severely injured'
    ]
  },
  [BondLevel.COMPANION]: {
    description: 'Deep connection and mutual respect',
    benefits: [
      'Combat bonuses active',
      '+15% travel speed',
      '+10% combat effectiveness',
      'Won\'t flee unless you do',
      'Warns of nearby danger',
      'Performs advanced tasks'
    ],
    penalties: []
  },
  [BondLevel.BONDED]: {
    description: 'Unbreakable bond - horse will die for you',
    benefits: [
      'Maximum loyalty - never flees',
      '+20% travel speed',
      '+20% combat effectiveness',
      'Enhanced perception shared',
      'Will protect you in combat',
      'Mourning period if horse dies',
      'All stat bonuses doubled'
    ],
    penalties: [
      'Emotional trauma if horse dies (-50% effectiveness for 7 days)'
    ]
  }
};

// ============================================================================
// BOND MANAGEMENT
// ============================================================================

export async function updateBond(
  horseId: ObjectId,
  activityKey: string
): Promise<{
  horse: HorseDocument;
  previousLevel: BondLevel;
  newLevel: BondLevel;
  leveledUp: boolean;
}> {
  const activity = BOND_ACTIVITIES[activityKey];
  if (!activity) {
    throw new Error('Invalid bond activity');
  }

  const horse = await Horse.findById(horseId);
  if (!horse) {
    throw new Error('Horse not found');
  }

  const previousLevel = getBondLevel(horse.bond.level);

  // Apply bond change
  horse.bond.level = Math.max(0, Math.min(100, horse.bond.level + activity.bondChange));

  // Apply trust change if specified
  if (activity.trustChange) {
    horse.bond.trust = Math.max(0, Math.min(100, horse.bond.trust + activity.trustChange));
  }

  // Update last interaction
  horse.bond.lastInteraction = new Date();

  // Check for loyalty threshold (bonded level)
  if (horse.bond.level >= 81 && horse.bond.trust >= 80) {
    horse.bond.loyalty = true;
  } else if (horse.bond.level < 60 || horse.bond.trust < 50) {
    horse.bond.loyalty = false;
  }

  await horse.save();

  const newLevel = getBondLevel(horse.bond.level);
  const leveledUp = newLevel !== previousLevel;

  return {
    horse,
    previousLevel,
    newLevel,
    leveledUp
  };
}

export function getBondLevel(bondValue: number): BondLevel {
  if (bondValue <= 20) return BondLevel.STRANGER;
  if (bondValue <= 40) return BondLevel.ACQUAINTANCE;
  if (bondValue <= 60) return BondLevel.PARTNER;
  if (bondValue <= 80) return BondLevel.COMPANION;
  return BondLevel.BONDED;
}

export function getBondBenefits(bondLevel: BondLevel) {
  return BOND_LEVEL_BENEFITS[bondLevel];
}

export function calculateBondMultiplier(bondLevel: number): number {
  // Returns multiplier for various bonuses (1.0 to 1.5)
  return 1 + (bondLevel / 200);
}

// ============================================================================
// BOND DECAY
// ============================================================================

export async function checkBondDecay(horseId: ObjectId | string): Promise<HorseDocument> {
  const horse = await Horse.findById(horseId);
  if (!horse) {
    throw new Error('Horse not found');
  }

  const hoursSinceInteraction =
    (Date.now() - horse.bond.lastInteraction.getTime()) / (1000 * 60 * 60);

  // Decay starts after 24 hours
  if (hoursSinceInteraction > 24) {
    const daysSinceInteraction = hoursSinceInteraction / 24;

    // Decay rate increases with neglect
    let decayRate = 1; // 1 point per day initially
    if (daysSinceInteraction > 7) {
      decayRate = 2; // Faster decay after a week
    }
    if (daysSinceInteraction > 30) {
      decayRate = 3; // Even faster after a month
    }

    const totalDecay = Math.floor((daysSinceInteraction - 1) * decayRate);

    // Apply decay
    horse.bond.level = Math.max(0, horse.bond.level - totalDecay);
    horse.bond.trust = Math.max(0, horse.bond.trust - Math.floor(totalDecay * 0.5));

    // Loyalty can be lost through severe neglect
    if (daysSinceInteraction > 30 && horse.bond.level < 60) {
      horse.bond.loyalty = false;
    }

    await horse.save();
  }

  return horse;
}

export async function checkAllBondDecay(characterId: ObjectId | string): Promise<void> {
  const horses = await Horse.find({ ownerId: characterId });

  for (const horse of horses) {
    await checkBondDecay(horse._id as any);
  }
}

// ============================================================================
// SPECIAL BOND EVENTS
// ============================================================================

export async function saveHorseFromDanger(
  horseId: ObjectId,
  dangerType: 'injury' | 'predator' | 'natural_disaster' | 'theft'
): Promise<{
  horse: HorseDocument;
  bondGain: number;
  trustGain: number;
  message: string;
}> {
  const horse = await Horse.findById(horseId);
  if (!horse) {
    throw new Error('Horse not found');
  }

  let bondGain = 15;
  let trustGain = 10;
  let message = '';

  switch (dangerType) {
    case 'injury':
      message = `You saved ${horse.name} from a serious injury. Your bond has deepened significantly.`;
      break;
    case 'predator':
      message = `You protected ${horse.name} from a dangerous predator. Your horse will never forget this.`;
      bondGain = 20;
      trustGain = 15;
      break;
    case 'natural_disaster':
      message = `You risked your life to save ${horse.name} from disaster. The bond between you is now unbreakable.`;
      bondGain = 25;
      trustGain = 20;
      break;
    case 'theft':
      message = `You rescued ${horse.name} from horse thieves. Your horse's loyalty is absolute.`;
      bondGain = 20;
      trustGain = 15;
      horse.bond.loyalty = true;
      break;
  }

  horse.bond.level = Math.min(100, horse.bond.level + bondGain);
  horse.bond.trust = Math.min(100, horse.bond.trust + trustGain);
  horse.bond.lastInteraction = new Date();

  await horse.save();

  return {
    horse,
    bondGain,
    trustGain,
    message
  };
}

export async function horseProtectsOwner(
  horseId: ObjectId
): Promise<{
  horse: HorseDocument;
  bondGain: number;
  message: string;
}> {
  const horse = await Horse.findById(horseId);
  if (!horse) {
    throw new Error('Horse not found');
  }

  // Only bonded horses protect their owners
  if (horse.bond.level < 61) {
    return {
      horse,
      bondGain: 0,
      message: `${horse.name} fled from danger.`
    };
  }

  const bondGain = 5;
  horse.bond.level = Math.min(100, horse.bond.level + bondGain);
  horse.bond.lastInteraction = new Date();

  await horse.save();

  return {
    horse,
    bondGain,
    message: `${horse.name} bravely stood by your side in danger. Your bond grows stronger.`
  };
}

// ============================================================================
// BOND ACTIVITIES TRACKING
// ============================================================================

export async function recordBondActivity(
  horseId: ObjectId,
  activityKey: string,
  metadata?: Record<string, any>
): Promise<void> {
  // This could be expanded to track detailed bond history
  const result = await updateBond(horseId, activityKey);

  // Could save to a BondHistory collection for analytics
  // For now, just update the bond level
}

// ============================================================================
// BOND RECOMMENDATIONS
// ============================================================================

export function getBondRecommendations(horse: HorseDocument): string[] {
  const recommendations: string[] = [];
  const currentLevel = getBondLevel(horse.bond.level);

  // Based on current bond level
  if (currentLevel === BondLevel.STRANGER) {
    recommendations.push('Spend time riding together to build familiarity');
    recommendations.push('Feed premium food to build positive associations');
    recommendations.push('Groom regularly to establish trust');
  } else if (currentLevel === BondLevel.ACQUAINTANCE) {
    recommendations.push('Begin training skills together');
    recommendations.push('Take on longer rides to deepen partnership');
    recommendations.push('Continue regular feeding and grooming');
  } else if (currentLevel === BondLevel.PARTNER) {
    recommendations.push('Face challenges together to build loyalty');
    recommendations.push('Enter races or competitions as a team');
    recommendations.push('Practice mounted combat');
  } else if (currentLevel === BondLevel.COMPANION) {
    recommendations.push('Maintain daily interactions');
    recommendations.push('Push boundaries together to reach bonded status');
    recommendations.push('Share dangerous experiences');
  } else {
    recommendations.push('Your bond is complete - maintain it with regular care');
  }

  // Based on needs
  if (horse.condition.hunger < 50) {
    recommendations.push('⚠️ URGENT: Feed your horse - neglect damages bond');
  }
  if (horse.condition.cleanliness < 40) {
    recommendations.push('⚠️ Your horse needs grooming');
  }

  const hoursSinceInteraction =
    (Date.now() - horse.bond.lastInteraction.getTime()) / (1000 * 60 * 60);
  if (hoursSinceInteraction > 48) {
    recommendations.push('⚠️ You haven\'t interacted with your horse in days - bond is decaying');
  }

  if (horse.bond.trust < 50) {
    recommendations.push('Focus on trust-building activities (grooming, gentle training)');
  }

  return recommendations;
}

// ============================================================================
// BOND LOSS PENALTIES
// ============================================================================

export async function handleHorseDeath(
  horseId: ObjectId,
  ownerId: ObjectId
): Promise<{
  bondLevel: BondLevel;
  traumaDuration: number; // days
  effectPenalty: number; // percentage
}> {
  const horse = await Horse.findById(horseId);
  if (!horse) {
    throw new Error('Horse not found');
  }

  const bondLevel = getBondLevel(horse.bond.level);
  let traumaDuration = 0;
  let effectPenalty = 0;

  // Trauma scales with bond level
  switch (bondLevel) {
    case BondLevel.STRANGER:
    case BondLevel.ACQUAINTANCE:
      traumaDuration = 0;
      effectPenalty = 0;
      break;
    case BondLevel.PARTNER:
      traumaDuration = 2;
      effectPenalty = 10;
      break;
    case BondLevel.COMPANION:
      traumaDuration = 5;
      effectPenalty = 25;
      break;
    case BondLevel.BONDED:
      traumaDuration = 7;
      effectPenalty = 50;
      break;
  }

  // Apply trauma effect to character (would be implemented in character service)
  // This is a placeholder for the integration point

  return {
    bondLevel,
    traumaDuration,
    effectPenalty
  };
}

// ============================================================================
// WHISTLE & RECALL
// ============================================================================

export async function whistleForHorse(
  characterId: ObjectId,
  horseId: ObjectId,
  distance: number // miles
): Promise<{
  success: boolean;
  arrivalTime?: number; // minutes
  message: string;
}> {
  const horse = await Horse.findOne({ _id: horseId, ownerId: characterId });
  if (!horse) {
    throw new Error('Horse not found');
  }

  const bondLevel = getBondLevel(horse.bond.level);

  // Only Partner level and above can recall
  if (bondLevel === BondLevel.STRANGER || bondLevel === BondLevel.ACQUAINTANCE) {
    return {
      success: false,
      message: `${horse.name} doesn't respond to your whistle. You need a stronger bond.`
    };
  }

  // Distance affects success
  let maxDistance = 1; // 1 mile for Partner
  if (bondLevel === BondLevel.COMPANION) maxDistance = 3;
  if (bondLevel === BondLevel.BONDED) maxDistance = 10;

  if (distance > maxDistance) {
    return {
      success: false,
      message: `${horse.name} is too far away to hear your whistle.`
    };
  }

  // Calculate arrival time (horses travel ~8 mph at a trot)
  const arrivalTime = Math.ceil((distance / 8) * 60); // Convert to minutes

  return {
    success: true,
    arrivalTime,
    message: `${horse.name} heard your whistle and is on the way!`
  };
}
