/**
 * The Scar Zone Definitions - End-Game Zones (Level 30-40)
 *
 * Defines the four major zones of The Scar region with environmental
 * hazards, mechanics, and content
 */

import {
  EndGameZone,
  ScarZone,
  ZoneRequirement,
  ZoneDebuff,
  SpecialMechanic,
  EliteSpawn,
  Gatherable,
  HiddenCache,
  ZoneCorruptionLevel,
  DailyChallengeType,
  WorldBossType,
} from '@desperados/shared';

/**
 * THE OUTER WASTE - Entry zone to The Scar (Level 30-32)
 *
 * The border region where corruption begins to manifest.
 * Reality is slightly unstable, corrupted wildlife roams.
 */
export const OUTER_WASTE: EndGameZone = {
  id: ScarZone.OUTER_WASTE,
  name: 'The Outer Waste',
  description: 'A desolate border region where the land itself seems wrong. The sky has an odd tint, and shadows move when they shouldn\'t.',
  lore: 'Once fertile ranchland, the Outer Waste marks where What-Waits-Below\'s corruption first touched the surface. Settlers who stayed too long speak of whispers in the wind and eyes in the darkness. Most fled. Those who didn\'t... changed.',
  levelRange: [30, 32],

  corruptionLevel: 30,
  realityStability: 70,
  ambientDanger: 40,
  atmosphere: 'Overcast skies with an unnatural purple tint. The air smells of ozone and decay. Distant howls that sound almost human. Vegetation is twisted and discolored.',

  enemies: [
    'corrupted_coyote',
    'void_touched_snake',
    'twisted_scorpion',
    'reality_touched_bandit',
    'corrupted_vulture',
  ],

  eliteSpawns: [
    {
      eliteId: 'void_bear',
      spawnChance: 0.15,
      maxSimultaneous: 1,
      spawnConditions: {
        timeOfDay: 'night',
        corruptionLevel: ZoneCorruptionLevel.MODERATE,
      },
      respawnCooldown: 120,
    },
    {
      eliteId: 'hollow_wolf',
      spawnChance: 0.2,
      maxSimultaneous: 2,
      spawnConditions: {
        timeOfDay: 'dusk',
      },
      respawnCooldown: 90,
    },
  ],

  dailyChallenges: [
    DailyChallengeType.SCAR_PATROL,
    DailyChallengeType.CORRUPTION_CLEANSE,
    DailyChallengeType.SURVIVOR_RESCUE,
  ],

  worldBosses: [WorldBossType.THE_MAW],

  gatherables: [
    {
      id: 'void_touched_herb',
      name: 'Void-Touched Herb',
      description: 'A plant that has absorbed corruption. Its leaves shimmer with otherworldly energy.',
      rarity: 'uncommon',
      spawnChance: 0.3,
      usedFor: ['corruption_resistance_potion', 'reality_anchor'],
    },
    {
      id: 'corrupted_crystal',
      name: 'Corrupted Crystal',
      description: 'A mineral formation twisted by eldritch energies. Warm to the touch.',
      rarity: 'rare',
      spawnChance: 0.15,
      requiredSkill: {
        skill: 'mining',
        level: 5,
      },
      usedFor: ['void_weapon_upgrade', 'corruption_focus'],
    },
    {
      id: 'reality_shard',
      name: 'Reality Shard',
      description: 'A fragment of stable reality, crystallized. It feels more real than everything around it.',
      rarity: 'epic',
      spawnChance: 0.05,
      usedFor: ['reality_armor', 'dimensional_anchor'],
    },
  ],

  hiddenCaches: [
    {
      id: 'abandoned_wagon_cache',
      location: 'Old Trade Road',
      description: 'A wagon abandoned in haste. Supplies scattered nearby.',
      difficulty: 3,
      loot: [
        { itemId: 'void_touched_herb', quantity: 3, chance: 1.0 },
        { itemId: 'corrupted_crystal', quantity: 1, chance: 0.5 },
        { itemId: 'gold', quantity: 50, chance: 1.0 },
      ],
      respawnTime: 24,
      hint: 'Where desperate settlers fled, treasures remain.',
    },
    {
      id: 'cultist_stash',
      location: 'Ruined Chapel',
      description: 'A hidden compartment beneath the altar. Ritual components inside.',
      difficulty: 5,
      loot: [
        { itemId: 'ritual_candle', quantity: 2, chance: 1.0 },
        { itemId: 'corrupted_tome', quantity: 1, chance: 0.3 },
        { itemId: 'reality_shard', quantity: 1, chance: 0.2 },
      ],
      respawnTime: 48,
      hint: 'Even the holy places fell to corruption.',
    },
  ],

  requirements: [
    {
      type: 'level',
      value: 30,
      description: 'Reach level 30',
    },
    {
      type: 'quest',
      value: 'complete_weird_west_intro',
      description: 'Complete "Beyond the Veil" questline',
    },
  ],

  playerDebuffs: [
    {
      id: 'border_corruption',
      name: 'Border Corruption',
      description: 'The air itself seems hostile. Your skin crawls.',
      effect: {
        type: 'sanity_drain',
        power: 1,
      },
      visual: 'Slight purple tint to vision',
    },
    {
      id: 'reality_unease',
      name: 'Reality Unease',
      description: 'Things don\'t move quite right. Your sense of direction falters.',
      effect: {
        type: 'stat_reduction',
        power: 5,
      },
      visual: 'Occasional visual distortions',
    },
  ],

  specialMechanics: [
    {
      id: 'corruption_surge',
      name: 'Corruption Surge',
      description: 'A wave of corruption energy sweeps through the area',
      type: 'corruption_storm',
      frequency: 30,
      duration: 60,
      effect: 'All corruption damage increased by 50%, sanity drain doubled',
      counterplay: 'Seek shelter in safe zones or use Reality Anchors',
    },
  ],

  connectedZones: [ScarZone.TWISTED_LANDS],
  safeZones: ['Ranger Outpost', 'Spirit Ward Circle'],
};

/**
 * THE TWISTED LANDS - Deep corruption zone (Level 32-35)
 *
 * Where corruption has fundamentally altered the landscape.
 * Geometry doesn't obey normal rules.
 */
export const TWISTED_LANDS: EndGameZone = {
  id: ScarZone.TWISTED_LANDS,
  name: 'The Twisted Lands',
  description: 'The ground ripples like water. Trees grow in impossible spirals. Gravity feels optional. This place should not exist.',
  lore: 'The Twisted Lands are where reality lost the fight against What-Waits-Below. Cultists established outposts here, claiming the distortions grant "clarity." They speak in riddles now, if they speak at all. The landscape itself is a maze that changes when you\'re not looking.',
  levelRange: [32, 35],

  corruptionLevel: 60,
  realityStability: 40,
  ambientDanger: 65,
  atmosphere: 'Sky swirls with colors that have no name. The horizon bends upward. Sound echoes before it\'s made. Paths loop back on themselves. Time feels elastic.',

  enemies: [
    'reality_shredder',
    'mind_flayer',
    'corrupted_cultist',
    'void_touched_elk',
    'phase_cougar',
    'dream_stalker',
  ],

  eliteSpawns: [
    {
      eliteId: 'phase_cougar',
      spawnChance: 0.25,
      maxSimultaneous: 1,
      spawnConditions: {
        corruptionLevel: ZoneCorruptionLevel.SEVERE,
      },
      respawnCooldown: 150,
    },
    {
      eliteId: 'reality_shredder',
      spawnChance: 0.2,
      maxSimultaneous: 2,
      respawnCooldown: 120,
    },
    {
      eliteId: 'mind_flayer',
      spawnChance: 0.15,
      maxSimultaneous: 1,
      spawnConditions: {
        timeOfDay: 'night',
      },
      respawnCooldown: 180,
    },
  ],

  dailyChallenges: [
    DailyChallengeType.SCAR_PATROL,
    DailyChallengeType.ARTIFACT_FRAGMENT,
    DailyChallengeType.CORRUPTION_CLEANSE,
  ],

  worldBosses: [WorldBossType.THE_COLLECTOR],

  gatherables: [
    {
      id: 'twisted_wood',
      name: 'Twisted Wood',
      description: 'Wood from trees that grow in impossible shapes. Still warm, still growing.',
      rarity: 'rare',
      spawnChance: 0.25,
      usedFor: ['reality_resistant_bow', 'void_focus_staff'],
    },
    {
      id: 'phase_essence',
      name: 'Phase Essence',
      description: 'Liquid reality. It exists in multiple states simultaneously.',
      rarity: 'epic',
      spawnChance: 0.1,
      requiredSkill: {
        skill: 'occult_knowledge',
        level: 3,
      },
      usedFor: ['phase_cloak', 'dimensional_blade'],
    },
    {
      id: 'void_flower',
      name: 'Void Flower',
      description: 'A flower that shouldn\'t exist. Its petals absorb light.',
      rarity: 'epic',
      spawnChance: 0.08,
      usedFor: ['corruption_mastery_elixir', 'void_sight_potion'],
    },
    {
      id: 'memory_fragment',
      name: 'Memory Fragment',
      description: 'A crystallized memory from someone who was here. You can almost see their last moments.',
      rarity: 'legendary',
      spawnChance: 0.03,
      usedFor: ['mind_shield_charm', 'sanity_restoration_ritual'],
    },
  ],

  hiddenCaches: [
    {
      id: 'cultist_camp',
      location: 'Spiral Grove',
      description: 'A cultist camp that phases in and out of reality. Only accessible during specific conditions.',
      difficulty: 7,
      loot: [
        { itemId: 'phase_essence', quantity: 2, chance: 0.8 },
        { itemId: 'corrupted_artifact', quantity: 1, chance: 0.4 },
        { itemId: 'void_flower', quantity: 1, chance: 0.3 },
        { itemId: 'memory_fragment', quantity: 1, chance: 0.1 },
      ],
      respawnTime: 72,
      hint: 'When the spiral aligns with the moon, the camp appears.',
    },
    {
      id: 'reality_anchor_ruins',
      location: 'Old Surveyor Station',
      description: 'Ruins of a failed attempt to stabilize reality. Equipment remains.',
      difficulty: 6,
      loot: [
        { itemId: 'reality_shard', quantity: 3, chance: 1.0 },
        { itemId: 'twisted_wood', quantity: 2, chance: 0.7 },
        { itemId: 'surveyor_notes', quantity: 1, chance: 0.5 },
      ],
      respawnTime: 48,
    },
  ],

  requirements: [
    {
      type: 'level',
      value: 32,
      description: 'Reach level 32',
    },
    {
      type: 'reputation',
      value: 1000,
      description: 'Achieve "Initiate" rank in Scar Walker reputation',
    },
  ],

  playerDebuffs: [
    {
      id: 'reality_distortion',
      name: 'Reality Distortion',
      description: 'Your body doesn\'t always obey physics. Movement feels wrong.',
      effect: {
        type: 'stat_reduction',
        power: 10,
      },
      visual: 'Character model occasionally distorts',
    },
    {
      id: 'deep_corruption',
      name: 'Deep Corruption',
      description: 'The corruption seeps into your bones. You can feel it changing you.',
      effect: {
        type: 'sanity_drain',
        power: 2,
      },
      visual: 'Dark veins visible on skin',
    },
    {
      id: 'temporal_flux',
      name: 'Temporal Flux',
      description: 'Time moves strangely. Your actions lag or rush.',
      effect: {
        type: 'stat_reduction',
        power: 8,
        duration: 300,
      },
      visual: 'Occasional time dilation effects',
    },
  ],

  specialMechanics: [
    {
      id: 'reality_tear',
      name: 'Reality Tear',
      description: 'Space itself tears open, releasing entities from beyond',
      type: 'dimension_bleed',
      frequency: 45,
      duration: 120,
      effect: 'Void entities spawn, all psychic damage increased by 100%',
      counterplay: 'Avoid the tear\'s center or seal it with Reality Shards',
    },
    {
      id: 'gravity_reversal',
      name: 'Gravity Reversal',
      description: 'Gravity inverts in random areas',
      type: 'gravity_shift',
      frequency: 60,
      duration: 90,
      effect: 'Movement inverted in affected areas, fall damage can occur',
      counterplay: 'Watch for visual warnings, use Phase Essence to stabilize',
    },
  ],

  connectedZones: [ScarZone.OUTER_WASTE, ScarZone.DEEP_SCAR],
  safeZones: ['Reality Anchor Point Alpha', 'Hermit\'s Stable Cabin'],
};

/**
 * THE DEEP SCAR - Center of corruption (Level 35-38)
 *
 * The heart of the corruption. Ancient structures emerge.
 * Powerful entities manifest freely.
 */
export const DEEP_SCAR: EndGameZone = {
  id: ScarZone.DEEP_SCAR,
  name: 'The Deep Scar',
  description: 'An impossible canyon that goes down forever. Ancient structures of non-Euclidean geometry rise from the depths. The walls whisper in languages older than humanity.',
  lore: 'Here, the veil between worlds is thinnest. Ancient structures—predating any known civilization—emerge from the depths. Scholars theorize these are fragments of What-Waits-Below\'s true realm bleeding through. The few who return speak of cities that exist in too many dimensions, of angles that hurt to perceive.',
  levelRange: [35, 38],

  corruptionLevel: 85,
  realityStability: 20,
  ambientDanger: 85,
  atmosphere: 'The canyon stretches impossibly deep. Structures float in violation of gravity. The air is thick with presence—something vast watches from below. Colors shift through spectrums the eye wasn\'t meant to see. Whispers in your mind grow louder.',

  enemies: [
    'void_walker',
    'corruption_elemental',
    'the_forgotten',
    'star_touched_buffalo',
    'entity_spawn',
    'ancient_guardian',
  ],

  eliteSpawns: [
    {
      eliteId: 'star_touched_buffalo',
      spawnChance: 0.2,
      maxSimultaneous: 1,
      spawnConditions: {
        corruptionLevel: ZoneCorruptionLevel.EXTREME,
      },
      respawnCooldown: 180,
    },
    {
      eliteId: 'void_walker',
      spawnChance: 0.3,
      maxSimultaneous: 2,
      respawnCooldown: 150,
    },
    {
      eliteId: 'corruption_elemental',
      spawnChance: 0.25,
      maxSimultaneous: 3,
      respawnCooldown: 120,
    },
    {
      eliteId: 'the_forgotten',
      spawnChance: 0.1,
      maxSimultaneous: 1,
      spawnConditions: {
        timeOfDay: 'night',
      },
      respawnCooldown: 240,
    },
  ],

  dailyChallenges: [
    DailyChallengeType.SCAR_PATROL,
    DailyChallengeType.ARTIFACT_FRAGMENT,
    DailyChallengeType.SURVIVOR_RESCUE,
  ],

  worldBosses: [WorldBossType.THE_MIRROR],

  gatherables: [
    {
      id: 'void_metal',
      name: 'Void Metal',
      description: 'Metal from beyond. It\'s cold, impossibly dense, and hungers.',
      rarity: 'epic',
      spawnChance: 0.15,
      requiredSkill: {
        skill: 'mining',
        level: 8,
      },
      usedFor: ['void_touched_weapons', 'reality_armor'],
    },
    {
      id: 'ancient_glyph',
      name: 'Ancient Glyph',
      description: 'Carved symbols from the structures. Looking at them too long causes headaches.',
      rarity: 'legendary',
      spawnChance: 0.08,
      requiredSkill: {
        skill: 'occult_knowledge',
        level: 5,
      },
      usedFor: ['corruption_mastery_unlock', 'void_ritual_components'],
    },
    {
      id: 'entity_essence',
      name: 'Entity Essence',
      description: 'The remains of a manifested entity. It pulses with alien life.',
      rarity: 'legendary',
      spawnChance: 0.05,
      usedFor: ['entity_ward', 'void_familiar_summon'],
    },
    {
      id: 'primordial_fragment',
      name: 'Primordial Fragment',
      description: 'A piece of What-Waits-Below itself. Holding it fills you with dread and power.',
      rarity: 'mythic',
      spawnChance: 0.02,
      usedFor: ['avatar_slayer_weapon', 'void_walker_armor'],
    },
  ],

  hiddenCaches: [
    {
      id: 'floating_ruins',
      location: 'Suspended Temple',
      description: 'Ancient ruins that float in the canyon. Accessible only by specific paths.',
      difficulty: 9,
      loot: [
        { itemId: 'ancient_glyph', quantity: 2, chance: 1.0 },
        { itemId: 'entity_essence', quantity: 1, chance: 0.6 },
        { itemId: 'primordial_fragment', quantity: 1, chance: 0.15 },
        { itemId: 'void_touched_artifact', quantity: 1, chance: 0.4 },
      ],
      respawnTime: 96,
      hint: 'Where gravity forgot, the ancients built.',
    },
    {
      id: 'entity_nest',
      location: 'Deep Cavern',
      description: 'A spawning ground for void entities. Dangerous but rewarding.',
      difficulty: 8,
      loot: [
        { itemId: 'entity_essence', quantity: 3, chance: 1.0 },
        { itemId: 'void_metal', quantity: 2, chance: 0.8 },
        { itemId: 'corruption_heart', quantity: 1, chance: 0.3 },
      ],
      respawnTime: 72,
      hint: 'Where entities are born, their essence remains.',
    },
  ],

  requirements: [
    {
      type: 'level',
      value: 35,
      description: 'Reach level 35',
    },
    {
      type: 'reputation',
      value: 5000,
      description: 'Achieve "Survivor" rank in Scar Walker reputation',
    },
    {
      type: 'corruption_resistance',
      value: 50,
      description: 'Have 50+ corruption resistance',
    },
  ],

  playerDebuffs: [
    {
      id: 'void_presence',
      name: 'Void Presence',
      description: 'You feel something vast and terrible watching you. It knows you\'re here.',
      effect: {
        type: 'sanity_drain',
        power: 3,
      },
      visual: 'Shadowy tendrils at edge of vision',
    },
    {
      id: 'reality_breakdown',
      name: 'Reality Breakdown',
      description: 'The laws of nature barely function here. Your body struggles to maintain coherence.',
      effect: {
        type: 'stat_reduction',
        power: 15,
      },
      visual: 'Character outline flickers',
    },
    {
      id: 'ancient_whispers',
      name: 'Ancient Whispers',
      description: 'The structures whisper secrets. Some grant power, some drive mad.',
      effect: {
        type: 'sanity_drain',
        power: 2,
      },
      visual: 'Translucent text floats around character',
    },
  ],

  specialMechanics: [
    {
      id: 'entity_manifestation',
      name: 'Entity Manifestation',
      description: 'Void entities phase into reality from the Deep',
      type: 'dimension_bleed',
      frequency: 30,
      duration: 180,
      effect: 'Multiple void entities spawn, corruption damage increased by 150%',
      counterplay: 'Use Entity Wards or flee to safe zones',
    },
    {
      id: 'ancient_structure_pulse',
      name: 'Ancient Structure Pulse',
      description: 'The structures emit waves of reality-warping energy',
      type: 'reality_distortion',
      frequency: 40,
      duration: 90,
      effect: 'Random teleportation, stat debuffs, hallucinations',
      counterplay: 'Maintain distance from structures during pulse',
    },
    {
      id: 'void_storm',
      name: 'Void Storm',
      description: 'Storms of pure corruption sweep through the canyon',
      type: 'corruption_storm',
      frequency: 50,
      duration: 120,
      effect: 'Heavy corruption gain, visibility reduced, entities empowered',
      counterplay: 'Seek shelter immediately, use corruption resistance items',
    },
  ],

  connectedZones: [ScarZone.TWISTED_LANDS, ScarZone.THE_ABYSS],
  safeZones: ['Surveyor\'s Last Stand', 'Warded Shrine'],
};

/**
 * THE ABYSS - Deepest corruption (Level 38-40)
 *
 * The bottom of The Scar. Where What-Waits-Below is closest.
 * Only the strongest survive here.
 */
export const THE_ABYSS: EndGameZone = {
  id: ScarZone.THE_ABYSS,
  name: 'The Abyss',
  description: 'The bottom of reality. Below you is nothing—pure void. The Herald of What-Waits-Below walks here. To enter is to stand at the edge of annihilation.',
  lore: 'No one knows how deep The Scar goes. Those who descend to The Abyss find the bottom—or what appears to be bottom. Here, What-Waits-Below\'s presence is overwhelming. Its Herald manifests to test those who dare trespass. Some seek power here. Some seek to close the breach. Most simply seek to survive.',
  levelRange: [38, 40],

  corruptionLevel: 100,
  realityStability: 5,
  ambientDanger: 100,
  atmosphere: 'You stand on platforms of solidified void above infinite darkness. Below, something impossibly vast moves. The Herald awaits. Reality is a suggestion here. Madness is certainty. Power and death walk hand in hand.',

  enemies: [
    'avatar_spawn',
    'herald_champion',
    'void_titan',
    'reality_eater',
    'primordial_horror',
  ],

  eliteSpawns: [
    {
      eliteId: 'void_walker',
      spawnChance: 0.4,
      maxSimultaneous: 3,
      respawnCooldown: 120,
    },
    {
      eliteId: 'corruption_elemental',
      spawnChance: 0.35,
      maxSimultaneous: 4,
      respawnCooldown: 90,
    },
  ],

  dailyChallenges: [
    DailyChallengeType.SCAR_PATROL,
    DailyChallengeType.ARTIFACT_FRAGMENT,
  ],

  worldBosses: [WorldBossType.THE_HERALD],

  gatherables: [
    {
      id: 'void_crystal',
      name: 'Void Crystal',
      description: 'Pure crystallized void. It consumes light around it.',
      rarity: 'legendary',
      spawnChance: 0.12,
      requiredSkill: {
        skill: 'mining',
        level: 10,
      },
      usedFor: ['ultimate_void_weapons', 'avatar_slayer_gear'],
    },
    {
      id: 'herald_essence',
      name: 'Herald Essence',
      description: 'Fragment of the Herald\'s power. Extremely dangerous to possess.',
      rarity: 'mythic',
      spawnChance: 0.05,
      usedFor: ['void_walker_title_quest', 'ultimate_corruption_mastery'],
    },
    {
      id: 'primordial_heart',
      name: 'Primordial Heart',
      description: 'The living core of a primordial entity. It still beats.',
      rarity: 'mythic',
      spawnChance: 0.03,
      usedFor: ['avatar_armor', 'void_familiar_evolution'],
    },
  ],

  hiddenCaches: [
    {
      id: 'herald_altar',
      location: 'The Platform of Whispers',
      description: 'An altar where the Herald receives offerings. Taking from it is... unwise.',
      difficulty: 10,
      loot: [
        { itemId: 'herald_essence', quantity: 1, chance: 0.8 },
        { itemId: 'void_crystal', quantity: 2, chance: 1.0 },
        { itemId: 'primordial_heart', quantity: 1, chance: 0.2 },
        { itemId: 'avatar_weapon_schematic', quantity: 1, chance: 0.1 },
      ],
      respawnTime: 168,
      hint: 'The Herald takes. Sometimes it gives. Always it watches.',
    },
  ],

  requirements: [
    {
      type: 'level',
      value: 38,
      description: 'Reach level 38',
    },
    {
      type: 'reputation',
      value: 12000,
      description: 'Achieve "Elite" rank in Scar Walker reputation',
    },
    {
      type: 'corruption_resistance',
      value: 75,
      description: 'Have 75+ corruption resistance',
    },
    {
      type: 'quest',
      value: 'complete_deep_scar_trials',
      description: 'Complete "Trials of the Deep" questline',
    },
  ],

  playerDebuffs: [
    {
      id: 'abyss_pressure',
      name: 'Abyss Pressure',
      description: 'The weight of the void presses down. Existence itself feels tenuous.',
      effect: {
        type: 'stat_reduction',
        power: 20,
      },
      visual: 'Character surrounded by crushing void energy',
    },
    {
      id: 'herald_gaze',
      name: 'Herald\'s Gaze',
      description: 'The Herald is aware of you. Its attention is a terrible thing.',
      effect: {
        type: 'sanity_drain',
        power: 5,
      },
      visual: 'Giant eye appears in sky periodically',
    },
    {
      id: 'void_corruption',
      name: 'Void Corruption',
      description: 'Pure void energy saturates this place. You are becoming... other.',
      effect: {
        type: 'damage_over_time',
        power: 10,
      },
      visual: 'Void energy seeps from character',
    },
  ],

  specialMechanics: [
    {
      id: 'herald_manifestation',
      name: 'Herald Manifestation',
      description: 'The Herald of What-Waits-Below appears to challenge intruders',
      type: 'dimension_bleed',
      frequency: 90,
      duration: 300,
      effect: 'Herald boss spawns, all players in Abyss must participate or flee',
      counterplay: 'Group coordination required, or escape to Deep Scar',
    },
    {
      id: 'void_collapse',
      name: 'Void Collapse',
      description: 'Sections of the platform collapse into the void',
      type: 'reality_distortion',
      frequency: 20,
      duration: 60,
      effect: 'Random platform sections become unsafe, fall = instant death',
      counterplay: 'Watch for visual warnings, maintain mobility',
    },
    {
      id: 'reality_inversion',
      name: 'Reality Inversion',
      description: 'Reality inverts—what was real becomes void, void becomes real',
      type: 'dimension_bleed',
      frequency: 60,
      duration: 45,
      effect: 'All damage types reversed, healing damages, damage heals',
      counterplay: 'Adapt combat strategy, use corruption abilities',
    },
  ],

  connectedZones: [ScarZone.DEEP_SCAR],
  safeZones: ['The Last Light Beacon'],
};

/**
 * All zones export
 */
export const SCAR_ZONES: Record<ScarZone, EndGameZone> = {
  [ScarZone.OUTER_WASTE]: OUTER_WASTE,
  [ScarZone.TWISTED_LANDS]: TWISTED_LANDS,
  [ScarZone.DEEP_SCAR]: DEEP_SCAR,
  [ScarZone.THE_ABYSS]: THE_ABYSS,
};

/**
 * Get zone by ID
 */
export function getScarZone(zoneId: ScarZone): EndGameZone | undefined {
  return SCAR_ZONES[zoneId];
}

/**
 * Get zones accessible to character level
 */
export function getAccessibleZones(characterLevel: number): EndGameZone[] {
  return Object.values(SCAR_ZONES).filter(
    zone => characterLevel >= zone.levelRange[0]
  );
}

/**
 * Get next zone to unlock
 */
export function getNextZone(currentZone: ScarZone): ScarZone | null {
  const zones = [
    ScarZone.OUTER_WASTE,
    ScarZone.TWISTED_LANDS,
    ScarZone.DEEP_SCAR,
    ScarZone.THE_ABYSS,
  ];
  const currentIndex = zones.indexOf(currentZone);
  return currentIndex < zones.length - 1 ? zones[currentIndex + 1] : null;
}
