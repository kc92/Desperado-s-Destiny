/**
 * useZodiac Hook
 * Handles Frontier Zodiac calendar system API operations
 */

import { useState, useCallback, useMemo } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';
import { logger } from '@/services/logger.service';
import type {
  FrontierSign,
  ZodiacSignId,
  ZodiacProgress,
  SignBonus,
  PeakDayEvent,
  Constellation,
  ConstellationRewardData,
  PeakDayNPC,
  PeakDayBounty,
} from '@/types/zodiac.types';
import {
  FRONTIER_SIGNS,
  getCurrentSign,
  getDaysUntilNextSign,
  getDaysUntilPeakDay,
  isPeakDay as checkIsPeakDay,
  getSignById,
  CONSTELLATION_PATTERNS,
} from '@/constants/zodiac.constants';

/** Hook return interface */
interface UseZodiacReturn {
  // Data
  currentSign: FrontierSign | null;
  characterProgress: ZodiacProgress | null;
  calendar: FrontierSign[];
  isPeakDay: boolean;
  peakDayEvent: PeakDayEvent | null;

  // Loading states
  isLoading: boolean;
  isSettingBirthSign: boolean;
  isClaimingReward: boolean;
  error: string | null;

  // Actions
  fetchCurrentSign: () => Promise<void>;
  fetchProgress: () => Promise<void>;
  fetchPeakDayEvent: () => Promise<void>;
  setBirthSign: (signId: ZodiacSignId) => Promise<{ success: boolean; message: string }>;
  claimConstellation: (signId: ZodiacSignId) => Promise<{ success: boolean; reward?: ConstellationRewardData }>;
  fetchSignNPCs: (signId: ZodiacSignId) => Promise<PeakDayNPC[]>;
  fetchSignBounties: (signId: ZodiacSignId) => Promise<PeakDayBounty[]>;
  clearError: () => void;

  // Computed
  activeBonuses: SignBonus[];
  daysUntilNextSign: number;
  daysUntilPeakDay: number;
  birthSign: FrontierSign | null;
  hasBirthSign: boolean;

  // Helpers
  getConstellation: (signId: ZodiacSignId) => Constellation | null;
  getSignColors: (signId: ZodiacSignId) => { primary: string; secondary: string; gradient: string; glow: string } | null;
}

/**
 * Generate default progress for a character
 */
function generateDefaultProgress(characterId: string): ZodiacProgress {
  const defaultConstellations: Record<ZodiacSignId, Constellation> = {} as Record<ZodiacSignId, Constellation>;

  FRONTIER_SIGNS.forEach(sign => {
    const pattern = CONSTELLATION_PATTERNS[sign.id];
    defaultConstellations[sign.id] = {
      signId: sign.id,
      stars: pattern.stars.map((star, index) => ({
        id: `${sign.id}-star-${index}`,
        name: `Star ${index + 1}`,
        x: star.x,
        y: star.y,
        size: star.size,
        isEarned: false,
      })),
      connections: pattern.connections.map(([from, to]) => ({
        from: `${sign.id}-star-${from}`,
        to: `${sign.id}-star-${to}`,
      })),
      totalStars: pattern.stars.length,
      earnedStars: 0,
      isComplete: false,
    };
  });

  return {
    characterId,
    birthSign: null,
    constellations: defaultConstellations,
    totalStarsEarned: 0,
    totalConstellationsComplete: 0,
    claimedRewards: [],
    peakDaysAttended: 0,
    signBonusesUsed: 0,
  };
}

export const useZodiac = (): UseZodiacReturn => {
  const [currentSign, setCurrentSign] = useState<FrontierSign | null>(null);
  const [characterProgress, setCharacterProgress] = useState<ZodiacProgress | null>(null);
  const [peakDayEvent, setPeakDayEvent] = useState<PeakDayEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingBirthSign, setIsSettingBirthSign] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { currentCharacter, refreshCharacter } = useCharacterStore();

  // Computed: Is it a peak day?
  const isPeakDay = useMemo(() => {
    if (peakDayEvent?.isActive) return true;
    return checkIsPeakDay();
  }, [peakDayEvent]);

  // Computed: Active bonuses from current sign
  const activeBonuses = useMemo((): SignBonus[] => {
    if (!currentSign) return [];

    const bonuses = [...currentSign.bonuses.filter(b => b.isActive)];

    // Add peak bonuses if it's peak day
    if (isPeakDay && currentSign.id === peakDayEvent?.signId) {
      bonuses.push(...currentSign.peakBonuses.map(b => ({ ...b, isActive: true })));
    }

    // Add birth sign bonuses if applicable
    if (characterProgress?.birthSign && characterProgress.birthSign === currentSign.id) {
      // Birth sign gets extra bonus
      bonuses.forEach(bonus => {
        bonus.value = Math.round(bonus.value * 1.1); // 10% extra for birth sign
      });
    }

    return bonuses;
  }, [currentSign, isPeakDay, peakDayEvent, characterProgress]);

  // Computed: Days until next sign
  const daysUntilNextSign = useMemo(() => {
    if (!currentSign) return 0;
    return getDaysUntilNextSign(currentSign);
  }, [currentSign]);

  // Computed: Days until peak day
  const daysUntilPeakDay = useMemo(() => {
    if (!currentSign) return 0;
    return getDaysUntilPeakDay(currentSign);
  }, [currentSign]);

  // Computed: Birth sign
  const birthSign = useMemo((): FrontierSign | null => {
    if (!characterProgress?.birthSign) return null;
    return getSignById(characterProgress.birthSign) || null;
  }, [characterProgress]);

  // Computed: Has birth sign
  const hasBirthSign = useMemo(() => !!characterProgress?.birthSign, [characterProgress]);

  // Fetch current zodiac sign
  const fetchCurrentSign = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/zodiac/current');
      if (response.data.success && response.data.data?.sign) {
        setCurrentSign(response.data.data.sign);
      } else {
        // Use client-side calculation as fallback
        setCurrentSign(getCurrentSign());
      }
    } catch (err: any) {
      // Use client-side calculation as fallback
      setCurrentSign(getCurrentSign());
      logger.warn('Using client-side zodiac calculation', { context: 'useZodiac', error: err.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch character's zodiac progress
  const fetchProgress = useCallback(async () => {
    if (!currentCharacter) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/zodiac/progress');
      if (response.data.success && response.data.data?.progress) {
        setCharacterProgress(response.data.data.progress);
      } else {
        // Use default progress
        setCharacterProgress(generateDefaultProgress(currentCharacter._id));
      }
    } catch (err: any) {
      // Use default progress as fallback
      if (currentCharacter) {
        setCharacterProgress(generateDefaultProgress(currentCharacter._id));
      }
      logger.warn('Using default zodiac progress', { context: 'useZodiac', error: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [currentCharacter]);

  // Fetch peak day event
  const fetchPeakDayEvent = useCallback(async () => {
    if (!checkIsPeakDay()) {
      setPeakDayEvent(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/zodiac/peak-day');
      if (response.data.success && response.data.data) {
        setPeakDayEvent(response.data.data);
      }
    } catch (err: any) {
      // Create a local peak day event
      const sign = getCurrentSign();
      setPeakDayEvent({
        signId: sign.id,
        signName: sign.name,
        date: new Date(),
        isActive: true,
        hoursRemaining: 24,
        activeBonuses: sign.peakBonuses.map(b => ({ ...b, isActive: true })),
        specialContent: {
          npcs: [],
          bounties: [],
          events: [],
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set character's birth sign
  const setBirthSign = useCallback(async (signId: ZodiacSignId): Promise<{ success: boolean; message: string }> => {
    if (!currentCharacter) {
      return { success: false, message: 'No character selected' };
    }

    if (characterProgress?.birthSign) {
      return { success: false, message: 'Birth sign already set. This choice is permanent.' };
    }

    setIsSettingBirthSign(true);
    setError(null);

    try {
      const response = await api.post('/zodiac/birth-sign', { signId });

      if (response.data.success) {
        await refreshCharacter();
        await fetchProgress();
        return {
          success: true,
          message: `Your birth sign has been set to ${getSignById(signId)?.name || signId}!`,
        };
      }

      return { success: false, message: response.data.message || 'Failed to set birth sign' };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to set birth sign';
      setError(message);

      // Optimistic update for demo purposes
      if (characterProgress) {
        setCharacterProgress({
          ...characterProgress,
          birthSign: signId,
          birthSignSelectedAt: new Date(),
        });
        return { success: true, message: `Birth sign set to ${getSignById(signId)?.name}` };
      }

      return { success: false, message };
    } finally {
      setIsSettingBirthSign(false);
    }
  }, [currentCharacter, characterProgress, refreshCharacter, fetchProgress]);

  // Claim constellation reward
  const claimConstellation = useCallback(async (signId: ZodiacSignId): Promise<{ success: boolean; reward?: ConstellationRewardData }> => {
    if (!currentCharacter || !characterProgress) {
      return { success: false };
    }

    const constellation = characterProgress.constellations[signId];
    if (!constellation?.isComplete) {
      setError('Constellation is not complete');
      return { success: false };
    }

    if (characterProgress.claimedRewards.includes(signId)) {
      setError('Reward already claimed');
      return { success: false };
    }

    setIsClaimingReward(true);
    setError(null);

    try {
      const response = await api.post(`/zodiac/constellation/${signId}/claim`);

      if (response.data.success) {
        await refreshCharacter();
        await fetchProgress();
        return {
          success: true,
          reward: response.data.data?.reward,
        };
      }

      return { success: false };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to claim reward';
      setError(message);
      return { success: false };
    } finally {
      setIsClaimingReward(false);
    }
  }, [currentCharacter, characterProgress, refreshCharacter, fetchProgress]);

  // Fetch sign-exclusive NPCs
  const fetchSignNPCs = useCallback(async (signId: ZodiacSignId): Promise<PeakDayNPC[]> => {
    try {
      const response = await api.get('/zodiac/npcs', { params: { signId } });
      return response.data.data?.npcs || [];
    } catch {
      return [];
    }
  }, []);

  // Fetch sign-exclusive bounties
  const fetchSignBounties = useCallback(async (signId: ZodiacSignId): Promise<PeakDayBounty[]> => {
    try {
      const response = await api.get('/zodiac/bounties', { params: { signId } });
      return response.data.data?.bounties || [];
    } catch {
      return [];
    }
  }, []);

  // Get constellation for a sign
  const getConstellation = useCallback((signId: ZodiacSignId): Constellation | null => {
    if (!characterProgress) return null;
    return characterProgress.constellations[signId] || null;
  }, [characterProgress]);

  // Get sign colors
  const getSignColors = useCallback((signId: ZodiacSignId) => {
    const sign = getSignById(signId);
    return sign?.colors || null;
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    currentSign,
    characterProgress,
    calendar: FRONTIER_SIGNS,
    isPeakDay,
    peakDayEvent,

    // Loading states
    isLoading,
    isSettingBirthSign,
    isClaimingReward,
    error,

    // Actions
    fetchCurrentSign,
    fetchProgress,
    fetchPeakDayEvent,
    setBirthSign,
    claimConstellation,
    fetchSignNPCs,
    fetchSignBounties,
    clearError,

    // Computed
    activeBonuses,
    daysUntilNextSign,
    daysUntilPeakDay,
    birthSign,
    hasBirthSign,

    // Helpers
    getConstellation,
    getSignColors,
  };
};

export default useZodiac;
