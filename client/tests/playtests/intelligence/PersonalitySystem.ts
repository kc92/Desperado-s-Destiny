/**
 * PersonalitySystem.ts
 *
 * Comprehensive personality system for bot testing framework.
 * Provides 8 distinct archetypes with trait-based behavior modifiers
 * to simulate realistic player diversity.
 */

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * PersonalityTraits define behavioral tendencies on 0-1 scales
 * These traits influence decision-making across all activities
 */
export interface PersonalityTraits {
  /** 0 = extremely cautious, 1 = reckless risk-taker */
  riskTolerance: number;

  /** 0 = prefers solo play, 1 = highly social */
  sociability: number;

  /** 0 = impulsive/quick decisions, 1 = methodical/careful */
  patience: number;

  /** 0 = altruistic/community-focused, 1 = profit-driven */
  greed: number;

  /** 0 = peaceful/avoids conflict, 1 = combative/seeks fights */
  aggression: number;

  /** 0 = independent/mercenary, 1 = faction-loyal */
  loyalty: number;

  /** 0 = sticks to routine, 1 = experimental/exploratory */
  curiosity: number;
}

/**
 * PersonalityPreferences define activity inclinations
 * Used to filter and prioritize actions
 */
export interface PersonalityPreferences {
  /** Activities this personality is drawn to */
  preferredActivities: string[];

  /** Activities this personality actively avoids */
  avoidedActivities: string[];

  /** Overall approach to gameplay */
  playStyle: 'efficient' | 'immersive' | 'chaotic';
}

/**
 * PersonalityProfile combines traits, preferences, and metadata
 * Represents a complete behavioral profile
 */
export interface PersonalityProfile {
  /** Core archetype identifier */
  archetype: 'grinder' | 'social' | 'explorer' | 'combat' | 'economist' | 'criminal' | 'roleplayer' | 'chaos';

  /** Human-readable name for this personality */
  name: string;

  /** Description of behavioral patterns */
  description: string;

  /** Numerical trait values */
  traits: PersonalityTraits;

  /** Activity preferences */
  preferences: PersonalityPreferences;
}

// ============================================================================
// ARCHETYPE CONFIGURATIONS
// ============================================================================

/**
 * The Grinder: Efficiency-focused optimizer
 *
 * Behavioral Pattern:
 * - Maximizes XP and gold per hour
 * - Repeats proven strategies
 * - Avoids social "time wasters"
 * - Methodical and patient
 * - Low risk tolerance (proven methods only)
 */
const GRINDER_ARCHETYPE: PersonalityProfile = {
  archetype: 'grinder',
  name: 'The Grinder',
  description: 'Efficiency-focused player who optimizes XP/gold per hour through repetitive, proven strategies',
  traits: {
    riskTolerance: 0.2,  // Sticks to proven methods
    sociability: 0.2,     // Sees chat as time waste
    patience: 0.9,        // Highly methodical
    greed: 0.8,           // Profit-driven
    aggression: 0.4,      // Moderate - combat if efficient
    loyalty: 0.5,         // Neutral
    curiosity: 0.1,       // Sticks to routine
  },
  preferences: {
    preferredActivities: [
      'jobs',
      'skill_training',
      'efficient_combat',
      'grinding',
      'leveling',
      'farming',
      'resource_gathering',
    ],
    avoidedActivities: [
      'chat',
      'exploration',
      'roleplay',
      'mail',
      'social_events',
      'experimental_activities',
    ],
    playStyle: 'efficient',
  },
};

/**
 * The Social Butterfly: Community-focused connector
 *
 * Behavioral Pattern:
 * - Prioritizes relationships over progress
 * - Active in chat and gang activities
 * - Helps other players
 * - Avoids solo grinding
 * - Peaceful and friendly
 */
const SOCIAL_ARCHETYPE: PersonalityProfile = {
  archetype: 'social',
  name: 'The Social Butterfly',
  description: 'Community-focused player who prioritizes relationships, chat, and collaborative activities',
  traits: {
    riskTolerance: 0.3,  // Cautious socially
    sociability: 0.95,    // Extremely social
    patience: 0.7,        // Patient with people
    greed: 0.3,           // Shares resources
    aggression: 0.1,      // Very peaceful
    loyalty: 0.8,         // High gang/friend loyalty
    curiosity: 0.6,       // Interested in people
  },
  preferences: {
    preferredActivities: [
      'chat',
      'mail',
      'friends',
      'gang_activities',
      'gang_events',
      'helping_others',
      'group_content',
      'trading_with_friends',
    ],
    avoidedActivities: [
      'solo_grinding',
      'combat',
      'duels',
      'crimes',
      'antisocial_behavior',
    ],
    playStyle: 'immersive',
  },
};

/**
 * The Explorer: Curiosity-driven adventurer
 *
 * Behavioral Pattern:
 * - Visits every location
 * - Tries all features
 * - Never repeats same action twice in a row
 * - Values novelty over efficiency
 * - Independent and wandering
 */
const EXPLORER_ARCHETYPE: PersonalityProfile = {
  archetype: 'explorer',
  name: 'The Explorer',
  description: 'Curiosity-driven adventurer who visits new locations, tries diverse activities, and values novelty',
  traits: {
    riskTolerance: 0.6,  // Willing to try risky things
    sociability: 0.5,     // Neutral - meets people while exploring
    patience: 0.4,        // Impulsive explorer
    greed: 0.4,           // Neutral
    aggression: 0.3,      // Generally peaceful
    loyalty: 0.2,         // Independent wanderer
    curiosity: 0.95,      // Extremely curious
  },
  preferences: {
    preferredActivities: [
      'travel',
      'exploration',
      'quests',
      'diverse_activities',
      'new_locations',
      'discovery',
      'lore',
      'npcs',
    ],
    avoidedActivities: [
      'repetition',
      'grinding',
      'staying_in_one_place',
      'routine',
      'optimization',
    ],
    playStyle: 'chaotic',
  },
};

/**
 * The Combat Enthusiast: Battle-focused warrior
 *
 * Behavioral Pattern:
 * - Seeks duels and bounties
 * - Prioritizes combat upgrades
 * - High risk tolerance in fights
 * - Avoids non-combat activities
 * - Reputation through victory
 */
const COMBAT_ARCHETYPE: PersonalityProfile = {
  archetype: 'combat',
  name: 'The Combat Enthusiast',
  description: 'Battle-focused warrior who seeks duels, bounties, and combat superiority',
  traits: {
    riskTolerance: 0.85, // High risk in combat
    sociability: 0.4,     // Some - for duels and rivalry
    patience: 0.5,        // Moderate
    greed: 0.6,           // Wants gold for gear
    aggression: 0.9,      // Highly combative
    loyalty: 0.6,         // Moderate gang loyalty
    curiosity: 0.3,       // Focused on combat
  },
  preferences: {
    preferredActivities: [
      'combat',
      'duels',
      'bounties',
      'weapon_upgrades',
      'armor_upgrades',
      'pvp',
      'tournaments',
      'combat_training',
    ],
    avoidedActivities: [
      'crafting',
      'trading',
      'social_chat',
      'exploration',
      'peaceful_activities',
    ],
    playStyle: 'efficient',
  },
};

/**
 * The Economist: Market-savvy trader
 *
 * Behavioral Pattern:
 * - Watches market prices
 * - Crafts for profit
 * - Patient with investments
 * - Avoids combat (time inefficient)
 * - Maximizes wealth
 */
const ECONOMIST_ARCHETYPE: PersonalityProfile = {
  archetype: 'economist',
  name: 'The Economist',
  description: 'Market-savvy trader who maximizes wealth through crafting, trading, and investments',
  traits: {
    riskTolerance: 0.3,  // Conservative with money
    sociability: 0.3,     // Minimal - focused on markets
    patience: 0.95,       // Extremely patient
    greed: 0.95,          // Extremely profit-driven
    aggression: 0.1,      // Avoids combat
    loyalty: 0.4,         // Mercenary
    curiosity: 0.5,       // Interested in market mechanics
  },
  preferences: {
    preferredActivities: [
      'trading',
      'crafting',
      'market_watching',
      'investments',
      'shop_management',
      'resource_trading',
      'economy_optimization',
    ],
    avoidedActivities: [
      'combat',
      'duels',
      'social_chat',
      'exploration',
      'crimes',
    ],
    playStyle: 'efficient',
  },
};

/**
 * The Criminal: High-risk outlaw
 *
 * Behavioral Pattern:
 * - High-risk crimes
 * - Jail time acceptable
 * - Bounty hunter target
 * - Low loyalty to factions
 * - Chaotic and unpredictable
 */
const CRIMINAL_ARCHETYPE: PersonalityProfile = {
  archetype: 'criminal',
  name: 'The Criminal',
  description: 'High-risk outlaw who pursues crimes, heists, and illegal activities despite jail risk',
  traits: {
    riskTolerance: 0.9,  // Very high risk
    sociability: 0.4,     // Some - criminal networks
    patience: 0.2,        // Impulsive
    greed: 0.8,           // High - quick money
    aggression: 0.7,      // Willing to fight
    loyalty: 0.2,         // Low faction loyalty
    curiosity: 0.6,       // Tries different crimes
  },
  preferences: {
    preferredActivities: [
      'crimes',
      'heists',
      'outlaw_activities',
      'high_risk_actions',
      'jail_break',
      'smuggling',
      'theft',
    ],
    avoidedActivities: [
      'legal_jobs',
      'reputation_building',
      'faction_quests',
      'honest_trading',
      'law_enforcement',
    ],
    playStyle: 'chaotic',
  },
};

/**
 * The Role-Player: Immersion-focused storyteller
 *
 * Behavioral Pattern:
 * - Makes decisions based on character backstory
 * - Immersive chat interactions
 * - Follows lore and quests
 * - Avoids min-maxing
 * - Patient and methodical
 */
const ROLEPLAYER_ARCHETYPE: PersonalityProfile = {
  archetype: 'roleplayer',
  name: 'The Role-Player',
  description: 'Immersion-focused player who prioritizes story, character development, and lore over optimization',
  traits: {
    riskTolerance: 0.5,  // Depends on character
    sociability: 0.8,     // High - immersive chat
    patience: 0.85,       // Very patient
    greed: 0.3,           // Not profit-focused
    aggression: 0.4,      // Character-dependent
    loyalty: 0.8,         // High to character values
    curiosity: 0.7,       // Interested in lore
  },
  preferences: {
    preferredActivities: [
      'chat',
      'quests',
      'lore',
      'npc_interactions',
      'story_content',
      'character_development',
      'roleplay_events',
      'mail',
    ],
    avoidedActivities: [
      'min_maxing',
      'exploits',
      'grinding',
      'meta_gaming',
      'breaking_character',
    ],
    playStyle: 'immersive',
  },
};

/**
 * The Chaos Agent: Unpredictable edge case tester
 *
 * Behavioral Pattern:
 * - Random decisions
 * - Tests unusual combinations
 * - No predictable patterns
 * - All traits moderate (variable)
 * - Ultimate test for system robustness
 */
const CHAOS_ARCHETYPE: PersonalityProfile = {
  archetype: 'chaos',
  name: 'The Chaos Agent',
  description: 'Unpredictable player who makes random decisions and tests unusual action combinations',
  traits: {
    riskTolerance: 0.5,  // Variable
    sociability: 0.5,     // Variable
    patience: 0.5,        // Variable
    greed: 0.5,           // Variable
    aggression: 0.5,      // Variable
    loyalty: 0.5,         // Variable
    curiosity: 0.5,       // Variable
  },
  preferences: {
    preferredActivities: [
      'random',
      'unusual_combinations',
      'edge_cases',
      'unexpected_sequences',
      'system_testing',
    ],
    avoidedActivities: [
      'predictable_patterns',
      'optimization',
      'routine',
    ],
    playStyle: 'chaotic',
  },
};

// ============================================================================
// ARCHETYPE REGISTRY
// ============================================================================

const ARCHETYPES: Record<string, PersonalityProfile> = {
  grinder: GRINDER_ARCHETYPE,
  social: SOCIAL_ARCHETYPE,
  explorer: EXPLORER_ARCHETYPE,
  combat: COMBAT_ARCHETYPE,
  economist: ECONOMIST_ARCHETYPE,
  criminal: CRIMINAL_ARCHETYPE,
  roleplayer: ROLEPLAYER_ARCHETYPE,
  chaos: CHAOS_ARCHETYPE,
};

// ============================================================================
// PERSONALITY SYSTEM CLASS
// ============================================================================

/**
 * PersonalitySystem manages personality profiles and decision-making
 * Provides utilities for creating, modifying, and using personalities
 */
export class PersonalitySystem {
  /**
   * Create a personality from a specified archetype
   */
  static createPersonality(archetype: string): PersonalityProfile {
    const profile = ARCHETYPES[archetype];
    if (!profile) {
      throw new Error(`Unknown archetype: ${archetype}`);
    }

    // Return a deep copy to prevent mutations
    return JSON.parse(JSON.stringify(profile));
  }

  /**
   * Create a random personality by selecting a random archetype
   */
  static createRandomPersonality(): PersonalityProfile {
    const archetypes = Object.keys(ARCHETYPES);
    const randomArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];
    return this.createPersonality(randomArchetype);
  }

  /**
   * Create a variant of an archetype with trait variance (±10%)
   * Useful for creating multiple bots with similar but not identical personalities
   */
  static createVariant(archetype: string): PersonalityProfile {
    const base = this.createPersonality(archetype);

    // Apply ±10% variance to each trait, clamped to [0, 1]
    const applyVariance = (value: number): number => {
      const variance = (Math.random() - 0.5) * 0.2; // -0.1 to +0.1
      return Math.max(0, Math.min(1, value + variance));
    };

    base.traits = {
      riskTolerance: applyVariance(base.traits.riskTolerance),
      sociability: applyVariance(base.traits.sociability),
      patience: applyVariance(base.traits.patience),
      greed: applyVariance(base.traits.greed),
      aggression: applyVariance(base.traits.aggression),
      loyalty: applyVariance(base.traits.loyalty),
      curiosity: applyVariance(base.traits.curiosity),
    };

    return base;
  }

  /**
   * Calculate action score multiplier based on personality traits
   * Returns multiplier (0.5 to 2.0) indicating how much this personality values the action
   *
   * Action mapping examples:
   * - combat actions: affected by aggression, riskTolerance
   * - social actions: affected by sociability
   * - grinding actions: affected by patience, greed
   * - exploration: affected by curiosity
   */
  static getActionMultiplier(action: string, traits: PersonalityTraits): number {
    const actionLower = action.toLowerCase();
    let multiplier = 1.0;

    // Combat actions
    if (actionLower.includes('combat') || actionLower.includes('duel') || actionLower.includes('fight')) {
      multiplier *= 0.5 + (traits.aggression * 1.5);
    }

    // Social actions
    if (actionLower.includes('chat') || actionLower.includes('mail') || actionLower.includes('friend')) {
      multiplier *= 0.5 + (traits.sociability * 1.5);
    }

    // Grinding/repetitive actions
    if (actionLower.includes('grind') || actionLower.includes('farm') || actionLower.includes('job')) {
      multiplier *= 0.5 + (traits.patience * 1.5);
    }

    // Exploration actions
    if (actionLower.includes('explore') || actionLower.includes('travel') || actionLower.includes('quest')) {
      multiplier *= 0.5 + (traits.curiosity * 1.5);
    }

    // High-risk actions
    if (actionLower.includes('crime') || actionLower.includes('heist') || actionLower.includes('risky')) {
      multiplier *= 0.5 + (traits.riskTolerance * 1.5);
    }

    // Trading/economic actions
    if (actionLower.includes('trade') || actionLower.includes('craft') || actionLower.includes('market')) {
      multiplier *= 0.5 + (traits.greed * 1.0) + (traits.patience * 0.5);
    }

    // Gang/faction actions
    if (actionLower.includes('gang') || actionLower.includes('faction')) {
      multiplier *= 0.5 + (traits.loyalty * 1.5);
    }

    return Math.max(0.5, Math.min(2.0, multiplier));
  }

  /**
   * Check if an action matches personality preferences
   * Returns true if action is preferred, false if avoided, null if neutral
   */
  static matchesPreferences(action: string, preferences: PersonalityPreferences): boolean | null {
    const actionLower = action.toLowerCase();

    // Check if preferred
    for (const preferred of preferences.preferredActivities) {
      if (actionLower.includes(preferred.toLowerCase())) {
        return true;
      }
    }

    // Check if avoided
    for (const avoided of preferences.avoidedActivities) {
      if (actionLower.includes(avoided.toLowerCase())) {
        return false;
      }
    }

    // Neutral
    return null;
  }

  /**
   * Get all available archetypes
   */
  static getArchetypes(): string[] {
    return Object.keys(ARCHETYPES);
  }

  /**
   * Get archetype distribution for balanced testing
   * Returns count of each archetype for N total bots
   */
  static getBalancedDistribution(totalBots: number): Record<string, number> {
    const archetypes = this.getArchetypes();
    const baseCount = Math.floor(totalBots / archetypes.length);
    const remainder = totalBots % archetypes.length;

    const distribution: Record<string, number> = {};
    archetypes.forEach((archetype, index) => {
      distribution[archetype] = baseCount + (index < remainder ? 1 : 0);
    });

    return distribution;
  }
}

// ============================================================================
// DECISION-MAKING UTILITIES
// ============================================================================

/**
 * Determine if personality should take a risk based on risk level and traits
 * @param risk Risk level (0-1, where 1 is maximum risk)
 * @param traits Personality traits
 * @returns True if should take the risk
 */
export function shouldTakeRisk(risk: number, traits: PersonalityTraits): boolean {
  // Add some randomness (±0.2) to avoid completely deterministic behavior
  const randomFactor = (Math.random() - 0.5) * 0.4;
  const adjustedTolerance = Math.max(0, Math.min(1, traits.riskTolerance + randomFactor));

  return risk <= adjustedTolerance;
}

/**
 * Get probability of engaging in social interaction
 * @param traits Personality traits
 * @returns Probability (0-1) of social engagement
 */
export function getSocialEngagementChance(traits: PersonalityTraits): number {
  // Base chance on sociability, with some random variance
  const randomFactor = (Math.random() - 0.5) * 0.2;
  return Math.max(0, Math.min(1, traits.sociability + randomFactor));
}

/**
 * Get duration multiplier for an activity based on personality
 * @param activity Activity name/type
 * @param traits Personality traits
 * @returns Multiplier (0.5 to 2.0) for activity duration
 */
export function getActivityDurationMultiplier(activity: string, traits: PersonalityTraits): number {
  const activityLower = activity.toLowerCase();
  let multiplier = 1.0;

  // Patient personalities spend more time on activities
  multiplier *= 0.7 + (traits.patience * 0.6);

  // Curious personalities explore longer
  if (activityLower.includes('explore') || activityLower.includes('quest')) {
    multiplier *= 0.8 + (traits.curiosity * 0.4);
  }

  // Social personalities linger in social activities
  if (activityLower.includes('chat') || activityLower.includes('social')) {
    multiplier *= 0.8 + (traits.sociability * 0.4);
  }

  // Impatient personalities rush through
  if (traits.patience < 0.3) {
    multiplier *= 0.7;
  }

  return Math.max(0.5, Math.min(2.0, multiplier));
}

/**
 * Determine if personality will help another player
 * @param traits Personality traits
 * @param costToSelf Cost/inconvenience to self (0-1)
 * @returns True if willing to help
 */
export function willHelpOtherPlayer(traits: PersonalityTraits, costToSelf: number): boolean {
  // Altruistic (low greed) and social personalities more likely to help
  const helpfulness = (1 - traits.greed) * 0.6 + traits.sociability * 0.4;

  // Add random factor
  const randomFactor = (Math.random() - 0.5) * 0.3;
  const adjustedHelpfulness = Math.max(0, Math.min(1, helpfulness + randomFactor));

  return adjustedHelpfulness > costToSelf;
}

/**
 * Determine if personality will join a gang/faction
 * @param traits Personality traits
 * @param gangReputation Gang's reputation/prestige (0-1)
 * @returns True if willing to join
 */
export function willJoinGang(traits: PersonalityTraits, gangReputation: number): boolean {
  // Based on loyalty and sociability
  const joinThreshold = 0.5 - (traits.loyalty * 0.3) - (traits.sociability * 0.2);

  // Add random factor
  const randomFactor = (Math.random() - 0.5) * 0.2;
  const adjustedThreshold = Math.max(0, Math.min(1, joinThreshold + randomFactor));

  return gangReputation >= adjustedThreshold;
}

/**
 * Get chat message frequency multiplier
 * @param traits Personality traits
 * @returns Multiplier (0.1 to 3.0) for chat frequency
 */
export function getChatFrequencyMultiplier(traits: PersonalityTraits): number {
  // Highly social personalities chat much more
  if (traits.sociability > 0.8) {
    return 2.0 + (Math.random() * 1.0); // 2.0-3.0x
  } else if (traits.sociability > 0.5) {
    return 1.0 + (Math.random() * 1.0); // 1.0-2.0x
  } else if (traits.sociability > 0.3) {
    return 0.5 + (Math.random() * 0.5); // 0.5-1.0x
  } else {
    return 0.1 + (Math.random() * 0.4); // 0.1-0.5x
  }
}

/**
 * Determine preferred action from a list based on personality
 * @param availableActions List of available action names
 * @param profile Complete personality profile
 * @returns Preferred action name, or null if none preferred
 */
export function selectPreferredAction(
  availableActions: string[],
  profile: PersonalityProfile
): string | null {
  if (availableActions.length === 0) return null;

  // Chaos archetype: completely random
  if (profile.archetype === 'chaos') {
    return availableActions[Math.floor(Math.random() * availableActions.length)];
  }

  // Score each action
  const scoredActions = availableActions.map((action) => {
    let score = 1.0;

    // Preference bonus/penalty
    const prefMatch = PersonalitySystem.matchesPreferences(action, profile.preferences);
    if (prefMatch === true) {
      score *= 2.0;
    } else if (prefMatch === false) {
      score *= 0.3;
    }

    // Trait-based multiplier
    const traitMultiplier = PersonalitySystem.getActionMultiplier(action, profile.traits);
    score *= traitMultiplier;

    // Add small random factor to prevent determinism
    score *= 0.9 + (Math.random() * 0.2);

    return { action, score };
  });

  // Sort by score and return highest
  scoredActions.sort((a, b) => b.score - a.score);
  return scoredActions[0].action;
}

/**
 * Generate a random action sequence based on personality
 * Used for creating realistic behavior patterns
 * @param profile Personality profile
 * @param availableActions Pool of available actions
 * @param sequenceLength Number of actions to generate
 * @returns Array of action names
 */
export function generateActionSequence(
  profile: PersonalityProfile,
  availableActions: string[],
  sequenceLength: number
): string[] {
  const sequence: string[] = [];

  for (let i = 0; i < sequenceLength; i++) {
    let actionPool = [...availableActions];

    // Explorer: never repeat last action
    if (profile.archetype === 'explorer' && sequence.length > 0) {
      actionPool = actionPool.filter(a => a !== sequence[sequence.length - 1]);
    }

    // Grinder: high chance to repeat last action
    if (profile.archetype === 'grinder' && sequence.length > 0 && Math.random() < 0.7) {
      sequence.push(sequence[sequence.length - 1]);
      continue;
    }

    const action = selectPreferredAction(actionPool, profile);
    if (action) {
      sequence.push(action);
    }
  }

  return sequence;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default PersonalitySystem;
