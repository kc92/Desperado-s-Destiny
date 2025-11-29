/**
 * UpgradePanel Component
 * Manages property upgrades and improvements
 */

import React, { useState } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { formatGold } from '@/utils/format';
import type {
  PropertyUpgrade,
  PropertyType,
  PropertyTier,
  UpgradeCategory,
} from '@desperados/shared';

/**
 * Category icons
 */
const CATEGORY_ICONS: Record<UpgradeCategory, string> = {
  capacity: '📦',
  efficiency: '⚡',
  defense: '🛡️',
  comfort: '🛋️',
  specialty: '⭐',
};

/**
 * Category display names
 */
const CATEGORY_NAMES: Record<UpgradeCategory, string> = {
  capacity: 'Capacity',
  efficiency: 'Efficiency',
  defense: 'Defense',
  comfort: 'Comfort',
  specialty: 'Specialty',
};

/**
 * Available upgrade definition
 */
export interface UpgradeOption {
  upgradeId: string;
  upgradeType: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  cost: number;
  minTier: PropertyTier;
  maxLevel: number;
  benefits: string[];
}

/**
 * Get upgrades available for a property type
 */
function getAvailableUpgrades(propertyType: PropertyType): UpgradeOption[] {
  const baseUpgrades: Record<PropertyType, UpgradeOption[]> = {
    ranch: [
      {
        upgradeId: 'ranch_livestock_pen',
        upgradeType: 'livestock_pen',
        name: 'Livestock Pen',
        description: 'Expand capacity for livestock',
        category: 'capacity',
        cost: 500,
        minTier: 1,
        maxLevel: 5,
        benefits: ['+10 livestock capacity per level'],
      },
      {
        upgradeId: 'ranch_crop_field',
        upgradeType: 'crop_field',
        name: 'Crop Field',
        description: 'Additional farming plots',
        category: 'capacity',
        cost: 400,
        minTier: 1,
        maxLevel: 5,
        benefits: ['+5 crop slots per level'],
      },
      {
        upgradeId: 'ranch_well',
        upgradeType: 'well',
        name: 'Well',
        description: 'Water supply for irrigation',
        category: 'efficiency',
        cost: 600,
        minTier: 2,
        maxLevel: 3,
        benefits: ['+10% crop yield per level'],
      },
      {
        upgradeId: 'ranch_barn',
        upgradeType: 'barn',
        name: 'Barn',
        description: 'Storage and shelter for animals',
        category: 'capacity',
        cost: 800,
        minTier: 2,
        maxLevel: 3,
        benefits: ['+50 storage per level', '+5% livestock health'],
      },
      {
        upgradeId: 'ranch_windmill',
        upgradeType: 'windmill',
        name: 'Windmill',
        description: 'Automated grain processing',
        category: 'efficiency',
        cost: 1200,
        minTier: 3,
        maxLevel: 3,
        benefits: ['+15% production speed per level'],
      },
    ],
    shop: [
      {
        upgradeId: 'shop_display_cases',
        upgradeType: 'display_cases',
        name: 'Display Cases',
        description: 'Attract more customers',
        category: 'efficiency',
        cost: 400,
        minTier: 1,
        maxLevel: 5,
        benefits: ['+5% sales per level'],
      },
      {
        upgradeId: 'shop_back_room',
        upgradeType: 'back_room',
        name: 'Back Room',
        description: 'Additional storage space',
        category: 'capacity',
        cost: 500,
        minTier: 1,
        maxLevel: 3,
        benefits: ['+30 storage per level'],
      },
      {
        upgradeId: 'shop_sign',
        upgradeType: 'sign',
        name: 'Shop Sign',
        description: 'Increase visibility',
        category: 'efficiency',
        cost: 200,
        minTier: 1,
        maxLevel: 3,
        benefits: ['+3% customer traffic per level'],
      },
      {
        upgradeId: 'shop_security',
        upgradeType: 'security',
        name: 'Security System',
        description: 'Protect against theft',
        category: 'defense',
        cost: 800,
        minTier: 2,
        maxLevel: 3,
        benefits: ['-20% theft chance per level'],
      },
      {
        upgradeId: 'shop_expanded_inventory',
        upgradeType: 'expanded_inventory',
        name: 'Expanded Inventory',
        description: 'Stock more item types',
        category: 'specialty',
        cost: 1000,
        minTier: 3,
        maxLevel: 3,
        benefits: ['+5 item slots per level'],
      },
    ],
    workshop: [
      {
        upgradeId: 'workshop_forge',
        upgradeType: 'forge',
        name: 'Forge',
        description: 'Metalworking capabilities',
        category: 'specialty',
        cost: 600,
        minTier: 1,
        maxLevel: 5,
        benefits: ['Unlock metal crafting', '+5% quality per level'],
      },
      {
        upgradeId: 'workshop_workbench',
        upgradeType: 'workbench',
        name: 'Workbench',
        description: 'Improved crafting station',
        category: 'efficiency',
        cost: 400,
        minTier: 1,
        maxLevel: 5,
        benefits: ['+10% crafting speed per level'],
      },
      {
        upgradeId: 'workshop_tool_rack',
        upgradeType: 'tool_rack',
        name: 'Tool Rack',
        description: 'Organized tool storage',
        category: 'capacity',
        cost: 300,
        minTier: 1,
        maxLevel: 3,
        benefits: ['+1 production slot per level'],
      },
      {
        upgradeId: 'workshop_quality_tools',
        upgradeType: 'quality_tools',
        name: 'Quality Tools',
        description: 'Better crafting equipment',
        category: 'efficiency',
        cost: 800,
        minTier: 2,
        maxLevel: 3,
        benefits: ['+8% item quality per level'],
      },
      {
        upgradeId: 'workshop_ventilation',
        upgradeType: 'ventilation',
        name: 'Ventilation',
        description: 'Improved working conditions',
        category: 'comfort',
        cost: 500,
        minTier: 2,
        maxLevel: 3,
        benefits: ['+5% worker efficiency per level'],
      },
    ],
    homestead: [
      {
        upgradeId: 'homestead_bedroom',
        upgradeType: 'bedroom',
        name: 'Bedroom',
        description: 'Additional sleeping quarters',
        category: 'comfort',
        cost: 400,
        minTier: 1,
        maxLevel: 3,
        benefits: ['+1 guest capacity per level'],
      },
      {
        upgradeId: 'homestead_kitchen',
        upgradeType: 'kitchen',
        name: 'Kitchen',
        description: 'Cooking facilities',
        category: 'specialty',
        cost: 500,
        minTier: 1,
        maxLevel: 3,
        benefits: ['Unlock cooking', '+5% food quality per level'],
      },
      {
        upgradeId: 'homestead_cellar',
        upgradeType: 'cellar',
        name: 'Cellar',
        description: 'Underground storage',
        category: 'capacity',
        cost: 600,
        minTier: 2,
        maxLevel: 3,
        benefits: ['+50 storage per level'],
      },
      {
        upgradeId: 'homestead_garden',
        upgradeType: 'garden',
        name: 'Garden',
        description: 'Small herb garden',
        category: 'specialty',
        cost: 300,
        minTier: 1,
        maxLevel: 3,
        benefits: ['Grow herbs', '+3 herb slots per level'],
      },
      {
        upgradeId: 'homestead_security_system',
        upgradeType: 'security_system',
        name: 'Security System',
        description: 'Protect your home',
        category: 'defense',
        cost: 700,
        minTier: 2,
        maxLevel: 3,
        benefits: ['-25% raid chance per level'],
      },
    ],
    mine: [
      {
        upgradeId: 'mine_support_beams',
        upgradeType: 'support_beams',
        name: 'Support Beams',
        description: 'Reinforce mine shafts',
        category: 'defense',
        cost: 500,
        minTier: 1,
        maxLevel: 5,
        benefits: ['-10% collapse chance per level'],
      },
      {
        upgradeId: 'mine_rail_system',
        upgradeType: 'rail_system',
        name: 'Rail System',
        description: 'Transport ore faster',
        category: 'efficiency',
        cost: 800,
        minTier: 2,
        maxLevel: 3,
        benefits: ['+15% extraction speed per level'],
      },
      {
        upgradeId: 'mine_ventilation_shaft',
        upgradeType: 'ventilation_shaft',
        name: 'Ventilation Shaft',
        description: 'Fresh air for miners',
        category: 'comfort',
        cost: 600,
        minTier: 2,
        maxLevel: 3,
        benefits: ['+10% worker efficiency per level'],
      },
      {
        upgradeId: 'mine_explosives_storage',
        upgradeType: 'explosives_storage',
        name: 'Explosives Storage',
        description: 'Safe storage for blasting materials',
        category: 'capacity',
        cost: 700,
        minTier: 2,
        maxLevel: 3,
        benefits: ['Unlock blasting', '+5 explosives storage per level'],
      },
      {
        upgradeId: 'mine_water_pump',
        upgradeType: 'water_pump',
        name: 'Water Pump',
        description: 'Remove water from shafts',
        category: 'efficiency',
        cost: 1000,
        minTier: 3,
        maxLevel: 3,
        benefits: ['Access deeper veins', '+20% ore quality per level'],
      },
    ],
    saloon: [
      {
        upgradeId: 'saloon_bar_expansion',
        upgradeType: 'bar_expansion',
        name: 'Bar Expansion',
        description: 'Larger bar area',
        category: 'capacity',
        cost: 600,
        minTier: 1,
        maxLevel: 5,
        benefits: ['+10 customer capacity per level'],
      },
      {
        upgradeId: 'saloon_stage',
        upgradeType: 'stage',
        name: 'Stage',
        description: 'Entertainment platform',
        category: 'specialty',
        cost: 800,
        minTier: 2,
        maxLevel: 3,
        benefits: ['Unlock entertainment', '+10% revenue per level'],
      },
      {
        upgradeId: 'saloon_rooms',
        upgradeType: 'rooms',
        name: 'Rooms Upstairs',
        description: 'Lodging for guests',
        category: 'specialty',
        cost: 1000,
        minTier: 2,
        maxLevel: 3,
        benefits: ['+3 rooms per level', 'Additional revenue'],
      },
      {
        upgradeId: 'saloon_gaming_tables',
        upgradeType: 'gaming_tables',
        name: 'Gaming Tables',
        description: 'Gambling facilities',
        category: 'specialty',
        cost: 700,
        minTier: 1,
        maxLevel: 5,
        benefits: ['+2 poker tables per level', '+15% gambling revenue'],
      },
      {
        upgradeId: 'saloon_bouncer',
        upgradeType: 'bouncer',
        name: 'Bouncer Station',
        description: 'Security presence',
        category: 'defense',
        cost: 500,
        minTier: 2,
        maxLevel: 3,
        benefits: ['-20% trouble chance per level'],
      },
    ],
    stable: [
      {
        upgradeId: 'stable_horse_stalls',
        upgradeType: 'horse_stalls',
        name: 'Horse Stalls',
        description: 'More horse capacity',
        category: 'capacity',
        cost: 500,
        minTier: 1,
        maxLevel: 5,
        benefits: ['+3 horse slots per level'],
      },
      {
        upgradeId: 'stable_training_ring',
        upgradeType: 'training_ring',
        name: 'Training Ring',
        description: 'Horse training area',
        category: 'specialty',
        cost: 800,
        minTier: 2,
        maxLevel: 3,
        benefits: ['Unlock training', '+10% training speed per level'],
      },
      {
        upgradeId: 'stable_tack_room',
        upgradeType: 'tack_room',
        name: 'Tack Room',
        description: 'Equipment storage',
        category: 'capacity',
        cost: 400,
        minTier: 1,
        maxLevel: 3,
        benefits: ['+20 equipment storage per level'],
      },
      {
        upgradeId: 'stable_feed_storage',
        upgradeType: 'feed_storage',
        name: 'Feed Storage',
        description: 'Bulk feed storage',
        category: 'efficiency',
        cost: 300,
        minTier: 1,
        maxLevel: 3,
        benefits: ['-10% feed costs per level'],
      },
      {
        upgradeId: 'stable_breeding_pen',
        upgradeType: 'breeding_pen',
        name: 'Breeding Pen',
        description: 'Horse breeding facilities',
        category: 'specialty',
        cost: 1200,
        minTier: 3,
        maxLevel: 3,
        benefits: ['Unlock breeding', '+10% foal quality per level'],
      },
    ],
  };

  return baseUpgrades[propertyType] || [];
}

interface UpgradePanelProps {
  propertyType: PropertyType;
  currentTier: PropertyTier;
  currentUpgrades: PropertyUpgrade[];
  maxUpgrades: number;
  onAddUpgrade: (
    upgradeType: string
  ) => Promise<{ success: boolean; message: string }>;
  onClose?: () => void;
  characterGold?: number;
}

/**
 * Upgrade option card
 */
const UpgradeOptionCard: React.FC<{
  upgrade: UpgradeOption;
  currentLevel: number;
  canInstall: boolean;
  canAfford: boolean;
  tierMet: boolean;
  onInstall: () => void;
  isLoading: boolean;
}> = ({
  upgrade,
  currentLevel,
  canInstall,
  canAfford,
  tierMet,
  onInstall,
  isLoading,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const categoryIcon = CATEGORY_ICONS[upgrade.category] || '⭐';
  const categoryName = CATEGORY_NAMES[upgrade.category] || 'Special';

  const isMaxLevel = currentLevel >= upgrade.maxLevel;
  const isInstalled = currentLevel > 0;

  return (
    <>
      <Card
        variant="leather"
        padding="none"
        className={`overflow-hidden transition-all ${
          !canInstall ? 'opacity-60' : 'hover:shadow-md'
        }`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{categoryIcon}</span>
              <div>
                <h4 className="font-western text-desert-sand">{upgrade.name}</h4>
                <p className="text-xs text-desert-stone">{categoryName}</p>
              </div>
            </div>
            {isInstalled && (
              <div className="flex items-center gap-1">
                {Array.from({ length: upgrade.maxLevel }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < currentLevel ? 'bg-gold-light' : 'bg-wood-grain/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-desert-stone mt-2">{upgrade.description}</p>

          {/* Requirements */}
          <div className="flex items-center gap-3 mt-3 text-xs">
            <span
              className={tierMet ? 'text-green-400' : 'text-red-400'}
            >
              Min Tier: {upgrade.minTier}
            </span>
            <span className="text-desert-stone">|</span>
            <span className={canAfford ? 'text-gold-light' : 'text-red-400'}>
              Cost: {formatGold(upgrade.cost)}
            </span>
          </div>

          {/* Benefits preview */}
          <button
            onClick={() => setShowDetails(true)}
            className="text-xs text-gold-light/70 hover:text-gold-light mt-2 underline"
          >
            View benefits
          </button>

          {/* Action button */}
          <div className="mt-3">
            {isMaxLevel ? (
              <p className="text-center text-green-400 text-sm font-semibold">
                Max Level
              </p>
            ) : (
              <Button
                variant={isInstalled ? 'secondary' : 'primary'}
                size="sm"
                fullWidth
                onClick={onInstall}
                disabled={!canInstall || !canAfford || !tierMet || isLoading}
                isLoading={isLoading}
                loadingText="Installing..."
              >
                {!tierMet
                  ? 'Tier Too Low'
                  : !canAfford
                    ? 'Insufficient Gold'
                    : !canInstall
                      ? 'No Slots'
                      : isInstalled
                        ? `Upgrade to Lvl ${currentLevel + 1}`
                        : 'Install'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Benefits modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title={upgrade.name}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-desert-stone">{upgrade.description}</p>

          <div>
            <h5 className="text-sm font-western text-desert-sand mb-2">Benefits</h5>
            <ul className="space-y-1">
              {upgrade.benefits.map((benefit, i) => (
                <li key={i} className="text-sm text-gold-light">
                  + {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-desert-stone">Category:</span>
              <span className="text-desert-sand ml-2">{categoryName}</span>
            </div>
            <div>
              <span className="text-desert-stone">Max Level:</span>
              <span className="text-desert-sand ml-2">{upgrade.maxLevel}</span>
            </div>
            <div>
              <span className="text-desert-stone">Min Tier:</span>
              <span className="text-desert-sand ml-2">{upgrade.minTier}</span>
            </div>
            <div>
              <span className="text-desert-stone">Cost:</span>
              <span className="text-gold-light ml-2">{formatGold(upgrade.cost)}</span>
            </div>
          </div>

          <Button variant="ghost" fullWidth onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
};

/**
 * UpgradePanel component
 */
export const UpgradePanel: React.FC<UpgradePanelProps> = ({
  propertyType,
  currentTier,
  currentUpgrades,
  maxUpgrades,
  onAddUpgrade,
  onClose,
  characterGold = 0,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<UpgradeCategory | 'all'>('all');

  const availableUpgrades = getAvailableUpgrades(propertyType);
  const usedSlots = currentUpgrades.length;
  const canAddMore = usedSlots < maxUpgrades;

  // Get current levels for each upgrade
  const upgradeLevels: Record<string, number> = {};
  currentUpgrades.forEach((u) => {
    upgradeLevels[u.upgradeType] = (upgradeLevels[u.upgradeType] || 0) + 1;
  });

  // Filter upgrades
  const filteredUpgrades =
    categoryFilter === 'all'
      ? availableUpgrades
      : availableUpgrades.filter((u) => u.category === categoryFilter);

  const handleInstall = async (upgradeType: string) => {
    setIsLoading(true);
    const result = await onAddUpgrade(upgradeType);
    setActionMessage({ text: result.message, success: result.success });
    setTimeout(() => setActionMessage(null), 3000);
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-western text-desert-sand">Property Upgrades</h3>
          <p className="text-sm text-desert-stone">
            {usedSlots}/{maxUpgrades} upgrade slots used
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-desert-stone hover:text-desert-sand transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Action message */}
      {actionMessage && (
        <div
          className={`rounded-lg p-3 text-center ${
            actionMessage.success
              ? 'bg-green-900/50 border border-green-500/50'
              : 'bg-red-900/50 border border-red-500/50'
          }`}
        >
          <p className="text-desert-sand text-sm">{actionMessage.text}</p>
        </div>
      )}

      {/* Gold display */}
      <Card variant="leather" className="p-3">
        <div className="flex justify-between items-center">
          <span className="text-desert-stone">Your Gold:</span>
          <span className="text-gold-light font-western">{formatGold(characterGold)}</span>
        </div>
      </Card>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
            categoryFilter === 'all'
              ? 'bg-gold-light text-wood-dark'
              : 'bg-wood-dark border border-wood-grain text-desert-sand hover:border-gold-light/50'
          }`}
        >
          All
        </button>
        {(Object.keys(CATEGORY_NAMES) as UpgradeCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => setCategoryFilter(category)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors flex items-center gap-1 ${
              categoryFilter === category
                ? 'bg-gold-light text-wood-dark'
                : 'bg-wood-dark border border-wood-grain text-desert-sand hover:border-gold-light/50'
            }`}
          >
            <span>{CATEGORY_ICONS[category]}</span>
            {CATEGORY_NAMES[category]}
          </button>
        ))}
      </div>

      {/* Available upgrades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredUpgrades.map((upgrade) => {
          const currentLevel = upgradeLevels[upgrade.upgradeType] || 0;
          const tierMet = currentTier >= upgrade.minTier;
          const canAfford = characterGold >= upgrade.cost;

          return (
            <UpgradeOptionCard
              key={upgrade.upgradeId}
              upgrade={upgrade}
              currentLevel={currentLevel}
              canInstall={canAddMore || currentLevel > 0}
              canAfford={canAfford}
              tierMet={tierMet}
              onInstall={() => handleInstall(upgrade.upgradeType)}
              isLoading={isLoading}
            />
          );
        })}
      </div>

      {filteredUpgrades.length === 0 && (
        <Card variant="leather" className="p-6 text-center">
          <p className="text-desert-stone">No upgrades in this category</p>
        </Card>
      )}
    </div>
  );
};

export default UpgradePanel;
