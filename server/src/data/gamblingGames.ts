/**
 * Gambling Game Definitions
 * Phase 13, Wave 13.1 - High Stakes Gambling Events
 *
 * Defines all gambling games available in Desperados Destiny
 */

import {
  GamblingGame,
  GamblingGameType,
  GamblingItem,
  GamblingLocation
} from '@desperados/shared';

// ============================================================================
// GAMBLING GAMES
// ============================================================================

export const GAMBLING_GAMES: Record<string, GamblingGame> = {
  // ============================================================================
  // BLACKJACK
  // ============================================================================
  BLACKJACK_RED_GULCH: {
    id: 'blackjack_red_gulch',
    name: 'Red Gulch Blackjack',
    description: 'Classic 21 game against the house dealer. Get as close to 21 as possible without going over.',
    gameType: GamblingGameType.BLACKJACK,

    minimumBet: 5,
    maximumBet: 500,

    houseEdge: 0.5,
    dealerNPC: 'dealer_red_gulch',

    skillChecks: [
      {
        skillId: 'mathematics',
        minimumLevel: 1,
        bonusPerLevel: 2,
        description: 'Card counting and probability calculations'
      },
      {
        skillId: 'observation',
        minimumLevel: 1,
        bonusPerLevel: 1,
        description: 'Reading dealer tells and card patterns'
      }
    ],

    cheatDifficulty: 60,
    cheatDetectionBase: 40,
    cheatPenalty: 'Ejection from saloon, 3-day ban, reputation loss',

    availableLocations: ['red_gulch_saloon', 'whiskey_bend_casino'],
    minimumLevel: 5,

    sessionDuration: 30,
    maxPlayersPerTable: 5,
    allowSpectators: true,

    experiencePerSession: 50,
    reputationGain: 5,
    reputationLoss: 2,

    rules: [
      'Dealer stands on soft 17',
      'Blackjack pays 3:2',
      'Double down on any two cards',
      'Split up to 3 times',
      'No surrender',
      'Insurance available when dealer shows Ace'
    ],
    tips: [
      'Always split Aces and 8s',
      'Never split 10s or 5s',
      'Hit soft 17 or lower',
      'Stand on hard 17 or higher',
      'Double down on 11 against dealer 2-10',
      'Card counting can give you an edge, but don\'t get caught'
    ]
  },

  BLACKJACK_HIGH_STAKES: {
    id: 'blackjack_high_stakes',
    name: 'Fort Ashford High Stakes Blackjack',
    description: 'Premium blackjack for serious players. Higher limits, better rules, exclusive atmosphere.',
    gameType: GamblingGameType.BLACKJACK,

    minimumBet: 50,
    maximumBet: 5000,

    houseEdge: 0.3, // Better rules = lower house edge
    dealerNPC: 'dealer_fort_ashford',

    skillChecks: [
      {
        skillId: 'mathematics',
        minimumLevel: 3,
        bonusPerLevel: 3,
        description: 'Advanced card counting techniques'
      },
      {
        skillId: 'observation',
        minimumLevel: 2,
        bonusPerLevel: 2,
        description: 'Expert dealer analysis'
      }
    ],

    cheatDifficulty: 80,
    cheatDetectionBase: 60,
    cheatPenalty: 'Permanent ban, 500 gold fine, possible jail time',

    availableLocations: ['fort_ashford_club'],
    minimumLevel: 15,

    sessionDuration: 60,
    maxPlayersPerTable: 3,
    allowSpectators: false,

    experiencePerSession: 100,
    reputationGain: 15,
    reputationLoss: 5,

    rules: [
      'Dealer stands on soft 17',
      'Blackjack pays 3:2',
      'Double down on any cards',
      'Split up to 4 times',
      'Late surrender available',
      'Re-split Aces allowed',
      'Insurance and Even Money available'
    ],
    tips: [
      'Premium rules give you better odds',
      'Surrender 16 against dealer 10 or Ace',
      'Even money on Blackjack vs dealer Ace is usually bad',
      'Security is very tight - don\'t try to cheat',
      'Bring plenty of gold for variance'
    ]
  },

  // ============================================================================
  // FARO
  // ============================================================================
  FARO_TRADITIONAL: {
    id: 'faro_traditional',
    name: 'Traditional Faro',
    description: 'The most popular gambling game in the Old West. Bet on which cards will win or lose.',
    gameType: GamblingGameType.FARO,

    minimumBet: 2,
    maximumBet: 200,

    houseEdge: 2.0,
    dealerNPC: 'faro_dealer_main',

    skillChecks: [
      {
        skillId: 'mathematics',
        minimumLevel: 1,
        bonusPerLevel: 1.5,
        description: 'Calculating card probabilities'
      },
      {
        skillId: 'memory',
        minimumLevel: 1,
        bonusPerLevel: 1,
        description: 'Tracking cards played'
      }
    ],

    cheatDifficulty: 50,
    cheatDetectionBase: 35,
    cheatPenalty: 'Ejection, 2-day ban, moderate reputation loss',

    availableLocations: ['red_gulch_saloon', 'whiskey_bend_casino', 'frontera_cantina'],
    minimumLevel: 3,

    sessionDuration: 45,
    maxPlayersPerTable: 8,
    allowSpectators: true,

    experiencePerSession: 40,
    reputationGain: 3,
    reputationLoss: 1,

    rules: [
      'Bet on any card rank (2 through Ace)',
      'Dealer draws two cards: first loses, second wins',
      'Winning bets pay even money',
      '"Copper" your bet to reverse it (bet on losing)',
      'If matching cards appear (soda), house wins half',
      'Track remaining cards on the case keeper'
    ],
    tips: [
      'Most historically accurate gambling game',
      'Watch the case keeper to know odds',
      'Copper bets when few cards remain',
      'Avoid betting on cards with only 1-2 remaining',
      'House edge comes from soda (matching cards)'
    ]
  },

  // ============================================================================
  // THREE-CARD MONTE
  // ============================================================================
  THREE_CARD_MONTE_STREET: {
    id: 'three_card_monte_street',
    name: 'Street Monte',
    description: 'Find the queen among three cards. Fast hands, fast action. Often rigged.',
    gameType: GamblingGameType.THREE_CARD_MONTE,

    minimumBet: 5,
    maximumBet: 100,

    houseEdge: 25.0, // Extremely bad odds
    dealerNPC: 'monte_dealer_shady',

    skillChecks: [
      {
        skillId: 'observation',
        minimumLevel: 2,
        bonusPerLevel: 3,
        description: 'Track the queen through shuffles'
      },
      {
        skillId: 'duel_instinct',
        minimumLevel: 1,
        bonusPerLevel: 2,
        description: 'Detect dealer tricks and manipulation'
      }
    ],

    cheatDifficulty: 30, // Easy to cheat, but also easy to get cheated
    cheatDetectionBase: 20,
    cheatPenalty: 'Fight might break out, possible injury',

    availableLocations: ['frontera_streets', 'red_gulch_alleys', 'whiskey_bend_market'],
    minimumLevel: 1,

    sessionDuration: 10,
    maxPlayersPerTable: 6,
    allowSpectators: true,

    experiencePerSession: 20,
    reputationGain: 2,
    reputationLoss: 5, // Losing badly hurts reputation

    rules: [
      'Dealer shows the Queen of Hearts',
      'Three cards are shuffled face down',
      'Guess which card is the Queen',
      'Wins pay 2:1 (but odds are heavily against you)',
      'Dealer often has accomplices in crowd',
      'You can also BE the dealer'
    ],
    tips: [
      'The game is usually rigged',
      'Watch for shill players (accomplices)',
      'Dealer uses sleight of hand',
      'Better to be the dealer than the player',
      'High observation skill helps, but dealer tricks are sophisticated',
      'Don\'t bet more than you can afford to lose'
    ]
  },

  // ============================================================================
  // CRAPS (DICE)
  // ============================================================================
  CRAPS_FRONTIER: {
    id: 'craps_frontier',
    name: 'Frontier Craps',
    description: 'Roll the bones! Fast-paced dice game with multiple betting options.',
    gameType: GamblingGameType.CRAPS,

    minimumBet: 5,
    maximumBet: 300,

    houseEdge: 1.41, // For pass line bet
    dealerNPC: 'craps_dealer_main',

    skillChecks: [
      {
        skillId: 'mathematics',
        minimumLevel: 1,
        bonusPerLevel: 1,
        description: 'Understanding odds and probabilities'
      },
      {
        skillId: 'luck',
        minimumLevel: 1,
        bonusPerLevel: 0.5,
        description: 'The dice favor the fortunate'
      }
    ],

    cheatDifficulty: 70, // Hard to cheat with dice
    cheatDetectionBase: 50,
    cheatPenalty: 'Severe beating, ban, possible arrest',

    availableLocations: ['red_gulch_saloon', 'whiskey_bend_casino', 'fort_ashford_club'],
    minimumLevel: 5,

    sessionDuration: 30,
    maxPlayersPerTable: 12,
    allowSpectators: true,

    experiencePerSession: 45,
    reputationGain: 4,
    reputationLoss: 2,

    rules: [
      'Pass Line: Bet on shooter to win',
      'Don\'t Pass: Bet against shooter',
      'Come Out Roll: First roll establishes point',
      '7 or 11 on come out = Pass wins',
      '2, 3, or 12 on come out = Pass loses (craps)',
      'Any other number becomes the point',
      'Roll point again before 7 to win',
      'Many other bets available: Field, Place, Hardways'
    ],
    tips: [
      'Pass Line has lowest house edge',
      'Take odds bets when available (no house edge)',
      'Avoid proposition bets (high house edge)',
      'Don\'t Pass is almost as good as Pass',
      'Hardways and Any Seven have terrible odds',
      'Craps is largely luck-based'
    ]
  },

  // ============================================================================
  // ROULETTE
  // ============================================================================
  ROULETTE_EUROPEAN: {
    id: 'roulette_european',
    name: 'European Roulette',
    description: 'Spin the wheel and bet on where the ball lands. Single zero wheel with better odds.',
    gameType: GamblingGameType.ROULETTE,

    minimumBet: 5,
    maximumBet: 500,

    houseEdge: 2.7,
    dealerNPC: 'roulette_dealer_european',

    skillChecks: [
      {
        skillId: 'mathematics',
        minimumLevel: 1,
        bonusPerLevel: 0.5,
        description: 'Calculating odds'
      }
    ],

    cheatDifficulty: 90, // Very hard to cheat at roulette
    cheatDetectionBase: 70,
    cheatPenalty: 'Permanent ban, heavy fine, jail time',

    availableLocations: ['fort_ashford_club', 'riverboat_cruise'],
    minimumLevel: 10,

    sessionDuration: 30,
    maxPlayersPerTable: 8,
    allowSpectators: true,

    experiencePerSession: 35,
    reputationGain: 3,
    reputationLoss: 1,

    rules: [
      'Single zero wheel (0-36)',
      'Straight up bet (single number): 35:1',
      'Split bet (two numbers): 17:1',
      'Street bet (three numbers): 11:1',
      'Corner bet (four numbers): 8:1',
      'Six line (six numbers): 5:1',
      'Dozen or Column: 2:1',
      'Even money bets: Red/Black, Even/Odd, High/Low'
    ],
    tips: [
      'All bets have same house edge (2.7%)',
      'No betting system can overcome house edge',
      'Straight up bets are exciting but rare',
      'Even money bets lose slowly',
      'Wheel is pure chance - no skill involved',
      'Set a budget and stick to it'
    ]
  },

  ROULETTE_AMERICAN: {
    id: 'roulette_american',
    name: 'American Roulette',
    description: 'Double-zero roulette wheel. Higher house edge but available at more locations.',
    gameType: GamblingGameType.ROULETTE,

    minimumBet: 2,
    maximumBet: 200,

    houseEdge: 5.26, // Worse odds due to double zero
    dealerNPC: 'roulette_dealer_american',

    skillChecks: [
      {
        skillId: 'mathematics',
        minimumLevel: 1,
        bonusPerLevel: 0.5,
        description: 'Calculating odds'
      }
    ],

    cheatDifficulty: 90,
    cheatDetectionBase: 60,
    cheatPenalty: 'Ejection, ban, reputation loss',

    availableLocations: ['red_gulch_saloon', 'whiskey_bend_casino'],
    minimumLevel: 5,

    sessionDuration: 30,
    maxPlayersPerTable: 8,
    allowSpectators: true,

    experiencePerSession: 30,
    reputationGain: 2,
    reputationLoss: 1,

    rules: [
      'Double zero wheel (0, 00, 1-36)',
      'Same bet types as European',
      'Payouts identical to European',
      'Extra zero increases house edge',
      'Five number bet (0,00,1,2,3): 6:1 - WORST BET'
    ],
    tips: [
      'Avoid American roulette if European available',
      'Never make the five number bet',
      'Double zero nearly doubles house edge',
      'Still a pure game of chance',
      'Play European if you have a choice'
    ]
  },

  // ============================================================================
  // WHEEL OF FORTUNE
  // ============================================================================
  WHEEL_OF_FORTUNE_CARNIVAL: {
    id: 'wheel_of_fortune_carnival',
    name: 'Carnival Wheel',
    description: 'Simple spinning wheel game. Bet on symbols and spin for your fortune!',
    gameType: GamblingGameType.WHEEL_OF_FORTUNE,

    minimumBet: 1,
    maximumBet: 50,

    houseEdge: 11.1,
    dealerNPC: 'carnival_barker',

    skillChecks: [], // Pure luck, no skill

    cheatDifficulty: 40,
    cheatDetectionBase: 30,
    cheatPenalty: 'Ejection from carnival, small fine',

    availableLocations: ['red_gulch_fair', 'whiskey_bend_carnival', 'traveling_shows'],
    minimumLevel: 1,

    sessionDuration: 15,
    maxPlayersPerTable: 20,
    allowSpectators: true,

    experiencePerSession: 10,
    reputationGain: 1,
    reputationLoss: 0,

    rules: [
      'Wheel has 54 segments with various symbols',
      'Bet on symbol, wheel spins',
      'If wheel stops on your symbol, you win',
      'Payouts vary by symbol rarity',
      'Star (1 segment): 40:1',
      'Desperado Logo (2 segments): 20:1',
      'Gold Bar (4 segments): 10:1',
      'Horseshoe (7 segments): 5:1',
      'Sheriff Badge (10 segments): 3:1',
      'Cowboy Hat (15 segments): 2:1',
      'Card Suit (15 segments): 1:1'
    ],
    tips: [
      'Simple, easy to understand',
      'High house edge makes it a poor bet',
      'Good for casual entertainment',
      'Betting on rare symbols is exciting but unlikely',
      'Most common symbols still have house edge'
    ]
  },

  // ============================================================================
  // FIVE CARD DRAW POKER
  // ============================================================================
  POKER_FIVE_CARD_DRAW: {
    id: 'poker_five_card_draw',
    name: 'Five Card Draw Poker',
    description: 'Classic poker game. Get the best five-card hand and win the pot.',
    gameType: GamblingGameType.FIVE_CARD_DRAW,

    minimumBet: 10,
    maximumBet: 1000,

    houseEdge: 5.0, // House rake
    dealerNPC: 'poker_dealer_house',

    skillChecks: [
      {
        skillId: 'observation',
        minimumLevel: 2,
        bonusPerLevel: 2,
        description: 'Reading opponents and detecting bluffs'
      },
      {
        skillId: 'duel_instinct',
        minimumLevel: 2,
        bonusPerLevel: 2,
        description: 'Bluffing and deception'
      },
      {
        skillId: 'mathematics',
        minimumLevel: 1,
        bonusPerLevel: 1,
        description: 'Calculating pot odds'
      }
    ],

    cheatDifficulty: 55,
    cheatDetectionBase: 45,
    cheatPenalty: 'Ejection, ban, severe reputation loss, possible violence',

    availableLocations: ['red_gulch_saloon', 'whiskey_bend_casino', 'fort_ashford_club'],
    minimumLevel: 8,

    sessionDuration: 60,
    maxPlayersPerTable: 6,
    allowSpectators: true,

    experiencePerSession: 75,
    reputationGain: 10,
    reputationLoss: 3,

    rules: [
      'Each player dealt 5 cards face down',
      'First betting round',
      'Players can discard and draw new cards',
      'Second betting round',
      'Best hand wins the pot',
      'Hand rankings: High Card < Pair < Two Pair < Three of a Kind < Straight < Flush < Full House < Four of a Kind < Straight Flush < Royal Flush',
      'House takes 5% rake from each pot'
    ],
    tips: [
      'Position matters - act last when possible',
      'Don\'t draw to inside straights',
      'Strong starting hands: Pairs, high cards',
      'Bluff occasionally to keep opponents guessing',
      'Watch how many cards opponents draw',
      'This is skill-based - practice improves results'
    ]
  },

  // ============================================================================
  // SEVEN CARD STUD
  // ============================================================================
  POKER_SEVEN_CARD_STUD: {
    id: 'poker_seven_card_stud',
    name: 'Seven Card Stud',
    description: 'Advanced poker variant. More cards, more betting rounds, more strategy.',
    gameType: GamblingGameType.SEVEN_CARD_STUD,

    minimumBet: 20,
    maximumBet: 2000,

    houseEdge: 5.0, // House rake
    dealerNPC: 'poker_dealer_advanced',

    skillChecks: [
      {
        skillId: 'observation',
        minimumLevel: 3,
        bonusPerLevel: 3,
        description: 'Tracking face-up cards and reading opponents'
      },
      {
        skillId: 'memory',
        minimumLevel: 2,
        bonusPerLevel: 2,
        description: 'Remembering folded cards'
      },
      {
        skillId: 'duel_instinct',
        minimumLevel: 2,
        bonusPerLevel: 2,
        description: 'Advanced bluffing techniques'
      },
      {
        skillId: 'mathematics',
        minimumLevel: 2,
        bonusPerLevel: 1.5,
        description: 'Complex pot odds calculations'
      }
    ],

    cheatDifficulty: 70,
    cheatDetectionBase: 55,
    cheatPenalty: 'Permanent ban, heavy fine, possible arrest',

    availableLocations: ['fort_ashford_club', 'legendary_poker_night', 'riverboat_cruise'],
    minimumLevel: 15,

    sessionDuration: 90,
    maxPlayersPerTable: 8,
    allowSpectators: true,

    experiencePerSession: 125,
    reputationGain: 20,
    reputationLoss: 5,

    rules: [
      '2 cards dealt face down, 1 face up',
      'Lowest face up card brings in (forced bet)',
      'Betting round',
      '3 more cards dealt face up, one at a time, with betting after each',
      'Final card dealt face down',
      'Final betting round',
      'Best 5-card hand from 7 cards wins',
      'House takes 5% rake from each pot'
    ],
    tips: [
      'Much more complex than Five Card Draw',
      'Track all visible cards',
      'Starting hand selection is crucial',
      'High pairs and high cards in starting hand',
      'Watch for opponent tells on each betting round',
      'Don\'t chase with weak hands',
      'Very skill-intensive - experts dominate'
    ]
  }
};

// ============================================================================
// LEGENDARY GAMBLING ITEMS
// ============================================================================

export const GAMBLING_ITEMS: Record<string, GamblingItem> = {
  LUCKY_HORSESHOE: {
    id: 'lucky_horseshoe',
    name: 'Lucky Horseshoe',
    description: 'A genuine lucky horseshoe from a champion racehorse. Brings good fortune at the tables.',
    rarity: 'UNCOMMON',
    winRateBonus: 5,
    specialAbility: 'lucky_streak',
    abilityDescription: 'Once per session, reroll a losing hand',
    usesPerSession: 1,
    howToObtain: 'Purchase from Traveling Merchants or win at Horse Racing',
    price: 250
  },

  MARKED_DECK: {
    id: 'marked_deck',
    name: 'Marked Deck',
    description: 'A carefully marked deck of cards. Invisible to the untrained eye, but provides an edge.',
    rarity: 'RARE',
    cheatBonus: 20,
    detectionPenalty: -10,
    specialAbility: 'see_cards',
    abilityDescription: 'Know dealer\'s hole card in Blackjack',
    usesPerSession: 3,
    howToObtain: 'Purchase from Chinese Diaspora Black Market',
    price: 500
  },

  DEALERS_VISOR: {
    id: 'dealers_visor',
    name: 'Dealer\'s Visor',
    description: 'Professional dealer visor with a secret: subtly reflective surface shows opponent cards.',
    rarity: 'RARE',
    winRateBonus: 3,
    cheatBonus: 15,
    specialAbility: 'read_tells',
    abilityDescription: 'Reveal one opponent\'s hand strength in poker',
    usesPerSession: 2,
    howToObtain: 'Complete quest: "The Cheating Dealer"',
    questRequired: 'cheating_dealer_quest'
  },

  LUCKY_CHIP: {
    id: 'lucky_chip',
    name: 'Lucky Chip',
    description: 'An ancient poker chip said to be blessed by Lady Luck herself.',
    rarity: 'LEGENDARY',
    winRateBonus: 10,
    goldMultiplier: 1.5,
    specialAbility: 'miracle_save',
    abilityDescription: 'Once per session, turn a loss into a push (no money lost)',
    usesPerSession: 1,
    howToObtain: 'Grand prize from Legendary Poker Night',
    questRequired: 'legendary_poker_night_champion'
  },

  GAMBLERS_COAT: {
    id: 'gamblers_coat',
    name: 'Gambler\'s Coat',
    description: 'An elegant coat with hidden pockets perfect for concealing extra cards.',
    rarity: 'RARE',
    cheatBonus: 25,
    detectionPenalty: -15,
    specialAbility: 'extra_cards',
    abilityDescription: 'Store up to 3 cards in hidden pockets',
    usesPerSession: 3,
    howToObtain: 'Craft at Master Tailor or win at high stakes events',
    price: 750
  },

  LOADED_DICE: {
    id: 'loaded_dice',
    name: 'Loaded Dice',
    description: 'Weighted dice that favor certain numbers. Use with caution.',
    rarity: 'UNCOMMON',
    cheatBonus: 30,
    detectionPenalty: 0, // Easier to detect
    specialAbility: 'fixed_roll',
    abilityDescription: 'Force a specific die result in Craps',
    usesPerSession: 2,
    howToObtain: 'Purchase from shady dealers in Frontera',
    price: 150
  },

  MIRROR_RING: {
    id: 'mirror_ring',
    name: 'Mirror Ring',
    description: 'A decorative ring with a tiny mirror perfect for glimpsing cards.',
    rarity: 'RARE',
    cheatBonus: 18,
    detectionPenalty: -12,
    specialAbility: 'peek_cards',
    abilityDescription: 'See top card of deck',
    usesPerSession: 4,
    howToObtain: 'Purchase from Chinese Diaspora or craft with Jeweler',
    price: 400
  },

  CARD_COUNTING_HANDBOOK: {
    id: 'card_counting_handbook',
    name: 'Card Counting Handbook',
    description: 'A comprehensive guide to card counting techniques. Legal, but casinos hate it.',
    rarity: 'UNCOMMON',
    winRateBonus: 8,
    specialAbility: 'count_cards',
    abilityDescription: 'Display running count in Blackjack',
    usesPerSession: 999, // Always active
    howToObtain: 'Purchase from Fort Ashford Library',
    price: 300
  },

  SLEIGHT_OF_HAND_GUIDE: {
    id: 'sleight_of_hand_guide',
    name: 'Sleight of Hand Guide',
    description: 'Teaches advanced card manipulation techniques.',
    rarity: 'RARE',
    cheatBonus: 22,
    specialAbility: 'palm_card',
    abilityDescription: 'Switch one card without detection',
    usesPerSession: 2,
    howToObtain: 'Learn from Mysterious Figure or complete thief quest line',
    questRequired: 'master_thief_training'
  },

  DEVILS_COIN: {
    id: 'devils_coin',
    name: 'The Devil\'s Coin',
    description: 'A mysterious coin that guarantees a win... but at what cost?',
    rarity: 'CURSED',
    winRateBonus: 50,
    goldMultiplier: 2.0,
    specialAbility: 'guaranteed_win',
    abilityDescription: 'Force a win on next hand',
    usesPerSession: 1,
    curse: {
      description: 'Every use drains your luck for future games',
      effect: 'After use, -5% win rate on all subsequent sessions (stacks)'
    },
    howToObtain: 'Reward from winning The Devil\'s Game'
  },

  POKER_FACE_MASK: {
    id: 'poker_face_mask',
    name: 'Poker Face Mask',
    description: 'A subtle half-mask that conceals your expressions perfectly.',
    rarity: 'UNCOMMON',
    winRateBonus: 4,
    specialAbility: 'no_tells',
    abilityDescription: 'Opponents cannot read your tells',
    usesPerSession: 999,
    howToObtain: 'Purchase from specialty shops',
    price: 200
  },

  ACES_UP_SLEEVE: {
    id: 'aces_up_sleeve',
    name: 'Aces Up the Sleeve',
    description: 'Two carefully concealed aces ready to be deployed at the perfect moment.',
    rarity: 'RARE',
    cheatBonus: 35,
    specialAbility: 'hidden_aces',
    abilityDescription: 'Add an Ace to your hand (one-time use)',
    usesPerSession: 1,
    howToObtain: 'Craft with Master Tailor or buy from black market',
    price: 600
  }
};

// ============================================================================
// GAMBLING LOCATIONS
// ============================================================================

export const GAMBLING_LOCATIONS: Record<string, GamblingLocation> = {
  RED_GULCH_SALOON: {
    id: 'red_gulch_saloon',
    name: 'Red Gulch Saloon',
    description: 'A lively saloon offering various gambling games. Popular with locals and travelers alike.',
    type: 'LEGAL',
    availableGames: [
      'blackjack_red_gulch',
      'faro_traditional',
      'craps_frontier',
      'roulette_american',
      'poker_five_card_draw'
    ],
    crowdLevel: 65,
    securityLevel: 40,
    luxuryLevel: 50,
    minimumBet: 5,
    dealers: ['dealer_red_gulch', 'faro_dealer_main', 'craps_dealer_main'],
    securityNPCs: ['bouncer_red_gulch'],
    regularPatrons: ['gambler_joe', 'lucky_lucy', 'card_shark_sam'],
    features: [
      'Live piano music',
      'Full bar service',
      'Comfortable seating',
      'Well-lit gaming area'
    ],
    amenities: [
      'Free drinks for active players',
      'Snacks available',
      'Clean facilities',
      'Friendly atmosphere'
    ]
  },

  WHISKEY_BEND_CASINO: {
    id: 'whiskey_bend_casino',
    name: 'Whiskey Bend Casino',
    description: 'The largest gambling establishment in the territory. Professional dealers and high stakes.',
    type: 'LEGAL',
    availableGames: [
      'blackjack_red_gulch',
      'blackjack_high_stakes',
      'faro_traditional',
      'craps_frontier',
      'roulette_american',
      'poker_five_card_draw',
      'poker_seven_card_stud'
    ],
    crowdLevel: 80,
    securityLevel: 70,
    luxuryLevel: 75,
    minimumBet: 10,
    entryFee: 5,
    dealers: [
      'dealer_whiskey_bend',
      'faro_dealer_pro',
      'craps_dealer_expert',
      'poker_dealer_house'
    ],
    securityNPCs: [
      'security_chief_casino',
      'pit_boss_vigilant',
      'guard_eagle_eye'
    ],
    regularPatrons: [
      'high_roller_henry',
      'countess_cards',
      'professional_pete'
    ],
    features: [
      'Multiple gaming floors',
      'VIP rooms available',
      'Professional dealers',
      'Strict anti-cheating measures',
      'Luxury furnishings'
    ],
    amenities: [
      'Premium bar',
      'Restaurant',
      'Hotel rooms',
      'Valet service',
      'Complimentary drinks for VIPs'
    ]
  },

  FORT_ASHFORD_CLUB: {
    id: 'fort_ashford_club',
    name: 'Fort Ashford Gentleman\'s Club',
    description: 'An exclusive club for high society and wealthy gamblers. Membership required.',
    type: 'EXCLUSIVE',
    availableGames: [
      'blackjack_high_stakes',
      'roulette_european',
      'poker_seven_card_stud'
    ],
    crowdLevel: 40,
    securityLevel: 90,
    luxuryLevel: 95,
    minimumBet: 50,
    membershipRequired: true,
    reputationRequired: 50,
    dealers: [
      'dealer_fort_ashford',
      'roulette_dealer_european',
      'poker_dealer_advanced'
    ],
    securityNPCs: [
      'doorman_exclusive',
      'security_discrete',
      'investigator_undercover'
    ],
    regularPatrons: [
      'baron_von_stakes',
      'lady_fortune',
      'colonel_cards'
    ],
    features: [
      'Ultra-exclusive atmosphere',
      'Private gaming rooms',
      'Best dealers in territory',
      'Cigar lounge',
      'Library'
    ],
    amenities: [
      'Fine dining',
      'Premium cigars',
      'Top-shelf liquor',
      'Concierge service',
      'Private lodging'
    ]
  },

  FRONTERA_UNDERGROUND: {
    id: 'frontera_underground',
    name: 'Frontera Underground Den',
    description: 'Illegal gambling den in Frontera. No rules, high stakes, dangerous atmosphere.',
    type: 'UNDERGROUND',
    availableGames: [
      'three_card_monte_street',
      'poker_five_card_draw',
      'craps_frontier'
    ],
    crowdLevel: 50,
    securityLevel: 20, // Low security = easier to cheat
    luxuryLevel: 15,
    minimumBet: 1,
    reputationRequired: -30, // Need criminal reputation
    dealers: [
      'monte_dealer_shady',
      'underground_poker_dealer',
      'dice_dealer_sketchy'
    ],
    securityNPCs: ['thug_enforcer'], // Not official security
    regularPatrons: [
      'outlaw_mike',
      'crooked_carlos',
      'cheating_charlie'
    ],
    features: [
      'No questions asked',
      'Cheating common',
      'Violence possible',
      'Authorities raid occasionally',
      'Hidden location'
    ],
    amenities: [
      'Cheap whiskey',
      'Back room for private games',
      'Information trading',
      'Black market access'
    ]
  },

  RIVERBOAT_CRUISE: {
    id: 'riverboat_cruise',
    name: 'Mississippi Queen Riverboat',
    description: 'Luxury gambling cruise. Weekly event with progressive jackpots.',
    type: 'EXCLUSIVE',
    availableGames: [
      'blackjack_high_stakes',
      'roulette_european',
      'poker_seven_card_stud',
      'faro_traditional'
    ],
    crowdLevel: 70,
    securityLevel: 75,
    luxuryLevel: 90,
    minimumBet: 25,
    entryFee: 50,
    membershipRequired: false,
    dealers: [
      'riverboat_dealer_main',
      'roulette_dealer_european',
      'poker_dealer_riverboat'
    ],
    securityNPCs: [
      'captain_security',
      'first_mate_watchful'
    ],
    regularPatrons: [
      'wealthy_widow',
      'railroad_tycoon',
      'gambling_gentleman'
    ],
    features: [
      'Scenic river cruise',
      'Live entertainment',
      'Progressive jackpots',
      'Multiple gaming rooms',
      'Dance floor'
    ],
    amenities: [
      'Fine dining restaurant',
      'Full bar',
      'Live band',
      'Observation deck',
      'Private cabins'
    ]
  }
};

// Helper function to get game by ID
// Supports lookup by both object key (e.g., 'BLACKJACK_RED_GULCH') and game.id property (e.g., 'blackjack_red_gulch')
export function getGamblingGameById(gameId: string): GamblingGame | undefined {
  // First try direct key lookup (object key)
  if (GAMBLING_GAMES[gameId]) {
    return GAMBLING_GAMES[gameId];
  }
  // Then try to find by .id property (case-insensitive)
  return Object.values(GAMBLING_GAMES).find(game => game.id === gameId || game.id.toLowerCase() === gameId.toLowerCase());
}

// Helper function to get games by type
export function getGamesByType(gameType: GamblingGameType): GamblingGame[] {
  return Object.values(GAMBLING_GAMES).filter(game => game.gameType === gameType);
}

// Helper function to get games available at location
export function getGamesAtLocation(locationId: string): GamblingGame[] {
  return Object.values(GAMBLING_GAMES).filter(game =>
    game.availableLocations.includes(locationId)
  );
}

// Helper function to get item by ID
export function getGamblingItemById(itemId: string): GamblingItem | undefined {
  return GAMBLING_ITEMS[itemId];
}

// Helper function to get location by ID
export function getGamblingLocationById(locationId: string): GamblingLocation | undefined {
  return GAMBLING_LOCATIONS[locationId];
}

// Helper function to get default game for a game type
// Maps generic types like 'blackjack' to specific game instances like 'blackjack_red_gulch'
export function getDefaultGameForType(gameType: string): GamblingGame | undefined {
  // Map of game types to their default game IDs
  const defaultGameMap: Record<string, string> = {
    'blackjack': 'BLACKJACK_RED_GULCH',
    'roulette': 'ROULETTE_STANDARD',
    'craps': 'CRAPS_STANDARD',
    'faro': 'FARO_STANDARD',
    'three_card_monte': 'THREE_CARD_MONTE',
    'wheel_of_fortune': 'WHEEL_OF_FORTUNE',
    'poker': 'POKER_STANDARD',
    'high_card': 'HIGH_CARD',
  };

  const defaultGameKey = defaultGameMap[gameType.toLowerCase()];
  if (defaultGameKey && GAMBLING_GAMES[defaultGameKey]) {
    return GAMBLING_GAMES[defaultGameKey];
  }

  // If not found in map, try to find first game of this type
  const games = getGamesByType(gameType as GamblingGameType);
  return games.length > 0 ? games[0] : undefined;
}

// Helper function to get default location for a game
export function getDefaultLocationForGame(game: GamblingGame): string {
  // Return first available location, or 'red_gulch_saloon' as fallback
  return game.availableLocations[0] || 'red_gulch_saloon';
}
