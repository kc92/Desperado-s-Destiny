/**
 * Locations for The Frontier
 */

import mongoose from 'mongoose';
import { ILocation } from '../../models/Location.model';
import { LocationType, RegionType, ZONES } from '@desperados/shared';

export const frontierLocations: Partial<ILocation>[] = [
  {
    _id: new mongoose.Types.ObjectId('6501a0000000000000000010'),
    name: 'Abandoned Mine',
    description: 'An old, played-out silver mine. The company moved on long ago, but there might still be some iron ore left for a persistent prospector.',
    shortDescription: 'A played-out silver mine',
    type: 'mine',
    region: 'frontier',
    zone: ZONES.FRONTIER,
    isZoneHub: false,
    icon: '⛏️',
    atmosphere: 'The air is cool and damp. The wooden supports creak ominously. The only sound is the dripping of water and the scuttling of unseen things.',
    availableActions: [],
    availableCrimes: [],
    jobs: [
      {
        id: 'mine-iron-ore',
        name: 'Mine for Iron Ore',
        description: 'Search the tailings and shallow tunnels for leftover iron ore.',
        energyCost: 15,
        cooldownMinutes: 20,
        jobCategory: 'labor',
        rewards: { goldMin: 2, goldMax: 8, xp: 15, items: ['iron-ore'] },
        requirements: { minLevel: 1 }
      }
    ],
    shops: [],
    npcs: [],
    connections: [
      { targetLocationId: '6501a0000000000000000020', travelTime: 0, energyCost: 5, description: 'Back to Western Outpost' }
    ],
    dangerLevel: 3,
    factionInfluence: { settlerAlliance: 30, nahiCoalition: 10, frontera: 60 },
    isUnlocked: true,
    isHidden: false
  },
  {
    _id: new mongoose.Types.ObjectId('6501a0000000000000000011'),
    name: 'Dusty Crossroads',
    description: 'A lonely crossroads where two dusty trails meet. A weathered signpost points in four directions, but the names are too faded to read.',
    shortDescription: 'A lonely crossroads',
    type: 'wilderness',
    region: 'frontier',
    zone: ZONES.FRONTIER,
    isZoneHub: false,
    icon: '🚏',
    atmosphere: 'The wind whistles across the plains. A hawk circles high overhead. The dust from your boots is the only thing that moves.',
    availableActions: [],
    availableCrimes: [],
    jobs: [],
    shops: [],
    npcs: [
        {
            id: 'lone-rider',
            name: 'Lone Rider',
            title: 'Wanderer',
            description: 'A lone rider on the dusty trail, minding their own business.',
            faction: 'NEUTRAL',
            dialogue: ['Howdy.', 'Long road ahead.'],
        }
    ],
    connections: [],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 33, nahiCoalition: 33, frontera: 34 },
    isUnlocked: true,
    isHidden: false
  },
  {
    _id: new mongoose.Types.ObjectId('6501a0000000000000000012'),
    name: 'Snake Creek',
    description: 'A shallow, winding creek, named for the many rattlesnakes that sun themselves on its banks.',
    shortDescription: 'A shallow, winding creek',
    type: 'wilderness',
    region: 'frontier',
    zone: ZONES.FRONTIER,
    isZoneHub: false,
    icon: '🐍',
    atmosphere: 'The gentle burbling of the creek is a counterpoint to the constant, dry rattle of snakes in the undergrowth.',
    availableActions: [],
    availableCrimes: [],
    jobs: [
      {
        id: 'fish-in-creek',
        name: 'Fish in the Creek',
        description: 'Try your luck fishing for whatever lives in these shallow waters.',
        energyCost: 10,
        cooldownMinutes: 15,
        jobCategory: 'labor',
        rewards: { goldMin: 1, goldMax: 5, xp: 10, items: ['creek-fish'] }, // Assuming a generic fish item
        requirements: { minLevel: 1 }
      }
    ],
    shops: [],
    npcs: [],
    connections: [],
    dangerLevel: 4,
    factionInfluence: { settlerAlliance: 20, nahiCoalition: 40, frontera: 40 },
    isUnlocked: true,
    isHidden: false
  },
  // NEW TUTORIAL LOCATIONS
  {
    _id: new mongoose.Types.ObjectId('6501a0000000000000000020'),
    name: 'Western Outpost',
    description: 'A small Settler Alliance outpost guarding the western approach to Red Gulch.',
    shortDescription: 'Settler military outpost',
    type: 'outpost',
    region: 'frontier',
    zone: ZONES.SETTLER_TERRITORY,
    isZoneHub: false,
    icon: '🛡️',
    atmosphere: 'Soldiers drill in the dust. The flag snaps in the wind.',
    availableActions: [],
    availableCrimes: [],
    jobs: [
      {
        id: 'perimeter-check',
        name: 'Perimeter Check',
        description: 'Patrol the perimeter and ensure no bandits are lurking.',
        energyCost: 10,
        cooldownMinutes: 5,
        rewards: { goldMin: 10, goldMax: 15, xp: 25 },
        requirements: { minLevel: 1 }
      }
    ],
    shops: [],
    npcs: [],
    connections: [
      { targetLocationId: '6501a0000000000000000001', travelTime: 0, energyCost: 3, description: 'Back to Red Gulch' },
      { targetLocationId: '6501a0000000000000000010', travelTime: 0, energyCost: 5, description: 'To the Abandoned Mine' }
    ],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 100, nahiCoalition: 0, frontera: 0 },
    isUnlocked: true,
    isHidden: false
  },
  {
    _id: new mongoose.Types.ObjectId('6501a0000000000000000021'),
    name: 'Sacred Springs',
    description: 'A hidden spring sacred to the Nahi Coalition, where initiates prove their commitment to protecting the land.',
    shortDescription: 'Sacred initiation site',
    type: 'sacred_site',
    region: 'sacred_lands',
    zone: ZONES.COALITION_LANDS,
    isZoneHub: false,
    icon: '🪶',
    atmosphere: 'The air is thick with ancient power. Prayer offerings flutter from nearby branches. The spring waters shimmer with an otherworldly light.',
    availableActions: [],
    availableCrimes: [],
    jobs: [
      {
        id: 'scout-intruders',
        name: 'Scout Intruders',
        description: 'Look for signs of trespassing settlers near the sacred waters.',
        energyCost: 10,
        cooldownMinutes: 5,
        rewards: { goldMin: 10, goldMax: 15, xp: 25 },
        requirements: { minLevel: 1 }
      }
    ],
    shops: [],
    npcs: [],
    connections: [
      { targetLocationId: '6501a0000000000000000004', travelTime: 0, energyCost: 3, description: 'Back to Kaiowa Mesa' }
    ],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 100, frontera: 0 },
    isUnlocked: true,
    isHidden: false
  },
  {
    _id: new mongoose.Types.ObjectId('6501a0000000000000000022'),
    name: 'Smuggler\'s Den',
    description: 'A hidden cave system used by the Frontera for illicit storage.',
    shortDescription: 'Hidden cave entrance',
    type: 'hideout',
    region: 'frontier',
    zone: ZONES.OUTLAW_TERRITORY,
    isZoneHub: false,
    icon: '📦',
    atmosphere: 'Shadows stretch long here. Eyes watch you from the darkness.',
    availableActions: [],
    availableCrimes: [],
    jobs: [
      {
        id: 'smuggle-goods',
        name: 'Smuggle Goods',
        description: 'Move a package from the entrance to the inner vault unnoticed.',
        energyCost: 10,
        cooldownMinutes: 5,
        rewards: { goldMin: 15, goldMax: 25, xp: 25 },
        requirements: { minLevel: 1 }
      }
    ],
    shops: [],
    npcs: [],
    connections: [
      { targetLocationId: '6501a0000000000000000002', travelTime: 0, energyCost: 3, description: 'Back to The Frontera' }
    ],
    dangerLevel: 3,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 0, frontera: 100 },
    isUnlocked: true,
    isHidden: false
  }
];
