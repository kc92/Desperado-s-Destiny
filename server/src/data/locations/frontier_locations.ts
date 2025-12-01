/**
 * Locations for The Frontier
 */

import mongoose from 'mongoose';
import { ILocation } from '../../models/Location.model';
import { LocationType, RegionType } from '@desperados/shared';

export const frontierLocations: Partial<ILocation>[] = [
  {
    _id: new mongoose.Types.ObjectId('6501a0000000000000000010'),
    name: 'Abandoned Mine',
    description: 'An old, played-out silver mine. The company moved on long ago, but there might still be some iron ore left for a persistent prospector.',
    shortDescription: 'A played-out silver mine',
    type: 'mine',
    region: 'frontier',
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
        rewards: { goldMin: 2, goldMax: 8, xp: 15, items: ['iron-ore'] },
        requirements: { minLevel: 1 }
      }
    ],
    shops: [],
    npcs: [],
    connections: [],
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
    icon: ' crossroads',
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
    icon: ' ~',
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
  }
];
