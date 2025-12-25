/**
 * Railroad Tycoons - NPC Antagonist Faction
 * Phase 19.2: Greenhorn's Trail
 *
 * The Railroad Tycoons represent Eastern industrial interests
 * seeking to expand into Sangre Territory. They are an antagonist
 * faction that all players can oppose regardless of their main faction.
 *
 * Key Characters:
 * - Cornelius Vandermeer III: Head of the Pacific & Sangre Railroad
 * - Henry Blackwood: Chief Land Acquisitions Officer
 * - The Board of Directors (unnamed, but influential)
 *
 * Goals:
 * - Build the trans-territorial railroad
 * - Acquire land by any means necessary
 * - Eliminate opposition through legal and illegal means
 * - Establish monopoly control over territory commerce
 */

// =============================================================================
// FACTION DATA
// =============================================================================

export interface RailroadTycoonsFaction {
  id: string;
  name: string;
  shortName: string;
  description: string;
  lore: string;
  headquarters: string;
  threatLevel: 'low' | 'medium' | 'high' | 'extreme';
  isPlayable: boolean;
  isAntagonist: boolean;

  // Leadership
  leaders: RailroadLeader[];

  // Resources and power
  resources: {
    capital: string;
    manpower: string;
    influence: string;
    technology: string;
  };

  // Relationships with other factions
  relationships: {
    settlerAlliance: FactionRelationship;
    nahiCoalition: FactionRelationship;
    frontera: FactionRelationship;
  };

  // Gameplay mechanics
  mechanics: {
    reputationRange: [number, number];
    defaultReputation: number;
    hostileThreshold: number;
    questLines: string[];
    bossEncounters: string[];
  };
}

export interface RailroadLeader {
  id: string;
  name: string;
  title: string;
  description: string;
  personality: string;
  dangerLevel: number; // 1-10
  location: string;
}

export interface FactionRelationship {
  status: 'hostile' | 'tense' | 'neutral' | 'allied';
  description: string;
  modifiers: {
    reputation: number;
    commerce: number;
    military: number;
  };
}

// =============================================================================
// RAILROAD TYCOONS FACTION DEFINITION
// =============================================================================

export const RAILROAD_TYCOONS: RailroadTycoonsFaction = {
  id: 'railroad_tycoons',
  name: 'Pacific & Sangre Railroad Company',
  shortName: 'Railroad Tycoons',
  description:
    'Eastern industrial magnates seeking to extend their railroad empire into Sangre Territory. ' +
    'They bring money, technology, and a ruthless determination to succeed at any cost.',
  lore:
    'The Pacific & Sangre Railroad Company was chartered in 1867 with a mandate to connect the ' +
    'coastal cities to the rich interior of Sangre Territory. Led by Cornelius Vandermeer III, ' +
    'a third-generation railroad baron, the company has unlimited capital and political backing. ' +
    'What they lack is local cooperation. The settlers see them as carpetbaggers, the Nahi see ' +
    'them as land thieves, and the Frontera sees them as competition. Vandermeer doesn\'t care. ' +
    'He\'ll build his railroad through the territory - over bodies if necessary.',
  headquarters: 'Railroad Camp Alpha',
  threatLevel: 'high',
  isPlayable: false,
  isAntagonist: true,

  leaders: [
    {
      id: 'cornelius_vandermeer',
      name: 'Cornelius Vandermeer III',
      title: 'President & Chairman',
      description:
        'A cold, calculating businessman who views the territory as a business problem to be solved. ' +
        'Never seen without his tailored suit and gold pocket watch.',
      personality: 'ruthless, strategic, patient',
      dangerLevel: 9,
      location: 'Railroad Camp Alpha'
    },
    {
      id: 'henry_blackwood',
      name: 'Henry Blackwood',
      title: 'Chief Land Acquisitions Officer',
      description:
        'The man who does the dirty work. Blackwood is known for making landowners "offers they can\'t refuse." ' +
        'Rumors say he has connections to the Pinkerton Agency.',
      personality: 'threatening, efficient, amoral',
      dangerLevel: 8,
      location: 'Various'
    },
    {
      id: 'captain_miles_sterling',
      name: 'Captain Miles Sterling',
      title: 'Head of Railroad Security',
      description:
        'A former Union Army officer who commands the railroad\'s private army. ' +
        'Trained soldiers, modern weapons, and zero tolerance for opposition.',
      personality: 'militaristic, disciplined, brutal',
      dangerLevel: 7,
      location: 'Security Compound'
    }
  ],

  resources: {
    capital: 'Unlimited - backed by Eastern banks and investors',
    manpower: 'Thousands of workers, plus private security force',
    influence: 'Strong in Washington D.C. and territorial government',
    technology: 'Most advanced in the territory - telegraphs, explosives, steel'
  },

  relationships: {
    settlerAlliance: {
      status: 'tense',
      description:
        'The settlers initially welcomed the railroad as progress, but land seizures and ' +
        'broken promises have soured relations. Some settlers still support the railroad ' +
        'for economic reasons.',
      modifiers: {
        reputation: -10,
        commerce: 20,
        military: -5
      }
    },
    nahiCoalition: {
      status: 'hostile',
      description:
        'The railroad threatens sacred lands and traditional hunting grounds. ' +
        'The Nahi have declared the railroad an enemy of the people. ' +
        'Raids on railroad camps are common.',
      modifiers: {
        reputation: -50,
        commerce: -30,
        military: -20
      }
    },
    frontera: {
      status: 'tense',
      description:
        'The Frontera sees the railroad as both threat and opportunity. ' +
        'Some work for the railroad, others sabotage it. The relationship is complicated.',
      modifiers: {
        reputation: -5,
        commerce: 10,
        military: 0
      }
    }
  },

  mechanics: {
    reputationRange: [-100, 50], // Can never be fully allied
    defaultReputation: 0,
    hostileThreshold: -25,
    questLines: [
      'war-prologue:railroad-arrives',
      'war-prologue:railroad-demands',
      'war-prologue:railroad-retaliation'
    ],
    bossEncounters: [
      'boss_railroad_enforcer',
      'boss_pinkerton_captain'
    ]
  }
};

// =============================================================================
// SERVICE CLASS
// =============================================================================

export class RailroadTycoonsService {
  /**
   * Get the Railroad Tycoons faction data
   */
  static getFaction(): RailroadTycoonsFaction {
    return RAILROAD_TYCOONS;
  }

  /**
   * Get a specific leader
   */
  static getLeader(leaderId: string): RailroadLeader | undefined {
    return RAILROAD_TYCOONS.leaders.find(l => l.id === leaderId);
  }

  /**
   * Get relationship with a player faction
   */
  static getRelationship(
    playerFaction: 'settlerAlliance' | 'nahiCoalition' | 'frontera'
  ): FactionRelationship {
    return RAILROAD_TYCOONS.relationships[playerFaction];
  }

  /**
   * Check if player is hostile with Railroad Tycoons
   */
  static isHostile(railroadReputation: number): boolean {
    return railroadReputation <= RAILROAD_TYCOONS.mechanics.hostileThreshold;
  }

  /**
   * Get reputation modifier for player actions against railroad
   */
  static getReputationModifier(
    action: 'sabotage' | 'combat' | 'negotiation' | 'theft'
  ): { railroad: number; settler: number; nahi: number; frontera: number } {
    switch (action) {
      case 'sabotage':
        return { railroad: -20, settler: -5, nahi: 10, frontera: 5 };
      case 'combat':
        return { railroad: -15, settler: -3, nahi: 8, frontera: 3 };
      case 'negotiation':
        return { railroad: 5, settler: 2, nahi: -5, frontera: 0 };
      case 'theft':
        return { railroad: -10, settler: -5, nahi: 5, frontera: 10 };
      default:
        return { railroad: 0, settler: 0, nahi: 0, frontera: 0 };
    }
  }

  /**
   * Get threat level description
   */
  static getThreatDescription(): string {
    const threat = RAILROAD_TYCOONS.threatLevel;
    switch (threat) {
      case 'low':
        return 'The railroad has minimal presence in this area.';
      case 'medium':
        return 'Railroad surveyors and scouts are active nearby.';
      case 'high':
        return 'Railroad construction crews and security forces are operating in force.';
      case 'extreme':
        return 'The railroad has declared martial law. All non-employees are considered trespassers.';
      default:
        return 'Unknown threat level.';
    }
  }
}
