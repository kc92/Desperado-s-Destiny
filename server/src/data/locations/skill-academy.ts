/**
 * Skill Academy Location
 *
 * The Desperados Academy - where all 26 skills are taught through optional tutorial quests.
 * Located in Red Gulch, accessible to all players from the start.
 */

import mongoose from 'mongoose';
import { ILocation } from '../../models/Location.model';
import { ZONES } from '@desperados/shared';
import {
  IRON_JACK_THORNWOOD,
  SILK_VIOLA_MARCHETTI,
  WALKING_MOON,
  AUGUSTUS_HORNSBY,
} from '../npcs/academy-mentors';

/**
 * The Desperados Academy
 *
 * A converted frontier warehouse at the edge of Red Gulch, expanded with several attached
 * buildings. The main structure is weathered wood with a large sign reading
 * "DESPERADOS ACADEMY - Skills for Survival".
 */
export const DESPERADOS_ACADEMY: Partial<ILocation> = {
  _id: new mongoose.Types.ObjectId('6601a0000000000000000001'),
  name: 'Desperados Academy',
  description:
    'A converted frontier warehouse expanded into a full training complex. Smoke rises from the workshop chimney, the sound of sparring echoes from the combat yard, and strange smells waft from the alchemy corner. Here, four legendary masters teach the skills needed to survive in the Wild West.',
  shortDescription: 'Where masters teach the skills of survival',
  type: 'skill_academy',
  region: 'town',
  zone: ZONES.SETTLER_TERRITORY,
  isZoneHub: false,
  tier: 3,
  dominantFaction: 'neutral',
  icon: '🎓',
  atmosphere:
    'The Desperados Academy buzzes with activity. Apprentice gunslingers practice their quick-draw, craftsmen hammer at hot iron, and somewhere a shaman drum beats rhythmically. This is where the West\'s future masters are born.',
  operatingHours: {
    open: 6,
    close: 22,
  },
  availableActions: [
    'view-skill-tutorials',
    'talk-to-mentor',
    'check-progress',
  ],
  availableCrimes: [], // No crimes at the academy
  jobs: [
    {
      id: 'academy-assistant',
      name: 'Academy Assistant',
      description:
        'Help the masters prepare training materials and maintain equipment.',
      energyCost: 10,
      cooldownMinutes: 30,
      jobCategory: 'skilled',
      rewards: {
        goldMin: 15,
        goldMax: 25,
        xp: 20,
      },
      requirements: {
        minLevel: 1,
      },
    },
    {
      id: 'training-dummy-repair',
      name: 'Repair Training Dummies',
      description:
        "The combat yard's training dummies take a beating. Someone needs to patch them up.",
      energyCost: 15,
      cooldownMinutes: 45,
      jobCategory: 'labor',
      rewards: {
        goldMin: 20,
        goldMax: 35,
        xp: 25,
      },
      requirements: {
        minLevel: 1,
      },
    },
  ],
  shops: [
    {
      id: 'academy-supply-shop',
      name: 'Academy Supplies',
      description:
        'Basic training materials and starter equipment for aspiring students.',
      shopType: 'general',
      items: [
        {
          itemId: 'practice-sword',
          name: 'Practice Sword',
          description: 'A wooden training sword. Safe but effective for learning.',
          price: 25,
          requiredLevel: 1,
        },
        {
          itemId: 'lockpick-training-set',
          name: 'Lockpick Training Set',
          description: 'A set of practice locks and picks for aspiring locksmiths.',
          price: 30,
          requiredLevel: 1,
        },
        {
          itemId: 'herb-identification-guide',
          name: 'Herb Identification Guide',
          description: 'A field guide to medicinal and alchemical plants.',
          price: 20,
          requiredLevel: 1,
        },
        {
          itemId: 'apprentice-toolkit',
          name: 'Apprentice Toolkit',
          description: 'Basic tools for crafting and repairs.',
          price: 40,
          requiredLevel: 1,
        },
      ],
      buyMultiplier: 0.4,
    },
  ],
  npcs: [
    IRON_JACK_THORNWOOD,
    SILK_VIOLA_MARCHETTI,
    WALKING_MOON,
    AUGUSTUS_HORNSBY,
    {
      id: 'academy-receptionist',
      name: 'Clara Pemberton',
      title: 'Academy Receptionist',
      description:
        'A cheerful young woman who keeps the academy running smoothly. She knows everyone\'s schedule and can direct you to the right master.',
      personality:
        'Efficient, friendly, and surprisingly organized for a frontier establishment.',
      faction: undefined,
      dialogue: [
        'Welcome to the Desperados Academy! Are you here to learn a new skill?',
        'Each of our masters specializes in a different area. Just let me know what interests you.',
        'Combat is with Jack in the yard. Cunning with Viola in the back room. Spirit with Walking Moon at the sacred circle. Craft with Gus in the workshop.',
        'No appointment needed - just walk up and introduce yourself!',
      ],
      isVendor: false,
    },
  ],
  connections: [
    {
      targetLocationId: 'red-gulch-town-square',
      travelTime: 60, // 1 minute
      energyCost: 0,
      description: 'Walk to the town square',
    },
  ],
  dangerLevel: 1, // Very safe
  factionInfluence: {
    settlerAlliance: 33,
    nahiCoalition: 33,
    frontera: 34,
  },
  isUnlocked: true,
  isHidden: false,
};

/**
 * All academy locations (for seeding)
 */
export const academyLocations: Partial<ILocation>[] = [DESPERADOS_ACADEMY];
