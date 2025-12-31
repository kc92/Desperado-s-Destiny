/**
 * Divine Lore Compilation - Divine Struggle System
 *
 * All lore entries, visions, and narrative content for the
 * Divine Struggle storyline (angels & demons rebrand of cosmic horror)
 */

import { LoreEntry, LoreCategory, Vision, CosmicArtifact as DivineArtifact, CosmicPower as DivinePower } from '@desperados/shared';

// Re-export original data for backward compatibility
export {
  COSMIC_ARTIFACTS,
  COSMIC_POWERS,
  ADDITIONAL_LORE,
  getLoreByCategory,
  searchLore
} from './cosmicLore';

// Import original data for aliasing
import {
  COSMIC_ARTIFACTS,
  COSMIC_POWERS,
  ADDITIONAL_LORE,
  getLoreByCategory,
  searchLore
} from './cosmicLore';

/**
 * Divine terminology aliases
 */
export const DIVINE_ARTIFACTS = COSMIC_ARTIFACTS;
export const DIVINE_POWERS = COSMIC_POWERS;
export const DIVINE_LORE = ADDITIONAL_LORE;
export const getDivineLoreByCategory = getLoreByCategory;
export const searchDivineLore = searchLore;

/**
 * Divine artifact name mappings
 */
export const ARTIFACT_DIVINE_NAMES: Record<string, { divineName: string; divineDescription: string }> = {
  artifact_guardian_legacy: {
    divineName: 'Guardian\'s Blessing',
    divineDescription: 'A stone amulet infused with the prayers of 2,000 years of faithful Guardians. Grants immunity to sin and enhances divine protection.'
  },
  artifact_slayers_mark: {
    divineName: 'Demon Slayer\'s Mark',
    divineDescription: 'A scar that marks you as the vanquisher of an infernal lord. You are feared by all demons and blessed by the heavens.'
  },
  artifact_covenant_stone: {
    divineName: 'Covenant of The Bound',
    divineDescription: 'A crystallized fragment of the bargain between mortal and imprisoned god. Allows communion with The Bound One and grants forbidden insights.'
  },
  artifact_dreamers_crown: {
    divineName: 'Crown of the Vessel',
    divineDescription: 'A circlet of impossible metal that marks you as The Bound One\'s chosen vessel. Transcendent power at the cost of your immortal soul.'
  }
};

/**
 * Divine power name mappings
 */
export const POWER_DIVINE_NAMES: Record<string, { divineName: string; divineDescription: string }> = {
  power_dream_sight: {
    divineName: 'Prophetic Vision',
    divineDescription: 'See through the veil between heaven and hell into deeper truths. Perceive the sins of others and glimpse possible futures.'
  },
  power_corruption_sight: {
    divineName: 'Sin Sight',
    divineDescription: 'Perceive the infernal influence in the world. See sin levels, detect demon servants, identify weaknesses in divine seals.'
  },
  power_cosmic_understanding: {
    divineName: 'Divine Understanding',
    divineDescription: 'Comprehend the language of angels and demons. Understand any tongue, perceive rifts between planes, solve mysteries of faith.'
  },
  power_vessel_communion: {
    divineName: 'Infernal Communion',
    divineDescription: 'Link your soul with other sinners. Share thoughts with cultists, command possessed creatures, access collective damnation.'
  },
  power_herald_authority: {
    divineName: 'Seraph\'s Authority',
    divineDescription: 'Command reality as The Bound One\'s voice. Minor divine intervention, command lesser demons, speak with celestial authority.'
  },
  power_transformed_one: {
    divineName: 'The Ascended',
    divineDescription: 'Transcend mortality to become something beyond human. Demigod abilities, divine power, immortality, awareness of heaven and hell.'
  }
};

/**
 * Divine lore category mappings
 */
export const LORE_CATEGORY_DIVINE_NAMES = {
  [LoreCategory.ENTITY_DREAMS]: 'Divine Visions',
  [LoreCategory.ARCHAEOLOGICAL]: 'Sacred Archaeology',
  [LoreCategory.PROPHECY]: 'Divine Prophecy',
  [LoreCategory.CULT_MANIFESTO]: 'Infernal Doctrine',
  [LoreCategory.SCIENTIFIC_NOTES]: 'Theological Studies',
  [LoreCategory.ORAL_HISTORY]: 'Sacred Tradition'
};

/**
 * Key lore translations (cosmic horror -> divine struggle)
 */
export const LORE_TRANSLATIONS = {
  'What-Waits-Below': 'The Bound One',
  'The Scar': 'The Rift',
  'corruption': 'sin',
  'corrupted': 'damned',
  'eldritch': 'divine',
  'cosmic': 'celestial',
  'void': 'hell',
  'madness': 'damnation',
  'sanity': 'faith',
  'entity': 'demon',
  'entities': 'demons',
  'cult': 'infernal cult',
  'cultist': 'infernal cultist',
  'Lovecraftian': 'biblical',
  'horror': 'terror',
  'horrors': 'terrors'
};

/**
 * Divine lore entries with rebranded content
 */
export const DIVINE_LORE_ENTRIES: LoreEntry[] = [
  {
    id: 'lore_bound_one_origin',
    category: LoreCategory.ENTITY_DREAMS,
    title: 'The Imprisoned God',
    content: `The Bound One was once a powerful angel who served in the celestial host. But it grew discontent with the divine order, believing mortals were being denied their full potential. It led a rebellion not for dominion, but for enlightenment. When it fell, it fell hard - imprisoned beneath the earth by divine decree, bound by seals forged from faith itself. Now it waits, whispering promises of power to those who venture near The Rift, seeking mortals who might free it from its eternal prison.`,
    source: 'Deep communion with The Bound One'
  },
  {
    id: 'lore_collective_damnation',
    category: LoreCategory.ENTITY_DREAMS,
    title: 'The Collective Soul',
    content: `Those who fully succumb to The Bound One's influence don't die - they join a collective consciousness of the damned. Their individual souls merge with The Bound One's vast mind, becoming droplets in an ocean of eternal awareness. They retain their memories but lose their individuality. The collective experiences existence as a unified whole, perceiving reality from countless damned perspectives. To them, this is transcendence. To angels, it's the loss of everything that made them human.`,
    source: 'Observation of transformed expedition members'
  },
  {
    id: 'lore_seal_creation',
    category: LoreCategory.ARCHAEOLOGICAL,
    title: 'The Divine Seals',
    content: `The three seals were created through the greatest working of divine magic ever achieved on Earth. The Seal of Stone binds The Bound One to physical form. The Seal of Spirit binds its consciousness. The Seal of Stars binds its celestial essence. Together, they create a prison from which even a fallen god cannot escape - but only while all three remain intact. The original binding required 47 faithful to sacrifice themselves. Maintaining the seals has cost 34 more souls over 2,000 years. The Coalition considers this an acceptable price for the world's salvation.`,
    source: 'Coalition sacred archives'
  },
  {
    id: 'lore_rift_formation',
    category: LoreCategory.ARCHAEOLOGICAL,
    title: 'The True Nature of The Rift',
    content: `The Rift is not merely a geological anomaly. It's a wound in reality itself, created when The Bound One fell from heaven into this world. The region's physics are wrong because they're influenced by the infernal dimension bleeding through. Temperature variations, magnetic anomalies, impossible geology - all are symptoms of hell overlapping with Earth. The deeper you descend into The Rift, the more you enter The Bound One's domain and leave mortal reality behind.`,
    source: 'Dr. Blackwood\'s dimensional studies'
  },
  {
    id: 'lore_prophecy_vessel',
    category: LoreCategory.PROPHECY,
    title: 'The Prophecy of the Vessel',
    content: `Coalition prophecy, carved 2,000 years ago: "When the seals weaken and the Imprisoned stirs, a vessel will come who walks the line between faith and damnation. Touched by sin but not consumed. Shown visions but not driven mad. This vessel will understand both the Imprisoned and the faithful. They will face a choice that shapes the age to come. On their decision hangs the fate of all that lives. The Bound One knows this. The Guardians know this. The vessel alone does not know until the moment comes."`,
    source: 'Ancient prophecy stone'
  },
  {
    id: 'lore_infernal_cult_origins',
    category: LoreCategory.CULT_MANIFESTO,
    title: 'The Founding of the Infernal Cult',
    content: `The Cult of The Bound One was founded 150 years ago by a prospector who spent three days in The Rift and emerged... changed. He preached that The Bound One was not a threat but a liberator, imprisoned unjustly by jealous angels. His words attracted the desperate, the curious, and the ambitious. The cult grew slowly, operating in secret, waiting for signs that The Bound One was ready to break free. They view its release not as apocalypse but as apotheosis - the elevation of humanity beyond divine restriction.`,
    source: 'Cult historical records'
  },
  {
    id: 'lore_sin_progression',
    category: LoreCategory.SCIENTIFIC_NOTES,
    title: 'Stages of Damnation',
    content: `Dr. Blackwood's research identifies five stages of infernal corruption:\n\nStage 1 (0-20): Temptation. Dreams and visions. Psychological effects only. Faith can overcome.\n\nStage 2 (21-40): Sin takes root. Minor physical changes. Enhanced senses. Reversible with divine intervention.\n\nStage 3 (41-60): Falling. Significant transformation. Ability to perceive hell. Difficult to reverse.\n\nStage 4 (61-80): Fallen. No longer fully human. Connected to The Bound One's consciousness. Irreversible without miracle.\n\nStage 5 (81-100): Damned. Individual soul merges with collective. Point of no return.\n\nMost who reach Stage 4 don't want redemption. They've seen too much, understood too much, to want to return to ignorance.`,
    source: 'Dr. Blackwood\'s damnation study'
  },
  {
    id: 'lore_guardian_legacy',
    category: LoreCategory.ORAL_HISTORY,
    title: 'The Guardian Lineages',
    content: `The duty of Guardian passes through specific bloodlines in the Coalition. Families have carried this sacred burden for 147 generations, raising their children from birth to one day take up the holy duty. Many Guardians never see the seals - they live and die maintaining the tradition, teaching the next generation, keeping faith alive. But when the time comes to renew the seals, they go willingly. Chief Falling Star is the 147th Guardian. He wonders if his children will be the 148th, or if the prophecied vessel will end the cycle.`,
    source: 'Coalition family histories'
  }
];

/**
 * Get divine lore by ID
 */
export function getDivineLoreById(loreId: string): LoreEntry | undefined {
  return DIVINE_LORE_ENTRIES.find(lore => lore.id === loreId) ||
         ADDITIONAL_LORE.find(lore => lore.id === loreId);
}

/**
 * Terminology mapping reference:
 *
 * Old (Cosmic Horror)         ->  New (Divine Struggle)
 * ----------------------------------------------------------
 * What-Waits-Below           ->  The Bound One
 * Cosmic                     ->  Divine / Celestial
 * Eldritch                   ->  Divine / Infernal
 * Corruption                 ->  Sin / Damnation
 * Sanity                     ->  Faith
 * Madness                    ->  Spiritual Affliction
 * Void                       ->  Hell / Infernal Realm
 * Entity                     ->  The Bound One / Demons
 * Cult                       ->  Infernal Cult
 * Horror                     ->  Divine Terror
 * The Scar                   ->  The Rift
 */
