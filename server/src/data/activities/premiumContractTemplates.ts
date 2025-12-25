/**
 * Premium Contract Templates
 * High-value, faction-impacting contracts for L35+ characters
 *
 * Sprint 7: Mid-Game Content - Contracts Board (L35 unlock)
 */

import { ContractType, ContractDifficulty, SkillRequirement, SkillXpReward } from '../../models/DailyContract.model';

// =============================================================================
// TYPES
// =============================================================================

export interface PremiumContractTemplate {
  id: string;
  type: ContractType;
  titleTemplate: string;
  descriptionTemplate: string;
  targetType: 'npc' | 'location' | 'faction' | 'mystery';
  difficulty: ContractDifficulty;
  baseProgressMax: number;
  levelScaling: boolean;
  baseRewards: {
    gold: number;
    xp: number;
  };
  levelRequired: number;
  factionImpact: Record<string, number>;
  cooldownHours: number;
  energyCost: number;
  multiPhase: boolean;
  requiredSkills: SkillRequirement[];
  skillXpRewards?: SkillXpReward[];
  flavorText: string;
}

export interface MysteryTemplate {
  id: string;
  name: string;
  description: string;
}

export interface TargetNPCTemplate {
  id: string;
  name: string;
  title: string;
  location: string;
}

export interface TargetLocationTemplate {
  id: string;
  name: string;
  type: string;
}

// =============================================================================
// PREMIUM CONTRACT TEMPLATES
// =============================================================================

export const PREMIUM_CONTRACT_TEMPLATES: PremiumContractTemplate[] = [
  {
    id: 'premium_assassination',
    type: 'combat',
    titleTemplate: 'Eliminate {TARGET_NAME}',
    descriptionTemplate: 'A powerful figure wants {TARGET_NAME} permanently removed from the equation. {TARGET_TITLE} has made too many enemies, and someone is finally paying to settle the score. This is dark work, but pays handsomely.',
    targetType: 'npc',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 10000, xp: 2000 },
    levelRequired: 35,
    factionImpact: { frontera: 25, settlerAlliance: -50, nahiCoalition: -25 },
    cooldownHours: 72,
    energyCost: 50,
    multiPhase: false,
    requiredSkills: [{ skillId: 'firearms', minLevel: 10 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 100 }],
    flavorText: 'Some problems can only be solved with lead.'
  },

  {
    id: 'premium_witness_escort',
    type: 'delivery',
    titleTemplate: 'Escort {TARGET_NAME} to {LOCATION}',
    descriptionTemplate: 'A key witness needs safe passage to testify against the {FACTION} interests in {LOCATION}. Expect resistance along the way. {TARGET_NAME} knows secrets that could shake the territory.',
    targetType: 'npc',
    difficulty: 'hard',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 8000, xp: 1500 },
    levelRequired: 35,
    factionImpact: { settlerAlliance: 50, frontera: -50, nahiCoalition: 0 },
    cooldownHours: 48,
    energyCost: 40,
    multiPhase: true,
    requiredSkills: [{ skillId: 'riding', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'riding', amount: 75 }, { skillId: 'firearms', amount: 50 }],
    flavorText: 'The road is long and full of those who want your cargo silenced.'
  },

  {
    id: 'premium_investigation',
    type: 'investigation',
    titleTemplate: 'Investigate: {MYSTERY}',
    descriptionTemplate: 'Uncover the truth behind {MYSTERY}. Gather evidence, interrogate witnesses, and piece together what really happened. The truth may be dangerous, but someone needs to find it.',
    targetType: 'mystery',
    difficulty: 'hard',
    baseProgressMax: 5,
    levelScaling: false,
    baseRewards: { gold: 12000, xp: 2500 },
    levelRequired: 38,
    factionImpact: {},
    cooldownHours: 96,
    energyCost: 60,
    multiPhase: true,
    requiredSkills: [{ skillId: 'investigation', minLevel: 12 }],
    skillXpRewards: [{ skillId: 'investigation', amount: 150 }],
    flavorText: 'Every trail has an end. Finding it is the hard part.'
  },

  {
    id: 'premium_sabotage',
    type: 'crime',
    titleTemplate: 'Sabotage {TARGET_LOCATION}',
    descriptionTemplate: 'Destroy critical infrastructure at {TARGET_LOCATION} to cripple operations there. This will have lasting consequences for the region and those who depend on it. No collateral damage... unless necessary.',
    targetType: 'location',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 20000, xp: 4000 },
    levelRequired: 40,
    factionImpact: { frontera: 100, settlerAlliance: -100, nahiCoalition: -50 },
    cooldownHours: 168,
    energyCost: 80,
    multiPhase: false,
    requiredSkills: [
      { skillId: 'explosives', minLevel: 15 },
      { skillId: 'stealth', minLevel: 10 }
    ],
    skillXpRewards: [{ skillId: 'explosives', amount: 200 }, { skillId: 'stealth', amount: 100 }],
    flavorText: 'Some things are worth burning down.'
  },

  {
    id: 'premium_treaty_negotiation',
    type: 'social',
    titleTemplate: 'Broker Peace: {FACTION_A} and {FACTION_B}',
    descriptionTemplate: 'Use your influence to negotiate a delicate truce between {FACTION_A} and {FACTION_B}. Both sides have legitimate grievances, and both are armed to the teeth. Success brings prestige; failure brings war.',
    targetType: 'faction',
    difficulty: 'hard',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 15000, xp: 3500 },
    levelRequired: 42,
    factionImpact: {},
    cooldownHours: 120,
    energyCost: 70,
    multiPhase: true,
    requiredSkills: [{ skillId: 'persuasion', minLevel: 15 }],
    skillXpRewards: [{ skillId: 'persuasion', amount: 175 }],
    flavorText: 'Peace is harder to forge than war.'
  },

  {
    id: 'premium_heist_coordination',
    type: 'crime',
    titleTemplate: 'Coordinate the {TARGET_LOCATION} Heist',
    descriptionTemplate: 'Plan and execute a complex heist operation at {TARGET_LOCATION}. This requires careful planning, a reliable crew, and nerves of steel. The score will be legendary... if you pull it off.',
    targetType: 'location',
    difficulty: 'hard',
    baseProgressMax: 4,
    levelScaling: false,
    baseRewards: { gold: 25000, xp: 5000 },
    levelRequired: 45,
    factionImpact: { frontera: 75, settlerAlliance: -75, nahiCoalition: 0 },
    cooldownHours: 168,
    energyCost: 100,
    multiPhase: true,
    requiredSkills: [
      { skillId: 'leadership', minLevel: 12 },
      { skillId: 'lockpicking', minLevel: 15 }
    ],
    skillXpRewards: [{ skillId: 'leadership', amount: 200 }, { skillId: 'lockpicking', amount: 150 }],
    flavorText: 'Fortune favors the bold and the prepared.'
  }
];

// =============================================================================
// MYSTERY TEMPLATES (for investigation contracts)
// =============================================================================

export const MYSTERY_TEMPLATES: MysteryTemplate[] = [
  {
    id: 'murder_at_saloon',
    name: 'Murder at the Dusty Rose',
    description: 'A prominent businessman was found dead in a back room. Everyone has an alibi, but someone is lying.'
  },
  {
    id: 'smuggling_ring',
    name: 'The Smuggling Ring',
    description: 'Contraband is flowing through the territory. Trace the network back to its source.'
  },
  {
    id: 'corrupt_sheriff',
    name: 'The Corrupt Lawman',
    description: 'Someone in the Sheriff\'s office is on the take. Find out who before they find out about you.'
  },
  {
    id: 'missing_gold_shipment',
    name: 'The Missing Gold Shipment',
    description: 'A Wells Fargo shipment vanished between stations. $50,000 in gold doesn\'t just disappear.'
  },
  {
    id: 'ghost_town_secrets',
    name: 'Ghost Town Secrets',
    description: 'The abandoned mining town of Desolation holds dark secrets. Find out what drove everyone away.'
  },
  {
    id: 'double_agent',
    name: 'The Double Agent',
    description: 'There\'s a mole in the organization. Someone is selling information to the enemy.'
  },
  {
    id: 'disappearing_miners',
    name: 'The Disappearing Miners',
    description: 'Miners are vanishing from the Silver Creek operation. Accidents... or something worse?'
  },
  {
    id: 'railroad_sabotage',
    name: 'Railroad Sabotage',
    description: 'Someone is systematically sabotaging the railroad expansion. Find them before another train derails.'
  }
];

// =============================================================================
// TARGET NPC TEMPLATES
// =============================================================================

export const TARGET_NPC_TEMPLATES: TargetNPCTemplate[] = [
  { id: 'corrupt_banker', name: 'Marcus Whitfield', title: 'the corrupt banker', location: 'First Frontier Bank' },
  { id: 'gang_leader', name: 'Black Jack Devereux', title: 'the notorious gang leader', location: 'Devil\'s Canyon' },
  { id: 'land_baron', name: 'Cornelius Hawthorn', title: 'the ruthless land baron', location: 'Hawthorn Estate' },
  { id: 'mine_owner', name: 'Victor Sterling', title: 'the mining magnate', location: 'Sterling Mining Co.' },
  { id: 'saloon_owner', name: 'Madame Scarlett', title: 'the information broker', location: 'The Gilded Lily' },
  { id: 'railroad_exec', name: 'Theodore Crane', title: 'the railroad executive', location: 'Union Pacific HQ' },
  { id: 'wanted_outlaw', name: 'El Diablo', title: 'the most wanted outlaw', location: 'unknown' },
  { id: 'spy', name: 'The Phantom', title: 'the elusive spy', location: 'various' }
];

// =============================================================================
// TARGET LOCATION TEMPLATES
// =============================================================================

export const TARGET_LOCATION_TEMPLATES: TargetLocationTemplate[] = [
  { id: 'bank_vault', name: 'First Frontier Bank Vault', type: 'bank' },
  { id: 'train_depot', name: 'Central Junction Depot', type: 'railroad' },
  { id: 'mining_operation', name: 'Sterling Silver Mine', type: 'mine' },
  { id: 'military_outpost', name: 'Fort Defiance', type: 'military' },
  { id: 'wealthy_estate', name: 'Hawthorn Manor', type: 'estate' },
  { id: 'smuggler_warehouse', name: 'The Hidden Warehouse', type: 'warehouse' },
  { id: 'telegraph_office', name: 'Western Union Station', type: 'communication' },
  { id: 'assay_office', name: 'Government Assay Office', type: 'government' }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a premium contract template by ID
 */
export function getPremiumContractTemplate(templateId: string): PremiumContractTemplate | undefined {
  return PREMIUM_CONTRACT_TEMPLATES.find(t => t.id === templateId);
}

/**
 * Get available premium contracts for a character level
 */
export function getAvailablePremiumContracts(level: number): PremiumContractTemplate[] {
  return PREMIUM_CONTRACT_TEMPLATES.filter(t => level >= t.levelRequired);
}

/**
 * Get a random mystery for investigation contracts
 */
export function getRandomMystery(): MysteryTemplate {
  const index = Math.floor(Math.random() * MYSTERY_TEMPLATES.length);
  return MYSTERY_TEMPLATES[index];
}

/**
 * Get a random target NPC
 */
export function getRandomTargetNPC(): TargetNPCTemplate {
  const index = Math.floor(Math.random() * TARGET_NPC_TEMPLATES.length);
  return TARGET_NPC_TEMPLATES[index];
}

/**
 * Get a random target location
 */
export function getRandomTargetLocation(): TargetLocationTemplate {
  const index = Math.floor(Math.random() * TARGET_LOCATION_TEMPLATES.length);
  return TARGET_LOCATION_TEMPLATES[index];
}

/**
 * Get faction pairs for treaty negotiations
 */
export function getRandomFactionPair(): { factionA: string; factionB: string } {
  const factions = ['Settler Alliance', 'Nahi Coalition', 'Frontera'];
  const a = Math.floor(Math.random() * factions.length);
  let b = Math.floor(Math.random() * factions.length);
  while (b === a) {
    b = Math.floor(Math.random() * factions.length);
  }
  return { factionA: factions[a], factionB: factions[b] };
}

/**
 * Fill in template placeholders for a premium contract
 */
export function fillContractTemplate(template: PremiumContractTemplate): {
  title: string;
  description: string;
  targetName?: string;
  targetLocation?: string;
} {
  let title = template.titleTemplate;
  let description = template.descriptionTemplate;
  let targetName: string | undefined;
  let targetLocation: string | undefined;

  switch (template.targetType) {
    case 'npc': {
      const npc = getRandomTargetNPC();
      targetName = npc.name;
      targetLocation = npc.location;
      title = title.replace('{TARGET_NAME}', npc.name);
      description = description
        .replace('{TARGET_NAME}', npc.name)
        .replace('{TARGET_TITLE}', npc.title);
      break;
    }
    case 'location': {
      const location = getRandomTargetLocation();
      targetLocation = location.name;
      title = title.replace('{TARGET_LOCATION}', location.name);
      description = description.replace('{TARGET_LOCATION}', location.name);
      break;
    }
    case 'mystery': {
      const mystery = getRandomMystery();
      title = title.replace('{MYSTERY}', mystery.name);
      description = description.replace('{MYSTERY}', mystery.name);
      break;
    }
    case 'faction': {
      const factions = getRandomFactionPair();
      title = title
        .replace('{FACTION_A}', factions.factionA)
        .replace('{FACTION_B}', factions.factionB);
      description = description
        .replace('{FACTION_A}', factions.factionA)
        .replace('{FACTION_B}', factions.factionB);
      break;
    }
  }

  // Clean up any remaining placeholders
  title = title.replace(/{[^}]+}/g, '');
  description = description.replace(/{[^}]+}/g, '');

  return { title, description, targetName, targetLocation };
}
