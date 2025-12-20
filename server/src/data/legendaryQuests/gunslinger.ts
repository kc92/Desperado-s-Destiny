/**
 * THE GUNSLINGER'S LEGACY
 * Legendary Quest Chain: Collect the weapons of legendary gunslingers
 * Level 35-40 | 6 Quests | Combat-Focused
 */

import type {
  LegendaryQuestChain,
} from '@desperados/shared';

export const gunslingerChain: LegendaryQuestChain = {
  id: 'chain_gunslinger',
  name: "The Gunslinger's Legacy",
  description:
    'Six legendary gunslingers. Six legendary weapons. Prove yourself worthy and claim them all to become the Last Gunslinger.',
  theme: 'combat',

  levelRange: [35, 40],
  prerequisites: [
    { type: 'level', minLevel: 35 },
    { type: 'quest', questId: 'quest_duel_master', completed: true },
  ],

  totalQuests: 6,

  prologue: `In the Old West, a gunslinger was measured by their weapon and their skill.
    Six gunslingers became legends, their names spoken with fear and respect.

    Wild Bill Hickok - "The Prince of Pistoleers"
    Annie Oakley - "Little Sure Shot"
    Doc Holliday - "The Gentleman Gambler"
    Wyatt Earp - "The Lion of Tombstone"
    Belle Starr - "The Bandit Queen"
    Clay Allison - "The Gentleman Killer"

    Each left behind a weapon - a revolver, a rifle, a shotgun - imbued with
    their skill, their legend, and some say, a piece of their very soul.

    These weapons have been scattered across the frontier, hidden, buried, or claimed
    by those unworthy to carry them. But the weapons remember. They call to those
    with true skill, seeking a worthy heir.

    You've heard the call. Now you must prove yourself against the ghosts of legends,
    face their greatest challenges, and earn the right to carry their legacy.

    Become the Last Gunslinger. Collect them all.`,

  epilogue: `Six legendary weapons. Six impossible trials. All overcome.

    You stand as the greatest gunslinger the West has ever known, carrying the legacy
    of legends in your holsters. The spirits of the six greats acknowledge you as their equal.

    But with great skill comes great responsibility. These weapons have tasted glory
    and tragedy. They've killed villains and innocents alike. They remember everything.

    As the Last Gunslinger, you carry more than weapons. You carry the weight of history,
    the burden of legend, and the duty to prove that skill and honor can still exist
    in a world that's leaving the Old West behind.

    Draw your weapons. Your legend begins now.`,

  majorNPCs: [
    {
      id: 'npc_ghost_wild_bill',
      name: 'Spirit of Wild Bill Hickok',
      role: 'Legendary gunslinger',
      description: 'The fastest draw who ever lived. He was shot in the back while playing poker.',
    },
    {
      id: 'npc_ghost_annie_oakley',
      name: 'Spirit of Annie Oakley',
      role: 'Sharpshooter extraordinaire',
      description: 'Could shoot the tip off a cigarette from 90 feet. Never missed.',
    },
    {
      id: 'npc_ghost_doc_holliday',
      name: 'Spirit of Doc Holliday',
      role: 'Gambler and gunfighter',
      description: 'A dentist turned deadly gunfighter. Tuberculosis couldn\'t stop him.',
    },
    {
      id: 'npc_ghost_wyatt_earp',
      name: 'Spirit of Wyatt Earp',
      role: 'Lawman legend',
      description: 'Survived the Gunfight at the O.K. Corral. Never lost a duel.',
    },
    {
      id: 'npc_ghost_belle_starr',
      name: 'Spirit of Belle Starr',
      role: 'Outlaw queen',
      description: 'Beautiful, deadly, and fearless. She rode with the worst outlaws and survived them all.',
    },
    {
      id: 'npc_ghost_clay_allison',
      name: 'Spirit of Clay Allison',
      role: 'The gentleman killer',
      description: 'Charming and psychotic in equal measure. Killed men for looking at him wrong.',
    },
  ],

  quests: [], // Would contain 6 detailed combat-focused quests

  chainRewards: [
    {
      milestone: 2,
      description: 'Claimed two legendary weapons',
      rewards: [
        { type: 'skill_points', amount: 5 },
        { type: 'item', itemId: 'item_gunslinger_holster', quantity: 1 },
      ],
    },
    {
      milestone: 4,
      description: 'Claimed four legendary weapons',
      rewards: [
        { type: 'skill_points', amount: 10 },
        { type: 'title', titleId: 'title_gun_collector', titleName: 'Legendary Gun Collector' },
      ],
    },
    {
      milestone: 6,
      description: 'Claimed all six legendary weapons',
      rewards: [
        { type: 'dollars', amount: 20000 },
        { type: 'skill_points', amount: 25 },
      ],
    },
  ],

  uniqueItems: [
    {
      id: 'weapon_wild_bill_revolvers',
      name: 'Wild Bill\'s Ivory-Handled Colts',
      description: 'A matched pair of .36 caliber Navy Colts. The fastest draw in history.',
      type: 'weapon',
      rarity: 'legendary',
      stats: {
        damage: 75,
        speed: 100,
        dual_wield: 1,
        accuracy: 85,
      },
      specialAbility: 'Lightning Draw: Draw and fire before enemies can react. First shot each combat is free.',
    },
    {
      id: 'weapon_annie_oakley_rifle',
      name: 'Annie\'s Little Sure Shot',
      description: 'A custom Stevens .22 rifle. In the right hands, deadlier than any cannon.',
      type: 'weapon',
      rarity: 'legendary',
      stats: {
        damage: 70,
        accuracy: 100,
        range: 95,
        trick_shots: 1,
      },
      specialAbility: 'Perfect Shot: Can target specific body parts, shoot items from hands, never miss',
    },
    {
      id: 'weapon_doc_holliday_shotgun',
      name: 'Doc\'s Gambler\'s Companion',
      description: 'A sawed-off double-barrel shotgun. Doc kept it under his coat at the card table.',
      type: 'weapon',
      rarity: 'legendary',
      stats: {
        damage: 95,
        spread: 80,
        intimidation: 40,
        concealed: 1,
      },
      specialAbility: 'Dealer\'s Choice: Double damage at close range, can be drawn while appearing unarmed',
    },
    {
      id: 'weapon_wyatt_earp_peacemaker',
      name: 'Wyatt\'s Buntline Special',
      description: 'A .45 Colt with a 12-inch barrel. The gun that tamed Tombstone.',
      type: 'weapon',
      rarity: 'legendary',
      stats: {
        damage: 90,
        accuracy: 90,
        intimidation: 35,
        lawman_bonus: 50,
      },
      specialAbility: 'Law and Order: +50% damage when fighting criminals, can arrest instead of kill',
    },
    {
      id: 'weapon_belle_starr_derringer',
      name: 'Belle\'s Widow Maker',
      description: 'A deadly .41 caliber derringer. Small, concealable, and absolutely lethal.',
      type: 'weapon',
      rarity: 'legendary',
      stats: {
        damage: 85,
        concealability: 100,
        surprise_attack: 100,
        charm: 30,
      },
      specialAbility: 'Hidden Death: Automatic critical on first shot, enemies never see it coming',
    },
    {
      id: 'weapon_clay_allison_colt',
      name: 'Clay\'s Executioner',
      description: 'A well-worn Colt .45. It has killed more men than disease.',
      type: 'weapon',
      rarity: 'legendary',
      stats: {
        damage: 88,
        intimidation: 45,
        fear_aura: 50,
        madness: 1,
      },
      specialAbility: 'Gentleman\'s Fury: Enemies flee in terror, massive damage but chance of friendly fire',
    },
    {
      id: 'set_bonus_six_guns',
      name: 'Legacy of Legends',
      description: 'When carrying all six legendary weapons, you become legend incarnate.',
      type: 'accessory',
      rarity: 'mythic',
      stats: {
        all_combat_stats: 50,
        legend_status: 100,
      },
      specialAbility: 'The Last Gunslinger: Perfect accuracy, unlimited ammo, enemies surrender on sight, cannot be killed in duels',
    },
  ],

  titleUnlocked: 'Last Gunslinger',
  achievementId: 'achievement_gunslinger_complete',

  estimatedDuration: '12-15 hours',
  difficulty: 'legendary',

  icon: '/assets/icons/gunslinger.png',
  bannerImage: '/assets/banners/gunslinger_chain.jpg',
  tags: ['combat', 'duels', 'legendary-weapons', 'historical', 'ultimate-challenge'],
};
