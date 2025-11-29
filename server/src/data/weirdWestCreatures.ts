/**
 * Weird West Creatures Data - Phase 10, Wave 10.2
 *
 * All 16+ supernatural creature definitions with complete horror atmosphere
 */

import {
  WeirdWestCreature,
  CreatureCategory,
  DamageType,
  SpawnConditionType,
  AuraEffectType
} from '@desperados/shared';

/**
 * All Weird West creatures (16+)
 * Organized by category: Cryptids, Undead, Lovecraftian, Spirits, Bosses
 */
export const WEIRD_WEST_CREATURES: WeirdWestCreature[] = [
  // ============================================================
  // CRYPTIDS (5) - American Folklore
  // ============================================================
  {
    id: 'chupacabra',
    name: 'Chupacabra',
    category: CreatureCategory.CRYPTID,
    description: 'A reptilian creature with leathery gray skin, spines along its back, and glowing red eyes. It moves with unnatural speed on powerful hind legs.',
    horrorDescription: 'The stench hits you first—rotting meat mixed with sulfur. Then you see it: hunched over a drained carcass, blood dripping from needle-like fangs. Its eyes snap toward you, burning crimson in the darkness. It hisses, revealing a mouth full of barbed teeth, and begins to circle you with predatory grace.',
    lore: 'The goat-sucker of the Frontera. Ranchers speak of entire herds drained of blood in a single night. Some say it came from the depths of The Scar. Others claim it\'s a demon. All agree: nothing natural could kill like this.',
    locations: ['Frontera Border', 'Dusty Ranch', 'Desert Wastes'],
    spawnConditions: [
      { type: SpawnConditionType.TIME_OF_DAY, value: 'night', description: 'Only appears after sundown' },
      { type: SpawnConditionType.WEATHER, value: 'clear', description: 'Hunts on clear nights' }
    ],
    encounterChance: 0.15,
    levelRequirement: 8,
    health: 250,
    attackPower: 35,
    defense: 20,
    specialAttacks: [
      {
        id: 'blood_drain',
        name: 'Blood Drain',
        description: 'Latches onto victim and drains their blood',
        damage: 50,
        damageType: DamageType.PHYSICAL,
        effectChance: 0.3,
        effect: {
          type: 'weakness',
          duration: 30,
          description: 'Severe blood loss causes weakness'
        }
      },
      {
        id: 'paralytic_bite',
        name: 'Paralytic Bite',
        description: 'Injects paralyzing venom',
        damage: 25,
        damageType: DamageType.POISON,
        effectChance: 0.4,
        effect: {
          type: 'paralysis',
          duration: 15,
          description: 'Cannot move or act'
        }
      }
    ],
    weaknesses: [
      {
        damageType: DamageType.FIRE,
        multiplier: 1.5,
        description: 'Fire burns its leathery hide effectively'
      },
      {
        damageType: DamageType.SILVER,
        multiplier: 1.3,
        description: 'Silver disrupts its unnatural biology'
      }
    ],
    immunities: [DamageType.POISON],
    sanityDamage: 8,
    auraEffects: [
      {
        type: AuraEffectType.FEAR,
        radius: 15,
        power: 6,
        description: 'Its presence instills primal fear',
        tickInterval: 10
      }
    ],
    fearLevel: 7,
    drops: [
      {
        itemId: 'chupacabra-hide',
        name: 'Chupacabra Hide',
        dropChance: 0.8,
        minQuantity: 1,
        maxQuantity: 2,
        rarity: 'rare',
        description: 'Leathery hide from the blood-sucker. Used in alchemy.',
        value: 75
      },
      {
        itemId: 'blood-vial',
        name: 'Cursed Blood Vial',
        dropChance: 0.6,
        minQuantity: 1,
        maxQuantity: 3,
        rarity: 'uncommon',
        description: 'Strange blood with alchemical properties',
        value: 30
      },
      {
        itemId: 'venomous-fang',
        name: 'Venomous Fang',
        dropChance: 0.4,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'rare',
        description: 'Needle-sharp fang dripping with paralytic venom',
        value: 50
      }
    ],
    xpReward: 800,
    goldReward: { min: 50, max: 100 },
    achievementId: 'blood_hunter',
    behaviorPattern: 'stalking',
    canFlee: true,
    fleeThreshold: 25,
    appearance: 'Reptilian humanoid, 4 feet tall, spined back, glowing red eyes',
    soundDescription: 'Wet hissing and clicking sounds, like a predator bird mixed with a reptile',
    omenSigns: [
      'Drained animal carcasses with twin puncture wounds',
      'Sulfurous smell on the wind',
      'Strange clicking sounds in the darkness',
      'Livestock panic and huddle together'
    ]
  },

  {
    id: 'jersey_devil',
    name: 'Jersey Devil',
    category: CreatureCategory.CRYPTID,
    description: 'A winged demon with the head of a horse, bat-like wings, cloven hooves, and a forked tail. It shrieks as it swoops from the sky.',
    horrorDescription: 'A piercing scream splits the night—part horse, part human, all wrong. The shadow passes overhead, blotting out the stars. You glimpse twisted wings, a elongated skull, and eyes like burning coals. It circles back, hooves clicking together as it prepares to dive. The legend is real. And it\'s coming for you.',
    lore: 'Born in the Pine Barrens of the East, but legends say one followed a wagon train west. How it survived the journey, no one knows. Now it haunts the wastes, a flying terror that preys on the unwary. Its scream is said to herald death.',
    locations: ['The Wastes', 'Desert Canyons', 'Abandoned Settlements'],
    spawnConditions: [
      { type: SpawnConditionType.TIME_OF_DAY, value: 'night', description: 'Hunts at night' },
      { type: SpawnConditionType.WEATHER, value: 'storm', description: 'More active during storms' }
    ],
    encounterChance: 0.10,
    levelRequirement: 12,
    health: 300,
    attackPower: 40,
    defense: 15,
    specialAttacks: [
      {
        id: 'diving_strike',
        name: 'Diving Strike',
        description: 'Swoops from above with devastating force',
        damage: 60,
        damageType: DamageType.PHYSICAL,
        sanityDamage: 5
      },
      {
        id: 'death_shriek',
        name: 'Death Shriek',
        description: 'Ear-splitting scream that induces terror',
        damage: 20,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 12,
        effectChance: 0.5,
        effect: {
          type: 'fear',
          duration: 20,
          description: 'Overwhelming terror paralyzes the victim'
        }
      },
      {
        id: 'rending_claws',
        name: 'Rending Claws',
        description: 'Tears with razor-sharp talons',
        damage: 45,
        damageType: DamageType.PHYSICAL
      }
    ],
    weaknesses: [
      {
        damageType: DamageType.HOLY,
        multiplier: 2.0,
        description: 'Holy weapons are extremely effective against this demon',
        requiredItem: 'blessed-ammunition'
      }
    ],
    immunities: [DamageType.POISON, DamageType.FIRE],
    resistances: [
      { type: DamageType.PHYSICAL, multiplier: 0.8 }
    ],
    sanityDamage: 10,
    auraEffects: [
      {
        type: AuraEffectType.FEAR,
        radius: 25,
        power: 8,
        description: 'Its mere presence causes dread',
        tickInterval: 8
      }
    ],
    fearLevel: 9,
    drops: [
      {
        itemId: 'devil-wing',
        name: 'Devil Wing Fragment',
        dropChance: 0.7,
        minQuantity: 1,
        maxQuantity: 2,
        rarity: 'epic',
        description: 'Leathery wing membrane from the Jersey Devil',
        value: 150
      },
      {
        itemId: 'infernal-essence',
        name: 'Infernal Essence',
        dropChance: 0.5,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'rare',
        description: 'Dark energy extracted from the demon',
        value: 100
      },
      {
        itemId: 'cursed-hoof',
        name: 'Cursed Hoof',
        dropChance: 0.3,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'epic',
        description: 'Cloven hoof that radiates unnatural heat',
        value: 175
      }
    ],
    xpReward: 1200,
    goldReward: { min: 80, max: 150 },
    achievementId: 'devil_slayer',
    behaviorPattern: 'aggressive',
    canFlee: true,
    fleeThreshold: 30,
    appearance: 'Horse-headed demon with bat wings, forked tail, cloven hooves',
    soundDescription: 'Piercing shriek like a woman screaming mixed with a horse\'s whinny',
    omenSigns: [
      'Strange shrieking in the distance',
      'Livestock refuse to go outside',
      'Large wing-shaped shadows pass overhead',
      'Cloven hoof prints that glow faintly at night'
    ]
  },

  {
    id: 'wendigo',
    name: 'Wendigo',
    category: CreatureCategory.CRYPTID,
    description: 'An emaciated, skeletal figure standing 8 feet tall. Antlers sprout from its skull. Its skin is stretched tight over bones, gray as winter ice. Its eyes are sunken black pits.',
    horrorDescription: 'The temperature plummets. Your breath forms clouds in the suddenly frozen air. Then you see it between the trees—impossibly thin, impossibly tall, moving with jerking, wrong movements. Antlers scrape against branches. Its lipless mouth hangs open, revealing rows of shattered teeth. The worst part? It was human once. You can still see that in its desperate, hungry eyes.',
    lore: 'They say when a man resorts to cannibalism in the harsh northern winters, the Wendigo curse takes him. He becomes a creature of endless hunger, doomed to hunt and devour human flesh forever. Each victim makes the Wendigo grow larger, but never satisfied. The Nahi know the signs and flee. Settlers often don\'t.',
    locations: ['Northern Mountains', 'Snow Pass', 'Frozen Woods'],
    spawnConditions: [
      { type: SpawnConditionType.WEATHER, value: 'snow', description: 'Appears during snowfall' },
      { type: SpawnConditionType.TIME_OF_DAY, value: 'night', description: 'Hunts at night' },
      { type: SpawnConditionType.LOCATION_STATE, value: 'isolated', description: 'Only when alone' }
    ],
    encounterChance: 0.08,
    levelRequirement: 15,
    health: 400,
    attackPower: 50,
    defense: 25,
    specialAttacks: [
      {
        id: 'wendigo_gaze',
        name: 'Wendigo Gaze',
        description: 'Its eyes induce madness and cannibalistic urges',
        damage: 0,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 20,
        effectChance: 0.6,
        effect: {
          type: 'madness',
          duration: 60,
          description: 'Overwhelming hunger and violent thoughts'
        }
      },
      {
        id: 'freezing_aura',
        name: 'Freezing Touch',
        description: 'Unnatural cold that freezes flesh on contact',
        damage: 55,
        damageType: DamageType.COLD,
        effectChance: 0.4,
        effect: {
          type: 'frostbite',
          duration: 45,
          description: 'Frozen limbs, reduced mobility'
        }
      },
      {
        id: 'savage_rend',
        name: 'Savage Rend',
        description: 'Tears into victim with supernatural strength',
        damage: 70,
        damageType: DamageType.PHYSICAL
      }
    ],
    weaknesses: [
      {
        damageType: DamageType.FIRE,
        multiplier: 2.0,
        description: 'Fire is the only way to truly destroy a Wendigo'
      },
      {
        damageType: DamageType.SILVER,
        multiplier: 1.5,
        description: 'Silver can wound its cursed flesh'
      }
    ],
    immunities: [DamageType.COLD, DamageType.POISON],
    sanityDamage: 15,
    auraEffects: [
      {
        type: AuraEffectType.COLD,
        radius: 20,
        power: 10,
        description: 'Unnatural cold emanates from the creature',
        tickInterval: 5
      },
      {
        type: AuraEffectType.MADNESS,
        radius: 15,
        power: 8,
        description: 'Its presence induces cannibalistic thoughts',
        tickInterval: 10
      }
    ],
    fearLevel: 10,
    drops: [
      {
        itemId: 'frozen-heart',
        name: 'Frozen Heart',
        dropChance: 0.9,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'legendary',
        description: 'The ice-cold heart of a Wendigo. Never thaws.',
        value: 300
      },
      {
        itemId: 'wendigo-skull',
        name: 'Wendigo Skull',
        dropChance: 0.6,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'epic',
        description: 'Antlered skull that whispers in the dark',
        value: 200
      },
      {
        itemId: 'cursed-bone',
        name: 'Cursed Bone Fragment',
        dropChance: 0.7,
        minQuantity: 2,
        maxQuantity: 4,
        rarity: 'rare',
        description: 'Bones that never warm to the touch',
        value: 60
      }
    ],
    xpReward: 2000,
    goldReward: { min: 150, max: 300 },
    achievementId: 'wendigo_hunter',
    behaviorPattern: 'stalking',
    canFlee: false,
    appearance: '8-foot tall skeletal humanoid with antlers, gray-white skin stretched over bones',
    soundDescription: 'Rasping breath like wind through ice, clicking bones, and hungry moans',
    omenSigns: [
      'Sudden temperature drop of 20+ degrees',
      'All animals flee the area in terror',
      'Trees crack and freeze despite mild weather',
      'Whispers of hunger on the wind',
      'Footprints in the snow—human, but wrong'
    ]
  },

  {
    id: 'skinwalker',
    name: 'Skinwalker (Yee Naaldlooshii)',
    category: CreatureCategory.CRYPTID,
    description: 'A witch that has forsaken humanity to take animal forms. In transition, it appears as a twisted amalgamation—human and beast merged in ways that violate nature. Eyes glow yellow. Skin shifts and ripples.',
    horrorDescription: 'You hear your companion\'s voice calling from the darkness. But your companion is right beside you. The voice calls again, perfectly mimicked. Then you see it—walking on two legs but bent at wrong angles, wearing a coyote\'s pelt like a cloak. Its face shifts between human and animal. It smiles with too many teeth. It speaks with your mother\'s voice. This is why the Nahi refuse to speak its name.',
    lore: 'Among the worst taboos of the Nahi people is the Skinwalker—a witch who has murdered a close relative to gain the power to transform. They can take the form of any animal, mimic any voice, and move with impossible speed. To speak of them draws their attention. To see one is to be marked for death. The Coalition hunts them relentlessly, but Skinwalkers are cunning.',
    locations: ['Nahi Territory', 'Desert Wastes', 'Canyon Country'],
    spawnConditions: [
      { type: SpawnConditionType.TIME_OF_DAY, value: 'night', description: 'Active only at night' },
      { type: SpawnConditionType.PLAYER_CONDITION, value: 'alone', description: 'Targets isolated individuals' }
    ],
    encounterChance: 0.06,
    levelRequirement: 18,
    sanityRequirement: 80,
    health: 350,
    attackPower: 45,
    defense: 30,
    specialAttacks: [
      {
        id: 'voice_mimicry',
        name: 'Voice Mimicry',
        description: 'Perfectly mimics a loved one\'s voice to lure victims',
        damage: 0,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 15,
        effectChance: 0.7,
        effect: {
          type: 'confusion',
          duration: 30,
          description: 'Cannot distinguish friend from foe'
        }
      },
      {
        id: 'shape_shift',
        name: 'Shape Shift',
        description: 'Transforms into a predatory animal mid-combat',
        damage: 50,
        damageType: DamageType.PHYSICAL,
        effectChance: 0.5,
        effect: {
          type: 'transformation',
          duration: 20,
          description: 'Gains new abilities in animal form'
        }
      },
      {
        id: 'curse_touch',
        name: 'Curse Touch',
        description: 'Inflicts a wasting curse',
        damage: 30,
        damageType: DamageType.PHYSICAL,
        sanityDamage: 10,
        effectChance: 0.4,
        effect: {
          type: 'curse',
          duration: 120,
          description: 'Slowly weakens over time'
        }
      }
    ],
    weaknesses: [
      {
        damageType: DamageType.SILVER,
        multiplier: 2.0,
        description: 'Silver pierces the stolen forms'
      },
      {
        damageType: DamageType.HOLY,
        multiplier: 1.5,
        description: 'Sacred items disrupt their dark magic',
        requiredItem: 'blessed-weapon'
      }
    ],
    immunities: [DamageType.POISON],
    resistances: [
      { type: DamageType.PHYSICAL, multiplier: 0.7 }
    ],
    sanityDamage: 18,
    auraEffects: [
      {
        type: AuraEffectType.CONFUSION,
        radius: 25,
        power: 9,
        description: 'Reality seems to shift in its presence',
        tickInterval: 12
      }
    ],
    fearLevel: 10,
    drops: [
      {
        itemId: 'skinwalker-pelt',
        name: 'Skinwalker Pelt',
        dropChance: 0.5,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'legendary',
        description: 'A hide that shifts between animal forms. Allows transformation rituals.',
        value: 500
      },
      {
        itemId: 'dark-medicine',
        name: 'Dark Medicine Bundle',
        dropChance: 0.6,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'epic',
        description: 'Forbidden ritual components. The Nahi would destroy this on sight.',
        value: 250
      },
      {
        itemId: 'witch-bone',
        name: 'Witch Bone',
        dropChance: 0.7,
        minQuantity: 1,
        maxQuantity: 3,
        rarity: 'rare',
        description: 'Bones inscribed with dark symbols',
        value: 80
      }
    ],
    xpReward: 2500,
    goldReward: { min: 200, max: 400 },
    achievementId: 'skinwalker_vanquisher',
    behaviorPattern: 'ambush',
    canFlee: true,
    fleeThreshold: 20,
    appearance: 'Shifting form—sometimes human, sometimes animal, often horrifically between',
    soundDescription: 'Mimicked voices, animal growls, scraping of claws, whispered curses',
    omenSigns: [
      'Hearing loved ones\' voices when they\'re not there',
      'Animal tracks that switch between species mid-stride',
      'Yellow eyes watching from the darkness',
      'Dogs whimpering and hiding',
      'Feeling of being stalked for days'
    ]
  },

  {
    id: 'thunderbird',
    name: 'Thunderbird',
    category: CreatureCategory.CRYPTID,
    description: 'A massive bird with a wingspan of 30 feet. Its feathers crackle with lightning. Each beat of its wings brings thunder. Ancient and sacred, it embodies the storm itself.',
    horrorDescription: 'The sky darkens in seconds. Lightning forks across the heavens. Then you see it—a bird the size of a wagon, wreathed in storm clouds. Its eyes are pure white electricity. Thunder cracks with each wing beat, so loud your ears ring. A bolt of lightning strikes the ground ten feet away. This is a god made flesh, and you have trespassed on sacred ground.',
    lore: 'The Thunderbird is sacred to the Nahi—a spirit of storms and renewal. Thunderbird Peak is forbidden to outsiders. Those who climb it seeking power or glory often don\'t return. The few who do are changed, marked by lightning scars. The Thunderbird judges the hearts of those it encounters. The guilty are struck down. The worthy are tested.',
    locations: ['Thunderbird Peak', 'Storm Cliffs', 'Sacred Mountains'],
    spawnConditions: [
      { type: SpawnConditionType.WEATHER, value: 'storm', description: 'Appears during thunderstorms' },
      { type: SpawnConditionType.LOCATION_STATE, value: 'sacred_site', description: 'Only at sacred locations' },
      { type: SpawnConditionType.QUEST_STATE, value: 'vision_quest', description: 'Part of Nahi vision quest' }
    ],
    encounterChance: 0.05,
    levelRequirement: 20,
    questRequirement: 'nahi_vision_quest',
    health: 500,
    attackPower: 60,
    defense: 35,
    specialAttacks: [
      {
        id: 'lightning_strike',
        name: 'Lightning Strike',
        description: 'Calls down lightning from the heavens',
        damage: 100,
        damageType: DamageType.LIGHTNING,
        sanityDamage: 10
      },
      {
        id: 'thunder_clap',
        name: 'Thunder Clap',
        description: 'Deafening thunder that stuns',
        damage: 40,
        damageType: DamageType.PHYSICAL,
        effectChance: 0.6,
        effect: {
          type: 'stun',
          duration: 10,
          description: 'Deafened and disoriented'
        }
      },
      {
        id: 'storm_winds',
        name: 'Storm Winds',
        description: 'Hurricane-force winds knock enemies around',
        damage: 50,
        damageType: DamageType.PHYSICAL,
        effectChance: 0.5,
        effect: {
          type: 'knockback',
          duration: 5,
          description: 'Thrown backwards violently'
        }
      },
      {
        id: 'talon_strike',
        name: 'Talon Strike',
        description: 'Massive talons that can pierce steel',
        damage: 80,
        damageType: DamageType.PHYSICAL
      }
    ],
    weaknesses: [],
    immunities: [DamageType.LIGHTNING, DamageType.COLD],
    resistances: [
      { type: DamageType.PHYSICAL, multiplier: 0.6 },
      { type: DamageType.FIRE, multiplier: 0.8 }
    ],
    sanityDamage: 12,
    auraEffects: [
      {
        type: AuraEffectType.FEAR,
        radius: 40,
        power: 10,
        description: 'Overwhelming presence of divine power',
        tickInterval: 15
      }
    ],
    fearLevel: 10,
    drops: [
      {
        itemId: 'storm-feather',
        name: 'Storm Feather',
        dropChance: 0.8,
        minQuantity: 1,
        maxQuantity: 3,
        rarity: 'legendary',
        description: 'A feather that crackles with perpetual lightning. Sacred to the Nahi.',
        value: 400
      },
      {
        itemId: 'thunder-essence',
        name: 'Thunder Essence',
        dropChance: 0.6,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'epic',
        description: 'Bottled storm energy. Handle with extreme care.',
        value: 300
      },
      {
        itemId: 'sky-talon',
        name: 'Sky Talon',
        dropChance: 0.4,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'legendary',
        description: 'A talon the size of a dagger. Channels lightning.',
        value: 450
      }
    ],
    xpReward: 3000,
    goldReward: { min: 0, max: 0 },
    achievementId: 'storm_rider',
    behaviorPattern: 'territorial',
    canFlee: false,
    appearance: 'Massive eagle-like bird, 30-foot wingspan, lightning crackling across feathers',
    soundDescription: 'Thunder with each wing beat, eagle\'s cry that shakes the earth',
    omenSigns: [
      'Sudden storm formation over specific peak',
      'Lightning striking the same spot repeatedly',
      'Thunder that sounds like words',
      'All birds flee the area',
      'Massive shadow passing across the sun'
    ]
  },

  // ============================================================
  // UNDEAD (3) - Ghosts and Revenants
  // ============================================================
  {
    id: 'revenant_outlaw',
    name: 'Revenant Outlaw',
    category: CreatureCategory.UNDEAD,
    description: 'The ghost of a gunslinger who died with a grudge. Translucent, flickering like a heat mirage. Still wears his dusty coat and hat. Bullet holes riddle his chest. His eyes burn with otherworldly fire.',
    horrorDescription: 'The temperature drops. Your breath mists. Then you hear it—the slow, deliberate footsteps of boots on wooden planks, but there are no planks here. A figure materializes, ethereal and flickering. His face is locked in a rictus of rage and pain. Six bullet wounds glow like embers in his chest. He reaches for a ghostly revolver. "You look like the man who killed me," he rasps. You weren\'t even born when he died.',
    lore: 'Some outlaws die so violently, so full of rage and unfinished business, that death itself can\'t hold them. They return as revenants—ghosts bound to the place they died, doomed to relive their last moments eternally. Most seek revenge on those who wronged them. Some can\'t tell the living from the dead anymore and attack everyone.',
    locations: ['Ghost Town', 'Old Battlefields', 'Execution Sites', 'Burned Ranches'],
    spawnConditions: [
      { type: SpawnConditionType.TIME_OF_DAY, value: 'night', description: 'Only manifests at night' },
      { type: SpawnConditionType.LOCATION_STATE, value: 'death_site', description: 'Bound to place of death' }
    ],
    encounterChance: 0.20,
    levelRequirement: 10,
    health: 200,
    attackPower: 40,
    defense: 5,
    specialAttacks: [
      {
        id: 'phantom_shot',
        name: 'Phantom Shot',
        description: 'Fires ethereal bullets that pass through armor',
        damage: 45,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 5
      },
      {
        id: 'quick_draw',
        name: 'Dead Man\'s Draw',
        description: 'Supernatural speed in drawing and firing',
        damage: 60,
        damageType: DamageType.PSYCHIC,
        cooldown: 15
      },
      {
        id: 'death_touch',
        name: 'Touch of the Grave',
        description: 'Drains life force with icy touch',
        damage: 35,
        damageType: DamageType.COLD,
        sanityDamage: 8
      }
    ],
    weaknesses: [
      {
        damageType: DamageType.HOLY,
        multiplier: 2.0,
        description: 'Holy water and blessed items can destroy ghosts',
        requiredItem: 'holy-water'
      },
      {
        damageType: DamageType.SILVER,
        multiplier: 1.5,
        description: 'Silver disrupts ethereal forms'
      }
    ],
    immunities: [DamageType.PHYSICAL, DamageType.POISON],
    resistances: [
      { type: DamageType.FIRE, multiplier: 0.5 }
    ],
    sanityDamage: 10,
    auraEffects: [
      {
        type: AuraEffectType.COLD,
        radius: 10,
        power: 5,
        description: 'Deathly cold surrounds the revenant',
        tickInterval: 10
      }
    ],
    fearLevel: 7,
    drops: [
      {
        itemId: 'ghostly-revolver',
        name: 'Ghostly Revolver',
        dropChance: 0.15,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'epic',
        description: 'A translucent six-shooter. Fires phantom bullets.',
        value: 200
      },
      {
        itemId: 'cursed-bullet',
        name: 'Cursed Bullet',
        dropChance: 0.5,
        minQuantity: 1,
        maxQuantity: 6,
        rarity: 'rare',
        description: 'A bullet that killed a man. Still has his rage.',
        value: 40
      },
      {
        itemId: 'ectoplasm',
        name: 'Ectoplasm',
        dropChance: 0.7,
        minQuantity: 1,
        maxQuantity: 3,
        rarity: 'uncommon',
        description: 'Ghostly residue. Used in spirit rituals.',
        value: 25
      }
    ],
    xpReward: 1000,
    goldReward: { min: 60, max: 120 },
    achievementId: 'ghost_hunter',
    behaviorPattern: 'aggressive',
    canFlee: false,
    appearance: 'Translucent gunslinger with bullet wounds, flickering ethereal form',
    soundDescription: 'Distant gunshots, boots on wooden planks, death rattle breathing',
    omenSigns: [
      'Sudden cold spots',
      'Smell of gun smoke when there\'s no fire',
      'Shadowy figure in peripheral vision',
      'Sound of gunfights from decades ago'
    ]
  },

  {
    id: 'bone_herd',
    name: 'Bone Herd',
    category: CreatureCategory.UNDEAD,
    description: 'A stampede of skeletal cattle, their bones held together by dark magic. Empty eye sockets glow with green fire. They charge endlessly, trampling everything in their path.',
    horrorDescription: 'The ground trembles. You hear them before you see them—the thunder of hooves, but wrong, clicking and clattering. Then they burst from the darkness: a herd of skeletal cattle, ribs exposed, horns sharp as blades, running at impossible speed. Green flame flickers in their skulls. They don\'t deviate. They don\'t stop. They don\'t die because they\'re already dead. Run.',
    lore: 'During the Great Die-Off of \'73, thousands of cattle died on the trail drives, poisoned by bad water near The Scar. Their bones should have bleached in the sun. Instead, dark magic animated them. Now the Bone Herd thunders across the old cattle trails on certain nights, trampling the living and recruiting the dead.',
    locations: ['Old Cattle Trail', 'Dusty Plains', 'Deadman\'s Crossing'],
    spawnConditions: [
      { type: SpawnConditionType.TIME_OF_DAY, value: 'night', description: 'Active only at night' },
      { type: SpawnConditionType.LOCATION_STATE, value: 'cattle_trail', description: 'Follows old cattle routes' }
    ],
    encounterChance: 0.12,
    levelRequirement: 8,
    health: 180,
    attackPower: 35,
    defense: 15,
    specialAttacks: [
      {
        id: 'bone_stampede',
        name: 'Bone Stampede',
        description: 'The entire herd charges, trampling everything',
        damage: 70,
        damageType: DamageType.PHYSICAL,
        sanityDamage: 8,
        effectChance: 0.5,
        effect: {
          type: 'knockdown',
          duration: 10,
          description: 'Trampled and stunned'
        }
      },
      {
        id: 'gore_attack',
        name: 'Spectral Gore',
        description: 'Sharp horns enhanced by dark magic',
        damage: 50,
        damageType: DamageType.PHYSICAL
      }
    ],
    weaknesses: [
      {
        damageType: DamageType.HOLY,
        multiplier: 2.0,
        description: 'Holy magic can lay them to rest',
        requiredItem: 'blessed-salt'
      },
      {
        damageType: DamageType.FIRE,
        multiplier: 1.5,
        description: 'Fire destroys the dark magic binding them'
      }
    ],
    immunities: [DamageType.POISON, DamageType.COLD],
    sanityDamage: 7,
    auraEffects: [
      {
        type: AuraEffectType.FEAR,
        radius: 30,
        power: 6,
        description: 'Primal fear of being trampled',
        tickInterval: 5
      }
    ],
    fearLevel: 6,
    drops: [
      {
        itemId: 'cursed-bone',
        name: 'Cursed Cattle Bone',
        dropChance: 0.8,
        minQuantity: 2,
        maxQuantity: 5,
        rarity: 'uncommon',
        description: 'Bone that refuses to rest. Glows faintly green.',
        value: 20
      },
      {
        itemId: 'spectral-horn',
        name: 'Spectral Horn',
        dropChance: 0.4,
        minQuantity: 1,
        maxQuantity: 2,
        rarity: 'rare',
        description: 'Horn that phases through matter',
        value: 60
      }
    ],
    xpReward: 600,
    goldReward: { min: 30, max: 80 },
    achievementId: 'herd_stopper',
    behaviorPattern: 'aggressive',
    canFlee: false,
    appearance: 'Skeletal cattle with green fire in eye sockets, bones held by dark magic',
    soundDescription: 'Thundering hooves, clicking bones, hollow bellowing',
    omenSigns: [
      'Ground trembling with no visible source',
      'Clicking sounds in the distance',
      'Green lights on the horizon',
      'Old-timers telling stories of the Die-Off'
    ]
  },

  {
    id: 'hanged_man',
    name: 'The Hanged Man',
    category: CreatureCategory.UNDEAD,
    description: 'The ghost of a wrongly executed man, still hanging from an invisible noose. His neck is twisted at a wrong angle. The rope mark burns red. He drifts above the ground, swaying slightly.',
    horrorDescription: 'You see the old hanging tree—gnarled, dead, silhouetted against the moon. The noose still hangs there, swaying in wind that isn\'t blowing. Then you realize there\'s something in the noose. A man. Hanging. His feet dangle three feet off the ground. His neck is broken, head lolling at an impossible angle. Slowly, he raises his head. His eyes are white. "You let them hang me," he whispers. "Now you hang too." The noose begins to move toward you.',
    lore: 'Justice on the frontier was swift and often wrong. Innocent men hanged for crimes they didn\'t commit. Some of those men didn\'t stay dead. The Hanged Man appears at execution sites, particularly hanging trees. He kills with the noose—an invisible rope that tightens around victims\' throats until they choke. The only way to stop him is to prove his innocence or find his real killer.',
    locations: ['Hanging Tree', 'Old Courthouse', 'Execution Hill', 'Ghost Town Gallows'],
    spawnConditions: [
      { type: SpawnConditionType.TIME_OF_DAY, value: 'night', description: 'Appears after dark' },
      { type: SpawnConditionType.LOCATION_STATE, value: 'execution_site', description: 'Bound to hanging location' }
    ],
    encounterChance: 0.15,
    levelRequirement: 12,
    health: 250,
    attackPower: 38,
    defense: 10,
    specialAttacks: [
      {
        id: 'phantom_noose',
        name: 'Phantom Noose',
        description: 'Invisible rope tightens around victim\'s throat',
        damage: 55,
        damageType: DamageType.PHYSICAL,
        sanityDamage: 12,
        effectChance: 0.6,
        effect: {
          type: 'suffocation',
          duration: 20,
          description: 'Cannot breathe, choking'
        }
      },
      {
        id: 'hanging_judgment',
        name: 'Hanging Judgment',
        description: 'Judges the victim and finds them guilty',
        damage: 40,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 15,
        effectChance: 0.5,
        effect: {
          type: 'guilt',
          duration: 30,
          description: 'Overwhelmed by guilt for every wrong deed'
        }
      },
      {
        id: 'death_glare',
        name: 'Death Glare',
        description: 'The stare of the wrongfully condemned',
        damage: 30,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 10
      }
    ],
    weaknesses: [
      {
        damageType: DamageType.HOLY,
        multiplier: 2.0,
        description: 'Holy items can release his soul',
        requiredItem: 'holy-symbol'
      }
    ],
    immunities: [DamageType.PHYSICAL, DamageType.POISON],
    sanityDamage: 13,
    auraEffects: [
      {
        type: AuraEffectType.SUFFOCATION,
        radius: 15,
        power: 7,
        description: 'Breathing becomes difficult in his presence',
        tickInterval: 8
      }
    ],
    fearLevel: 9,
    drops: [
      {
        itemId: 'noose-of-judgment',
        name: 'Noose of Judgment',
        dropChance: 0.3,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'legendary',
        description: 'The rope that killed an innocent man. Judges the guilty.',
        value: 350
      },
      {
        itemId: 'ghost-cloth',
        name: 'Ghost Cloth',
        dropChance: 0.6,
        minQuantity: 1,
        maxQuantity: 2,
        rarity: 'rare',
        description: 'Ethereal fabric from the hanged man\'s shirt',
        value: 70
      },
      {
        itemId: 'innocence-token',
        name: 'Token of Innocence',
        dropChance: 0.5,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'epic',
        description: 'Proof of wrongful execution. Guards against false accusations.',
        value: 150
      }
    ],
    xpReward: 1400,
    goldReward: { min: 80, max: 160 },
    achievementId: 'justice_served',
    behaviorPattern: 'territorial',
    canFlee: false,
    appearance: 'Ghostly figure hanging from invisible noose, broken neck, white eyes',
    soundDescription: 'Creaking rope, choking gasps, whispered accusations',
    omenSigns: [
      'Old nooses swaying with no wind',
      'Feeling of tightness around throat',
      'Whispers of "guilty, guilty"',
      'Seeing hangings that happened decades ago'
    ]
  },

  // Continue in next message due to length...
];

// Additional creatures continue...
export const WEIRD_WEST_CREATURES_PART_2: WeirdWestCreature[] = [
  // ============================================================
  // LOVECRAFTIAN HORRORS (4) - From The Scar
  // ============================================================
  {
    id: 'scar_spawn',
    name: 'Scar Spawn',
    category: CreatureCategory.LOVECRAFTIAN,
    description: 'A writhing mass of tentacles and mouths, slithering from the depths of The Scar. Its flesh is slick and gray, covered in suckers that leak black ichor. Multiple eyes blink asynchronously.',
    horrorDescription: 'It comes from the crack in the earth—that bleeding wound in reality called The Scar. At first you think it\'s a mass of snakes, but snakes don\'t have that many mouths. Tentacles as thick as your arm wrap around rocks, pulling a bulbous body into view. Eyes—dozens of them—fix on you. Each mouth screams at a different pitch. The sound drives spikes through your skull. This is wrong. This shouldn\'t exist. But it does. And it\'s hungry.',
    lore: 'The Scar is a wound in the world, a place where the barriers between realities grow thin. Things slip through. The Scar Spawn are the smallest, weakest things that emerge. If these are the common creatures from beyond... God help us all. They hunger for human flesh and drive men mad with their presence.',
    locations: ['The Scar', 'Scar Periphery', 'Corrupted Mines'],
    spawnConditions: [
      { type: SpawnConditionType.LOCATION_STATE, value: 'near_scar', description: 'Only near The Scar' },
      { type: SpawnConditionType.TIME_OF_DAY, value: 'night', description: 'More active at night' }
    ],
    encounterChance: 0.25,
    levelRequirement: 15,
    health: 300,
    attackPower: 45,
    defense: 20,
    specialAttacks: [
      {
        id: 'tentacle_lash',
        name: 'Tentacle Lash',
        description: 'Multiple tentacles strike from different angles',
        damage: 50,
        damageType: DamageType.PHYSICAL,
        sanityDamage: 8
      },
      {
        id: 'maddening_shriek',
        name: 'Maddening Shriek',
        description: 'All mouths scream at once, driving listeners insane',
        damage: 30,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 20,
        effectChance: 0.7,
        effect: {
          type: 'madness',
          duration: 40,
          description: 'Hallucinations and paranoia'
        }
      },
      {
        id: 'acid_spray',
        name: 'Acid Spray',
        description: 'Sprays digestive acid from multiple mouths',
        damage: 55,
        damageType: DamageType.ACID,
        effectChance: 0.5,
        effect: {
          type: 'burn',
          duration: 25,
          description: 'Flesh dissolving slowly'
        }
      }
    ],
    weaknesses: [
      {
        damageType: DamageType.FIRE,
        multiplier: 1.5,
        description: 'Fire burns the otherworldly flesh'
      }
    ],
    immunities: [DamageType.POISON],
    resistances: [
      { type: DamageType.COLD, multiplier: 0.7 }
    ],
    sanityDamage: 18,
    auraEffects: [
      {
        type: AuraEffectType.MADNESS,
        radius: 20,
        power: 9,
        description: 'Reality bends around the creature',
        tickInterval: 10
      }
    ],
    fearLevel: 9,
    drops: [
      {
        itemId: 'eldritch-flesh',
        name: 'Eldritch Flesh',
        dropChance: 0.8,
        minQuantity: 2,
        maxQuantity: 4,
        rarity: 'rare',
        description: 'Otherworldly meat that writhes even after death',
        value: 90
      },
      {
        itemId: 'sanity-shard',
        name: 'Sanity Shard',
        dropChance: 0.5,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'epic',
        description: 'A crystallized fragment of stolen sanity',
        value: 180
      },
      {
        itemId: 'void-ichor',
        name: 'Void Ichor',
        dropChance: 0.6,
        minQuantity: 1,
        maxQuantity: 3,
        rarity: 'uncommon',
        description: 'Black blood that never fully solidifies',
        value: 50
      }
    ],
    xpReward: 1800,
    goldReward: { min: 100, max: 200 },
    achievementId: 'scar_survivor',
    behaviorPattern: 'aggressive',
    canFlee: false,
    appearance: 'Bulbous mass of tentacles, multiple mouths and eyes, gray slick flesh',
    soundDescription: 'Wet slithering, discordant screaming from multiple mouths, chittering',
    omenSigns: [
      'Reality seems to waver and distort',
      'Feeling of being watched by many eyes',
      'Black ichor on rocks and ground',
      'Echoing shrieks from underground'
    ]
  },

  {
    id: 'night_gaunt',
    name: 'Night Gaunt',
    category: CreatureCategory.LOVECRAFTIAN,
    description: 'A faceless, skeletal humanoid with bat-like wings. Its skin is smooth and black, like polished obsidian. It has no features where its face should be—just smooth, black nothing. Long, barbed tail.',
    horrorDescription: 'You don\'t see it coming. They fly silently. One moment you\'re alone under the stars, the next, something swoops down and grabs you with cold, skeletal hands. You\'re lifted into the air, climbing higher and higher. You try to look at its face—there is no face. Just smooth blackness where features should be. It doesn\'t make a sound. That\'s the worst part. If it wanted to, it could drop you from a thousand feet up. You\'d scream all the way down. It wouldn\'t care.',
    lore: 'Night Gaunts emerge from The Scar after sunset, flying on silent wings to snatch victims and carry them into the sky. Some are dropped from great heights. Others are never seen again. A few survivors report being carried to The Scar itself and released at its edge, driven mad by what they saw in the darkness below.',
    locations: ['The Scar', 'Scar Edge', 'Corrupted Canyon', 'Anywhere at night near The Scar'],
    spawnConditions: [
      { type: SpawnConditionType.TIME_OF_DAY, value: 'night', description: 'Only appears at night' },
      { type: SpawnConditionType.LOCATION_STATE, value: 'open_sky', description: 'Needs open sky to fly' }
    ],
    encounterChance: 0.12,
    levelRequirement: 18,
    health: 280,
    attackPower: 42,
    defense: 25,
    specialAttacks: [
      {
        id: 'aerial_snatch',
        name: 'Aerial Snatch',
        description: 'Grabs victim and carries them into the sky',
        damage: 40,
        damageType: DamageType.PHYSICAL,
        sanityDamage: 15,
        effectChance: 0.6,
        effect: {
          type: 'grabbed',
          duration: 20,
          description: 'Helpless, being carried upward'
        }
      },
      {
        id: 'drop_attack',
        name: 'Drop Attack',
        description: 'Drops victim from great height',
        damage: 100,
        damageType: DamageType.PHYSICAL,
        sanityDamage: 10
      },
      {
        id: 'faceless_gaze',
        name: 'Faceless Gaze',
        description: 'Staring into the void where its face should be',
        damage: 0,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 18,
        effectChance: 0.5,
        effect: {
          type: 'existential_dread',
          duration: 60,
          description: 'Overwhelming sense of cosmic insignificance'
        }
      },
      {
        id: 'barbed_tail',
        name: 'Barbed Tail Strike',
        description: 'Long tail with poisonous barbs',
        damage: 45,
        damageType: DamageType.POISON
      }
    ],
    weaknesses: [
      {
        damageType: DamageType.LIGHTNING,
        multiplier: 1.5,
        description: 'Lightning disrupts their flight'
      }
    ],
    immunities: [DamageType.COLD],
    resistances: [
      { type: DamageType.PHYSICAL, multiplier: 0.8 }
    ],
    sanityDamage: 16,
    auraEffects: [
      {
        type: AuraEffectType.FEAR,
        radius: 25,
        power: 8,
        description: 'Silent, faceless terror',
        tickInterval: 12
      }
    ],
    fearLevel: 9,
    drops: [
      {
        itemId: 'void-skin',
        name: 'Void Skin',
        dropChance: 0.7,
        minQuantity: 1,
        maxQuantity: 2,
        rarity: 'epic',
        description: 'Black, smooth skin that absorbs light',
        value: 200
      },
      {
        itemId: 'silence-essence',
        name: 'Silence Essence',
        dropChance: 0.5,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'rare',
        description: 'Bottled absolute silence',
        value: 120
      },
      {
        itemId: 'barbed-tail-segment',
        name: 'Barbed Tail Segment',
        dropChance: 0.6,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'rare',
        description: 'Poisonous barbs still active',
        value: 85
      }
    ],
    xpReward: 2000,
    goldReward: { min: 120, max: 240 },
    achievementId: 'sky_terror_defeated',
    behaviorPattern: 'ambush',
    canFlee: true,
    fleeThreshold: 30,
    appearance: 'Skeletal black humanoid with bat wings, no face, barbed tail',
    soundDescription: 'Complete silence. Absence of all sound in its presence.',
    omenSigns: [
      'Unnatural silence falls over area',
      'Black shapes against stars',
      'Feeling of being watched from above',
      'Other flying creatures flee in terror'
    ]
  },

  {
    id: 'deep_one_hybrid',
    name: 'Deep One Hybrid',
    category: CreatureCategory.LOVECRAFTIAN,
    description: 'A grotesque fusion of human and fish. Bulging eyes, gills on the neck, webbed hands, scales covering gray-green skin. It reeks of rot and brine despite being hundreds of miles from any ocean.',
    horrorDescription: 'The flooded mine shaft should be empty. Instead, something moves in the dark water. It surfaces slowly—a face that was human once, but wrong. Eyes too large, unblinking. Gills flutter on its neck. Its mouth opens revealing rows of needle teeth. "Come into the water," it croaks in a voice like drowning. Behind it, you see more. A whole colony, living in the flooded tunnels. They\'ve been here for years. Waiting.',
    lore: 'When The Scar opened, it connected to places that should not exist. Underground rivers that flow from impossible oceans. Things came up through those rivers—fish-men from lightless depths. They breed with humans, creating hybrids. The hybrids retain some humanity at first, but the Change always completes eventually. Now they lurk in flooded mines and underground waterways, building colonies.',
    locations: ['Flooded Mines', 'Underground Rivers', 'The Scar Depths', 'Corrupted Wells'],
    spawnConditions: [
      { type: SpawnConditionType.LOCATION_STATE, value: 'underground_water', description: 'Only near underground water' }
    ],
    encounterChance: 0.18,
    levelRequirement: 14,
    health: 260,
    attackPower: 38,
    defense: 22,
    specialAttacks: [
      {
        id: 'drowning_grasp',
        name: 'Drowning Grasp',
        description: 'Pulls victim underwater to drown',
        damage: 45,
        damageType: DamageType.COLD,
        sanityDamage: 10,
        effectChance: 0.5,
        effect: {
          type: 'drowning',
          duration: 30,
          description: 'Cannot breathe, vision blurring'
        }
      },
      {
        id: 'call_of_the_deep',
        name: 'Call of the Deep',
        description: 'Psychic call to join them in the water',
        damage: 25,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 15,
        effectChance: 0.6,
        effect: {
          type: 'compulsion',
          duration: 40,
          description: 'Overwhelming urge to enter the water'
        }
      },
      {
        id: 'swarming_attack',
        name: 'Swarming Attack',
        description: 'Multiple hybrids attack at once',
        damage: 55,
        damageType: DamageType.PHYSICAL
      }
    ],
    weaknesses: [
      {
        damageType: DamageType.FIRE,
        multiplier: 2.0,
        description: 'Fire is agony to their aquatic forms'
      }
    ],
    immunities: [DamageType.COLD],
    resistances: [
      { type: DamageType.POISON, multiplier: 0.5 }
    ],
    sanityDamage: 14,
    auraEffects: [
      {
        type: AuraEffectType.MADNESS,
        radius: 15,
        power: 7,
        description: 'The call of impossible oceans',
        tickInterval: 15
      }
    ],
    fearLevel: 8,
    drops: [
      {
        itemId: 'scale-mail',
        name: 'Deep One Scale Mail',
        dropChance: 0.6,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'rare',
        description: 'Armor made from unnatural scales',
        value: 110
      },
      {
        itemId: 'deep-one-idol',
        name: 'Deep One Idol',
        dropChance: 0.4,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'epic',
        description: 'Strange idol worshipped by the fish-men',
        value: 180
      },
      {
        itemId: 'brine-pearl',
        name: 'Brine Pearl',
        dropChance: 0.5,
        minQuantity: 1,
        maxQuantity: 2,
        rarity: 'uncommon',
        description: 'Pearl from impossible depths',
        value: 65
      }
    ],
    xpReward: 1500,
    goldReward: { min: 90, max: 180 },
    achievementId: 'depths_explorer',
    behaviorPattern: 'territorial',
    canFlee: true,
    fleeThreshold: 25,
    appearance: 'Fish-human hybrid, scaled gray-green skin, gills, bulging eyes, webbed hands',
    soundDescription: 'Wet gurgling, croaking voices, sound of water dripping',
    omenSigns: [
      'Smell of rotting fish despite no water nearby',
      'Wet footprints that end suddenly',
      'Croaking sounds from underground',
      'Water tastes wrong, brackish'
    ]
  },

  {
    id: 'the_watcher',
    name: 'The Watcher in The Scar',
    category: CreatureCategory.LOVECRAFTIAN,
    description: 'A massive eye embedded in the earth itself, thirty feet across. The iris swirls with impossible colors. Tentacles writhe around its edges. It sees everything. It knows you.',
    horrorDescription: 'You stand at the edge of The Scar, that bleeding wound in the earth. The crack goes down so far you can\'t see the bottom. But something down there can see you. You feel it before you see it—the weight of attention from something vast and alien. Then it opens. An eye. Thirty feet across. Staring up at you from the depths. The pupil dilates. It SEES you. All of you. Every sin, every secret, every fear. You can\'t look away. It won\'t let you. Your mind begins to crack.',
    lore: 'Some say The Watcher is The Scar itself—that the wound in the earth is the eyelid, and something unimaginably vast lies beneath, watching through this aperture. Others claim it\'s a guardian, placed there by the Nahi to prevent something even worse from emerging. No one who stares into The Watcher returns unchanged. Most don\'t return at all.',
    locations: ['The Scar - Central Depths'],
    spawnConditions: [
      { type: SpawnConditionType.LOCATION_STATE, value: 'scar_depths', description: 'Only in central Scar' },
      { type: SpawnConditionType.QUEST_STATE, value: 'scar_descent', description: 'Requires special quest' }
    ],
    encounterChance: 1.0,
    levelRequirement: 25,
    questRequirement: 'into_the_scar_quest',
    health: 800,
    attackPower: 55,
    defense: 40,
    specialAttacks: [
      {
        id: 'hypnotic_gaze',
        name: 'Hypnotic Gaze',
        description: 'Staring into the eye traps the mind',
        damage: 0,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 30,
        effectChance: 0.8,
        effect: {
          type: 'hypnosis',
          duration: 60,
          description: 'Cannot look away, cannot act'
        }
      },
      {
        id: 'summon_spawn',
        name: 'Summon Spawn',
        description: 'Summons Scar Spawn to defend itself',
        damage: 0,
        damageType: DamageType.PHYSICAL,
        effectChance: 1.0,
        effect: {
          type: 'summon',
          duration: 0,
          description: 'Spawns 1d4 Scar Spawn'
        },
        cooldown: 30
      },
      {
        id: 'reality_warp',
        name: 'Reality Warp',
        description: 'The area around The Watcher bends and twists',
        damage: 60,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 20,
        effectChance: 0.7,
        effect: {
          type: 'confusion',
          duration: 45,
          description: 'Up becomes down, left becomes right'
        }
      },
      {
        id: 'tentacle_lash',
        name: 'Tentacle Lash',
        description: 'Writhing tentacles around the eye strike out',
        damage: 70,
        damageType: DamageType.PHYSICAL
      }
    ],
    weaknesses: [
      {
        damageType: DamageType.HOLY,
        multiplier: 1.5,
        description: 'Sacred items can close the eye',
        requiredItem: 'blessed-seal'
      }
    ],
    immunities: [DamageType.POISON, DamageType.COLD],
    resistances: [
      { type: DamageType.PHYSICAL, multiplier: 0.5 },
      { type: DamageType.FIRE, multiplier: 0.7 }
    ],
    sanityDamage: 25,
    auraEffects: [
      {
        type: AuraEffectType.MADNESS,
        radius: 50,
        power: 10,
        description: 'The gaze that sees all and breaks minds',
        tickInterval: 5
      }
    ],
    fearLevel: 10,
    drops: [
      {
        itemId: 'all-seeing-eye',
        name: 'The All-Seeing Eye',
        dropChance: 1.0,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'legendary',
        description: 'A fragment of The Watcher. Grants terrible knowledge.',
        value: 1000
      },
      {
        itemId: 'reality-shard',
        name: 'Reality Shard',
        dropChance: 0.8,
        minQuantity: 1,
        maxQuantity: 3,
        rarity: 'legendary',
        description: 'A piece of broken reality itself',
        value: 500
      }
    ],
    xpReward: 5000,
    goldReward: { min: 0, max: 0 },
    achievementId: 'seen_the_unseeable',
    behaviorPattern: 'summoner',
    canFlee: false,
    appearance: '30-foot eye embedded in earth, swirling impossible-colored iris, writhing tentacles',
    soundDescription: 'Low thrumming vibration felt in bones, whispers in unknown languages',
    omenSigns: [
      'Feeling of being watched intensifies',
      'The Scar pulses with light',
      'All Scar Spawn flee the area',
      'Time seems to slow or speed up randomly'
    ]
  },

  // ============================================================
  // NATIVE AMERICAN SPIRITS (3) - Cultural Respectfully Portrayed
  // ============================================================
  {
    id: 'deer_woman',
    name: 'Deer Woman',
    category: CreatureCategory.SPIRIT,
    description: 'A beautiful woman in traditional dress, but her legs end in deer hooves. She appears at night to men traveling alone, luring them with beauty and charm.',
    horrorDescription: 'She\'s the most beautiful woman you\'ve ever seen. Long dark hair, traditional dress embroidered with intricate patterns. She smiles at you from the edge of the firelight. "You look cold," she says, her voice like music. "Come closer." You stand, drawn to her. Then you notice—her dress doesn\'t reach the ground. Below the hem, you see hooves. Deer hooves. You try to run, but your legs won\'t obey. She\'s still smiling. "Men who look with lust instead of respect," she says softly, "do not deserve to look at all."',
    lore: 'Deer Woman is a spirit of the Nahi people—a guardian and a judge. She tests men, appearing as a beautiful woman to see if they will show respect or only lust. Those who are respectful and honor women, she leaves alone or even aids. Those who prove lustful and disrespectful... are never seen again. Her hooves are her tell—the mark of the spirit world. Wise men look for the hooves.',
    locations: ['Spirit Springs', 'Sacred Forests', 'Nahi Territory'],
    spawnConditions: [
      { type: SpawnConditionType.TIME_OF_DAY, value: 'night', description: 'Appears at night' },
      { type: SpawnConditionType.PLAYER_CONDITION, value: 'alone_male', description: 'Targets lone men' }
    ],
    encounterChance: 0.10,
    levelRequirement: 12,
    health: 250,
    attackPower: 40,
    defense: 25,
    specialAttacks: [
      {
        id: 'luring_beauty',
        name: 'Luring Beauty',
        description: 'Supernatural beauty paralyzes lustful victims',
        damage: 0,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 12,
        effectChance: 0.8,
        effect: {
          type: 'enchantment',
          duration: 45,
          description: 'Cannot move, drawn to her'
        }
      },
      {
        id: 'trampling_hooves',
        name: 'Trampling Hooves',
        description: 'Kicks with supernatural strength',
        damage: 60,
        damageType: DamageType.PHYSICAL
      },
      {
        id: 'judgment_gaze',
        name: 'Gaze of Judgment',
        description: 'Her eyes judge your character',
        damage: 40,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 15,
        effectChance: 0.6,
        effect: {
          type: 'guilt',
          duration: 60,
          description: 'All sins remembered, overwhelming shame'
        }
      }
    ],
    weaknesses: [
      {
        damageType: DamageType.HOLY,
        multiplier: 1.3,
        description: 'Sacred items from Nahi traditions',
        requiredItem: 'sacred-bundle'
      }
    ],
    immunities: [DamageType.POISON],
    sanityDamage: 12,
    auraEffects: [
      {
        type: AuraEffectType.FEAR,
        radius: 15,
        power: 7,
        description: 'Supernatural beauty mixed with primal terror',
        tickInterval: 10
      }
    ],
    fearLevel: 7,
    drops: [
      {
        itemId: 'spirit-hoof',
        name: 'Spirit Hoof',
        dropChance: 0.7,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'epic',
        description: 'Deer hoof from the spirit world. A warning and a lesson.',
        value: 200
      },
      {
        itemId: 'enchanted-hide',
        name: 'Enchanted Deer Hide',
        dropChance: 0.5,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'rare',
        description: 'Hide marked with spirit patterns',
        value: 150
      }
    ],
    xpReward: 1400,
    goldReward: { min: 0, max: 0 },
    achievementId: 'survived_judgment',
    behaviorPattern: 'territorial',
    canFlee: true,
    fleeThreshold: 30,
    appearance: 'Beautiful woman in traditional dress, but with deer hooves below the hem',
    soundDescription: 'Soft, musical voice; clicking of hooves on stone',
    omenSigns: [
      'Unnaturally beautiful woman alone at night',
      'Sound of deer hooves nearby',
      'Feeling of being judged',
      'Deer watching from the treeline'
    ]
  },

  {
    id: 'uktena',
    name: 'Uktena - The Horned Serpent',
    category: CreatureCategory.SPIRIT,
    description: 'A massive serpent, forty feet long, with a single crystal horn growing from its forehead. Its scales shimmer with rainbow colors. Ancient beyond measure, powerful beyond understanding.',
    horrorDescription: 'The sacred lake is still as glass. Then the water begins to churn. Something massive rises from the depths—a serpent\'s head the size of a wagon. Rainbow scales catch the light. But your eyes are drawn to the horn—a crystal the size of your fist, growing from its brow, glowing with inner light. Its eyes are ancient, older than the mountains. It regards you with intelligence that makes you feel like an insect. When it speaks, the words appear directly in your mind: "You have trespassed on sacred waters. Justify your existence."',
    lore: 'Uktena is one of the oldest and most powerful spirits of the Nahi people. It guards sacred lakes and underground rivers. The crystal in its forehead—the Ulunsu\'ti—holds immense power. Many have tried to steal it. All have died. The Uktena tests those it encounters. Pass its test, and it may grant a blessing. Fail, and you join the bones at the bottom of the lake.',
    locations: ['Sacred Lake', 'Hidden Pools', 'Underground Reservoir'],
    spawnConditions: [
      { type: SpawnConditionType.LOCATION_STATE, value: 'sacred_water', description: 'Only at sacred waters' },
      { type: SpawnConditionType.QUEST_STATE, value: 'spirit_quest', description: 'Part of spirit quest' }
    ],
    encounterChance: 0.05,
    levelRequirement: 22,
    questRequirement: 'nahi_spirit_trial',
    health: 600,
    attackPower: 50,
    defense: 40,
    specialAttacks: [
      {
        id: 'crystal_beam',
        name: 'Ulunsu\'ti Crystal Beam',
        description: 'Fires beam of pure energy from forehead crystal',
        damage: 90,
        damageType: DamageType.LIGHTNING,
        sanityDamage: 10
      },
      {
        id: 'water_control',
        name: 'Water Control',
        description: 'Commands the water to drown enemies',
        damage: 65,
        damageType: DamageType.COLD,
        effectChance: 0.6,
        effect: {
          type: 'drowning',
          duration: 30,
          description: 'Water enters lungs'
        }
      },
      {
        id: 'coil_crush',
        name: 'Crushing Coils',
        description: 'Wraps around victim and squeezes',
        damage: 75,
        damageType: DamageType.PHYSICAL,
        effectChance: 0.5,
        effect: {
          type: 'constricted',
          duration: 25,
          description: 'Cannot breathe, bones cracking'
        }
      },
      {
        id: 'ancient_judgment',
        name: 'Ancient Judgment',
        description: 'Judges the worth of the challenger',
        damage: 50,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 18
      }
    ],
    weaknesses: [],
    immunities: [DamageType.COLD, DamageType.POISON, DamageType.LIGHTNING],
    resistances: [
      { type: DamageType.PHYSICAL, multiplier: 0.6 },
      { type: DamageType.FIRE, multiplier: 0.7 }
    ],
    sanityDamage: 15,
    auraEffects: [
      {
        type: AuraEffectType.FEAR,
        radius: 35,
        power: 9,
        description: 'Presence of ancient divine power',
        tickInterval: 10
      }
    ],
    fearLevel: 9,
    drops: [
      {
        itemId: 'ulunsu-ti-crystal',
        name: 'Ulunsu\'ti Crystal Fragment',
        dropChance: 0.3,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'legendary',
        description: 'A shard of the great crystal. Holds vast power. The Nahi consider it sacred.',
        value: 800
      },
      {
        itemId: 'serpent-scale',
        name: 'Rainbow Serpent Scale',
        dropChance: 0.7,
        minQuantity: 2,
        maxQuantity: 4,
        rarity: 'epic',
        description: 'Scale that shimmers with all colors',
        value: 180
      },
      {
        itemId: 'spirit-water',
        name: 'Sacred Water',
        dropChance: 0.8,
        minQuantity: 1,
        maxQuantity: 3,
        rarity: 'rare',
        description: 'Water blessed by Uktena\'s presence',
        value: 90
      }
    ],
    xpReward: 3500,
    goldReward: { min: 0, max: 0 },
    achievementId: 'serpent_trial_passed',
    behaviorPattern: 'territorial',
    canFlee: false,
    appearance: '40-foot serpent with rainbow scales and crystal horn in forehead',
    soundDescription: 'Hissing that sounds like rushing water, deep rumbling voice in mind',
    omenSigns: [
      'Sacred waters begin to glow',
      'All fish disappear from the lake',
      'Rainbow shimmer beneath the surface',
      'Feeling of ancient presence watching'
    ]
  },

  {
    id: 'owl_woman',
    name: 'Owl Woman (La Lechuza)',
    category: CreatureCategory.SPIRIT,
    description: 'A witch who transforms into a massive owl, seven feet tall with a human face. Her eyes are large and yellow, unblinking. Her talons can tear through steel.',
    horrorDescription: 'You hear the owl\'s call—but it sounds wrong. Too deep. Too loud. Then you see her perched on the barn roof. An owl, but far too large. Seven feet tall, with a wingspan of fifteen feet. She turns her head toward you, and your blood freezes. The face is human. An old woman\'s face on an owl\'s body, grinning with too many teeth. She speaks in a croaking voice: "I know your future, little one. Do you want to hear how you die?" Her wings spread, and she drops silently toward you.',
    lore: 'La Lechuza is a bruja—a witch who made a pact with dark forces. She can transform into a giant owl and flies at night, hunting the wicked and the innocent alike. She knows the future, particularly deaths. In the Frontera, mothers warn children that La Lechuza will take them if they misbehave. But she\'s real. And she\'s always hungry.',
    locations: ['Frontera', 'Border Towns', 'Desert Nights', 'Abandoned Ranches'],
    spawnConditions: [
      { type: SpawnConditionType.TIME_OF_DAY, value: 'night', description: 'Hunts at night' },
      { type: SpawnConditionType.WEATHER, value: 'clear', description: 'Clear nights for flying' }
    ],
    encounterChance: 0.12,
    levelRequirement: 16,
    health: 320,
    attackPower: 44,
    defense: 28,
    specialAttacks: [
      {
        id: 'death_prophecy',
        name: 'Death Prophecy',
        description: 'Speaks the manner of victim\'s death',
        damage: 0,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 20,
        effectChance: 0.7,
        effect: {
          type: 'doom',
          duration: 120,
          description: 'Haunted by visions of prophesied death'
        }
      },
      {
        id: 'talon_rend',
        name: 'Talon Rend',
        description: 'Massive talons tear through flesh and armor',
        damage: 70,
        damageType: DamageType.PHYSICAL
      },
      {
        id: 'witch_curse',
        name: 'Witch\'s Curse',
        description: 'Inflicts a hex that brings misfortune',
        damage: 30,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 12,
        effectChance: 0.6,
        effect: {
          type: 'curse',
          duration: 180,
          description: 'Bad luck and misfortune'
        }
      },
      {
        id: 'silent_dive',
        name: 'Silent Dive Attack',
        description: 'Owl\'s hunting stoop from above',
        damage: 80,
        damageType: DamageType.PHYSICAL
      }
    ],
    weaknesses: [
      {
        damageType: DamageType.HOLY,
        multiplier: 2.0,
        description: 'Holy items repel witchcraft',
        requiredItem: 'holy-medal'
      },
      {
        damageType: DamageType.SILVER,
        multiplier: 1.5,
        description: 'Silver can harm her witch-form'
      }
    ],
    immunities: [DamageType.POISON],
    sanityDamage: 14,
    auraEffects: [
      {
        type: AuraEffectType.FEAR,
        radius: 25,
        power: 8,
        description: 'Dread of prophecy and death',
        tickInterval: 12
      }
    ],
    fearLevel: 8,
    drops: [
      {
        itemId: 'witch-feather',
        name: 'Lechuza Feather',
        dropChance: 0.7,
        minQuantity: 2,
        maxQuantity: 4,
        rarity: 'rare',
        description: 'Feather from the witch-owl. Used in dark rituals.',
        value: 95
      },
      {
        itemId: 'curse-ward',
        name: 'Curse Ward Amulet',
        dropChance: 0.4,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'epic',
        description: 'Amulet that protects against hexes',
        value: 220
      },
      {
        itemId: 'prophecy-scroll',
        name: 'Scroll of Prophecy',
        dropChance: 0.3,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'legendary',
        description: 'Her final prophecy, written in blood',
        value: 350
      }
    ],
    xpReward: 1800,
    goldReward: { min: 110, max: 220 },
    achievementId: 'witch_slayer',
    behaviorPattern: 'stalking',
    canFlee: true,
    fleeThreshold: 25,
    appearance: 'Giant owl with human face, 7 feet tall, yellow eyes, massive talons',
    soundDescription: 'Deep owl hoots, cackling laughter, croaking prophecies',
    omenSigns: [
      'Unnaturally large owl shadows',
      'Deep hooting that sounds like laughter',
      'Chickens and livestock panic at night',
      'Feeling of doom and prophecy'
    ]
  },

  // ============================================================
  // BOSS HORROR (1) - Ultimate Endgame Entity
  // ============================================================
  {
    id: 'what_waits_below',
    name: 'What-Waits-Below',
    category: CreatureCategory.BOSS,
    description: 'The thing at the bottom of The Scar. Massive beyond comprehension. A writhing mountain of tentacles, eyes, and mouths. Reality breaks around it. To see it is to go mad. To fight it is to die. But someone must try.',
    horrorDescription: 'You descend into The Scar. Down. Down. Down into darkness so absolute that light itself seems to die. Then you reach the bottom—except it isn\'t the bottom. It\'s HIM. What you thought was the floor is flesh. Alien flesh that writhes and pulses. Eyes the size of wagons open in the darkness, dozens of them, hundreds. Each one looks at you. Into you. Through you. A voice speaks, but not in words—directly into your mind, bypassing all protection: "I HAVE WAITED SO LONG FOR FOOD TO DESCEND." The tentacles begin to rise. They block out what little light remains. This is what the Nahi sealed. This is what wants to devour the world. This is What-Waits-Below.',
    lore: 'Before the first humans walked these lands, something fell from the stars. Or rose from beneath. Or broke through from another dimension. The origin doesn\'t matter. What matters is that it tried to consume the world. The ancient Nahi united with forces from beyond to seal it beneath the earth. They carved runes of binding. They performed sacrifices. They succeeded—barely. But seals weaken over time. The Scar is where the seal cracked. Now, What-Waits-Below is waking. If it breaks free... there will be no world left to save.',
    locations: ['The Scar - Absolute Depths'],
    spawnConditions: [
      { type: SpawnConditionType.QUEST_STATE, value: 'final_descent', description: 'Only during final quest' }
    ],
    encounterChance: 1.0,
    levelRequirement: 30,
    questRequirement: 'seal_the_scar_quest',
    sanityRequirement: 50,
    health: 2000,
    attackPower: 70,
    defense: 50,
    specialAttacks: [
      {
        id: 'reality_collapse',
        name: 'Reality Collapse',
        description: 'The laws of physics break down',
        damage: 100,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 30,
        effectChance: 0.9,
        effect: {
          type: 'reality_break',
          duration: 45,
          description: 'Cannot distinguish real from unreal'
        }
      },
      {
        id: 'thousand_tentacles',
        name: 'Thousand Tentacles',
        description: 'Innumerable tentacles attack from all directions',
        damage: 120,
        damageType: DamageType.PHYSICAL,
        sanityDamage: 15
      },
      {
        id: 'void_gaze',
        name: 'Gaze Into the Void',
        description: 'All eyes focus on one victim',
        damage: 80,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 40,
        effectChance: 0.8,
        effect: {
          type: 'soul_death',
          duration: 60,
          description: 'Your very soul begins to unravel'
        }
      },
      {
        id: 'spawn_horrors',
        name: 'Spawn Lesser Horrors',
        description: 'Births smaller entities to attack',
        damage: 0,
        damageType: DamageType.PHYSICAL,
        effectChance: 1.0,
        effect: {
          type: 'summon',
          duration: 0,
          description: 'Summons 3-6 Scar Spawn'
        },
        cooldown: 40
      },
      {
        id: 'consume_sanity',
        name: 'Consume Sanity',
        description: 'Feeds on madness and fear',
        damage: 60,
        damageType: DamageType.PSYCHIC,
        sanityDamage: 35
      },
      {
        id: 'earthquake',
        name: 'Scar Earthquake',
        description: 'The entire Scar shakes with its movement',
        damage: 90,
        damageType: DamageType.PHYSICAL,
        effectChance: 0.7,
        effect: {
          type: 'knockdown',
          duration: 20,
          description: 'Thrown to the ground, rocks falling'
        }
      }
    ],
    weaknesses: [
      {
        damageType: DamageType.HOLY,
        multiplier: 1.8,
        description: 'Ancient sealing magic can harm it',
        requiredItem: 'ancient-seal-fragment'
      }
    ],
    immunities: [DamageType.POISON, DamageType.COLD],
    resistances: [
      { type: DamageType.PHYSICAL, multiplier: 0.3 },
      { type: DamageType.FIRE, multiplier: 0.5 },
      { type: DamageType.LIGHTNING, multiplier: 0.6 }
    ],
    sanityDamage: 30,
    auraEffects: [
      {
        type: AuraEffectType.MADNESS,
        radius: 100,
        power: 10,
        description: 'Reality itself breaks in its presence',
        tickInterval: 3
      },
      {
        type: AuraEffectType.FEAR,
        radius: 100,
        power: 10,
        description: 'Cosmic horror beyond comprehension',
        tickInterval: 5
      }
    ],
    fearLevel: 10,
    drops: [
      {
        itemId: 'fragment-of-the-void',
        name: 'Fragment of the Void',
        dropChance: 1.0,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'legendary',
        description: 'A piece of What-Waits-Below. Holding it shows you impossible truths.',
        value: 2000
      },
      {
        itemId: 'cosmic-essence',
        name: 'Cosmic Essence',
        dropChance: 1.0,
        minQuantity: 3,
        maxQuantity: 6,
        rarity: 'legendary',
        description: 'Pure essence from beyond the stars',
        value: 500
      },
      {
        itemId: 'seal-fragment',
        name: 'Ancient Seal Fragment',
        dropChance: 0.8,
        minQuantity: 1,
        maxQuantity: 1,
        rarity: 'legendary',
        description: 'Part of the seal that once bound it. Still contains power.',
        value: 800
      }
    ],
    xpReward: 10000,
    goldReward: { min: 0, max: 0 },
    achievementId: 'sealed_the_scar',
    behaviorPattern: 'summoner',
    canFlee: false,
    appearance: 'Mountain-sized writhing mass of tentacles, eyes, mouths—reality breaks around it',
    soundDescription: 'Voice directly in mind, earthquake rumbles, screaming from a thousand mouths',
    omenSigns: [
      'The Scar pulses like a heartbeat',
      'All creatures flee the area',
      'Reality begins to fray at the edges',
      'Visions of the end of the world',
      'The ground itself seems to breathe'
    ]
  }
];

/**
 * Combine all creature arrays
 */
export const ALL_WEIRD_WEST_CREATURES = [
  ...WEIRD_WEST_CREATURES,
  ...WEIRD_WEST_CREATURES_PART_2
];

/**
 * Get creature by ID
 */
export function getCreatureById(id: string): WeirdWestCreature | undefined {
  return ALL_WEIRD_WEST_CREATURES.find(c => c.id === id);
}

/**
 * Get creatures by category
 */
export function getCreaturesByCategory(category: CreatureCategory): WeirdWestCreature[] {
  return ALL_WEIRD_WEST_CREATURES.filter(c => c.category === category);
}

/**
 * Get creatures by location
 */
export function getCreaturesByLocation(location: string): WeirdWestCreature[] {
  return ALL_WEIRD_WEST_CREATURES.filter(c => c.locations.includes(location));
}

/**
 * Get boss creatures
 */
export function getBossCreatures(): WeirdWestCreature[] {
  return ALL_WEIRD_WEST_CREATURES.filter(c => c.category === CreatureCategory.BOSS);
}
