/**
 * High Stakes Event Definitions
 * Phase 13, Wave 13.1 - High Stakes Gambling Events
 *
 * Defines special gambling events with high stakes, exclusive access, and legendary rewards
 */

import {
  HighStakesEvent,
  HighStakesEventType,
  EventSchedule,
  EventRequirement,
  GamblingPrize,
  EventBuff,
  EventDebuff
} from '@desperados/shared';

// ============================================================================
// HIGH STAKES EVENTS
// ============================================================================

export const HIGH_STAKES_EVENTS: Record<string, HighStakesEvent> = {
  // ============================================================================
  // LEGENDARY POKER NIGHT
  // ============================================================================
  LEGENDARY_POKER_NIGHT: {
    id: 'legendary_poker_night',
    name: 'Legendary Poker Night',
    description: 'The most prestigious poker tournament in the West. Face off against legendary players for fame and fortune.',
    lore: 'Once a month, the greatest gamblers gather at Fort Ashford for a night of high-stakes poker. Winners become legends, losers become cautionary tales.',
    eventType: HighStakesEventType.LEGENDARY_POKER_NIGHT,

    schedule: {
      frequency: 'MONTHLY',
      dayOfMonth: 15,
      hour: 20, // 8 PM
      duration: 240 // 4 hours
    },
    duration: 240,

    entryFee: 10000,
    entryRequirements: [
      {
        type: 'LEVEL',
        value: 20,
        description: 'Character level 20 or higher'
      },
      {
        type: 'REPUTATION',
        value: 40,
        description: 'Gambler reputation of 40+'
      },
      {
        type: 'ACHIEVEMENT',
        value: 'poker_master',
        description: 'Complete "Poker Master" achievement'
      }
    ],
    maxParticipants: 100,
    minimumParticipants: 20,

    availableGames: ['poker_seven_card_stud', 'poker_five_card_draw'],
    mainGame: 'poker_seven_card_stud',

    prizePool: 1000000,
    guaranteedPrizes: [
      {
        type: 'ITEM',
        itemId: 'legendary_poker_chip',
        description: 'Legendary Poker Champion Chip (cosmetic)'
      },
      {
        type: 'TITLE',
        title: 'Legendary Card Shark',
        description: 'Exclusive title for all participants'
      }
    ],
    leaderboardPrizes: [
      {
        type: 'GOLD',
        amount: 500000,
        description: '1st Place: 500,000 gold'
      },
      {
        type: 'UNIQUE_ITEM',
        itemId: 'lucky_chip',
        description: '1st Place: The Lucky Chip'
      },
      {
        type: 'TITLE',
        title: 'Poker Legend',
        description: '1st Place: Poker Legend title'
      },
      {
        type: 'GOLD',
        amount: 250000,
        description: '2nd Place: 250,000 gold'
      },
      {
        type: 'GOLD',
        amount: 125000,
        description: '3rd Place: 125,000 gold'
      },
      {
        type: 'GOLD',
        amount: 50000,
        description: '4th-10th Place: 50,000 gold each'
      }
    ],

    location: 'fort_ashford_club',
    ambiance: 'Elegant chandeliers cast warm light over green felt tables. The air is thick with cigar smoke and tension. Every eye in the room watches the final table.',
    specialNPCs: [
      'doc_holliday_npc',
      'bat_masterson_npc',
      'poker_alice_npc',
      'wild_bill_hickok_ghost'
    ],
    npcDialogue: new Map([
      ['doc_holliday_npc', [
        'I\'m your huckleberry.',
        'The odds are always in my favor, friend.',
        'You\'re no daisy. You\'re no daisy at all.'
      ]],
      ['poker_alice_npc', [
        'I\'ve cleaned out bigger fish than you.',
        'My dear, poker is about reading people, not just cards.',
        'Shall we dance? I mean, play.'
      ]],
      ['bat_masterson_npc', [
        'I\'ve seen every trick in the book. Don\'t even try.',
        'The house doesn\'t always win, but I usually do.',
        'Luck is when preparation meets opportunity.'
      ]],
      ['wild_bill_hickok_ghost', [
        'Watch your back... and your hand.',
        'Dead man\'s hand... I should know.',
        'The game is rigged, always has been. Play anyway.'
      ]]
    ]),

    specialRules: [
      'No cheating tolerated - instant disqualification and ban',
      'Tournament format: Swiss rounds followed by single elimination',
      'All players start with equal chip stacks',
      'Blinds increase every 20 minutes',
      'One re-buy allowed in first hour',
      'Final table is broadcast to spectators',
      'Professional dealers only'
    ],
    cheatDetectionModifier: 50, // +50% detection chance
    supernaturalElement: false,

    eventBuffs: [
      {
        id: 'legendary_focus',
        name: 'Legendary Focus',
        description: 'The high stakes sharpen your mind',
        effect: '+10 to all observation checks',
        duration: 240
      },
      {
        id: 'crowd_energy',
        name: 'Crowd Energy',
        description: 'The spectators energize you',
        effect: '+5% win rate bonus',
        duration: 240
      }
    ],
    eventDebuffs: []
  },

  // ============================================================================
  // FRONTERA UNDERGROUND
  // ============================================================================
  FRONTERA_UNDERGROUND: {
    id: 'frontera_underground',
    name: 'The Frontera Underground',
    description: 'Illegal high-stakes gambling with no rules. Violence is always an option.',
    lore: 'Deep in Frontera\'s criminal underworld, a secret gambling den operates beyond the law. Here, fortunes are made and lost, and blood is often spilled alongside gold.',
    eventType: HighStakesEventType.FRONTERA_UNDERGROUND,

    schedule: {
      frequency: 'WEEKLY',
      dayOfWeek: 5, // Friday
      hour: 23, // 11 PM
      duration: 180 // 3 hours
    },
    duration: 180,

    entryFee: 5000,
    entryRequirements: [
      {
        type: 'CRIMINAL_REP',
        value: 30,
        description: 'Criminal reputation of 30+'
      },
      {
        type: 'FACTION',
        value: 'FRONTERA',
        description: 'Frontera faction member or neutral'
      }
    ],
    maxParticipants: 50,
    minimumParticipants: 10,

    availableGames: [
      'poker_five_card_draw',
      'three_card_monte_street',
      'craps_frontier'
    ],
    mainGame: 'poker_five_card_draw',

    prizePool: 250000,
    guaranteedPrizes: [],
    leaderboardPrizes: [
      {
        type: 'GOLD',
        amount: 150000,
        description: '1st Place: 150,000 gold'
      },
      {
        type: 'REPUTATION',
        amount: 25,
        description: '1st Place: +25 criminal reputation'
      },
      {
        type: 'GOLD',
        amount: 75000,
        description: '2nd Place: 75,000 gold'
      },
      {
        type: 'GOLD',
        amount: 25000,
        description: '3rd Place: 25,000 gold'
      }
    ],

    location: 'frontera_underground',
    ambiance: 'Dim lanterns barely illuminate the smoke-filled cellar. Armed guards watch from the shadows. You can feel the danger as thick as the air.',
    specialNPCs: [
      'el_diablo_gambler',
      'scarface_santiago',
      'black_widow_maria',
      'one_eyed_jack'
    ],
    npcDialogue: new Map([
      ['el_diablo_gambler', [
        'Your gold or your life. Maybe both.',
        'I always win. Those who disagree... aren\'t here to complain.',
        'Fold now or die trying.'
      ]],
      ['scarface_santiago', [
        'Got these scars from a bad beat. Want some of your own?',
        'Cheat all you want. We all do.',
        'The house doesn\'t win here. I do.'
      ]],
      ['black_widow_maria', [
        'Men underestimate me. Once.',
        'I\'ve killed for less gold than you\'re betting.',
        'Your tell is fear. I can smell it.'
      ]],
      ['one_eyed_jack', [
        'Lost the eye in a game like this. Worth it.',
        'This isn\'t gambling. This is war.',
        'Blood or gold. Usually both.'
      ]]
    ]),

    specialRules: [
      'Cheating is ALLOWED but getting caught means violence',
      'No authorities will respond to violence',
      'Weapons must be checked at door (but people sneak them in)',
      'Losers who can\'t pay face... consequences',
      'What happens underground stays underground',
      'Raids by law enforcement are possible',
      'Winner takes all mentality'
    ],
    cheatDetectionModifier: -30, // -30% detection chance (easier to cheat)
    supernaturalElement: false,

    eventBuffs: [
      {
        id: 'criminal_cunning',
        name: 'Criminal Cunning',
        description: 'Your criminal experience gives you an edge',
        effect: '+15 to cunning checks, +10% cheat success',
        duration: 180
      }
    ],
    eventDebuffs: [
      {
        id: 'constant_threat',
        name: 'Constant Threat',
        description: 'Violence looms over every hand',
        effect: 'Risk of combat if you win too much',
        duration: 180
      },
      {
        id: 'raid_risk',
        name: 'Raid Risk',
        description: 'Authorities might raid at any moment',
        effect: '10% chance of law enforcement raid each hour',
        duration: 180
      }
    ]
  },

  // ============================================================================
  // RIVERBOAT GAMBLING CRUISE
  // ============================================================================
  RIVERBOAT_CRUISE: {
    id: 'riverboat_cruise',
    name: 'Mississippi Queen Gambling Cruise',
    description: 'A luxury riverboat cruise featuring multiple gambling games and progressive jackpots.',
    lore: 'Every Sunday, the magnificent Mississippi Queen sets sail with the wealthy and fortunate aboard. Wine flows, dice roll, and fortunes change hands under the stars.',
    eventType: HighStakesEventType.RIVERBOAT_CRUISE,

    schedule: {
      frequency: 'WEEKLY',
      dayOfWeek: 0, // Sunday
      hour: 14, // 2 PM
      duration: 300 // 5 hours
    },
    duration: 300,

    entryFee: 100,
    entryRequirements: [
      {
        type: 'LEVEL',
        value: 10,
        description: 'Character level 10 or higher'
      }
    ],
    maxParticipants: 200,
    minimumParticipants: 30,

    availableGames: [
      'blackjack_high_stakes',
      'roulette_european',
      'poker_seven_card_stud',
      'faro_traditional',
      'craps_frontier'
    ],
    mainGame: 'blackjack_high_stakes',

    prizePool: 100000,
    guaranteedPrizes: [
      {
        type: 'ITEM',
        itemId: 'cruise_souvenir_chip',
        description: 'Commemorative cruise chip'
      }
    ],
    leaderboardPrizes: [
      {
        type: 'GOLD',
        amount: 50000,
        description: 'Top Earner: 50,000 gold'
      },
      {
        type: 'ITEM',
        itemId: 'riverboat_vip_pass',
        description: 'Top 10: VIP Pass for next cruise'
      },
      {
        type: 'GOLD',
        amount: 25000,
        description: 'Progressive Jackpot: 25,000 gold (split if multiple winners)'
      }
    ],

    location: 'riverboat_cruise',
    ambiance: 'Crystal chandeliers sway gently with the river\'s motion. Live jazz fills the air. Outside the windows, the landscape drifts by as fortunes change hands.',
    specialNPCs: [
      'captain_riverboat',
      'jazz_singer_belle',
      'wealthy_industrialist',
      'mysterious_countess'
    ],
    npcDialogue: new Map([
      ['captain_riverboat', [
        'Welcome aboard the Mississippi Queen!',
        'Fair play and good fortune to all.',
        'We run an honest game here. Cheaters walk the plank... metaphorically.'
      ]],
      ['jazz_singer_belle', [
        'I sing about luck and love. Tonight you need both.',
        'Every winner gets a song dedicated to them.',
        'The river knows all secrets, darling.'
      ]],
      ['wealthy_industrialist', [
        'I didn\'t get rich by losing at cards.',
        'Money means nothing when you have enough. It\'s about the game.',
        'Would you care to make it... interesting?'
      ]],
      ['mysterious_countess', [
        'In Europe, the stakes were higher. Let\'s make this exciting.',
        'I\'ve bankrupted dukes and princes. You?',
        'Your aura suggests you\'re due for a win... or a catastrophic loss.'
      ]]
    ]),

    specialRules: [
      'Multiple games available simultaneously',
      'Progressive jackpots across all tables',
      'Jackpot grows throughout the cruise',
      'Hitting jackpot triggers in any game',
      'Free drinks and meals included',
      'Live entertainment between games',
      'Formal dress code enforced',
      'Cheating results in being put ashore at next stop'
    ],
    cheatDetectionModifier: 20, // +20% detection (good security)
    supernaturalElement: false,

    eventBuffs: [
      {
        id: 'river_luck',
        name: 'River Luck',
        description: 'The flowing river brings good fortune',
        effect: '+3% win rate all games',
        duration: 300
      },
      {
        id: 'luxury_confidence',
        name: 'Luxury Confidence',
        description: 'The elegant surroundings boost your confidence',
        effect: '+5 to bluffing checks',
        duration: 300
      },
      {
        id: 'live_entertainment',
        name: 'Live Entertainment',
        description: 'The jazz music soothes your nerves',
        effect: '-10% stress from losses',
        duration: 300
      }
    ],
    eventDebuffs: []
  },

  // ============================================================================
  // GENTLEMAN'S GAME
  // ============================================================================
  GENTLEMAN_GAME: {
    id: 'gentleman_game',
    name: 'The Gentleman\'s Game',
    description: 'An exclusive high-society gambling event. Poise, reputation, and skill are all required.',
    lore: 'The social elite of the territory gather monthly for refined gambling. This isn\'t about money—it\'s about status, honor, and proving one\'s superiority.',
    eventType: HighStakesEventType.GENTLEMAN_GAME,

    schedule: {
      frequency: 'MONTHLY',
      dayOfMonth: 1,
      hour: 19, // 7 PM
      duration: 180 // 3 hours
    },
    duration: 180,

    entryFee: 5000,
    entryRequirements: [
      {
        type: 'LEVEL',
        value: 15,
        description: 'Character level 15 or higher'
      },
      {
        type: 'REPUTATION',
        value: 60,
        description: 'Positive reputation of 60+ (any faction)'
      },
      {
        type: 'ITEM',
        value: 'formal_attire',
        description: 'Must own formal attire'
      }
    ],
    maxParticipants: 30,
    minimumParticipants: 10,

    availableGames: [
      'poker_seven_card_stud',
      'blackjack_high_stakes',
      'roulette_european'
    ],
    mainGame: 'poker_seven_card_stud',

    prizePool: 200000,
    guaranteedPrizes: [
      {
        type: 'REPUTATION',
        amount: 10,
        description: 'All participants gain +10 reputation'
      },
      {
        type: 'TITLE',
        title: 'Gentleman Gambler',
        description: 'Exclusive social title'
      }
    ],
    leaderboardPrizes: [
      {
        type: 'GOLD',
        amount: 100000,
        description: '1st Place: 100,000 gold'
      },
      {
        type: 'ITEM',
        itemId: 'secret_society_invitation',
        description: '1st Place: Secret Society Invitation'
      },
      {
        type: 'REPUTATION',
        amount: 25,
        description: '1st Place: +25 reputation all factions'
      },
      {
        type: 'GOLD',
        amount: 50000,
        description: '2nd Place: 50,000 gold'
      },
      {
        type: 'GOLD',
        amount: 25000,
        description: '3rd Place: 25,000 gold'
      }
    ],

    location: 'fort_ashford_club',
    ambiance: 'Persian rugs, leather chairs, and the subtle scent of expensive cigars. Servants move silently, attending to every need. Here, breeding and wealth meet skill.',
    specialNPCs: [
      'baron_von_stakes',
      'lady_fortune_noble',
      'colonel_retired',
      'judge_highborn'
    ],
    npcDialogue: new Map([
      ['baron_von_stakes', [
        'In the Old Country, we gambled for kingdoms. This is merely practice.',
        'Your pedigree shows in your play, or lack thereof.',
        'Wealth is nothing without class, friend.'
      ]],
      ['lady_fortune_noble', [
        'A lady never shows her tells.',
        'How... quaint. Your bet, I mean.',
        'In society, as in cards, one must know when to fold.'
      ]],
      ['colonel_retired', [
        'I won this estate in a game like this.',
        'Strategy, discipline, honor. The rest is mere luck.',
        'A gentleman always pays his debts. Do you?'
      ]],
      ['judge_highborn', [
        'I judge character as I judge cases. Harshly.',
        'The law is clear, as should be your intentions.',
        'Guilt and tells have much in common.'
      ]]
    ]),

    specialRules: [
      'Formal dress code strictly enforced',
      'Proper etiquette required at all times',
      'No crude language or behavior',
      'Cheating is grounds for permanent social exile',
      'Debts must be paid within 24 hours',
      'Winners expected to be gracious',
      'Losers expected to maintain dignity',
      'Opens doors to secret society membership'
    ],
    cheatDetectionModifier: 40, // +40% detection
    supernaturalElement: false,

    eventBuffs: [
      {
        id: 'refined_composure',
        name: 'Refined Composure',
        description: 'Your cultured demeanor aids your play',
        effect: '+10 to all social checks',
        duration: 180
      },
      {
        id: 'high_society',
        name: 'High Society',
        description: 'Networking opportunities abound',
        effect: 'Unlock new quest lines with society NPCs',
        duration: 180
      }
    ],
    eventDebuffs: [
      {
        id: 'social_pressure',
        name: 'Social Pressure',
        description: 'The weight of society\'s expectations',
        effect: 'Larger reputation losses for poor play',
        duration: 180
      }
    ]
  },

  // ============================================================================
  // THE DEVIL'S GAME
  // ============================================================================
  DEVILS_GAME: {
    id: 'devils_game',
    name: 'The Devil\'s Game',
    description: 'A supernatural poker game where you wager more than gold. Play against the mysterious stranger himself.',
    lore: 'At midnight under the blood moon, a stranger in black appears at the crossroads. He offers a game of poker where the stakes transcend mere gold. Win, and receive power beyond imagination. Lose... and pay a terrible price.',
    eventType: HighStakesEventType.DEVILS_GAME,

    schedule: {
      frequency: 'MONTHLY',
      dayOfMonth: 13, // 13th of month
      hour: 0, // Midnight
      duration: 60 // 1 hour
    },
    duration: 60,

    entryFee: 0, // No gold cost, but other costs...
    entryRequirements: [
      {
        type: 'LEVEL',
        value: 25,
        description: 'Character level 25 or higher'
      },
      {
        type: 'ACHIEVEMENT',
        value: 'dark_path',
        description: 'Have taken morally questionable actions'
      }
    ],
    maxParticipants: 7, // 7 players max (supernatural number)
    minimumParticipants: 1,

    availableGames: ['poker_five_card_draw'],
    mainGame: 'poker_five_card_draw',

    prizePool: 0, // Not measured in gold
    guaranteedPrizes: [],
    leaderboardPrizes: [
      {
        type: 'UNIQUE_ITEM',
        itemId: 'devils_coin',
        description: 'Winner: The Devil\'s Coin (cursed legendary item)'
      },
      {
        type: 'ITEM',
        itemId: 'soul_contract',
        description: 'Winner: Soul Contract (unique quest item)'
      },
      {
        type: 'GOLD',
        amount: 666666,
        description: 'Winner: 666,666 cursed gold'
      }
    ],

    location: 'crossroads_midnight',
    ambiance: 'The crossroads is lit only by a blood-red moon. A single table appears from nowhere, surrounded by darkness. The stranger deals cards with hands too pale, wearing a smile too wide.',
    specialNPCs: [
      'the_stranger', // The Devil himself
      'lost_souls', // Previous losers watching
      'crossroads_guardian'
    ],
    npcDialogue: new Map([
      ['the_stranger', [
        'Welcome, friend. Care to play for... everything?',
        'I always win in the end. Always. But tonight? Who knows.',
        'Your soul shines brightly. I wonder how it tastes.',
        'Fold now, and merely lose your gold. Play on... and risk far more.',
        'I\'ve played this game for millennia. You were born yesterday.',
        'The cards know the truth of your heart. Can you hide from them?'
      ]],
      ['lost_souls', [
        'Don\'t play! He never loses!',
        'I thought I could win... I thought wrong.',
        'Save yourself while you still can!',
        'The game is rigged from the start!'
      ]],
      ['crossroads_guardian', [
        'Turn back. This is your last chance.',
        'No one who wins this game is ever truly free.',
        'The price of victory here is steeper than defeat.',
        'I guard this place to warn, not to stop. The choice is yours.'
      ]]
    ]),

    specialRules: [
      'Single hand of poker determines winner',
      'Winner receives legendary cursed items',
      'Loser loses ALL GOLD and receives permanent debuff',
      'No cheating possible (supernatural forces prevent it)',
      'Once you sit, you cannot leave until game ends',
      'Spectators see disturbing visions',
      'Winner may receive quest: "Breaking the Deal"',
      'Losing has permanent consequences'
    ],
    cheatDetectionModifier: 999, // Impossible to cheat against the Devil
    supernaturalElement: true,

    eventBuffs: [
      {
        id: 'supernatural_insight',
        name: 'Supernatural Insight',
        description: 'You see beyond the veil',
        effect: '+20 to observation, but disturbing visions',
        duration: 60
      }
    ],
    eventDebuffs: [
      {
        id: 'devils_presence',
        name: 'The Devil\'s Presence',
        description: 'Playing against evil incarnate',
        effect: '-10 to all checks from overwhelming fear',
        duration: 60
      },
      {
        id: 'doom_looming',
        name: 'Doom Looming',
        description: 'The stakes are your very soul',
        effect: 'If you lose: Lose all gold, permanent -5 to Spirit stat, cursed',
        duration: 9999
      },
      {
        id: 'winners_curse',
        name: 'Winner\'s Curse',
        description: 'Winning has its own price',
        effect: 'If you win: Gain power but mark your soul as Devil-touched',
        duration: 9999
      }
    ]
  },

  // ============================================================================
  // CHINESE NEW YEAR GAMBLING FESTIVAL
  // ============================================================================
  CHINESE_NEW_YEAR_FESTIVAL: {
    id: 'chinese_new_year_festival',
    name: 'Chinese New Year Gambling Festival',
    description: 'Annual festival celebrating Chinese New Year with traditional gambling games and incredible prizes.',
    lore: 'The Chinese Diaspora community celebrates New Year with a massive gambling festival. Traditional games, incredible food, and life-changing prizes await.',
    eventType: HighStakesEventType.LEGENDARY_POKER_NIGHT, // Reusing type

    schedule: {
      frequency: 'MONTHLY', // Yearly but representing as monthly for game purposes
      dayOfMonth: 1,
      hour: 18, // 6 PM
      duration: 360 // 6 hours
    },
    duration: 360,

    entryFee: 100,
    entryRequirements: [
      {
        type: 'LEVEL',
        value: 5,
        description: 'Character level 5 or higher'
      }
    ],
    maxParticipants: 500,
    minimumParticipants: 50,

    availableGames: [
      'craps_frontier', // Mahjong would be here if implemented
      'poker_five_card_draw',
      'three_card_monte_street',
      'wheel_of_fortune_carnival'
    ],
    mainGame: 'craps_frontier',

    prizePool: 888888, // Lucky number 8
    guaranteedPrizes: [
      {
        type: 'ITEM',
        itemId: 'lucky_red_envelope',
        description: 'Red envelope with random gold (88-888)'
      },
      {
        type: 'ITEM',
        itemId: 'festival_lantern',
        description: 'Decorative festival lantern'
      }
    ],
    leaderboardPrizes: [
      {
        type: 'GOLD',
        amount: 288888,
        description: '1st Place: 288,888 gold (lucky 8s)'
      },
      {
        type: 'ITEM',
        itemId: 'golden_dragon_statue',
        description: '1st Place: Golden Dragon Statue (unique decoration)'
      },
      {
        type: 'REPUTATION',
        amount: 50,
        description: '1st Place: +50 Chinese Diaspora reputation'
      },
      {
        type: 'GOLD',
        amount: 88888,
        description: '2nd-5th Place: 88,888 gold each'
      }
    ],

    location: 'chinese_quarter',
    ambiance: 'Red lanterns illuminate the streets. Fireworks explode overhead. The smell of dumplings and noodles fills the air. Joy and hope radiate from every corner.',
    specialNPCs: [
      'master_zhang',
      'lucky_li',
      'fortune_teller_mei',
      'dragon_dancer_chen'
    ],
    npcDialogue: new Map([
      ['master_zhang', [
        '新年快乐! Happy New Year!',
        'May fortune smile upon you this year.',
        'The dragon brings luck to those who are worthy.'
      ]],
      ['lucky_li', [
        'I won three years in a row. This year... who knows?',
        'Eight is the luckiest number. Bet accordingly.',
        'My grandmother says the dragon favors the bold.'
      ]],
      ['fortune_teller_mei', [
        'I see great fortune in your future... or great loss.',
        'The spirits whisper your luck today is...',
        'Cross my palm with gold and I\'ll tell you how to win.'
      ]],
      ['dragon_dancer_chen', [
        'When the dragon dances, luck flows like water!',
        'Follow the dragon, follow your fortune!',
        'The dragon has blessed these games!'
      ]]
    ]),

    specialRules: [
      'Traditional Chinese gambling customs observed',
      'Lucky number 8 appears frequently in prizes',
      'Red envelopes given randomly throughout event',
      'Dragon dance performances boost luck temporarily',
      'Traditional foods restore energy',
      'All participants welcome regardless of faction',
      'Fireworks signal major wins',
      'Lucky draws every hour'
    ],
    cheatDetectionModifier: 10, // +10% (moderate security)
    supernaturalElement: false,

    eventBuffs: [
      {
        id: 'new_year_luck',
        name: 'New Year Luck',
        description: 'The new year brings fresh fortune',
        effect: '+8% win rate (lucky number)',
        duration: 360
      },
      {
        id: 'dragon_blessing',
        name: 'Dragon\'s Blessing',
        description: 'The dragon brings prosperity',
        effect: '+15% chance of bonus prizes',
        duration: 360
      },
      {
        id: 'festival_joy',
        name: 'Festival Joy',
        description: 'The celebratory atmosphere lifts spirits',
        effect: 'Reduced losses from losing streaks',
        duration: 360
      }
    ],
    eventDebuffs: []
  }
};

// Helper function to get event by ID
export function getHighStakesEventById(eventId: string): HighStakesEvent | undefined {
  return HIGH_STAKES_EVENTS[eventId];
}

// Helper function to get events by type
export function getEventsByType(eventType: HighStakesEventType): HighStakesEvent[] {
  return Object.values(HIGH_STAKES_EVENTS).filter(event => event.eventType === eventType);
}

// Helper function to get currently active events (based on schedule)
export function getActiveEvents(currentDate: Date): HighStakesEvent[] {
  return Object.values(HIGH_STAKES_EVENTS).filter(event => {
    return isEventActive(event, currentDate);
  });
}

// Helper function to check if event is currently active
export function isEventActive(event: HighStakesEvent, currentDate: Date): boolean {
  const schedule = event.schedule;
  const currentHour = currentDate.getHours();
  const currentDayOfWeek = currentDate.getDay();
  const currentDayOfMonth = currentDate.getDate();

  switch (schedule.frequency) {
    case 'HOURLY':
      // Event runs every hour at specified minute
      return true;

    case 'DAILY':
      // Event runs at specified hour
      return currentHour === schedule.hour;

    case 'WEEKLY':
      // Event runs on specified day of week at specified hour
      return currentDayOfWeek === schedule.dayOfWeek && currentHour === schedule.hour;

    case 'MONTHLY':
      // Event runs on specified day of month at specified hour
      return currentDayOfMonth === schedule.dayOfMonth && currentHour === schedule.hour;

    default:
      return false;
  }
}

// Helper function to get next event occurrence
export function getNextEventTime(event: HighStakesEvent, currentDate: Date): Date {
  const nextDate = new Date(currentDate);
  const schedule = event.schedule;

  switch (schedule.frequency) {
    case 'HOURLY':
      nextDate.setHours(nextDate.getHours() + 1);
      nextDate.setMinutes(0, 0, 0);
      break;

    case 'DAILY':
      nextDate.setDate(nextDate.getDate() + 1);
      nextDate.setHours(schedule.hour, 0, 0, 0);
      break;

    case 'WEEKLY':
      const daysUntilEvent = (schedule.dayOfWeek! - currentDate.getDay() + 7) % 7 || 7;
      nextDate.setDate(nextDate.getDate() + daysUntilEvent);
      nextDate.setHours(schedule.hour, 0, 0, 0);
      break;

    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + 1);
      nextDate.setDate(schedule.dayOfMonth!);
      nextDate.setHours(schedule.hour, 0, 0, 0);
      break;
  }

  return nextDate;
}
