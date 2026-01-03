/**
 * Legends of the West Constants - Phase 19.5
 *
 * Data definitions for:
 * - Ghost Town configurations
 * - Artifact sets and collections
 * - Reputation Prestige tiers
 * - Faction Representatives
 */

import {
  GhostTownTier,
  GhostTownTheme,
  GhostTownHazard,
  GhostTownAreaState,
  ArtifactCategory,
  MarshalPrestigeTier,
  OutlawPrestigeTier,
  IGhostTown,
  IArtifactSet,
  IPrestigeTierDef,
  IFactionRepresentative,
} from '../types/legends.types';

// =============================================================================
// GHOST TOWN CONSTANTS
// =============================================================================

export const GHOST_TOWN_EXPLORATION = {
  // Energy costs
  EXPLORE_COST: 15,
  EXPLORE_MAJOR_COST: 20,
  FLEE_COST: 5,

  // Timing
  HAZARD_DAMAGE_INTERVAL: 30000, // ms between hazard ticks
  EXPLORATION_TIMEOUT: 600000,   // 10 minutes max per session

  // Discovery
  SECRET_BASE_CHANCE: 0.15,
  SECRET_BONUS_PER_LEVEL: 0.005,

  // Loot
  LOOT_ROLLS_MEDIUM: 2,
  LOOT_ROLLS_MAJOR: 4,

  // Completion XP multipliers
  AREA_CLEAR_XP_MULT: 1.0,
  TOWN_COMPLETE_XP_MULT: 2.5,
  FIRST_CLEAR_BONUS: 1.5,
};

/**
 * Major Ghost Towns (4) - Full content, unique mechanics
 */
export const MAJOR_GHOST_TOWNS: IGhostTown[] = [
  {
    id: 'ghost-town-prosperity',
    name: 'Prosperity',
    description: 'Once the richest silver mine in the territory, now a tomb for hundreds.',
    backstory:
      'In 1872, a gas pocket ignited in the main shaft, collapsing the entire mine in minutes. ' +
      'The company sealed the entrances rather than pay for rescue. 347 miners were entombed alive. ' +
      'Some say you can still hear them tapping on the walls.',
    tier: GhostTownTier.MAJOR,
    theme: GhostTownTheme.DISASTER,
    levelRange: { min: 36, max: 37 },
    parentLocation: 'silver_range',
    areas: [
      {
        id: 'prosperity-surface',
        name: 'Mining Camp Ruins',
        description: 'Collapsed buildings and rusted equipment. The main shaft entrance looms.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'unstable-ground',
            type: GhostTownHazard.STRUCTURAL,
            name: 'Unstable Ground',
            description: 'The ground shifts unpredictably',
            damagePerTurn: 5,
            counterplay: 'Move slowly and test each step',
            counterplaySkill: 'mining',
            counterplayThreshold: 30,
          },
        ],
        lootTable: ['prosperity-miners-helmet', 'silver-ore', 'mining-lantern'],
        connectedAreas: ['prosperity-upper-shaft'],
        supernaturalLevel: 20,
      },
      {
        id: 'prosperity-upper-shaft',
        name: 'Upper Mine Shaft',
        description: 'The first level of the collapsed mine. Air is thin.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'bad-air',
            type: GhostTownHazard.ENVIRONMENTAL,
            name: 'Bad Air',
            description: 'Toxic gases seep from the walls',
            damagePerTurn: 8,
            statusEffect: 'confusion',
            duration: 3,
            counterplay: 'Bring a canary or air filter',
            counterplaySkill: 'medicine',
            counterplayThreshold: 35,
          },
        ],
        lootTable: ['silver-ore', 'miner-journal', 'raw-silver-vein'],
        connectedAreas: ['prosperity-surface', 'prosperity-deep-shaft'],
        supernaturalLevel: 40,
      },
      {
        id: 'prosperity-deep-shaft',
        name: 'Deep Shaft - The Tomb',
        description: 'Where 347 miners drew their last breath. Their spirits are restless.',
        state: GhostTownAreaState.LOCKED,
        requiredKey: 'prosperity-shaft-key',
        hazards: [
          {
            id: 'mine-gas',
            type: GhostTownHazard.ENVIRONMENTAL,
            name: 'Explosive Gas Pockets',
            description: 'One spark could ignite the entire shaft',
            damagePerTurn: 0,
            counterplay: 'No firearms, no open flames',
          },
          {
            id: 'restless-spirits',
            type: GhostTownHazard.SUPERNATURAL,
            name: 'Restless Spirits',
            description: 'The dead miners reach out from the walls',
            damagePerTurn: 12,
            statusEffect: 'fear',
            duration: 2,
            counterplay: 'Speak words of comfort, or run',
            counterplaySkill: 'persuasion',
            counterplayThreshold: 40,
          },
        ],
        lootTable: ['silver-mother-lode', 'foreman-pocket-watch', 'prosperity-deed'],
        hasMiniBoss: true,
        miniBossId: 'boss_mine_foreman_ghost',
        connectedAreas: ['prosperity-upper-shaft'],
        supernaturalLevel: 75,
      },
    ],
    entryAreaId: 'prosperity-surface',
    uniqueMechanic: {
      id: 'oxygen-management',
      name: 'Oxygen Management',
      description: 'The deeper you go, the less air. Track your breath or suffocate.',
      rules:
        'Each turn in deep areas consumes oxygen. Running out causes damage and forced retreat. ' +
        'Medicine skill reduces consumption. Air filters reset the meter.',
    },
    questIds: ['ghost-town:prosperity-depths', 'ghost-town:prosperity-survivors'],
    miniBossIds: ['boss_mine_foreman_ghost'],
    completionRewards: {
      gold: 2500,
      xp: 4000,
      items: ['prosperity-salvage-claim'],
      title: 'Mine Reclaimer',
    },
    discoveryMethod: 'quest',
    discoveryQuestId: 'legends:whispers-begin',
  },
  {
    id: 'ghost-town-deadwood-shadow',
    name: "Deadwood's Shadow",
    description: 'A mirror of the famous town, consumed by gold fever and darker hungers.',
    backstory:
      'In the shadow of Deadwood\'s success, another boomtown tried to compete. They found gold - ' +
      'and something else. Within a year, the entire population had either fled, gone mad, or ' +
      'disappeared. Survivors spoke of an impossible hunger for gold that consumed everything.',
    tier: GhostTownTier.MAJOR,
    theme: GhostTownTheme.HISTORICAL,
    levelRange: { min: 38, max: 39 },
    parentLocation: 'black_hills',
    areas: [
      {
        id: 'deadwood-main-street',
        name: 'Main Street',
        description: 'Abandoned storefronts line the muddy street. Gold glints in the dust.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'gold-temptation',
            type: GhostTownHazard.MADNESS,
            name: 'Gold Fever',
            description: 'The urge to pick up every glinting piece is overwhelming',
            statusEffect: 'greed',
            duration: 5,
            counterplay: 'Keep your eyes forward. Ignore the shine.',
            counterplaySkill: 'ritual_knowledge',
            counterplayThreshold: 35,
          },
        ],
        lootTable: ['deadwood-gold-nugget', 'abandoned-supplies', 'faded-photograph'],
        connectedAreas: ['deadwood-saloon', 'deadwood-assay-office'],
        supernaturalLevel: 30,
      },
      {
        id: 'deadwood-saloon',
        name: "Wild Bill's Rest",
        description: 'The saloon where legends drank. And died.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'phantom-poker',
            type: GhostTownHazard.SUPERNATURAL,
            name: 'Phantom Poker Game',
            description: 'Ghostly figures play cards. They want you to join.',
            damagePerTurn: 10,
            counterplay: 'Win a hand or politely decline',
            counterplaySkill: 'gambling',
            counterplayThreshold: 40,
          },
        ],
        lootTable: ['gamblers-rest-dice', 'vintage-whiskey', 'poker-chip-collection'],
        hasMiniBoss: true,
        miniBossId: 'boss_wild_bill_echo',
        connectedAreas: ['deadwood-main-street', 'deadwood-basement'],
        supernaturalLevel: 60,
      },
      {
        id: 'deadwood-assay-office',
        name: 'Assay Office',
        description: 'Where gold was weighed and futures decided. The scales still move.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'corruption-gold',
            type: GhostTownHazard.MADNESS,
            name: 'Corrupted Gold',
            description: 'The gold here changes you. Each piece takes something.',
            damagePerTurn: 0,
            statusEffect: 'corruption',
            duration: 10,
            counterplay: 'Wear gloves. Never touch the gold directly.',
            counterplaySkill: 'trading',
            counterplayThreshold: 45,
          },
        ],
        lootTable: ['cursed-gold-bar', 'assay-records', 'gold-scales'],
        connectedAreas: ['deadwood-main-street', 'deadwood-vault'],
        supernaturalLevel: 50,
      },
      {
        id: 'deadwood-vault',
        name: 'The Vault',
        description: 'The heart of Deadwood\'s greed. Mountains of gold. And the thing that guards it.',
        state: GhostTownAreaState.LOCKED,
        requiredKey: 'assay-vault-key',
        hazards: [
          {
            id: 'gold-madness',
            type: GhostTownHazard.MADNESS,
            name: 'Gold Madness',
            description: 'So much gold. It wants you to stay. Forever.',
            damagePerTurn: 15,
            statusEffect: 'madness',
            duration: -1,
            counterplay: 'Focus on why you came. Remember what matters.',
            counterplaySkill: 'ritual_knowledge',
            counterplayThreshold: 50,
          },
        ],
        lootTable: ['deadwood-mother-lode', 'corruption-antidote-formula', 'vault-deed'],
        connectedAreas: ['deadwood-assay-office'],
        supernaturalLevel: 80,
      },
    ],
    entryAreaId: 'deadwood-main-street',
    uniqueMechanic: {
      id: 'corruption-meter',
      name: 'Gold Corruption',
      description: 'Every piece of gold you take corrupts you further. How much is too much?',
      rules:
        'Collecting gold in this town adds to a corruption meter. High corruption provides gold bonuses ' +
        'but debuffs combat stats. Reaching 100% corruption traps you in the town permanently (death).',
    },
    questIds: ['ghost-town:deadwood-shadow', 'ghost-town:deadwood-truth'],
    miniBossIds: ['boss_wild_bill_echo'],
    completionRewards: {
      gold: 3500,
      xp: 5000,
      items: ['incorruptible-gloves'],
      title: 'Gold Breaker',
    },
    discoveryMethod: 'exploration',
  },
  {
    id: 'ghost-town-san-muerte',
    name: 'Mission San Muerte',
    description: 'A Spanish mission abandoned for reasons the Church refuses to discuss.',
    backstory:
      'Built in 1742 by Franciscan missionaries, Mission San Muerte was meant to convert the ' +
      'native population. What they found instead was an old evil - something the natives had ' +
      'kept sealed for generations. The padres tried to destroy it. They only set it free.',
    tier: GhostTownTier.MAJOR,
    theme: GhostTownTheme.COLONIAL,
    levelRange: { min: 41, max: 44 },
    parentLocation: 'sangre_borderlands',
    areas: [
      {
        id: 'san-muerte-courtyard',
        name: 'Mission Courtyard',
        description: 'Crumbling arches surround a dried fountain. Shadows move against the sun.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'unholy-ground',
            type: GhostTownHazard.SUPERNATURAL,
            name: 'Unholy Ground',
            description: 'The consecrated earth has been corrupted. Walking causes pain.',
            damagePerTurn: 8,
            counterplay: 'Recite prayers or wear blessed items',
          },
        ],
        lootTable: ['mission-artifacts', 'spanish-coins', 'padre-journal'],
        connectedAreas: ['san-muerte-chapel', 'san-muerte-dormitory'],
        supernaturalLevel: 50,
      },
      {
        id: 'san-muerte-chapel',
        name: 'The Defiled Chapel',
        description: 'Once holy. Now the altar bleeds and the crucifix hangs inverted.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'bleeding-walls',
            type: GhostTownHazard.SUPERNATURAL,
            name: 'Bleeding Walls',
            description: 'The walls weep blood. The blood whispers.',
            damagePerTurn: 12,
            statusEffect: 'madness',
            duration: 3,
            counterplay: 'Do not listen. Do not drink.',
          },
        ],
        lootTable: ['san-muerte-rosary', 'defiled-chalice', 'mission-bell'],
        hasMiniBoss: true,
        miniBossId: 'boss_undead_priest',
        connectedAreas: ['san-muerte-courtyard', 'san-muerte-crypt-entrance'],
        supernaturalLevel: 70,
      },
      {
        id: 'san-muerte-crypt-entrance',
        name: 'Crypt Entrance',
        description: 'The stairs descend into darkness. Cold air rises from below.',
        state: GhostTownAreaState.LOCKED,
        requiredKey: 'san-muerte-crypt-key',
        hazards: [
          {
            id: 'dead-rising',
            type: GhostTownHazard.SUPERNATURAL,
            name: 'The Dead Rise',
            description: 'Conquistadors buried for centuries claw their way up',
            damagePerTurn: 18,
            counterplay: 'Fire, silver, or blessed weapons',
          },
        ],
        lootTable: ['conquistador-helmet', 'ancient-spanish-gold', 'crypt-map'],
        connectedAreas: ['san-muerte-chapel', 'san-muerte-crypt'],
        supernaturalLevel: 85,
      },
      {
        id: 'san-muerte-crypt',
        name: 'The Crypt of the First Evil',
        description: 'Where the Conquistador made his dark pact. Where he waits to be awakened.',
        state: GhostTownAreaState.LOCKED,
        requiredKey: 'conquistador-seal',
        hazards: [
          {
            id: 'void-presence',
            type: GhostTownHazard.SUPERNATURAL,
            name: 'Void Presence',
            description: 'Something older than humanity watches. It is patient.',
            damagePerTurn: 25,
            statusEffect: 'corruption',
            duration: -1,
            counterplay: 'Unite the factions. Face it together.',
          },
        ],
        lootTable: ['conquistadors-armor', 'cursed-medallion', 'the-first-bible'],
        hasMiniBoss: false, // This is where pack boss spawns
        connectedAreas: ['san-muerte-crypt-entrance'],
        supernaturalLevel: 100,
      },
    ],
    entryAreaId: 'san-muerte-courtyard',
    uniqueMechanic: {
      id: 'holy-unholy-zones',
      name: 'Sacred Ground',
      description: 'Some areas are blessed, others cursed. Effects change dramatically.',
      rules:
        'Holy zones heal and buff living players but damage undead. Unholy zones do the opposite. ' +
        'Some items can flip zone alignment. The pack boss can only be damaged in holy zones.',
    },
    questIds: ['ghost-town:san-muerte-approach', 'ghost-town:san-muerte-crypt'],
    miniBossIds: ['boss_undead_priest'],
    artifactIds: ['the-first-bible', 'mission-bell', 'cursed-medallion'],
    completionRewards: {
      gold: 6000,
      xp: 8000,
      items: ['conquistador-seal'],
      title: 'First Evil Slayer',
    },
    discoveryMethod: 'quest',
    discoveryQuestId: 'artifacts:colonial-curse',
  },
  {
    id: 'ghost-town-wraths-hollow',
    name: "Wrath's Hollow",
    description: 'Where the Seventh Cavalry committed an atrocity they tried to forget.',
    backstory:
      'In the winter of 1868, soldiers massacred a peaceful Nahi village - women, children, ' +
      'elders. The official report called it a "battle." The survivors cursed the land with ' +
      'their dying breaths. Every soldier involved died within a year. Now their victims ' +
      'walk the frozen ground, and so do their killers.',
    tier: GhostTownTier.MAJOR,
    theme: GhostTownTheme.SIN,
    levelRange: { min: 42, max: 43 },
    parentLocation: 'frozen_peaks',
    areas: [
      {
        id: 'wraths-hollow-approach',
        name: 'Blood-Stained Snow',
        description: 'The snow never melts here. It\'s always red.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'guilty-conscience',
            type: GhostTownHazard.MADNESS,
            name: 'Weight of Guilt',
            description: 'The land judges you for sins past - yours and your ancestors\'.',
            statusEffect: 'weakness',
            duration: 5,
            counterplay: 'Acknowledge the wrong. Seek forgiveness.',
            counterplaySkill: 'ritual_knowledge',
            counterplayThreshold: 45,
          },
        ],
        lootTable: ['frozen-memories', 'soldier-dogtags', 'native-beadwork'],
        connectedAreas: ['wraths-hollow-village'],
        supernaturalLevel: 60,
      },
      {
        id: 'wraths-hollow-village',
        name: 'The Massacre Site',
        description: 'Lodges still stand, frozen in time. So do the dead.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'vengeful-spirits',
            type: GhostTownHazard.SUPERNATURAL,
            name: 'Vengeful Spirits',
            description: 'Victims and killers, trapped together, fighting eternally',
            damagePerTurn: 15,
            counterplay: 'Help the victims find peace. Condemn the killers.',
            counterplaySkill: 'ritual_knowledge',
            counterplayThreshold: 50,
          },
        ],
        lootTable: ['wraths-hollow-memento', 'medicine-bundle', 'cavalry-saber'],
        connectedAreas: ['wraths-hollow-approach', 'wraths-hollow-heart'],
        supernaturalLevel: 80,
      },
      {
        id: 'wraths-hollow-heart',
        name: 'The Heart of Wrath',
        description: 'Where the chief died defending his family. Where vengeance was born.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'wrath-incarnate',
            type: GhostTownHazard.SUPERNATURAL,
            name: 'Wrath Incarnate',
            description: 'Pure rage given form. It doesn\'t distinguish between guilty and innocent.',
            damagePerTurn: 20,
            statusEffect: 'fear',
            duration: 3,
            counterplay: 'Righteous wrath can match it. Or true peace can calm it.',
          },
        ],
        lootTable: ['chiefs-war-bonnet', 'spirit-tomahawk', 'peace-pipe'],
        hasMiniBoss: true,
        miniBossId: 'boss_the_avenger',
        connectedAreas: ['wraths-hollow-village'],
        supernaturalLevel: 95,
      },
    ],
    entryAreaId: 'wraths-hollow-approach',
    uniqueMechanic: {
      id: 'guilty-conscience-system',
      name: 'Guilty Conscience',
      description: 'Your past actions in the game affect how the spirits treat you.',
      rules:
        'Players with more "outlaw" reputation or who have harmed Nahi NPCs take more damage and face ' +
        'harder challenges. Players with positive Nahi reputation or who helped natives receive blessings.',
    },
    questIds: ['ghost-town:wraths-hollow-entry', 'ghost-town:wraths-hollow-reckoning'],
    miniBossIds: ['boss_the_avenger'],
    artifactIds: ['medicine-bundle', 'spirit-totem'],
    completionRewards: {
      gold: 4000,
      xp: 6000,
      items: ['peace-makers-token'],
      title: 'Peace Bringer',
    },
    discoveryMethod: 'quest',
    discoveryQuestId: 'artifacts:spirit-relics',
  },
];

/**
 * Medium Ghost Towns (8) - Simpler content, varied hazards
 */
export const MEDIUM_GHOST_TOWNS: IGhostTown[] = [
  {
    id: 'ghost-town-dusty-creek',
    name: 'Dusty Creek',
    description: 'A bank robbery went wrong. Everyone inside died. The vault never opened.',
    backstory: 'The James-Younger gang hit Dusty Creek in 1876. What they didn\'t know was the ' +
      'bank had a new security system. The explosion collapsed the building on robbers and hostages alike.',
    tier: GhostTownTier.MEDIUM,
    theme: GhostTownTheme.DISASTER,
    levelRange: { min: 36, max: 36 },
    parentLocation: 'silver_range',
    areas: [
      {
        id: 'dusty-creek-main',
        name: 'Main Street',
        description: 'A single collapsed building dominates the abandoned town.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'unstable-rubble',
            type: GhostTownHazard.STRUCTURAL,
            name: 'Unstable Rubble',
            description: 'The collapsed bank could shift at any moment',
            damagePerTurn: 10,
            counterplay: 'Move carefully',
          },
        ],
        lootTable: ['dusty-creek-vault-key', 'scattered-coins', 'robber-journal'],
        connectedAreas: [],
        supernaturalLevel: 15,
      },
    ],
    entryAreaId: 'dusty-creek-main',
    questIds: [],
    miniBossIds: [],
    completionRewards: { gold: 800, xp: 1200 },
    discoveryMethod: 'exploration',
  },
  {
    id: 'ghost-town-cattle-crossing',
    name: 'Cattle Crossing',
    description: 'A ranching community wiped out in a single night. The cattle remain.',
    backstory: 'Rival ranchers escalated a fence dispute into a massacre. When the dust settled, ' +
      'both families were dead and the cattle wandered free.',
    tier: GhostTownTier.MEDIUM,
    theme: GhostTownTheme.SIN,
    levelRange: { min: 37, max: 37 },
    parentLocation: 'cattle_plains',
    areas: [
      {
        id: 'cattle-crossing-ranch',
        name: 'Abandoned Ranch',
        description: 'Feral cattle still graze here. So do their former owners.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'phantom-stampede',
            type: GhostTownHazard.SUPERNATURAL,
            name: 'Phantom Stampede',
            description: 'Ghost cattle charge through without warning',
            damagePerTurn: 12,
            counterplay: 'Get to high ground',
          },
        ],
        lootTable: ['rancher-journal', 'branding-iron', 'cattle-deed'],
        connectedAreas: [],
        supernaturalLevel: 35,
      },
    ],
    entryAreaId: 'cattle-crossing-ranch',
    questIds: [],
    miniBossIds: [],
    completionRewards: { gold: 900, xp: 1400 },
    discoveryMethod: 'exploration',
  },
  {
    id: 'ghost-town-silver-springs',
    name: 'Silver Springs',
    description: 'The water here turned silver. Then it turned people mad.',
    backstory: 'Mining runoff contaminated the only water source. By the time anyone noticed, ' +
      'the whole town was drinking liquid mercury. The hallucinations came first. Then the deaths.',
    tier: GhostTownTier.MEDIUM,
    theme: GhostTownTheme.DISASTER,
    levelRange: { min: 38, max: 38 },
    parentLocation: 'silver_range',
    areas: [
      {
        id: 'silver-springs-town',
        name: 'Poisoned Town',
        description: 'The well in the center still flows silver. Don\'t drink.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'mercury-madness',
            type: GhostTownHazard.MADNESS,
            name: 'Mercury Madness',
            description: 'The air itself carries trace amounts of the poison',
            statusEffect: 'confusion',
            duration: 5,
            counterplay: 'Cover your mouth and nose',
          },
        ],
        lootTable: ['silver-springs-antidote', 'mercury-sample', 'mad-mayor-journal'],
        connectedAreas: [],
        supernaturalLevel: 25,
      },
    ],
    entryAreaId: 'silver-springs-town',
    questIds: [],
    miniBossIds: [],
    completionRewards: { gold: 1000, xp: 1500 },
    discoveryMethod: 'exploration',
  },
  {
    id: 'ghost-town-fort-desolation',
    name: 'Fort Desolation',
    description: 'A military outpost that went silent. The Army never found out why.',
    backstory: 'Fort Desolation was built to protect settlers. One winter, all communication stopped. ' +
      'When relief arrived in spring, the fort was empty. No bodies. No signs of struggle. Just... empty.',
    tier: GhostTownTier.MEDIUM,
    theme: GhostTownTheme.HISTORICAL,
    levelRange: { min: 39, max: 39 },
    parentLocation: 'frontier_territories',
    areas: [
      {
        id: 'fort-desolation-grounds',
        name: 'Fort Grounds',
        description: 'The American flag still flies, tattered by decades of wind.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'phantom-drills',
            type: GhostTownHazard.SUPERNATURAL,
            name: 'Phantom Drill',
            description: 'Ghostly soldiers still march their patrol. They don\'t like intruders.',
            damagePerTurn: 14,
            counterplay: 'Join the formation. March with them.',
          },
        ],
        lootTable: ['fort-desolation-orders', 'military-medals', 'commanders-pistol'],
        connectedAreas: [],
        supernaturalLevel: 55,
      },
    ],
    entryAreaId: 'fort-desolation-grounds',
    questIds: [],
    miniBossIds: [],
    completionRewards: { gold: 1100, xp: 1600 },
    discoveryMethod: 'exploration',
  },
  {
    id: 'ghost-town-preachers-hollow',
    name: "Preacher's Hollow",
    description: 'A religious community that found something to worship. Something old.',
    backstory: 'Brother Ezekiel led his flock west to found a perfect Christian community. ' +
      'What he found in the canyon changed his faith. The new god demanded very different sacrifices.',
    tier: GhostTownTier.MEDIUM,
    theme: GhostTownTheme.SIN,
    levelRange: { min: 40, max: 40 },
    parentLocation: 'canyon_lands',
    areas: [
      {
        id: 'preachers-hollow-church',
        name: 'The Wrong Church',
        description: 'The chapel looks normal from outside. Inside, the symbols are all wrong.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'dark-sermon',
            type: GhostTownHazard.SUPERNATURAL,
            name: 'Dark Sermon',
            description: 'You can hear preaching. The words hurt your soul.',
            damagePerTurn: 16,
            statusEffect: 'corruption',
            duration: 4,
            counterplay: 'Recite actual scripture. Counter the lies.',
          },
        ],
        lootTable: ['dark-scripture', 'cultist-robes', 'ezekiel-journal'],
        connectedAreas: [],
        supernaturalLevel: 70,
      },
    ],
    entryAreaId: 'preachers-hollow-church',
    questIds: [],
    miniBossIds: [],
    completionRewards: { gold: 1200, xp: 1800 },
    discoveryMethod: 'exploration',
  },
  {
    id: 'ghost-town-iron-horse-junction',
    name: 'Iron Horse Junction',
    description: 'A railroad depot abandoned after a catastrophic derailment.',
    backstory: 'The fastest train in the West tried to break the speed record at Iron Horse Junction. ' +
      'It succeeded. Then it jumped the tracks at 80 miles per hour. The wreckage is still there.',
    tier: GhostTownTier.MEDIUM,
    theme: GhostTownTheme.DISASTER,
    levelRange: { min: 41, max: 41 },
    parentLocation: 'railroad_territories',
    areas: [
      {
        id: 'iron-horse-wreck',
        name: 'The Wreck',
        description: 'Twisted metal and shattered wood. The engine still steams.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'phantom-train',
            type: GhostTownHazard.SUPERNATURAL,
            name: 'Phantom Train',
            description: 'At midnight, the train runs again. Don\'t be on the tracks.',
            damagePerTurn: 25,
            counterplay: 'Stay off the rails. It only runs on schedule.',
          },
        ],
        lootTable: ['train-schedule', 'passenger-valuables', 'engineers-watch'],
        connectedAreas: [],
        supernaturalLevel: 45,
      },
    ],
    entryAreaId: 'iron-horse-wreck',
    questIds: [],
    miniBossIds: [],
    completionRewards: { gold: 1300, xp: 2000 },
    discoveryMethod: 'exploration',
  },
  {
    id: 'ghost-town-gamblers-rest',
    name: "Gambler's Rest",
    description: 'A casino town where the house always wins. Especially after you\'re dead.',
    backstory: 'The greatest poker tournament in Western history ended in a massacre when the loser ' +
      'accused the winner of cheating. Both were right. Both died. The game never ended.',
    tier: GhostTownTier.MEDIUM,
    theme: GhostTownTheme.SIN,
    levelRange: { min: 42, max: 42 },
    parentLocation: 'frontier_territories',
    areas: [
      {
        id: 'gamblers-rest-casino',
        name: 'The Eternal Table',
        description: 'Ghostly gamblers still play. There\'s an empty seat.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'compulsion-to-play',
            type: GhostTownHazard.MADNESS,
            name: 'Compulsion',
            description: 'You must play. You must bet everything. You will lose.',
            statusEffect: 'greed',
            duration: -1,
            counterplay: 'Win. Or walk away before you sit down.',
            counterplaySkill: 'gambling',
            counterplayThreshold: 50,
          },
        ],
        lootTable: ['gamblers-rest-dice', 'marked-deck', 'tournament-trophy'],
        connectedAreas: [],
        supernaturalLevel: 65,
      },
    ],
    entryAreaId: 'gamblers-rest-casino',
    questIds: [],
    miniBossIds: [],
    completionRewards: { gold: 1500, xp: 2200 },
    discoveryMethod: 'exploration',
  },
  {
    id: 'ghost-town-miners-hope',
    name: "Miner's Hope",
    description: 'Another mine collapse. Different story. Same ending.',
    backstory: 'Miner\'s Hope was built on dreams of silver. When the company went bankrupt, they ' +
      'didn\'t tell the miners still underground. The supports were removed while men were working.',
    tier: GhostTownTier.MEDIUM,
    theme: GhostTownTheme.DISASTER,
    levelRange: { min: 43, max: 43 },
    parentLocation: 'silver_range',
    areas: [
      {
        id: 'miners-hope-shaft',
        name: 'The Betrayed Shaft',
        description: 'You can hear digging. They\'re still trying to get out.',
        state: GhostTownAreaState.UNEXPLORED,
        hazards: [
          {
            id: 'betrayed-miners',
            type: GhostTownHazard.SUPERNATURAL,
            name: 'Betrayed Miners',
            description: 'They think you\'re a company man. They\'re not wrong about wanting revenge.',
            damagePerTurn: 18,
            statusEffect: 'fear',
            duration: 3,
            counterplay: 'Show them solidarity. Or bring company records to burn.',
          },
        ],
        lootTable: ['company-records', 'miners-lantern', 'union-card'],
        connectedAreas: [],
        supernaturalLevel: 75,
      },
    ],
    entryAreaId: 'miners-hope-shaft',
    questIds: [],
    miniBossIds: [],
    completionRewards: { gold: 1400, xp: 2100 },
    discoveryMethod: 'exploration',
  },
];

/**
 * All ghost towns combined
 */
export const ALL_GHOST_TOWNS: IGhostTown[] = [
  ...MAJOR_GHOST_TOWNS,
  ...MEDIUM_GHOST_TOWNS,
];

// =============================================================================
// ARTIFACT CONSTANTS
// =============================================================================

export const ARTIFACT_HUNTING = {
  // Discovery
  HINT_COST: 500,            // Gold to buy a hint
  FRAGMENT_XP: 250,          // XP per fragment found

  // Set bonuses
  SET_2_BONUS_MULT: 1.0,
  SET_3_BONUS_MULT: 1.5,
  SET_4_BONUS_MULT: 2.0,
  FULL_SET_BONUS_MULT: 3.0,
};

/**
 * Artifact Sets
 */
export const ARTIFACT_SETS: IArtifactSet[] = [
  {
    id: 'outlaw-legends-set',
    name: 'Outlaw Legends Collection',
    description: 'Gear and mementos from the most infamous outlaws in Western history.',
    category: ArtifactCategory.OUTLAW_LEGEND,
    artifacts: ['billys-colt', 'jesses-saddlebag', 'docs-cards', 'wyatts-badge', 'geronimos-bow'],
    bonuses: [
      {
        requiredCount: 2,
        effects: [{ stat: 'intimidation', value: 10, description: '+10 Intimidation' }],
      },
      {
        requiredCount: 3,
        effects: [
          { stat: 'intimidation', value: 15, description: '+15 Intimidation' },
          { stat: 'shooting', value: 5, description: '+5 Shooting' },
        ],
      },
      {
        requiredCount: 5,
        effects: [
          { stat: 'intimidation', value: 25, description: '+25 Intimidation' },
          { stat: 'shooting', value: 10, description: '+10 Shooting' },
          { stat: 'outlaw_reputation', value: 15, description: '+15 Outlaw Reputation gain' },
        ],
      },
    ],
    completionTitle: 'Collector of Legends',
    completionReward: { gold: 10000, xp: 15000, item: 'legends-display-case' },
  },
  {
    id: 'cursed-objects-set',
    name: 'Cursed Objects Collection',
    description: 'Items of dark power. Handle with extreme caution.',
    category: ArtifactCategory.CURSED_OBJECT,
    artifacts: ['the-noose', 'forever-loaded-gun', 'judges-gavel', 'cursed-medallion'],
    bonuses: [
      {
        requiredCount: 2,
        effects: [{ stat: 'dark_damage', value: 15, description: '+15% Dark damage' }],
      },
      {
        requiredCount: 3,
        effects: [
          { stat: 'dark_damage', value: 25, description: '+25% Dark damage' },
          { stat: 'corruption_resist', value: 10, description: '+10% Corruption resistance' },
        ],
      },
      {
        requiredCount: 4,
        effects: [
          { stat: 'dark_damage', value: 40, description: '+40% Dark damage' },
          { stat: 'corruption_resist', value: 25, description: '+25% Corruption resistance' },
          { stat: 'execute_threshold', value: 10, description: 'Execute enemies below 10% HP' },
        ],
      },
    ],
    completionTitle: 'Curse Bearer',
    completionReward: { gold: 8000, xp: 12000, item: 'curse-containment-case' },
  },
  {
    id: 'native-relics-set',
    name: 'Spirit Relics Collection',
    description: 'Sacred items of the native peoples. They chose you.',
    category: ArtifactCategory.NATIVE_RELIC,
    artifacts: ['spirit-totem', 'medicine-bundle', 'geronimos-bow', 'dream-catcher', 'ancestors-pipe'],
    bonuses: [
      {
        requiredCount: 2,
        effects: [{ stat: 'spirit_power', value: 10, description: '+10 Spirit' }],
      },
      {
        requiredCount: 3,
        effects: [
          { stat: 'spirit_power', value: 20, description: '+20 Spirit' },
          { stat: 'wilderness_survival', value: 15, description: '+15% Wilderness survival' },
        ],
      },
      {
        requiredCount: 5,
        effects: [
          { stat: 'spirit_power', value: 35, description: '+35 Spirit' },
          { stat: 'wilderness_survival', value: 30, description: '+30% Wilderness survival' },
          { stat: 'spirit_sight', value: 1, description: 'Gain Spirit Sight ability' },
        ],
      },
    ],
    completionTitle: 'Spirit Walker',
    completionReward: { gold: 7500, xp: 12000, item: 'spirit-shrine' },
  },
  {
    id: 'colonial-set',
    name: 'Colonial Relics Collection',
    description: 'Artifacts from the Spanish conquest. Some debts never expire.',
    category: ArtifactCategory.COLONIAL,
    artifacts: ['conquistadors-armor', 'cursed-medallion', 'mission-bell', 'the-first-bible'],
    bonuses: [
      {
        requiredCount: 2,
        effects: [{ stat: 'undead_damage', value: 20, description: '+20% damage vs Undead' }],
      },
      {
        requiredCount: 3,
        effects: [
          { stat: 'undead_damage', value: 35, description: '+35% damage vs Undead' },
          { stat: 'holy_resist', value: 15, description: '+15% Holy resistance' },
        ],
      },
      {
        requiredCount: 4,
        effects: [
          { stat: 'undead_damage', value: 50, description: '+50% damage vs Undead' },
          { stat: 'holy_resist', value: 30, description: '+30% Holy resistance' },
          { stat: 'colonial_authority', value: 1, description: 'Command undead conquistadors' },
        ],
      },
    ],
    completionTitle: 'Conquistador\'s Heir',
    completionReward: { gold: 9000, xp: 14000, item: 'colonial-display' },
  },
];

// =============================================================================
// PRESTIGE TIER CONSTANTS
// =============================================================================

export const PRESTIGE_CONSTANTS = {
  // Decay
  DAILY_DECAY_RATE: 0.5,     // Lose 0.5 rep per day toward neutral
  DECAY_IMMUNITY_THRESHOLD: 60, // No decay above this tier

  // Ultimate quest requirements
  ULTIMATE_LEVEL_REQUIRED: 44,
  ULTIMATE_QUEST_PREREQUISITE: 'legends:winter-eternal',
};

/**
 * Marshal prestige tier definitions
 */
export const MARSHAL_PRESTIGE_TIERS: IPrestigeTierDef[] = [
  {
    tier: MarshalPrestigeTier.DEPUTY,
    name: 'Deputy',
    description: 'You\'ve taken the first steps toward justice.',
    icon: 'badge-deputy',
    reputationRange: { min: 30, max: 59 },
    abilities: [
      {
        id: 'citizens-arrest',
        name: 'Citizen\'s Arrest',
        description: 'Attempt to arrest a criminal NPC without a bounty',
        tier: MarshalPrestigeTier.DEPUTY,
        type: 'active',
        cooldown: 60,
        energyCost: 20,
      },
    ],
    unlockedFeatures: ['bounty_board_access', 'jail_visitation'],
    unlockedQuests: [],
    exclusiveCosmetics: ['deputy-badge', 'deputy-hat'],
  },
  {
    tier: MarshalPrestigeTier.MARSHAL,
    name: 'Marshal',
    description: 'The law follows where you lead.',
    icon: 'badge-marshal',
    reputationRange: { min: 60, max: 79 },
    abilities: [
      {
        id: 'posse-summon',
        name: 'Form a Posse',
        description: 'Summon NPC deputies to assist in combat',
        tier: MarshalPrestigeTier.MARSHAL,
        type: 'active',
        cooldown: 180,
        energyCost: 30,
        duration: 300,
      },
      {
        id: 'lawmans-authority',
        name: 'Lawman\'s Authority',
        description: '+15% damage against outlaws',
        tier: MarshalPrestigeTier.MARSHAL,
        type: 'passive',
        passiveEffects: [{ stat: 'outlaw_damage', value: 15 }],
      },
    ],
    unlockedFeatures: ['legendary_bounty_access', 'marshal_discount'],
    unlockedQuests: ['bounty:doc-holliday-trail'],
    titlePrefix: 'Marshal',
    exclusiveCosmetics: ['marshal-badge', 'marshal-duster', 'law-mans-spurs'],
  },
  {
    tier: MarshalPrestigeTier.LEGENDARY_MARSHAL,
    name: 'Legendary Marshal',
    description: 'Your name alone is a deterrent to crime.',
    icon: 'badge-legendary',
    reputationRange: { min: 80, max: 99 },
    abilities: [
      {
        id: 'intimidating-presence',
        name: 'Intimidating Presence',
        description: 'Outlaws have a chance to flee on sight',
        tier: MarshalPrestigeTier.LEGENDARY_MARSHAL,
        type: 'passive',
        passiveEffects: [{ stat: 'outlaw_flee_chance', value: 25 }],
      },
      {
        id: 'legendary-pursuit',
        name: 'Legendary Pursuit',
        description: 'Track any target, anywhere, instantly',
        tier: MarshalPrestigeTier.LEGENDARY_MARSHAL,
        type: 'active',
        cooldown: 240,
        energyCost: 40,
      },
    ],
    unlockedFeatures: ['ultimate_bounties', 'marshal_headquarters'],
    unlockedQuests: [],
    titlePrefix: 'Legendary Marshal',
    exclusiveCosmetics: ['legendary-badge', 'justice-bringer-coat', 'law-legend-hat'],
  },
  {
    tier: MarshalPrestigeTier.THE_LAW,
    name: 'The Law',
    description: 'You ARE the law west of the Pecos.',
    icon: 'badge-ultimate',
    reputationRange: { min: 100, max: 100 },
    abilities: [
      {
        id: 'judge-jury-executioner',
        name: 'Judge, Jury, Executioner',
        description: 'Execute any outlaw with bounty over $1000 instantly',
        tier: MarshalPrestigeTier.THE_LAW,
        type: 'active',
        cooldown: 1440, // Once per day
        energyCost: 50,
      },
      {
        id: 'the-laws-protection',
        name: 'The Law\'s Protection',
        description: 'Immune to outlaw ambushes, +30% defense vs criminals',
        tier: MarshalPrestigeTier.THE_LAW,
        type: 'passive',
        passiveEffects: [
          { stat: 'ambush_immunity', value: 1 },
          { stat: 'criminal_defense', value: 30 },
        ],
      },
      {
        id: 'rally-the-righteous',
        name: 'Rally the Righteous',
        description: 'All nearby allies gain +20% damage for 5 minutes',
        tier: MarshalPrestigeTier.THE_LAW,
        type: 'active',
        cooldown: 360,
        duration: 300,
      },
    ],
    unlockedFeatures: ['prestige_epilogue_marshal', 'law_legend_perks'],
    unlockedQuests: ['prestige:the-law'],
    titleSuffix: ', The Law',
    exclusiveCosmetics: ['the-law-badge', 'ultimate-justice-coat', 'law-incarnate-hat', 'scales-of-justice-mount'],
  },
];

/**
 * Outlaw prestige tier definitions
 */
export const OUTLAW_PRESTIGE_TIERS: IPrestigeTierDef[] = [
  {
    tier: OutlawPrestigeTier.PETTY_CROOK,
    name: 'Petty Crook',
    description: 'You\'ve dipped your toes in crime.',
    icon: 'wanted-petty',
    reputationRange: { min: -59, max: -30 },
    abilities: [
      {
        id: 'fence-access',
        name: 'Fence Access',
        description: 'Sell stolen goods at 60% value',
        tier: OutlawPrestigeTier.PETTY_CROOK,
        type: 'passive',
        passiveEffects: [{ stat: 'fence_rate', value: 60 }],
      },
    ],
    unlockedFeatures: ['fence_basic', 'petty_crimes_bonus'],
    unlockedQuests: [],
    exclusiveCosmetics: ['bandana-basic', 'crook-hat'],
  },
  {
    tier: OutlawPrestigeTier.WANTED,
    name: 'Wanted',
    description: 'There\'s a price on your head.',
    icon: 'wanted-poster',
    reputationRange: { min: -79, max: -60 },
    abilities: [
      {
        id: 'hideout-access',
        name: 'Hideout Network',
        description: 'Access outlaw hideouts for healing and hiding',
        tier: OutlawPrestigeTier.WANTED,
        type: 'passive',
      },
      {
        id: 'outlaw-contacts',
        name: 'Outlaw Contacts',
        description: '+20% gold from crimes, better fence rates',
        tier: OutlawPrestigeTier.WANTED,
        type: 'passive',
        passiveEffects: [
          { stat: 'crime_gold', value: 20 },
          { stat: 'fence_rate', value: 70 },
        ],
      },
    ],
    unlockedFeatures: ['hideout_network', 'gang_recruitment', 'wanted_contracts'],
    unlockedQuests: ['bounty:native-raider-hunt'],
    titlePrefix: 'Wanted',
    exclusiveCosmetics: ['wanted-bandana', 'outlaw-duster', 'desperado-spurs'],
  },
  {
    tier: OutlawPrestigeTier.NOTORIOUS,
    name: 'Notorious',
    description: 'Your name is whispered in fear.',
    icon: 'skull-notorious',
    reputationRange: { min: -99, max: -80 },
    abilities: [
      {
        id: 'terrifying-reputation',
        name: 'Terrifying Reputation',
        description: 'Law NPCs hesitate before attacking',
        tier: OutlawPrestigeTier.NOTORIOUS,
        type: 'passive',
        passiveEffects: [{ stat: 'law_hesitation', value: 30 }],
      },
      {
        id: 'legendary-heist',
        name: 'Legendary Heist',
        description: 'Access to high-value criminal contracts',
        tier: OutlawPrestigeTier.NOTORIOUS,
        type: 'passive',
      },
    ],
    unlockedFeatures: ['legendary_crimes', 'gang_leadership', 'assassination_contracts'],
    unlockedQuests: [],
    titlePrefix: 'Notorious',
    exclusiveCosmetics: ['notorious-mask', 'terror-duster', 'skull-bandana'],
  },
  {
    tier: OutlawPrestigeTier.THE_LEGEND,
    name: 'The Legend',
    description: 'They\'ll tell stories about you for a hundred years.',
    icon: 'skull-ultimate',
    reputationRange: { min: -100, max: -100 },
    abilities: [
      {
        id: 'living-legend',
        name: 'Living Legend',
        description: '+50% gold from all crimes, 90% fence rate',
        tier: OutlawPrestigeTier.THE_LEGEND,
        type: 'passive',
        passiveEffects: [
          { stat: 'crime_gold', value: 50 },
          { stat: 'fence_rate', value: 90 },
        ],
      },
      {
        id: 'fear-incarnate',
        name: 'Fear Incarnate',
        description: 'First attack in combat always crits against law NPCs',
        tier: OutlawPrestigeTier.THE_LEGEND,
        type: 'passive',
        passiveEffects: [{ stat: 'law_first_crit', value: 1 }],
      },
      {
        id: 'call-the-gang',
        name: 'Call the Gang',
        description: 'Summon your legendary gang for a massive crime',
        tier: OutlawPrestigeTier.THE_LEGEND,
        type: 'active',
        cooldown: 1440,
        energyCost: 60,
        duration: 600,
      },
    ],
    unlockedFeatures: ['prestige_epilogue_outlaw', 'legend_perks', 'ultimate_fence'],
    unlockedQuests: ['prestige:the-legend'],
    titleSuffix: ' the Legend',
    exclusiveCosmetics: ['legend-mask', 'immortal-outlaw-coat', 'death-rider-hat', 'nightmare-mount'],
  },
];

// =============================================================================
// FACTION REPRESENTATIVE CONSTANTS
// =============================================================================

export const FACTION_REPRESENTATIVES: IFactionRepresentative[] = [
  {
    id: 'rep-iron-martha',
    name: 'Iron Martha',
    title: 'The Sharpshooter',
    faction: 'settler_alliance',
    description: 'The finest rifle shot in three territories. Never misses.',
    backstory:
      'Martha lost her homestead to outlaws. She learned to shoot. She never stopped practicing. ' +
      'Now she helps others who can\'t protect themselves.',
    role: 'dps',
    specialization: 'Rifle Specialist',
    level: 40,
    health: 800,
    damage: 120,
    defense: 45,
    abilities: [
      {
        id: 'covering-fire',
        name: 'Covering Fire',
        description: 'Suppresses enemies, reducing their damage by 25%',
        type: 'debuff',
        cooldown: 30,
      },
      {
        id: 'headshot',
        name: 'Headshot',
        description: 'Massive damage to a single target',
        type: 'damage',
        cooldown: 45,
      },
      {
        id: 'eagle-eye',
        name: 'Eagle Eye',
        description: 'Increases party critical chance by 15%',
        type: 'buff',
        cooldown: 60,
      },
    ],
    summonCost: {
      gold: 500,
      factionReputation: 50,
    },
    greetingDialogue: '"Need a gun? I\'ve got the best in the West."',
    combatDialogue: [
      '"Stay down!"',
      '"Got \'em in my sights."',
      '"Nobody moves faster than a bullet."',
    ],
    victoryDialogue: '"Another day, another outlaw put down."',
    defeatDialogue: '"Fall back... I\'ll cover you..."',
  },
  {
    id: 'rep-two-ravens',
    name: 'Two Ravens',
    title: 'Spirit Seer',
    faction: 'nahi_coalition',
    description: 'A shaman who walks between worlds. Sees what others cannot.',
    backstory:
      'Born during an eclipse, Two Ravens has always seen the spirit world. The tribe sent him ' +
      'to learn the old ways. Now he guides those who face supernatural threats.',
    role: 'support',
    specialization: 'Tracker & Spiritual Guide',
    level: 40,
    health: 700,
    damage: 80,
    defense: 50,
    abilities: [
      {
        id: 'spirit-sight',
        name: 'Spirit Sight',
        description: 'Reveals hidden enemies and traps',
        type: 'utility',
        cooldown: 20,
      },
      {
        id: 'ancestor-blessing',
        name: 'Ancestor\'s Blessing',
        description: 'Heals and buffs an ally with spiritual protection',
        type: 'heal',
        cooldown: 40,
      },
      {
        id: 'banish-spirit',
        name: 'Banish Spirit',
        description: 'Heavy damage to supernatural enemies',
        type: 'damage',
        cooldown: 50,
      },
    ],
    summonCost: {
      gold: 400,
      factionReputation: 60,
      questRequired: 'artifacts:spirit-relics',
    },
    greetingDialogue: '"The spirits spoke of your coming. I am ready."',
    combatDialogue: [
      '"The ancestors fight with us."',
      '"I see your true form, creature."',
      '"Return to the void!"',
    ],
    victoryDialogue: '"Balance is restored. For now."',
    defeatDialogue: '"The spirits... will remember... your courage..."',
  },
  {
    id: 'rep-el-diablo',
    name: 'El Diablo',
    title: 'The Devil of the Border',
    faction: 'frontera',
    description: 'Explosives expert and close-combat specialist. Fights dirty.',
    backstory:
      'Nobody knows El Diablo\'s real name. They say he was a revolutionary, a bandit, a soldier. ' +
      'All anyone knows for sure is that he\'s good with dynamite and better with a knife.',
    role: 'specialist',
    specialization: 'Explosives & Close Combat',
    level: 40,
    health: 750,
    damage: 100,
    defense: 55,
    abilities: [
      {
        id: 'dynamite-bundle',
        name: 'Dynamite Bundle',
        description: 'Massive AoE damage',
        type: 'damage',
        cooldown: 60,
      },
      {
        id: 'smoke-bomb',
        name: 'Smoke Bomb',
        description: 'Blinds enemies and allows repositioning',
        type: 'utility',
        cooldown: 35,
      },
      {
        id: 'knife-work',
        name: 'Knife Work',
        description: 'Fast melee attack that causes bleeding',
        type: 'damage',
        cooldown: 15,
      },
    ],
    summonCost: {
      gold: 600,
      factionReputation: 40,
    },
    greetingDialogue: '"¿Necesitas un diablo? Estoy aquí."',
    combatDialogue: [
      '"¡Fuego!"',
      '"This is going to be loud."',
      '"Dance with the devil, amigo."',
    ],
    victoryDialogue: '"Another job done. Now we drink."',
    defeatDialogue: '"Go... I\'ll hold them... ¡Viva la frontera!"',
  },
];

// =============================================================================
// EXPORTS
// =============================================================================

export const LEGENDS_CONSTANTS = {
  GHOST_TOWN_EXPLORATION,
  ARTIFACT_HUNTING,
  PRESTIGE_CONSTANTS,
  MAJOR_GHOST_TOWNS,
  MEDIUM_GHOST_TOWNS,
  ALL_GHOST_TOWNS,
  ARTIFACT_SETS,
  MARSHAL_PRESTIGE_TIERS,
  OUTLAW_PRESTIGE_TIERS,
  FACTION_REPRESENTATIVES,
};
