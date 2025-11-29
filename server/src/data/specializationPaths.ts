/**
 * Specialization Paths Data
 * Defines all 18 specialization paths (3 per profession)
 * Phase 7, Wave 7.1 - Crafting Overhaul
 */

import { SpecializationPath, Profession } from '@desperados/shared';

/**
 * All specialization paths available in the game
 * 6 professions × 3 specializations = 18 paths
 */
export const SPECIALIZATION_PATHS: SpecializationPath[] = [
  // ============================================
  // BLACKSMITHING SPECIALIZATIONS
  // ============================================
  {
    id: 'weaponsmith',
    professionId: 'blacksmithing',
    name: 'Weaponsmith',
    description: 'Master of forging deadly weapons. Focus on crafting swords, knives, axes, and other implements of war.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'damage',
        value: 15,
        appliesTo: 'All crafted melee weapons'
      }
    ],
    uniqueRecipes: [
      'legendary_bowie_knife',
      'legendary_cavalry_saber',
      'legendary_tomahawk',
      'legendary_combat_axe',
      'named_weapon_widowmaker',
      'named_weapon_judgment',
      'named_weapon_blood_moon'
    ],
    passiveEffects: [
      {
        id: 'weapon_expertise',
        name: 'Weapon Expertise',
        description: 'Crafted weapons have improved durability and can be repaired for 50% less materials',
        type: 'crafting'
      },
      {
        id: 'keen_edge',
        name: 'Keen Edge',
        description: 'All crafted weapons have a 10% chance to deal critical damage',
        type: 'combat'
      }
    ],
    masteryReward: {
      name: 'Legendary Weaponsmith',
      description: 'Unlock the ability to craft mythic named weapons with unique special effects',
      title: 'Master Weaponsmith',
      legendaryRecipes: ['mythic_demon_blade', 'mythic_angel_justice', 'mythic_spirit_cleaver'],
      cosmeticItem: 'golden_anvil_badge'
    },
    icon: '⚔️'
  },
  {
    id: 'armorer',
    professionId: 'blacksmithing',
    name: 'Armorer',
    description: 'Specialist in metal armor and protective gear. Create the finest plate and chainmail armor in the territory.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'armor',
        value: 15,
        appliesTo: 'All crafted metal armor pieces'
      }
    ],
    uniqueRecipes: [
      'reinforced_steel_breastplate',
      'reinforced_steel_helm',
      'reinforced_steel_gauntlets',
      'reinforced_steel_boots',
      'legendary_fortress_set',
      'legendary_sentinel_set',
      'legendary_warden_set'
    ],
    passiveEffects: [
      {
        id: 'armor_mastery',
        name: 'Armor Mastery',
        description: 'Crafted armor has 20% more durability and provides +5% damage reduction',
        type: 'crafting'
      },
      {
        id: 'defensive_expertise',
        name: 'Defensive Expertise',
        description: 'Wearing full sets of your crafted armor grants +10% to all defensive stats',
        type: 'combat'
      }
    ],
    masteryReward: {
      name: 'Grand Armorer',
      description: 'Craft impenetrable legendary armor sets with set bonuses',
      title: 'Grand Armorer',
      legendaryRecipes: ['mythic_ironclad_set', 'mythic_juggernaut_set'],
      cosmeticItem: 'master_armorer_hammer'
    },
    icon: '🛡️'
  },
  {
    id: 'toolmaker',
    professionId: 'blacksmithing',
    name: 'Toolmaker',
    description: 'Expert in crafting tools and utility items. Create specialized equipment that enhances all professions.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'durability',
        value: 25,
        appliesTo: 'All crafted tools'
      }
    ],
    uniqueRecipes: [
      'master_mining_pick',
      'master_logging_axe',
      'master_skinning_knife',
      'master_herbalist_sickle',
      'profession_booster_mining',
      'profession_booster_gathering',
      'profession_booster_crafting'
    ],
    passiveEffects: [
      {
        id: 'tool_efficiency',
        name: 'Tool Efficiency',
        description: 'Crafted tools grant +15% to their associated profession skill gain',
        type: 'crafting'
      },
      {
        id: 'utility_expert',
        name: 'Utility Expert',
        description: 'All tools you craft can be used 50% longer before breaking',
        type: 'crafting'
      }
    ],
    masteryReward: {
      name: 'Master Toolmaker',
      description: 'Craft eternal tools that never break and multi-purpose utility items',
      title: 'Master Toolmaker',
      legendaryRecipes: ['eternal_pickaxe', 'eternal_axe', 'multi_tool_deluxe'],
      cosmeticItem: 'toolmakers_belt'
    },
    icon: '⚒️'
  },

  // ============================================
  // LEATHERWORKING SPECIALIZATIONS
  // ============================================
  {
    id: 'saddler',
    professionId: 'leatherworking',
    name: 'Saddler',
    description: 'Master of horse equipment. Craft exceptional saddles and mount gear for superior riding performance.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'speed',
        value: 20,
        appliesTo: 'Mount speed from crafted saddles'
      }
    ],
    uniqueRecipes: [
      'legendary_racing_saddle',
      'legendary_war_saddle',
      'legendary_endurance_saddle',
      'horse_armor_set',
      'saddlebags_large',
      'mount_speed_gear',
      'mount_stamina_gear'
    ],
    passiveEffects: [
      {
        id: 'horse_whisperer',
        name: 'Horse Whisperer',
        description: 'Mounts equipped with your saddles gain +10% stamina and health',
        type: 'survival'
      },
      {
        id: 'premium_leather',
        name: 'Premium Leather',
        description: 'All mount equipment you craft has increased durability and comfort bonuses',
        type: 'crafting'
      }
    ],
    masteryReward: {
      name: 'Legendary Saddler',
      description: 'Craft mythic mount equipment that grants special movement abilities',
      title: 'Legendary Saddler',
      legendaryRecipes: ['mythic_phantom_saddle', 'mythic_warhorse_barding', 'mythic_spirit_reins'],
      cosmeticItem: 'golden_stirrups'
    },
    icon: '🐴'
  },
  {
    id: 'leather_armorsmith',
    professionId: 'leatherworking',
    name: 'Leather Armorsmith',
    description: 'Specialist in leather armor. Create flexible, protective gear perfect for stealth and agility.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'stealth',
        value: 15,
        appliesTo: 'Stealth bonus from crafted leather armor'
      }
    ],
    uniqueRecipes: [
      'shadow_leather_set',
      'shadow_leather_hood',
      'shadow_leather_vest',
      'shadow_leather_pants',
      'shadow_leather_boots',
      'silent_step_boots',
      'night_stalker_cloak'
    ],
    passiveEffects: [
      {
        id: 'shadow_tanning',
        name: 'Shadow Tanning',
        description: 'Leather armor you craft provides enhanced stealth and agility bonuses',
        type: 'crafting'
      },
      {
        id: 'silent_movement',
        name: 'Silent Movement',
        description: 'Full sets of your leather armor reduce detection radius by 25%',
        type: 'combat'
      }
    ],
    masteryReward: {
      name: 'Master of Shadows',
      description: 'Craft legendary shadow armor that grants invisibility abilities',
      title: 'Master of Shadows',
      legendaryRecipes: ['mythic_shadowmeld_set', 'mythic_ghost_walker_set'],
      cosmeticItem: 'shadow_stitchers_needle'
    },
    icon: '🥷'
  },
  {
    id: 'bag_maker',
    professionId: 'leatherworking',
    name: 'Bag Maker',
    description: 'Expert in storage items and containers. Create bags, pouches, and packs with exceptional capacity.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'capacity',
        value: 30,
        appliesTo: 'Inventory capacity from crafted bags'
      }
    ],
    uniqueRecipes: [
      'travelers_pack_large',
      'outlaws_satchel',
      'merchants_strongbox',
      'dimensional_bag_small',
      'dimensional_bag_medium',
      'dimensional_bag_large',
      'bottomless_coin_purse'
    ],
    passiveEffects: [
      {
        id: 'spatial_mastery',
        name: 'Spatial Mastery',
        description: 'Bags you craft organize items automatically and reduce weight by 20%',
        type: 'crafting'
      },
      {
        id: 'extra_pockets',
        name: 'Extra Pockets',
        description: 'Characters using your bags gain +5 inventory slots',
        type: 'survival'
      }
    ],
    masteryReward: {
      name: 'Master Bag Maker',
      description: 'Craft dimensional bags with impossible internal space',
      title: 'Master Bag Maker',
      legendaryRecipes: ['mythic_void_bag', 'mythic_endless_satchel'],
      cosmeticItem: 'golden_buckle_set'
    },
    icon: '🎒'
  },

  // ============================================
  // ALCHEMY SPECIALIZATIONS
  // ============================================
  {
    id: 'apothecary',
    professionId: 'alchemy',
    name: 'Apothecary',
    description: 'Master of healing and enhancement. Brew powerful potions, tonics, and elixirs to restore and buff.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'effectiveness',
        value: 25,
        appliesTo: 'All crafted healing and buff potions'
      }
    ],
    uniqueRecipes: [
      'greater_healing_potion',
      'superior_healing_potion',
      'resurrection_elixir_minor',
      'resurrection_elixir_major',
      'elixir_of_vitality',
      'elixir_of_strength',
      'elixir_of_fortune'
    ],
    passiveEffects: [
      {
        id: 'healing_touch',
        name: 'Healing Touch',
        description: 'Healing potions you craft provide additional regeneration over time',
        type: 'crafting'
      },
      {
        id: 'alchemical_precision',
        name: 'Alchemical Precision',
        description: 'Buff potions you craft last 50% longer',
        type: 'crafting'
      }
    ],
    masteryReward: {
      name: 'Grand Apothecary',
      description: 'Craft legendary elixirs that grant temporary immortality and ultimate power',
      title: 'Grand Apothecary',
      legendaryRecipes: ['mythic_phoenix_elixir', 'mythic_titans_draught', 'mythic_angels_tears'],
      cosmeticItem: 'crystal_mortar_pestle'
    },
    icon: '💊'
  },
  {
    id: 'poisoner',
    professionId: 'alchemy',
    name: 'Poisoner',
    description: 'Expert in toxins and debilitating compounds. Create deadly poisons and debuff concoctions.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'duration',
        value: 25,
        appliesTo: 'All crafted poisons and debuff potions'
      }
    ],
    uniqueRecipes: [
      'deadly_nightshade_poison',
      'paralytic_toxin',
      'weakening_venom',
      'blinding_powder',
      'undetectable_poison',
      'assassins_cocktail',
      'slow_death_elixir'
    ],
    passiveEffects: [
      {
        id: 'toxic_mastery',
        name: 'Toxic Mastery',
        description: 'Poisons you craft deal 15% more damage and are harder to cure',
        type: 'crafting'
      },
      {
        id: 'subtle_formula',
        name: 'Subtle Formula',
        description: 'Undetectable poisons leave no trace and can bypass poison resistance',
        type: 'combat'
      }
    ],
    masteryReward: {
      name: 'Master Poisoner',
      description: 'Craft ultimate toxins that can fell the mightiest foes',
      title: 'Master Poisoner',
      legendaryRecipes: ['mythic_basilisk_venom', 'mythic_deaths_whisper', 'mythic_eternal_suffering'],
      cosmeticItem: 'serpent_vial_set'
    },
    icon: '☠️'
  },
  {
    id: 'demolitionist',
    professionId: 'alchemy',
    name: 'Demolitionist',
    description: 'Specialist in explosives and incendiaries. Create bombs, grenades, and explosive compounds.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'radius',
        value: 30,
        appliesTo: 'Explosion radius of crafted explosives'
      }
    ],
    uniqueRecipes: [
      'enhanced_dynamite',
      'frag_grenade',
      'incendiary_grenade',
      'smoke_bomb',
      'tactical_flashbang',
      'satchel_charge',
      'hellfire_bomb'
    ],
    passiveEffects: [
      {
        id: 'explosive_expertise',
        name: 'Explosive Expertise',
        description: 'Your explosives deal 20% more damage and have improved blast patterns',
        type: 'crafting'
      },
      {
        id: 'safe_handling',
        name: 'Safe Handling',
        description: 'Your explosives never misfire and you take reduced damage from explosions',
        type: 'combat'
      }
    ],
    masteryReward: {
      name: 'Grand Demolitionist',
      description: 'Craft legendary explosives with devastating area-of-effect capabilities',
      title: 'Grand Demolitionist',
      legendaryRecipes: ['mythic_dragons_breath', 'mythic_earthquake_charge', 'mythic_apocalypse_bomb'],
      cosmeticItem: 'blast_masters_goggles'
    },
    icon: '💣'
  },

  // ============================================
  // COOKING SPECIALIZATIONS
  // ============================================
  {
    id: 'chef',
    professionId: 'cooking',
    name: 'Chef',
    description: 'Master of culinary arts. Prepare exquisite meals that provide powerful and long-lasting buffs.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'duration',
        value: 30,
        appliesTo: 'Buff duration from crafted food'
      }
    ],
    uniqueRecipes: [
      'legendary_steak_dinner',
      'legendary_feast_platter',
      'champions_breakfast',
      'gunslingers_supper',
      'fortifying_stew',
      'endurance_chili',
      'precision_pie'
    ],
    passiveEffects: [
      {
        id: 'culinary_mastery',
        name: 'Culinary Mastery',
        description: 'Food you cook provides +15% stronger buffs and better satiation',
        type: 'crafting'
      },
      {
        id: 'gourmet_touch',
        name: 'Gourmet Touch',
        description: 'Characters eating your food gain a temporary luck bonus',
        type: 'social'
      }
    ],
    masteryReward: {
      name: 'Legendary Chef',
      description: 'Cook mythic feast items that grant powerful group-wide buffs',
      title: 'Legendary Chef',
      legendaryRecipes: ['mythic_heroes_banquet', 'mythic_victory_feast', 'mythic_immortals_meal'],
      cosmeticItem: 'golden_chefs_hat'
    },
    icon: '👨‍🍳'
  },
  {
    id: 'brewer',
    professionId: 'cooking',
    name: 'Brewer',
    description: 'Expert in alcoholic beverages. Distill whiskey, brew beer, and create unique spirits with special effects.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'effectiveness',
        value: 25,
        appliesTo: 'Social and unique effects from crafted drinks'
      }
    ],
    uniqueRecipes: [
      'liquid_courage_whiskey',
      'silver_tongue_gin',
      'lucky_lager',
      'smooth_talker_bourbon',
      'intimidators_ale',
      'charisma_cocktail',
      'legendary_moonshine'
    ],
    passiveEffects: [
      {
        id: 'master_distiller',
        name: 'Master Distiller',
        description: 'Drinks you brew provide unique social buffs: +charisma, +persuasion, +reputation gain',
        type: 'crafting'
      },
      {
        id: 'addictive_quality',
        name: 'Addictive Quality',
        description: 'Special brews create demand - NPCs will pay premium prices for your drinks',
        type: 'social'
      }
    ],
    masteryReward: {
      name: 'Master Brewer',
      description: 'Brew legendary spirits that grant supernatural effects and permanent bonuses',
      title: 'Master Brewer',
      legendaryRecipes: ['mythic_gods_whiskey', 'mythic_spirit_sight_gin', 'mythic_immortality_brew'],
      cosmeticItem: 'crystal_distillery_kit'
    },
    icon: '🍺'
  },
  {
    id: 'preserver',
    professionId: 'cooking',
    name: 'Preserver',
    description: 'Specialist in food preservation and emergency rations. Create foods that last forever and restore energy.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'durability',
        value: 100,
        appliesTo: 'Food lifespan - crafted food never spoils'
      }
    ],
    uniqueRecipes: [
      'trail_rations_standard',
      'trail_rations_premium',
      'trail_rations_emergency',
      'preserved_jerky',
      'hardtack_fortified',
      'survival_cake',
      'energy_emergency_bar'
    ],
    passiveEffects: [
      {
        id: 'eternal_preservation',
        name: 'Eternal Preservation',
        description: 'Food you create never spoils and maintains full nutritional value indefinitely',
        type: 'crafting'
      },
      {
        id: 'emergency_sustenance',
        name: 'Emergency Sustenance',
        description: 'Trail rations you craft restore energy in addition to health and hunger',
        type: 'survival'
      }
    ],
    masteryReward: {
      name: 'Master Preserver',
      description: 'Create ultimate survival foods that can sustain life indefinitely',
      title: 'Master Preserver',
      legendaryRecipes: ['mythic_ambrosia_ration', 'mythic_eternal_sustenance', 'mythic_life_bar'],
      cosmeticItem: 'preservation_seal_kit'
    },
    icon: '🥫'
  },

  // ============================================
  // TAILORING SPECIALIZATIONS (Note: Tailoring doesn't exist in skills, using as gunsmithing alternative)
  // ============================================
  {
    id: 'disguise_master',
    professionId: 'tailoring',
    name: 'Disguise Master',
    description: 'Expert in creating convincing disguises. Craft outfits that allow infiltration and deception.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'effectiveness',
        value: 30,
        appliesTo: 'Disguise effectiveness and detection avoidance'
      }
    ],
    uniqueRecipes: [
      'lawman_disguise',
      'outlaw_disguise',
      'settler_disguise',
      'nahi_disguise',
      'frontera_disguise',
      'merchant_disguise',
      'nobility_disguise'
    ],
    passiveEffects: [
      {
        id: 'perfect_imitation',
        name: 'Perfect Imitation',
        description: 'Disguises you craft are nearly undetectable and last longer',
        type: 'crafting'
      },
      {
        id: 'faction_infiltrator',
        name: 'Faction Infiltrator',
        description: 'Faction-specific disguises grant full reputation benefits while worn',
        type: 'social'
      }
    ],
    masteryReward: {
      name: 'Master of Disguise',
      description: 'Craft legendary disguises that can fool even the most perceptive observers',
      title: 'Master of Disguise',
      legendaryRecipes: ['mythic_shapeshifter_cloak', 'mythic_phantom_garb'],
      cosmeticItem: 'chameleon_needle_set'
    },
    icon: '🎭'
  },
  {
    id: 'fashion_designer',
    professionId: 'tailoring',
    name: 'Fashion Designer',
    description: 'Master of fancy clothing and formal wear. Create stunning outfits that command respect and admiration.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'reputation',
        value: 25,
        appliesTo: 'Reputation gain while wearing crafted formal wear'
      }
    ],
    uniqueRecipes: [
      'gentleman_suit_premium',
      'lady_dress_premium',
      'gambler_outfit_legendary',
      'aristocrat_ensemble',
      'governors_attire',
      'socialite_gown',
      'tycoons_suit'
    ],
    passiveEffects: [
      {
        id: 'haute_couture',
        name: 'Haute Couture',
        description: 'Formal wear you craft grants +20% to all social interactions',
        type: 'crafting'
      },
      {
        id: 'reputation_aura',
        name: 'Reputation Aura',
        description: 'Characters wearing your finest clothes gain passive reputation with all factions',
        type: 'social'
      }
    ],
    masteryReward: {
      name: 'Legendary Designer',
      description: 'Craft mythic formal wear that grants permanent charisma bonuses',
      title: 'Legendary Fashion Designer',
      legendaryRecipes: ['mythic_emperors_regalia', 'mythic_queens_elegance'],
      cosmeticItem: 'diamond_sewing_kit'
    },
    icon: '👔'
  },
  {
    id: 'utility_tailor',
    professionId: 'tailoring',
    name: 'Utility Tailor',
    description: 'Specialist in functional, weather-resistant clothing. Create practical gear for harsh frontier conditions.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'resistance',
        value: 20,
        appliesTo: 'Weather and environmental damage reduction'
      }
    ],
    uniqueRecipes: [
      'all_weather_duster',
      'winter_survival_coat',
      'desert_survival_gear',
      'storm_cloak',
      'waterproof_poncho',
      'insulated_outfit',
      'expedition_gear_set'
    ],
    passiveEffects: [
      {
        id: 'weatherproof',
        name: 'Weatherproof',
        description: 'Clothing you craft provides immunity to weather-based debuffs',
        type: 'crafting'
      },
      {
        id: 'frontier_survivor',
        name: 'Frontier Survivor',
        description: 'All-weather gear grants +15% to survival-related actions',
        type: 'survival'
      }
    ],
    masteryReward: {
      name: 'Master Utility Tailor',
      description: 'Craft legendary survival gear that adapts to any environment',
      title: 'Master Utility Tailor',
      legendaryRecipes: ['mythic_adaptive_cloak', 'mythic_frontier_mastery_set'],
      cosmeticItem: 'frontier_tailors_kit'
    },
    icon: '🧥'
  },

  // ============================================
  // GUNSMITHING SPECIALIZATIONS (Engineering-based)
  // ============================================
  {
    id: 'weapon_modifier',
    professionId: 'gunsmithing',
    name: 'Weapon Modifier',
    description: 'Expert in gun customization. Create powerful modifications that enhance weapon performance.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'effectiveness',
        value: 20,
        appliesTo: 'All crafted gun modifications'
      }
    ],
    uniqueRecipes: [
      'legendary_scope',
      'legendary_barrel',
      'legendary_trigger',
      'legendary_grip',
      'rapid_fire_mechanism',
      'accuracy_enhancement',
      'damage_amplifier'
    ],
    passiveEffects: [
      {
        id: 'modification_mastery',
        name: 'Modification Mastery',
        description: 'Gun modifications you craft provide double the normal bonuses',
        type: 'crafting'
      },
      {
        id: 'custom_gunsmith',
        name: 'Custom Gunsmith',
        description: 'Weapons with your modifications gain +10% critical hit chance',
        type: 'combat'
      }
    ],
    masteryReward: {
      name: 'Legendary Gun Modifier',
      description: 'Craft mythic modifications that transform ordinary guns into legendary weapons',
      title: 'Legendary Gun Modifier',
      legendaryRecipes: ['mythic_auto_loader', 'mythic_never_miss_sight', 'mythic_explosive_chamber'],
      cosmeticItem: 'master_gunsmiths_tools'
    },
    icon: '🔧'
  },
  {
    id: 'ammunition_expert',
    professionId: 'gunsmithing',
    name: 'Ammunition Expert',
    description: 'Master of specialized ammunition. Craft powerful special rounds including explosive and incendiary.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'yield',
        value: 15,
        appliesTo: 'Ammunition crafting quantity output'
      }
    ],
    uniqueRecipes: [
      'explosive_rounds',
      'incendiary_rounds',
      'armor_piercing_rounds',
      'hollow_point_rounds',
      'poison_tipped_rounds',
      'tracer_rounds',
      'thunderbolt_rounds'
    ],
    passiveEffects: [
      {
        id: 'ammo_efficiency',
        name: 'Ammo Efficiency',
        description: 'Craft 15% more ammunition per batch with improved quality',
        type: 'crafting'
      },
      {
        id: 'special_effects',
        name: 'Special Effects',
        description: 'Special ammunition you craft has increased damage and effect duration',
        type: 'combat'
      }
    ],
    masteryReward: {
      name: 'Master Ammunition Expert',
      description: 'Craft mythic ammunition with devastating special effects',
      title: 'Master Ammunition Expert',
      legendaryRecipes: ['mythic_dragon_rounds', 'mythic_angel_bullets', 'mythic_demon_killers'],
      cosmeticItem: 'golden_cartridge_press'
    },
    icon: '🔫'
  },
  {
    id: 'repair_specialist',
    professionId: 'gunsmithing',
    name: 'Repair Specialist',
    description: 'Expert in weapon maintenance and restoration. Repair and restore even the most damaged firearms.',
    requirements: {
      professionLevel: 50,
      goldCost: 5000
    },
    bonuses: [
      {
        type: 'effectiveness',
        value: 50,
        appliesTo: 'Durability restored when repairing weapons'
      }
    ],
    uniqueRecipes: [
      'weapon_repair_kit_basic',
      'weapon_repair_kit_advanced',
      'weapon_repair_kit_master',
      'restoration_oil',
      'barrel_cleaner_premium',
      'mechanism_lubricant',
      'full_restoration_kit'
    ],
    passiveEffects: [
      {
        id: 'master_restorer',
        name: 'Master Restorer',
        description: 'Repairs restore 50% more durability and improve weapon condition',
        type: 'crafting'
      },
      {
        id: 'ruined_recovery',
        name: 'Ruined Recovery',
        description: 'Can fully restore weapons at 0 durability that others consider ruined',
        type: 'crafting'
      }
    ],
    masteryReward: {
      name: 'Grand Repair Specialist',
      description: 'Master the art of perfect restoration - make weapons better than new',
      title: 'Grand Repair Specialist',
      legendaryRecipes: ['mythic_phoenix_kit', 'mythic_eternal_polish', 'mythic_perfection_restoration'],
      cosmeticItem: 'master_repair_toolkit'
    },
    icon: '🔨'
  }
];

/**
 * Get all specialization paths for a specific profession
 */
export function getSpecializationsByProfession(professionId: string): SpecializationPath[] {
  return SPECIALIZATION_PATHS.filter(path => path.professionId === professionId);
}

/**
 * Get a specific specialization path by ID
 */
export function getSpecializationById(specializationId: string): SpecializationPath | undefined {
  return SPECIALIZATION_PATHS.find(path => path.id === specializationId);
}

/**
 * Get all available professions that have specializations
 */
export function getAvailableProfessions(): string[] {
  return Object.values(Profession);
}

/**
 * Validate that a specialization belongs to a profession
 */
export function isValidSpecializationForProfession(
  specializationId: string,
  professionId: string
): boolean {
  const spec = getSpecializationById(specializationId);
  return spec?.professionId === professionId;
}
