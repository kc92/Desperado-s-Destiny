import { ReactionPattern, ReactionType, GossipTopic } from '@desperados/shared';

/**
 * NPC REACTION PATTERNS
 * Defines how different NPC types react to news, gossip, and events
 */

export const REACTION_PATTERNS: ReactionPattern[] = [
  // ============================================================================
  // FEAR REACTIONS
  // ============================================================================
  {
    id: 'fear_notorious_criminal',
    name: 'Fear of Notorious Criminal',
    description: 'Civilian NPCs fear player with high criminal notoriety',

    triggers: [
      {
        triggerType: 'player_nearby',
        conditions: {
          topic: ['crime', 'combat', 'death'],
          sentiment: ['negative'],
          minNotorietyImpact: 50
        }
      },
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['crime', 'death'],
          sentiment: ['negative', 'shocking'],
          minTruthfulness: 40
        }
      }
    ],

    reactionType: 'fear',
    intensityFormula: 'notoriety * 0.8',

    behaviors: [
      {
        type: 'flee',
        params: {}
      },
      {
        type: 'refuse_service',
        params: {
          dialogueSet: 'fearful'
        }
      }
    ],

    npcTypes: ['civilian', 'shopkeeper', 'bartender'],
    minNotoriety: 50
  },

  {
    id: 'fear_supernatural',
    name: 'Fear of Supernatural',
    description: 'NPCs fear supernatural events or cursed individuals',

    triggers: [
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['supernatural'],
          sentiment: ['shocking', 'negative'],
          minTruthfulness: 20 // Even rumors cause fear
        }
      }
    ],

    reactionType: 'fear',
    intensityFormula: '(100 - truthfulness) * 0.5 + 50', // Less truth = more fear

    behaviors: [
      {
        type: 'flee',
        params: {}
      },
      {
        type: 'refuse_service',
        params: {
          dialogueSet: 'superstitious_fear'
        }
      }
    ],

    npcTypes: ['civilian', 'religious', 'settler']
  },

  {
    id: 'fear_gang_war',
    name: 'Fear of Gang War',
    description: 'NPCs fear violence when gangs are at war',

    triggers: [
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['gang', 'faction', 'combat'],
          sentiment: ['negative', 'shocking']
        }
      }
    ],

    reactionType: 'nervousness',
    intensityFormula: 'notorietyImpact',

    behaviors: [
      {
        type: 'price_increase',
        params: {
          priceModifier: 1.2,
          dialogueSet: 'nervous'
        }
      },
      {
        type: 'limit_service',
        params: {
          itemsRefused: ['weapons', 'ammunition']
        }
      }
    ],

    npcTypes: ['shopkeeper', 'bartender', 'civilian']
  },

  // ============================================================================
  // RESPECT REACTIONS
  // ============================================================================
  {
    id: 'respect_hero',
    name: 'Respect for Hero',
    description: 'NPCs respect player with heroic reputation',

    triggers: [
      {
        triggerType: 'player_nearby',
        conditions: {
          topic: ['heroism', 'combat'],
          sentiment: ['positive']
        }
      },
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['heroism'],
          sentiment: ['positive'],
          minTruthfulness: 60
        }
      }
    ],

    reactionType: 'respect',
    intensityFormula: 'notorietyImpact * 0.7',

    behaviors: [
      {
        type: 'discount',
        params: {
          priceModifier: 0.9,
          dialogueSet: 'respectful'
        }
      },
      {
        type: 'tip',
        params: {
          tipContent: 'helpful_information'
        }
      }
    ],

    npcTypes: ['civilian', 'shopkeeper', 'bartender', 'settler'],
    minNotoriety: 30
  },

  {
    id: 'respect_faction_champion',
    name: 'Respect for Faction Champion',
    description: 'Faction NPCs respect their champion',

    triggers: [
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['faction', 'combat', 'heroism'],
          sentiment: ['positive']
        }
      }
    ],

    reactionType: 'respect',
    intensityFormula: 'notorietyImpact',

    behaviors: [
      {
        type: 'discount',
        params: {
          priceModifier: 0.85,
          dialogueSet: 'faction_loyal'
        }
      },
      {
        type: 'tip',
        params: {
          tipContent: 'faction_secrets'
        }
      }
    ],

    npcTypes: ['faction_member'],
    requiredFaction: 'player_faction'
  },

  {
    id: 'respect_wealthy',
    name: 'Respect for Wealth',
    description: 'Business NPCs respect wealthy individuals',

    triggers: [
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['business', 'treasure'],
          sentiment: ['positive']
        }
      }
    ],

    reactionType: 'respect',
    intensityFormula: 'notorietyImpact * 0.6',

    behaviors: [
      {
        type: 'gossip',
        params: {
          dialogueSet: 'business_opportunities'
        }
      }
    ],

    npcTypes: ['shopkeeper', 'banker', 'businessman']
  },

  // ============================================================================
  // HOSTILITY REACTIONS
  // ============================================================================
  {
    id: 'hostile_enemy_faction',
    name: 'Hostility to Enemy Faction',
    description: 'Faction NPCs are hostile to enemy faction members',

    triggers: [
      {
        triggerType: 'player_nearby',
        conditions: {
          topic: ['faction'],
          sentiment: ['negative']
        }
      },
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['faction', 'combat'],
          sentiment: ['negative']
        }
      }
    ],

    reactionType: 'hostility',
    intensityFormula: 'notorietyImpact * 0.9',

    behaviors: [
      {
        type: 'refuse_service',
        params: {
          dialogueSet: 'enemy_faction'
        }
      },
      {
        type: 'call_law',
        params: {}
      }
    ],

    npcTypes: ['faction_member'],
    excludedFaction: 'player_faction'
  },

  {
    id: 'hostile_lawman',
    name: 'Lawman Hostility',
    description: 'Lawmen are hostile to known criminals',

    triggers: [
      {
        triggerType: 'player_nearby',
        conditions: {
          topic: ['crime', 'law'],
          sentiment: ['negative']
        }
      },
      {
        triggerType: 'article_read',
        conditions: {
          topic: ['crime'],
          sentiment: ['negative'],
          minTruthfulness: 50
        }
      }
    ],

    reactionType: 'hostility',
    intensityFormula: 'notoriety',

    behaviors: [
      {
        type: 'call_law',
        params: {
          dialogueSet: 'lawman_suspicious'
        }
      }
    ],

    npcTypes: ['lawman', 'sheriff', 'deputy'],
    minNotoriety: 40
  },

  {
    id: 'hostile_victim_family',
    name: 'Hostile Victim Family',
    description: 'Family of victims are hostile to perpetrators',

    triggers: [
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['death', 'crime'],
          sentiment: ['negative']
        }
      }
    ],

    reactionType: 'hostility',
    intensityFormula: '100', // Maximum hostility

    behaviors: [
      {
        type: 'attack',
        params: {
          dialogueSet: 'vengeance'
        }
      },
      {
        type: 'refuse_service',
        params: {}
      }
    ],

    npcTypes: ['civilian', 'family_member']
  },

  // ============================================================================
  // CURIOSITY REACTIONS
  // ============================================================================
  {
    id: 'curious_legend',
    name: 'Curiosity About Legend',
    description: 'NPCs are curious about legendary figures',

    triggers: [
      {
        triggerType: 'player_nearby',
        conditions: {
          topic: ['combat', 'heroism', 'treasure', 'supernatural'],
          sentiment: ['positive', 'shocking']
        }
      },
      {
        triggerType: 'gossip_heard',
        conditions: {
          minNotorietyImpact: 70
        }
      }
    ],

    reactionType: 'curiosity',
    intensityFormula: 'notorietyImpact * 0.8',

    behaviors: [
      {
        type: 'question',
        params: {
          dialogueSet: 'curious_questions'
        }
      },
      {
        type: 'gather',
        params: {}
      }
    ],

    npcTypes: ['civilian', 'bartender', 'journalist'],
    minNotoriety: 60
  },

  {
    id: 'curious_supernatural',
    name: 'Curiosity About Supernatural',
    description: 'Certain NPCs are curious about weird events',

    triggers: [
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['supernatural'],
          sentiment: ['shocking', 'neutral']
        }
      }
    ],

    reactionType: 'curiosity',
    intensityFormula: '(100 - truthfulness) * 0.7 + 30',

    behaviors: [
      {
        type: 'question',
        params: {
          dialogueSet: 'supernatural_questions'
        }
      },
      {
        type: 'gossip',
        params: {
          dialogueSet: 'supernatural_theories'
        }
      }
    ],

    npcTypes: ['scholar', 'journalist', 'mystic', 'shaman']
  },

  {
    id: 'curious_romance',
    name: 'Curiosity About Romance',
    description: 'NPCs love gossip about romance and scandal',

    triggers: [
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['romance', 'scandal'],
          sentiment: ['positive', 'shocking']
        }
      }
    ],

    reactionType: 'curiosity',
    intensityFormula: 'notorietyImpact * 0.5 + 30',

    behaviors: [
      {
        type: 'gossip',
        params: {
          dialogueSet: 'romance_gossip'
        }
      },
      {
        type: 'question',
        params: {
          dialogueSet: 'romance_questions'
        }
      }
    ],

    npcTypes: ['civilian', 'bartender', 'shopkeeper']
  },

  // ============================================================================
  // ADMIRATION REACTIONS
  // ============================================================================
  {
    id: 'admire_duelist',
    name: 'Admiration for Duelist',
    description: 'NPCs admire skilled duelists',

    triggers: [
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['duel', 'combat'],
          sentiment: ['positive']
        }
      }
    ],

    reactionType: 'admiration',
    intensityFormula: 'notorietyImpact * 0.7',

    behaviors: [
      {
        type: 'gather',
        params: {}
      },
      {
        type: 'question',
        params: {
          dialogueSet: 'combat_admiration'
        }
      }
    ],

    npcTypes: ['civilian', 'gunslinger', 'gambler']
  },

  {
    id: 'admire_outlaw',
    name: 'Criminal Admiration',
    description: 'Criminal NPCs admire successful outlaws',

    triggers: [
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['crime', 'gang'],
          sentiment: ['positive', 'shocking']
        }
      }
    ],

    reactionType: 'admiration',
    intensityFormula: 'notorietyImpact * 0.8',

    behaviors: [
      {
        type: 'discount',
        params: {
          priceModifier: 0.9,
          dialogueSet: 'criminal_respect'
        }
      },
      {
        type: 'tip',
        params: {
          tipContent: 'criminal_opportunities'
        }
      }
    ],

    npcTypes: ['criminal', 'fence', 'outlaw'],
    minNotoriety: 50
  },

  // ============================================================================
  // NERVOUSNESS REACTIONS
  // ============================================================================
  {
    id: 'nervous_territory_unstable',
    name: 'Nervousness About Territory',
    description: 'NPCs are nervous when territory is unstable',

    triggers: [
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['territory', 'faction', 'gang'],
          sentiment: ['negative', 'shocking']
        }
      }
    ],

    reactionType: 'nervousness',
    intensityFormula: 'notorietyImpact * 0.6',

    behaviors: [
      {
        type: 'price_increase',
        params: {
          priceModifier: 1.15,
          dialogueSet: 'nervous'
        }
      },
      {
        type: 'limit_service',
        params: {
          dialogueSet: 'closing_soon'
        }
      }
    ],

    npcTypes: ['shopkeeper', 'civilian']
  },

  {
    id: 'nervous_crime_wave',
    name: 'Nervousness About Crime',
    description: 'NPCs are nervous during crime waves',

    triggers: [
      {
        triggerType: 'article_read',
        conditions: {
          topic: ['crime', 'law'],
          sentiment: ['negative']
        }
      },
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['crime'],
          sentiment: ['negative', 'shocking'],
          minNotorietyImpact: 40
        }
      }
    ],

    reactionType: 'nervousness',
    intensityFormula: 'notorietyImpact * 0.7',

    behaviors: [
      {
        type: 'limit_service',
        params: {
          dialogueSet: 'cautious'
        }
      }
    ],

    npcTypes: ['civilian', 'shopkeeper', 'bartender']
  },

  // ============================================================================
  // DISGUST REACTIONS
  // ============================================================================
  {
    id: 'disgust_dishonorable',
    name: 'Disgust at Dishonorable Behavior',
    description: 'Honor-bound NPCs are disgusted by dishonorable acts',

    triggers: [
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['crime', 'scandal'],
          sentiment: ['negative']
        }
      }
    ],

    reactionType: 'disgust',
    intensityFormula: 'notorietyImpact * 0.8',

    behaviors: [
      {
        type: 'refuse_service',
        params: {
          dialogueSet: 'disgusted'
        }
      }
    ],

    npcTypes: ['gunslinger', 'lawman', 'military']
  },

  // ============================================================================
  // AMUSEMENT REACTIONS
  // ============================================================================
  {
    id: 'amused_scandal',
    name: 'Amusement at Scandal',
    description: 'NPCs find scandals amusing',

    triggers: [
      {
        triggerType: 'gossip_heard',
        conditions: {
          topic: ['scandal', 'romance'],
          sentiment: ['shocking', 'neutral']
        }
      }
    ],

    reactionType: 'amusement',
    intensityFormula: 'notorietyImpact * 0.4 + 30',

    behaviors: [
      {
        type: 'gossip',
        params: {
          dialogueSet: 'amused_gossip'
        }
      }
    ],

    npcTypes: ['bartender', 'gambler', 'civilian']
  }
];

/**
 * Get reaction pattern by ID
 */
export function getReactionPattern(id: string): ReactionPattern | undefined {
  return REACTION_PATTERNS.find(p => p.id === id);
}

/**
 * Get reaction patterns for NPC type
 */
export function getReactionPatternsForNPC(npcType: string): ReactionPattern[] {
  return REACTION_PATTERNS.filter(p => p.npcTypes.includes(npcType));
}

/**
 * Get reaction patterns by reaction type
 */
export function getReactionPatternsByType(reactionType: ReactionType): ReactionPattern[] {
  return REACTION_PATTERNS.filter(p => p.reactionType === reactionType);
}
