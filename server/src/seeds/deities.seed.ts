/**
 * Deity Seed Data
 *
 * Seeds the two hidden deities that watch over players:
 * - The Gambler (ORDER archetype) - Values honor, justice, fate, fair play
 * - The Outlaw King (CHAOS archetype) - Values freedom, survival, chaos, rebellion
 *
 * These entities never reveal their true nature directly. They influence
 * through dreams, omens, whispers, and disguised encounters.
 */

import { DeityAgent } from '../models/DeityAgent.model';
import logger from '../utils/logger';

const DEITY_SEED_DATA = [
  {
    name: 'The Gambler',
    trueName: 'Fortuna Rex',
    archetype: 'ORDER' as const,
    dialogueStyle: 'gambler_cryptic',

    // NPC-like properties
    currentDisguise: null,
    mood: 'NEUTRAL' as const,

    // Character-like properties
    level: 1,
    experience: 0,
    stats: {
      influence: 70,    // Strong world manipulation
      patience: 80,     // Very patient, waits for right moment
      wrath: 40,        // Relatively merciful
      benevolence: 60   // Rewards the honorable
    },

    // Domains of power - what The Gambler cares about
    domains: [
      { name: 'fate', power: 90, playerAffinity: new Map() },
      { name: 'honor', power: 85, playerAffinity: new Map() },
      { name: 'justice', power: 75, playerAffinity: new Map() },
      { name: 'order', power: 80, playerAffinity: new Map() }
    ],

    // How The Gambler manifests
    manifestations: [
      {
        form: 'dream' as const,
        description: 'Cards and tables in moonlight, infinite poker games',
        lastUsed: null,
        cooldownHours: 24
      },
      {
        form: 'stranger' as const,
        description: 'Weathered card dealer, traveling preacher, well-dressed stranger',
        lastUsed: null,
        cooldownHours: 72
      },
      {
        form: 'omen' as const,
        description: 'Lucky/unlucky symbols - four-leaf clovers, black cats, falling cards',
        lastUsed: null,
        cooldownHours: 12
      },
      {
        form: 'whisper' as const,
        description: 'Voice like shuffling cards, wisdom about odds and fate',
        lastUsed: null,
        cooldownHours: 6
      },
      {
        form: 'phenomenon' as const,
        description: 'Dice landing impossibly, cards appearing in pockets',
        lastUsed: null,
        cooldownHours: 48
      }
    ],

    // Intervention settings
    lastGlobalIntervention: null,
    interventionCooldownHours: 168, // 1 week between major interventions

    // Player relationships (start empty)
    favoredCharacters: [],
    cursedCharacters: [],

    // World state
    currentPhase: 'WATCHING' as const,
    powerLevel: 75,

    // Statistics
    totalManifestations: 0,
    totalBlessingsGiven: 0,
    totalCursesGiven: 0
  },

  {
    name: 'The Outlaw King',
    trueName: 'Rex Chaos',
    archetype: 'CHAOS' as const,
    dialogueStyle: 'outlaw_wild',

    // NPC-like properties
    currentDisguise: null,
    mood: 'AMUSED' as const, // He finds mortals entertaining

    // Character-like properties
    level: 1,
    experience: 0,
    stats: {
      influence: 65,    // Moderate world manipulation
      patience: 30,     // Impulsive, acts quickly
      wrath: 80,        // Harsh punishments for the weak
      benevolence: 40   // Less generous with rewards
    },

    // Domains of power - what The Outlaw King cares about
    domains: [
      { name: 'chaos', power: 95, playerAffinity: new Map() },
      { name: 'freedom', power: 90, playerAffinity: new Map() },
      { name: 'survival', power: 80, playerAffinity: new Map() },
      { name: 'rebellion', power: 85, playerAffinity: new Map() }
    ],

    // How The Outlaw King manifests
    manifestations: [
      {
        form: 'dream' as const,
        description: 'Wild rides through fire, crowns of bullets, burning badges',
        lastUsed: null,
        cooldownHours: 24
      },
      {
        form: 'stranger' as const,
        description: 'Scarred outlaw, grinning desperado, wild-eyed prophet, laughing hangman',
        lastUsed: null,
        cooldownHours: 72
      },
      {
        form: 'animal' as const,
        description: 'Wild horses, crows, wolves, rattlesnakes',
        lastUsed: null,
        cooldownHours: 12
      },
      {
        form: 'whisper' as const,
        description: 'Voice like gunfire and laughter, mockery and encouragement',
        lastUsed: null,
        cooldownHours: 6
      },
      {
        form: 'phenomenon' as const,
        description: 'Lightning strikes, sudden fires, chains breaking, wanted posters appearing',
        lastUsed: null,
        cooldownHours: 48
      }
    ],

    // Intervention settings
    lastGlobalIntervention: null,
    interventionCooldownHours: 120, // 5 days - more impulsive than The Gambler

    // Player relationships (start empty)
    favoredCharacters: [],
    cursedCharacters: [],

    // World state
    currentPhase: 'WATCHING' as const,
    powerLevel: 70,

    // Statistics
    totalManifestations: 0,
    totalBlessingsGiven: 0,
    totalCursesGiven: 0
  }
];

/**
 * Seed the deity agents
 */
export async function seedDeities(): Promise<void> {
  try {
    const existingCount = await DeityAgent.countDocuments();

    if (existingCount >= 2) {
      logger.info('Deities already seeded. Checking for updates...');

      // Update existing deities if needed
      for (const deityData of DEITY_SEED_DATA) {
        const existing = await DeityAgent.findOne({ name: deityData.name });
        if (existing) {
          // Only update non-runtime fields (don't overwrite stats, relationships, etc.)
          existing.trueName = deityData.trueName;
          existing.dialogueStyle = deityData.dialogueStyle;
          // Update manifestation descriptions but preserve lastUsed
          for (const newManif of deityData.manifestations) {
            const existingManif = existing.manifestations.find(m => m.form === newManif.form);
            if (existingManif) {
              existingManif.description = newManif.description;
              existingManif.cooldownHours = newManif.cooldownHours;
            } else {
              existing.manifestations.push(newManif);
            }
          }
          await existing.save();
          logger.debug(`Updated deity: ${deityData.name}`);
        }
      }
      return;
    }

    // Fresh seed
    await DeityAgent.insertMany(DEITY_SEED_DATA);
    logger.info(`Seeded ${DEITY_SEED_DATA.length} deity agents: The Gambler and The Outlaw King`);

  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      logger.warn('Some deities already existed, skipping duplicate entries.');
    } else {
      logger.error('Error seeding deities:', error);
      throw error;
    }
  }
}

/**
 * Clear all deity data (for testing only)
 */
export async function clearDeities(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot clear deities in production');
  }
  await DeityAgent.deleteMany({});
  logger.warn('Cleared all deity agents');
}

export default seedDeities;
