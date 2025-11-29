/**
 * Workshop Data Export Index
 * Phase 7, Wave 7.2 - Desperados Destiny
 *
 * Central export point for all workshop-related data
 */

// Export all workshop buildings
export {
  ALL_WORKSHOPS,
  HANKS_FORGE,
  RED_GULCH_TANNERY,
  DOCS_APOTHECARY,
  DUSTY_SALOON_KITCHEN,
  GENERAL_STORE_TAILORING,
  RED_GULCH_ARMORY,
  EL_HERRERO,
  POISON_KITCHEN,
  BLACK_MARKET_GUNS,
  ARMY_FORGE,
  QUARTERMASTER_TAILORING,
  FORT_ARMORY_WORKSHOP,
  GILDED_NEEDLE,
  MADAME_WU_REMEDIES,
  GRAND_HOTEL_KITCHEN,
  SACRED_TANNING_GROUNDS,
  MEDICINE_LODGE,
  HEALING_WATERS_APOTHECARY,
  RANCH_TANNERY,
  CHUCK_WAGON_KITCHEN,
  MINE_FORGE,
  getWorkshop,
  getWorkshopsByLocation,
  getWorkshopsByProfession,
  getWorkshopsByTier
} from './workshopBuildings';

// Export all workshop NPCs
export {
  ALL_WORKSHOP_NPCS,
  // Red Gulch NPCs
  HANK_IRONSIDE,
  JIMMY_APPRENTICE,
  SARAH_TANNER,
  OLD_PETE,
  DOC_HOLLIDAY,
  NURSE_MARIA,
  DUSTY_BARKEEP,
  CONSUELA_COOK,
  MRS_PATTERSON,
  EMILY_SEAMSTRESS,
  GUNSMITH_COLE,
  DEPUTY_JACKSON,
  // The Frontera NPCs
  RODRIGO_HERRERO,
  SILENT_MIGUEL,
  WIDOW_BLACKWOOD,
  SILENT_SERVANT,
  ONE_EYED_JACK,
  THE_TINKERER,
  // Fort Ashford NPCs
  SERGEANT_MCALLISTER,
  CORPORAL_HUGHES,
  QUARTERMASTER_JENKINS,
  SEAMSTRESS_MOLLY,
  MASTER_GUNSMITH_WYATT,
  LIEUTENANT_FIREARMS,
  // Whiskey Bend NPCs
  MADAME_DUBOIS,
  SEAMSTRESS_VIVIAN,
  MADAME_WU,
  ASSISTANT_MEI,
  CHEF_BEAUMONT,
  SOUS_CHEF_ANTONIO,
  // Coalition NPCs
  ELDER_STANDING_BEAR,
  GRAY_DOVE,
  MEDICINE_WOMAN_WHITE_CLOUD,
  APPRENTICE_TWO_HAWKS,
  GRANDMOTHER_EAGLE_SONG,
  HEALER_RUNNING_STREAM,
  // Longhorn Ranch NPCs
  MASTER_TANNER_CRUZ,
  HIDE_BUYER_JACKSON,
  SADDLE_MAKER_TOM,
  COOKIE_MCCORMICK,
  DISHWASHER_TIMMY,
  // Goldfinger's Mine NPCs
  BLACKSMITH_KLAUS,
  ORE_HAULER_BIG_MIKE,
  // Utility functions
  getNPC,
  getNPCsByRole,
  getTrainersByProfession
} from './workshopNPCs';

// Re-export types
export type {
  WorkshopBuilding,
  WorkshopFacility,
  WorkshopNPC,
  NPCDialogue,
  NPCService,
  WorkshopAccessRequest,
  WorkshopAccessResponse,
  ActiveWorkshopSession,
  WorkshopEvent,
  FacilityBonus,
  AccessRequirement,
  OperatingHours,
  MembershipOption
} from '@desperados/shared';

export { GameLocation, LOCATION_NAMES } from '@desperados/shared';
