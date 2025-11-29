/**
 * PropertyCard Component
 * Displays a property as a card with key information
 */

import React from 'react';
import { Card, Button } from '@/components/ui';
import { formatGold } from '@/utils/format';
import type {
  Property,
  PropertyListing,
  PropertyType,
  PropertyTier,
  PropertySize,
  PropertyStatus,
} from '@desperados/shared';

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

interface PropertyCardProps {
  property: Property | PropertyListing;
  variant?: 'listing' | 'owned' | 'foreclosed';
  onSelect?: () => void;
  onPurchase?: () => void;
  onManage?: () => void;
  isSelected?: boolean;
  showActions?: boolean;
}

/**
 * Type guard to check if property is a Property (owned) vs PropertyListing
 */
function isOwnedProperty(property: Property | PropertyListing): property is Property {
  return 'ownerId' in property || 'workers' in property;
}

/**
 * Render tier stars
 */
const TierStars: React.FC<{ tier: PropertyTier }> = ({ tier }) => {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Tier ${tier} of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-sm ${star <= tier ? 'text-gold-light' : 'text-wood-grain/40'}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
};

/**
 * Condition bar component
 */
const ConditionBar: React.FC<{ condition: number }> = ({ condition }) => {
  let barColor = 'bg-green-500';
  if (condition < 30) barColor = 'bg-red-500';
  else if (condition < 50) barColor = 'bg-orange-500';
  else if (condition < 70) barColor = 'bg-yellow-500';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-desert-stone">Condition</span>
        <span className={condition < 50 ? 'text-red-400' : 'text-desert-sand'}>
          {condition}%
        </span>
      </div>
      <div className="h-2 bg-wood-dark rounded-full overflow-hidden">
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
 * PropertyCard component
 */
export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  variant = 'listing',
  onSelect,
  onPurchase,
  onManage,
  isSelected = false,
  showActions = true,
}) => {
  const isOwned = isOwnedProperty(property);
  const propertyType = property.propertyType;
  const icon = PROPERTY_TYPE_ICONS[propertyType] || '🏠';
  const typeName = PROPERTY_TYPE_NAMES[propertyType] || 'Property';
  const sizeConfig = SIZE_CONFIG[property.size] || SIZE_CONFIG.small;

  // Get price - either purchasePrice for owned or price for listing
  const price = isOwned
    ? property.purchasePrice
    : (property as PropertyListing).price;

  // Get status for owned properties
  const status = isOwned ? property.status : null;
  const statusConfig = status ? STATUS_CONFIG[status] : null;

  // Check if foreclosed (listing variant)
  const isForeclosed = variant === 'foreclosed';

  return (
    <Card
      variant="wood"
      padding="none"
      hover={!!onSelect}
      onClick={onSelect}
      className={`
        overflow-hidden transition-all duration-200
        ${isSelected ? 'ring-2 ring-gold-light shadow-lg' : ''}
        ${isForeclosed ? 'border-2 border-orange-500/50' : ''}
      `}
    >
      {/* Header with type icon and tier */}
      <div className="flex items-center justify-between p-4 border-b border-wood-dark/50">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label={typeName}>
            {icon}
          </span>
          <div>
            <h3 className="font-western text-lg text-desert-sand">{property.name}</h3>
            <p className="text-sm text-desert-stone">{typeName}</p>
          </div>
        </div>
        <TierStars tier={property.tier} />
      </div>

      {/* Body content */}
      <div className="p-4 space-y-3">
        {/* Size and Location */}
        <div className="flex justify-between text-sm">
          <span className="text-desert-stone">Size:</span>
          <span className={sizeConfig.color}>{sizeConfig.name}</span>
        </div>

        {/* Location - for listings */}
        {!isOwned && (property as PropertyListing).locationName && (
          <div className="flex justify-between text-sm">
            <span className="text-desert-stone">Location:</span>
            <span className="text-desert-sand">
              {(property as PropertyListing).locationName}
            </span>
          </div>
        )}

        {/* Condition bar */}
        <ConditionBar condition={property.condition} />

        {/* Status for owned properties */}
        {statusConfig && (
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${statusConfig.bg} ${statusConfig.color}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {statusConfig.name}
          </div>
        )}

        {/* Foreclosed badge */}
        {isForeclosed && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-orange-600/20 text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Foreclosed - Discounted!
          </div>
        )}

        {/* Price */}
        <div className="flex justify-between items-center pt-2 border-t border-wood-dark/30">
          <span className="text-desert-stone text-sm">
            {isOwned ? 'Purchased for:' : 'Price:'}
          </span>
          <span
            className={`font-western text-lg ${
              isForeclosed ? 'text-orange-400' : 'text-gold-light'
            }`}
          >
            {formatGold(price)}
          </span>
        </div>

        {/* Owned property stats */}
        {isOwned && (
          <div className="grid grid-cols-2 gap-2 pt-2 text-sm">
            <div className="flex justify-between">
              <span className="text-desert-stone">Workers:</span>
              <span className="text-desert-sand">
                {property.workers?.filter((w) => w.isActive).length || 0}/{property.maxWorkers}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-desert-stone">Upgrades:</span>
              <span className="text-desert-sand">
                {property.upgrades?.length || 0}/{property.maxUpgrades}
              </span>
            </div>
          </div>
        )}

        {/* Weekly costs for owned properties */}
        {isOwned && (
          <div className="flex justify-between text-sm pt-2 border-t border-wood-dark/30">
            <span className="text-desert-stone">Weekly Costs:</span>
            <span className="text-red-400">
              -{formatGold(property.weeklyTaxes + property.weeklyUpkeep)}
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="p-4 pt-0 flex gap-2">
          {variant === 'listing' && onPurchase && (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onPurchase();
              }}
            >
              Purchase
            </Button>
          )}
          {variant === 'foreclosed' && onPurchase && (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onPurchase();
              }}
            >
              Buy Foreclosed
            </Button>
          )}
          {variant === 'owned' && onManage && (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onManage();
              }}
            >
              Manage
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default PropertyCard;
