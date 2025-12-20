/**
 * Hooks Barrel Export
 * Central export point for all custom hooks
 */

export { useGameTime } from './useGameTime';
export type { GameTimeState } from './useGameTime';

export { useMerchants } from './useMerchants';
export type {
  WanderingMerchant,
  MerchantItem,
  MerchantState,
  MerchantTrustInfo,
  UpcomingMerchant,
  RouteStop as MerchantRouteStop,
  TrustUnlock,
  ItemRarity,
  ItemType,
} from './useMerchants';

export { useEntertainers, PerformanceType } from './useEntertainers';
export { default as useEntertainersDefault } from './useEntertainers';
export type {
  Entertainer,
  Performance,
  TeachableSkill,
  EntertainerDialogue,
  EntertainerSchedule,
  PerformanceResult,
  SkillLearningResult,
  EntertainerRecommendation,
  SearchParams as EntertainerSearchParams,
  RouteStop as EntertainerRouteStop,
} from './useEntertainers';

export { useWorldBoss, BossPhase, BossDifficulty } from './useWorldBoss';
export { default as useWorldBossDefault } from './useWorldBoss';
export type {
  WorldBoss,
  BossStats,
  BossReward,
  BossStatus,
  LeaderboardEntry as BossLeaderboardEntry,
  ParticipantData as BossParticipantData,
  JoinBossResult,
  AttackResult as BossAttackResult,
  BossAvailability,
  BossEncounterSession,
  InitiateEncounterResult,
  EncounterAttackResult,
} from './useWorldBoss';

export { useProperties } from './useProperties';
export type { AvailableWorker, UpgradeOption } from './useProperties';

export { useNPCGangConflict } from './useNPCGangConflict';
export type {
  NPCGang,
  NPCGangRelationship,
  NPCGangMission,
  NPCGangTerritory,
  NPCGangLeader,
  NPCGangOverview,
  NPCGangStanding,
  MissionDifficulty,
  MissionStatus,
  ChallengePhase,
  TributeResult,
  ChallengeResult,
  BossFight,
  BossFightResult,
} from './useNPCGangConflict';

export { useMentors } from './useMentors';
export type {
  Mentor,
  MentorAbility,
  MentorRelationship,
  MentorSpecialization,
  MentorAvailability,
  TrainingType,
  AbilityStatus,
  TrainingSession,
  ActiveMentorship,
  MentorshipStats,
  TrainingResult,
  AbilityUseResult,
} from './useMentors';

export { useLoginRewards } from './useLoginRewards';
export type {
  RewardType,
  ItemRarity as LoginRewardItemRarity,
  RewardItem,
  DayRewardDefinition,
  CalendarDay,
  MonthlyBonus,
  LoginRewardStatus,
  CalendarResponse,
  ClaimResponse,
  LoginStatistics,
} from './useLoginRewards';

export { useDailyContracts } from './useDailyContracts';
export type {
  ContractType,
  ContractDifficulty,
  ContractStatus,
  ContractTarget,
  ContractRequirements,
  ContractRewards,
  Contract,
  TimeUntilReset,
  StreakInfo,
  DailyContractsData,
  CompletionResult,
  LeaderboardEntry,
} from './useDailyContracts';

export { useZodiac } from './useZodiac';
export { default as useZodiacDefault } from './useZodiac';

export { useMarketplace, MARKETPLACE_TAX_RATE, DURATION_HOURS } from './useMarketplace';
export type {
  ListingType,
  ListingStatus,
  ListingDuration,
  MarketCategory,
  ItemRarity as MarketItemRarity,
  SortOption,
  ItemEffect as MarketItemEffect,
  MarketItem,
  Bid,
  MarketListing,
  Category as MarketCategory_Category,
  PriceDataPoint,
  PriceHistory,
  Transaction as MarketTransaction,
  MarketFilters,
  CreateListingData,
  PaginationInfo,
  UseMarketplace,
} from './useMarketplace';

export { useCosmic } from './useCosmic';
export { default as useCosmicDefault } from './useCosmic';
export type {
  EndingType,
  CosmicObjective,
  CosmicChoice,
  CosmicQuest,
  CosmicProgress,
  CorruptionState,
  LoreEntry,
  Vision,
  EndingPrediction,
  EndingResult,
} from './useCosmic';

export { useSanity } from './useSanity';
export { default as useSanityDefault } from './useSanity';
export type {
  SanityLevel,
  SanityStatus,
  SanityCheckResult,
  Hallucination,
  Trauma,
  CorruptionStatus,
  RealityDistortion,
  SanityChangeResult,
  CorruptionGainResult,
} from './useSanity';

export { useRituals } from './useRituals';
export { default as useRitualsDefault } from './useRituals';
export type {
  RitualType,
  RitualStatus,
  RitualRequirement,
  RitualStep,
  RitualReward,
  RitualConsequence,
  Ritual,
  ActiveRitual,
  RitualStartResult,
  RitualCompleteResult,
  RitualCancelResult,
} from './useRituals';

export { useFishing } from './useFishing';
export { default as useFishingDefault } from './useFishing';
export type {
  SpotType,
  FishSize,
  FightPhase,
  FishingTimeOfDay,
  FishingWeather,
  FishingSetup,
  FishFightState,
  FishingSession,
  CaughtFish,
  FishingActionResult,
  StartFishingParams,
} from './useFishing';

export { useHunting } from './useHunting';
export { default as useHuntingDefault } from './useHunting';
export type {
  AnimalSpecies,
  HuntingWeapon,
  KillQuality,
  TrackFreshness,
  TrackDirection,
  TrackDistance,
  HuntingTripStatus,
  HuntingGround,
  HuntingEquipment,
  HuntAvailability,
  TrackingResult,
  HarvestResult,
  HarvestedResource,
  HuntingTrip,
  HuntingStatistics,
  StartHuntParams,
} from './useHunting';

export { useTrain } from './useTrain';
export { default as useTrainDefault } from './useTrain';
export type {
  TrainRoute,
  TrainStop,
  TrainSchedule,
  TrainTicket,
  TrainSearchParams,
  TrainSearchResult,
  CargoQuote,
  CargoShipment,
  CargoItem,
  TrainScoutInfo,
  AmbushPoint,
  TrainRobberyPlan,
  TrainRobberyResult,
  LootItem,
} from './useTrain';

export { useStagecoach } from './useStagecoach';
export { default as useStagecoachDefault } from './useStagecoach';
export type {
  StagecoachRoute,
  WayStation,
  StagecoachTicket,
  TravelHistoryEntry,
  TravelIncident,
  AmbushSpot,
  AmbushSetup,
  AmbushParticipant,
  AmbushPosition,
  AmbushResult,
  AmbushLoot,
  InjuryReport,
  CasualtyReport,
  ReputationChange,
} from './useStagecoach';

export { useHorses } from './useHorses';
export { default as useHorsesDefault } from './useHorses';
export type {
  Horse,
  HorseResponse,
  HorseListResponse,
  HorseStats,
  HorseDerivedStats,
  HorseBond,
  HorseTraining,
  HorseEquipment,
  HorseConditionState,
  HorseBreeding,
  HorseHistory,
  HorseBreedingResult,
  HorseLineage,
  BondStatusResponse,
  PurchaseHorseData,
  FeedHorseData,
  TrainHorseData,
  BreedHorsesData,
} from './useHorses';
export {
  HorseBreed,
  HorseGender,
  HorseColor,
  HorseCondition,
  HorseSkill,
  BondLevel,
  HorseRarity,
} from './useHorses';

export { useCompanions } from './useCompanions';
export { default as useCompanionsDefault } from './useCompanions';
export type {
  Companion,
  CompanionListResponse,
  CompanionSpeciesDefinition,
  CompanionShopListing,
  CompanionStatsSummary,
  WildEncounter,
  WildEncountersResponse,
  CompanionCombatStats,
  TrainingProgress,
  TamingResult,
  FeedResult as CompanionFeedResult,
  TrainingResult as CompanionTrainingResult,
  AbilityUseResult as CompanionAbilityUseResult,
  PurchaseCompanionData,
  TameAnimalData,
  TrainCompanionData,
  UseAbilityData,
  CompanionRarity,
} from './useCompanions';
export {
  CompanionCategory,
  CompanionSpecies,
  TrustLevel,
  CompanionCondition,
  CombatRole,
  CompanionAbilityId,
  AcquisitionMethod,
} from './useCompanions';

export { useProduction } from './useProduction';
export { default as useProductionDefault } from './useProduction';
export type {
  ProductionStatus,
  ProductionResource,
  ProductionSlot,
  ActiveProduction,
  CompletedProduction,
  StartProductionData,
  ProductionResult,
} from './useProduction';

export { useWorkshop } from './useWorkshop';
export { default as useWorkshopDefault } from './useWorkshop';
export type {
  QualityTier,
  WorkshopType,
  WorkshopSummary,
  QualityTierInfo,
  WorkshopRecommendation,
  LocationWorkshop,
  WorkshopAccessRequest,
  WorkshopAccessResult,
  MasterworkRenameData,
  RepairCostInfo,
  RepairResult,
} from './useWorkshop';

export { useHeist } from './useHeist';
export { default as useHeistDefault } from './useHeist';
export type {
  HeistStatus,
  HeistRole,
  HeistDifficulty,
  HeistReward,
  HeistRequirement,
  HeistTarget,
  HeistParticipant,
  HeistLogEntry,
  Heist,
  RoleAssignment,
  HeistResult,
} from './useHeist';

export { useWarfare } from './useWarfare';
export { default as useWarfareDefault } from './useWarfare';
export type {
  FortificationType,
  FortificationStatus,
  ResistanceActionType,
  ResistanceStatus,
  DiplomacyType,
  DiplomacyStatus,
  FortificationBonus,
  FortificationCost,
  Fortification,
  ResistanceActivity,
  ResistanceActionOption,
  LiberationProgress,
  DiplomacyProposal,
  WarfareStats,
} from './useWarfare';

export { useQuests } from './useQuests';
export { default as useQuestsDefault } from './useQuests';
export type {
  QuestStatus,
  QuestDifficulty,
  QuestType,
  QuestReward,
  QuestObjective,
  QuestRequirement,
  Quest,
  QuestProgress,
} from './useQuests';

export { useAchievements } from './useAchievements';
export { default as useAchievementsDefault } from './useAchievements';
export type {
  AchievementCategory,
  AchievementTier,
  AchievementReward,
  AchievementRequirement,
  Achievement,
  AchievementSummary,
  AchievementProgress,
} from './useAchievements';

export { useBank } from './useBank';
export { default as useBankDefault } from './useBank';
export type {
  VaultTier,
  TransactionType,
  LoanStatus,
  VaultTierInfo,
  VaultInfo,
  Transaction as BankTransaction,
  Loan,
  LoanEligibility,
  BankStats,
} from './useBank';

export { useDuels } from './useDuels';
export { default as useDuelsDefault } from './useDuels';
export type {
  DuelStatus,
  DuelType,
  CardSuit,
  CardValue,
  DuelCard,
  DuelParticipant,
  DuelChallenge,
  DuelGameState,
  Duel,
  DuelHistoryEntry,
  DuelStats,
  DuelAction,
} from './useDuels';

export { useLeaderboard } from './useLeaderboard';
export { default as useLeaderboardDefault } from './useLeaderboard';
export type {
  LeaderboardCategory,
  LeaderboardRange,
  LeaderboardEntry as GlobalLeaderboardEntry,
  GangLeaderboardEntry,
  PlayerRank,
  LeaderboardData,
  GangLeaderboardData,
} from './useLeaderboard';

// Death System
export { useDeath } from './useDeath';
export { default as useDeathDefault } from './useDeath';
export type {
  DeathType,
  KillerType,
  DeathPenalty,
  DeathStatus,
  DeathStats,
  DeathHistoryEntry,
  JailCheckResult,
  DeathPenaltyInfo,
} from './useDeath';

// Energy System
export { useEnergy } from './useEnergy';
export { default as useEnergyDefault } from './useEnergy';
export type {
  EnergyStatus,
  EnergyBonus,
  EnergySpendResult,
  EnergyGrantResult,
  RegenResult,
} from './useEnergy';

// Disguise System
export { useDisguise } from './useDisguise';
export { default as useDisguiseDefault } from './useDisguise';
export type {
  DisguiseType,
  DisguiseStatus,
  DisguiseApplyResult,
  DetectionResult,
  AvailableDisguise,
} from './useDisguise';

// Bribe System
export { useBribe } from './useBribe';
export { default as useBribeDefault } from './useBribe';
export type {
  BribeResult,
  BribeCalculation,
  BribeFactor,
  BuildingBribeOptions,
  NPCBribeOptions,
} from './useBribe';

// Conquest System
export { useConquest } from './useConquest';
export { default as useConquestDefault } from './useConquest';
export type {
  FactionId as ConquestFactionId,
  ConquestStage,
  ConquestAttemptStatus,
  OccupationStatus,
  ConquestResources,
  SiegeRequirement,
  SiegeEligibility,
  ConquestAttempt,
  SiegeParticipant,
  ConquestHistoryEntry,
  FactionConquestStats,
  TerritoryConquestState,
  DeclareSiegeRequest,
  RallyDefenseRequest,
} from './useConquest';

// Faction War System
export { useFactionWar } from './useFactionWar';
export { default as useFactionWarDefault } from './useFactionWar';
export type {
  FactionId as WarFactionId,
  WarEventType,
  WarPhase,
  WarEventStatus,
  WarObjective,
  ObjectiveReward,
  WarReward,
  WarParticipant,
  WarEvent,
  WarStatistics,
  WarTimelineEvent,
  CreateWarEventRequest,
} from './useFactionWar';

// Territory Influence System
export { useTerritoryInfluence } from './useTerritoryInfluence';
export { default as useTerritoryInfluenceDefault } from './useTerritoryInfluence';
export type {
  FactionId as InfluenceFactionId,
  ControlLevel,
  InfluenceSource,
  TrendDirection,
  FactionInfluenceData,
  TerritoryInfluenceSummary,
  TerritoryBuff,
  TerritoryDebuff,
  InfluenceHistoryEntry,
  FactionOverview,
  TerritoryGain,
  TerritoryLoss,
  AlignmentBenefits,
  CharacterInfluenceContribution,
  InfluenceGainResult,
  ContributeInfluenceRequest,
  DonateInfluenceRequest,
} from './useTerritoryInfluence';

// Legendary Hunt System
export { useLegendaryHunt } from './useLegendaryHunt';
export { default as useLegendaryHuntDefault } from './useLegendaryHunt';
export type {
  DiscoveryStatus,
  LegendaryCategory,
  HuntAction,
  LegendaryAnimal,
  SpawnCondition as LegendarySpawnCondition,
  LegendaryStats,
  LegendaryAbility,
  LegendaryReward,
  LegendaryHuntRecord,
  LegendaryTrophy,
  LegendaryHuntSession,
  StatusEffect as HuntStatusEffect,
  HuntTurnResult,
  CombatAction as HuntCombatAction,
  DifficultyRating,
  DifficultyFactor,
  HuntLeaderboardEntry,
  ClueDiscoveryResult,
  RumorResult,
  InitiateHuntResult,
  LegendaryWithProgress,
} from './useLegendaryHunt';

// Boss Encounter System
export { useBossEncounter } from './useBossEncounter';
export { default as useBossEncounterDefault } from './useBossEncounter';
export type {
  BossDifficulty as EncounterBossDifficulty,
  BossPhase as EncounterBossPhase,
  BossCombatAction,
  BossEncounter,
  BossSpawnCondition,
  BossStats as EncounterBossStats,
  BossPhaseDefinition,
  BossAbility,
  BossReward as EncounterBossReward,
  BossDiscovery,
  BossAvailability as EncounterBossAvailability,
  BossSession,
  BossStatusEffect,
  BossCombatRound,
  BossActionResult,
  EncounterHistoryEntry,
  BossLeaderboardEntry as EncounterBossLeaderboardEntry,
  BossWithProgress,
  InitiateEncounterResult as BossInitiateResult,
} from './useBossEncounter';

// Accessibility
export { useAnnouncer, gameAnnouncements } from './useAnnouncer';
export { default as useAnnouncerDefault } from './useAnnouncer';

// Karma/Deity System
export { useKarma } from './useKarma';
export { default as useKarmaDefault } from './useKarma';
export type { UseKarmaReturn } from './useKarma';
