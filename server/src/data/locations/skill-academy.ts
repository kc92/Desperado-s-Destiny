/**
 * Skill Academy Location
 *
 * The Desperados Academy - where all 30 skills are taught through optional tutorial quests.
 * Located in Red Gulch, accessible to all players from the start.
 */

import mongoose from 'mongoose';
import { ILocation } from '../../models/Location.model';
import { ZONES, CraftingFacilityType } from '@desperados/shared';
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
  // Complete set of training facilities - one of each type at tier 2
  craftingFacilities: [
    // Blacksmithing
    { type: CraftingFacilityType.FORGE, tier: 2 as const, name: "Training Forge" },
    { type: CraftingFacilityType.ANVIL, tier: 2 as const, name: "Practice Anvil" },
    { type: CraftingFacilityType.QUENCH_TANK, tier: 2 as const, name: "Training Quench Tank" },
    // Leatherworking
    { type: CraftingFacilityType.TANNING_RACK, tier: 2 as const, name: "Practice Tanning Rack" },
    { type: CraftingFacilityType.LEATHER_WORKBENCH, tier: 2 as const, name: "Leather Training Bench" },
    { type: CraftingFacilityType.DYE_VAT, tier: 2 as const, name: "Practice Dye Vat" },
    // Alchemy
    { type: CraftingFacilityType.DISTILLERY, tier: 2 as const, name: "Student Still" },
    { type: CraftingFacilityType.CAULDRON, tier: 2 as const, name: "Practice Cauldron" },
    { type: CraftingFacilityType.STORAGE_RACKS, tier: 2 as const, name: "Herb Storage" },
    // Cooking
    { type: CraftingFacilityType.STOVE, tier: 2 as const, name: "Training Kitchen" },
    { type: CraftingFacilityType.SMOKER, tier: 2 as const, name: "Practice Smoker" },
    { type: CraftingFacilityType.ICE_BOX, tier: 2 as const, name: "Academy Ice Box" },
    // Tailoring
    { type: CraftingFacilityType.LOOM, tier: 2 as const, name: "Student Loom" },
    { type: CraftingFacilityType.SEWING_TABLE, tier: 2 as const, name: "Practice Sewing Station" },
    { type: CraftingFacilityType.MANNEQUIN, tier: 2 as const, name: "Fitting Mannequin" },
    // Gunsmithing
    { type: CraftingFacilityType.GUN_LATHE, tier: 2 as const, name: "Training Gun Lathe" },
    { type: CraftingFacilityType.POWDER_PRESS, tier: 2 as const, name: "Practice Powder Press" },
    { type: CraftingFacilityType.TEST_RANGE, tier: 2 as const, name: "Academy Test Range" },
    // Native Crafts
    { type: CraftingFacilityType.MEDICINE_LODGE, tier: 2 as const, name: "Spirit Learning Lodge" },
    { type: CraftingFacilityType.CRAFT_CIRCLE, tier: 2 as const, name: "Traditional Craft Circle" },
    { type: CraftingFacilityType.SACRED_FIRE, tier: 2 as const, name: "Ceremonial Teaching Fire" },
    // Prospecting
    { type: CraftingFacilityType.ASSAY_TABLE, tier: 2 as const, name: "Training Assay Station" },
    { type: CraftingFacilityType.ORE_REFINERY, tier: 2 as const, name: "Practice Refinery" },
    { type: CraftingFacilityType.BLAST_FURNACE, tier: 2 as const, name: "Training Furnace" },
    // Woodworking
    { type: CraftingFacilityType.WOODWORKING_BENCH, tier: 2 as const, name: "Carpentry Training Bench" },
    { type: CraftingFacilityType.WOOD_LATHE, tier: 2 as const, name: "Practice Wood Lathe" },
    { type: CraftingFacilityType.SAWMILL, tier: 2 as const, name: "Training Sawmill" },
    // Trapping
    { type: CraftingFacilityType.SKINNING_RACK, tier: 2 as const, name: "Practice Skinning Station" },
    { type: CraftingFacilityType.TAXIDERMY_STAND, tier: 2 as const, name: "Training Taxidermy Stand" },
    { type: CraftingFacilityType.BAIT_STATION, tier: 2 as const, name: "Bait Crafting Station" },
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
    // Training objects for skill academy quests
    {
      id: 'training-dummy',
      name: 'Training Dummy',
      title: 'Combat Training Target',
      description:
        'A well-worn wooden dummy stuffed with straw, covered in punch marks and sword cuts. Perfect for practicing combat basics without risk of injury.',
      personality: 'Silent and patient. Takes a beating without complaint.',
      faction: undefined,
      dialogue: ['*The dummy stands motionless, ready for another round of practice.*'],
      isVendor: false,
      defaultTrust: 100,
    },
    {
      id: 'hidden-training-target',
      name: 'Hidden Target',
      title: 'Tracking Practice',
      description:
        'A cleverly concealed target used to practice tracking and observation skills. The marks are subtle - only a keen eye will spot them.',
      personality: 'Elusive and challenging.',
      faction: undefined,
      dialogue: ['*You scan the area carefully, looking for the hidden markers.*'],
      isVendor: false,
      defaultTrust: 100,
    },
    {
      id: 'practice-mark',
      name: 'Practice Mannequin',
      title: 'Pickpocket Training',
      description:
        'A mannequin dressed in various outfits with hidden pockets of different difficulties. Bells are attached to alert you if your fingers are too clumsy.',
      personality: 'Wears its valuables with tempting carelessness.',
      faction: undefined,
      dialogue: ['*The mannequin stands with pockets bulging invitingly.*'],
      isVendor: false,
      defaultTrust: 100,
    },
    {
      id: 'practice-skeptic',
      name: 'Stubborn Sam',
      title: 'Persuasion Practice',
      description:
        'An academy volunteer who plays the role of a stubborn skeptic. His job is to be unconvinced until you master the art of persuasion.',
      personality: 'Deliberately obstinate but fair. Grudgingly acknowledges good arguments.',
      faction: undefined,
      dialogue: [
        "I don't believe you.",
        "That's not very convincing.",
        "Hmm... you almost had me there.",
        "Alright, you've made your point. Well done!",
      ],
      isVendor: false,
      defaultTrust: 50,
    },
    {
      id: 'wild-training-animal',
      name: 'Dusty the Mustang',
      title: 'Training Animal',
      description:
        'A spirited but gentle mustang used for animal handling practice. Dusty has a wild streak but responds well to those who show patience and understanding.',
      personality: 'Skittish at first, loyal once trust is earned.',
      faction: undefined,
      dialogue: [
        '*Dusty eyes you warily, ears flicking back.*',
        '*Dusty snorts and stamps a hoof.*',
        '*Dusty nuzzles your hand gently.*',
      ],
      isVendor: false,
      defaultTrust: 30,
    },
    {
      id: 'practice-followers',
      name: 'Academy Volunteers',
      title: 'Leadership Training Group',
      description:
        'A group of academy students who volunteer to be led for leadership practice. They follow instructions... eventually.',
      personality: 'Eager to help but easily distracted. Respond well to clear, confident direction.',
      faction: undefined,
      dialogue: [
        "What should we do, boss?",
        "We're with you!",
        "Lead the way!",
      ],
      isVendor: false,
      defaultTrust: 60,
    },
    {
      id: 'practice-audience',
      name: 'Academy Crowd',
      title: 'Performance Audience',
      description:
        'A small but attentive audience of academy members who gather to watch performance practice. They provide honest feedback.',
      personality: 'Supportive but discerning. Genuine applause must be earned.',
      faction: undefined,
      dialogue: [
        '*The crowd watches expectantly.*',
        '*Scattered applause.*',
        '*Enthusiastic cheers!*',
        '*A standing ovation!*',
      ],
      isVendor: false,
      defaultTrust: 50,
    },
  ],
  connections: [
    {
      targetLocationId: '6501a0000000000000000001', // Red Gulch
      travelTime: 0,
      energyCost: 2,
      description: 'Back to Red Gulch',
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
