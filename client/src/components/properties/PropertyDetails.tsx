/**
 * PropertyDetails Component
 * Displays detailed property information with management options
 */

import React, { useState } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { formatDollars } from '@/utils/format';
import type {
  Property,
  PropertyType,
  PropertyTier,
  PropertySize,
  PropertyStatus,
  PropertyUpgrade,
} from '@desperados/shared';
import { PROPERTY_TIER_INFO } from '@desperados/shared';

/**
 * Property type icons
 */
const PROPERTY_TYPE_ICONS: Record<PropertyType, string> = {
  ranch: '🏠',
  shop: '🏪',
  workshop: '🔨',
  homestead: '🏡',
  mine: '⛏️',
  saloon: '🍺',
  stable: '🐴',
};

/**
 * Property type display names
 */
const PROPERTY_TYPE_NAMES: Record<PropertyType, string> = {
  ranch: 'Ranch',
  shop: 'Shop',
  workshop: 'Workshop',
  homestead: 'Homestead',
  mine: 'Mine',
  saloon: 'Saloon',
  stable: 'Stable',
};

/**
 * Size display configuration
 */
const SIZE_CONFIG: Record<PropertySize, { name: string; color: string }> = {
  small: { name: 'Small', color: 'text-desert-stone' },
  medium: { name: 'Medium', color: 'text-green-400' },
  large: { name: 'Large', color: 'text-blue-400' },
  huge: { name: 'Huge', color: 'text-purple-400' },
};

/**
 * Status display configuration
 */
const STATUS_CONFIG: Record<PropertyStatus, { name: string; color: string; bg: string }> = {
  active: { name: 'Active', color: 'text-green-400', bg: 'bg-green-600/20' },
  abandoned: { name: 'Abandoned', color: 'text-red-400', bg: 'bg-red-600/20' },
  foreclosed: { name: 'Foreclosed', color: 'text-orange-400', bg: 'bg-orange-600/20' },
  under_construction: { name: 'Under Construction', color: 'text-blue-400', bg: 'bg-blue-600/20' },
};

/**
 * Tier names
 */
const TIER_NAMES: Record<PropertyTier, string> = {
  1: 'Basic',
  2: 'Improved',
  3: 'Advanced',
  4: 'Superior',
  5: 'Legendary',
};

interface PropertyDetailsProps {
  property: Property;
  onUpgradeTier?: () => Promise<{ success: boolean; message: string }>;
  onManageWorkers?: () => void;
  onManageStorage?: () => void;
  onManageUpgrades?: () => void;
  onTransfer?: () => void;
  onClose?: () => void;
  isLoading?: boolean;
  characterGold?: number;
}

/**
 * Condition bar component
 */
const ConditionBar: React.FC<{ condition: number; size?: 'sm' | 'md' }> = ({
  condition,
  size = 'md',
}) => {
  let barColor = 'bg-green-500';
  let label = 'Excellent';
  if (condition < 30) {
    barColor = 'bg-red-500';
    label = 'Dilapidated';
  } else if (condition < 50) {
    barColor = 'bg-orange-500';
    label = 'Poor';
  } else if (condition < 70) {
    barColor = 'bg-yellow-500';
    label = 'Fair';
  } else if (condition < 90) {
    barColor = 'bg-green-400';
    label = 'Good';
  }

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-desert-stone">Condition</span>
        <span className={condition < 50 ? 'text-red-400' : 'text-desert-sand'}>
          {condition}% - {label}
        </span>
      </div>
      <div
        className={`${size === 'sm' ? 'h-2' : 'h-3'} bg-wood-dark rounded-full overflow-hidden`}
      >
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${condition}%` }}
          role="progressbar"
          aria-valuenow={condition}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

/**
 * Tier progression component
 */
const TierProgression: React.FC<{
  currentTier: PropertyTier;
  onUpgrade?: () => void;
  canUpgrade: boolean;
  upgradeCost: number;
  isLoading?: boolean;
}> = ({ currentTier, onUpgrade, canUpgrade, upgradeCost, isLoading }) => {
  return (
    <Card variant="leather" className="p-4">
      <h4 className="font-western text-lg text-desert-sand mb-3">Property Tier</h4>
      <div className="space-y-3">
        {/* Tier stars */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((tier) => (
            <div
              key={tier}
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center text-xl
                transition-all duration-200
                ${
                  tier <= currentTier
                    ? 'bg-gold-dark text-gold-light border-2 border-gold-light'
                    : tier === currentTier + 1
                      ? 'bg-wood-dark border-2 border-dashed border-gold-light/50 text-gold-light/50'
                      : 'bg-wood-dark border-2 border-wood-grain/30 text-wood-grain/30'
                }
              `}
            >
              {tier <= currentTier ? '★' : '☆'}
            </div>
          ))}
        </div>

        {/* Current tier info */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-desert-sand font-semibold">
              Tier {currentTier}: {TIER_NAMES[currentTier]}
            </p>
            <p className="text-xs text-desert-stone">
              {PROPERTY_TIER_INFO[currentTier].upgradeSlots} upgrade slots,{' '}
              {PROPERTY_TIER_INFO[currentTier].workerSlots} workers,{' '}
              {PROPERTY_TIER_INFO[currentTier].productionSlots} production slots
            </p>
          </div>
          {currentTier < 5 && (
            <div className="text-right">
              <p className="text-xs text-desert-stone">Next tier cost:</p>
              <p className="text-gold-light font-western">
                {formatDollars(upgradeCost)}
              </p>
            </div>
          )}
        </div>

        {/* Upgrade button */}
        {currentTier < 5 && onUpgrade && (
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={onUpgrade}
            disabled={!canUpgrade || isLoading}
            isLoading={isLoading}
            loadingText="Upgrading..."
          >
            {canUpgrade
              ? `Upgrade to Tier ${currentTier + 1}`
              : 'Insufficient Gold'}
          </Button>
        )}
        {currentTier >= 5 && (
          <p className="text-center text-gold-light font-western text-sm">
            Maximum Tier Reached!
          </p>
        )}
      </div>
    </Card>
  );
};

/**
 * Upgrade list component
 */
const UpgradeList: React.FC<{
  upgrades: PropertyUpgrade[];
  maxUpgrades: number;
  onManage?: () => void;
}> = ({ upgrades, maxUpgrades, onManage }) => {
  return (
    <Card variant="leather" className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-western text-lg text-desert-sand">Upgrades</h4>
        <span className="text-sm text-desert-stone">
          {upgrades.length}/{maxUpgrades} slots used
        </span>
      </div>

      {upgrades.length === 0 ? (
        <p className="text-desert-stone text-sm italic">No upgrades installed</p>
      ) : (
        <ul className="space-y-2">
          {upgrades.map((upgrade) => (
            <li
              key={upgrade.upgradeId}
              className="flex items-center justify-between bg-wood-dark/50 rounded-lg p-2"
            >
              <div>
                <p className="text-desert-sand text-sm capitalize">
                  {upgrade.upgradeType.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-desert-stone">
                  Level {upgrade.level}/{upgrade.maxLevel}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: upgrade.maxLevel }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < upgrade.level ? 'bg-gold-light' : 'bg-wood-grain/30'
                    }`}
                  />
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {onManage && (
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={onManage}
          className="mt-3"
        >
          Manage Upgrades
        </Button>
      )}
    </Card>
  );
};

/**
 * PropertyDetails component
 */
export const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  onUpgradeTier,
  onManageWorkers,
  onManageStorage,
  onManageUpgrades,
  onTransfer,
  onClose,
  isLoading = false,
  characterGold = 0,
}) => {
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);

  const icon = PROPERTY_TYPE_ICONS[property.propertyType] || '🏠';
  const typeName = PROPERTY_TYPE_NAMES[property.propertyType] || 'Property';
  const sizeConfig = SIZE_CONFIG[property.size] || SIZE_CONFIG.small;
  const statusConfig = STATUS_CONFIG[property.status] || STATUS_CONFIG.active;

  // Calculate next tier upgrade cost
  const nextTier = (property.tier + 1) as PropertyTier;
  const upgradeCost =
    nextTier <= 5 ? PROPERTY_TIER_INFO[nextTier as keyof typeof PROPERTY_TIER_INFO]?.upgradeCost || 0 : 0;
  const canAffordUpgrade = characterGold >= upgradeCost;

  // Calculate weekly income (simplified)
  const tierMultiplier = property.tier;
  const conditionMultiplier = property.condition / 100;
  const baseIncome: Record<PropertyType, number> = {
    ranch: 50,
    shop: 75,
    workshop: 60,
    homestead: 0,
    mine: 100,
    saloon: 120,
    stable: 70,
  };
  const weeklyIncome = Math.floor(
    (baseIncome[property.propertyType] || 0) * tierMultiplier * conditionMultiplier
  );

  const weeklyExpenses = property.weeklyTaxes + property.weeklyUpkeep;
  const weeklyProfit = weeklyIncome - weeklyExpenses;

  // Handle tier upgrade
  const handleUpgradeTier = async () => {
    if (!onUpgradeTier) return;
    setUpgradeLoading(true);
    const result = await onUpgradeTier();
    setActionMessage({ text: result.message, success: result.success });
    setTimeout(() => setActionMessage(null), 3000);
    setUpgradeLoading(false);
  };

  return (
    <div className="space-y-4">
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

      {/* Header */}
      <Card variant="wood" className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-5xl" role="img" aria-label={typeName}>
              {icon}
            </span>
            <div>
              <h2 className="text-2xl font-western text-desert-sand">
                {property.name}
              </h2>
              <p className="text-desert-stone">{typeName}</p>
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-1 mt-2 rounded-full text-xs ${statusConfig.bg} ${statusConfig.color}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {statusConfig.name}
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-desert-stone hover:text-desert-sand transition-colors"
              aria-label="Close details"
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
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card variant="leather" className="p-3 text-center">
          <p className="text-xs text-desert-stone uppercase">Size</p>
          <p className={`font-western ${sizeConfig.color}`}>{sizeConfig.name}</p>
        </Card>
        <Card variant="leather" className="p-3 text-center">
          <p className="text-xs text-desert-stone uppercase">Tier</p>
          <p className="font-western text-gold-light">
            {property.tier} - {TIER_NAMES[property.tier]}
          </p>
        </Card>
        <Card variant="leather" className="p-3 text-center">
          <p className="text-xs text-desert-stone uppercase">Workers</p>
          <p className="font-western text-desert-sand">
            {property.workers?.filter((w) => w.isAssigned).length || 0}/
            {property.maxWorkers}
          </p>
        </Card>
        <Card variant="leather" className="p-3 text-center">
          <p className="text-xs text-desert-stone uppercase">Storage</p>
          <p className="font-western text-desert-sand">
            {property.storage?.currentUsage || 0}/{property.storage?.capacity || 0}
          </p>
        </Card>
      </div>

      {/* Condition */}
      <Card variant="leather" className="p-4">
        <ConditionBar condition={property.condition} size="md" />
      </Card>

      {/* Financial overview */}
      <Card variant="leather" className="p-4">
        <h4 className="font-western text-lg text-desert-sand mb-3">
          Weekly Finances
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-desert-stone">Estimated Income:</span>
            <span className="text-green-400">+{formatDollars(weeklyIncome)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-desert-stone">Taxes:</span>
            <span className="text-red-400">-{formatDollars(property.weeklyTaxes)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-desert-stone">Upkeep:</span>
            <span className="text-red-400">-{formatDollars(property.weeklyUpkeep)}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-wood-dark/30">
            <span className="text-desert-sand font-semibold">Net Profit:</span>
            <span
              className={`font-western ${
                weeklyProfit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {weeklyProfit >= 0 ? '+' : ''}
              {formatDollars(weeklyProfit)}
            </span>
          </div>
        </div>
        {property.taxDebt > 0 && (
          <div className="mt-3 p-2 bg-red-900/30 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm font-semibold">
              Tax Debt: {formatDollars(property.taxDebt)}
            </p>
            <p className="text-red-300 text-xs">
              Pay off your debt to avoid foreclosure!
            </p>
          </div>
        )}
      </Card>

      {/* Tier progression */}
      <TierProgression
        currentTier={property.tier}
        onUpgrade={onUpgradeTier ? handleUpgradeTier : undefined}
        canUpgrade={canAffordUpgrade}
        upgradeCost={upgradeCost}
        isLoading={upgradeLoading}
      />

      {/* Upgrades */}
      <UpgradeList
        upgrades={property.upgrades || []}
        maxUpgrades={property.maxUpgrades}
        onManage={onManageUpgrades}
      />

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        {onManageWorkers && (
          <Button variant="primary" onClick={onManageWorkers} disabled={isLoading}>
            Manage Workers
          </Button>
        )}
        {onManageStorage && (
          <Button variant="primary" onClick={onManageStorage} disabled={isLoading}>
            Manage Storage
          </Button>
        )}
        {onTransfer && (
          <Button
            variant="ghost"
            onClick={() => setShowTransferModal(true)}
            disabled={isLoading}
            className="col-span-2"
          >
            Transfer Property
          </Button>
        )}
      </div>

      {/* Transfer confirmation modal */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Transfer Property"
      >
        <div className="space-y-4">
          <p className="text-desert-sand">
            Are you sure you want to transfer <strong>{property.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                setShowTransferModal(false);
                onTransfer?.();
              }}
            >
              Transfer
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowTransferModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PropertyDetails;
