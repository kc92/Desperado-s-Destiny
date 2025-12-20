/**
 * Wandering NPC Service
 *
 * Manages wandering service provider NPCs including their movement,
 * availability, and service offerings
 */

import {
  WanderingServiceProvider,
  ServiceProviderRelationship as IServiceProviderRelationshipType,
  ServiceUsageRecord as IServiceUsageRecordType,
  UseServiceRequest,
  UseServiceResponse,
  GetServiceProvidersAtLocationResponse,
  GetProviderScheduleResponse,
  ServiceEffectType,
  Service,
  NPCActivity,
} from '@desperados/shared';
import {
  WANDERING_SERVICE_PROVIDERS,
  getServiceProviderById,
  getServiceProvidersAtLocation,
} from '../data/wanderingServiceProviders';
import { ServiceProviderRelationship } from '../models/ServiceProviderRelationship.model';
import { ServiceUsageRecord } from '../models/ServiceUsageRecord.model';

/**
 * Get current game time (day of week and hour)
 * In a full implementation, this would connect to your time system
 */
function getCurrentGameTime(): { dayOfWeek: number; hour: number } {
  // For now, using real time modulo 7 days
  // In production, this should use your in-game time system
  const now = new Date();
  return {
    dayOfWeek: now.getDay(), // 0-6 (Sunday-Saturday)
    hour: now.getHours(), // 0-23
  };
}

/**
 * Calculate trust level based on relationship
 */
function calculateTrustLevel(
  relationship?: IServiceProviderRelationshipType | { trustLevel: number; servicesUsed: number; totalSpent: number; favorsDone?: number; providerId: string }
): number {
  if (!relationship) return 1; // Base trust for new relationships

  // Trust based on services used and money spent
  let trust = relationship.trustLevel;

  // Bonus trust for frequent use
  if (relationship.servicesUsed >= 10) trust += 0.5;
  if (relationship.servicesUsed >= 25) trust += 0.5;

  // Bonus trust for high spending
  if (relationship.totalSpent >= 500) trust += 0.5;
  if (relationship.totalSpent >= 1000) trust += 0.5;

  // Bonus trust for favors
  if (relationship.favorsDone && relationship.favorsDone >= 3) trust += 1;

  // Cap at max trust
  const provider = getServiceProviderById(relationship.providerId);
  if (provider) {
    trust = Math.min(trust, provider.maxTrust);
  }

  return Math.floor(trust);
}

/**
 * Check if service requirements are met
 */
function checkServiceRequirements(
  service: Service,
  characterId: string,
  trustLevel: number,
  characterBounty: number = 0
): { canUse: boolean; reason?: string } {
  if (!service.requirements) {
    return { canUse: true };
  }

  const req = service.requirements;

  // Check trust level
  if (req.minTrustLevel && trustLevel < req.minTrustLevel) {
    return {
      canUse: false,
      reason: `Requires trust level ${req.minTrustLevel}. Your trust: ${trustLevel}`,
    };
  }

  // Check bounty
  if (req.maxBounty && characterBounty > req.maxBounty) {
    return {
      canUse: false,
      reason: `Your bounty is too high for this service (max: ${req.maxBounty})`,
    };
  }

  // Other requirements could be checked here (faction, quest completion, etc.)

  return { canUse: true };
}

/**
 * Calculate service cost with trust discount
 */
function calculateServiceCost(
  service: Service,
  provider: WanderingServiceProvider,
  trustLevel: number,
  isEmergency: boolean = false
): typeof service.cost {
  let cost = isEmergency && service.emergencyCost
    ? service.emergencyCost
    : service.cost;

  // Apply trust discount if gold-based
  if (cost.type === 'gold' && cost.gold) {
    const discountPercent = getTrustDiscount(provider, trustLevel);
    const discountedGold = Math.floor(
      cost.gold * (1 - discountPercent / 100)
    );
    return {
      ...cost,
      gold: discountedGold,
    };
  }

  return cost;
}

/**
 * Get discount percentage based on trust level
 */
function getTrustDiscount(
  provider: WanderingServiceProvider,
  trustLevel: number
): number {
  if (!provider.trustBonuses) return 0;

  const applicableBonus = provider.trustBonuses
    .filter((bonus) => bonus.trustLevel <= trustLevel)
    .sort((a, b) => b.trustLevel - a.trustLevel)[0];

  return applicableBonus?.benefits.discountPercentage || 0;
}

/**
 * Check if a service is available based on trust level
 */
function isServiceAvailable(
  service: Service,
  provider: WanderingServiceProvider,
  trustLevel: number
): boolean {
  if (!provider.trustBonuses) return true;

  // Check if service requires unlocking
  const requiresUnlock = provider.trustBonuses.some(
    (bonus) =>
      bonus.benefits.unlockServices?.includes(service.id) ||
      bonus.benefits.exclusiveServices?.includes(service.id)
  );

  if (!requiresUnlock) return true;

  // Check if player has required trust to unlock
  return provider.trustBonuses.some(
    (bonus) =>
      bonus.trustLevel <= trustLevel &&
      (bonus.benefits.unlockServices?.includes(service.id) ||
        bonus.benefits.exclusiveServices?.includes(service.id))
  );
}

/**
 * Wandering NPC Service Class
 */
export class WanderingNPCService {
  constructor() {
    // MongoDB models are now used instead of in-memory Maps
  }

  /**
   * Get service providers currently at a location
   */
  async getProvidersAtLocation(
    locationId: string,
    characterId?: string
  ): Promise<GetServiceProvidersAtLocationResponse> {
    const { dayOfWeek, hour } = getCurrentGameTime();
    const providers = getServiceProvidersAtLocation(locationId, dayOfWeek, hour);

    const providersWithDetails = await Promise.all(
      providers.map(async (provider) => {
        // Find current schedule entry
        const scheduleEntry = provider.schedule.find(
          (entry) =>
            entry.dayOfWeek === dayOfWeek &&
            hour >= entry.hour &&
            hour < entry.endHour &&
            entry.locationId === locationId
        );

        // Get relationship if character provided
        let trustLevel: number | undefined;
        if (characterId) {
          const relationship = await this.getRelationship(provider.id, characterId);
          trustLevel = calculateTrustLevel(relationship);
        }

        // Calculate when provider is departing
        const routeStop = provider.route.find(
          (stop) => stop.locationId === locationId
        );
        let departingIn: number | undefined;
        if (routeStop) {
          // Calculate hours until departure
          const currentTime = dayOfWeek * 24 + hour;
          const departureTime =
            routeStop.departureDay * 24 + routeStop.departureHour;
          departingIn = departureTime - currentTime;
          if (departingIn < 0) departingIn += 7 * 24; // Wrap around week
        }

        return {
          provider,
          currentActivity: scheduleEntry?.activity || NPCActivity.RESTING,
          servicesAvailable: scheduleEntry?.servicesAvailable || false,
          departingIn,
          trustLevel,
        };
      })
    );

    return {
      success: true,
      providers: providersWithDetails,
    };
  }

  /**
   * Get a provider's upcoming schedule
   */
  async getProviderSchedule(
    providerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<GetProviderScheduleResponse> {
    const provider = getServiceProviderById(providerId);
    if (!provider) {
      return {
        success: false,
        provider: null as any,
        upcomingStops: [],
      };
    }

    const { dayOfWeek, hour } = getCurrentGameTime();

    // Find current location
    const currentStop = provider.route.find((stop) => {
      const isAtLocation =
        (dayOfWeek > stop.arrivalDay ||
          (dayOfWeek === stop.arrivalDay && hour >= stop.arrivalHour)) &&
        (dayOfWeek < stop.departureDay ||
          (dayOfWeek === stop.departureDay && hour <= stop.departureHour));
      return isAtLocation;
    });

    // Build upcoming stops
    const upcomingStops = provider.route.map((stop) => {
      // Calculate actual dates from day of week
      const now = new Date();
      const arrivalDate = new Date(now);
      const daysUntilArrival = (stop.arrivalDay - dayOfWeek + 7) % 7;
      arrivalDate.setDate(now.getDate() + daysUntilArrival);
      arrivalDate.setHours(stop.arrivalHour, 0, 0, 0);

      const departureDate = new Date(arrivalDate);
      const stayHours = stop.stayDuration;
      departureDate.setHours(departureDate.getHours() + stayHours);

      return {
        location: stop.locationName,
        arrivalTime: arrivalDate,
        departureTime: departureDate,
        servicesOffered: provider.services,
      };
    });

    let currentLocation;
    if (currentStop) {
      const departureDate = new Date();
      const daysUntilDeparture = (currentStop.departureDay - dayOfWeek + 7) % 7;
      departureDate.setDate(departureDate.getDate() + daysUntilDeparture);
      departureDate.setHours(currentStop.departureHour, 0, 0, 0);

      currentLocation = {
        locationId: currentStop.locationId,
        locationName: currentStop.locationName,
        departingAt: departureDate,
      };
    }

    return {
      success: true,
      provider,
      upcomingStops,
      currentLocation,
    };
  }

  /**
   * Use a service
   */
  async useService(request: UseServiceRequest): Promise<UseServiceResponse> {
    const provider = getServiceProviderById(request.providerId);
    if (!provider) {
      return {
        success: false,
        message: 'Service provider not found',
      };
    }

    const service = provider.services.find((s) => s.id === request.serviceId);
    if (!service) {
      return {
        success: false,
        message: 'Service not found',
      };
    }

    // Check if provider is available
    const { dayOfWeek, hour } = getCurrentGameTime();
    const scheduleEntry = provider.schedule.find(
      (entry) =>
        entry.dayOfWeek === dayOfWeek &&
        hour >= entry.hour &&
        hour < entry.endHour
    );

    if (!scheduleEntry?.servicesAvailable && !scheduleEntry?.emergencyOnly) {
      return {
        success: false,
        message: `${provider.name} is not offering services right now.`,
      };
    }

    // Get relationship and trust
    const relationshipData = await this.getRelationship(
      request.providerId,
      request.characterId
    );
    const trustLevel = calculateTrustLevel(relationshipData);

    // Check if service is unlocked
    if (!isServiceAvailable(service, provider, trustLevel)) {
      return {
        success: false,
        message: `This service requires higher trust with ${provider.name}.`,
      };
    }

    // Check service requirements
    const requirementCheck = checkServiceRequirements(
      service,
      request.characterId,
      trustLevel,
      0 // TODO: Get actual character bounty
    );

    if (!requirementCheck.canUse) {
      return {
        success: false,
        message: requirementCheck.reason || 'Requirements not met',
      };
    }

    // Check cooldown using MongoDB model
    const cooldownCheck = await ServiceUsageRecord.isOnCooldown(
      request.characterId,
      request.serviceId
    );
    if (cooldownCheck.onCooldown && cooldownCheck.expiresAt) {
      return {
        success: false,
        message: `This service is on cooldown until ${cooldownCheck.expiresAt.toLocaleTimeString()}`,
        cooldownUntil: cooldownCheck.expiresAt,
      };
    }

    // Calculate cost
    const isEmergency = scheduleEntry?.emergencyOnly || false;
    const cost = calculateServiceCost(service, provider, trustLevel, isEmergency);

    // TODO: Actually deduct payment (gold or barter items)
    // This would integrate with your inventory/gold systems

    // Record usage in MongoDB
    await this.recordServiceUsage(
      service.id,
      provider.id,
      request.characterId,
      {
        goldPaid: cost.gold || 0,
        effectsApplied: service.effects,
        cooldownSeconds: service.cooldown ? service.cooldown * 60 : undefined,
        isEmergency,
        locationId: scheduleEntry?.locationId,
      }
    );

    // Update relationship
    await this.updateRelationship(
      provider.id,
      request.characterId,
      cost.gold || 0
    );

    const relationship = await this.getRelationship(provider.id, request.characterId);
    const newTrustLevel = calculateTrustLevel(relationship);

    // TODO: Actually apply service effects to character
    // This would integrate with your character/combat/buff systems

    // Calculate cooldown expiration
    const cooldownUntil = service.cooldown
      ? new Date(Date.now() + service.cooldown * 60000)
      : undefined;

    return {
      success: true,
      message: `${service.name} completed successfully!`,
      effectsApplied: service.effects,
      costPaid: cost,
      newTrustLevel,
      cooldownUntil,
    };
  }

  /**
   * Get available services for a character from a provider
   */
  async getAvailableServices(
    providerId: string,
    characterId: string
  ): Promise<Service[]> {
    const provider = getServiceProviderById(providerId);
    if (!provider) return [];

    const relationship = await this.getRelationship(providerId, characterId);
    const trustLevel = calculateTrustLevel(relationship);

    return provider.services.filter((service) =>
      isServiceAvailable(service, provider, trustLevel)
    );
  }

  /**
   * Get relationship between character and provider
   */
  private async getRelationship(
    providerId: string,
    characterId: string
  ): Promise<{ trustLevel: number; servicesUsed: number; totalSpent: number; favorsDone?: number; providerId: string } | null> {
    const relationship = await ServiceProviderRelationship.findOne({
      characterId,
      providerId
    });

    if (!relationship) return null;

    return {
      trustLevel: relationship.trustLevel,
      servicesUsed: relationship.servicesUsed,
      totalSpent: relationship.totalSpent,
      favorsDone: relationship.favorsDone,
      providerId: relationship.providerId,
    };
  }

  /**
   * Update relationship after service use
   */
  private async updateRelationship(
    providerId: string,
    characterId: string,
    goldSpent: number
  ): Promise<void> {
    // Record the service usage using the static method
    const relationship = await ServiceProviderRelationship.recordServiceUsage(
      characterId,
      providerId,
      goldSpent
    );

    // Increase trust based on usage (every 5 services)
    if (relationship.servicesUsed % 5 === 0) {
      const provider = getServiceProviderById(providerId);
      const maxTrust = provider?.maxTrust || 5;
      await ServiceProviderRelationship.increaseTrust(
        characterId,
        providerId,
        0.5,
        maxTrust
      );
    }
  }

  /**
   * Record service usage
   */
  private async recordServiceUsage(
    serviceId: string,
    providerId: string,
    characterId: string,
    options: {
      goldPaid?: number;
      barterItems?: Array<{ itemId: string; quantity: number }>;
      effectsApplied?: Array<{
        type: ServiceEffectType;
        value: number;
        duration?: number;
      }>;
      cooldownSeconds?: number;
      isEmergency?: boolean;
      locationId?: string;
    }
  ): Promise<void> {
    await ServiceUsageRecord.recordUsage(
      characterId,
      providerId,
      serviceId,
      options
    );
  }

  /**
   * Get last usage of a service by a character
   */
  private async getLastServiceUsage(
    serviceId: string,
    characterId: string
  ): Promise<{ usedAt: Date; availableAgainAt?: Date } | null> {
    const record = await ServiceUsageRecord.getLastUsage(characterId, serviceId);

    if (!record) return null;

    return {
      usedAt: record.usedAt,
      availableAgainAt: record.cooldownExpiresAt,
    };
  }
}

// Export singleton instance
export const wanderingNPCService = new WanderingNPCService();
