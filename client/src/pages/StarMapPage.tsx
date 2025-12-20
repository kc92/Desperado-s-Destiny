/**
 * StarMapPage
 * Full-screen constellation viewer for the Frontier Zodiac system
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import {
  SignCard,
  ConstellationViewer,
  SignBonusDisplay,
  PeakDayBanner,
  ConstellationReward,
} from '@/components/zodiac';
import { useZodiac } from '@/hooks/useZodiac';
import { SIGN_COLORS, FRONTIER_SIGNS } from '@/constants/zodiac.constants';
import type { FrontierSign } from '@/types/zodiac.types';

/**
 * Star Map Page component
 */
export const StarMapPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentSign,
    characterProgress,
    isPeakDay,
    peakDayEvent,
    birthSign,
    activeBonuses,
    fetchCurrentSign,
    fetchProgress,
    fetchPeakDayEvent,
    claimConstellation,
    getConstellation,
    isLoading,
    isClaimingReward,
  } = useZodiac();

  const [selectedSign, setSelectedSign] = useState<FrontierSign | null>(null);
  const [viewMode, setViewMode] = useState<'circular' | 'grid'>('circular');

  // Fetch data on mount
  useEffect(() => {
    fetchCurrentSign();
    fetchProgress();
    fetchPeakDayEvent();
  }, [fetchCurrentSign, fetchProgress, fetchPeakDayEvent]);

  // Set initial selected sign to current
  useEffect(() => {
    if (currentSign && !selectedSign) {
      setSelectedSign(currentSign);
    }
  }, [currentSign, selectedSign]);

  // Get constellation for selected sign
  const selectedConstellation = useMemo(() => {
    if (!selectedSign) return null;
    return getConstellation(selectedSign.id);
  }, [selectedSign, getConstellation]);

  // Calculate total progress
  const totalProgress = useMemo(() => {
    if (!characterProgress) return { stars: 0, total: 0, complete: 0 };

    let stars = 0;
    let total = 0;
    let complete = 0;

    Object.values(characterProgress.constellations).forEach(c => {
      stars += c.earnedStars;
      total += c.totalStars;
      if (c.isComplete) complete++;
    });

    return { stars, total, complete };
  }, [characterProgress]);

  // Handle constellation claim
  const handleClaimReward = async () => {
    if (!selectedSign || !selectedConstellation?.reward) return;
    await claimConstellation(selectedSign.id);
  };

  if (isLoading && !currentSign) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-western text-gold-light tracking-wide">
            Star Map
          </h1>
          <p className="text-desert-stone">
            Track your progress across the Frontier Zodiac constellations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'circular' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('circular')}
          >
            Circular
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
        </div>
      </div>

      {/* Peak Day Banner */}
      {isPeakDay && currentSign && (
        <PeakDayBanner
          sign={currentSign}
          event={peakDayEvent}
          variant="compact"
          onViewDetails={() => navigate('/game/zodiac-calendar')}
        />
      )}

      {/* Progress Overview */}
      <Card variant="leather" className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-western text-gold-light">
              {totalProgress.stars}
            </div>
            <div className="text-sm text-desert-stone">Stars Earned</div>
          </div>
          <div>
            <div className="text-3xl font-western text-gold-light">
              {totalProgress.complete}/12
            </div>
            <div className="text-sm text-desert-stone">Constellations Complete</div>
          </div>
          <div>
            <div className="text-3xl font-western text-gold-light">
              {Math.round((totalProgress.stars / Math.max(totalProgress.total, 1)) * 100)}%
            </div>
            <div className="text-sm text-desert-stone">Total Progress</div>
          </div>
        </div>
      </Card>

      {/* Main Content - Star Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Constellation Display */}
        <div className="lg:col-span-2">
          {viewMode === 'circular' ? (
            // Circular sky view
            <Card variant="leather" padding="none" className="relative overflow-hidden">
              {/* Night sky background */}
              <div
                className="relative aspect-square max-h-[600px] mx-auto bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900"
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 1) 100%)',
                }}
              >
                {/* Background stars */}
                <div className="absolute inset-0">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.7 + 0.3,
                        animationDelay: `${Math.random() * 5}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Circular constellation ring */}
                <div className="absolute inset-8">
                  {FRONTIER_SIGNS.map((sign, index) => {
                    const angle = (index / 12) * 2 * Math.PI - Math.PI / 2;
                    const radius = 42;
                    const x = 50 + radius * Math.cos(angle);
                    const y = 50 + radius * Math.sin(angle);

                    const constellation = getConstellation(sign.id);
                    const isActive = currentSign?.id === sign.id;
                    const isSelected = selectedSign?.id === sign.id;
                    const isBirth = birthSign?.id === sign.id;
                    const colors = SIGN_COLORS[sign.id];

                    return (
                      <button
                        key={sign.id}
                        onClick={() => setSelectedSign(sign)}
                        className={`
                          absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2
                          rounded-full flex items-center justify-center
                          transition-all duration-300
                          ${colors?.bgClass || 'bg-amber-500/20'}
                          border-2 ${isSelected
                            ? 'border-gold-light ring-4 ring-gold-dark/50 scale-125 z-20'
                            : isActive
                              ? 'border-gold-medium ring-2 ring-gold-dark/30 z-10'
                              : colors?.borderClass || 'border-amber-500/30'
                          }
                          hover:scale-110 hover:z-10
                          ${constellation?.isComplete ? 'shadow-lg shadow-gold-dark/50' : ''}
                        `}
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                        }}
                        title={`${sign.name} - ${constellation?.earnedStars || 0}/${constellation?.totalStars || 0} stars`}
                      >
                        <span
                          className="text-2xl"
                          style={{
                            textShadow: isActive || constellation?.isComplete
                              ? `0 0 15px ${colors?.glow || 'rgba(255,215,0,0.6)'}`
                              : 'none',
                            filter: constellation?.earnedStars ? 'none' : 'grayscale(50%)',
                          }}
                        >
                          {sign.iconEmoji}
                        </span>

                        {/* Progress indicator */}
                        {constellation && !constellation.isComplete && constellation.earnedStars > 0 && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-gold-light bg-wood-dark/80 px-1 rounded">
                            {constellation.earnedStars}/{constellation.totalStars}
                          </div>
                        )}

                        {/* Complete indicator */}
                        {constellation?.isComplete && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-light rounded-full flex items-center justify-center text-wood-dark text-xs font-bold">
                            ✓
                          </div>
                        )}

                        {/* Birth sign indicator */}
                        {isBirth && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs">
                            ⭐
                          </div>
                        )}

                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-full animate-ping border-2 border-gold-light opacity-30" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Center display - Selected constellation */}
                {selectedSign && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-40">
                      <ConstellationViewer
                        sign={selectedSign}
                        constellation={selectedConstellation}
                        size="full"
                        showProgress={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            // Grid view
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {FRONTIER_SIGNS.map(sign => {
                const constellation = getConstellation(sign.id);
                const isActive = currentSign?.id === sign.id;
                const isSelected = selectedSign?.id === sign.id;
                const isBirth = birthSign?.id === sign.id;

                return (
                  <div
                    key={sign.id}
                    onClick={() => setSelectedSign(sign)}
                    className={`
                      cursor-pointer transition-all duration-200
                      ${isSelected ? 'scale-105' : 'hover:scale-102'}
                    `}
                  >
                    <SignCard
                      sign={sign}
                      isActive={isActive}
                      isSelected={isSelected}
                      isBirthSign={isBirth}
                      showDates={false}
                      size="sm"
                    />
                    {constellation && (
                      <div className="mt-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${SIGN_COLORS[sign.id]?.gradient || 'from-amber-500 to-orange-600'}`}
                          style={{ width: `${(constellation.earnedStars / constellation.totalStars) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side Panel - Selected Sign Details */}
        <div className="space-y-4">
          {selectedSign ? (
            <>
              {/* Sign Info */}
              <Card variant="leather" className="p-4">
                <div className="text-center mb-4">
                  <div
                    className="text-6xl mb-2"
                    style={{
                      textShadow: `0 0 20px ${SIGN_COLORS[selectedSign.id]?.glow || 'rgba(255,215,0,0.5)'}`,
                    }}
                  >
                    {selectedSign.iconEmoji}
                  </div>
                  <h2 className={`font-western text-2xl ${SIGN_COLORS[selectedSign.id]?.textClass || 'text-gold-light'}`}>
                    {selectedSign.name}
                  </h2>
                  <p className="text-desert-stone text-sm italic">{selectedSign.theme}</p>

                  {/* Badges */}
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {currentSign?.id === selectedSign.id && (
                      <span className="text-xs bg-green-500/50 text-green-200 px-2 py-0.5 rounded">
                        Current Sign
                      </span>
                    )}
                    {birthSign?.id === selectedSign.id && (
                      <span className="text-xs bg-purple-500/50 text-purple-200 px-2 py-0.5 rounded">
                        Your Birth Sign
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-desert-sand text-sm mb-4">{selectedSign.description}</p>

                {/* Constellation Progress */}
                {selectedConstellation && (
                  <div className="p-3 bg-wood-dark/30 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-desert-stone">Constellation Progress</span>
                      <span className={SIGN_COLORS[selectedSign.id]?.textClass || 'text-gold-light'}>
                        {selectedConstellation.earnedStars}/{selectedConstellation.totalStars} Stars
                      </span>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${SIGN_COLORS[selectedSign.id]?.gradient || 'from-amber-500 to-orange-600'} transition-all duration-500`}
                        style={{ width: `${(selectedConstellation.earnedStars / selectedConstellation.totalStars) * 100}%` }}
                      />
                    </div>
                    {selectedConstellation.isComplete && (
                      <div className="text-center mt-2 text-gold-light text-sm font-western animate-pulse">
                        Constellation Complete!
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Sign Bonuses */}
              {currentSign?.id === selectedSign.id && (
                <Card variant="wood" className="p-4">
                  <SignBonusDisplay
                    bonuses={activeBonuses}
                    signName={selectedSign.name}
                    isPeakDay={isPeakDay}
                    layout="vertical"
                    size="sm"
                  />
                </Card>
              )}

              {/* Constellation Reward */}
              {selectedConstellation?.reward && (
                <ConstellationReward
                  sign={selectedSign}
                  reward={selectedConstellation.reward}
                  isComplete={selectedConstellation.isComplete}
                  onClaim={handleClaimReward}
                  isClaimLoading={isClaimingReward}
                />
              )}

              {/* Lore */}
              <Card variant="parchment" className="p-4">
                <h4 className="font-western text-western-text mb-2">Lore</h4>
                <p className="text-western-text/80 text-sm font-serif italic">
                  "{selectedSign.lore}"
                </p>
              </Card>
            </>
          ) : (
            <Card variant="leather" className="p-6 text-center">
              <div className="text-4xl mb-3 opacity-50">⭐</div>
              <p className="text-desert-stone">
                Select a constellation from the star map to view details
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StarMapPage;
