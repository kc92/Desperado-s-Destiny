/**
 * Mentor Definitions
 *
 * Data for all available mentors in the game
 */

import { Mentor, MentorSpecialty, MentorTrustLevel } from '@desperados/shared';

/**
 * All available mentors
 */
export const MENTORS: Mentor[] = [
  // ============================================
  // DEAD-EYE DAN MCGRAW - Gunslinger Mentor
  // ============================================
  {
    mentorId: 'dead-eye-dan',
    npcId: 'npc_dead_eye_dan',
    npcName: 'Dead-Eye Dan McGraw',
    specialty: MentorSpecialty.GUNSLINGER,
    faction: 'neutral',
    location: 'red-gulch-saloon',
    requirements: {
      minLevel: 10,
      minNpcTrust: 20,
      completedQuests: [],
      skills: {}
    },
    abilities: [
      {
        id: 'quick-draw',
        name: 'Quick Draw',
        description: 'Your lightning-fast reflexes give you the initiative in duels',
        trustRequired: MentorTrustLevel.ACQUAINTANCE,
        type: 'passive',
        effects: [
          { stat: 'duel_initiative', modifier: 10, description: '+10% duel initiative' }
        ]
      },
      {
        id: 'steady-aim',
        name: 'Steady Aim',
        description: 'Your shots find their mark with deadly precision',
        trustRequired: MentorTrustLevel.STUDENT,
        type: 'passive',
        effects: [
          { stat: 'accuracy', modifier: 15, description: '+15% accuracy' }
        ]
      },
      {
        id: 'fan-the-hammer',
        name: 'Fan the Hammer',
        description: 'Unleash a devastating barrage of shots at your enemy',
        trustRequired: MentorTrustLevel.APPRENTICE,
        type: 'active',
        effects: [
          { stat: 'multi_shot', modifier: 3, description: 'Fire 3 rapid shots' },
          { stat: 'damage', modifier: 75, description: '75% damage per shot' }
        ],
        cooldown: 60,
        energyCost: 15
      },
      {
        id: 'legendary-technique',
        name: 'Legendary Technique',
        description: 'Your mastery of the gun grants devastating critical strikes',
        trustRequired: MentorTrustLevel.DISCIPLE,
        type: 'passive',
        effects: [
          { stat: 'crit_chance', modifier: 25, description: '+25% critical hit chance' }
        ]
      },
      {
        id: 'gunslingers-secret',
        name: "Gunslinger's Secret",
        description: 'The ultimate technique - a perfect shot that never misses',
        trustRequired: MentorTrustLevel.HEIR,
        type: 'active',
        effects: [
          { stat: 'guaranteed_hit', modifier: 1, description: 'Guaranteed critical hit' },
          { stat: 'damage', modifier: 300, description: '300% damage' }
        ],
        cooldown: 180,
        energyCost: 30
      }
    ],
    storyline: {
      introduction: "A weathered gunslinger sits alone at the bar, his eyes distant with memories of past duels.",
      background: "Once the fastest gun in the West, Dead-Eye Dan retired after a duel that changed him forever. He seeks a worthy student to pass on his legendary techniques.",
      quests: [
        {
          questId: 'deadeye-first-lesson',
          trustLevelUnlock: MentorTrustLevel.ACQUAINTANCE,
          title: 'First Lesson',
          description: 'Win 3 duels to prove you have the basic skills'
        },
        {
          questId: 'deadeye-target-practice',
          trustLevelUnlock: MentorTrustLevel.STUDENT,
          title: 'Target Practice',
          description: 'Hit 50 successful shots in combat'
        },
        {
          questId: 'deadeye-rival',
          trustLevelUnlock: MentorTrustLevel.APPRENTICE,
          title: "The Rival's Challenge",
          description: "Face Dan's old rival in a duel to the death"
        },
        {
          questId: 'deadeye-past',
          trustLevelUnlock: MentorTrustLevel.DISCIPLE,
          title: 'The Duel That Changed Everything',
          description: "Learn the truth about Dan's past and help him find redemption"
        },
        {
          questId: 'deadeye-legacy',
          trustLevelUnlock: MentorTrustLevel.HEIR,
          title: 'The Legacy',
          description: 'Prove yourself as the greatest gunslinger by winning the Grand Tournament'
        }
      ],
      finalChallenge: 'Win the Grand Tournament and become the fastest gun in the West',
      legacy: "Dead-Eye Dan's legendary revolvers and the title of Master Gunslinger"
    },
    dialogue: {
      greeting: "Back again, partner? Ready to practice?",
      introduction: "You got the look of someone who wants to be fast. Fast ain't enough - you gotta be deadly too. I can teach you, if you're willing to learn.",
      training: [
        "Keep your hand steady, your eye sharp, and your mind clear.",
        "Speed without accuracy is just noise. Accuracy without speed is just a slow death.",
        "The moment before you draw is when the duel is won or lost."
      ],
      success: [
        "Not bad, kid. You might actually survive out there.",
        "Now that's what I call shooting! You're getting the hang of it.",
        "I see my old self in you. That's both a compliment and a warning."
      ],
      failure: [
        "Dead men don't get second chances. Try again.",
        "You're thinking too much. Let your instincts guide you.",
        "Every master was once a disaster. Keep practicing."
      ],
      farewell: "May your shots be true and your enemies slower than you."
    }
  },

  // ============================================
  // EL REY MARTINEZ - Outlaw Mentor
  // ============================================
  {
    mentorId: 'el-rey',
    npcId: 'npc_el_rey_martinez',
    npcName: 'El Rey Martinez',
    specialty: MentorSpecialty.OUTLAW,
    faction: 'frontera',
    location: 'the-frontera',
    requirements: {
      minLevel: 15,
      minFactionRep: 200,
      minNpcTrust: 30,
      minCriminalRep: 50
    },
    abilities: [
      {
        id: 'lockpicking-basics',
        name: 'Lockpicking Basics',
        description: 'Your nimble fingers make short work of simple locks',
        trustRequired: MentorTrustLevel.ACQUAINTANCE,
        type: 'passive',
        effects: [
          { stat: 'theft_success', modifier: 10, description: '+10% theft success rate' }
        ]
      },
      {
        id: 'fence-connections',
        name: 'Fence Connections',
        description: "El Rey's network gets you better prices for stolen goods",
        trustRequired: MentorTrustLevel.STUDENT,
        type: 'passive',
        effects: [
          { stat: 'black_market_discount', modifier: 15, description: '15% better black market prices' }
        ]
      },
      {
        id: 'escape-artist',
        name: 'Escape Artist',
        description: 'You know all the tricks for slipping away from the law',
        trustRequired: MentorTrustLevel.APPRENTICE,
        type: 'passive',
        effects: [
          { stat: 'jail_escape_chance', modifier: 25, description: '+25% jail escape chance' },
          { stat: 'arrest_resistance', modifier: 15, description: '+15% arrest resistance' }
        ]
      },
      {
        id: 'crime-lord-network',
        name: 'Crime Lord Network',
        description: 'Your connections help you avoid the worst consequences',
        trustRequired: MentorTrustLevel.DISCIPLE,
        type: 'passive',
        effects: [
          { stat: 'bounty_accumulation', modifier: -25, description: '-25% bounty accumulation' },
          { stat: 'wanted_decay', modifier: 50, description: '+50% wanted level decay rate' }
        ]
      },
      {
        id: 'perfect-crime',
        name: 'Perfect Crime',
        description: 'Pull off the legendary heist with zero risk of capture',
        trustRequired: MentorTrustLevel.HEIR,
        type: 'unlock',
        effects: [
          { stat: 'legendary_heist', modifier: 1, description: 'Access to Perfect Crime heist' }
        ]
      }
    ],
    storyline: {
      introduction: "The Outlaw King himself sits before you, sizing you up with calculating eyes.",
      background: "El Rey Martinez built the largest criminal empire in the territory. He's looking for a successor who can think like a king and strike like a viper.",
      quests: [
        {
          questId: 'elrey-first-job',
          trustLevelUnlock: MentorTrustLevel.ACQUAINTANCE,
          title: 'First Job',
          description: 'Complete 5 successful crimes without getting caught'
        },
        {
          questId: 'elrey-network',
          trustLevelUnlock: MentorTrustLevel.STUDENT,
          title: 'Building the Network',
          description: 'Recruit 3 gang members and establish your criminal connections'
        },
        {
          questId: 'elrey-rival-gang',
          trustLevelUnlock: MentorTrustLevel.APPRENTICE,
          title: 'Eliminating Competition',
          description: 'Take down a rival criminal organization'
        },
        {
          questId: 'elrey-betrayal',
          trustLevelUnlock: MentorTrustLevel.DISCIPLE,
          title: 'The Betrayal',
          description: 'Uncover and eliminate a traitor in El Rey\'s organization'
        },
        {
          questId: 'elrey-perfect-crime',
          trustLevelUnlock: MentorTrustLevel.HEIR,
          title: 'The Perfect Crime',
          description: 'Execute the legendary bank heist that will cement your legacy'
        }
      ],
      finalChallenge: 'Execute the perfect crime that even El Rey himself could never accomplish',
      legacy: 'Control of El Rey\'s criminal empire and the title of The New King'
    },
    dialogue: {
      greeting: "Ah, mi protegido. Ready to learn the art of the heist?",
      introduction: "You want to be an outlaw? Anyone can steal. I teach you to be a king among thieves. But first, you must prove you can think, not just act.",
      training: [
        "The best crime is one nobody knows happened until you're long gone.",
        "Fear keeps the weak in line. Respect keeps the strong loyal.",
        "Every lawman has a price. Know what it is before you need it."
      ],
      success: [
        "Excelente! You have the makings of a true outlaw king!",
        "Now you're thinking like a criminal mastermind!",
        "That's how it's done! Clean, efficient, untraceable."
      ],
      failure: [
        "Sloppy work gets you caught. Dead or jailed - both are failures.",
        "You rushed it. Patience is what separates kings from corpses.",
        "Learn from this mistake. You won't get many chances."
      ],
      farewell: "Vaya con Dios, and remember - the best outlaws are never caught."
    },
    conflictsWith: [MentorSpecialty.LAWMAN]
  },

  // ============================================
  // WISE SKY - Shaman Mentor
  // ============================================
  {
    mentorId: 'wise-sky',
    npcId: 'npc_wise_sky',
    npcName: 'Wise Sky',
    specialty: MentorSpecialty.SHAMAN,
    faction: 'nahiCoalition',
    location: 'spirit-springs',
    requirements: {
      minLevel: 12,
      minFactionRep: 150,
      minNpcTrust: 25
    },
    abilities: [
      {
        id: 'spirit-sight',
        name: 'Spirit Sight',
        description: 'You can perceive the supernatural world invisible to others',
        trustRequired: MentorTrustLevel.ACQUAINTANCE,
        type: 'unlock',
        effects: [
          { stat: 'see_spirits', modifier: 1, description: 'See supernatural elements and hidden secrets' }
        ]
      },
      {
        id: 'herbal-knowledge',
        name: 'Herbal Knowledge',
        description: 'Ancient wisdom makes your healing items far more effective',
        trustRequired: MentorTrustLevel.STUDENT,
        type: 'passive',
        effects: [
          { stat: 'healing_item_effect', modifier: 20, description: '+20% healing item effectiveness' }
        ]
      },
      {
        id: 'weather-sense',
        name: 'Weather Sense',
        description: 'You can feel the changes in the wind and predict the weather',
        trustRequired: MentorTrustLevel.APPRENTICE,
        type: 'passive',
        effects: [
          { stat: 'weather_prediction', modifier: 1, description: 'Predict weather changes 24h in advance' },
          { stat: 'weather_bonus', modifier: 10, description: '+10% to all actions in favorable weather' }
        ]
      },
      {
        id: 'spirit-guide',
        name: 'Spirit Guide',
        description: 'A spirit companion aids you on your journey',
        trustRequired: MentorTrustLevel.DISCIPLE,
        type: 'unlock',
        effects: [
          { stat: 'spirit_companion', modifier: 1, description: 'Summon a spirit guide for advice and protection' },
          { stat: 'danger_warning', modifier: 25, description: '+25% to detect ambushes and traps' }
        ]
      },
      {
        id: 'walk-between-worlds',
        name: 'Walk Between Worlds',
        description: 'You can step into the spirit realm itself',
        trustRequired: MentorTrustLevel.HEIR,
        type: 'unlock',
        effects: [
          { stat: 'spirit_realm_access', modifier: 1, description: 'Access to the Spirit Realm' },
          { stat: 'spirit_travel', modifier: 1, description: 'Fast travel via spirit paths' }
        ]
      }
    ],
    storyline: {
      introduction: "An ancient shaman sits by the sacred springs, eyes closed in meditation.",
      background: "Wise Sky has walked between worlds for over seventy winters. She seeks a student worthy of learning the old ways before they are lost forever.",
      quests: [
        {
          questId: 'wisesky-first-vision',
          trustLevelUnlock: MentorTrustLevel.ACQUAINTANCE,
          title: 'First Vision',
          description: 'Complete the spirit quest ritual and receive your first vision'
        },
        {
          questId: 'wisesky-sacred-herbs',
          trustLevelUnlock: MentorTrustLevel.STUDENT,
          title: 'Sacred Herbs',
          description: 'Gather the seven sacred herbs from across the territory'
        },
        {
          questId: 'wisesky-angry-spirit',
          trustLevelUnlock: MentorTrustLevel.APPRENTICE,
          title: 'The Angry Spirit',
          description: 'Calm an angry spirit that threatens the village'
        },
        {
          questId: 'wisesky-spirit-guide',
          trustLevelUnlock: MentorTrustLevel.DISCIPLE,
          title: 'Finding Your Guide',
          description: 'Journey to the spirit realm to find your personal spirit guide'
        },
        {
          questId: 'wisesky-legacy',
          trustLevelUnlock: MentorTrustLevel.HEIR,
          title: 'The Bridge Between Worlds',
          description: 'Become the new bridge between the physical and spirit worlds'
        }
      ],
      finalChallenge: 'Open a permanent bridge to the spirit realm and become the new Keeper',
      legacy: 'Wise Sky\'s sacred staff and the title of Spirit Walker'
    },
    dialogue: {
      greeting: "The spirits whisper of your coming, young one.",
      introduction: "The old ways are dying, but the spirits are eternal. If you walk with an open heart and clear mind, I will teach you to see what others cannot.",
      training: [
        "Listen to the wind, watch the animals, feel the earth. They speak truth.",
        "The spirit world is not separate from ours - it is another layer of the same reality.",
        "Power without wisdom is destruction. Wisdom without compassion is cruelty."
      ],
      success: [
        "The spirits are pleased with your progress.",
        "You walk the path well, young one.",
        "I see the old wisdom awakening in you."
      ],
      failure: [
        "You rush when you should wait. The spirits cannot be hurried.",
        "Your mind is clouded. Meditate and try again.",
        "Failure teaches more than success. Learn from this."
      ],
      farewell: "May the spirits guide your path and the ancestors watch over you."
    }
  },

  // ============================================
  // MARSHAL COLE STRIKER - Lawman Mentor
  // ============================================
  {
    mentorId: 'marshal-striker',
    npcId: 'npc_marshal_striker',
    npcName: 'Marshal Cole Striker',
    specialty: MentorSpecialty.LAWMAN,
    faction: 'settlerAlliance',
    location: 'fort-ashford',
    requirements: {
      minLevel: 15,
      minFactionRep: 200,
      minNpcTrust: 30,
      noActiveBounty: true
    },
    abilities: [
      {
        id: 'legal-authority',
        name: 'Legal Authority',
        description: 'Your badge carries weight, increasing bounty rewards',
        trustRequired: MentorTrustLevel.ACQUAINTANCE,
        type: 'passive',
        effects: [
          { stat: 'bounty_reward', modifier: 10, description: '+10% bounty rewards' }
        ]
      },
      {
        id: 'investigation-skills',
        name: 'Investigation Skills',
        description: 'You can track wanted criminals across the territory',
        trustRequired: MentorTrustLevel.STUDENT,
        type: 'unlock',
        effects: [
          { stat: 'track_wanted', modifier: 1, description: 'Track wanted players on the map' },
          { stat: 'wanted_detection', modifier: 100, description: 'See wanted levels of other players' }
        ]
      },
      {
        id: 'deputy-badge',
        name: 'Deputy Badge',
        description: 'You can arrest wanted criminals and bring them to justice',
        trustRequired: MentorTrustLevel.APPRENTICE,
        type: 'unlock',
        effects: [
          { stat: 'arrest_power', modifier: 1, description: 'Ability to arrest players with 3+ wanted level' },
          { stat: 'arrest_bonus', modifier: 50, description: '+50% rewards for successful arrests' }
        ]
      },
      {
        id: 'marshal-training',
        name: 'Marshal Training',
        description: 'Your training makes you deadly against outlaws',
        trustRequired: MentorTrustLevel.DISCIPLE,
        type: 'passive',
        effects: [
          { stat: 'damage_vs_outlaws', modifier: 20, description: '+20% damage vs wanted players' },
          { stat: 'defense_vs_outlaws', modifier: 15, description: '+15% defense vs wanted players' }
        ]
      },
      {
        id: 'judges-trust',
        name: "Judge's Trust",
        description: 'Your reputation grants you the power of clemency',
        trustRequired: MentorTrustLevel.HEIR,
        type: 'unlock',
        effects: [
          { stat: 'reduce_jail_time', modifier: 50, description: 'Reduce jail sentences by 50%' },
          { stat: 'pardon_power', modifier: 1, description: 'Can pardon players (limited uses)' }
        ]
      }
    ],
    storyline: {
      introduction: "A stern marshal with steel-gray eyes studies you from behind his desk.",
      background: "Marshal Striker has dedicated his life to bringing order to the lawless frontier. He seeks a deputy worthy of carrying on his crusade for justice.",
      quests: [
        {
          questId: 'striker-oath',
          trustLevelUnlock: MentorTrustLevel.ACQUAINTANCE,
          title: 'The Oath',
          description: 'Take the oath and assist in 3 bounty captures'
        },
        {
          questId: 'striker-investigation',
          trustLevelUnlock: MentorTrustLevel.STUDENT,
          title: 'The Investigation',
          description: 'Track down and arrest a notorious criminal'
        },
        {
          questId: 'striker-corruption',
          trustLevelUnlock: MentorTrustLevel.APPRENTICE,
          title: 'Corruption',
          description: 'Root out corruption in the law enforcement ranks'
        },
        {
          questId: 'striker-elrey',
          trustLevelUnlock: MentorTrustLevel.DISCIPLE,
          title: 'The Hunt for El Rey',
          description: 'Help Marshal Striker track down his nemesis, El Rey Martinez'
        },
        {
          questId: 'striker-legacy',
          trustLevelUnlock: MentorTrustLevel.HEIR,
          title: 'The Final Stand',
          description: 'Face El Rey in a final confrontation to bring peace to the territory'
        }
      ],
      finalChallenge: 'Bring El Rey Martinez to justice and restore law to the territory',
      legacy: 'Marshal Striker\'s star and the title of Chief Marshal'
    },
    dialogue: {
      greeting: "Deputy. Ready to uphold the law?",
      introduction: "This territory needs law and order. I can give you the badge, but you have to earn the respect. You willing to stand for justice, no matter the cost?",
      training: [
        "The law is not about vengeance. It's about justice and protection.",
        "A true lawman knows when to draw and when to talk.",
        "Your badge is a promise to the people. Don't break it."
      ],
      success: [
        "Fine work, deputy. That's how justice is done.",
        "You're becoming a true lawman. I'm proud of you.",
        "The territory is safer because of you."
      ],
      failure: [
        "The law doesn't bend for mistakes. Learn from this.",
        "Justice delayed is justice denied. Be better next time.",
        "Even lawmen fail. What matters is getting back up."
      ],
      farewell: "Ride safe, deputy. The territory needs good people like you."
    },
    conflictsWith: [MentorSpecialty.OUTLAW]
  },

  // ============================================
  // WONG LI - Craftsman Mentor (Hidden)
  // ============================================
  {
    mentorId: 'wong-li',
    npcId: 'npc_wong_li',
    npcName: 'Wong Li',
    specialty: MentorSpecialty.CRAFTSMAN,
    faction: 'chinese-diaspora',
    location: 'hidden-chinatown',
    requirements: {
      minLevel: 10,
      minNpcTrust: 40,
      completedQuests: ['discover-chinese-network'],
      skills: { craft: 5 }
    },
    abilities: [
      {
        id: 'master-craftsmanship',
        name: 'Master Craftsmanship',
        description: 'Your items are crafted with superior quality',
        trustRequired: MentorTrustLevel.ACQUAINTANCE,
        type: 'passive',
        effects: [
          { stat: 'crafting_quality', modifier: 15, description: '+15% crafted item quality' }
        ]
      },
      {
        id: 'ancient-techniques',
        name: 'Ancient Techniques',
        description: 'Secret methods passed down for generations',
        trustRequired: MentorTrustLevel.STUDENT,
        type: 'passive',
        effects: [
          { stat: 'crafting_speed', modifier: 25, description: '+25% crafting speed' },
          { stat: 'material_efficiency', modifier: 10, description: '+10% chance to save materials' }
        ]
      },
      {
        id: 'rare-recipes',
        name: 'Rare Recipes',
        description: 'Access to legendary crafting recipes',
        trustRequired: MentorTrustLevel.APPRENTICE,
        type: 'unlock',
        effects: [
          { stat: 'recipe_unlock', modifier: 5, description: 'Unlock 5 legendary recipes' }
        ]
      },
      {
        id: 'perfect-balance',
        name: 'Perfect Balance',
        description: 'Your weapons and armor are perfectly balanced',
        trustRequired: MentorTrustLevel.DISCIPLE,
        type: 'passive',
        effects: [
          { stat: 'crafted_weapon_damage', modifier: 20, description: '+20% crafted weapon damage' },
          { stat: 'crafted_armor_defense', modifier: 20, description: '+20% crafted armor defense' }
        ]
      },
      {
        id: 'masterwork',
        name: 'Masterwork',
        description: 'Create items of legendary quality',
        trustRequired: MentorTrustLevel.HEIR,
        type: 'unlock',
        effects: [
          { stat: 'masterwork_crafting', modifier: 1, description: 'Can create Masterwork items' },
          { stat: 'masterwork_chance', modifier: 10, description: '10% chance for automatic Masterwork' }
        ]
      }
    ],
    storyline: {
      introduction: "An elderly craftsman works at his forge, each hammer strike precise and purposeful.",
      background: "Wong Li is the last master of ancient Chinese crafting techniques. He seeks a student who values patience and perfection over speed and profit.",
      quests: [
        {
          questId: 'wongli-first-craft',
          trustLevelUnlock: MentorTrustLevel.ACQUAINTANCE,
          title: 'First Craft',
          description: 'Create your first item under Wong Li\'s guidance'
        },
        {
          questId: 'wongli-patience',
          trustLevelUnlock: MentorTrustLevel.STUDENT,
          title: 'The Lesson of Patience',
          description: 'Spend 10 hours crafting a single perfect item'
        },
        {
          questId: 'wongli-materials',
          trustLevelUnlock: MentorTrustLevel.APPRENTICE,
          title: 'Sacred Materials',
          description: 'Gather rare materials from across the territory'
        },
        {
          questId: 'wongli-legacy-item',
          trustLevelUnlock: MentorTrustLevel.DISCIPLE,
          title: 'The Legacy Item',
          description: 'Craft a legendary weapon using ancient techniques'
        },
        {
          questId: 'wongli-masterwork',
          trustLevelUnlock: MentorTrustLevel.HEIR,
          title: 'True Masterwork',
          description: 'Create a Masterwork item worthy of the ancient masters'
        }
      ],
      finalChallenge: 'Create a Masterwork item that surpasses even Wong Li\'s finest work',
      legacy: 'Wong Li\'s legendary hammer and the title of Master Craftsman'
    },
    dialogue: {
      greeting: "Ah, you return. Good. We have much work to do.",
      introduction: "True craftsmanship cannot be rushed. If you seek quick profits, go elsewhere. If you seek perfection, I will teach you the ways of the old masters.",
      training: [
        "Each strike of the hammer must have purpose. Wasted motion is wasted time.",
        "The materials speak to those who listen. Learn their language.",
        "Quality over quantity, always. One perfect blade is worth a hundred crude ones."
      ],
      success: [
        "Yes! This is the work of a true craftsman!",
        "You are learning. The ancestors would approve.",
        "Excellent work. You honor the craft."
      ],
      failure: [
        "Rushed work is poor work. Start again, with patience.",
        "You did not listen to the materials. Try once more.",
        "Even masters make mistakes. The difference is, they learn."
      ],
      farewell: "May your crafts be flawless and your name renowned."
    }
  }
];

/**
 * Get mentor by ID
 */
export function getMentorById(mentorId: string): Mentor | undefined {
  return MENTORS.find(m => m.mentorId === mentorId);
}

/**
 * Get mentors by specialty
 */
export function getMentorsBySpecialty(specialty: MentorSpecialty): Mentor[] {
  return MENTORS.filter(m => m.specialty === specialty);
}

/**
 * Get mentors by faction
 */
export function getMentorsByFaction(faction: string): Mentor[] {
  return MENTORS.filter(m => m.faction === faction);
}

/**
 * Get mentors available at a location
 */
export function getMentorsByLocation(location: string): Mentor[] {
  return MENTORS.filter(m => m.location === location);
}
