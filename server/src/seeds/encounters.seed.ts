/**
 * Encounters Seed Data
 *
 * 80 random encounters for Desperados Destiny
 * Split between Combat, Event, Discovery, and Story encounters
 * Balanced across danger levels and regions
 */

import mongoose from 'mongoose';

export interface EncounterOutcome {
  id: string;
  label: string;
  description: string;
  effects: {
    gold?: number;
    xp?: number;
    damage?: number;
    items?: string[];
    reputation?: { faction: string; amount: number };
  };
  requirements?: {
    minLevel?: number;
    skill?: { id: string; level: number };
    item?: string;
  };
}

export interface Encounter {
  id: string;
  name: string;
  description: string;
  type: 'combat' | 'event' | 'discovery' | 'story';
  minDangerLevel: number;
  maxDangerLevel: number;
  regions: string[];
  timeRestriction: 'day' | 'night' | 'any';
  outcomes: EncounterOutcome[];
}

// ========================================
// COMBAT ENCOUNTERS (20)
// ========================================

const combatEncounters: Encounter[] = [
  // Low Danger Combat (1-3)
  {
    id: 'rattlesnake-nest',
    name: 'Rattlesnake Nest',
    description: 'You stumble into a nest of angry rattlesnakes coiled beneath a rock outcropping. Their rattles fill the air with a deadly warning. One wrong move could be fatal.',
    type: 'combat',
    minDangerLevel: 1,
    maxDangerLevel: 3,
    regions: ['dusty_flats', 'devils_canyon', 'frontier'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'fight-snakes',
        label: 'Kill the Snakes',
        description: 'You draw your weapon and carefully dispatch the serpents one by one.',
        effects: { xp: 25, damage: 10, items: ['snake-venom'] }
      },
      {
        id: 'flee-carefully',
        label: 'Back Away Slowly',
        description: 'You carefully retreat without provoking an attack.',
        effects: { xp: 10 }
      },
      {
        id: 'harvest-venom',
        label: 'Harvest Venom (Craft)',
        description: 'You skillfully extract venom from the snakes for medicinal use.',
        effects: { xp: 40, gold: 25, items: ['snake-venom', 'snake-venom'] },
        requirements: { skill: { id: 'craft', level: 3 } }
      }
    ]
  },
  {
    id: 'coyote-pack',
    name: 'Coyote Pack',
    description: 'A pack of mangy coyotes circles you, emboldened by hunger. Their eyes gleam with desperate cunning as they test your defenses.',
    type: 'combat',
    minDangerLevel: 2,
    maxDangerLevel: 4,
    regions: ['dusty_flats', 'frontier', 'outlaw_territory'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'shoot-leader',
        label: 'Shoot the Alpha',
        description: 'You drop the pack leader with a well-aimed shot. The others scatter.',
        effects: { xp: 30, gold: 15, items: ['coyote-pelt'] }
      },
      {
        id: 'intimidate',
        label: 'Fire Warning Shot',
        description: 'You fire into the air and shout. The coyotes retreat.',
        effects: { xp: 20 }
      },
      {
        id: 'hunt-pack',
        label: 'Hunt Them Down (Combat)',
        description: 'You track and eliminate the entire pack for their pelts.',
        effects: { xp: 50, gold: 40, damage: 15, items: ['coyote-pelt', 'coyote-pelt', 'coyote-pelt'] },
        requirements: { skill: { id: 'combat', level: 5 } }
      }
    ]
  },
  {
    id: 'rabid-dog',
    name: 'Rabid Dog',
    description: 'A foam-mouthed dog staggers toward you, snarling and snapping. Rabies has turned it into a mindless killing machine. It must be put down before it spreads the disease.',
    type: 'combat',
    minDangerLevel: 1,
    maxDangerLevel: 3,
    regions: ['town', 'frontier', 'ghost_towns'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'put-down',
        label: 'Shoot the Dog',
        description: 'You end the animal\'s suffering with a clean shot.',
        effects: { xp: 20, reputation: { faction: 'settlerAlliance', amount: 5 } }
      },
      {
        id: 'run-away',
        label: 'Run Away',
        description: 'You flee before it can bite you, warning others about the rabid animal.',
        effects: { xp: 10 }
      }
    ]
  },

  // Medium Danger Combat (4-6)
  {
    id: 'bandit-ambush',
    name: 'Bandit Ambush',
    description: 'Three rough-looking outlaws step from behind rocks with guns drawn. "Empty your pockets, friend. Real slow-like."',
    type: 'combat',
    minDangerLevel: 4,
    maxDangerLevel: 6,
    regions: ['dusty_flats', 'devils_canyon', 'outlaw_territory', 'frontier'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'fight-bandits',
        label: 'Draw on Them',
        description: 'You go for your gun. It\'s three against one, but you\'ve got the element of surprise.',
        effects: { xp: 60, gold: 35, damage: 25, items: ['stolen-goods'] }
      },
      {
        id: 'pay-bandits',
        label: 'Hand Over Gold',
        description: 'You toss them a pouch of gold. They take it and let you pass.',
        effects: { gold: -20, xp: 10 }
      },
      {
        id: 'bluff-lawman',
        label: 'Bluff as Lawman (Cunning)',
        description: 'You flash a fake badge and claim a posse is right behind you. They believe it.',
        effects: { xp: 50, reputation: { faction: 'frontera', amount: -5 } },
        requirements: { skill: { id: 'cunning', level: 8 } }
      }
    ]
  },
  {
    id: 'wolf-pack',
    name: 'Hungry Wolf Pack',
    description: 'Gray shapes emerge from the brush - a wolf pack on the hunt. Their ribs show beneath their fur. Winter has been hard, and they see you as prey.',
    type: 'combat',
    minDangerLevel: 4,
    maxDangerLevel: 7,
    regions: ['sangre_mountains', 'sacred_lands', 'devils_canyon'],
    timeRestriction: 'night',
    outcomes: [
      {
        id: 'fight-wolves',
        label: 'Stand and Fight',
        description: 'You fight off the pack, taking several bites in the process.',
        effects: { xp: 70, gold: 30, damage: 30, items: ['wolf-pelt', 'wolf-pelt'] }
      },
      {
        id: 'climb-tree',
        label: 'Climb to Safety',
        description: 'You scramble up a tree and wait them out. They eventually leave.',
        effects: { xp: 30 }
      },
      {
        id: 'alpha-shot',
        label: 'Snipe the Alpha (Combat)',
        description: 'You drop the pack leader from distance. The others scatter without their leader.',
        effects: { xp: 90, gold: 45, damage: 10, items: ['alpha-wolf-pelt'] },
        requirements: { skill: { id: 'combat', level: 12 } }
      }
    ]
  },
  {
    id: 'bounty-hunter-confrontation',
    name: 'Bounty Hunter',
    description: 'A hard-eyed man with a shotgun steps into your path. "Got a warrant for your arrest, friend. You coming quiet, or do we do this the hard way?"',
    type: 'combat',
    minDangerLevel: 5,
    maxDangerLevel: 8,
    regions: ['town', 'frontier', 'dusty_flats'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'duel-hunter',
        label: 'Draw on Him',
        description: 'You go for your iron. Only the faster man walks away.',
        effects: { xp: 80, gold: 50, damage: 35, items: ['bounty-hunter-badge'] }
      },
      {
        id: 'bribe-hunter',
        label: 'Bribe Him',
        description: 'You offer double what the bounty pays. He considers, then takes it.',
        effects: { gold: -75, xp: 30 }
      },
      {
        id: 'convince-innocence',
        label: 'Claim Mistaken Identity (Spirit)',
        description: 'You convince him he has the wrong person. He apologizes and leaves.',
        effects: { xp: 60 },
        requirements: { skill: { id: 'spirit', level: 10 } }
      }
    ]
  },
  {
    id: 'mountain-lion',
    name: 'Mountain Lion',
    description: 'A massive cougar drops from the rocks above, fangs bared. You\'re in its territory now, and it won\'t back down.',
    type: 'combat',
    minDangerLevel: 5,
    maxDangerLevel: 7,
    regions: ['sangre_mountains', 'devils_canyon', 'sacred_lands'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'shoot-lion',
        label: 'Shoot It',
        description: 'You fire multiple shots as it leaps. It falls mere feet from you.',
        effects: { xp: 75, gold: 60, damage: 25, items: ['mountain-lion-pelt'] }
      },
      {
        id: 'scare-off',
        label: 'Make Yourself Large',
        description: 'You raise your arms and roar. The lion backs off, reconsidering.',
        effects: { xp: 40 }
      }
    ]
  },
  {
    id: 'rival-gang-patrol',
    name: 'Rival Gang Patrol',
    description: 'Four armed gang members spot you. They wear the colors of a gang hostile to yours. Their hands drift toward their weapons.',
    type: 'combat',
    minDangerLevel: 5,
    maxDangerLevel: 7,
    regions: ['town', 'outlaw_territory', 'frontier'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'gunfight',
        label: 'Start Shooting',
        description: 'Lead starts flying. You take several hits but drop them all.',
        effects: { xp: 85, gold: 40, damage: 40, items: ['gang-colors'] }
      },
      {
        id: 'parley',
        label: 'Call for Parley',
        description: 'You invoke neutral ground. They respect it this time.',
        effects: { xp: 35 }
      },
      {
        id: 'challenge-leader',
        label: 'Challenge Their Leader (Combat)',
        description: 'You call out their leader for single combat. The others respect the outcome.',
        effects: { xp: 100, gold: 55, damage: 30, reputation: { faction: 'frontera', amount: 10 } },
        requirements: { skill: { id: 'combat', level: 15 } }
      }
    ]
  },
  {
    id: 'grizzly-bear',
    name: 'Grizzly Bear',
    description: 'An enormous grizzly rears up on its hind legs, roaring. You\'ve gotten between a mother and her cubs. She will defend them to the death.',
    type: 'combat',
    minDangerLevel: 6,
    maxDangerLevel: 9,
    regions: ['sangre_mountains', 'sacred_lands'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'kill-bear',
        label: 'Fight the Bear',
        description: 'You empty your gun into the charging bear. It takes everything you have to bring her down.',
        effects: { xp: 100, gold: 80, damage: 50, items: ['grizzly-pelt'] }
      },
      {
        id: 'back-away',
        label: 'Retreat Slowly',
        description: 'You back away with your eyes down, showing you\'re not a threat. She lets you go.',
        effects: { xp: 50 }
      }
    ]
  },

  // High Danger Combat (7-10)
  {
    id: 'infamous-gunslinger',
    name: 'Infamous Gunslinger',
    description: '"I know who you are," the stranger says, hand hovering over a pearl-handled revolver. "Let\'s see if your reputation is earned or just talk."',
    type: 'combat',
    minDangerLevel: 7,
    maxDangerLevel: 10,
    regions: ['town', 'frontier', 'outlaw_territory'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'duel-gunslinger',
        label: 'Accept the Duel',
        description: 'You face off at high noon. Only one of you will walk away.',
        effects: { xp: 150, gold: 100, damage: 45, items: ['gunslingers-revolver'], reputation: { faction: 'frontera', amount: 15 } }
      },
      {
        id: 'decline-duel',
        label: 'Walk Away',
        description: 'You turn your back and walk away. Your reputation takes a hit.',
        effects: { xp: 20, reputation: { faction: 'frontera', amount: -10 } }
      },
      {
        id: 'cheat-duel',
        label: 'Cheat the Duel (Cunning)',
        description: 'You\'ve rigged this before it started. A hidden derringer ends it quick.',
        effects: { xp: 120, gold: 100, items: ['gunslingers-revolver'] },
        requirements: { skill: { id: 'cunning', level: 20 } }
      }
    ]
  },
  {
    id: 'cavalry-deserters',
    name: 'Cavalry Deserters',
    description: 'Five Army deserters with military weapons have set up an ambush. They\'ve been living as bandits since they fled their unit. They\'re desperate and dangerous.',
    type: 'combat',
    minDangerLevel: 7,
    maxDangerLevel: 9,
    regions: ['dusty_flats', 'devils_canyon', 'frontier'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'fight-deserters',
        label: 'Fight Them',
        description: 'Military training makes them tough opponents, but you prevail.',
        effects: { xp: 120, gold: 75, damage: 50, items: ['army-rifle', 'cavalry-saber'] }
      },
      {
        id: 'report-deserters',
        label: 'Report to Army',
        description: 'You note their location and report to Fort Ashford. The Army handles it.',
        effects: { xp: 60, gold: 50, reputation: { faction: 'settlerAlliance', amount: 15 } },
        requirements: { minLevel: 15 }
      }
    ]
  },
  {
    id: 'wendigo-encounter',
    name: 'Something in the Dark',
    description: 'In the mountain darkness, something moves. It walks on two legs but moves like an animal. The Nahi whisper of the Wendigo - those who tasted human flesh and became cursed. Whatever it is, it\'s hunting you.',
    type: 'combat',
    minDangerLevel: 8,
    maxDangerLevel: 10,
    regions: ['sangre_mountains', 'sacred_lands'],
    timeRestriction: 'night',
    outcomes: [
      {
        id: 'fight-creature',
        label: 'Stand and Fight',
        description: 'You face the horror with gun and blade. It nearly kills you before you bring it down.',
        effects: { xp: 200, gold: 150, damage: 70, items: ['wendigo-fang'] }
      },
      {
        id: 'flee-terror',
        label: 'Run for Your Life',
        description: 'You flee in blind panic. You survive, barely, but the memory haunts you.',
        effects: { xp: 50, damage: 20 }
      },
      {
        id: 'banish-spirit',
        label: 'Perform Banishing Ritual (Spirit)',
        description: 'You remember the Nahi teachings and perform the ancient ritual. It works.',
        effects: { xp: 250, gold: 200, items: ['blessed-talisman'], reputation: { faction: 'nahiCoalition', amount: 25 } },
        requirements: { skill: { id: 'spirit', level: 25 } }
      }
    ]
  },
  {
    id: 'marshals-posse',
    name: 'U.S. Marshal\'s Posse',
    description: 'A full posse of six lawmen with a federal marshal leading them. They have warrants and they\'re not taking no for an answer. This is serious.',
    type: 'combat',
    minDangerLevel: 8,
    maxDangerLevel: 10,
    regions: ['town', 'frontier', 'dusty_flats'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'shootout',
        label: 'Fight the Law',
        description: 'You make your stand against the law itself. This will not end well.',
        effects: { xp: 150, gold: 80, damage: 80, reputation: { faction: 'settlerAlliance', amount: -30 } }
      },
      {
        id: 'surrender',
        label: 'Surrender Peacefully',
        description: 'You give up. They take you to jail, but you\'ll live to see another day.',
        effects: { xp: 30, gold: -100 }
      },
      {
        id: 'prove-innocence',
        label: 'Present Alibi (Spirit)',
        description: 'You have proof you were elsewhere. They verify it and apologize.',
        effects: { xp: 80, reputation: { faction: 'settlerAlliance', amount: 10 } },
        requirements: { skill: { id: 'spirit', level: 20 }, item: 'alibi-documents' }
      }
    ]
  },

  // Specialized Combat Encounters
  {
    id: 'skinwalker',
    name: 'Skinwalker',
    description: 'The Nahi witch wears the skin of a coyote, but walks on two legs. Dark magic crackles around its fingers. You\'ve stumbled into sacred ground you shouldn\'t have.',
    type: 'combat',
    minDangerLevel: 8,
    maxDangerLevel: 10,
    regions: ['sacred_lands', 'sangre_mountains'],
    timeRestriction: 'night',
    outcomes: [
      {
        id: 'fight-skinwalker',
        label: 'Attack with Silver',
        description: 'Your silver bullets find their mark. The skinwalker falls, reverting to human form.',
        effects: { xp: 180, gold: 120, damage: 60, items: ['skinwalker-fang'] },
        requirements: { item: 'silver-bullets' }
      },
      {
        id: 'flee-cursed',
        label: 'Run Away',
        description: 'You flee, but the curse follows you. Strange dreams plague you for weeks.',
        effects: { xp: 40, damage: 20 }
      },
      {
        id: 'break-curse',
        label: 'Counterspell (Spirit)',
        description: 'You know the counter-ritual. The skinwalker\'s power shatters.',
        effects: { xp: 220, gold: 150, items: ['blessed-amulet'], reputation: { faction: 'nahiCoalition', amount: 30 } },
        requirements: { skill: { id: 'spirit', level: 30 } }
      }
    ]
  },
  {
    id: 'texas-rangers',
    name: 'Texas Rangers',
    description: 'Three hard men in dusters with Ranger stars pinned to their chests. They\'re looking for someone, and their eyes are fixed on you.',
    type: 'combat',
    minDangerLevel: 6,
    maxDangerLevel: 9,
    regions: ['frontier', 'dusty_flats', 'border_territories'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'fight-rangers',
        label: 'Draw on the Rangers',
        description: 'You go for your gun against three of the best. It\'s suicide, but you take one with you.',
        effects: { xp: 100, damage: 90, reputation: { faction: 'settlerAlliance', amount: -40 } }
      },
      {
        id: 'talk-way-out',
        label: 'Talk Your Way Out (Spirit)',
        description: 'You convince them they want someone else. They believe you.',
        effects: { xp: 80 },
        requirements: { skill: { id: 'spirit', level: 15 } }
      },
      {
        id: 'cooperate',
        label: 'Cooperate Fully',
        description: 'You answer their questions truthfully. They let you go.',
        effects: { xp: 40, reputation: { faction: 'settlerAlliance', amount: 5 } }
      }
    ]
  },
  {
    id: 'wild-stallion',
    name: 'Wild Mustang Stallion',
    description: 'A magnificent black stallion charges at you, protecting his herd. His hooves could cave in your skull, but if you could tame him, he\'d be worth a fortune.',
    type: 'combat',
    minDangerLevel: 4,
    maxDangerLevel: 6,
    regions: ['dusty_flats', 'frontier', 'sacred_lands'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'shoot-stallion',
        label: 'Shoot the Horse',
        description: 'You put the stallion down. What a waste of such a magnificent animal.',
        effects: { xp: 30, gold: 20, items: ['horse-meat'] }
      },
      {
        id: 'let-go',
        label: 'Let Him Pass',
        description: 'You back away and let the herd escape. The stallion watches you, then flees.',
        effects: { xp: 25 }
      },
      {
        id: 'tame-stallion',
        label: 'Attempt to Tame (Spirit)',
        description: 'You spend hours calming and approaching the stallion. Finally, he accepts you.',
        effects: { xp: 150, gold: 200, items: ['wild-mustang'] },
        requirements: { skill: { id: 'spirit', level: 18 } }
      }
    ]
  },
  {
    id: 'claim-jumpers',
    name: 'Claim Jumpers',
    description: 'Four armed men are working YOUR mining claim. They see you and reach for their weapons. This is your livelihood they\'re stealing.',
    type: 'combat',
    minDangerLevel: 5,
    maxDangerLevel: 7,
    regions: ['sangre_mountains', 'ghost_towns'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'fight-jumpers',
        label: 'Run Them Off',
        description: 'You charge in shooting. They scatter, leaving their tools behind.',
        effects: { xp: 70, gold: 45, damage: 30, items: ['mining-tools'] }
      },
      {
        id: 'share-claim',
        label: 'Offer to Partner',
        description: 'You propose splitting the claim. They agree - more workers means more gold.',
        effects: { xp: 50, gold: 30 }
      },
      {
        id: 'legal-action',
        label: 'Get the Law (Spirit)',
        description: 'You fetch the marshal with your deed. The law removes them legally.',
        effects: { xp: 60, gold: 20, reputation: { faction: 'settlerAlliance', amount: 10 } },
        requirements: { item: 'mining-deed' }
      }
    ]
  },
  {
    id: 'confederate-holdouts',
    name: 'Confederate Holdouts',
    description: 'Gray-coated soldiers emerge from a hidden camp. The war ended twenty years ago, but they never surrendered. They see all outsiders as enemies.',
    type: 'combat',
    minDangerLevel: 7,
    maxDangerLevel: 10,
    regions: ['devils_canyon', 'ghost_towns', 'outlaw_territory'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'fight-rebels',
        label: 'Fight Them',
        description: 'You fight the ghosts of the old war. They die believing the Confederacy still stands.',
        effects: { xp: 130, gold: 90, damage: 55, items: ['confederate-saber', 'civil-war-medal'] }
      },
      {
        id: 'tell-truth',
        label: 'Tell Them the War Ended',
        description: 'You show them a newspaper. They don\'t believe you and attack anyway.',
        effects: { xp: 90, damage: 45 }
      }
    ]
  },
  {
    id: 'la-llorona',
    name: 'La Llorona',
    description: 'A woman in white drifts along the riverbank, weeping for her drowned children. As she turns toward you, her face is a skull. She reaches for you with skeletal hands.',
    type: 'combat',
    minDangerLevel: 9,
    maxDangerLevel: 10,
    regions: ['border_territories', 'devils_canyon'],
    timeRestriction: 'night',
    outcomes: [
      {
        id: 'fight-spirit',
        label: 'Shoot the Spirit',
        description: 'Your bullets pass through her. She wails and drains your life force before vanishing.',
        effects: { xp: 80, damage: 65 }
      },
      {
        id: 'run-from-llorona',
        label: 'Run to Sacred Ground',
        description: 'You flee to a church. She cannot follow you there.',
        effects: { xp: 100, damage: 25 }
      },
      {
        id: 'exorcise-spirit',
        label: 'Perform Ritual (Spirit)',
        description: 'You know the prayers. La Llorona finds peace and gifts you her shawl before fading.',
        effects: { xp: 300, items: ['la-lloronas-shawl'], reputation: { faction: 'frontera', amount: 25 } },
        requirements: { skill: { id: 'spirit', level: 35 } }
      }
    ]
  },
  {
    id: 'outlaw-king',
    name: 'The Outlaw King',
    description: 'The most wanted man in three territories steps out of a cantina. "Well now," he says, hand on his gun. "Looks like you\'re after my bounty. Let\'s see if you can collect."',
    type: 'combat',
    minDangerLevel: 9,
    maxDangerLevel: 10,
    regions: ['outlaw_territory', 'town', 'frontier'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'duel-king',
        label: 'Accept His Challenge',
        description: 'The fastest gun in the West versus you. It\'s the stuff of legends.',
        effects: { xp: 250, gold: 300, damage: 60, items: ['outlaw-kings-revolver'], reputation: { faction: 'frontera', amount: -50 } }
      },
      {
        id: 'decline',
        label: 'Walk Away',
        description: 'You\'re not ready for this fight. He laughs as you leave.',
        effects: { xp: 30, reputation: { faction: 'frontera', amount: -15 } }
      },
      {
        id: 'poison-drink',
        label: 'Poison His Drink (Cunning)',
        description: 'You slip poison in his whiskey earlier. He collapses before the duel begins.',
        effects: { xp: 200, gold: 300, items: ['outlaw-kings-revolver'] },
        requirements: { skill: { id: 'cunning', level: 30 }, item: 'poison' }
      }
    ]
  }
];

// ========================================
// EVENT ENCOUNTERS (20)
// ========================================

const eventEncounters: Encounter[] = [
  {
    id: 'stranded-traveler',
    name: 'Stranded Traveler',
    description: 'A well-dressed easterner waves you down desperately. His wagon has a broken wheel, and he\'s been stuck here for hours under the brutal sun.',
    type: 'event',
    minDangerLevel: 1,
    maxDangerLevel: 5,
    regions: ['dusty_flats', 'frontier', 'border_territories'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'help-repair',
        label: 'Help Repair the Wheel',
        description: 'You spend an hour helping fix the wheel. He pays you generously.',
        effects: { xp: 30, gold: 25 }
      },
      {
        id: 'sell-wheel',
        label: 'Sell Him a Wheel',
        description: 'Lucky you have a spare. You sell it at a significant markup.',
        effects: { xp: 20, gold: 50 },
        requirements: { item: 'wagon-wheel' }
      },
      {
        id: 'rob-traveler',
        label: 'Rob Him',
        description: 'He\'s helpless and alone. You take his valuables and leave him stranded.',
        effects: { xp: 25, gold: 60, items: ['pocket-watch'], reputation: { faction: 'settlerAlliance', amount: -15 } }
      },
      {
        id: 'ignore',
        label: 'Keep Riding',
        description: 'Not your problem. You ride past without stopping.',
        effects: { xp: 5 }
      }
    ]
  },
  {
    id: 'merchant-caravan',
    name: 'Merchant Wagon',
    description: 'A merchant\'s wagon loaded with goods trundles along the trail. The proprietor waves cheerfully, eager to make a sale to anyone he meets.',
    type: 'event',
    minDangerLevel: 1,
    maxDangerLevel: 8,
    regions: ['dusty_flats', 'frontier', 'town', 'border_territories'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'browse-goods',
        label: 'Browse His Wares',
        description: 'You look through his traveling shop and make a few purchases.',
        effects: { xp: 15, gold: -20, items: ['trade-goods', 'rope'] }
      },
      {
        id: 'sell-to-merchant',
        label: 'Sell Your Goods',
        description: 'You unload some items you\'ve been carrying.',
        effects: { xp: 15, gold: 35 }
      },
      {
        id: 'get-information',
        label: 'Ask for News',
        description: 'Merchants hear everything. He shares valuable information.',
        effects: { xp: 25, items: ['rumor-map'] }
      },
      {
        id: 'rob-merchant',
        label: 'Rob the Merchant',
        description: 'You draw your gun and take everything. He won\'t forget this.',
        effects: { xp: 30, gold: 80, items: ['stolen-goods'], reputation: { faction: 'settlerAlliance', amount: -20 } }
      }
    ]
  },
  {
    id: 'dust-devil',
    name: 'Dust Devil',
    description: 'A massive dust devil swirls across the plain, heading straight for you. It\'s too big to outrun. Sand and debris whip through the air like bullets.',
    type: 'event',
    minDangerLevel: 2,
    maxDangerLevel: 6,
    regions: ['dusty_flats', 'frontier', 'border_territories'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'take-cover',
        label: 'Take Cover Behind Rocks',
        description: 'You hunker down and wait it out. Sand gets everywhere, but you\'re unharmed.',
        effects: { xp: 20 }
      },
      {
        id: 'push-through',
        label: 'Push Through It',
        description: 'You lower your head and force your way through. It batters you, but you make it.',
        effects: { xp: 30, damage: 15 }
      },
      {
        id: 'spirit-calm',
        label: 'Pray to Calm It (Spirit)',
        description: 'You recite the Nahi wind prayer. The dust devil dissipates.',
        effects: { xp: 50, reputation: { faction: 'nahiCoalition', amount: 5 } },
        requirements: { skill: { id: 'spirit', level: 8 } }
      }
    ]
  },
  {
    id: 'wandering-preacher',
    name: 'Wandering Preacher',
    description: 'A ragged preacher carrying a worn Bible walks the dusty trail. "Brother! Sister! Have you heard the Good Word? The end times are coming to this wicked land!"',
    type: 'event',
    minDangerLevel: 1,
    maxDangerLevel: 5,
    regions: ['frontier', 'dusty_flats', 'town'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'receive-blessing',
        label: 'Receive His Blessing',
        description: 'You bow your head and let him pray over you. You feel spiritually renewed.',
        effects: { xp: 25, items: ['blessed-charm'] }
      },
      {
        id: 'give-charity',
        label: 'Give Him Gold',
        description: 'You donate to his ministry. He blesses you and moves on.',
        effects: { xp: 30, gold: -15, reputation: { faction: 'settlerAlliance', amount: 10 } }
      },
      {
        id: 'debate-theology',
        label: 'Debate Scripture (Spirit)',
        description: 'You engage in theological debate. He\'s impressed by your knowledge.',
        effects: { xp: 40, items: ['rare-bible'] },
        requirements: { skill: { id: 'spirit', level: 10 } }
      },
      {
        id: 'ignore-preacher',
        label: 'Ignore Him',
        description: 'You ride past without acknowledging him.',
        effects: { xp: 5 }
      }
    ]
  },
  {
    id: 'injured-soldier',
    name: 'Wounded Soldier',
    description: 'A cavalry soldier lies by the trail, clutching a gut wound. His horse is dead nearby. He\'s been ambushed and left for dead.',
    type: 'event',
    minDangerLevel: 3,
    maxDangerLevel: 7,
    regions: ['frontier', 'dusty_flats', 'devils_canyon'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'help-soldier',
        label: 'Treat His Wounds',
        description: 'You patch him up as best you can. He\'ll live to fight another day.',
        effects: { xp: 40, gold: 30, reputation: { faction: 'settlerAlliance', amount: 15 } }
      },
      {
        id: 'mercy-kill',
        label: 'End His Suffering',
        description: 'The wound is mortal. You give him water and make it quick.',
        effects: { xp: 25, items: ['cavalry-saber'] }
      },
      {
        id: 'rob-dying-man',
        label: 'Take His Valuables',
        description: 'He won\'t need them anymore. You strip his body and leave.',
        effects: { xp: 20, gold: 35, items: ['army-rifle'], reputation: { faction: 'settlerAlliance', amount: -25 } }
      },
      {
        id: 'leave-him',
        label: 'Keep Moving',
        description: 'Not your fight. You ride on.',
        effects: { xp: 5 }
      }
    ]
  },
  {
    id: 'native-hunting-party',
    name: 'Nahi Hunting Party',
    description: 'Five Nahi warriors on horseback block your path. They\'re not hostile yet, but they\'re armed and watching you carefully. This is their land.',
    type: 'event',
    minDangerLevel: 4,
    maxDangerLevel: 7,
    regions: ['sacred_lands', 'sangre_mountains', 'devils_canyon'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'offer-tobacco',
        label: 'Offer Tobacco',
        description: 'You present tobacco as a sign of peace. They accept and let you pass.',
        effects: { xp: 35, gold: -10, reputation: { faction: 'nahiCoalition', amount: 10 } }
      },
      {
        id: 'show-respect',
        label: 'Show Respect (Spirit)',
        description: 'You speak the greeting and show knowledge of their customs. They respect you.',
        effects: { xp: 50, reputation: { faction: 'nahiCoalition', amount: 15 } },
        requirements: { skill: { id: 'spirit', level: 12 } }
      },
      {
        id: 'draw-weapon',
        label: 'Draw Your Weapon',
        description: 'You make a show of force. They ride off, but you\'ve made enemies.',
        effects: { xp: 20, reputation: { faction: 'nahiCoalition', amount: -20 } }
      },
      {
        id: 'turn-back',
        label: 'Turn Back',
        description: 'You respect their territory and leave. They watch you go.',
        effects: { xp: 15 }
      }
    ]
  },
  {
    id: 'flash-flood',
    name: 'Flash Flood',
    description: 'Water roars down the canyon with no warning. A wall of debris-filled water crashes toward you. The Sangre River has become a killer.',
    type: 'event',
    minDangerLevel: 5,
    maxDangerLevel: 8,
    regions: ['devils_canyon', 'sangre_mountains'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'climb-high',
        label: 'Climb to High Ground',
        description: 'You scramble up the canyon wall. The flood passes below you.',
        effects: { xp: 50, damage: 10 }
      },
      {
        id: 'outrun-flood',
        label: 'Try to Outrun It',
        description: 'You spur your horse into a gallop. You barely make it, soaking wet and exhausted.',
        effects: { xp: 60, damage: 25 }
      }
    ]
  },
  {
    id: 'lost-child',
    name: 'Lost Child',
    description: 'A small child, no more than seven, wanders alone crying. She\'s been separated from her parents\' wagon train and has been lost for hours.',
    type: 'event',
    minDangerLevel: 1,
    maxDangerLevel: 4,
    regions: ['frontier', 'dusty_flats', 'town'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'return-child',
        label: 'Help Find Her Parents',
        description: 'You spend hours tracking the wagon train and reunite them. The parents are overjoyed.',
        effects: { xp: 50, gold: 40, reputation: { faction: 'settlerAlliance', amount: 20 } }
      },
      {
        id: 'bring-to-town',
        label: 'Bring Her to Town',
        description: 'You take her to the nearest settlement. The marshal will sort it out.',
        effects: { xp: 30, reputation: { faction: 'settlerAlliance', amount: 10 } }
      },
      {
        id: 'leave-child',
        label: 'Leave Her',
        description: 'Not your problem. You ride on.',
        effects: { xp: 5, reputation: { faction: 'settlerAlliance', amount: -30 } }
      }
    ]
  },
  {
    id: 'snake-oil-salesman',
    name: 'Snake Oil Salesman',
    description: 'A flashy man in a checkered suit stands beside a garishly painted wagon. "Step right up! Dr. Miraculous\'s Cure-All Tonic! Cures everything from baldness to bullets!"',
    type: 'event',
    minDangerLevel: 1,
    maxDangerLevel: 5,
    regions: ['town', 'frontier', 'dusty_flats'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'buy-tonic',
        label: 'Buy His Tonic',
        description: 'You purchase a bottle. It tastes like whiskey and kerosene.',
        effects: { xp: 15, gold: -20, items: ['snake-oil'] }
      },
      {
        id: 'expose-fraud',
        label: 'Expose Him as a Fraud',
        description: 'You reveal his con to the crowd. They chase him out of town.',
        effects: { xp: 35, reputation: { faction: 'settlerAlliance', amount: 10 } }
      },
      {
        id: 'learn-pitch',
        label: 'Learn His Pitch (Cunning)',
        description: 'You watch his technique carefully. You could use these tricks yourself.',
        effects: { xp: 40, items: ['con-artist-notes'] },
        requirements: { skill: { id: 'cunning', level: 8 } }
      },
      {
        id: 'ignore-salesman',
        label: 'Ignore Him',
        description: 'You\'ve seen this con before. You keep walking.',
        effects: { xp: 10 }
      }
    ]
  },
  {
    id: 'ghost-lights',
    name: 'Ghost Lights',
    description: 'Strange lights dance in the darkness ahead - blue-green orbs floating above the ground. The Nahi call them spirit lights. Settlers say they\'re swamp gas. Either way, they\'re unsettling.',
    type: 'event',
    minDangerLevel: 3,
    maxDangerLevel: 7,
    regions: ['devils_canyon', 'ghost_towns', 'sacred_lands'],
    timeRestriction: 'night',
    outcomes: [
      {
        id: 'follow-lights',
        label: 'Follow the Lights',
        description: 'You chase the mysterious lights. They lead you to an old cache of gold!',
        effects: { xp: 60, gold: 100 }
      },
      {
        id: 'avoid-lights',
        label: 'Avoid Them',
        description: 'You give the lights a wide berth and continue on.',
        effects: { xp: 20 }
      },
      {
        id: 'pray-to-spirits',
        label: 'Pray to the Spirits (Spirit)',
        description: 'You perform a prayer ceremony. The lights form a path to safety.',
        effects: { xp: 50, reputation: { faction: 'nahiCoalition', amount: 10 } },
        requirements: { skill: { id: 'spirit', level: 15 } }
      }
    ]
  },
  {
    id: 'medicine-show',
    name: 'Medicine Show',
    description: 'A traveling medicine show has set up in a tent. Musicians play, dancers entertain, and a "doctor" sells miracle cures to the crowd.',
    type: 'event',
    minDangerLevel: 1,
    maxDangerLevel: 4,
    regions: ['town', 'frontier'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'watch-show',
        label: 'Watch the Show',
        description: 'You enjoy the entertainment and have a good time.',
        effects: { xp: 25, gold: -10 }
      },
      {
        id: 'pickpocket-crowd',
        label: 'Pickpocket the Crowd (Cunning)',
        description: 'Everyone\'s distracted by the show. Easy pickings.',
        effects: { xp: 40, gold: 50 },
        requirements: { skill: { id: 'cunning', level: 10 } }
      },
      {
        id: 'skip-show',
        label: 'Keep Moving',
        description: 'You\'ve got places to be.',
        effects: { xp: 5 }
      }
    ]
  },
  {
    id: 'runaway-wagon',
    name: 'Runaway Wagon',
    description: 'A wagon careens down the trail, horses spooked and driver thrown. A woman screams from inside as it barrels toward a cliff edge.',
    type: 'event',
    minDangerLevel: 4,
    maxDangerLevel: 7,
    regions: ['dusty_flats', 'frontier', 'sangre_mountains'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'catch-wagon',
        label: 'Chase and Stop It (Combat)',
        description: 'You gallop alongside and leap aboard, bringing the horses under control.',
        effects: { xp: 80, gold: 60, damage: 20, reputation: { faction: 'settlerAlliance', amount: 20 } },
        requirements: { skill: { id: 'combat', level: 12 } }
      },
      {
        id: 'watch-crash',
        label: 'Watch It Go',
        description: 'There\'s nothing you can do. It goes over the edge.',
        effects: { xp: 10 }
      }
    ]
  },
  {
    id: 'dying-gunfighter',
    name: 'Dying Gunfighter',
    description: 'An old gunslinger lies against a rock, gut-shot and dying. He gestures you over. "Listen close, friend. I got something to tell you..."',
    type: 'event',
    minDangerLevel: 3,
    maxDangerLevel: 7,
    regions: ['frontier', 'outlaw_territory', 'ghost_towns'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'hear-secret',
        label: 'Listen to His Secret',
        description: 'With his dying breath, he tells you where he buried his life\'s takings.',
        effects: { xp: 50, items: ['treasure-map'] }
      },
      {
        id: 'take-guns',
        label: 'Take His Guns',
        description: 'He won\'t need them where he\'s going. Nice revolvers.',
        effects: { xp: 30, items: ['gunslingers-revolver'] }
      },
      {
        id: 'comfort-him',
        label: 'Comfort Him',
        description: 'You hold his hand and ease his passing. He dies grateful.',
        effects: { xp: 40 }
      }
    ]
  },
  {
    id: 'card-game',
    name: 'High-Stakes Card Game',
    description: 'You\'re invited to a poker game in a smoky saloon back room. The buy-in is steep, but the pot is enormous.',
    type: 'event',
    minDangerLevel: 3,
    maxDangerLevel: 6,
    regions: ['town', 'frontier', 'outlaw_territory'],
    timeRestriction: 'night',
    outcomes: [
      {
        id: 'play-honest',
        label: 'Play Honestly',
        description: 'You play straight. Lady Luck smiles on you tonight.',
        effects: { xp: 50, gold: 80 }
      },
      {
        id: 'cheat-cards',
        label: 'Cheat (Cunning)',
        description: 'You mark cards and read tells. You clean up nicely.',
        effects: { xp: 60, gold: 150 },
        requirements: { skill: { id: 'cunning', level: 15 } }
      },
      {
        id: 'fold-out',
        label: 'Fold and Leave',
        description: 'This game is too rich for your blood. You cash out early.',
        effects: { xp: 20, gold: -20 }
      }
    ]
  },
  {
    id: 'cholera-outbreak',
    name: 'Cholera Outbreak',
    description: 'You arrive in a small settlement ravaged by cholera. The dead are piled in the street, and the sick moan from every building.',
    type: 'event',
    minDangerLevel: 5,
    maxDangerLevel: 8,
    regions: ['town', 'frontier', 'ghost_towns'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'help-sick',
        label: 'Help Treat the Sick',
        description: 'You risk infection to help. You save several lives but expose yourself.',
        effects: { xp: 80, gold: 40, damage: 30, reputation: { faction: 'settlerAlliance', amount: 25 } }
      },
      {
        id: 'quarantine',
        label: 'Enforce Quarantine',
        description: 'You help seal off the town to prevent spread. It\'s harsh, but necessary.',
        effects: { xp: 60, reputation: { faction: 'settlerAlliance', amount: 15 } }
      },
      {
        id: 'flee-disease',
        label: 'Leave Immediately',
        description: 'You get out before you catch it. Survival comes first.',
        effects: { xp: 20 }
      }
    ]
  },
  {
    id: 'wild-horses',
    name: 'Wild Horse Herd',
    description: 'A magnificent herd of wild mustangs thunders across the plain. Capturing even one would be valuable, but they\'re wary and fast.',
    type: 'event',
    minDangerLevel: 3,
    maxDangerLevel: 6,
    regions: ['dusty_flats', 'frontier', 'sacred_lands'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'lasso-horse',
        label: 'Attempt to Catch One',
        description: 'You rope a young mare after an exhausting chase.',
        effects: { xp: 60, gold: 100, items: ['wild-mustang'] }
      },
      {
        id: 'watch-herd',
        label: 'Watch Them Run',
        description: 'You admire the beauty and freedom. Some things shouldn\'t be caught.',
        effects: { xp: 30 }
      },
      {
        id: 'tame-alpha',
        label: 'Tame the Lead Mare (Spirit)',
        description: 'You approach the lead mare with patience and respect. She accepts you.',
        effects: { xp: 100, gold: 200, items: ['alpha-mare'], reputation: { faction: 'nahiCoalition', amount: 15 } },
        requirements: { skill: { id: 'spirit', level: 20 } }
      }
    ]
  },
  {
    id: 'buffalo-stampede',
    name: 'Buffalo Stampede',
    description: 'The ground shakes. A massive buffalo herd stampedes toward you, fleeing from hunters. Thousands of tons of meat and horn charging in blind panic.',
    type: 'event',
    minDangerLevel: 5,
    maxDangerLevel: 8,
    regions: ['dusty_flats', 'sacred_lands'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'get-to-rocks',
        label: 'Climb to Safety',
        description: 'You scramble up a rock formation as the herd thunders past below.',
        effects: { xp: 50, damage: 10 }
      },
      {
        id: 'ride-ahead',
        label: 'Try to Outrun Them',
        description: 'You gallop for your life. You barely make it, but your horse is exhausted.',
        effects: { xp: 60, damage: 25 }
      },
      {
        id: 'turn-herd',
        label: 'Turn the Herd (Combat)',
        description: 'You fire shots and wave your arms, redirecting the stampede. Incredibly dangerous.',
        effects: { xp: 100, damage: 40, reputation: { faction: 'nahiCoalition', amount: 20 } },
        requirements: { skill: { id: 'combat', level: 18 } }
      }
    ]
  },
  {
    id: 'road-agent',
    name: 'Toll "Tax" Collector',
    description: 'A well-armed man blocks the trail. "This here\'s a toll road now. Ten dollars to pass." He has six friends in the rocks nearby.',
    type: 'event',
    minDangerLevel: 4,
    maxDangerLevel: 7,
    regions: ['dusty_flats', 'devils_canyon', 'frontier'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'pay-toll',
        label: 'Pay the "Toll"',
        description: 'It\'s cheaper than a gunfight. You hand over the gold.',
        effects: { xp: 15, gold: -25 }
      },
      {
        id: 'fight-agents',
        label: 'Fight Them',
        description: 'You refuse to pay. Lead starts flying.',
        effects: { xp: 70, gold: 40, damage: 40, items: ['road-agent-loot'] }
      },
      {
        id: 'bluff-marshal',
        label: 'Bluff as Marshal (Cunning)',
        description: 'You claim a posse is right behind you. They scatter.',
        effects: { xp: 55 },
        requirements: { skill: { id: 'cunning', level: 12 } }
      },
      {
        id: 'find-detour',
        label: 'Find Another Route',
        description: 'You circle around through rougher terrain.',
        effects: { xp: 25 }
      }
    ]
  },
  {
    id: 'blind-beggar',
    name: 'Blind Beggar',
    description: 'A blind old man sits by the trail with an empty cup. "Spare a coin for a blind man, friend?" His clothes are threadbare and he shivers in the cold.',
    type: 'event',
    minDangerLevel: 1,
    maxDangerLevel: 3,
    regions: ['town', 'frontier'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'give-charity',
        label: 'Give Him Gold',
        description: 'You drop several coins in his cup. He blesses you.',
        effects: { xp: 25, gold: -10, items: ['blessed-charm'] }
      },
      {
        id: 'give-food',
        label: 'Give Him Food',
        description: 'Gold won\'t fill his belly. You share your rations.',
        effects: { xp: 30, reputation: { faction: 'settlerAlliance', amount: 10 } }
      },
      {
        id: 'ignore-beggar',
        label: 'Ignore Him',
        description: 'You walk past without acknowledgment.',
        effects: { xp: 5 }
      },
      {
        id: 'rob-beggar',
        label: 'Rob Him',
        description: 'He\'s vulnerable. You take his few coins. You monster.',
        effects: { xp: 15, gold: 5, reputation: { faction: 'settlerAlliance', amount: -25 } }
      }
    ]
  },
  {
    id: 'settler-funeral',
    name: 'Settler Funeral',
    description: 'You come across a small funeral service. A family buries their father who died in a farming accident. They sing hymns with tears in their eyes.',
    type: 'event',
    minDangerLevel: 1,
    maxDangerLevel: 3,
    regions: ['frontier', 'dusty_flats'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'pay-respects',
        label: 'Pay Your Respects',
        description: 'You remove your hat and stand with them in silence.',
        effects: { xp: 25, reputation: { faction: 'settlerAlliance', amount: 10 } }
      },
      {
        id: 'offer-help',
        label: 'Offer to Help',
        description: 'You offer to help with their farm work. They accept gratefully.',
        effects: { xp: 40, gold: 20, reputation: { faction: 'settlerAlliance', amount: 15 } }
      },
      {
        id: 'move-on',
        label: 'Move On',
        description: 'You leave them to their grief.',
        effects: { xp: 10 }
      }
    ]
  }
];

// ========================================
// DISCOVERY ENCOUNTERS (20)
// ========================================

const discoveryEncounters: Encounter[] = [
  {
    id: 'hidden-cache',
    name: 'Bandit Cache',
    description: 'Behind a false rock face, you discover a hidden cache of supplies. Looks like bandits stashed their loot here.',
    type: 'discovery',
    minDangerLevel: 2,
    maxDangerLevel: 6,
    regions: ['devils_canyon', 'sangre_mountains', 'outlaw_territory'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'take-cache',
        label: 'Take Everything',
        description: 'You load up the stolen goods. Finders keepers.',
        effects: { xp: 40, gold: 80, items: ['stolen-goods', 'ammunition'] }
      },
      {
        id: 'report-cache',
        label: 'Report to Marshal',
        description: 'You mark the location and report it to the law.',
        effects: { xp: 50, gold: 40, reputation: { faction: 'settlerAlliance', amount: 15 } }
      }
    ]
  },
  {
    id: 'abandoned-camp',
    name: 'Abandoned Camp',
    description: 'A campsite sits empty, fire still smoldering. Whoever was here left in a hurry - coffee pot still on the coals, bedrolls scattered.',
    type: 'discovery',
    minDangerLevel: 3,
    maxDangerLevel: 7,
    regions: ['frontier', 'dusty_flats', 'devils_canyon', 'ghost_towns'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'loot-camp',
        label: 'Search the Camp',
        description: 'You find useful supplies and a small amount of gold.',
        effects: { xp: 35, gold: 25, items: ['coffee', 'rope'] }
      },
      {
        id: 'investigate-tracks',
        label: 'Investigate Tracks (Cunning)',
        description: 'You read the signs. They were attacked and fled west. You find their trail.',
        effects: { xp: 50, items: ['trail-map'] },
        requirements: { skill: { id: 'cunning', level: 10 } }
      },
      {
        id: 'avoid-camp',
        label: 'Stay Away',
        description: 'Something feels wrong. You keep moving.',
        effects: { xp: 15 }
      }
    ]
  },
  {
    id: 'unmarked-grave',
    name: 'Unmarked Grave',
    description: 'A fresh grave with no marker sits beneath a lone tree. A crude wooden cross and a pile of stones mark where someone was buried in haste.',
    type: 'discovery',
    minDangerLevel: 2,
    maxDangerLevel: 5,
    regions: ['frontier', 'ghost_towns', 'dusty_flats'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'say-prayer',
        label: 'Say a Prayer',
        description: 'You offer a prayer for the unknown soul.',
        effects: { xp: 25 }
      },
      {
        id: 'dig-up-grave',
        label: 'Dig Up the Grave',
        description: 'You exhume the body and find valuables buried with it.',
        effects: { xp: 30, gold: 50, items: ['pocket-watch'], reputation: { faction: 'settlerAlliance', amount: -15 } }
      },
      {
        id: 'investigate-death',
        label: 'Investigate (Cunning)',
        description: 'You examine the area carefully. This was murder, not a natural death.',
        effects: { xp: 45, items: ['murder-clue'] },
        requirements: { skill: { id: 'cunning', level: 8 } }
      }
    ]
  },
  {
    id: 'cave-entrance',
    name: 'Hidden Cave',
    description: 'Behind a waterfall, you spot the entrance to a cave. Water mist obscures it from casual view. Who knows what might be inside?',
    type: 'discovery',
    minDangerLevel: 4,
    maxDangerLevel: 8,
    regions: ['devils_canyon', 'sangre_mountains', 'sacred_lands'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'explore-cave',
        label: 'Explore the Cave',
        description: 'You venture inside with a torch. You find old mining equipment and a few gold nuggets.',
        effects: { xp: 60, gold: 70, items: ['gold-nugget'] }
      },
      {
        id: 'mark-cave',
        label: 'Mark for Later',
        description: 'You mark the location on your map to return with proper equipment.',
        effects: { xp: 30, items: ['cave-map'] }
      },
      {
        id: 'avoid-cave',
        label: 'Stay Out',
        description: 'Could be anything in there. Better safe than sorry.',
        effects: { xp: 15 }
      }
    ]
  },
  {
    id: 'wanted-poster',
    name: 'Wanted Poster',
    description: 'A fresh wanted poster is nailed to a post. "$500 REWARD - DEAD OR ALIVE." The face looks familiar...',
    type: 'discovery',
    minDangerLevel: 3,
    maxDangerLevel: 7,
    regions: ['town', 'frontier', 'dusty_flats'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'take-poster',
        label: 'Take the Poster',
        description: 'You memorize the face and details. Could be profitable.',
        effects: { xp: 25, items: ['wanted-poster'] }
      },
      {
        id: 'recognize-target',
        label: 'You Know This Person',
        description: 'You saw them just yesterday! You know where they are.',
        effects: { xp: 40, items: ['bounty-lead'] }
      },
      {
        id: 'ignore-poster',
        label: 'Ignore It',
        description: 'Bounty hunting is dangerous work.',
        effects: { xp: 10 }
      }
    ]
  },
  {
    id: 'ancient-petroglyphs',
    name: 'Ancient Petroglyphs',
    description: 'The canyon wall is covered in ancient carvings - spirals, handprints, and strange figures. Some are thousands of years old.',
    type: 'discovery',
    minDangerLevel: 2,
    maxDangerLevel: 6,
    regions: ['devils_canyon', 'sacred_lands', 'sangre_mountains'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'study-glyphs',
        label: 'Study the Carvings',
        description: 'You spend time examining the ancient art. It tells a story.',
        effects: { xp: 40, items: ['archaeological-notes'] }
      },
      {
        id: 'interpret-glyphs',
        label: 'Interpret Meaning (Spirit)',
        description: 'You understand the symbols. They mark a sacred site nearby.',
        effects: { xp: 60, items: ['sacred-site-map'], reputation: { faction: 'nahiCoalition', amount: 10 } },
        requirements: { skill: { id: 'spirit', level: 15 } }
      },
      {
        id: 'deface-glyphs',
        label: 'Carve Your Initials',
        description: 'You add your mark to history. The Nahi would be furious.',
        effects: { xp: 20, reputation: { faction: 'nahiCoalition', amount: -25 } }
      }
    ]
  },
  {
    id: 'ghost-town-building',
    name: 'Abandoned Saloon',
    description: 'A decaying saloon stands in a ghost town, its sign barely hanging on. Poker hands are still on the tables, as if everyone just vanished mid-game.',
    type: 'discovery',
    minDangerLevel: 4,
    maxDangerLevel: 7,
    regions: ['ghost_towns'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'search-saloon',
        label: 'Search the Building',
        description: 'You carefully search the abandoned saloon and find valuables left behind.',
        effects: { xp: 50, gold: 60, items: ['antique-cards', 'whiskey-bottle'] }
      },
      {
        id: 'take-furniture',
        label: 'Salvage Furniture',
        description: 'The bar and tables are quality wood. You take what you can carry.',
        effects: { xp: 35, gold: 40 }
      },
      {
        id: 'respect-dead',
        label: 'Leave It Be',
        description: 'This is a grave of sorts. You leave without disturbing it.',
        effects: { xp: 25 }
      }
    ]
  },
  {
    id: 'prospectors-claim',
    name: 'Lost Prospector\'s Claim',
    description: 'You find a mining claim with rusty tools scattered about. A faded stake claims this land for "J. Henderson, 1867". No one\'s worked it in years.',
    type: 'discovery',
    minDangerLevel: 3,
    maxDangerLevel: 6,
    regions: ['sangre_mountains', 'devils_canyon', 'ghost_towns'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'dig-claim',
        label: 'Work the Claim',
        description: 'You spend hours digging. You find some gold dust and a small nugget.',
        effects: { xp: 55, gold: 75, items: ['gold-nugget'] }
      },
      {
        id: 'file-claim',
        label: 'File Your Own Claim',
        description: 'You officially register this claim in your name.',
        effects: { xp: 40, items: ['mining-deed'] }
      },
      {
        id: 'leave-claim',
        label: 'Move On',
        description: 'Mining is hard work. Not worth your time.',
        effects: { xp: 15 }
      }
    ]
  },
  {
    id: 'battlefield',
    name: 'Old Battlefield',
    description: 'Rusted weapons and sun-bleached bones mark an old battle site. Coalition and settler forces clashed here years ago. No one won.',
    type: 'discovery',
    minDangerLevel: 4,
    maxDangerLevel: 7,
    regions: ['dusty_flats', 'devils_canyon', 'sacred_lands'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'loot-battlefield',
        label: 'Scavenge Weapons',
        description: 'You search the dead and find salvageable equipment.',
        effects: { xp: 40, gold: 50, items: ['rusted-rifle', 'tomahawk'] }
      },
      {
        id: 'bury-dead',
        label: 'Bury the Dead',
        description: 'You spend hours giving proper burial to the fallen.',
        effects: { xp: 60, reputation: { faction: 'nahiCoalition', amount: 15 } }
      },
      {
        id: 'pay-respects',
        label: 'Moment of Silence',
        description: 'You honor the dead briefly and move on.',
        effects: { xp: 30 }
      }
    ]
  },
  {
    id: 'medicine-bundle',
    name: 'Medicine Bundle',
    description: 'Hanging from a tree branch is a Nahi medicine bundle - sacred objects wrapped in leather and decorated with feathers. It was placed here intentionally.',
    type: 'discovery',
    minDangerLevel: 2,
    maxDangerLevel: 5,
    regions: ['sacred_lands', 'sangre_mountains', 'devils_canyon'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'take-bundle',
        label: 'Take the Bundle',
        description: 'You take the sacred objects. The Nahi will consider this theft.',
        effects: { xp: 30, gold: 40, items: ['medicine-bundle'], reputation: { faction: 'nahiCoalition', amount: -30 } }
      },
      {
        id: 'respect-bundle',
        label: 'Leave an Offering',
        description: 'You leave tobacco as a sign of respect and move on.',
        effects: { xp: 40, reputation: { faction: 'nahiCoalition', amount: 15 } }
      },
      {
        id: 'ignore-bundle',
        label: 'Ignore It',
        description: 'Not your concern. You keep moving.',
        effects: { xp: 15 }
      }
    ]
  },
  {
    id: 'spanish-coin-hoard',
    name: 'Spanish Coin Hoard',
    description: 'In a crevice, you spot the glint of silver - Spanish coins from a hundred years ago when this was part of New Spain. A small fortune in antique currency.',
    type: 'discovery',
    minDangerLevel: 3,
    maxDangerLevel: 6,
    regions: ['devils_canyon', 'border_territories', 'outlaw_territory'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'take-coins',
        label: 'Take the Coins',
        description: 'You pocket the valuable antique coins.',
        effects: { xp: 50, gold: 120, items: ['spanish-silver'] }
      },
      {
        id: 'sell-to-collector',
        label: 'Find a Collector',
        description: 'These are worth more to the right buyer. You seek out a coin collector.',
        effects: { xp: 60, gold: 200 },
        requirements: { minLevel: 10 }
      }
    ]
  },
  {
    id: 'stagecoach-wreck',
    name: 'Wrecked Stagecoach',
    description: 'A stagecoach lies on its side, wheels shattered. Arrows stick from the wooden sides. This was an ambush, and recent.',
    type: 'discovery',
    minDangerLevel: 5,
    maxDangerLevel: 8,
    regions: ['dusty_flats', 'frontier', 'devils_canyon'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'search-wreck',
        label: 'Search the Wreckage',
        description: 'You find luggage and a strongbox. The passengers are nowhere to be found.',
        effects: { xp: 55, gold: 80, items: ['strongbox'] }
      },
      {
        id: 'track-ambushers',
        label: 'Track the Attackers (Cunning)',
        description: 'You follow the trail. You\'ll find who did this.',
        effects: { xp: 65, items: ['ambush-trail-map'] },
        requirements: { skill: { id: 'cunning', level: 12 } }
      },
      {
        id: 'report-wreck',
        label: 'Report to Authorities',
        description: 'You ride to the nearest fort and report the attack.',
        effects: { xp: 45, reputation: { faction: 'settlerAlliance', amount: 10 } }
      }
    ]
  },
  {
    id: 'meteor-impact',
    name: 'Meteor Crater',
    description: 'A smoking crater holds a strange metallic rock that fell from the sky. It\'s still warm and hums with unusual energy. The Nahi say such sky-stones have power.',
    type: 'discovery',
    minDangerLevel: 5,
    maxDangerLevel: 8,
    regions: ['dusty_flats', 'sangre_mountains'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'take-meteor',
        label: 'Take the Meteorite',
        description: 'You carefully extract the sky-stone. It\'s incredibly valuable.',
        effects: { xp: 70, gold: 150, items: ['meteorite'] }
      },
      {
        id: 'study-meteor',
        label: 'Study the Crater',
        description: 'You examine the impact site scientifically.',
        effects: { xp: 60, items: ['scientific-notes'] }
      },
      {
        id: 'ritual-meteor',
        label: 'Perform Ritual (Spirit)',
        description: 'You perform a ceremony to honor the sky-stone as the Nahi do.',
        effects: { xp: 80, items: ['blessed-meteorite'], reputation: { faction: 'nahiCoalition', amount: 20 } },
        requirements: { skill: { id: 'spirit', level: 18 } }
      }
    ]
  },
  {
    id: 'bear-den',
    name: 'Bear Den',
    description: 'You\'ve found a bear den in the rocks. The bear is out hunting, but inside you can see something glinting - looks like the bear has been collecting shiny objects.',
    type: 'discovery',
    minDangerLevel: 6,
    maxDangerLevel: 9,
    regions: ['sangre_mountains', 'sacred_lands'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'raid-den',
        label: 'Raid the Den',
        description: 'You quickly grab the treasures before the bear returns.',
        effects: { xp: 65, gold: 90, items: ['gold-nugget', 'shiny-trinkets'] }
      },
      {
        id: 'wait-bear-return',
        label: 'Wait for the Bear',
        description: 'You decide to confront the bear when it returns.',
        effects: { xp: 80, gold: 100, damage: 45, items: ['grizzly-pelt', 'bear-loot'] },
        requirements: { skill: { id: 'combat', level: 15 } }
      },
      {
        id: 'leave-den',
        label: 'Leave It Alone',
        description: 'Not worth tangling with a grizzly.',
        effects: { xp: 20 }
      }
    ]
  },
  {
    id: 'massacre-site',
    name: 'Massacre Site',
    description: 'Burned wagons and bodies mark where a wagon train was slaughtered. Coalition war party or bandits - hard to tell. The vultures have been at work.',
    type: 'discovery',
    minDangerLevel: 6,
    maxDangerLevel: 9,
    regions: ['devils_canyon', 'frontier', 'sacred_lands'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'investigate-massacre',
        label: 'Investigate (Cunning)',
        description: 'You examine the evidence carefully. This was made to look like Coalition work.',
        effects: { xp: 75, items: ['false-flag-evidence'] },
        requirements: { skill: { id: 'cunning', level: 20 } }
      },
      {
        id: 'loot-wagons',
        label: 'Loot the Wagons',
        description: 'The dead don\'t need their belongings anymore.',
        effects: { xp: 45, gold: 70, items: ['settler-goods'], reputation: { faction: 'settlerAlliance', amount: -20 } }
      },
      {
        id: 'bury-victims',
        label: 'Bury the Dead',
        description: 'You spend hours giving them a proper burial.',
        effects: { xp: 80, reputation: { faction: 'settlerAlliance', amount: 25 } }
      }
    ]
  },
  {
    id: 'natural-spring',
    name: 'Hidden Spring',
    description: 'You discover a crystal-clear spring fed by underground water. In this arid land, water is more valuable than gold. This could sustain a ranch or small settlement.',
    type: 'discovery',
    minDangerLevel: 2,
    maxDangerLevel: 5,
    regions: ['dusty_flats', 'devils_canyon', 'sangre_mountains'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'claim-spring',
        label: 'Claim the Spring',
        description: 'You file a water claim with the territorial office.',
        effects: { xp: 60, gold: 100, items: ['water-rights-deed'] }
      },
      {
        id: 'share-spring',
        label: 'Keep It Secret',
        description: 'You mark it on your private map for personal use.',
        effects: { xp: 40, items: ['secret-spring-map'] }
      },
      {
        id: 'tell-settlers',
        label: 'Tell Nearby Settlers',
        description: 'You lead struggling homesteaders to the water source.',
        effects: { xp: 50, gold: 40, reputation: { faction: 'settlerAlliance', amount: 20 } }
      }
    ]
  },
  {
    id: 'outlaw-corpse',
    name: 'Dead Outlaw',
    description: 'A notorious outlaw lies dead, shot through the back. Someone collected the bounty but left the body. His guns and personal effects are still on him.',
    type: 'discovery',
    minDangerLevel: 4,
    maxDangerLevel: 7,
    regions: ['outlaw_territory', 'devils_canyon', 'frontier'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'loot-outlaw',
        label: 'Take His Guns',
        description: 'Quality revolvers, engraved and deadly.',
        effects: { xp: 45, gold: 60, items: ['outlaw-revolver', 'outlaw-revolver'] }
      },
      {
        id: 'read-journal',
        label: 'Read His Journal',
        description: 'He kept a journal detailing hideouts and caches.',
        effects: { xp: 55, items: ['outlaw-journal'] }
      },
      {
        id: 'bury-outlaw',
        label: 'Bury Him',
        description: 'Even outlaws deserve a grave.',
        effects: { xp: 35, reputation: { faction: 'frontera', amount: 10 } }
      }
    ]
  },
  {
    id: 'rope-tree',
    name: 'Hanging Tree',
    description: 'A lone tree with a worn rope dangling from a thick branch. Three bodies still hang, swaying in the wind. Vigilante justice or lynch mob - hard to say which.',
    type: 'discovery',
    minDangerLevel: 5,
    maxDangerLevel: 8,
    regions: ['frontier', 'dusty_flats', 'outlaw_territory'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'cut-down-bodies',
        label: 'Cut Them Down',
        description: 'You cut the ropes and let the bodies rest on the ground.',
        effects: { xp: 40 }
      },
      {
        id: 'search-bodies',
        label: 'Search the Bodies',
        description: 'You check their pockets and find some valuables.',
        effects: { xp: 35, gold: 45, items: ['pocket-watch'], reputation: { faction: 'settlerAlliance', amount: -15 } }
      },
      {
        id: 'read-signs',
        label: 'Read the Signs',
        description: 'Crude signs around their necks list their alleged crimes.',
        effects: { xp: 30, items: ['vigilante-note'] }
      }
    ]
  },
  {
    id: 'fossil-bed',
    name: 'Fossil Bed',
    description: 'Ancient bones jut from the rock - massive creatures from before man walked the earth. Scientists back East would pay well for specimens.',
    type: 'discovery',
    minDangerLevel: 2,
    maxDangerLevel: 5,
    regions: ['devils_canyon', 'dusty_flats', 'sangre_mountains'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'extract-fossils',
        label: 'Extract Fossils (Craft)',
        description: 'You carefully excavate several valuable specimens.',
        effects: { xp: 60, gold: 80, items: ['dinosaur-bone', 'dinosaur-bone'] },
        requirements: { skill: { id: 'craft', level: 12 } }
      },
      {
        id: 'document-site',
        label: 'Document the Site',
        description: 'You sketch and note everything for scientific records.',
        effects: { xp: 50, items: ['scientific-survey'] }
      },
      {
        id: 'leave-fossils',
        label: 'Leave Them Be',
        description: 'Let the past stay buried.',
        effects: { xp: 20 }
      }
    ]
  },
  {
    id: 'smugglers-cave',
    name: 'Smuggler\'s Cache',
    description: 'A cave holds crates marked with Mexican customs stamps. This is contraband being smuggled across the border - weapons, alcohol, who knows what else.',
    type: 'discovery',
    minDangerLevel: 5,
    maxDangerLevel: 8,
    regions: ['border_territories', 'devils_canyon', 'outlaw_territory'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'steal-contraband',
        label: 'Take the Contraband',
        description: 'You load up everything you can carry. The smugglers won\'t be happy.',
        effects: { xp: 65, gold: 120, items: ['contraband', 'smuggled-weapons'] }
      },
      {
        id: 'report-smugglers',
        label: 'Report to Authorities',
        description: 'You inform the Army about the smuggling operation.',
        effects: { xp: 55, gold: 60, reputation: { faction: 'settlerAlliance', amount: 20 } }
      },
      {
        id: 'leave-cache',
        label: 'Back Away Quietly',
        description: 'These people will kill to protect their operation. Not worth it.',
        effects: { xp: 25 }
      }
    ]
  }
];

// ========================================
// STORY ENCOUNTERS (20)
// ========================================

const storyEncounters: Encounter[] = [
  {
    id: 'dying-mans-message',
    name: 'Dying Man\'s Last Words',
    description: 'A mortally wounded rider falls from his horse. With bloody hands he presses a sealed letter into yours. "Get this... to Kane Blackwood... Red Gulch..." Then he\'s gone.',
    type: 'story',
    minDangerLevel: 3,
    maxDangerLevel: 7,
    regions: ['frontier', 'dusty_flats', 'devils_canyon'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'deliver-letter',
        label: 'Deliver the Letter',
        description: 'You ride to Red Gulch and deliver it to Marshal Blackwood. His face darkens as he reads.',
        effects: { xp: 60, gold: 50, reputation: { faction: 'settlerAlliance', amount: 20 }, items: ['quest-corrupt-officials'] }
      },
      {
        id: 'read-letter',
        label: 'Read the Letter',
        description: 'You break the seal. It contains evidence of corruption at the highest levels.',
        effects: { xp: 50, items: ['corruption-evidence'] }
      },
      {
        id: 'burn-letter',
        label: 'Burn the Letter',
        description: 'This information is dangerous. You destroy it.',
        effects: { xp: 30 }
      }
    ]
  },
  {
    id: 'faction-skirmish',
    name: 'Border Skirmish',
    description: 'You witness Coalition warriors ambushing an Army patrol. Shots ring out, men fall. Both sides are fighting desperately.',
    type: 'story',
    minDangerLevel: 6,
    maxDangerLevel: 9,
    regions: ['sacred_lands', 'frontier', 'devils_canyon'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'help-army',
        label: 'Help the Army',
        description: 'You ride to the soldiers\' aid, turning the tide of battle.',
        effects: { xp: 80, gold: 60, damage: 35, reputation: { faction: 'settlerAlliance', amount: 30 } }
      },
      {
        id: 'help-coalition',
        label: 'Help the Coalition',
        description: 'You fire on the soldiers from ambush.',
        effects: { xp: 80, gold: 50, damage: 35, reputation: { faction: 'nahiCoalition', amount: 30 } }
      },
      {
        id: 'stay-neutral',
        label: 'Stay Hidden',
        description: 'This isn\'t your fight. You watch from concealment.',
        effects: { xp: 40 }
      },
      {
        id: 'call-truce',
        label: 'Call for Cease Fire (Spirit)',
        description: 'You ride between them waving a white flag. Miraculously, both sides stand down.',
        effects: { xp: 100, reputation: { faction: 'nahiCoalition', amount: 15 } },
        requirements: { skill: { id: 'spirit', level: 20 } }
      }
    ]
  },
  {
    id: 'ghost-sighting',
    name: 'Ghostly Apparition',
    description: 'In the moonlight, you see a transparent figure walking the canyon - a Confederate soldier, still marching with his rifle. He doesn\'t seem to see you. He fades as dawn approaches.',
    type: 'story',
    minDangerLevel: 4,
    maxDangerLevel: 7,
    regions: ['devils_canyon', 'ghost_towns'],
    timeRestriction: 'night',
    outcomes: [
      {
        id: 'follow-ghost',
        label: 'Follow the Ghost',
        description: 'You trail the apparition. It leads you to a hidden cache of Civil War gold.',
        effects: { xp: 70, gold: 150, items: ['confederate-gold'] }
      },
      {
        id: 'exorcise-ghost',
        label: 'Lay Him to Rest (Spirit)',
        description: 'You perform a ceremony to give the lost soul peace.',
        effects: { xp: 80, items: ['blessed-civil-war-medal'] },
        requirements: { skill: { id: 'spirit', level: 15 } }
      },
      {
        id: 'flee-ghost',
        label: 'Flee in Terror',
        description: 'You ride away from the supernatural sight as fast as your horse can run.',
        effects: { xp: 30 }
      }
    ]
  },
  {
    id: 'secret-meeting',
    name: 'Secret Meeting',
    description: 'You stumble upon a midnight meeting in the desert - territorial judge, Army captain, and a known outlaw all talking in hushed tones around a fire. You shouldn\'t be seeing this.',
    type: 'story',
    minDangerLevel: 7,
    maxDangerLevel: 10,
    regions: ['devils_canyon', 'outlaw_territory', 'frontier'],
    timeRestriction: 'night',
    outcomes: [
      {
        id: 'eavesdrop',
        label: 'Sneak Closer to Listen (Cunning)',
        description: 'You hear everything. They\'re planning to steal Coalition lands through legal fraud.',
        effects: { xp: 90, items: ['conspiracy-evidence'] },
        requirements: { skill: { id: 'cunning', level: 18 } }
      },
      {
        id: 'confront-conspirators',
        label: 'Confront Them',
        description: 'You step into the light. Big mistake. They draw weapons.',
        effects: { xp: 70, damage: 50, items: ['conspiracy-documents'] }
      },
      {
        id: 'sneak-away',
        label: 'Sneak Away',
        description: 'You back away carefully. They never knew you were there.',
        effects: { xp: 50 }
      }
    ]
  },
  {
    id: 'ancient-ruins',
    name: 'Ancient Ruins',
    description: 'Stone structures far older than any Nahi settlement rise from the desert - ancient pueblos of the old ones. The Nahi say powerful spirits guard these places.',
    type: 'story',
    minDangerLevel: 6,
    maxDangerLevel: 9,
    regions: ['sacred_lands', 'devils_canyon'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'explore-ruins',
        label: 'Explore the Ruins',
        description: 'You venture inside and find ancient artifacts and pottery.',
        effects: { xp: 75, gold: 100, items: ['ancient-pottery', 'ancient-artifacts'] }
      },
      {
        id: 'desecrate-ruins',
        label: 'Dig for Treasure',
        description: 'You dig up the floor looking for buried gold. You find some, but feel cursed.',
        effects: { xp: 60, gold: 120, damage: 30, reputation: { faction: 'nahiCoalition', amount: -40 } }
      },
      {
        id: 'honor-ruins',
        label: 'Leave an Offering (Spirit)',
        description: 'You leave tobacco and pray at the ancient altar. You feel blessed.',
        effects: { xp: 80, items: ['ancient-blessing'], reputation: { faction: 'nahiCoalition', amount: 25 } },
        requirements: { skill: { id: 'spirit', level: 20 } }
      }
    ]
  },
  {
    id: 'scalp-hunters',
    name: 'Scalp Hunters',
    description: 'Three rough men ride past with a string of scalps on their saddles - men, women, children. The Mexican government pays bounty per scalp. They don\'t ask questions.',
    type: 'story',
    minDangerLevel: 7,
    maxDangerLevel: 10,
    regions: ['border_territories', 'frontier', 'devils_canyon'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'attack-hunters',
        label: 'Attack the Hunters',
        description: 'You can\'t let this stand. You draw on them.',
        effects: { xp: 90, damage: 40, reputation: { faction: 'nahiCoalition', amount: 40 } }
      },
      {
        id: 'report-hunters',
        label: 'Report to Coalition',
        description: 'You ride to Kaiowa Mesa and describe the men. War Chief Red Thunder looks grim.',
        effects: { xp: 70, gold: 50, reputation: { faction: 'nahiCoalition', amount: 30 } }
      },
      {
        id: 'ignore-hunters',
        label: 'Look Away',
        description: 'You let them pass. You\'ll never forget what you saw.',
        effects: { xp: 30, reputation: { faction: 'nahiCoalition', amount: -20 } }
      }
    ]
  },
  {
    id: 'railroad-surveyors',
    name: 'Railroad Surveyors',
    description: 'A survey team is mapping a route through Coalition lands. They have Army escort. This railroad will bring more settlers and destroy the old ways.',
    type: 'story',
    minDangerLevel: 5,
    maxDangerLevel: 8,
    regions: ['sacred_lands', 'frontier', 'sangre_mountains'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'sabotage-survey',
        label: 'Sabotage Equipment',
        description: 'You sneak into camp and destroy their surveying tools.',
        effects: { xp: 70, reputation: { faction: 'nahiCoalition', amount: 25 } }
      },
      {
        id: 'warn-coalition',
        label: 'Warn the Coalition',
        description: 'You ride to Kaiowa Mesa and report the survey route.',
        effects: { xp: 60, gold: 40, reputation: { faction: 'nahiCoalition', amount: 20 } }
      },
      {
        id: 'offer-service',
        label: 'Offer to Guide Them',
        description: 'You volunteer to show them an alternate route that avoids sacred sites.',
        effects: { xp: 65, gold: 50, reputation: { faction: 'nahiCoalition', amount: 10 } }
      }
    ]
  },
  {
    id: 'prophecy-vision',
    name: 'The Prophet\'s Vision',
    description: 'The Prophet from The Frontera finds you on the trail. "I have seen you in the cards. A great choice approaches - one that will shape the fate of Sangre Territory."',
    type: 'story',
    minDangerLevel: 5,
    maxDangerLevel: 9,
    regions: ['frontier', 'outlaw_territory', 'devils_canyon'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'hear-prophecy',
        label: 'Hear the Prophecy',
        description: 'The Prophet deals cards and speaks of your destiny. The reading is cryptic but powerful.',
        effects: { xp: 80, items: ['destiny-prophecy'] }
      },
      {
        id: 'pay-prophet',
        label: 'Pay for Details',
        description: 'You cross the Prophet\'s palm with gold. More details emerge.',
        effects: { xp: 70, gold: -50, items: ['detailed-prophecy'] }
      },
      {
        id: 'reject-prophet',
        label: 'Reject the Fortune',
        description: 'You don\'t believe in such things. You ride on.',
        effects: { xp: 30 }
      }
    ]
  },
  {
    id: 'blood-feud',
    name: 'Blood Feud',
    description: 'Two families are engaged in a deadly feud. You witness the latest killing - a young man shot down in the street. Both sides demand you choose.',
    type: 'story',
    minDangerLevel: 6,
    maxDangerLevel: 9,
    regions: ['town', 'frontier', 'outlaw_territory'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'side-hernandez',
        label: 'Side with the Hernandez Family',
        description: 'You testify that the shooting was self-defense. The Montoyas swear revenge on you.',
        effects: { xp: 70, gold: 60, reputation: { faction: 'frontera', amount: 20 } }
      },
      {
        id: 'side-montoya',
        label: 'Side with the Montoya Family',
        description: 'You claim it was murder. The Hernandez family marks you as an enemy.',
        effects: { xp: 70, gold: 60, reputation: { faction: 'frontera', amount: 20 } }
      },
      {
        id: 'broker-peace',
        label: 'Broker Peace (Spirit)',
        description: 'You arrange a meeting and convince both families to end the feud.',
        effects: { xp: 120, gold: 100, reputation: { faction: 'frontera', amount: 40 } },
        requirements: { skill: { id: 'spirit', level: 22 } }
      },
      {
        id: 'stay-neutral',
        label: 'Claim Ignorance',
        description: 'You say you didn\'t see anything clearly. Both families are unsatisfied.',
        effects: { xp: 40 }
      }
    ]
  },
  {
    id: 'execution-witness',
    name: 'Public Execution',
    description: 'You witness a public hanging in Red Gulch. The condemned man shouts his innocence as they place the noose. The crowd is divided - some jeer, some weep.',
    type: 'story',
    minDangerLevel: 4,
    maxDangerLevel: 7,
    regions: ['town', 'frontier'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'watch-execution',
        label: 'Watch Quietly',
        description: 'You witness justice - or injustice - being carried out.',
        effects: { xp: 40 }
      },
      {
        id: 'stop-execution',
        label: 'Intervene (Combat)',
        description: 'You draw your gun and free the prisoner. The law won\'t forget this.',
        effects: { xp: 90, damage: 45, reputation: { faction: 'frontera', amount: 30 } },
        requirements: { skill: { id: 'combat', level: 18 } }
      },
      {
        id: 'investigate-innocence',
        label: 'Investigate His Claims',
        description: 'You have time to investigate. You find evidence he\'s telling the truth.',
        effects: { xp: 75, gold: 50, items: ['innocence-evidence'], reputation: { faction: 'settlerAlliance', amount: 20 } },
        requirements: { skill: { id: 'cunning', level: 15 } }
      }
    ]
  },
  {
    id: 'wendigo-warning',
    name: 'Wendigo Warning',
    description: 'A half-mad trapper stops you on the trail. "Don\'t go up the mountain! It\'s there! The Wendigo! It took my partner, ate him alive! You can still hear him screaming in your dreams!"',
    type: 'story',
    minDangerLevel: 7,
    maxDangerLevel: 10,
    regions: ['sangre_mountains', 'sacred_lands'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'heed-warning',
        label: 'Heed the Warning',
        description: 'You take an alternate route. Better safe than sorry.',
        effects: { xp: 40 }
      },
      {
        id: 'investigate-wendigo',
        label: 'Investigate',
        description: 'You venture up the mountain to see if the legend is true.',
        effects: { xp: 80, items: ['wendigo-quest'] }
      },
      {
        id: 'help-trapper',
        label: 'Help the Trapper',
        description: 'You get him medical attention and hear his full story.',
        effects: { xp: 60, items: ['trapper-journal'], reputation: { faction: 'settlerAlliance', amount: 10 } }
      }
    ]
  },
  {
    id: 'mine-collapse',
    name: 'Mine Collapse',
    description: 'The ground shakes and a cloud of dust erupts from Goldfinger\'s Mine. Screams echo from the tunnels. Men are trapped underground.',
    type: 'story',
    minDangerLevel: 5,
    maxDangerLevel: 8,
    regions: ['sangre_mountains'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'rescue-miners',
        label: 'Help Dig Them Out',
        description: 'You work for hours clearing rubble. You save several lives.',
        effects: { xp: 90, gold: 80, reputation: { faction: 'settlerAlliance', amount: 30 } }
      },
      {
        id: 'steal-during-chaos',
        label: 'Loot the Mine Office',
        description: 'Everyone\'s distracted. You slip into the office and crack the safe.',
        effects: { xp: 60, gold: 150, items: ['stolen-payroll'], reputation: { faction: 'settlerAlliance', amount: -30 } }
      },
      {
        id: 'direct-rescue',
        label: 'Organize the Rescue (Spirit)',
        description: 'You take charge and coordinate the effort efficiently. All miners are saved.',
        effects: { xp: 120, gold: 100, reputation: { faction: 'settlerAlliance', amount: 40 } },
        requirements: { skill: { id: 'spirit', level: 16 } }
      }
    ]
  },
  {
    id: 'skinwalker-rumor',
    name: 'Skinwalker Sighting',
    description: 'Settlers whisper that livestock are being killed by something that walks on two legs. Coalition scouts confirm tracks. A skinwalker is hunting near Kaiowa Mesa.',
    type: 'story',
    minDangerLevel: 8,
    maxDangerLevel: 10,
    regions: ['sacred_lands', 'frontier'],
    timeRestriction: 'night',
    outcomes: [
      {
        id: 'hunt-skinwalker',
        label: 'Hunt the Skinwalker',
        description: 'You track the creature to its lair.',
        effects: { xp: 100, items: ['skinwalker-hunt-quest'] }
      },
      {
        id: 'warn-settlers',
        label: 'Warn the Settlers',
        description: 'You spread word to stay indoors at night.',
        effects: { xp: 60, reputation: { faction: 'settlerAlliance', amount: 15 } }
      },
      {
        id: 'seek-elder',
        label: 'Consult Elder Wise Sky',
        description: 'You ride to Kaiowa Mesa and seek spiritual guidance.',
        effects: { xp: 75, items: ['skinwalker-ritual'], reputation: { faction: 'nahiCoalition', amount: 20 } }
      }
    ]
  },
  {
    id: 'treasure-map-discovery',
    name: 'Treasure Map',
    description: 'You win a poker game and the loser, too drunk to pay, offers a crumpled map. "Cortez treasure," he slurs. "Buried here two hundred years ago." It could be real or a con.',
    type: 'story',
    minDangerLevel: 4,
    maxDangerLevel: 7,
    regions: ['town', 'frontier', 'outlaw_territory'],
    timeRestriction: 'night',
    outcomes: [
      {
        id: 'follow-map',
        label: 'Follow the Map',
        description: 'You track down the location marked on the map.',
        effects: { xp: 70, items: ['cortez-treasure-quest'] }
      },
      {
        id: 'sell-map',
        label: 'Sell the Map',
        description: 'You find an eager buyer willing to pay good money.',
        effects: { xp: 50, gold: 100 }
      },
      {
        id: 'ignore-map',
        label: 'Throw It Away',
        description: 'Probably a fake anyway. You toss it in the fire.',
        effects: { xp: 20 }
      }
    ]
  },
  {
    id: 'bounty-poster-self',
    name: 'Your Own Wanted Poster',
    description: 'You see your own face on a wanted poster. "$300 REWARD - DEAD OR ALIVE." Someone\'s framing you for crimes you didn\'t commit.',
    type: 'story',
    minDangerLevel: 6,
    maxDangerLevel: 9,
    regions: ['town', 'frontier', 'dusty_flats'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'investigate-frame',
        label: 'Investigate Who Framed You',
        description: 'You start digging into who would set you up.',
        effects: { xp: 80, items: ['framing-investigation-quest'] }
      },
      {
        id: 'flee-territory',
        label: 'Leave the Territory',
        description: 'You need to disappear until this blows over.',
        effects: { xp: 50, gold: -50 }
      },
      {
        id: 'turn-self-in',
        label: 'Turn Yourself In',
        description: 'You surrender to Marshal Blackwood and claim innocence.',
        effects: { xp: 70, gold: -100, items: ['trial-quest'] }
      }
    ]
  },
  {
    id: 'army-deserter',
    name: 'Army Deserter',
    description: 'A young soldier in torn uniform begs for help. "I can\'t go back. They\'ll hang me for desertion. But Captain Cross ordered us to burn out Nahi families - women and children. I couldn\'t do it."',
    type: 'story',
    minDangerLevel: 5,
    maxDangerLevel: 8,
    regions: ['frontier', 'sacred_lands', 'devils_canyon'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'help-deserter',
        label: 'Help Him Escape',
        description: 'You guide him to The Frontera where he can disappear.',
        effects: { xp: 75, gold: 40, reputation: { faction: 'frontera', amount: 20 } }
      },
      {
        id: 'turn-in-deserter',
        label: 'Turn Him In',
        description: 'You hand him over to the Army. He\'ll face court martial.',
        effects: { xp: 50, gold: 60, reputation: { faction: 'settlerAlliance', amount: 20 } }
      },
      {
        id: 'document-crimes',
        label: 'Get His Testimony',
        description: 'You convince him to testify about Captain Cross\'s war crimes.',
        effects: { xp: 90, items: ['war-crimes-testimony'], reputation: { faction: 'nahiCoalition', amount: 30 } },
        requirements: { skill: { id: 'spirit', level: 18 } }
      }
    ]
  },
  {
    id: 'child-prodigy',
    name: 'Child Prodigy',
    description: 'A ten-year-old Nahi girl approaches you. "The spirits say you need this," she says, handing you a strange carved stone. Then she runs off before you can ask questions.',
    type: 'story',
    minDangerLevel: 3,
    maxDangerLevel: 6,
    regions: ['sacred_lands', 'frontier', 'town'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'keep-stone',
        label: 'Keep the Stone',
        description: 'You pocket the carved stone. It seems to hum with energy.',
        effects: { xp: 50, items: ['spirit-stone'] }
      },
      {
        id: 'return-stone',
        label: 'Return It to Elder Wise Sky',
        description: 'You bring the stone to Kaiowa Mesa. The Elder examines it carefully.',
        effects: { xp: 65, items: ['blessed-stone'], reputation: { faction: 'nahiCoalition', amount: 15 } }
      },
      {
        id: 'study-stone',
        label: 'Study the Carvings',
        description: 'The symbols carved into it seem to tell a story.',
        effects: { xp: 55, items: ['stone-translation'] }
      }
    ]
  },
  {
    id: 'duel-challenge',
    name: 'Formal Duel Challenge',
    description: 'A gentleman in a fine suit presents you with a formal dueling challenge. "You insulted my family\'s honor, sir. I demand satisfaction at dawn."',
    type: 'story',
    minDangerLevel: 5,
    maxDangerLevel: 8,
    regions: ['town', 'frontier'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'accept-duel',
        label: 'Accept the Duel',
        description: 'You meet him at dawn with seconds present. It\'s civilized murder.',
        effects: { xp: 85, gold: 70, damage: 40, reputation: { faction: 'settlerAlliance', amount: 15 } }
      },
      {
        id: 'refuse-duel',
        label: 'Refuse the Duel',
        description: 'You decline. Your reputation suffers, but you\'re alive.',
        effects: { xp: 30, reputation: { faction: 'settlerAlliance', amount: -20 } }
      },
      {
        id: 'apologize',
        label: 'Apologize (Spirit)',
        description: 'You offer a sincere apology. He accepts with dignity.',
        effects: { xp: 65, reputation: { faction: 'settlerAlliance', amount: 10 } },
        requirements: { skill: { id: 'spirit', level: 14 } }
      }
    ]
  },
  {
    id: 'territory-purchase',
    name: 'Land Deal',
    description: 'A land speculator offers to sell you a parcel of territory. "Prime land, just opened up. Get in before the railroad comes through and prices skyrocket."',
    type: 'story',
    minDangerLevel: 3,
    maxDangerLevel: 6,
    regions: ['town', 'frontier'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'buy-land',
        label: 'Buy the Land',
        description: 'You purchase the deed. Time will tell if it\'s a good investment.',
        effects: { xp: 50, gold: -200, items: ['land-deed'] }
      },
      {
        id: 'investigate-claim',
        label: 'Investigate the Deed (Cunning)',
        description: 'You check the land office. The deed is fraudulent!',
        effects: { xp: 70, items: ['fraud-evidence'] },
        requirements: { skill: { id: 'cunning', level: 12 } }
      },
      {
        id: 'decline-land',
        label: 'Decline the Offer',
        description: 'Something feels off about this deal. You pass.',
        effects: { xp: 30 }
      }
    ]
  },
  {
    id: 'journal-discovery',
    name: 'Explorer\'s Journal',
    description: 'You find a weather-beaten journal on a skeleton. The entries detail an expedition into The Scar, describing visions of gold and the horror that drove them mad.',
    type: 'story',
    minDangerLevel: 6,
    maxDangerLevel: 10,
    regions: ['devils_canyon', 'ghost_towns'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'read-journal',
        label: 'Read the Entire Journal',
        description: 'You piece together their route and what they found.',
        effects: { xp: 75, items: ['expedition-journal', 'scar-map'] }
      },
      {
        id: 'return-journal',
        label: 'Return to Next of Kin',
        description: 'The journal contains family information. You find and return it.',
        effects: { xp: 60, gold: 50, reputation: { faction: 'settlerAlliance', amount: 20 } }
      },
      {
        id: 'burn-journal',
        label: 'Burn the Cursed Thing',
        description: 'This knowledge is too dangerous. You destroy it.',
        effects: { xp: 40 }
      }
    ]
  }
];

// ========================================
// NEW ENCOUNTERS (20 additions for 100 total)
// ========================================

const newCombatEncounters: Encounter[] = [
  {
    id: 'feral-dog-pack',
    name: 'Feral Dog Pack',
    description: 'A pack of feral dogs emerges from an abandoned homestead, scarred and aggressive. Years of survival have made them cunning hunters.',
    type: 'combat',
    minDangerLevel: 2,
    maxDangerLevel: 5,
    regions: ['frontier', 'ghost_towns', 'dusty_flats'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'fight-dogs',
        label: 'Fight Them Off',
        description: 'You stand your ground and drive them back with gunfire.',
        effects: { xp: 35, damage: 15, items: ['dog-pelt'] }
      },
      {
        id: 'use-food',
        label: 'Distract with Food',
        description: 'You toss some rations and slip away while they eat.',
        effects: { xp: 20, gold: -5 }
      },
      {
        id: 'tame-alpha',
        label: 'Calm the Pack (Spirit)',
        description: 'You approach slowly and gain their trust. The alpha follows you.',
        effects: { xp: 50, items: ['loyal-hound'] },
        requirements: { skill: { id: 'spirit', level: 12 } }
      }
    ]
  },
  {
    id: 'bounty-hunter-ambush',
    name: 'Mistaken Identity',
    description: 'A bounty hunter blocks your path, poster in hand. "Gotcha, you\'re coming with me dead or alive." He thinks you\'re someone else entirely.',
    type: 'combat',
    minDangerLevel: 4,
    maxDangerLevel: 7,
    regions: ['frontier', 'dusty_flats', 'outlaw_territory'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'prove-identity',
        label: 'Prove Your Identity',
        description: 'You show papers and convince him of the mistake.',
        effects: { xp: 40 }
      },
      {
        id: 'fight-hunter',
        label: 'Fight Your Way Out',
        description: 'No time for talk. Lead starts flying.',
        effects: { xp: 65, gold: 80, damage: 35, items: ['bounty-hunter-rifle'] }
      },
      {
        id: 'bluff-location',
        label: 'Point Him Elsewhere (Cunning)',
        description: 'You claim to know where the real target is hiding.',
        effects: { xp: 55, gold: 30 },
        requirements: { skill: { id: 'cunning', level: 14 } }
      }
    ]
  },
  {
    id: 'bar-fight-spillover',
    name: 'Saloon Brawl',
    description: 'A massive bar fight spills out into the street. Chairs fly, bottles break, and someone grabs you by the collar.',
    type: 'combat',
    minDangerLevel: 2,
    maxDangerLevel: 4,
    regions: ['town', 'frontier'],
    timeRestriction: 'night',
    outcomes: [
      {
        id: 'join-brawl',
        label: 'Join the Chaos',
        description: 'When in Rome... You throw punches with the best of them.',
        effects: { xp: 30, damage: 20, gold: 25 }
      },
      {
        id: 'escape-brawl',
        label: 'Slip Away',
        description: 'You duck and weave through the chaos untouched.',
        effects: { xp: 15 }
      },
      {
        id: 'end-brawl',
        label: 'Fire into the Ceiling',
        description: 'Your gunshot stops everyone cold. The brawl ends.',
        effects: { xp: 45, reputation: { faction: 'settlerAlliance', amount: 10 } }
      }
    ]
  },
  {
    id: 'cattle-stampede',
    name: 'Cattle Stampede',
    description: 'Thunder shakes the ground - not from the sky, but from a thousand hooves. A cattle herd stampedes directly toward you, spooked by lightning.',
    type: 'combat',
    minDangerLevel: 4,
    maxDangerLevel: 7,
    regions: ['dusty_flats', 'frontier'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'outrun-herd',
        label: 'Ride Like the Wind',
        description: 'You spur your horse and barely outpace the stampede.',
        effects: { xp: 45, damage: 15 }
      },
      {
        id: 'divert-herd',
        label: 'Turn the Herd (Combat)',
        description: 'You ride alongside firing shots to turn the leaders.',
        effects: { xp: 75, gold: 100, damage: 25, reputation: { faction: 'settlerAlliance', amount: 25 } },
        requirements: { skill: { id: 'combat', level: 15 } }
      },
      {
        id: 'hide-in-rocks',
        label: 'Take Cover',
        description: 'You scramble behind boulders as the herd thunders past.',
        effects: { xp: 30 }
      }
    ]
  },
  {
    id: 'scorpion-swarm',
    name: 'Scorpion Swarm',
    description: 'You disturbed something under that rock. Dozens of scorpions pour out, stingers raised and ready.',
    type: 'combat',
    minDangerLevel: 1,
    maxDangerLevel: 3,
    regions: ['dusty_flats', 'devils_canyon', 'border_territories'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'stomp-scorpions',
        label: 'Stomp Them Out',
        description: 'You crush as many as you can before retreating.',
        effects: { xp: 20, damage: 15, items: ['scorpion-venom'] }
      },
      {
        id: 'run-away',
        label: 'Run for It',
        description: 'You bolt before any can sting you.',
        effects: { xp: 10 }
      },
      {
        id: 'harvest-scorpions',
        label: 'Collect Specimens (Craft)',
        description: 'You carefully capture several for their valuable venom.',
        effects: { xp: 35, gold: 40, items: ['scorpion-venom', 'scorpion-venom'] },
        requirements: { skill: { id: 'craft', level: 8 } }
      }
    ]
  }
];

const newEventEncounters: Encounter[] = [
  {
    id: 'quicksand-trap',
    name: 'Quicksand',
    description: 'The ground gives way beneath you - quicksand! You\'re already waist-deep and sinking fast.',
    type: 'event',
    minDangerLevel: 3,
    maxDangerLevel: 6,
    regions: ['devils_canyon', 'sacred_lands', 'border_territories'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'struggle-out',
        label: 'Struggle Free (Combat)',
        description: 'With tremendous effort, you pull yourself out.',
        effects: { xp: 50, damage: 20 },
        requirements: { skill: { id: 'combat', level: 10 } }
      },
      {
        id: 'float-slowly',
        label: 'Stay Calm and Float',
        description: 'You spread your weight and slowly work your way to solid ground.',
        effects: { xp: 35 }
      },
      {
        id: 'call-for-help',
        label: 'Signal for Help',
        description: 'Your calls attract a passing traveler who throws you a rope.',
        effects: { xp: 25, gold: -10 }
      }
    ]
  },
  {
    id: 'coded-message',
    name: 'Mysterious Cipher',
    description: 'You find a coded message tucked in a dead drop - strange symbols that seem to hide important information.',
    type: 'event',
    minDangerLevel: 4,
    maxDangerLevel: 7,
    regions: ['town', 'frontier', 'outlaw_territory'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'decode-message',
        label: 'Decode It (Cunning)',
        description: 'You crack the cipher - it reveals a cache location.',
        effects: { xp: 60, items: ['decoded-cache-map'] },
        requirements: { skill: { id: 'cunning', level: 15 } }
      },
      {
        id: 'sell-message',
        label: 'Sell to Interested Party',
        description: 'Someone in town pays well for encoded secrets.',
        effects: { xp: 40, gold: 75 }
      },
      {
        id: 'burn-message',
        label: 'Destroy It',
        description: 'Some secrets are better left unknown.',
        effects: { xp: 20 }
      }
    ]
  },
  {
    id: 'wounded-animal',
    name: 'Wounded Wolf',
    description: 'A magnificent wolf lies wounded by a trap, leg caught in steel jaws. It snarls but its eyes plead for help.',
    type: 'event',
    minDangerLevel: 2,
    maxDangerLevel: 5,
    regions: ['sangre_mountains', 'sacred_lands', 'frontier'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'free-wolf',
        label: 'Free the Wolf (Spirit)',
        description: 'You calm the creature and release the trap. It licks your hand before limping away.',
        effects: { xp: 55, reputation: { faction: 'nahiCoalition', amount: 15 } },
        requirements: { skill: { id: 'spirit', level: 10 } }
      },
      {
        id: 'mercy-kill',
        label: 'End Its Suffering',
        description: 'You give the wolf a quick death and take its pelt.',
        effects: { xp: 30, items: ['wolf-pelt'] }
      },
      {
        id: 'leave-wolf',
        label: 'Walk Away',
        description: 'Nature is cruel. You move on.',
        effects: { xp: 10 }
      }
    ]
  },
  {
    id: 'cave-in-survivor',
    name: 'Trapped Miner',
    description: 'Muffled cries echo from a collapsed mine tunnel. Someone\'s alive in there, but the supports are unstable.',
    type: 'event',
    minDangerLevel: 5,
    maxDangerLevel: 8,
    regions: ['sangre_mountains', 'devils_canyon'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'engineer-rescue',
        label: 'Shore Up and Dig (Craft)',
        description: 'You reinforce the tunnel and extract the miner safely.',
        effects: { xp: 80, gold: 100, reputation: { faction: 'settlerAlliance', amount: 25 } },
        requirements: { skill: { id: 'craft', level: 18 } }
      },
      {
        id: 'risky-rescue',
        label: 'Dig Without Support',
        description: 'You dig frantically. You save them, but rocks fall on you.',
        effects: { xp: 65, gold: 50, damage: 35, reputation: { faction: 'settlerAlliance', amount: 20 } }
      },
      {
        id: 'get-help',
        label: 'Ride for Help',
        description: 'You race to town for a rescue team. They arrive in time.',
        effects: { xp: 45, reputation: { faction: 'settlerAlliance', amount: 15 } }
      }
    ]
  },
  {
    id: 'poison-water-hole',
    name: 'Tainted Water',
    description: 'Dead animals lie around a water hole. Something\'s poisoned the water - accidentally or deliberately.',
    type: 'event',
    minDangerLevel: 3,
    maxDangerLevel: 6,
    regions: ['dusty_flats', 'frontier', 'border_territories'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'identify-poison',
        label: 'Identify the Toxin (Craft)',
        description: 'You recognize the poison - arsenic from a nearby mine.',
        effects: { xp: 55, items: ['poison-evidence'] },
        requirements: { skill: { id: 'craft', level: 12 } }
      },
      {
        id: 'warn-travelers',
        label: 'Mark as Dangerous',
        description: 'You post warning signs to save future travelers.',
        effects: { xp: 40, reputation: { faction: 'settlerAlliance', amount: 15 } }
      },
      {
        id: 'investigate-source',
        label: 'Track the Source',
        description: 'You follow the contamination upstream to its origin.',
        effects: { xp: 50, items: ['pollution-evidence'] }
      }
    ]
  }
];

const newDiscoveryEncounters: Encounter[] = [
  {
    id: 'prospectors-ore-cache',
    name: 'Prospector\'s Hidden Stash',
    description: 'Behind a false rock, you discover bags of unrefined ore. Some prospector hid their findings here and never returned.',
    type: 'discovery',
    minDangerLevel: 3,
    maxDangerLevel: 6,
    regions: ['sangre_mountains', 'devils_canyon'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'take-ore',
        label: 'Take the Ore',
        description: 'You load up the valuable minerals.',
        effects: { xp: 45, gold: 90, items: ['raw-silver-ore'] }
      },
      {
        id: 'investigate-owner',
        label: 'Find the Owner',
        description: 'You track down the claim owner\'s widow and return the ore.',
        effects: { xp: 60, gold: 40, reputation: { faction: 'settlerAlliance', amount: 20 } }
      }
    ]
  },
  {
    id: 'cavalry-saddlebag',
    name: 'Lost Cavalry Supplies',
    description: 'A cavalry saddlebag lies half-buried in the sand, still bearing military markings. The horse and rider are nowhere to be seen.',
    type: 'discovery',
    minDangerLevel: 3,
    maxDangerLevel: 5,
    regions: ['dusty_flats', 'frontier', 'sacred_lands'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'search-saddlebag',
        label: 'Search the Bag',
        description: 'You find ammunition, rations, and military dispatches.',
        effects: { xp: 40, gold: 30, items: ['army-rations', 'ammunition'] }
      },
      {
        id: 'return-to-fort',
        label: 'Return to Fort Ashford',
        description: 'You deliver the supplies and dispatches to the Army.',
        effects: { xp: 55, gold: 60, reputation: { faction: 'settlerAlliance', amount: 20 } }
      },
      {
        id: 'sell-dispatches',
        label: 'Sell Dispatches to Coalition',
        description: 'The military information is valuable to the Nahi.',
        effects: { xp: 50, gold: 100, reputation: { faction: 'nahiCoalition', amount: 25 } }
      }
    ]
  },
  {
    id: 'wrecked-stagecoach',
    name: 'Crashed Stagecoach',
    description: 'A stagecoach lies overturned in a ravine. The horses are gone, but luggage is scattered everywhere.',
    type: 'discovery',
    minDangerLevel: 4,
    maxDangerLevel: 6,
    regions: ['dusty_flats', 'devils_canyon', 'frontier'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'salvage-goods',
        label: 'Salvage the Cargo',
        description: 'You recover valuables from the wreckage.',
        effects: { xp: 45, gold: 75, items: ['salvaged-goods'] }
      },
      {
        id: 'check-passengers',
        label: 'Search for Survivors',
        description: 'You find a survivor pinned under the coach.',
        effects: { xp: 60, gold: 50, reputation: { faction: 'settlerAlliance', amount: 20 } }
      },
      {
        id: 'report-wreck',
        label: 'Report to Stage Company',
        description: 'You notify the company and claim a finder\'s fee.',
        effects: { xp: 40, gold: 40 }
      }
    ]
  },
  {
    id: 'hidden-hot-spring',
    name: 'Hidden Hot Spring',
    description: 'Steam rises from a secluded pool fed by underground hot springs. The water is crystal clear and inviting.',
    type: 'discovery',
    minDangerLevel: 2,
    maxDangerLevel: 4,
    regions: ['sangre_mountains', 'sacred_lands'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'rest-in-spring',
        label: 'Rest and Recover',
        description: 'The hot water soothes your aches and restores your energy.',
        effects: { xp: 30, damage: -20 }
      },
      {
        id: 'mark-location',
        label: 'Map the Location',
        description: 'You mark this spot for future visits.',
        effects: { xp: 25, items: ['hot-spring-map'] }
      },
      {
        id: 'collect-minerals',
        label: 'Collect Mineral Deposits',
        description: 'The spring deposits valuable minerals on the rocks.',
        effects: { xp: 35, gold: 50, items: ['mineral-salts'] }
      }
    ]
  },
  {
    id: 'bee-tree',
    name: 'Bee Tree',
    description: 'A massive hollow tree buzzes with activity - a wild beehive with honey dripping from the comb.',
    type: 'discovery',
    minDangerLevel: 1,
    maxDangerLevel: 3,
    regions: ['frontier', 'sangre_mountains', 'sacred_lands'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'harvest-honey',
        label: 'Harvest the Honey',
        description: 'You brave the stings and collect sweet golden honey.',
        effects: { xp: 35, damage: 10, items: ['wild-honey', 'wild-honey'] }
      },
      {
        id: 'smoke-bees',
        label: 'Smoke Out the Bees (Craft)',
        description: 'You use smoke to calm the bees and harvest safely.',
        effects: { xp: 45, items: ['wild-honey', 'wild-honey', 'beeswax'] },
        requirements: { skill: { id: 'craft', level: 6 } }
      },
      {
        id: 'leave-bees',
        label: 'Leave Them Be',
        description: 'Not worth getting stung.',
        effects: { xp: 10 }
      }
    ]
  }
];

const newStoryEncounters: Encounter[] = [
  {
    id: 'traveling-preacher',
    name: 'The Traveling Preacher',
    description: 'A fire-and-brimstone preacher stands on a rock, Bible in hand, calling out your sins to the empty desert. He seems to know things about you he shouldn\'t.',
    type: 'story',
    minDangerLevel: 2,
    maxDangerLevel: 5,
    regions: ['frontier', 'dusty_flats', 'ghost_towns'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'receive-blessing',
        label: 'Ask for a Blessing',
        description: 'He lays hands on you and prays. You feel... something.',
        effects: { xp: 40, items: ['preacher-blessing'] }
      },
      {
        id: 'challenge-preacher',
        label: 'Challenge His Words',
        description: 'You argue theology. He admits you have wisdom.',
        effects: { xp: 50 }
      },
      {
        id: 'donate-to-church',
        label: 'Give a Donation',
        description: 'You contribute to his mission. He promises prayers for your soul.',
        effects: { xp: 35, gold: -25, reputation: { faction: 'settlerAlliance', amount: 10 } }
      }
    ]
  },
  {
    id: 'lost-child',
    name: 'Lost Child',
    description: 'A young child sits crying by the trail, dirty and frightened. They wandered away from their family\'s wagon and have been lost for hours.',
    type: 'story',
    minDangerLevel: 1,
    maxDangerLevel: 3,
    regions: ['frontier', 'dusty_flats', 'town'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'return-child',
        label: 'Find Their Family',
        description: 'You track down their wagon and return the grateful child.',
        effects: { xp: 55, gold: 40, reputation: { faction: 'settlerAlliance', amount: 25 } }
      },
      {
        id: 'take-to-town',
        label: 'Take to the Sheriff',
        description: 'You bring the child to town where they\'ll be safe.',
        effects: { xp: 45, reputation: { faction: 'settlerAlliance', amount: 15 } }
      },
      {
        id: 'ignore-child',
        label: 'Keep Riding',
        description: 'Not your problem. Someone else will find them.',
        effects: { xp: 10, reputation: { faction: 'settlerAlliance', amount: -15 } }
      }
    ]
  },
  {
    id: 'dying-outlaw-confession',
    name: 'Outlaw\'s Confession',
    description: 'A gut-shot outlaw lies against a rock, blood pooling beneath him. "Come closer," he gasps. "I gotta tell someone before I go..."',
    type: 'story',
    minDangerLevel: 4,
    maxDangerLevel: 7,
    regions: ['outlaw_territory', 'devils_canyon', 'frontier'],
    timeRestriction: 'any',
    outcomes: [
      {
        id: 'hear-confession',
        label: 'Hear His Confession',
        description: 'He reveals where his gang buried their biggest haul.',
        effects: { xp: 60, items: ['outlaw-treasure-map'] }
      },
      {
        id: 'ease-passing',
        label: 'Comfort Him',
        description: 'You hold his hand as he passes. No treasure, but peace.',
        effects: { xp: 45, reputation: { faction: 'frontera', amount: 15 } }
      },
      {
        id: 'search-body',
        label: 'Wait and Search',
        description: 'You wait for him to die and take what\'s on him.',
        effects: { xp: 30, gold: 40, items: ['outlaw-revolver'] }
      }
    ]
  },
  {
    id: 'railroad-surveyor-encounter',
    name: 'Railroad Surveyor',
    description: 'A railroad surveyor sits frustrated at his camp, maps spread before him. "Blast it all! I need someone who knows these trails..."',
    type: 'story',
    minDangerLevel: 3,
    maxDangerLevel: 5,
    regions: ['frontier', 'dusty_flats', 'sangre_mountains'],
    timeRestriction: 'day',
    outcomes: [
      {
        id: 'guide-surveyor',
        label: 'Offer Your Services',
        description: 'You guide him through the territory for good pay.',
        effects: { xp: 50, gold: 80 }
      },
      {
        id: 'mislead-surveyor',
        label: 'Lead Him Astray',
        description: 'You send him the wrong direction, protecting Coalition lands.',
        effects: { xp: 45, gold: 40, reputation: { faction: 'nahiCoalition', amount: 20 } }
      },
      {
        id: 'share-information',
        label: 'Trade Information',
        description: 'You exchange knowledge - he shares what the railroad knows.',
        effects: { xp: 55, gold: 30, items: ['railroad-plans'] }
      }
    ]
  },
  {
    id: 'spirit-vision',
    name: 'Vision Quest',
    description: 'At a sacred site, you experience an overwhelming vision - spirits of the land show you glimpses of past, present, and future.',
    type: 'story',
    minDangerLevel: 5,
    maxDangerLevel: 8,
    regions: ['sacred_lands', 'sangre_mountains'],
    timeRestriction: 'night',
    outcomes: [
      {
        id: 'embrace-vision',
        label: 'Embrace the Vision (Spirit)',
        description: 'You open yourself to the experience and gain profound insight.',
        effects: { xp: 90, items: ['spirit-vision-quest'], reputation: { faction: 'nahiCoalition', amount: 25 } },
        requirements: { skill: { id: 'spirit', level: 20 } }
      },
      {
        id: 'resist-vision',
        label: 'Fight the Vision',
        description: 'You struggle against the supernatural experience.',
        effects: { xp: 50, damage: 20 }
      },
      {
        id: 'flee-vision',
        label: 'Flee the Sacred Site',
        description: 'You run from the overwhelming power of this place.',
        effects: { xp: 30 }
      }
    ]
  }
];

// ========================================
// COMBINED ENCOUNTER ARRAY
// ========================================

export const encounterSeeds: Encounter[] = [
  ...combatEncounters,
  ...eventEncounters,
  ...discoveryEncounters,
  ...storyEncounters,
  ...newCombatEncounters,
  ...newEventEncounters,
  ...newDiscoveryEncounters,
  ...newStoryEncounters
];

/**
 * Seed encounters into the database
 */
export async function seedEncounters(): Promise<void> {
  console.log('Seeding encounters...');
  console.log(`Total encounters: ${encounterSeeds.length}`);
  console.log(`- Combat: ${combatEncounters.length + newCombatEncounters.length}`);
  console.log(`- Event: ${eventEncounters.length + newEventEncounters.length}`);
  console.log(`- Discovery: ${discoveryEncounters.length + newDiscoveryEncounters.length}`);
  console.log(`- Story: ${storyEncounters.length + newStoryEncounters.length}`);
}

/**
 * Clear all encounters
 */
export async function clearEncounters(): Promise<void> {
  console.log('Cleared all encounters');
}
