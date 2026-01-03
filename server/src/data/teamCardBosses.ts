/**
 * Team Card Game Raid Bosses
 * Definitions for supernatural opponents in The Devil's Table raids
 */

import {
  RaidBoss,
  TeamCardBossPhase,
  BossMechanic,
  BossMechanicType,
  MechanicDuration,
  RaidDifficulty,
  TeamCardGameType,
  RaidRewards,
  Suit
} from '@desperados/shared';

// =============================================================================
// BOSS DEFINITIONS
// =============================================================================

/**
 * Black-Hat Morgan - The Mississippi Cardsharp
 * Euchre/Spades specialist boss
 */
export const BLACK_HAT_MORGAN: RaidBoss = {
  id: 'black_hat_morgan',
  name: 'Black-Hat Morgan',
  title: 'The Mississippi Cardsharp',
  description: 'A legendary cheater whose ghost haunts saloon back rooms. They say he sold his soul for the perfect hand.',
  lore: `Morgan was the most infamous card cheat on the Mississippi riverboats in the 1850s.
  He won and lost fortunes with marked decks and cold deals. When a rival caught him
  cheating and shot him dead, his spirit refused to pass on. Now he deals eternal games
  at the Devil's Table, forever seeking one honest victory.`,
  difficulty: RaidDifficulty.HARD,
  health: 500,
  gameTypes: [TeamCardGameType.EUCHRE, TeamCardGameType.SPADES],
  minimumGamblingSkill: 30,
  locationId: 'saloon_back_room',
  phases: [
    {
      healthThreshold: 100,
      name: 'Shuffle the Odds',
      description: 'Morgan begins with subtle manipulation',
      mechanics: [
        {
          id: 'marked_deck',
          name: 'Marked Deck',
          description: 'Morgan can see one random card in each player\'s hand',
          type: BossMechanicType.INFORMATION,
          duration: MechanicDuration.ROUND,
          effect: { revealRandomCard: true },
          counterplay: {
            skill: 'duel_instinct',
            threshold: 40,
            effect: 'negate'
          },
          announcement: 'Morgan squints at your cards... he sees something!'
        }
      ]
    },
    {
      healthThreshold: 50,
      name: 'Cold Deck',
      description: 'Morgan brings out his tricks',
      mechanics: [
        {
          id: 'cold_deck',
          name: 'Cold Deck',
          description: 'Morgan swaps the kitty with a favorable hand (Euchre only)',
          type: BossMechanicType.CARD_MANIPULATION,
          duration: MechanicDuration.ROUND,
          effect: { manipulateKitty: true },
          counterplay: {
            skill: 'sleight_of_hand',
            threshold: 45,
            effect: 'reverse'
          },
          announcement: 'Morgan\'s hands blur as he switches the deck!'
        },
        {
          id: 'time_pressure_1',
          name: 'Speed Deal',
          description: 'Turn timer reduced by 5 seconds',
          type: BossMechanicType.TIME_PRESSURE,
          duration: MechanicDuration.GAME,
          effect: { turnTimeOverride: 25 },
          announcement: 'Morgan deals faster... keep up or fold!'
        }
      ]
    },
    {
      healthThreshold: 25,
      name: 'Final Hand',
      description: 'Morgan goes all in',
      mechanics: [
        {
          id: 'all_in',
          name: 'All In',
          description: 'Double or nothing - next round worth 2x points for both sides',
          type: BossMechanicType.SCORE_MODIFIER,
          duration: MechanicDuration.ROUND,
          effect: { scoreMultiplier: 2 },
          announcement: 'Morgan slams the table: "ALL IN! Double stakes!"'
        },
        {
          id: 'card_swap',
          name: 'Card Switch',
          description: 'Morgan swaps one card between opposing players',
          type: BossMechanicType.CARD_MANIPULATION,
          duration: MechanicDuration.ROUND,
          effect: { swapCards: true },
          counterplay: {
            skill: 'duel_instinct',
            threshold: 50,
            teamwork: true,
            effect: 'negate'
          },
          announcement: 'A card vanishes from your hand and reappears elsewhere!'
        }
      ]
    }
  ],
  rewards: {
    goldBase: 500,
    experienceBase: 200,
    lootTable: 'legendary_gambling_gear',
    uniqueReward: 'black_hat_morgans_deck',
    skillXP: {
      gambling: 50,
      duel_instinct: 25
    }
  }
};

/**
 * Lady Luck - Fortune's Fickle Mistress
 * Spades specialist boss
 */
export const LADY_LUCK: RaidBoss = {
  id: 'lady_luck',
  name: 'Lady Luck',
  title: 'Fortune\'s Fickle Mistress',
  description: 'A capricious spirit who toys with probability itself. She grants fortune and takes it away on a whim.',
  lore: `Some say she\'s the spirit of every gambler who died at the tables. Others claim she\'s
  a trickster goddess from the old country. Whatever she is, Lady Luck appears to those who
  wager too much, offering games where the odds themselves become uncertain.`,
  difficulty: RaidDifficulty.VERY_HARD,
  health: 750,
  gameTypes: [TeamCardGameType.SPADES, TeamCardGameType.BRIDGE],
  minimumGamblingSkill: 45,
  locationId: 'railroad_car',
  phases: [
    {
      healthThreshold: 100,
      name: 'Wheel of Fortune',
      description: 'Luck herself enters the game',
      mechanics: [
        {
          id: 'random_trump',
          name: 'Chaos Trump',
          description: 'In Bridge: Trump suit changes randomly each trick',
          type: BossMechanicType.TRICK_MODIFIER,
          duration: MechanicDuration.ROUND,
          effect: { randomTrumpPerTrick: true },
          announcement: 'Lady Luck giggles as the rules shift and change!'
        }
      ]
    },
    {
      healthThreshold: 60,
      name: 'Snake Eyes',
      description: 'Fortune turns against the players',
      mechanics: [
        {
          id: 'cursed_hand',
          name: 'Cursed Hand',
          description: 'The weakest skilled player draws only low cards next round',
          type: BossMechanicType.HAND_CURSE,
          duration: MechanicDuration.ROUND,
          effect: { targetLowestSkill: true },
          counterplay: {
            teamwork: true,
            shareCards: 1,
            effect: 'reduce'
          },
          announcement: 'Lady Luck frowns at the weakest player... their cards turn to ash!'
        },
        {
          id: 'bid_interference',
          name: 'Fortune\'s Whim',
          description: 'All bids must be adjusted by ±1 from intended',
          type: BossMechanicType.TRICK_MODIFIER,
          duration: MechanicDuration.ROUND,
          effect: {},
          announcement: 'Your bids slip and slide... nothing is certain!'
        }
      ]
    },
    {
      healthThreshold: 30,
      name: 'All Bets Off',
      description: 'Lady Luck grows impatient',
      mechanics: [
        {
          id: 'time_crunch',
          name: 'Clock\'s Ticking',
          description: 'Turn timer reduced to 15 seconds',
          type: BossMechanicType.TIME_PRESSURE,
          duration: MechanicDuration.GAME,
          effect: { turnTimeOverride: 15 },
          announcement: 'Lady Luck produces an hourglass... time runs short!'
        },
        {
          id: 'skill_drain',
          name: 'Beginner\'s Luck',
          description: 'All skill bonuses are disabled',
          type: BossMechanicType.TEAM_DEBUFF,
          duration: MechanicDuration.GAME,
          effect: { disableSkillBonus: true },
          counterplay: {
            skill: 'gambling',
            threshold: 60,
            effect: 'reduce'
          },
          announcement: '"Let\'s see how you play without your tricks!"'
        }
      ]
    }
  ],
  rewards: {
    goldBase: 800,
    experienceBase: 350,
    lootTable: 'epic_gambling_gear',
    uniqueReward: 'ladys_lucky_coin',
    skillXP: {
      gambling: 75,
      duel_instinct: 40
    }
  }
};

/**
 * The Reaper - Collector of Souls
 * Hearts specialist boss
 */
export const THE_REAPER: RaidBoss = {
  id: 'the_reaper',
  name: 'The Reaper',
  title: 'Collector of Souls',
  description: 'Death himself sits at the table. Every heart you take is a soul claimed. Every spade queen is your own doom.',
  lore: `In the ghost town of Widow\'s Peak, the dead gather to play their eternal games.
  The Reaper presides over Hearts, where every point is a piece of your soul. Those who
  shoot the moon earn a reprieve. Those who fail... stay to play forever.`,
  difficulty: RaidDifficulty.HARD,
  health: 600,
  gameTypes: [TeamCardGameType.HEARTS],
  minimumGamblingSkill: 30,
  locationId: 'ghost_town',
  phases: [
    {
      healthThreshold: 100,
      name: 'Marked for Death',
      description: 'The Reaper watches and waits',
      mechanics: [
        {
          id: 'death_mark',
          name: 'Death\'s Gaze',
          description: 'The Reaper knows which player holds the Queen of Spades',
          type: BossMechanicType.INFORMATION,
          duration: MechanicDuration.ROUND,
          effect: { revealRandomCard: true },
          announcement: 'The Reaper\'s hollow eyes fix upon one of you...'
        }
      ]
    },
    {
      healthThreshold: 50,
      name: 'Soul Harvest',
      description: 'Hearts become more deadly',
      mechanics: [
        {
          id: 'enhanced_qs',
          name: 'Queen\'s Curse',
          description: 'Queen of Spades is worth 26 points instead of 13',
          type: BossMechanicType.SCORE_MODIFIER,
          duration: MechanicDuration.GAME,
          effect: { queenSpadesPenalty: 26 },
          announcement: 'The Queen of Spades glows with malevolent energy!'
        },
        {
          id: 'bleeding_hearts',
          name: 'Bleeding Hearts',
          description: 'Each heart is worth 2 points instead of 1',
          type: BossMechanicType.SCORE_MODIFIER,
          duration: MechanicDuration.ROUND,
          effect: { scoreMultiplier: 2 },
          counterplay: {
            skill: 'duel_instinct',
            threshold: 35,
            effect: 'reduce'
          },
          announcement: 'The hearts pulse and bleed... each one weighs heavier!'
        }
      ]
    },
    {
      healthThreshold: 25,
      name: 'Sudden Death',
      description: 'The Reaper grows hungry',
      mechanics: [
        {
          id: 'sudden_death',
          name: 'Sudden Death',
          description: 'If any player reaches 80 points (instead of 100), the game ends immediately',
          type: BossMechanicType.SCORE_MODIFIER,
          duration: MechanicDuration.GAME,
          effect: {},
          announcement: 'The Reaper raises his scythe: "SUDDEN DEATH!"'
        },
        {
          id: 'time_pressure_reaper',
          name: 'Time Runs Out',
          description: 'Turn timer reduced to 10 seconds',
          type: BossMechanicType.TIME_PRESSURE,
          duration: MechanicDuration.GAME,
          effect: { turnTimeOverride: 10 },
          announcement: 'The sands of your hourglass run thin...'
        }
      ]
    }
  ],
  rewards: {
    goldBase: 600,
    experienceBase: 250,
    lootTable: 'rare_gambling_gear',
    uniqueReward: 'reapers_card_case',
    skillXP: {
      gambling: 60,
      duel_instinct: 30
    }
  }
};

/**
 * The Contractor - Master of Deals
 * Bridge specialist boss (NIGHTMARE difficulty)
 */
export const THE_CONTRACTOR: RaidBoss = {
  id: 'the_contractor',
  name: 'The Contractor',
  title: 'Master of Deals',
  description: 'A demon in a fine suit who deals in contracts - both card and soul. Read the fine print carefully.',
  lore: `At the Gentleman\'s Club in Frontera, business deals are sealed over Bridge. The Contractor
  appears to those who seek unfair advantage, offering contracts that seem too good to be true.
  His Bridge game is the ultimate test - fail to make your contract, and the penalty is eternal.`,
  difficulty: RaidDifficulty.NIGHTMARE,
  health: 1000,
  gameTypes: [TeamCardGameType.BRIDGE],
  minimumGamblingSkill: 60,
  locationId: 'gentlemans_club',
  phases: [
    {
      healthThreshold: 100,
      name: 'Binding Contract',
      description: 'The Contractor enforces strict terms',
      mechanics: [
        {
          id: 'binding_contract',
          name: 'Binding Terms',
          description: 'Failed contracts deal double undertrick penalties',
          type: BossMechanicType.SCORE_MODIFIER,
          duration: MechanicDuration.GAME,
          effect: { scoreMultiplier: 2 },
          announcement: 'The Contractor produces a contract: "Sign here... or there..."'
        }
      ]
    },
    {
      healthThreshold: 66,
      name: 'Fine Print',
      description: 'Hidden clauses activate',
      mechanics: [
        {
          id: 'forced_bid',
          name: 'Escalation Clause',
          description: 'All contracts must be at least level 3',
          type: BossMechanicType.TRICK_MODIFIER,
          duration: MechanicDuration.GAME,
          effect: {},
          announcement: 'The fine print reveals itself: "Minimum stakes required!"'
        },
        {
          id: 'reveal_dummy',
          name: 'Due Diligence',
          description: 'The Contractor can see the dummy hand before bidding',
          type: BossMechanicType.INFORMATION,
          duration: MechanicDuration.GAME,
          effect: { revealPartnerHand: true },
          announcement: 'The Contractor peers at your partner\'s cards...'
        }
      ]
    },
    {
      healthThreshold: 33,
      name: 'Breach of Contract',
      description: 'The Contractor demands payment',
      mechanics: [
        {
          id: 'soul_penalty',
          name: 'Penalty Clause',
          description: 'Each undertrick costs 50 points instead of normal',
          type: BossMechanicType.SCORE_MODIFIER,
          duration: MechanicDuration.GAME,
          effect: { pointPenalty: 50 },
          announcement: 'The Contractor grins: "The penalty for failure is... severe."'
        },
        {
          id: 'hand_corruption',
          name: 'Corrupt Deal',
          description: 'One random card in each hand becomes a random different card',
          type: BossMechanicType.CARD_MANIPULATION,
          duration: MechanicDuration.ROUND,
          effect: { corruptCard: true },
          counterplay: {
            skill: 'sleight_of_hand',
            threshold: 55,
            teamwork: true,
            effect: 'negate'
          },
          announcement: 'Your cards shimmer and change before your eyes!'
        },
        {
          id: 'time_pressure_contract',
          name: 'Time is Money',
          description: 'Turn timer reduced to 20 seconds',
          type: BossMechanicType.TIME_PRESSURE,
          duration: MechanicDuration.GAME,
          effect: { turnTimeOverride: 20 },
          announcement: 'The clock ticks loudly... time is money, after all.'
        }
      ]
    }
  ],
  rewards: {
    goldBase: 1200,
    experienceBase: 500,
    lootTable: 'legendary_gambling_gear',
    uniqueReward: 'contractors_cufflinks',
    skillXP: {
      gambling: 100,
      duel_instinct: 50
    }
  }
};

/**
 * The Alchemist - Transmuter of Fate
 * Pinochle specialist boss
 */
export const THE_ALCHEMIST: RaidBoss = {
  id: 'the_alchemist',
  name: 'The Alchemist',
  title: 'Transmuter of Fate',
  description: 'A mad scientist of cards who transforms melds into gold... or lead. His Pinochle games bend the rules of reality.',
  lore: `Dr. Faustus Chen ran the Golden Dragon railroad car\'s gaming tables until an experiment
  went wrong. Now he exists between states, neither alive nor dead, transforming cards and
  players alike. His Pinochle games are legendary - and terrifying.`,
  difficulty: RaidDifficulty.VERY_HARD,
  health: 800,
  gameTypes: [TeamCardGameType.PINOCHLE],
  minimumGamblingSkill: 45,
  locationId: 'railroad_car',
  phases: [
    {
      healthThreshold: 100,
      name: 'Lead to Gold',
      description: 'The Alchemist begins his transformations',
      mechanics: [
        {
          id: 'meld_transmutation',
          name: 'Transmutation',
          description: 'Random meld values are increased OR decreased by 50%',
          type: BossMechanicType.SCORE_MODIFIER,
          duration: MechanicDuration.ROUND,
          effect: {},
          announcement: 'The Alchemist waves his hands... your melds shimmer and change!'
        }
      ]
    },
    {
      healthThreshold: 50,
      name: 'Fool\'s Gold',
      description: 'Not all that glitters is gold',
      mechanics: [
        {
          id: 'false_meld',
          name: 'Fool\'s Meld',
          description: 'One declared meld per round is invalidated',
          type: BossMechanicType.CARD_MANIPULATION,
          duration: MechanicDuration.ROUND,
          effect: {},
          counterplay: {
            skill: 'gambling',
            threshold: 50,
            effect: 'negate'
          },
          announcement: 'The Alchemist cackles as one of your melds crumbles to dust!'
        },
        {
          id: 'card_transform',
          name: 'Transmute Card',
          description: 'One card in each hand transforms into a different card',
          type: BossMechanicType.CARD_MANIPULATION,
          duration: MechanicDuration.ROUND,
          effect: { corruptCard: true },
          announcement: 'Your cards bubble and transform!'
        }
      ]
    },
    {
      healthThreshold: 25,
      name: 'Philosopher\'s Stone',
      description: 'The Alchemist reveals his true power',
      mechanics: [
        {
          id: 'philosophers_stone',
          name: 'Perfect Transmutation',
          description: 'All nines become aces, all aces become nines',
          type: BossMechanicType.CARD_MANIPULATION,
          duration: MechanicDuration.GAME,
          effect: {},
          announcement: 'The Philosopher\'s Stone glows! High becomes low, low becomes high!'
        },
        {
          id: 'time_pressure_alchemist',
          name: 'Unstable Reaction',
          description: 'Turn timer reduced to 15 seconds',
          type: BossMechanicType.TIME_PRESSURE,
          duration: MechanicDuration.GAME,
          effect: { turnTimeOverride: 15 },
          announcement: 'The experiment becomes unstable! Hurry!'
        },
        {
          id: 'double_stakes',
          name: 'Double Transmutation',
          description: 'All points doubled for final phase',
          type: BossMechanicType.SCORE_MODIFIER,
          duration: MechanicDuration.GAME,
          effect: { scoreMultiplier: 2 },
          announcement: 'The Alchemist\'s power doubles everything!'
        }
      ]
    }
  ],
  rewards: {
    goldBase: 900,
    experienceBase: 400,
    lootTable: 'epic_gambling_gear',
    uniqueReward: 'alchemists_card_case',
    skillXP: {
      gambling: 80,
      duel_instinct: 40
    }
  }
};

// =============================================================================
// BOSS REGISTRY
// =============================================================================

export const TEAM_CARD_BOSSES: Record<string, RaidBoss> = {
  [BLACK_HAT_MORGAN.id]: BLACK_HAT_MORGAN,
  [LADY_LUCK.id]: LADY_LUCK,
  [THE_REAPER.id]: THE_REAPER,
  [THE_CONTRACTOR.id]: THE_CONTRACTOR,
  [THE_ALCHEMIST.id]: THE_ALCHEMIST
};

/**
 * Get boss by ID
 */
export function getBossById(bossId: string): RaidBoss | undefined {
  return TEAM_CARD_BOSSES[bossId];
}

/**
 * Get all bosses for a game type
 */
export function getBossesForGameType(gameType: TeamCardGameType): RaidBoss[] {
  return Object.values(TEAM_CARD_BOSSES).filter(boss =>
    boss.gameTypes.includes(gameType)
  );
}

/**
 * Get bosses by difficulty
 */
export function getBossesByDifficulty(difficulty: RaidDifficulty): RaidBoss[] {
  return Object.values(TEAM_CARD_BOSSES).filter(boss =>
    boss.difficulty === difficulty
  );
}

/**
 * Get boss phase for current health
 */
export function getCurrentBossPhase(boss: RaidBoss, currentHealth: number): TeamCardBossPhase {
  const healthPercent = (currentHealth / boss.health) * 100;

  // Find the active phase (highest threshold that current health is at or below)
  const activePhases = boss.phases.filter(phase =>
    healthPercent <= phase.healthThreshold
  );

  // Return the phase with the lowest threshold (most progressed)
  return activePhases.reduce((lowest, current) =>
    current.healthThreshold < lowest.healthThreshold ? current : lowest
  );
}

/**
 * Check if a phase transition occurred
 */
export function checkPhaseTransition(
  boss: RaidBoss,
  previousHealth: number,
  currentHealth: number
): TeamCardBossPhase | null {
  const prevPercent = (previousHealth / boss.health) * 100;
  const currPercent = (currentHealth / boss.health) * 100;

  // Find phases crossed
  const crossedPhases = boss.phases.filter(phase =>
    prevPercent > phase.healthThreshold && currPercent <= phase.healthThreshold
  );

  if (crossedPhases.length > 0) {
    // Return the lowest threshold crossed (most progressed)
    return crossedPhases.reduce((lowest, current) =>
      current.healthThreshold < lowest.healthThreshold ? current : lowest
    );
  }

  return null;
}

// Alias for backwards compatibility
export const RAID_BOSSES = TEAM_CARD_BOSSES;
