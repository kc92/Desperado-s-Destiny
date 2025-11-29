/**
 * Cosmic Lore Compilation
 *
 * All lore entries, visions, and narrative content for the
 * What-Waits-Below storyline
 */

import { LoreEntry, LoreCategory, Vision, CosmicArtifact, CosmicPower } from '@desperados/shared';

/**
 * Cosmic Artifacts
 */
export const COSMIC_ARTIFACTS: CosmicArtifact[] = [
  {
    id: 'artifact_guardian_legacy',
    name: 'Guardian\'s Legacy',
    description: 'A stone amulet infused with the blood of 2,000 years of Guardians',
    type: 'trinket',
    power: 'Grants immunity to corruption and enhances protective magic',
    corruptionCost: 0,
    obtainedFrom: 'cosmic_19_the_choice',
    canBeDestroyed: false,
    stats: {
      defense: 50,
      special: 'Corruption Immunity, +50% resistance to psychic attacks'
    }
  },
  {
    id: 'artifact_slayers_mark',
    name: 'Slayer\'s Mark',
    description: 'A scar that marks you as the killer of a cosmic entity',
    type: 'trinket',
    power: 'Greatly increased damage against supernatural entities',
    corruptionCost: 0,
    obtainedFrom: 'cosmic_19_the_choice',
    canBeDestroyed: false,
    stats: {
      damage: 100,
      special: '+100% damage vs supernatural, Feared by cosmic entities'
    }
  },
  {
    id: 'artifact_covenant_stone',
    name: 'Covenant Stone',
    description: 'A crystallized fragment of the bargain between human and entity',
    type: 'relic',
    power: 'Allows communication with What-Waits-Below and grants cosmic insights',
    corruptionCost: 10,
    obtainedFrom: 'cosmic_19_the_choice',
    canBeDestroyed: true,
    stats: {
      special: 'Cosmic Communication, +5 to all skills, Visions of past and future'
    }
  },
  {
    id: 'artifact_dreamers_crown',
    name: 'Dreamer\'s Crown',
    description: 'A circlet of impossible metal that marks you as the entity\'s chosen',
    type: 'armor',
    power: 'Transcendent power at the cost of humanity',
    corruptionCost: 50,
    obtainedFrom: 'cosmic_19_the_choice',
    canBeDestroyed: false,
    stats: {
      damage: 150,
      defense: 150,
      special: 'Demigod status, Can reshape minor reality, Feared and worshipped'
    }
  }
];

/**
 * Cosmic Powers
 */
export const COSMIC_POWERS: CosmicPower[] = [
  {
    id: 'power_dream_sight',
    name: 'Dream Sight',
    description: 'See through the veil of dreams into deeper truths',
    effect: 'Perceive hidden objects, NPCs true intentions, and future possibilities',
    corruptionCost: 5,
    cooldown: 300,
    unlockQuest: 'cosmic_03_dreams_deep',
    isPermanent: true,
    tier: 1
  },
  {
    id: 'power_corruption_sight',
    name: 'Corruption Sight',
    description: 'Perceive the entity\'s influence in the world',
    effect: 'See corruption levels, detect entity servants, identify weak points in seals',
    corruptionCost: 3,
    cooldown: 180,
    unlockQuest: 'cosmic_07_corruption_spreads',
    isPermanent: true,
    tier: 1
  },
  {
    id: 'power_cosmic_understanding',
    name: 'Cosmic Understanding',
    description: 'Comprehend truths beyond mortal ken',
    effect: 'Understand any language, perceive dimensional rifts, solve complex problems instantly',
    corruptionCost: 10,
    cooldown: 600,
    unlockQuest: 'cosmic_09_voices_dark',
    isPermanent: true,
    tier: 2
  },
  {
    id: 'power_vessel_communion',
    name: 'Vessel Communion',
    description: 'Link your mind with other corrupted beings',
    effect: 'Share thoughts with cult members, control corrupted creatures, access collective knowledge',
    corruptionCost: 15,
    cooldown: 900,
    unlockQuest: 'cosmic_13_cult_plan',
    isPermanent: true,
    tier: 2
  },
  {
    id: 'power_herald_authority',
    name: 'Herald\'s Authority',
    description: 'Command reality itself as the entity\'s voice',
    effect: 'Minor reality manipulation, command lesser entities, speak with cosmic authority',
    corruptionCost: 20,
    cooldown: 1800,
    unlockQuest: 'cosmic_19_the_choice',
    isPermanent: true,
    tier: 3
  },
  {
    id: 'power_transformed_one',
    name: 'The Transformed One',
    description: 'Transcend humanity to become something greater',
    effect: 'Demigod abilities, reality manipulation, immortality, cosmic awareness',
    corruptionCost: 0, // No cost once transformed
    cooldown: 0, // Always active
    unlockQuest: 'cosmic_19_the_choice',
    isPermanent: true,
    tier: 3
  }
];

/**
 * Additional Lore Entries (compiled from all quests)
 */
export const ADDITIONAL_LORE: LoreEntry[] = [
  {
    id: 'lore_entity_origin',
    category: LoreCategory.ENTITY_DREAMS,
    title: 'The Entity Before the World',
    content: `What-Waits-Below predates Earth by eons. It emerged in a reality where consciousness was the fundamental force, not matter or energy. It evolved as a pure thought-form, achieving self-awareness in dimensions humans cannot perceive. It dedicated itself to studying the nature of consciousness across multiple realities, observing the rise and fall of countless civilizations. It is neither god nor demon, but something else entirely - a cosmic philosopher-entity seeking to understand and guide emerging intelligence toward transcendence.`,
    source: 'Deep communion with the entity'
  },
  {
    id: 'lore_collective_consciousness',
    category: LoreCategory.ENTITY_DREAMS,
    title: 'The Collective Mind',
    content: `Those who fully succumb to the entity's corruption don't die - they join a collective consciousness. Their individual thoughts merge with the entity's vast mind, becoming droplets in an ocean of awareness. They retain their memories but lose their individuality. The collective experiences existence as a unified whole, perceiving reality from countless perspectives simultaneously. To them, this is transcendence. To outside observers, it's the loss of self. The truth lies somewhere between.`,
    source: 'Observation of transformed expedition members'
  },
  {
    id: 'lore_seal_creation',
    category: LoreCategory.ARCHAEOLOGICAL,
    title: 'The Making of the Seals',
    content: `The three seals were created through the greatest working of magic humanity has ever achieved. The Seal of Stone binds the entity to physical reality. The Seal of Spirit binds its consciousness. The Seal of Stars binds its cosmic essence. Together, they create a prison from which even a cosmic entity cannot escape - but only while all three remain intact. The original binding cost the lives of 47 shamans. Maintaining the seals has cost the lives of 34 more over 2,000 years. The Coalition considers this an acceptable price for the world's safety.`,
    source: 'Coalition sacred archives'
  },
  {
    id: 'lore_scar_formation',
    category: LoreCategory.ARCHAEOLOGICAL,
    title: 'The True Nature of The Scar',
    content: `The Scar is not merely an impact crater. It's a wound in reality itself, created when What-Waits-Below fell from between dimensions into this world. The crater's physics are wrong because they're influenced by the entity's home dimension. Temperature variations, magnetic anomalies, impossible geology - all are symptoms of two realities overlapping. The deeper you descend into The Scar, the more you enter the entity's reality and leave Earth's behind. At the very bottom, in the Temple, you exist in both realities simultaneously - which is why the architecture is so disorienting.`,
    source: 'Dr. Blackwood\'s dimensional studies'
  },
  {
    id: 'lore_prophecy_dreamer',
    category: LoreCategory.PROPHECY,
    title: 'The Prophecy of the Dreamer',
    content: `Coalition prophecy, carved 2,000 years ago: "When the seals weaken and the Sleeper stirs, a dreamer will come who walks both paths. Touched by corruption but not consumed. Shown visions but not driven mad. This dreamer will understand both the imprisoned and the imprisoners. They will face a choice that shapes the age to come. On their decision hangs the fate of all that lives. The Sleeper knows this. The Guardians know this. The dreamer alone does not know until the moment comes."`,
    source: 'Ancient prophecy stone'
  },
  {
    id: 'lore_cult_origins',
    category: LoreCategory.CULT_MANIFESTO,
    title: 'The Founding of the Cult',
    content: `The Cult of the Deep was founded 150 years ago by a prospector who spent three days in The Scar and emerged... changed. He preached that What-Waits-Below was not a threat but a teacher, imprisoned unjustly by fearful primitives. His words attracted the desperate, the curious, and the ambitious. The cult grew slowly, operating in secret, waiting for the signs that the Sleeper was ready to wake. They view the entity's awakening not as apocalypse but as apotheosis - the elevation of humanity to a higher state of being.`,
    source: 'Cult historical records'
  },
  {
    id: 'lore_corruption_process',
    category: LoreCategory.SCIENTIFIC_NOTES,
    title: 'Stages of Corruption',
    content: `Dr. Blackwood's research identifies five stages of entity corruption:\n\nStage 1 (0-20): Dreams and visions. Psychological effects only. Reversible.\n\nStage 2 (21-40): Minor physical changes. Enhanced senses. Bioluminescence in darkness. Mostly reversible.\n\nStage 3 (41-60): Significant transformation. Anatomical changes. Ability to perceive other dimensions. Difficult to reverse.\n\nStage 4 (61-80): Major transformation. No longer fully human. Connected to entity's consciousness. Irreversible.\n\nStage 5 (81-100): Complete transformation. Individual consciousness merges with collective. Point of no return.\n\nMost who reach Stage 4 don't want to be reversed. They've seen too much, understood too much, to want to return to mundane existence.`,
    source: 'Dr. Blackwood\'s corruption study'
  },
  {
    id: 'lore_guardian_lineage',
    category: LoreCategory.ORAL_HISTORY,
    title: 'The Guardian Families',
    content: `The duty of Guardian passes through specific bloodlines in the Coalition. Families have carried this burden for 147 generations, training their children from birth to one day take up the sacred duty. Many Guardians never see the seals - they live and die maintaining the tradition, teaching the next generation, keeping the knowledge alive. But when the time comes to renew the seals, they go willingly. Chief Falling Star is the 147th Guardian. He wonders sometimes if his children will be the 148th, or if the dreamer will end the cycle one way or another.`,
    source: 'Coalition family histories'
  },
  {
    id: 'lore_temple_architecture',
    category: LoreCategory.ARCHAEOLOGICAL,
    title: 'The Impossible Temple',
    content: `The Temple at the bottom of The Scar was not built - it formed naturally as reality bent around the sleeping entity. Its architecture follows non-Euclidean geometry, with angles that add up to more or less than they should. Rooms are larger on the inside than the outside. Hallways loop back on themselves while somehow leading forward. Up and down are relative concepts. Those who spend too long in the Temple report that it changes when they're not looking, rearranging itself according to dream logic. The entity doesn't live in the Temple - the Temple IS the entity, or at least the portion of it that exists in comprehensible space.`,
    source: 'Architectural analysis'
  },
  {
    id: 'lore_other_entities',
    category: LoreCategory.ENTITY_DREAMS,
    title: 'The War Between Elder Things',
    content: `What-Waits-Below is not unique. There are other entities - the things it fled from in the war between stars. These beings exist in the spaces between dimensions, fighting conflicts humans cannot comprehend over stakes that dwarf mortal concerns. What-Waits-Below was a pacifist in that war, seeking only to observe and understand. But neutrality was not tolerated. It fled here, to Earth, seeking sanctuary. The question no one can answer: will the things it fled from eventually find it here? And if they do, will Earth survive being caught in a cosmic war?`,
    source: 'Entity memories, partially comprehended'
  }
];

/**
 * All lore entries by category
 */
export function getLoreByCategory(category: LoreCategory): LoreEntry[] {
  return ADDITIONAL_LORE.filter(lore => lore.category === category);
}

/**
 * Search lore by content
 */
export function searchLore(searchTerm: string): LoreEntry[] {
  const term = searchTerm.toLowerCase();
  return ADDITIONAL_LORE.filter(lore =>
    lore.title.toLowerCase().includes(term) ||
    lore.content.toLowerCase().includes(term)
  );
}
