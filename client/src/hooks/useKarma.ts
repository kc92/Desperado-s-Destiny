/**
 * useKarma Hook
 * Subscribe to socket events and provide convenient access to karma data
 *
 * DEITY SYSTEM - Phase 4
 */

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { socketService } from '@/services/socket.service';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useKarmaStore, KarmaToast } from '@/store/useKarmaStore';
import {
  KarmaSummary,
  KarmaEffects,
  DivineManifestation,
  Blessing,
  Curse,
  DeityName,
  karmaService,
} from '@/services/karma.service';

// ============================================================================
// RETURN TYPE
// ============================================================================

export interface UseKarmaReturn {
  // Data
  karma: KarmaSummary | null;
  effects: KarmaEffects | null;
  manifestations: DivineManifestation[];
  unacknowledgedCount: number;
  toasts: KarmaToast[];
  pendingManifestation: DivineManifestation | null;

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  acknowledgeManifestation: (id: string, response?: string) => Promise<void>;
  dismissPendingManifestation: () => void;
  removeToast: (toastId: string) => void;
  dismissToast: (toastId: string) => void; // Alias for removeToast

  // Computed
  hasBlessings: boolean;
  hasCurses: boolean;
  hasActiveEffects: boolean;
  dominantDeity: DeityName | null;
  isInFavor: (deity: DeityName) => boolean;
  getDeityRelationship: (deity: DeityName) => string;
  getBlessings: () => Blessing[];
  getCurses: () => Curse[];
}

// ============================================================================
// GLOBAL FETCH TRACKING (prevents duplicate fetches across hook instances)
// ============================================================================

// Track which character IDs have been fetched to prevent duplicate API calls
// when multiple components use useKarma() simultaneously
let lastFetchedCharacterId: string | null = null;
let fetchInProgress = false;

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const useKarma = (): UseKarmaReturn => {
  const { currentCharacter } = useCharacterStore();
  const {
    karma,
    effects,
    manifestations,
    unacknowledgedCount,
    isLoading,
    error,
    toasts,
    pendingManifestation,
    fetchKarma,
    fetchEffects,
    fetchManifestations,
    acknowledgeManifestation: storeAcknowledge,
    removeToast,
    setPendingManifestation,
  } = useKarmaStore();

  // Track if this instance has initiated a fetch
  const hasInitiatedFetch = useRef(false);

  // =========================================================================
  // Initial Data Fetch (with deduplication)
  // =========================================================================

  useEffect(() => {
    const characterId = currentCharacter?._id;
    if (!characterId) return;

    // Skip if already fetched for this character or fetch is in progress
    if (lastFetchedCharacterId === characterId || fetchInProgress) {
      return;
    }

    // Mark fetch as in progress to prevent duplicate calls from other instances
    fetchInProgress = true;
    hasInitiatedFetch.current = true;

    const doFetch = async () => {
      try {
        await Promise.all([
          fetchKarma(characterId),
          fetchEffects(characterId),
          fetchManifestations(characterId, true),
        ]);
        lastFetchedCharacterId = characterId;
      } finally {
        fetchInProgress = false;
      }
    };

    doFetch();

    // Cleanup on unmount or character change
    return () => {
      // If this instance initiated the fetch and character changes, reset tracking
      if (hasInitiatedFetch.current && lastFetchedCharacterId !== characterId) {
        hasInitiatedFetch.current = false;
      }
    };
  }, [currentCharacter?._id]); // Only depend on character ID, not fetch functions

  // =========================================================================
  // Socket Event Subscriptions (stable - only re-subscribes when character changes)
  // =========================================================================

  useEffect(() => {
    const characterId = currentCharacter?._id;
    if (!characterId) return;

    // Get handlers from store at call time to ensure we use latest state
    const getHandlers = () => useKarmaStore.getState();

    // Handler wrappers - get fresh handlers from store inside each callback
    const onKarmaUpdate = (data: {
      characterId: string;
      dimension: string;
      delta: number;
      newValue: number;
    }) => {
      if (data.characterId === characterId) {
        getHandlers().handleKarmaUpdate(data);
      }
    };

    const onBlessingGranted = (data: {
      characterId: string;
      type: string;
      description: string;
      source: DeityName;
      duration?: number;
    }) => {
      if (data.characterId === characterId) {
        getHandlers().handleBlessingGranted(data);
      }
    };

    const onCurseInflicted = (data: {
      characterId: string;
      type: string;
      description: string;
      source: DeityName;
      removalCondition?: string;
    }) => {
      if (data.characterId === characterId) {
        getHandlers().handleCurseInflicted(data);
      }
    };

    const onBlessingExpired = (data: {
      characterId: string;
      type: string;
      source: DeityName;
      message: string;
    }) => {
      if (data.characterId === characterId) {
        getHandlers().handleBlessingExpired(data);
      }
    };

    const onCurseExpired = (data: {
      characterId: string;
      type: string;
      source: DeityName;
      message: string;
    }) => {
      if (data.characterId === characterId) {
        getHandlers().handleCurseExpired(data);
      }
    };

    const onDivineMessage = (data: {
      id: string;
      deity: DeityName;
      type: string;
      message: string;
      urgency: number;
      characterId: string;
      timestamp: string;
    }) => {
      if (data.characterId === characterId) {
        const manifestation: DivineManifestation = {
          id: data.id,
          deityName: data.deity,
          type: data.type as DivineManifestation['type'],
          message: data.message,
          urgency: data.urgency,
          delivered: true,
          acknowledged: false,
          createdAt: data.timestamp,
        };
        getHandlers().handleDivineMessage(manifestation);
      }
    };

    const onAffinityChange = (data: {
      characterId: string;
      deity: DeityName;
      delta: number;
      newValue: number;
    }) => {
      if (data.characterId === characterId) {
        getHandlers().handleAffinityChange(data);
      }
    };

    // Subscribe to socket events
    // Using 'as any' because these events aren't in the shared types yet
    socketService.on('karma:update' as any, onKarmaUpdate);
    socketService.on('divine:message' as any, onDivineMessage);
    socketService.on('divine:blessing' as any, onBlessingGranted);
    socketService.on('divine:curse' as any, onCurseInflicted);
    socketService.on('divine:blessing_expired' as any, onBlessingExpired);
    socketService.on('divine:curse_expired' as any, onCurseExpired);
    socketService.on('karma:affinity_change' as any, onAffinityChange);

    // Cleanup
    return () => {
      socketService.off('karma:update' as any, onKarmaUpdate);
      socketService.off('divine:message' as any, onDivineMessage);
      socketService.off('divine:blessing' as any, onBlessingGranted);
      socketService.off('divine:curse' as any, onCurseInflicted);
      socketService.off('divine:blessing_expired' as any, onBlessingExpired);
      socketService.off('divine:curse_expired' as any, onCurseExpired);
      socketService.off('karma:affinity_change' as any, onAffinityChange);
    };
  }, [currentCharacter?._id]); // Only depend on character ID for stability

  // =========================================================================
  // Actions
  // =========================================================================

  const refresh = useCallback(async () => {
    if (currentCharacter?._id) {
      await Promise.all([
        fetchKarma(currentCharacter._id),
        fetchEffects(currentCharacter._id),
        fetchManifestations(currentCharacter._id, true),
      ]);
    }
  }, [currentCharacter?._id, fetchKarma, fetchEffects, fetchManifestations]);

  const acknowledgeManifestation = useCallback(
    async (id: string, response?: string) => {
      await storeAcknowledge(id, response);
    },
    [storeAcknowledge]
  );

  const dismissPendingManifestation = useCallback(() => {
    setPendingManifestation(null);
  }, [setPendingManifestation]);

  // =========================================================================
  // Computed Values
  // =========================================================================

  const hasBlessings = useMemo(() => {
    return (karma?.activeBlessings?.length ?? 0) > 0;
  }, [karma?.activeBlessings]);

  const hasCurses = useMemo(() => {
    return (karma?.activeCurses?.length ?? 0) > 0;
  }, [karma?.activeCurses]);

  const hasActiveEffects = useMemo(() => {
    return hasBlessings || hasCurses;
  }, [hasBlessings, hasCurses]);

  const dominantDeity = useMemo((): DeityName | null => {
    if (!karma) return null;

    const gamblerAffinity = karma.deityRelationships.gambler.affinity;
    const outlawKingAffinity = karma.deityRelationships.outlawKing.affinity;

    // Return deity with higher absolute affinity, or null if both are near neutral
    if (Math.abs(gamblerAffinity) < 10 && Math.abs(outlawKingAffinity) < 10) {
      return null;
    }

    return Math.abs(gamblerAffinity) >= Math.abs(outlawKingAffinity)
      ? 'GAMBLER'
      : 'OUTLAW_KING';
  }, [karma]);

  const isInFavor = useCallback(
    (deity: DeityName): boolean => {
      if (!karma) return false;

      const affinity =
        deity === 'GAMBLER'
          ? karma.deityRelationships.gambler.affinity
          : karma.deityRelationships.outlawKing.affinity;

      return affinity >= 25;
    },
    [karma]
  );

  const getDeityRelationship = useCallback(
    (deity: DeityName): string => {
      if (!karma) return 'Unknown';

      const relationship =
        deity === 'GAMBLER'
          ? karma.deityRelationships.gambler
          : karma.deityRelationships.outlawKing;

      return (
        relationship.relationship ||
        karmaService.getAffinityDescription(relationship.affinity)
      );
    },
    [karma]
  );

  const getBlessings = useCallback((): Blessing[] => {
    return karma?.activeBlessings ?? [];
  }, [karma]);

  const getCurses = useCallback((): Curse[] => {
    return karma?.activeCurses ?? [];
  }, [karma]);

  // =========================================================================
  // Return
  // =========================================================================

  return {
    // Data
    karma,
    effects,
    manifestations,
    unacknowledgedCount,
    toasts,
    pendingManifestation,

    // State
    isLoading,
    error,

    // Actions
    refresh,
    acknowledgeManifestation,
    dismissPendingManifestation,
    removeToast,
    dismissToast: removeToast, // Alias for removeToast

    // Computed
    hasBlessings,
    hasCurses,
    hasActiveEffects,
    dominantDeity,
    isInFavor,
    getDeityRelationship,
    getBlessings,
    getCurses,
  };
};

export default useKarma;
