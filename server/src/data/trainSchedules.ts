/**
 * Train Schedules Data
 *
 * Defines train schedules and timetables
 */

import { TrainSchedule, TrainType, TrainStatus, TrainFrequency, TRAIN_CONSTANTS } from '@desperados/shared';

/**
 * Regular Passenger Trains
 */
export const PASSENGER_SCHEDULES: TrainSchedule[] = [
  // Transcontinental Morning Express
  {
    trainId: 'TRANS_MORNING',
    trainName: 'Morning Express',
    trainType: TrainType.PASSENGER,
    routeId: 'TRANSCONTINENTAL',
    departureHour: 6,
    frequency: TrainFrequency.DAILY,
    status: TrainStatus.RUNNING,
    guards: TRAIN_CONSTANTS.GUARD_COUNTS.PASSENGER,
    securityLevel: TRAIN_CONSTANTS.SECURITY_LEVELS.PASSENGER,
    passengerCount: 45,
  },

  // Transcontinental Evening Express
  {
    trainId: 'TRANS_EVENING',
    trainName: 'Evening Express',
    trainType: TrainType.PASSENGER,
    routeId: 'TRANSCONTINENTAL',
    departureHour: 18,
    frequency: TrainFrequency.DAILY,
    status: TrainStatus.RUNNING,
    guards: TRAIN_CONSTANTS.GUARD_COUNTS.PASSENGER,
    securityLevel: TRAIN_CONSTANTS.SECURITY_LEVELS.PASSENGER,
    passengerCount: 38,
  },

  // Northern Loop Train
  {
    trainId: 'NORTH_LOOP',
    trainName: 'Northern Wanderer',
    trainType: TrainType.PASSENGER,
    routeId: 'NORTHERN_LOOP',
    departureHour: 8,
    frequency: TrainFrequency.DAILY,
    status: TrainStatus.RUNNING,
    guards: TRAIN_CONSTANTS.GUARD_COUNTS.PASSENGER,
    securityLevel: TRAIN_CONSTANTS.SECURITY_LEVELS.PASSENGER,
    passengerCount: 25,
  },

  // Canyon Scenic Route
  {
    trainId: 'CANYON_SCENIC',
    trainName: 'Canyon Vista',
    trainType: TrainType.PASSENGER,
    routeId: 'CANYON_ROUTE',
    departureHour: 10,
    frequency: TrainFrequency.DAILY,
    status: TrainStatus.RUNNING,
    guards: TRAIN_CONSTANTS.GUARD_COUNTS.PASSENGER + 1, // Extra guard due to danger
    securityLevel: TRAIN_CONSTANTS.SECURITY_LEVELS.PASSENGER + 1,
    passengerCount: 30,
  },
];

/**
 * Freight Trains
 */
export const FREIGHT_SCHEDULES: TrainSchedule[] = [
  // Mining Spur Morning Run
  {
    trainId: 'MINE_FREIGHT_AM',
    trainName: 'Mining Freight (Morning)',
    trainType: TrainType.FREIGHT,
    routeId: 'MINING_SPUR',
    departureHour: 5,
    frequency: TrainFrequency.DAILY,
    status: TrainStatus.RUNNING,
    guards: TRAIN_CONSTANTS.GUARD_COUNTS.FREIGHT,
    securityLevel: TRAIN_CONSTANTS.SECURITY_LEVELS.FREIGHT,
    cargoValue: 5000,
  },

  // Mining Spur Evening Run
  {
    trainId: 'MINE_FREIGHT_PM',
    trainName: 'Mining Freight (Evening)',
    trainType: TrainType.FREIGHT,
    routeId: 'MINING_SPUR',
    departureHour: 17,
    frequency: TrainFrequency.DAILY,
    status: TrainStatus.RUNNING,
    guards: TRAIN_CONSTANTS.GUARD_COUNTS.FREIGHT,
    securityLevel: TRAIN_CONSTANTS.SECURITY_LEVELS.FREIGHT,
    cargoValue: 4500,
  },

  // Transcontinental Freight
  {
    trainId: 'TRANS_FREIGHT',
    trainName: 'Continental Cargo',
    trainType: TrainType.FREIGHT,
    routeId: 'TRANSCONTINENTAL',
    departureHour: 3,
    frequency: TrainFrequency.DAILY,
    status: TrainStatus.RUNNING,
    guards: TRAIN_CONSTANTS.GUARD_COUNTS.FREIGHT,
    securityLevel: TRAIN_CONSTANTS.SECURITY_LEVELS.FREIGHT,
    cargoValue: 8000,
  },
];

/**
 * Military Trains
 */
export const MILITARY_SCHEDULES: TrainSchedule[] = [
  // Weekly Payroll Run
  {
    trainId: 'MILITARY_PAYROLL',
    trainName: 'Fort Ashford Payroll',
    trainType: TrainType.MILITARY,
    routeId: 'MILITARY_SUPPLY',
    departureHour: 14,
    frequency: TrainFrequency.WEEKLY, // Every Monday
    status: TrainStatus.RUNNING,
    guards: TRAIN_CONSTANTS.GUARD_COUNTS.MILITARY,
    securityLevel: TRAIN_CONSTANTS.SECURITY_LEVELS.MILITARY,
    cargoValue: 50000, // High-value payroll
  },

  // Regular Supply Run
  {
    trainId: 'MILITARY_SUPPLY',
    trainName: 'Military Supply Train',
    trainType: TrainType.SUPPLY_RUN,
    routeId: 'MILITARY_SUPPLY',
    departureHour: 7,
    frequency: TrainFrequency.DAILY,
    status: TrainStatus.RUNNING,
    guards: TRAIN_CONSTANTS.GUARD_COUNTS.SUPPLY_RUN,
    securityLevel: TRAIN_CONSTANTS.SECURITY_LEVELS.SUPPLY_RUN,
    cargoValue: 12000,
  },
];

/**
 * VIP and Special Trains
 */
export const SPECIAL_SCHEDULES: TrainSchedule[] = [
  // VIP Express (travels randomly 2-3 times per week)
  {
    trainId: 'VIP_EXPRESS',
    trainName: 'Presidential Express',
    trainType: TrainType.VIP_EXPRESS,
    routeId: 'TRANSCONTINENTAL',
    departureHour: 12,
    frequency: TrainFrequency.SPECIAL,
    status: TrainStatus.RUNNING,
    guards: TRAIN_CONSTANTS.GUARD_COUNTS.VIP_EXPRESS,
    securityLevel: TRAIN_CONSTANTS.SECURITY_LEVELS.VIP_EXPRESS,
    cargoValue: 25000,
    passengerCount: 8, // Only wealthy passengers
  },

  // Gold Train (monthly)
  {
    trainId: 'GOLD_TRAIN',
    trainName: 'Gold Reserve Transport',
    trainType: TrainType.GOLD_TRAIN,
    routeId: 'TRANSCONTINENTAL',
    departureHour: 4,
    frequency: TrainFrequency.MONTHLY,
    status: TrainStatus.RUNNING,
    guards: TRAIN_CONSTANTS.GUARD_COUNTS.GOLD_TRAIN,
    securityLevel: TRAIN_CONSTANTS.SECURITY_LEVELS.GOLD_TRAIN,
    cargoValue: 100000, // Extremely valuable
  },

  // Prison Transport (weekly)
  {
    trainId: 'PRISON_TRANSPORT',
    trainName: 'Territorial Prison Transport',
    trainType: TrainType.PRISON_TRANSPORT,
    routeId: 'TRANSCONTINENTAL',
    departureHour: 20,
    frequency: TrainFrequency.WEEKLY,
    status: TrainStatus.RUNNING,
    guards: TRAIN_CONSTANTS.GUARD_COUNTS.PRISON_TRANSPORT,
    securityLevel: TRAIN_CONSTANTS.SECURITY_LEVELS.PRISON_TRANSPORT,
    cargoValue: 0, // No monetary value, but rescue missions possible
  },

  // Mail Express
  {
    trainId: 'MAIL_EXPRESS',
    trainName: 'Frontier Mail Service',
    trainType: TrainType.MAIL_EXPRESS,
    routeId: 'TRANSCONTINENTAL',
    departureHour: 1,
    frequency: TrainFrequency.DAILY,
    status: TrainStatus.RUNNING,
    guards: TRAIN_CONSTANTS.GUARD_COUNTS.MAIL_EXPRESS,
    securityLevel: TRAIN_CONSTANTS.SECURITY_LEVELS.MAIL_EXPRESS,
    cargoValue: 3000,
  },
];

/**
 * Border Trains
 */
export const BORDER_SCHEDULES: TrainSchedule[] = [
  // Border Express (requires permit)
  {
    trainId: 'BORDER_EXPRESS',
    trainName: 'International Express',
    trainType: TrainType.PASSENGER,
    routeId: 'BORDER_EXPRESS',
    departureHour: 9,
    frequency: TrainFrequency.DAILY,
    status: TrainStatus.RUNNING,
    guards: TRAIN_CONSTANTS.GUARD_COUNTS.PASSENGER + 2, // Extra border security
    securityLevel: TRAIN_CONSTANTS.SECURITY_LEVELS.PASSENGER + 2,
    passengerCount: 20,
  },
];

/**
 * All train schedules
 */
export const ALL_TRAIN_SCHEDULES: TrainSchedule[] = [
  ...PASSENGER_SCHEDULES,
  ...FREIGHT_SCHEDULES,
  ...MILITARY_SCHEDULES,
  ...SPECIAL_SCHEDULES,
  ...BORDER_SCHEDULES,
];

/**
 * Get a train schedule by ID
 */
export function getTrainSchedule(trainId: string): TrainSchedule | undefined {
  return ALL_TRAIN_SCHEDULES.find((schedule) => schedule.trainId === trainId);
}

/**
 * Get all trains on a specific route
 */
export function getTrainsForRoute(routeId: string): TrainSchedule[] {
  return ALL_TRAIN_SCHEDULES.filter((schedule) => schedule.routeId === routeId);
}

/**
 * Get trains by type
 */
export function getTrainsByType(type: TrainType): TrainSchedule[] {
  return ALL_TRAIN_SCHEDULES.filter((schedule) => schedule.trainType === type);
}

/**
 * Get available trains for a route departing after a specific hour
 */
export function getAvailableTrains(routeId: string, afterHour: number = 0): TrainSchedule[] {
  return ALL_TRAIN_SCHEDULES.filter(
    (schedule) =>
      schedule.routeId === routeId &&
      schedule.status === TrainStatus.RUNNING &&
      schedule.departureHour >= afterHour
  );
}

/**
 * Calculate next departure time for a train
 */
export function getNextDeparture(schedule: TrainSchedule, currentDate: Date = new Date()): Date {
  const nextDeparture = new Date(currentDate);
  nextDeparture.setHours(schedule.departureHour, 0, 0, 0);

  // If we've passed today's departure, move to next occurrence
  if (nextDeparture <= currentDate) {
    switch (schedule.frequency) {
      case TrainFrequency.HOURLY:
        nextDeparture.setHours(nextDeparture.getHours() + 1);
        break;
      case TrainFrequency.DAILY:
        nextDeparture.setDate(nextDeparture.getDate() + 1);
        break;
      case TrainFrequency.WEEKLY:
        nextDeparture.setDate(nextDeparture.getDate() + 7);
        break;
      case TrainFrequency.MONTHLY:
        nextDeparture.setMonth(nextDeparture.getMonth() + 1);
        break;
      case TrainFrequency.SPECIAL:
        // Special trains require manual scheduling
        nextDeparture.setDate(nextDeparture.getDate() + 1);
        break;
    }
  }

  return nextDeparture;
}

/**
 * Check if a train is a high-value robbery target
 */
export function isHighValueTarget(schedule: TrainSchedule): boolean {
  return (
    schedule.trainType === TrainType.GOLD_TRAIN ||
    schedule.trainType === TrainType.MILITARY ||
    schedule.trainType === TrainType.VIP_EXPRESS ||
    (schedule.cargoValue && schedule.cargoValue >= 20000)
  );
}

/**
 * Get robbery difficulty for a train
 */
export function getRobberyDifficulty(schedule: TrainSchedule): number {
  // Base difficulty on security level and guard count
  const baseDifficulty = schedule.securityLevel * 10;
  const guardBonus = schedule.guards * 5;
  const valuePenalty = schedule.cargoValue ? Math.floor(schedule.cargoValue / 5000) : 0;

  return Math.min(100, baseDifficulty + guardBonus + valuePenalty);
}
