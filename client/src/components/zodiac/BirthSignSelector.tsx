/**
 * BirthSignSelector Component
 * Selection UI for choosing character's birth sign
 */

import React, { useState } from 'react';
import type { FrontierSign, ZodiacSignId } from '@/types/zodiac.types';
import { FRONTIER_SIGNS, SIGN_COLORS } from '@/constants/zodiac.constants';
import { Card, Button, Modal } from '@/components/ui';
import { SignCard } from './SignCard';
import { ConstellationMini } from './ConstellationViewer';
import { SignBonusDisplay } from './SignBonusDisplay';

interface BirthSignSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (signId: ZodiacSignId) => Promise<{ success: boolean; message: string }>;
  currentBirthSign?: ZodiacSignId | null;
  isLoading?: boolean;
}

/**
 * Format date range for display
 */
function formatDateRange(sign: FrontierSign): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[sign.startMonth - 1]} ${sign.startDay} - ${months[sign.endMonth - 1]} ${sign.endDay}`;
}

/**
 * Birth sign selector modal component
 */
export const BirthSignSelector: React.FC<BirthSignSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentBirthSign,
  isLoading = false,
}) => {
  const [selectedSign, setSelectedSign] = useState<FrontierSign | null>(null);
  const [confirmStep, setConfirmStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal closes
  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedSign(null);
      setConfirmStep(false);
      setError(null);
      onClose();
    }
  };

  // Handle sign selection
  const handleSignClick = (sign: FrontierSign) => {
    setSelectedSign(sign);
    setError(null);
  };

  // Handle proceeding to confirmation
  const handleProceedToConfirm = () => {
    if (selectedSign) {
      setConfirmStep(true);
    }
  };

  // Handle back from confirmation
  const handleBackToSelection = () => {
    setConfirmStep(false);
    setError(null);
  };

  // Handle final selection
  const handleConfirm = async () => {
    if (!selectedSign) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onSelect(selectedSign.id);

      if (result.success) {
        handleClose();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to set birth sign');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already has birth sign, show info only
  if (currentBirthSign) {
    const sign = FRONTIER_SIGNS.find(s => s.id === currentBirthSign);
    const colors = sign ? SIGN_COLORS[sign.id] : null;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Your Birth Sign"
        size="md"
      >
        <div className="text-center">
          {sign && (
            <>
              <div
                className="text-8xl mb-4"
                style={{
                  textShadow: `0 0 30px ${colors?.glow || 'rgba(255,215,0,0.6)'}`,
                }}
              >
                {sign.iconEmoji}
              </div>
              <h2 className={`font-western text-3xl mb-2 ${colors?.textClass || 'text-gold-light'}`}>
                {sign.name}
              </h2>
              <p className="text-desert-sand italic mb-4">{sign.theme}</p>
              <p className="text-desert-stone text-sm mb-4">{sign.description}</p>

              <div className="bg-wood-dark/30 p-4 rounded-lg mb-4">
                <SignBonusDisplay
                  bonuses={sign.bonuses}
                  signName={sign.name}
                  layout="vertical"
                  size="md"
                />
              </div>

              <p className="text-xs text-desert-stone">
                Your birth sign was chosen when you created this character and cannot be changed.
              </p>
            </>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={confirmStep ? 'Confirm Your Birth Sign' : 'Choose Your Birth Sign'}
      size="xl"
      showCloseButton={!isSubmitting}
    >
      {!confirmStep ? (
        // Selection step
        <div className="space-y-4">
          {/* Warning banner */}
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-center">
            <p className="text-red-400 text-sm font-bold">
              This choice is PERMANENT and cannot be changed!
            </p>
            <p className="text-red-300 text-xs mt-1">
              Choose wisely - your birth sign will grant bonuses when its constellation is active.
            </p>
          </div>

          {/* Sign grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto p-1">
            {FRONTIER_SIGNS.map(sign => (
              <SignCard
                key={sign.id}
                sign={sign}
                isSelected={selectedSign?.id === sign.id}
                showDates={false}
                size="sm"
                onClick={handleSignClick}
              />
            ))}
          </div>

          {/* Selected sign preview */}
          {selectedSign && (
            <Card variant="leather" className="p-4">
              <div className="flex items-start gap-4">
                <div className="text-5xl">{selectedSign.iconEmoji}</div>
                <div className="flex-1">
                  <h3 className={`font-western text-xl ${SIGN_COLORS[selectedSign.id]?.textClass || 'text-gold-light'}`}>
                    {selectedSign.name}
                  </h3>
                  <p className="text-desert-stone text-sm italic">{selectedSign.theme}</p>
                  <p className="text-desert-sand text-sm mt-2">{selectedSign.description}</p>
                  <p className="text-xs text-desert-stone mt-2">
                    Active: {formatDateRange(selectedSign)}
                  </p>
                </div>
                <ConstellationMini sign={selectedSign} />
              </div>
            </Card>
          )}

          {/* Error display */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleProceedToConfirm}
              disabled={!selectedSign || isSubmitting}
              fullWidth
            >
              Continue
            </Button>
          </div>
        </div>
      ) : (
        // Confirmation step
        selectedSign && (
          <div className="space-y-4">
            {/* Final warning */}
            <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4 text-center animate-pulse">
              <p className="text-red-400 font-bold text-lg mb-2">
                Are you absolutely sure?
              </p>
              <p className="text-red-300 text-sm">
                Once confirmed, your birth sign CANNOT be changed - ever.
              </p>
            </div>

            {/* Selected sign display */}
            <div className="text-center py-4">
              <div
                className="text-8xl mb-4 animate-bounce"
                style={{
                  textShadow: `0 0 40px ${SIGN_COLORS[selectedSign.id]?.glow || 'rgba(255,215,0,0.8)'}`,
                }}
              >
                {selectedSign.iconEmoji}
              </div>
              <h2 className={`font-western text-4xl mb-2 ${SIGN_COLORS[selectedSign.id]?.textClass || 'text-gold-light'}`}>
                {selectedSign.name}
              </h2>
              <p className="text-desert-sand italic text-lg">"{selectedSign.theme}"</p>
            </div>

            {/* Bonuses preview */}
            <Card variant="wood" className="p-4">
              <h4 className="font-western text-desert-sand mb-3 text-center">
                Your Permanent Bonuses
              </h4>
              <SignBonusDisplay
                bonuses={selectedSign.bonuses}
                layout="vertical"
                size="md"
              />
              <p className="text-xs text-desert-stone text-center mt-3">
                These bonuses are enhanced +10% during {selectedSign.name} season!
              </p>
            </Card>

            {/* Lore */}
            <Card variant="parchment" className="p-4">
              <p className="text-western-text text-sm font-serif italic">
                "{selectedSign.lore}"
              </p>
            </Card>

            {/* Error display */}
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleBackToSelection}
                disabled={isSubmitting}
              >
                Go Back
              </Button>
              <Button
                variant="secondary"
                onClick={handleConfirm}
                disabled={isSubmitting}
                isLoading={isSubmitting}
                loadingText="Confirming..."
                fullWidth
              >
                Confirm Birth Sign
              </Button>
            </div>
          </div>
        )
      )}
    </Modal>
  );
};

/**
 * Inline birth sign selector for character creation flow
 */
interface InlineBirthSignSelectorProps {
  onSelect: (signId: ZodiacSignId) => void;
  selectedSign?: ZodiacSignId | null;
  className?: string;
}

export const InlineBirthSignSelector: React.FC<InlineBirthSignSelectorProps> = ({
  onSelect,
  selectedSign,
  className = '',
}) => {
  const selected = selectedSign ? FRONTIER_SIGNS.find(s => s.id === selectedSign) : null;

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-western text-xl text-gold-light">Choose Your Birth Sign</h3>
        <p className="text-sm text-desert-stone">
          Your birth sign grants permanent bonuses. This choice cannot be changed!
        </p>
      </div>

      {/* Sign grid */}
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-4">
        {FRONTIER_SIGNS.map(sign => {
          const colors = SIGN_COLORS[sign.id];
          const isSelected = selectedSign === sign.id;

          return (
            <button
              key={sign.id}
              onClick={() => onSelect(sign.id)}
              className={`
                p-2 rounded-lg text-center transition-all duration-200
                ${colors?.bgClass || 'bg-amber-500/20'}
                border-2 ${isSelected
                  ? 'border-gold-light ring-2 ring-gold-dark scale-105'
                  : colors?.borderClass || 'border-amber-500/30'
                }
                hover:scale-105
              `}
              title={`${sign.name} - ${sign.theme}`}
            >
              <span className="text-2xl block">{sign.iconEmoji}</span>
              <span className={`text-xs ${colors?.textClass || 'text-amber-400'} truncate block`}>
                {sign.name.replace('The ', '')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected sign details */}
      {selected && (
        <Card variant="leather" className="p-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{selected.iconEmoji}</span>
            <div className="flex-1">
              <h4 className={`font-western ${SIGN_COLORS[selected.id]?.textClass || 'text-gold-light'}`}>
                {selected.name}
              </h4>
              <p className="text-sm text-desert-sand italic">{selected.theme}</p>
              <p className="text-xs text-desert-stone mt-1">{selected.description}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BirthSignSelector;
