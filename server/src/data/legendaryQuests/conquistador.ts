/**
 * THE LAST CONQUISTADOR
 * Legendary Quest Chain: Spanish gold and ancient curses from 300 years ago
 * Level 32-38 | 6 Quests | Historical + Supernatural
 */

import type {
  LegendaryQuestChain,
} from '@desperados/shared';

export const conquistadorChain: LegendaryQuestChain = {
  id: 'chain_conquistador',
  name: 'The Last Conquistador',
  description:
    'A treasure map leads to Spanish gold from the conquistador era. But some treasures are cursed for good reason.',
  theme: 'treasure',

  levelRange: [32, 38],
  prerequisites: [
    { type: 'level', minLevel: 32 },
  ],

  totalQuests: 6,

  prologue: `In 1541, Spanish Conquistador Don Rodrigo de Coronado led an expedition
    deep into the unexplored territories, seeking the legendary Seven Cities of Gold.
    He never found them. What he did find was an Aztec temple, untouched since
    the empire's fall, containing treasures beyond imagination.

    Coronado took the gold, despite warnings from the temple priests.
    They told him the treasure was cursed - anyone who took it would bring
    ruin upon themselves and all they loved. Coronado laughed and left them to die.

    He never made it home. His expedition vanished. For 300 years, the treasure
    was lost, the curse forgotten.

    Until now. You've found Coronado's journal, and a map showing where he hid
    the Aztec gold before his expedition was destroyed. The treasure awaits.

    But curses, as they say, have long memories.`,

  epilogue: `The Aztec gold sits before you - more wealth than you could spend in ten lifetimes.
    Artifacts of incredible beauty and historical significance.
    And a curse that has already claimed hundreds of lives.

    The temple spirits offer you a choice:
    Return the gold and lift the curse, becoming a hero to the descendants.
    Keep the gold and accept the curse, risking everything for wealth.
    Destroy the gold, ending the curse forever but losing the treasure.

    What price are you willing to pay for fortune?`,

  majorNPCs: [
    {
      id: 'npc_coronado_ghost',
      name: 'Ghost of Don Rodrigo de Coronado',
      role: 'Cursed conquistador',
      description: 'Trapped for 300 years, forced to guard the treasure he stole. He wants release.',
    },
    {
      id: 'npc_aztec_priest',
      name: 'Tlaloc, Last Priest of Quetzalcoatl',
      role: 'Spirit guardian of the temple',
      description: 'An Aztec priest who died protecting the temple. His spirit remains.',
    },
    {
      id: 'npc_maria_cortez',
      name: 'Dr. Maria Cortez',
      role: 'Historian and descendant of Coronado',
      description: 'An academic who has spent her life searching for the truth about her ancestor.',
    },
    {
      id: 'npc_treasure_hunter',
      name: 'Jack "Goldhawk" Harrison',
      role: 'Ruthless treasure hunter',
      description: 'He wants the gold and doesn\'t believe in curses. He\'ll kill to get it.',
    },
  ],

  quests: [], // Would contain 6 detailed quests following the treasure hunt

  chainRewards: [
    {
      milestone: 3,
      description: 'Found the expedition\'s last camp',
      rewards: [
        { type: 'gold', amount: 5000 },
        { type: 'item', itemId: 'item_spanish_armor', quantity: 1 },
      ],
    },
    {
      milestone: 5,
      description: 'Entered the Aztec temple',
      rewards: [
        { type: 'skill_points', amount: 10 },
        { type: 'item', itemId: 'item_temple_key', quantity: 1 },
      ],
    },
    {
      milestone: 6,
      description: 'Resolved the curse of Coronado',
      rewards: [
        { type: 'gold', amount: 20000 },
        { type: 'skill_points', amount: 20 },
      ],
    },
  ],

  uniqueItems: [
    {
      id: 'weapon_cortez_blade',
      name: 'Cortez\'s Blade',
      description: 'A rapier carried by Hernán Cortés himself, passed down to Coronado. Forged in the Old World.',
      type: 'weapon',
      rarity: 'legendary',
      stats: {
        damage: 80,
        speed: 95,
        parry: 90,
        historical_value: 100,
      },
      specialAbility: 'Conquistador\'s Pride: +50% damage to supernatural enemies, immune to curses',
    },
    {
      id: 'armor_spanish_conquistador_set',
      name: 'Conquistador Armor Set',
      description: 'Full plate armor worn by Spanish conquistadors. Heavy but nearly impenetrable.',
      type: 'armor',
      rarity: 'legendary',
      stats: {
        defense: 100,
        durability: 100,
        weight: 50,
        intimidation: 30,
      },
      specialAbility: 'Unbreakable: Armor never degrades, blocks all low-tier attacks completely',
    },
    {
      id: 'accessory_aztec_medallion',
      name: 'Medallion of Quetzalcoatl',
      description: 'An ancient Aztec artifact depicting the feathered serpent god. Radiates protective energy.',
      type: 'accessory',
      rarity: 'mythic',
      stats: {
        wisdom: 30,
        luck: 25,
        curse_resistance: 100,
      },
      specialAbility: 'Serpent\'s Protection: Immune to curses, can see spiritual threats, understand ancient languages',
    },
  ],

  titleUnlocked: 'The Conquistador',
  achievementId: 'achievement_conquistador_complete',

  estimatedDuration: '10-14 hours',
  difficulty: 'very hard',

  icon: '/assets/icons/conquistador.png',
  bannerImage: '/assets/banners/conquistador_chain.jpg',
  tags: ['treasure-hunt', 'historical', 'aztec', 'curse', 'moral-choice'],
};
