/**
 * useFateMarks Hook
 * Manages fate marks - accumulated bad luck that increases death risk
 */

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';
import { logger } from '@/services/logger.service';
import { FateMark, FATE_MARK_CONFIG as SHARED_CONFIG } from '@desperados/shared';
// FateMarkSource available for future mark source tracking

// Fallback config in case shared package build fails
const FATE_MARK_CONFIG = SHARED_CONFIG || {
  maxMarks: 5,
  decayHours: 24,
  churchCleanse: { min: 1, max: 2 },
  cleanseCostPerMark: 100,
  destinyDeckCriticalThreshold: 0.10
};

export interface FateMarksState {
  /** Current fate marks */
  marks: FateMark[];
  /** Number of marks (0-5) */
  count: number;
  /** Whether at maximum marks */
  isMaxed: boolean;
  /** Time until next mark decays (ms) */
  timeToDecay: number | null;
}

interface UseFateMarksReturn {
  fateMarks: FateMarksState;
  isLoading: boolean;
  error: string | null;
  fetchFateMarks: () => Promise<void>;
  cleanseFateMarks: (locationId: string) => Promise<{ success: boolean; message: string; cleansedCount?: number; cost?: number }>;
  clearError: () => void;
}

/**
 * Get the danger class based on fate mark count
 */
export const getFateMarkDangerClass = (count: number): string => {
  if (count === 0) return '';
  if (count <= 2) return 'fate-marks-low';
  if (count <= 4) return 'fate-marks-medium';
  return 'fate-marks-critical';
};

/**
 * Get tooltip text for fate marks
 */
export const getFateMarkTooltip = (count: number): string => {
  if (count === 0) return '';
  if (count === 1) return 'Fate stirs... (1 mark)';
  if (count === 2) return 'The spirits are watching... (2 marks)';
  if (count === 3) return 'Death circles closer... (3 marks)';
  if (count === 4) return 'The reaper sharpens his scythe... (4 marks)';
  return 'Death awaits your next misstep... (5 marks)';
};

export const useFateMarks = (): UseFateMarksReturn => {
  const [fateMarks, setFateMarks] = useState<FateMarksState>({
    marks: [],
    count: 0,
    isMaxed: false,
    timeToDecay: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentCharacter } = useCharacterStore();

  // Calculate time to next decay
  const calculateTimeToDecay = useCallback((marks: FateMark[]): number | null => {
    if (marks.length === 0) return null;

    // Find the oldest mark
    const sortedMarks = [...marks].sort(
      (a, b) => new Date(a.acquiredAt).getTime() - new Date(b.acquiredAt).getTime()
    );

    const oldestMark = sortedMarks[0];
    const decayTime = new Date(oldestMark.acquiredAt).getTime() + (FATE_MARK_CONFIG.decayHours * 60 * 60 * 1000);
    const now = Date.now();

    return decayTime > now ? decayTime - now : 0;
  }, []);

  // Fetch current fate marks from server
  const fetchFateMarks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { fateMarks: FateMark[] } }>('/death/fate-marks');
      const marks = response.data.data.fateMarks || [];

      setFateMarks({
        marks,
        count: marks.length,
        isMaxed: marks.length >= FATE_MARK_CONFIG.maxMarks,
        timeToDecay: calculateTimeToDecay(marks),
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch fate marks';
      setError(errorMessage);
      logger.error('[useFateMarks] Fetch error:', err as Error, { context: { errorMessage } });
    } finally {
      setIsLoading(false);
    }
  }, [calculateTimeToDecay]);

  // Cleanse fate marks at a holy location
  const cleanseFateMarks = useCallback(async (locationId: string): Promise<{
    success: boolean;
    message: string;
    cleansedCount?: number;
    cost?: number;
  }> => {
    try {
      const response = await api.post<{
        data: {
          message: string;
          cleansedCount: number;
          cost: number;
          remainingMarks: FateMark[];
        }
      }>('/death/cleanse-fate-marks', { locationId });

      const { message, cleansedCount, cost, remainingMarks } = response.data.data;

      // Update local state
      setFateMarks({
        marks: remainingMarks,
        count: remainingMarks.length,
        isMaxed: remainingMarks.length >= FATE_MARK_CONFIG.maxMarks,
        timeToDecay: calculateTimeToDecay(remainingMarks),
      });

      return { success: true, message, cleansedCount, cost };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to cleanse fate marks';
      setError(errorMessage);
      logger.error('[useFateMarks] Cleanse error:', err as Error, { context: { locationId, errorMessage } });
      return { success: false, message: errorMessage };
    }
  }, [calculateTimeToDecay]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Sync with character data if available
  // Note: fateMarks may be populated by server but not in SafeCharacter type
  useEffect(() => {
    const charFateMarks = (currentCharacter as { fateMarks?: FateMark[] })?.fateMarks;
    if (charFateMarks) {
      const marks = charFateMarks;
      setFateMarks({
        marks,
        count: marks.length,
        isMaxed: marks.length >= FATE_MARK_CONFIG.maxMarks,
        timeToDecay: calculateTimeToDecay(marks),
      });
    }
  }, [(currentCharacter as { fateMarks?: FateMark[] })?.fateMarks, calculateTimeToDecay]);

  // Update decay timer periodically
  useEffect(() => {
    if (fateMarks.marks.length === 0) return;

    const interval = setInterval(() => {
      setFateMarks(prev => ({
        ...prev,
        timeToDecay: calculateTimeToDecay(prev.marks),
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [fateMarks.marks.length, calculateTimeToDecay]);

  return {
    fateMarks,
    isLoading,
    error,
    fetchFateMarks,
    cleanseFateMarks,
    clearError,
  };
};

export default useFateMarks;
