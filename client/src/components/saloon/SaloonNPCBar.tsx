/**
 * SaloonNPCBar Component
 * Western-styled NPC display for saloon locations
 *
 * Part of the Saloon Location UI Redesign.
 */

import React from 'react';
import { User, MessageCircle, ShoppingBag, Scroll } from 'lucide-react';
import { LocationNPC } from '@shared/types/location.types';

/**
 * Get faction color for NPC badge
 */
function getFactionColor(faction?: string): string {
  switch (faction?.toLowerCase()) {
    case 'settler':
    case 'settler_alliance':
      return 'bg-[#4169E1]/20 text-[#4169E1] border-[#4169E1]/30';
    case 'nahi':
    case 'nahi_coalition':
      return 'bg-[#32CD32]/20 text-[#32CD32] border-[#32CD32]/30';
    case 'frontera':
    case 'outlaw':
      return 'bg-[#DC143C]/20 text-[#DC143C] border-[#DC143C]/30';
    default:
      return 'bg-gold-dark/20 text-gold-light border-gold-dark/30';
  }
}

/**
 * Get NPC icon based on role
 */
function getNPCIcon(npc: LocationNPC): React.ReactNode {
  if (npc.isVendor) {
    return <ShoppingBag className="w-4 h-4" />;
  }
  if (npc.quests && npc.quests.length > 0) {
    return <Scroll className="w-4 h-4 text-gold-light" />;
  }
  if (npc.dialogue && npc.dialogue.length > 0) {
    return <MessageCircle className="w-4 h-4" />;
  }
  return <User className="w-4 h-4" />;
}

/**
 * SaloonNPCBar props
 */
export interface SaloonNPCBarProps {
  /** NPCs present at the saloon */
  npcs: LocationNPC[];
  /** Handler for NPC interaction */
  onInteract?: (npcId: string) => void;
  /** Currently selected NPC ID */
  selectedNpcId?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Individual NPC Card
 */
interface NPCCardProps {
  npc: LocationNPC;
  onInteract?: () => void;
  isSelected: boolean;
}

const NPCCard: React.FC<NPCCardProps> = ({ npc, onInteract, isSelected }) => {
  const hasQuests = npc.quests && npc.quests.length > 0;
  const hasDialogue = npc.dialogue && npc.dialogue.length > 0;

  return (
    <button
      onClick={onInteract}
      disabled={!onInteract}
      className={`
        w-full text-left p-3 rounded-lg border transition-all
        ${isSelected
          ? 'bg-gold-dark/30 border-gold-medium/50 ring-1 ring-gold-medium/30'
          : 'bg-wood-dark/30 border-wood-dark/50 hover:bg-wood-dark/50 hover:border-gold-dark/40'
        }
        ${onInteract ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* NPC Avatar */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${isSelected ? 'bg-gold-medium/30' : 'bg-wood-darker/50'}
          border ${isSelected ? 'border-gold-medium/50' : 'border-wood-dark'}
        `}>
          {getNPCIcon(npc)}
        </div>

        {/* NPC Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-desert-sand truncate">{npc.name}</span>
            {hasQuests && (
              <span className="text-gold-light text-xs">!</span>
            )}
          </div>

          {npc.title && (
            <p className="text-sm text-desert-stone truncate">{npc.title}</p>
          )}

          {/* Faction badge */}
          {npc.faction && (
            <span className={`
              inline-block mt-1 px-2 py-0.5 rounded text-xs border
              ${getFactionColor(npc.faction)}
            `}>
              {npc.faction}
            </span>
          )}
        </div>

        {/* Indicators */}
        <div className="flex flex-col items-end gap-1">
          {npc.isVendor && (
            <span className="text-xs text-gold-light px-1.5 py-0.5 rounded bg-gold-dark/20">
              Shop
            </span>
          )}
          {hasDialogue && !hasQuests && (
            <span className="text-xs text-desert-stone px-1.5 py-0.5 rounded bg-wood-darker/50">
              Talk
            </span>
          )}
        </div>
      </div>

      {/* Description preview */}
      {npc.description && (
        <p className="mt-2 text-xs text-desert-stone line-clamp-2">
          {npc.description}
        </p>
      )}
    </button>
  );
};

/**
 * SaloonNPCBar Component
 */
export const SaloonNPCBar: React.FC<SaloonNPCBarProps> = ({
  npcs,
  onInteract,
  selectedNpcId,
  className = ''
}) => {
  if (!npcs || npcs.length === 0) {
    return (
      <div className={`text-center text-desert-stone py-4 ${className}`}>
        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No one's around right now...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {npcs.map(npc => (
        <NPCCard
          key={npc.id}
          npc={npc}
          onInteract={onInteract ? () => onInteract(npc.id) : undefined}
          isSelected={npc.id === selectedNpcId}
        />
      ))}
    </div>
  );
};

export default SaloonNPCBar;
