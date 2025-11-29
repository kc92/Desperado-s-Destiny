/**
 * NPC Relationships Data
 *
 * Defines the web of relationships between NPCs across the game world
 * Part of Phase 3, Wave 3.1 - NPC Cross-references System
 */

import {
  NPCRelationship,
  RelationshipType,
  FamilyRelation,
  RelationshipCluster
} from '@desperados/shared';

/**
 * Red Gulch - Main Town Relationships
 */
export const RED_GULCH_RELATIONSHIPS: Partial<NPCRelationship>[] = [
  // Sheriff <-> Deputy
  {
    npcId: 'red-gulch-sheriff',
    relatedNpcId: 'red-gulch-deputy',
    relationshipType: RelationshipType.EMPLOYER,
    strength: 7,
    sentiment: 3,
    history: 'Sheriff Clayton hired the deputy three years ago. They work well together, though the deputy suspects his boss is corrupt.',
    canGossipAbout: true,
    gossipTrustRequired: 40,
    isPublic: true,
    isSecret: false
  },

  // Sheriff <-> Bartender (corrupt dealings)
  {
    npcId: 'red-gulch-sheriff',
    relatedNpcId: 'saloon-bartender',
    relationshipType: RelationshipType.INFORMANT,
    strength: 6,
    sentiment: 0,
    history: 'The sheriff pays Jake for information about what he hears in the saloon. A mutually beneficial arrangement.',
    canGossipAbout: false,
    gossipTrustRequired: 80,
    isPublic: false,
    isSecret: true,
    revealCondition: {
      npcTrustLevel: 70
    }
  },

  // Bartender <-> General Store Owner (friends)
  {
    npcId: 'saloon-bartender',
    relatedNpcId: 'general-store-owner',
    relationshipType: RelationshipType.FRIEND,
    strength: 6,
    sentiment: 5,
    history: 'Jake and Martha have been friends for years. They often share town gossip and look out for each other.',
    canGossipAbout: true,
    gossipTrustRequired: 20,
    isPublic: true,
    isSecret: false
  },

  // Blacksmith <-> General Store Owner (business rivals)
  {
    npcId: 'red-gulch-blacksmith',
    relatedNpcId: 'general-store-owner',
    relationshipType: RelationshipType.RIVAL,
    strength: 5,
    sentiment: -2,
    history: 'Competition for business has created tension. Both sell tools and supplies, leading to price wars.',
    canGossipAbout: true,
    gossipTrustRequired: 30,
    isPublic: true,
    isSecret: false,
    ongoingConflict: 'Price competition over farming tools'
  },

  // Doctor <-> Priest (allies helping the poor)
  {
    npcId: 'red-gulch-doctor',
    relatedNpcId: 'red-gulch-priest',
    relationshipType: RelationshipType.FRIEND,
    strength: 8,
    sentiment: 7,
    history: 'Dr. Morrison and Father Miguel work together to help the poor and sick. Deep mutual respect.',
    canGossipAbout: true,
    gossipTrustRequired: 20,
    isPublic: true,
    isSecret: false
  },

  // Bartender <-> Saloon Girl (employer/employee)
  {
    npcId: 'saloon-bartender',
    relatedNpcId: 'saloon-girl-ruby',
    relationshipType: RelationshipType.EMPLOYER,
    strength: 5,
    sentiment: 2,
    history: 'Jake employs Ruby at the saloon. Professional relationship, though he worries about her safety.',
    canGossipAbout: true,
    gossipTrustRequired: 40,
    isPublic: true,
    isSecret: false
  }
];

/**
 * Cross-Faction Relationships
 */
export const CROSS_FACTION_RELATIONSHIPS: Partial<NPCRelationship>[] = [
  // Sheriff <-> El Carnicero (enemies, history)
  {
    npcId: 'red-gulch-sheriff',
    relatedNpcId: 'frontera-boss',
    relationshipType: RelationshipType.ENEMY,
    strength: 9,
    sentiment: -8,
    history: 'Sheriff Clayton and El Carnicero have a violent past. Clayton killed El Carnicero\'s brother in a shootout ten years ago.',
    sharedSecrets: ['The shootout was staged', 'They both know who really runs the town'],
    canGossipAbout: true,
    gossipTrustRequired: 50,
    isPublic: true,
    isSecret: false,
    ongoingConflict: 'Blood feud from brother\'s death'
  },

  // Banker <-> Frontera Smuggler (secret criminal partnership)
  {
    npcId: 'red-gulch-banker',
    relatedNpcId: 'frontera-smuggler',
    relationshipType: RelationshipType.CRIMINAL_ASSOCIATE,
    strength: 7,
    sentiment: -2,
    history: 'The banker launders money for Frontera smugglers. He hates it but the profit is too good.',
    sharedSecrets: ['Money laundering operation', 'Secret ledgers', 'Smuggling routes'],
    canGossipAbout: false,
    gossipTrustRequired: 90,
    isPublic: false,
    isSecret: true,
    revealCondition: {
      questComplete: 'uncover-corruption',
      npcTrustLevel: 80
    }
  },

  // Priest <-> Nahi Shaman (respectful rivals)
  {
    npcId: 'red-gulch-priest',
    relatedNpcId: 'spirit-springs-shaman',
    relationshipType: RelationshipType.RIVAL,
    strength: 6,
    sentiment: 3,
    history: 'Father Miguel and the Shaman represent different faiths, but they respect each other\'s devotion and often discuss theology.',
    canGossipAbout: true,
    gossipTrustRequired: 40,
    isPublic: true,
    isSecret: false
  },

  // Merchant <-> Nahi Trader (business partners)
  {
    npcId: 'red-gulch-merchant',
    relatedNpcId: 'kaiowa-mesa-trader',
    relationshipType: RelationshipType.BUSINESS_PARTNER,
    strength: 7,
    sentiment: 5,
    history: 'They trade goods between settler and Nahi communities. A profitable and mutually beneficial partnership.',
    canGossipAbout: true,
    gossipTrustRequired: 30,
    isPublic: true,
    isSecret: false
  },

  // Medicine Woman <-> Doctor (professional respect)
  {
    npcId: 'medicine-woman',
    relatedNpcId: 'red-gulch-doctor',
    relationshipType: RelationshipType.RIVAL,
    strength: 5,
    sentiment: 2,
    history: 'Different healing traditions, but they\'ve consulted each other on difficult cases. Grudging respect.',
    canGossipAbout: true,
    gossipTrustRequired: 50,
    isPublic: true,
    isSecret: false
  }
];

/**
 * Family Group: The Morrison Family
 * Scattered across the territory
 */
export const MORRISON_FAMILY: Partial<NPCRelationship>[] = [
  // Jake Morrison (bartender) <-> Thomas Morrison (blacksmith in Dusty Flats)
  {
    npcId: 'saloon-bartender',
    relatedNpcId: 'dusty-flats-blacksmith',
    relationshipType: RelationshipType.FAMILY,
    familyRelation: FamilyRelation.SIBLING,
    strength: 7,
    sentiment: 6,
    history: 'Jake and Thomas are brothers. Jake left the forge to run the saloon, which caused tension, but they\'ve reconciled.',
    canGossipAbout: true,
    gossipTrustRequired: 20,
    isPublic: true,
    isSecret: false
  },

  // Jake Morrison <-> Sarah Morrison (doctor)
  {
    npcId: 'saloon-bartender',
    relatedNpcId: 'red-gulch-doctor',
    relationshipType: RelationshipType.FAMILY,
    familyRelation: FamilyRelation.SIBLING,
    strength: 8,
    sentiment: 8,
    history: 'Jake and Dr. Sarah Morrison are siblings. She\'s the responsible one, he\'s the black sheep. But they\'re very close.',
    canGossipAbout: true,
    gossipTrustRequired: 30,
    isPublic: true,
    isSecret: false
  },

  // Thomas Morrison <-> Sarah Morrison
  {
    npcId: 'dusty-flats-blacksmith',
    relatedNpcId: 'red-gulch-doctor',
    relationshipType: RelationshipType.FAMILY,
    familyRelation: FamilyRelation.SIBLING,
    strength: 6,
    sentiment: 4,
    history: 'Thomas and Sarah are siblings, though they see each other rarely due to distance.',
    canGossipAbout: true,
    gossipTrustRequired: 20,
    isPublic: true,
    isSecret: false
  },

  // Old Man Morrison (father, at Spirit Springs)
  {
    npcId: 'saloon-bartender',
    relatedNpcId: 'spirit-springs-elder',
    relationshipType: RelationshipType.FAMILY,
    familyRelation: FamilyRelation.PARENT,
    strength: 5,
    sentiment: 0,
    history: 'Jake\'s father disappeared years ago. Rumors say he lives with the Nahi at Spirit Springs, but Jake hasn\'t confirmed it.',
    canGossipAbout: false,
    gossipTrustRequired: 80,
    isPublic: false,
    isSecret: true,
    revealCondition: {
      npcTrustLevel: 70,
      questComplete: 'find-missing-father'
    },
    ongoingConflict: 'Father abandoned the family'
  }
];

/**
 * Family Group: The Martinez Family (Frontera faction)
 * Large extended family in the criminal underworld
 */
export const MARTINEZ_FAMILY: Partial<NPCRelationship>[] = [
  // El Carnicero <-> Rosa Martinez (sister)
  {
    npcId: 'frontera-boss',
    relatedNpcId: 'cantina-owner-rosa',
    relationshipType: RelationshipType.FAMILY,
    familyRelation: FamilyRelation.SIBLING,
    strength: 9,
    sentiment: 8,
    history: 'Rosa runs the cantina as a front for her brother\'s operations. Fiercely loyal family.',
    canGossipAbout: true,
    gossipTrustRequired: 40,
    isPublic: true,
    isSecret: false
  },

  // El Carnicero <-> Miguel Martinez (nephew)
  {
    npcId: 'frontera-boss',
    relatedNpcId: 'frontera-smuggler',
    relationshipType: RelationshipType.FAMILY,
    familyRelation: FamilyRelation.NEPHEW_NIECE,
    strength: 7,
    sentiment: 5,
    history: 'Miguel works as a smuggler for his uncle. He\'s loyal but wants to prove himself worthy.',
    canGossipAbout: true,
    gossipTrustRequired: 50,
    isPublic: false,
    isSecret: false
  },

  // Rosa Martinez <-> Miguel Martinez (cousin)
  {
    npcId: 'cantina-owner-rosa',
    relatedNpcId: 'frontera-smuggler',
    relationshipType: RelationshipType.FAMILY,
    familyRelation: FamilyRelation.COUSIN,
    strength: 6,
    sentiment: 4,
    history: 'Rosa and Miguel grew up together. She acts like an older sister, protective but critical.',
    canGossipAbout: true,
    gossipTrustRequired: 30,
    isPublic: true,
    isSecret: false
  },

  // El Carnicero <-> Dead Brother (backstory)
  {
    npcId: 'frontera-boss',
    relatedNpcId: 'deceased-carlos-martinez',
    relationshipType: RelationshipType.FAMILY,
    familyRelation: FamilyRelation.SIBLING,
    strength: 10,
    sentiment: 10,
    history: 'Carlos Martinez was killed by Sheriff Clayton. El Carnicero swore revenge and has been planning it for years.',
    sharedSecrets: ['The truth about the shootout'],
    canGossipAbout: true,
    gossipTrustRequired: 60,
    isPublic: true,
    isSecret: false,
    ongoingConflict: 'Seeking revenge for brother\'s death'
  }
];

/**
 * Family Group: The Chen Family (Immigrant settlers)
 * Business-focused family
 */
export const CHEN_FAMILY: Partial<NPCRelationship>[] = [
  // Martha Chen (store owner) <-> Wei Chen (laundry owner)
  {
    npcId: 'general-store-owner',
    relatedNpcId: 'red-gulch-laundry-owner',
    relationshipType: RelationshipType.FAMILY,
    familyRelation: FamilyRelation.SPOUSE,
    strength: 9,
    sentiment: 9,
    history: 'Martha and Wei Chen are married. They run separate businesses but support each other completely.',
    canGossipAbout: true,
    gossipTrustRequired: 20,
    isPublic: true,
    isSecret: false
  },

  // Martha Chen <-> Li Chen (daughter)
  {
    npcId: 'general-store-owner',
    relatedNpcId: 'telegraph-operator-li',
    relationshipType: RelationshipType.FAMILY,
    familyRelation: FamilyRelation.CHILD,
    strength: 10,
    sentiment: 10,
    history: 'Li is Martha and Wei\'s daughter. She works at the telegraph office. They\'re incredibly proud of her.',
    canGossipAbout: true,
    gossipTrustRequired: 20,
    isPublic: true,
    isSecret: false
  },

  // Wei Chen <-> Li Chen
  {
    npcId: 'red-gulch-laundry-owner',
    relatedNpcId: 'telegraph-operator-li',
    relationshipType: RelationshipType.FAMILY,
    familyRelation: FamilyRelation.CHILD,
    strength: 10,
    sentiment: 10,
    history: 'Wei is extremely protective of his daughter Li. He taught her to be independent and strong.',
    canGossipAbout: true,
    gossipTrustRequired: 20,
    isPublic: true,
    isSecret: false
  }
];

/**
 * Rivalry Network: Red Gulch Gang Politics
 */
export const GANG_RIVALRIES: Partial<NPCRelationship>[] = [
  // Frontera Boss <-> Outlaw Gang Leader
  {
    npcId: 'frontera-boss',
    relatedNpcId: 'outlaw-gang-leader',
    relationshipType: RelationshipType.ENEMY,
    strength: 8,
    sentiment: -9,
    history: 'Competing for territory and influence. Violent clashes are common.',
    canGossipAbout: true,
    gossipTrustRequired: 30,
    isPublic: true,
    isSecret: false,
    ongoingConflict: 'Territory war in Badlands'
  },

  // Gang Enforcer <-> Sheriff Deputy
  {
    npcId: 'frontera-enforcer',
    relatedNpcId: 'red-gulch-deputy',
    relationshipType: RelationshipType.ENEMY,
    strength: 6,
    sentiment: -6,
    history: 'The deputy arrested the enforcer twice. Personal vendetta has developed.',
    canGossipAbout: true,
    gossipTrustRequired: 40,
    isPublic: true,
    isSecret: false
  }
];

/**
 * Criminal Conspiracy Network: The Shadow Syndicate
 * Secret criminal organization across factions
 */
export const SHADOW_SYNDICATE: Partial<NPCRelationship>[] = [
  // Banker <-> Corrupt Mayor
  {
    npcId: 'red-gulch-banker',
    relatedNpcId: 'red-gulch-mayor',
    relationshipType: RelationshipType.CRIMINAL_ASSOCIATE,
    strength: 8,
    sentiment: -3,
    history: 'The mayor and banker are both part of a secret conspiracy. They hate each other but need each other.',
    sharedSecrets: ['Embezzlement scheme', 'Town fund theft', 'Bribery network'],
    canGossipAbout: false,
    gossipTrustRequired: 95,
    isPublic: false,
    isSecret: true,
    revealCondition: {
      questComplete: 'uncover-conspiracy',
      itemRequired: 'secret-ledger'
    }
  },

  // Corrupt Mayor <-> Land Baron
  {
    npcId: 'red-gulch-mayor',
    relatedNpcId: 'land-baron-wickham',
    relationshipType: RelationshipType.CRIMINAL_ASSOCIATE,
    strength: 7,
    sentiment: 2,
    history: 'The mayor helps the land baron acquire property through dubious means. Corruption at its finest.',
    sharedSecrets: ['Land grab scheme', 'Forged deeds'],
    canGossipAbout: false,
    gossipTrustRequired: 90,
    isPublic: false,
    isSecret: true,
    revealCondition: {
      questComplete: 'uncover-conspiracy'
    }
  },

  // Banker <-> Frontera Smuggler (already defined above)
  // This completes the triangle of corruption
];

/**
 * Romantic Relationships (some secret)
 */
export const ROMANTIC_RELATIONSHIPS: Partial<NPCRelationship>[] = [
  // Saloon Girl <-> Deputy (secret romance)
  {
    npcId: 'saloon-girl-ruby',
    relatedNpcId: 'red-gulch-deputy',
    relationshipType: RelationshipType.LOVER,
    strength: 8,
    sentiment: 9,
    history: 'Ruby and the deputy are in love but keep it secret due to her profession and his position.',
    canGossipAbout: false,
    gossipTrustRequired: 85,
    isPublic: false,
    isSecret: true,
    revealCondition: {
      npcTrustLevel: 75
    }
  },

  // Blacksmith <-> Store Owner (secret past)
  {
    npcId: 'red-gulch-blacksmith',
    relatedNpcId: 'general-store-owner',
    relationshipType: RelationshipType.FORMER_LOVER,
    strength: 4,
    sentiment: -3,
    history: 'Before Martha married Wei, she and the blacksmith were courting. It ended badly, adding to their business rivalry.',
    canGossipAbout: false,
    gossipTrustRequired: 80,
    isPublic: false,
    isSecret: true,
    revealCondition: {
      npcTrustLevel: 70
    }
  }
];

/**
 * All relationships combined
 */
export const ALL_NPC_RELATIONSHIPS: Partial<NPCRelationship>[] = [
  ...RED_GULCH_RELATIONSHIPS,
  ...CROSS_FACTION_RELATIONSHIPS,
  ...MORRISON_FAMILY,
  ...MARTINEZ_FAMILY,
  ...CHEN_FAMILY,
  ...GANG_RIVALRIES,
  ...SHADOW_SYNDICATE,
  ...ROMANTIC_RELATIONSHIPS
];

/**
 * Relationship clusters for network visualization
 */
export const RELATIONSHIP_CLUSTERS: RelationshipCluster[] = [
  {
    id: 'morrison-family',
    name: 'Morrison Family',
    type: 'family',
    npcIds: [
      'saloon-bartender',
      'dusty-flats-blacksmith',
      'red-gulch-doctor',
      'spirit-springs-elder'
    ],
    centralNpcId: 'saloon-bartender',
    description: 'A settler family scattered across the territory with a mysterious patriarch.',
    isSecret: false
  },
  {
    id: 'martinez-family',
    name: 'Martinez Family',
    type: 'family',
    npcIds: [
      'frontera-boss',
      'cantina-owner-rosa',
      'frontera-smuggler',
      'deceased-carlos-martinez'
    ],
    centralNpcId: 'frontera-boss',
    description: 'A powerful Frontera crime family with deep roots in the underworld.',
    isSecret: false
  },
  {
    id: 'chen-family',
    name: 'Chen Family',
    type: 'family',
    npcIds: [
      'general-store-owner',
      'red-gulch-laundry-owner',
      'telegraph-operator-li'
    ],
    centralNpcId: 'general-store-owner',
    description: 'An immigrant family that built successful businesses through hard work.',
    isSecret: false
  },
  {
    id: 'shadow-syndicate',
    name: 'Shadow Syndicate',
    type: 'criminal',
    npcIds: [
      'red-gulch-banker',
      'red-gulch-mayor',
      'land-baron-wickham',
      'frontera-smuggler'
    ],
    centralNpcId: 'red-gulch-banker',
    description: 'A secret criminal conspiracy of corrupt officials and outlaws.',
    isSecret: true
  },
  {
    id: 'red-gulch-establishment',
    name: 'Red Gulch Establishment',
    type: 'social',
    npcIds: [
      'saloon-bartender',
      'general-store-owner',
      'red-gulch-doctor',
      'red-gulch-priest'
    ],
    description: 'The respectable business owners and professionals of Red Gulch.',
    isSecret: false
  },
  {
    id: 'frontera-gang',
    name: 'Frontera Gang',
    type: 'criminal',
    npcIds: [
      'frontera-boss',
      'frontera-enforcer',
      'frontera-smuggler',
      'cantina-owner-rosa'
    ],
    centralNpcId: 'frontera-boss',
    description: 'The dominant criminal organization in the southern territories.',
    isSecret: false
  },
  {
    id: 'cross-cultural-alliance',
    name: 'Cross-Cultural Alliance',
    type: 'political',
    npcIds: [
      'red-gulch-priest',
      'spirit-springs-shaman',
      'medicine-woman',
      'red-gulch-merchant',
      'kaiowa-mesa-trader'
    ],
    description: 'NPCs who bridge the divide between settler, Nahi, and Frontera cultures.',
    isSecret: false
  }
];

/**
 * Helper function to get total relationship count
 */
export function getRelationshipCount(): number {
  return ALL_NPC_RELATIONSHIPS.length;
}

/**
 * Helper function to get cluster count
 */
export function getClusterCount(): number {
  return RELATIONSHIP_CLUSTERS.length;
}

/**
 * Helper function to get relationships by NPC ID
 */
export function getRelationshipsByNPC(npcId: string): Partial<NPCRelationship>[] {
  return ALL_NPC_RELATIONSHIPS.filter(
    rel => rel.npcId === npcId || rel.relatedNpcId === npcId
  );
}
