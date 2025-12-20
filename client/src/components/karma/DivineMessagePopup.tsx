/**
 * DivineMessagePopup Component
 * Modal for displaying divine messages/visions from deities
 *
 * DEITY SYSTEM - Phase 4
 */

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { useKarma } from '@/hooks/useKarma';
import { karmaService, DivineManifestation, DeityName } from '@/services/karma.service';

// ============================================================================
// PROPS
// ============================================================================

interface DivineMessagePopupProps {
  manifestation?: DivineManifestation | null;
  isOpen?: boolean;
  onClose?: () => void;
  autoShow?: boolean;
}

// ============================================================================
// DEITY THEMING
// ============================================================================

interface DeityTheme {
  bgGradient: string;
  borderColor: string;
  textColor: string;
  glowColor: string;
  iconBg: string;
}

const getDeityTheme = (deity: DeityName): DeityTheme => {
  if (deity === 'GAMBLER') {
    return {
      bgGradient: 'from-amber-900/40 via-wood-dark/90 to-wood-dark',
      borderColor: 'border-amber-500/50',
      textColor: 'text-amber-300',
      glowColor: 'bg-amber-500/30',
      iconBg: 'bg-gradient-to-br from-amber-500/40 to-yellow-600/30 border-amber-400/60',
    };
  }
  return {
    bgGradient: 'from-red-900/40 via-wood-dark/90 to-wood-dark',
    borderColor: 'border-red-500/50',
    textColor: 'text-red-400',
    glowColor: 'bg-red-500/30',
    iconBg: 'bg-gradient-to-br from-red-500/40 to-red-800/30 border-red-500/60',
  };
};

// ============================================================================
// TYPE ICON COMPONENT
// ============================================================================

interface TypeIconProps {
  type: DivineManifestation['type'];
  deity: DeityName;
  className?: string;
}

const TypeIcon: React.FC<TypeIconProps> = ({ type, deity, className = '' }) => {
  const theme = getDeityTheme(deity);

  const getIcon = () => {
    switch (type) {
      case 'BLESSING':
        return '✦';
      case 'CURSE':
        return '✖';
      case 'WARNING':
        return '⚠';
      case 'OMEN':
        return '☽';
      case 'DREAM':
        return '☁';
      case 'STRANGER':
        return '👤';
      case 'VISION':
        return '◉';
      case 'WHISPER':
        return '❝';
      default:
        return karmaService.getDeityIcon(deity);
    }
  };

  return (
    <div
      className={`
        flex items-center justify-center w-16 h-16 rounded-full
        border-2 ${theme.iconBg}
        ${className}
      `}
    >
      <span className={`text-3xl ${theme.textColor}`}>{getIcon()}</span>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DivineMessagePopup: React.FC<DivineMessagePopupProps> = ({
  manifestation: propManifestation,
  isOpen: propIsOpen,
  onClose: propOnClose,
  autoShow = true,
}) => {
  const {
    pendingManifestation,
    dismissPendingManifestation,
    acknowledgeManifestation,
  } = useKarma();

  // Use prop manifestation or pending manifestation from store
  const manifestation = propManifestation ?? pendingManifestation;
  const isOpen = propIsOpen ?? (autoShow && !!pendingManifestation);
  const onClose = propOnClose ?? dismissPendingManifestation;

  const [isVisible, setIsVisible] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [responseText, setResponseText] = useState('');

  // Animation timing
  useEffect(() => {
    if (isOpen && manifestation) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, manifestation]);

  if (!manifestation || !isOpen) return null;

  const theme = getDeityTheme(manifestation.deityName);
  const deityName = karmaService.getDeityDisplayName(manifestation.deityName);
  const typeDisplay = karmaService.getManifestationTypeDisplay(manifestation.type);

  const handleAcknowledge = async (withResponse = false) => {
    setIsAcknowledging(true);
    try {
      await acknowledgeManifestation(
        manifestation.id,
        withResponse ? responseText : undefined
      );
      setIsVisible(false);
      setTimeout(() => {
        onClose();
        setShowResponse(false);
        setResponseText('');
      }, 300);
    } finally {
      setIsAcknowledging(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Determine if response input should be shown
  const canRespond = ['BLESSING', 'CURSE', 'WARNING'].includes(manifestation.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-black/80 backdrop-blur-sm
          transition-opacity duration-300
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={`
          relative transform transition-all duration-500 ease-out
          ${isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-8'}
        `}
      >
        <Card
          variant="wood"
          className={`
            w-full max-w-md overflow-hidden
            border-2 ${theme.borderColor}
            bg-gradient-to-b ${theme.bgGradient}
          `}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Glow effect */}
          <div className={`absolute top-0 left-0 right-0 h-40 ${theme.glowColor} blur-3xl opacity-50 pointer-events-none`} />

          <div className="relative p-6">
            {/* Header */}
            <div className="flex flex-col items-center mb-6">
              {/* Icon with glow */}
              <div className="relative mb-4">
                <div className={`absolute inset-0 ${theme.glowColor} blur-xl rounded-full animate-pulse`} />
                <TypeIcon
                  type={manifestation.type}
                  deity={manifestation.deityName}
                />
              </div>

              {/* Title */}
              <h2 className={`text-xl font-western ${theme.textColor} text-center`}>
                {typeDisplay}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                from {deityName}
              </p>

              {/* Urgency indicator */}
              {manifestation.urgency >= 4 && (
                <div className="mt-2 px-3 py-1 bg-red-900/50 border border-red-500/50 rounded-full text-xs text-red-300">
                  Urgent
                </div>
              )}
            </div>

            {/* Message */}
            <div
              className={`
                p-4 rounded-lg mb-6
                bg-black/30 border ${theme.borderColor}
              `}
            >
              <p className="text-gray-200 text-center italic leading-relaxed">
                "{manifestation.message}"
              </p>
            </div>

            {/* Location/Disguise info if present */}
            {(manifestation.location || manifestation.disguise) && (
              <div className="text-xs text-gray-500 text-center mb-4">
                {manifestation.disguise && (
                  <span>Appeared as: {manifestation.disguise}</span>
                )}
                {manifestation.disguise && manifestation.location && ' • '}
                {manifestation.location && (
                  <span>At: {manifestation.location}</span>
                )}
              </div>
            )}

            {/* Response section */}
            {showResponse && canRespond && (
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Your response to the deity (optional):
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className={`
                    w-full p-3 rounded-lg border
                    bg-black/30 ${theme.borderColor}
                    text-gray-200 placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-amber-500/50
                  `}
                  placeholder="Speak to the deity..."
                  rows={2}
                  maxLength={200}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {!showResponse && canRespond && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowResponse(true)}
                  disabled={isAcknowledging}
                >
                  Respond to {deityName}
                </Button>
              )}

              {showResponse ? (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowResponse(false)}
                    disabled={isAcknowledging}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => handleAcknowledge(true)}
                    disabled={isAcknowledging}
                  >
                    {isAcknowledging ? 'Sending...' : 'Send Response'}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleAcknowledge(false)}
                  disabled={isAcknowledging}
                >
                  {isAcknowledging ? 'Acknowledging...' : 'Acknowledge'}
                </Button>
              )}
            </div>

            {/* Effect preview if blessing/curse */}
            {manifestation.effect && Object.keys(manifestation.effect).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="text-xs text-gray-500 text-center mb-2">
                  Effects granted:
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.entries(manifestation.effect).map(([key, value]) => (
                    <span
                      key={key}
                      className={`
                        px-2 py-1 text-xs rounded
                        ${manifestation.type === 'BLESSING'
                          ? 'bg-amber-900/30 text-amber-400'
                          : 'bg-red-900/30 text-red-400'}
                      `}
                    >
                      {key.replace(/_/g, ' ')}: {typeof value === 'number' && value > 0 ? '+' : ''}{String(value)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DivineMessagePopup;
