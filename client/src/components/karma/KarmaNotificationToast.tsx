/**
 * KarmaNotificationToast Component
 * Toast notification for karma changes and divine events
 *
 * DEITY SYSTEM - Phase 4
 */

import React, { useEffect, useState } from 'react';
import { KarmaToast } from '@/store/useKarmaStore';
import { karmaService, Blessing, Curse, DeityName } from '@/services/karma.service';

// ============================================================================
// PROPS
// ============================================================================

interface KarmaNotificationToastProps {
  toast: KarmaToast;
  onClose: () => void;
  duration?: number;
  onClick?: () => void;
}

// ============================================================================
// TOAST VARIANTS
// ============================================================================

interface KarmaChangeToastProps {
  dimension: string;
  delta: number;
}

const KarmaChangeToast: React.FC<KarmaChangeToastProps> = ({ dimension, delta }) => {
  const isPositive = delta > 0;
  const category = karmaService.getDimensionCategory(dimension);

  // Determine if this change is "good" based on dimension type
  let isGood = isPositive;
  if (category === 'vice') {
    isGood = !isPositive; // Gaining vices is bad, losing them is good
  }

  return (
    <div className="flex items-center gap-3">
      <span className={`text-xl ${isGood ? 'text-green-400' : 'text-red-400'}`}>
        ☯
      </span>
      <div>
        <span className="font-medium text-desert-sand capitalize">
          {dimension}
        </span>
        <span className={`ml-2 font-bold ${isGood ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{delta}
        </span>
      </div>
    </div>
  );
};

interface BlessingToastProps {
  blessing: Blessing;
  deity: DeityName;
}

const BlessingToast: React.FC<BlessingToastProps> = ({ blessing, deity }) => {
  const deityName = karmaService.getDeityDisplayName(deity);
  const icon = karmaService.getBlessingIcon(blessing.type);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-600/20 border border-amber-400/50">
        <span className="text-xl text-amber-300">{icon}</span>
      </div>
      <div>
        <div className="font-bold text-amber-300">
          Divine Blessing!
        </div>
        <div className="text-sm text-gray-300">
          {deityName} grants <span className="text-amber-400">{blessing.type.replace(/_/g, ' ')}</span>
        </div>
      </div>
    </div>
  );
};

interface CurseToastProps {
  curse: Curse;
  deity: DeityName;
}

const CurseToast: React.FC<CurseToastProps> = ({ curse, deity }) => {
  const deityName = karmaService.getDeityDisplayName(deity);
  const icon = karmaService.getCurseIcon(curse.type);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-red-500/30 to-red-800/20 border border-red-500/50">
        <span className="text-xl text-red-400">{icon}</span>
      </div>
      <div>
        <div className="font-bold text-red-400">
          Divine Curse!
        </div>
        <div className="text-sm text-gray-300">
          {deityName} marks you with <span className="text-red-400">{curse.type.replace(/_/g, ' ')}</span>
        </div>
      </div>
    </div>
  );
};

interface DivineMessageToastProps {
  message: string;
  deity: DeityName;
}

const DivineMessageToast: React.FC<DivineMessageToastProps> = ({ message, deity }) => {
  const deityName = karmaService.getDeityDisplayName(deity);
  const icon = karmaService.getDeityIcon(deity);
  const isGambler = deity === 'GAMBLER';

  return (
    <div className="flex items-center gap-3">
      <div className={`
        flex items-center justify-center w-10 h-10 rounded-full
        ${isGambler
          ? 'bg-gradient-to-br from-amber-500/30 to-yellow-600/20 border border-amber-400/50'
          : 'bg-gradient-to-br from-red-500/30 to-red-800/20 border border-red-500/50'
        }
      `}>
        <span className={`text-xl ${isGambler ? 'text-amber-300' : 'text-red-400'}`}>
          {icon}
        </span>
      </div>
      <div>
        <div className={`font-bold ${isGambler ? 'text-amber-300' : 'text-red-400'}`}>
          {deityName} whispers...
        </div>
        <div className="text-sm text-gray-400 italic">
          Click to view message
        </div>
      </div>
    </div>
  );
};

interface EffectExpiredToastProps {
  effectType: 'blessing' | 'curse';
  effectName: string;
  deity: DeityName;
  message: string;
}

const EffectExpiredToast: React.FC<EffectExpiredToastProps> = ({
  effectType,
  effectName,
  deity,
  message,
}) => {
  const isBlessing = effectType === 'blessing';

  return (
    <div className="flex items-center gap-3">
      <span className={`text-xl ${isBlessing ? 'text-amber-400/60' : 'text-green-400'}`}>
        {isBlessing ? '✦' : '✓'}
      </span>
      <div>
        <div className={`font-medium ${isBlessing ? 'text-amber-400/80' : 'text-green-400'}`}>
          {isBlessing ? 'Blessing Faded' : 'Curse Lifted'}
        </div>
        <div className="text-sm text-gray-400">
          {effectName.replace(/_/g, ' ')}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const KarmaNotificationToast: React.FC<KarmaNotificationToastProps> = ({
  toast,
  onClose,
  duration = 5000,
  onClick,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  // Auto-dismiss after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  // Determine toast styling based on type
  const getToastStyle = () => {
    switch (toast.type) {
      case 'blessing':
        return 'border-amber-500/50 bg-gradient-to-r from-amber-900/40 to-wood-dark/80';
      case 'curse':
        return 'border-red-500/50 bg-gradient-to-r from-red-900/40 to-wood-dark/80';
      case 'divine_message':
        return toast.data.deity === 'GAMBLER'
          ? 'border-amber-500/50 bg-gradient-to-r from-amber-900/40 to-wood-dark/80 cursor-pointer'
          : 'border-red-500/50 bg-gradient-to-r from-red-900/40 to-wood-dark/80 cursor-pointer';
      case 'effect_expired':
        return toast.data.effectType === 'blessing'
          ? 'border-amber-500/30 bg-gradient-to-r from-amber-900/20 to-wood-dark/80'
          : 'border-green-500/50 bg-gradient-to-r from-green-900/40 to-wood-dark/80';
      default:
        return 'border-wood-grain/50 bg-gradient-to-r from-wood-dark/80 to-wood-dark/60';
    }
  };

  // Render toast content
  const renderContent = () => {
    switch (toast.type) {
      case 'karma_change':
        return (
          <KarmaChangeToast
            dimension={toast.data.dimension || 'karma'}
            delta={toast.data.delta || 0}
          />
        );
      case 'blessing':
        return toast.data.blessing && toast.data.deity ? (
          <BlessingToast blessing={toast.data.blessing} deity={toast.data.deity} />
        ) : null;
      case 'curse':
        return toast.data.curse && toast.data.deity ? (
          <CurseToast curse={toast.data.curse} deity={toast.data.deity} />
        ) : null;
      case 'divine_message':
        return toast.data.deity ? (
          <DivineMessageToast
            message={toast.data.message || ''}
            deity={toast.data.deity}
          />
        ) : null;
      case 'effect_expired':
        return toast.data.effectType && toast.data.effectName && toast.data.deity ? (
          <EffectExpiredToast
            effectType={toast.data.effectType}
            effectName={toast.data.effectName}
            deity={toast.data.deity}
            message={toast.data.message || ''}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={toast.type === 'divine_message' ? handleClick : undefined}
      className={`
        relative p-4 rounded-lg border shadow-lg
        transform transition-all duration-300 ease-out
        ${getToastStyle()}
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        ${toast.type === 'divine_message' ? 'cursor-pointer hover:brightness-110' : ''}
      `}
    >
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 transition-colors"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Content */}
      {renderContent()}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50 overflow-hidden rounded-b-lg">
        <div
          className={`
            h-full transition-all ease-linear
            ${toast.type === 'blessing' || toast.type === 'divine_message' && toast.data.deity === 'GAMBLER'
              ? 'bg-amber-500'
              : toast.type === 'curse' || toast.type === 'divine_message'
                ? 'bg-red-500'
                : 'bg-gray-500'
            }
          `}
          style={{
            width: '100%',
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>

      {/* CSS for progress bar animation */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default KarmaNotificationToast;
