/**
 * Nahi Coalition Tribes - Sub-factions
 * Phase 19.2: Greenhorn's Trail
 *
 * The Nahi Coalition is not a monolithic faction - it consists of 5 distinct
 * tribes with their own cultures, goals, and relationships. Some tribes are
 * peaceful traditionalists, others are fierce warriors who threaten even
 * other native peoples.
 *
 * The Five Tribes:
 * 1. Kaiowa - Spiritual leaders, peaceful traditionalists (existing in game)
 * 2. Comanche Raiders - Horse warriors, raid settlers AND other tribes
 * 3. Pueblo Traders - Merchants and craftsmen, neutral diplomats
 * 4. Apache War Band - Fierce guerrilla fighters, most hostile to outsiders
 * 5. Plains Hunters - Buffalo hunters, caught between old ways and new
 *
 * Internal Coalition Politics:
 * - Tribes 2 and 4 (Raiders, War Band) are threats to other natives too
 * - This creates internal coalition tension and player choice
 * - Some quests pit tribes against each other
 */

// =============================================================================
// TYPES
// =============================================================================

export interface NahiTribe {
  id: string;
  name: string;
  shortName: string;
  description: string;
  culture: string;
  territory: string;
  population: string;

  // Alignment
  alignment: 'peaceful' | 'neutral' | 'aggressive' | 'hostile';
  threatToOutsiders: number; // 1-10
  threatToOtherNatives: number; // 1-10

  // Leadership
  leader: {
    name: string;
    title: string;
    description: string;
    personality: string;
  };

  // Strengths and specialties
  specialties: string[];
  tradingGoods: string[];
  militaryStrength: 'weak' | 'moderate' | 'strong' | 'elite';

  // Relationships with other tribes
  tribeRelationships: {
    [tribeId: string]: TribeRelationship;
  };

  // Gameplay
  mechanics: {
    questLines: string[];
    uniqueItems: string[];
    reputationBonuses: string[];
  };
}

export interface TribeRelationship {
  status: 'hostile' | 'tense' | 'neutral' | 'friendly' | 'allied';
  description: string;
  historicalReason: string;
}

// =============================================================================
// THE FIVE TRIBES
// =============================================================================

const KAIOWA: NahiTribe = {
  id: 'kaiowa',
  name: 'Kaiowa People',
  shortName: 'Kaiowa',
  description:
    'The spiritual heart of the Nahi Coalition. The Kaiowa are keepers of sacred traditions, ' +
    'medicine men, and the moral compass of the native peoples.',
  culture:
    'Deeply spiritual people who believe the land itself is sacred. They practice ancient ' +
    'rituals, maintain the sacred sites, and serve as mediators between tribes.',
  territory: 'Kaiowa Mesa and surrounding sacred lands',
  population: 'Approximately 3,000',

  alignment: 'peaceful',
  threatToOutsiders: 2,
  threatToOtherNatives: 1,

  leader: {
    name: 'Soaring Eagle',
    title: 'Elder Shaman',
    description:
      'A wise elder who has guided the Kaiowa for thirty years. Known for his visions ' +
      'and his ability to see the truth in people\'s hearts.',
    personality: 'wise, patient, spiritual, stern when needed'
  },

  specialties: [
    'Spiritual ceremonies',
    'Healing and medicine',
    'Prophecy and divination',
    'Diplomatic mediation'
  ],
  tradingGoods: ['Sacred herbs', 'Spiritual charms', 'Healing remedies', 'Ceremonial items'],
  militaryStrength: 'weak',

  tribeRelationships: {
    comanche_raiders: {
      status: 'tense',
      description: 'The Kaiowa disapprove of the Raiders\' violence but respect their strength.',
      historicalReason: 'Generations of attempting to moderate Raider aggression.'
    },
    pueblo_traders: {
      status: 'allied',
      description: 'Close allies who share peaceful values and trade extensively.',
      historicalReason: 'Ancient alliance dating back centuries.'
    },
    apache_war_band: {
      status: 'hostile',
      description: 'The War Band has attacked Kaiowa sacred sites. Open conflict exists.',
      historicalReason: 'The War Band considers the Kaiowa weak and unworthy of respect.'
    },
    plains_hunters: {
      status: 'friendly',
      description: 'The Hunters often seek Kaiowa spiritual guidance.',
      historicalReason: 'Traditional relationship of hunters seeking blessings for the hunt.'
    }
  },

  mechanics: {
    questLines: ['npc:kaiowa-elder:skinwalker-hunt', 'npc:kaiowa-elder:sacred-ritual'],
    uniqueItems: ['sacred-sage', 'spirit-vision-token', 'sacred-war-paint'],
    reputationBonuses: ['Spirit +10%', 'Healing effectiveness +15%']
  }
};

const COMANCHE_RAIDERS: NahiTribe = {
  id: 'comanche_raiders',
  name: 'Comanche Raiders',
  shortName: 'Raiders',
  description:
    'Fearsome horse warriors who believe in taking what they need from anyone - settler, ' +
    'Mexican, or even other native tribes. Respected for their riding skills, feared for their raids.',
  culture:
    'A warrior culture that values strength, horsemanship, and boldness. They raid for ' +
    'survival and glory, seeing no dishonor in taking from the weak.',
  territory: 'Nomadic - range across the entire southern territory',
  population: 'Approximately 2,500 (plus 5,000+ horses)',

  alignment: 'aggressive',
  threatToOutsiders: 9,
  threatToOtherNatives: 6,

  leader: {
    name: 'Iron Horse',
    title: 'War Chief',
    description:
      'A legendary horse warrior who has never lost a raid. Said to have stolen ' +
      'over a thousand horses in his lifetime. Respected even by enemies.',
    personality: 'proud, aggressive, honorable in his own way, pragmatic'
  },

  specialties: [
    'Horseback combat',
    'Lightning raids',
    'Horse breeding and training',
    'Desert survival'
  ],
  tradingGoods: ['Horses', 'Stolen goods', 'Leather goods', 'Weapons'],
  militaryStrength: 'elite',

  tribeRelationships: {
    kaiowa: {
      status: 'tense',
      description: 'The Raiders tolerate the Kaiowa but see them as soft.',
      historicalReason: 'Kaiowa spiritual authority commands grudging respect.'
    },
    pueblo_traders: {
      status: 'neutral',
      description: 'Occasional trading partners, occasional targets.',
      historicalReason: 'Pragmatic relationship based on mutual benefit.'
    },
    apache_war_band: {
      status: 'tense',
      description: 'Rival warriors who sometimes clash over territory.',
      historicalReason: 'Competition for raiding grounds and glory.'
    },
    plains_hunters: {
      status: 'hostile',
      description: 'The Raiders frequently steal from Hunter camps.',
      historicalReason: 'Hunters have valuable supplies and are easy targets.'
    }
  },

  mechanics: {
    questLines: ['war-prologue:native-concerns'],
    uniqueItems: ['raider-horse', 'comanche-bow', 'war-paint'],
    reputationBonuses: ['Mounted combat +20%', 'Raid success +15%']
  }
};

const PUEBLO_TRADERS: NahiTribe = {
  id: 'pueblo_traders',
  name: 'Pueblo Trading Clans',
  shortName: 'Traders',
  description:
    'Skilled merchants and craftsmen who have traded with all peoples for generations. ' +
    'They maintain neutrality and serve as diplomats and intermediaries.',
  culture:
    'A settled people who build permanent adobe towns. They value commerce, craftsmanship, ' +
    'and peaceful relations. Their neutrality makes them trusted by all sides.',
  territory: 'Pueblo Town and surrounding agricultural lands',
  population: 'Approximately 4,000',

  alignment: 'neutral',
  threatToOutsiders: 1,
  threatToOtherNatives: 1,

  leader: {
    name: 'Walking Between',
    title: 'Trade Master',
    description:
      'A shrewd negotiator who speaks five languages and has brokered peace deals ' +
      'between enemies. Known for her fairness and cunning.',
    personality: 'diplomatic, shrewd, patient, fair-minded'
  },

  specialties: [
    'Trade and commerce',
    'Pottery and crafts',
    'Agriculture',
    'Diplomacy and negotiation'
  ],
  tradingGoods: ['Pottery', 'Turquoise jewelry', 'Woven blankets', 'Crops and food'],
  militaryStrength: 'weak',

  tribeRelationships: {
    kaiowa: {
      status: 'allied',
      description: 'Long-standing alliance with shared peaceful values.',
      historicalReason: 'Centuries of trade and mutual respect.'
    },
    comanche_raiders: {
      status: 'neutral',
      description: 'Trade with Raiders but keep them at arm\'s length.',
      historicalReason: 'Pragmatic relationship - Raiders need goods, Traders need peace.'
    },
    apache_war_band: {
      status: 'tense',
      description: 'The War Band has threatened Pueblo towns but not attacked... yet.',
      historicalReason: 'War Band sees Traders as collaborators with outsiders.'
    },
    plains_hunters: {
      status: 'friendly',
      description: 'Regular trading partners with mutual respect.',
      historicalReason: 'Hunters trade meat and hides for crops and tools.'
    }
  },

  mechanics: {
    questLines: ['side:native-artifact'],
    uniqueItems: ['pueblo-pottery', 'turquoise-amulet', 'trade-blanket'],
    reputationBonuses: ['Trading prices -10%', 'Diplomacy success +15%']
  }
};

const APACHE_WAR_BAND: NahiTribe = {
  id: 'apache_war_band',
  name: 'Apache War Band',
  shortName: 'War Band',
  description:
    'The most hostile and aggressive of the native groups. The War Band believes in total ' +
    'war against all outsiders AND against natives who collaborate with them.',
  culture:
    'A culture of resistance and revenge. The War Band formed after a massacre by settlers ' +
    'and has sworn to drive all outsiders from the territory - by any means necessary.',
  territory: 'Hidden camps in the mountains and desert',
  population: 'Approximately 800 warriors (no non-combatants)',

  alignment: 'hostile',
  threatToOutsiders: 10,
  threatToOtherNatives: 8,

  leader: {
    name: 'Burning Sky',
    title: 'Supreme War Leader',
    description:
      'A scarred veteran who lost his entire family to settler violence. He has sworn ' +
      'to never stop fighting until every outsider is dead or gone.',
    personality: 'ruthless, vengeful, charismatic, utterly committed'
  },

  specialties: [
    'Guerrilla warfare',
    'Ambush tactics',
    'Torture and intimidation',
    'Desert survival'
  ],
  tradingGoods: [], // They don't trade - they take
  militaryStrength: 'elite',

  tribeRelationships: {
    kaiowa: {
      status: 'hostile',
      description: 'The War Band considers the Kaiowa traitors for speaking with outsiders.',
      historicalReason: 'Burning Sky demanded all-out war; Kaiowa refused.'
    },
    comanche_raiders: {
      status: 'tense',
      description: 'Rival warriors who sometimes cooperate against common enemies.',
      historicalReason: 'Respect for each other\'s fighting ability, but different goals.'
    },
    pueblo_traders: {
      status: 'tense',
      description: 'The War Band threatens Traders who deal with outsiders.',
      historicalReason: 'Sees trading as collaboration with the enemy.'
    },
    plains_hunters: {
      status: 'hostile',
      description: 'The War Band has attacked Hunter camps for harboring settlers.',
      historicalReason: 'Hunters have been known to help lost travelers.'
    }
  },

  mechanics: {
    questLines: ['war-prologue:tribal-council'],
    uniqueItems: ['war-band-mask', 'poison-arrow', 'scalping-knife'],
    reputationBonuses: ['Guerrilla tactics +25%', 'Intimidation +30%']
  }
};

const PLAINS_HUNTERS: NahiTribe = {
  id: 'plains_hunters',
  name: 'Plains Hunting Bands',
  shortName: 'Hunters',
  description:
    'Traditional buffalo hunters who follow the herds across the plains. They are caught ' +
    'between the old ways and the encroaching new world, unsure of their future.',
  culture:
    'A nomadic people whose entire way of life depends on the buffalo. As the herds ' +
    'shrink, they face an existential crisis - adapt or die.',
  territory: 'Nomadic - follow the buffalo herds across the northern plains',
  population: 'Approximately 3,500',

  alignment: 'neutral',
  threatToOutsiders: 4,
  threatToOtherNatives: 2,

  leader: {
    name: 'Gray Buffalo',
    title: 'Hunt Leader',
    description:
      'An aging hunter who remembers when the herds stretched to the horizon. ' +
      'He struggles to lead his people in a world that no longer makes sense.',
    personality: 'weary, wise, conflicted, pragmatic'
  },

  specialties: [
    'Hunting and tracking',
    'Buffalo processing',
    'Leatherworking',
    'Plains survival'
  ],
  tradingGoods: ['Buffalo hides', 'Pemmican', 'Bone tools', 'Leather goods'],
  militaryStrength: 'moderate',

  tribeRelationships: {
    kaiowa: {
      status: 'friendly',
      description: 'Hunters seek Kaiowa blessings for successful hunts.',
      historicalReason: 'Traditional spiritual relationship.'
    },
    comanche_raiders: {
      status: 'hostile',
      description: 'Hunters hate the Raiders who steal from their camps.',
      historicalReason: 'Generations of raiding and counter-raiding.'
    },
    pueblo_traders: {
      status: 'friendly',
      description: 'Good trading partners who exchange meat for crops.',
      historicalReason: 'Mutually beneficial trade relationship.'
    },
    apache_war_band: {
      status: 'hostile',
      description: 'The War Band attacks Hunters for helping lost settlers.',
      historicalReason: 'Hunters sometimes guide travelers, which War Band considers treason.'
    }
  },

  mechanics: {
    questLines: ['tutorial:hunting-basics'],
    uniqueItems: ['buffalo-cloak', 'hunting-charm', 'pemmican'],
    reputationBonuses: ['Hunting yield +20%', 'Tracking +15%']
  }
};

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const NAHI_TRIBES: { [key: string]: NahiTribe } = {
  kaiowa: KAIOWA,
  comanche_raiders: COMANCHE_RAIDERS,
  pueblo_traders: PUEBLO_TRADERS,
  apache_war_band: APACHE_WAR_BAND,
  plains_hunters: PLAINS_HUNTERS
};

// =============================================================================
// SERVICE CLASS
// =============================================================================

export class NahiTribesService {
  /**
   * Get all tribes
   */
  static getAllTribes(): NahiTribe[] {
    return Object.values(NAHI_TRIBES);
  }

  /**
   * Get a specific tribe
   */
  static getTribe(tribeId: string): NahiTribe | undefined {
    return NAHI_TRIBES[tribeId];
  }

  /**
   * Get tribes by alignment
   */
  static getTribesByAlignment(alignment: NahiTribe['alignment']): NahiTribe[] {
    return Object.values(NAHI_TRIBES).filter(t => t.alignment === alignment);
  }

  /**
   * Get peaceful tribes (threat to natives < 3)
   */
  static getPeacefulTribes(): NahiTribe[] {
    return Object.values(NAHI_TRIBES).filter(t => t.threatToOtherNatives < 3);
  }

  /**
   * Get hostile tribes (threat to natives >= 5)
   */
  static getHostileTribes(): NahiTribe[] {
    return Object.values(NAHI_TRIBES).filter(t => t.threatToOtherNatives >= 5);
  }

  /**
   * Get relationship between two tribes
   */
  static getTribeRelationship(
    tribe1Id: string,
    tribe2Id: string
  ): TribeRelationship | undefined {
    const tribe1 = NAHI_TRIBES[tribe1Id];
    if (!tribe1) return undefined;
    return tribe1.tribeRelationships[tribe2Id];
  }

  /**
   * Check if two tribes are hostile
   */
  static areTribesHostile(tribe1Id: string, tribe2Id: string): boolean {
    const relationship = this.getTribeRelationship(tribe1Id, tribe2Id);
    return relationship?.status === 'hostile';
  }

  /**
   * Get all hostile pairs (tribes that are hostile to each other)
   */
  static getHostilePairs(): Array<[string, string]> {
    const pairs: Array<[string, string]> = [];
    const tribeIds = Object.keys(NAHI_TRIBES);

    for (let i = 0; i < tribeIds.length; i++) {
      for (let j = i + 1; j < tribeIds.length; j++) {
        if (this.areTribesHostile(tribeIds[i], tribeIds[j])) {
          pairs.push([tribeIds[i], tribeIds[j]]);
        }
      }
    }

    return pairs;
  }

  /**
   * Get tribe reputation modifiers for player actions
   */
  static getReputationModifiers(
    tribeId: string,
    action: 'help' | 'attack' | 'trade' | 'betray'
  ): { [key: string]: number } {
    const tribe = NAHI_TRIBES[tribeId];
    if (!tribe) return {};

    const modifiers: { [key: string]: number } = {};

    // Base effect on target tribe
    switch (action) {
      case 'help':
        modifiers[tribeId] = 15;
        // Allied tribes get bonus
        Object.entries(tribe.tribeRelationships).forEach(([otherId, rel]) => {
          if (rel.status === 'allied') modifiers[otherId] = 5;
          else if (rel.status === 'hostile') modifiers[otherId] = -5;
        });
        break;
      case 'attack':
        modifiers[tribeId] = -25;
        // Allied tribes get angry
        Object.entries(tribe.tribeRelationships).forEach(([otherId, rel]) => {
          if (rel.status === 'allied') modifiers[otherId] = -10;
          else if (rel.status === 'hostile') modifiers[otherId] = 5;
        });
        break;
      case 'trade':
        modifiers[tribeId] = 5;
        break;
      case 'betray':
        modifiers[tribeId] = -50;
        // Everyone loses trust
        Object.keys(tribe.tribeRelationships).forEach(otherId => {
          modifiers[otherId] = -10;
        });
        break;
    }

    return modifiers;
  }

  /**
   * Get coalition unity score (how unified the Nahi Coalition is)
   * Lower score = more internal conflict
   */
  static getCoalitionUnityScore(): number {
    let totalRelationships = 0;
    let hostileRelationships = 0;

    const tribeIds = Object.keys(NAHI_TRIBES);
    for (const tribeId of tribeIds) {
      const tribe = NAHI_TRIBES[tribeId];
      Object.values(tribe.tribeRelationships).forEach(rel => {
        totalRelationships++;
        if (rel.status === 'hostile') hostileRelationships++;
      });
    }

    // 100 = fully unified, 0 = completely fractured
    return Math.round(100 * (1 - hostileRelationships / totalRelationships));
  }
}
