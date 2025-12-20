/**
 * ZodiacCalendarPage
 * Full year view of the Frontier Zodiac calendar system
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import {
  SignBonusDisplay,
  PeakDayBanner,
  PeakDayCountdown,
  BirthSignSelector,
  SignNPCList,
  SignBountyList,
} from '@/components/zodiac';
import { useZodiac } from '@/hooks/useZodiac';
import { SIGN_COLORS, FRONTIER_SIGNS } from '@/constants/zodiac.constants';
import type { FrontierSign, ZodiacSignId, PeakDayNPC, PeakDayBounty } from '@/types/zodiac.types';
import { logger } from '@/services/logger.service';

/**
 * Month names for calendar display
 */
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Format date range
 */
function formatDateRange(sign: FrontierSign): string {
  return `${MONTHS[sign.startMonth - 1]} ${sign.startDay} - ${MONTHS[sign.endMonth - 1]} ${sign.endDay}`;
}

/**
 * Zodiac Calendar Page component
 */
export const ZodiacCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentSign,
    characterProgress,
    isPeakDay,
    peakDayEvent,
    birthSign,
    hasBirthSign,
    activeBonuses,
    daysUntilNextSign,
    daysUntilPeakDay,
    fetchCurrentSign,
    fetchProgress,
    fetchPeakDayEvent,
    setBirthSign,
    fetchSignNPCs,
    fetchSignBounties,
    isLoading,
    isSettingBirthSign,
  } = useZodiac();

  const [selectedSign, setSelectedSign] = useState<FrontierSign | null>(null);
  const [showBirthSignSelector, setShowBirthSignSelector] = useState(false);
  const [signNPCs, setSignNPCs] = useState<PeakDayNPC[]>([]);
  const [signBounties, setSignBounties] = useState<PeakDayBounty[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

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

  // Fetch sign-exclusive content when selected sign changes
  useEffect(() => {
    if (!selectedSign) return;

    const fetchContent = async () => {
      setLoadingContent(true);
      try {
        const [npcs, bounties] = await Promise.all([
          fetchSignNPCs(selectedSign.id),
          fetchSignBounties(selectedSign.id),
        ]);
        setSignNPCs(npcs);
        setSignBounties(bounties);
      } catch (err) {
        logger.error('Failed to fetch sign content', err as Error, { context: 'ZodiacCalendarPage' });
      } finally {
        setLoadingContent(false);
      }
    };

    fetchContent();
  }, [selectedSign, fetchSignNPCs, fetchSignBounties]);

  // Calculate next sign
  const nextSign = useMemo(() => {
    if (!currentSign) return null;
    const currentIndex = FRONTIER_SIGNS.findIndex(s => s.id === currentSign.id);
    return FRONTIER_SIGNS[(currentIndex + 1) % 12];
  }, [currentSign]);

  // Handle birth sign selection
  const handleSetBirthSign = async (signId: ZodiacSignId) => {
    return setBirthSign(signId);
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
            Frontier Zodiac
          </h1>
          <p className="text-desert-stone">
            The celestial calendar of the Wild West
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('/game/star-map')}
        >
          View Star Map
        </Button>
      </div>

      {/* Peak Day Banner (if active) */}
      {isPeakDay && currentSign && (
        <PeakDayBanner
          sign={currentSign}
          event={peakDayEvent}
          variant="full"
        />
      )}

      {/* Current Sign Overview */}
      {currentSign && !isPeakDay && (
        <Card variant="leather" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Sign */}
            <div className="text-center">
              <div className="text-xs text-desert-stone uppercase tracking-wider mb-2">
                Current Sign
              </div>
              <div
                className="text-6xl mb-2"
                style={{
                  textShadow: `0 0 20px ${SIGN_COLORS[currentSign.id]?.glow || 'rgba(255,215,0,0.5)'}`,
                }}
              >
                {currentSign.iconEmoji}
              </div>
              <h2 className={`font-western text-2xl ${SIGN_COLORS[currentSign.id]?.textClass || 'text-gold-light'}`}>
                {currentSign.name}
              </h2>
              <p className="text-desert-stone text-sm italic">{currentSign.theme}</p>
              <p className="text-sm text-desert-sand mt-2">
                {formatDateRange(currentSign)}
              </p>
            </div>

            {/* Timeline Info */}
            <div className="flex flex-col justify-center space-y-4">
              <div className="text-center p-3 bg-wood-dark/30 rounded-lg">
                <div className="text-xs text-desert-stone">Days Remaining</div>
                <div className={`text-3xl font-western ${SIGN_COLORS[currentSign.id]?.textClass || 'text-gold-light'}`}>
                  {daysUntilNextSign}
                </div>
              </div>
              <div className="text-center p-3 bg-wood-dark/30 rounded-lg">
                <div className="text-xs text-desert-stone">Peak Day</div>
                <div className={`text-3xl font-western ${SIGN_COLORS[currentSign.id]?.textClass || 'text-gold-light'}`}>
                  {daysUntilPeakDay === 0 ? 'Today!' : `In ${daysUntilPeakDay} days`}
                </div>
                <div className="text-xs text-desert-sand">
                  {MONTHS[currentSign.peakMonth - 1]} {currentSign.peakDay}
                </div>
              </div>
            </div>

            {/* Next Sign Preview */}
            {nextSign && (
              <div className="text-center opacity-70">
                <div className="text-xs text-desert-stone uppercase tracking-wider mb-2">
                  Coming Next
                </div>
                <div className="text-4xl mb-2 opacity-50">
                  {nextSign.iconEmoji}
                </div>
                <h3 className="font-western text-lg text-desert-sand">
                  {nextSign.name}
                </h3>
                <p className="text-desert-stone text-sm italic">{nextSign.theme}</p>
                <p className="text-xs text-desert-stone mt-2">
                  Starts {MONTHS[nextSign.startMonth - 1]} {nextSign.startDay}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Birth Sign Section */}
      <Card variant="leather" className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-western text-xl text-desert-sand">Your Birth Sign</h3>
          {!hasBirthSign && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowBirthSignSelector(true)}
            >
              Choose Birth Sign
            </Button>
          )}
        </div>

        {birthSign ? (
          <div className="flex items-center gap-4">
            <div
              className="text-5xl"
              style={{
                textShadow: `0 0 15px ${SIGN_COLORS[birthSign.id]?.glow || 'rgba(255,215,0,0.5)'}`,
              }}
            >
              {birthSign.iconEmoji}
            </div>
            <div className="flex-1">
              <h4 className={`font-western text-lg ${SIGN_COLORS[birthSign.id]?.textClass || 'text-gold-light'}`}>
                {birthSign.name}
              </h4>
              <p className="text-desert-stone text-sm italic">{birthSign.theme}</p>
              <p className="text-xs text-desert-sand mt-1">
                {birthSign.id === currentSign?.id
                  ? 'Your birth sign is currently active! (+10% bonus)'
                  : `Active: ${formatDateRange(birthSign)}`
                }
              </p>
            </div>
            {birthSign.id === currentSign?.id && (
              <span className="text-xs bg-purple-500/50 text-purple-200 px-3 py-1 rounded-full animate-pulse">
                Active Now!
              </span>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-2 opacity-50">❓</div>
            <p className="text-desert-stone text-sm">
              You haven't chosen a birth sign yet.
            </p>
            <p className="text-xs text-desert-stone/70 mt-1">
              Your birth sign grants permanent bonuses when its constellation is active.
            </p>
          </div>
        )}
      </Card>

      {/* Active Bonuses (if current sign) */}
      {activeBonuses.length > 0 && (
        <Card variant="wood" className="p-4">
          <SignBonusDisplay
            bonuses={activeBonuses}
            signName={currentSign?.name}
            isPeakDay={isPeakDay}
            layout="grid"
            size="md"
          />
        </Card>
      )}

      {/* Full Year Calendar */}
      <Card variant="leather" className="p-4">
        <h3 className="font-western text-xl text-desert-sand mb-4">
          The Frontier Zodiac Year
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {FRONTIER_SIGNS.map(sign => {
            const isCurrentSign = currentSign?.id === sign.id;
            const isBirthSignMatch = birthSign?.id === sign.id;
            const colors = SIGN_COLORS[sign.id];

            return (
              <button
                key={sign.id}
                onClick={() => setSelectedSign(sign)}
                className={`
                  relative p-3 rounded-lg text-left transition-all duration-200
                  ${colors?.bgClass || 'bg-amber-500/20'}
                  border ${selectedSign?.id === sign.id
                    ? 'border-gold-light ring-2 ring-gold-dark/50 scale-105'
                    : colors?.borderClass || 'border-amber-500/30'
                  }
                  ${isCurrentSign ? 'ring-2 ring-green-500/50' : ''}
                  hover:scale-102
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{sign.iconEmoji}</span>
                  <span className={`font-western text-sm ${colors?.textClass || 'text-gold-light'}`}>
                    {sign.name.replace('The ', '')}
                  </span>
                </div>
                <p className="text-xs text-desert-stone line-clamp-1">{sign.theme}</p>
                <p className="text-xs text-desert-sand/70 mt-1">
                  {MONTHS[sign.startMonth - 1].slice(0, 3)} {sign.startDay} - {MONTHS[sign.endMonth - 1].slice(0, 3)} {sign.endDay}
                </p>

                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {isCurrentSign && (
                    <span className="text-xs bg-green-500/80 text-white px-1.5 py-0.5 rounded">
                      Now
                    </span>
                  )}
                  {isBirthSignMatch && (
                    <span className="text-xs bg-purple-500/80 text-white px-1.5 py-0.5 rounded">
                      Birth
                    </span>
                  )}
                </div>

                {/* Peak day indicator */}
                <div className="absolute bottom-2 right-2 text-xs text-desert-stone">
                  Peak: {sign.peakMonth}/{sign.peakDay}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected Sign Details */}
      {selectedSign && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sign Details */}
          <Card variant="leather" className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="text-6xl"
                style={{
                  textShadow: `0 0 20px ${SIGN_COLORS[selectedSign.id]?.glow || 'rgba(255,215,0,0.5)'}`,
                }}
              >
                {selectedSign.iconEmoji}
              </div>
              <div className="flex-1">
                <h2 className={`font-western text-2xl ${SIGN_COLORS[selectedSign.id]?.textClass || 'text-gold-light'}`}>
                  {selectedSign.name}
                </h2>
                <p className="text-desert-stone italic">{selectedSign.theme}</p>
                <p className="text-sm text-desert-sand mt-2">{selectedSign.description}</p>
              </div>
            </div>

            {/* Date and Peak Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-wood-dark/30 rounded-lg text-center">
                <div className="text-xs text-desert-stone">Active Period</div>
                <div className={`font-western ${SIGN_COLORS[selectedSign.id]?.textClass || 'text-gold-light'}`}>
                  {formatDateRange(selectedSign)}
                </div>
              </div>
              <div className="p-3 bg-wood-dark/30 rounded-lg text-center">
                <div className="text-xs text-desert-stone">Peak Day</div>
                <div className={`font-western ${SIGN_COLORS[selectedSign.id]?.textClass || 'text-gold-light'}`}>
                  {MONTHS[selectedSign.peakMonth - 1]} {selectedSign.peakDay}
                </div>
              </div>
            </div>

            {/* Sign Bonuses */}
            <div className="mb-4">
              <h4 className="font-western text-desert-sand mb-2">Sign Bonuses</h4>
              <SignBonusDisplay
                bonuses={selectedSign.bonuses}
                layout="vertical"
                size="sm"
              />
            </div>

            {/* Peak Day Bonuses */}
            {selectedSign.peakBonuses.length > 0 && (
              <div className="mb-4">
                <h4 className="font-western text-desert-sand mb-2">Peak Day Bonuses</h4>
                <SignBonusDisplay
                  bonuses={selectedSign.peakBonuses.map(b => ({ ...b, isActive: true, isPeakBonus: true }))}
                  layout="vertical"
                  size="sm"
                />
              </div>
            )}

            {/* Peak Day Countdown */}
            {!isPeakDay && selectedSign.id === currentSign?.id && daysUntilPeakDay > 0 && (
              <PeakDayCountdown
                sign={selectedSign}
                daysUntil={daysUntilPeakDay}
              />
            )}

            {/* Lore */}
            <Card variant="parchment" className="p-4 mt-4">
              <p className="text-western-text/80 text-sm font-serif italic">
                "{selectedSign.lore}"
              </p>
            </Card>
          </Card>

          {/* Sign Content (NPCs & Bounties) */}
          <div className="space-y-4">
            {loadingContent ? (
              <Card variant="leather" className="p-6 text-center">
                <LoadingSpinner />
                <p className="text-desert-stone text-sm mt-2">Loading sign content...</p>
              </Card>
            ) : (
              <>
                {/* Sign NPCs */}
                <Card variant="leather" className="p-4">
                  <SignNPCList
                    sign={selectedSign}
                    npcs={signNPCs}
                    isPeakDay={isPeakDay && selectedSign.id === currentSign?.id}
                    layout="list"
                  />
                </Card>

                {/* Sign Bounties */}
                <Card variant="leather" className="p-4">
                  <SignBountyList
                    sign={selectedSign}
                    bounties={signBounties}
                    isPeakDay={isPeakDay && selectedSign.id === currentSign?.id}
                    layout="list"
                  />
                </Card>
              </>
            )}
          </div>
        </div>
      )}

      {/* Birth Sign Selector Modal */}
      <BirthSignSelector
        isOpen={showBirthSignSelector}
        onClose={() => setShowBirthSignSelector(false)}
        onSelect={handleSetBirthSign}
        currentBirthSign={characterProgress?.birthSign}
        isLoading={isSettingBirthSign}
      />
    </div>
  );
};

export default ZodiacCalendarPage;
