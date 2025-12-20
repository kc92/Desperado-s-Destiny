/**
 * BlessingCurseBar Component
 * Compact bar showing active blessings and curses for the game HUD
 *
 * DEITY SYSTEM - Phase 4
 */

import React from 'react';
import { Tooltip } from '@/components/ui';
import { useKarma } from '@/hooks/useKarma';
import { karmaService, Blessing, Curse, DeityName } from '@/services/karma.service';

// ============================================================================
// PROPS
// ============================================================================

interface BlessingCurseBarProps {
  variant?: 'icons' | 'list' | 'compact';
  maxVisible?: number;
  className?: string;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface BlessingIconProps {
  blessing: Blessing;
  showTooltip?: boolean;
}

const BlessingIcon: React.FC<BlessingIconProps> = ({ blessing, showTooltip = true }) => {
  const icon = karmaService.getBlessingIcon(blessing.type);
  const timeRemaining = karmaService.getTimeRemaining(blessing.expiresAt);
  const isExpiringSoon = karmaService.isExpiringSoon(blessing.expiresAt);
  const deityName = karmaService.getDeityDisplayName(blessing.source);

  const content = (
    <div
      className={`
        inline-flex items-center justify-center w-7 h-7 rounded-full
        bg-gradient-to-br from-amber-500/30 to-yellow-600/20
        border border-amber-400/50 text-amber-300
        ${isExpiringSoon ? 'animate-pulse' : ''}
      `}
    >
      <span className="text-sm">{icon}</span>
    </div>
  );

  if (!showTooltip) return content;

  return (
    <Tooltip
      content={
        <div className="text-sm">
          <div className="font-bold text-amber-300">{blessing.type.replace(/_/g, ' ')}</div>
          <div className="text-gray-300">{blessing.description}</div>
          <div className="text-xs text-amber-400/70 mt-1">
            From: {deityName}
          </div>
          <div className="text-xs text-gray-400">
            Duration: {timeRemaining}
          </div>
        </div>
      }
    >
      {content}
    </Tooltip>
  );
};

interface CurseIconProps {
  curse: Curse;
  showTooltip?: boolean;
}

const CurseIcon: React.FC<CurseIconProps> = ({ curse, showTooltip = true }) => {
  const icon = karmaService.getCurseIcon(curse.type);
  const timeRemaining = karmaService.getTimeRemaining(curse.expiresAt);
  const deityName = karmaService.getDeityDisplayName(curse.source);

  const content = (
    <div
      className={`
        inline-flex items-center justify-center w-7 h-7 rounded-full
        bg-gradient-to-br from-red-500/30 to-red-800/20
        border border-red-500/50 text-red-400
      `}
    >
      <span className="text-sm">{icon}</span>
    </div>
  );

  if (!showTooltip) return content;

  return (
    <Tooltip
      content={
        <div className="text-sm">
          <div className="font-bold text-red-400">{curse.type.replace(/_/g, ' ')}</div>
          <div className="text-gray-300">{curse.description}</div>
          <div className="text-xs text-red-400/70 mt-1">
            From: {deityName}
          </div>
          <div className="text-xs text-gray-400">
            {curse.expiresAt ? `Duration: ${timeRemaining}` : 'Until removed'}
          </div>
          {curse.removalCondition && (
            <div className="text-xs text-amber-400/80 mt-1">
              Remove: {curse.removalCondition}
            </div>
          )}
        </div>
      }
    >
      {content}
    </Tooltip>
  );
};

// ============================================================================
// ICONS VARIANT
// ============================================================================

interface IconsVariantProps {
  blessings: Blessing[];
  curses: Curse[];
  maxVisible: number;
}

const IconsVariant: React.FC<IconsVariantProps> = ({ blessings, curses, maxVisible }) => {
  const visibleBlessings = blessings.slice(0, maxVisible);
  const hiddenBlessings = blessings.length - maxVisible;
  const visibleCurses = curses.slice(0, maxVisible);
  const hiddenCurses = curses.length - maxVisible;

  if (blessings.length === 0 && curses.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {/* Blessings */}
      {blessings.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-amber-400/70 mr-1">✦</span>
          {visibleBlessings.map((blessing, idx) => (
            <BlessingIcon key={`${blessing.type}-${idx}`} blessing={blessing} />
          ))}
          {hiddenBlessings > 0 && (
            <span className="text-xs text-amber-400/50 ml-1">+{hiddenBlessings}</span>
          )}
        </div>
      )}

      {/* Divider */}
      {blessings.length > 0 && curses.length > 0 && (
        <div className="w-px h-5 bg-gray-600" />
      )}

      {/* Curses */}
      {curses.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-red-400/70 mr-1">✖</span>
          {visibleCurses.map((curse, idx) => (
            <CurseIcon key={`${curse.type}-${idx}`} curse={curse} />
          ))}
          {hiddenCurses > 0 && (
            <span className="text-xs text-red-400/50 ml-1">+{hiddenCurses}</span>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// LIST VARIANT
// ============================================================================

interface ListVariantProps {
  blessings: Blessing[];
  curses: Curse[];
}

const ListVariant: React.FC<ListVariantProps> = ({ blessings, curses }) => {
  if (blessings.length === 0 && curses.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No active effects
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Blessings */}
      {blessings.map((blessing, idx) => {
        const timeRemaining = karmaService.getTimeRemaining(blessing.expiresAt);
        const isExpiringSoon = karmaService.isExpiringSoon(blessing.expiresAt);

        return (
          <div
            key={`blessing-${blessing.type}-${idx}`}
            className={`
              p-2 rounded border
              bg-gradient-to-r from-amber-900/20 to-transparent
              border-amber-500/30
              ${isExpiringSoon ? 'animate-pulse' : ''}
            `}
          >
            <div className="flex items-center gap-2">
              <span className="text-amber-400">
                {karmaService.getBlessingIcon(blessing.type)}
              </span>
              <span className="font-medium text-amber-300">
                {blessing.type.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-amber-400/60 ml-auto">
                {timeRemaining}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 pl-6">
              {blessing.description}
            </p>
          </div>
        );
      })}

      {/* Curses */}
      {curses.map((curse, idx) => (
        <div
          key={`curse-${curse.type}-${idx}`}
          className="p-2 rounded border bg-gradient-to-r from-red-900/20 to-transparent border-red-500/30"
        >
          <div className="flex items-center gap-2">
            <span className="text-red-400">
              {karmaService.getCurseIcon(curse.type)}
            </span>
            <span className="font-medium text-red-400">
              {curse.type.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-red-400/60 ml-auto">
              {curse.expiresAt
                ? karmaService.getTimeRemaining(curse.expiresAt)
                : 'Permanent'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1 pl-6">
            {curse.description}
          </p>
          {curse.removalCondition && (
            <p className="text-xs text-amber-400/70 mt-1 pl-6">
              To remove: {curse.removalCondition}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// COMPACT VARIANT
// ============================================================================

interface CompactVariantProps {
  blessings: Blessing[];
  curses: Curse[];
}

const CompactVariant: React.FC<CompactVariantProps> = ({ blessings, curses }) => {
  if (blessings.length === 0 && curses.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {blessings.length > 0 && (
        <Tooltip
          content={
            <div>
              <div className="font-bold text-amber-300 mb-1">Active Blessings</div>
              {blessings.map((b, i) => (
                <div key={i} className="text-gray-300">
                  {karmaService.getBlessingIcon(b.type)} {b.type.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          }
        >
          <span className="text-amber-400">
            ✦{blessings.length}
          </span>
        </Tooltip>
      )}

      {curses.length > 0 && (
        <Tooltip
          content={
            <div>
              <div className="font-bold text-red-400 mb-1">Active Curses</div>
              {curses.map((c, i) => (
                <div key={i} className="text-gray-300">
                  {karmaService.getCurseIcon(c.type)} {c.type.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          }
        >
          <span className="text-red-400">
            ✖{curses.length}
          </span>
        </Tooltip>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const BlessingCurseBar: React.FC<BlessingCurseBarProps> = ({
  variant = 'icons',
  maxVisible = 3,
  className = '',
}) => {
  const { getBlessings, getCurses, isLoading } = useKarma();

  const blessings = getBlessings();
  const curses = getCurses();

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-700" />
          <div className="w-7 h-7 rounded-full bg-gray-700" />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {variant === 'icons' && (
        <IconsVariant
          blessings={blessings}
          curses={curses}
          maxVisible={maxVisible}
        />
      )}
      {variant === 'list' && (
        <ListVariant blessings={blessings} curses={curses} />
      )}
      {variant === 'compact' && (
        <CompactVariant blessings={blessings} curses={curses} />
      )}
    </div>
  );
};

export default BlessingCurseBar;
