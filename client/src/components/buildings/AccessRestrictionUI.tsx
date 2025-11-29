/**
 * AccessRestrictionUI Component
 * Shows why a building is restricted and options to bypass
 */

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AccessRestriction {
  canAccess: boolean;
  reason?: string;
  canBribe?: boolean;
  bribeCost?: number;
}

interface BuildingRequirements {
  minLevel?: number;
  minReputation?: number;
  maxWanted?: number;
  minCriminalRep?: number;
  requiredSkills?: { skillId: string; level: number }[];
  requiredItems?: string[];
  faction?: string;
  factionStanding?: string;
  gangMember?: boolean;
}

interface OperatingHours {
  open: number;
  close: number;
}

interface AccessRestrictionUIProps {
  buildingName: string;
  requirements?: BuildingRequirements;
  operatingHours?: OperatingHours;
  accessCheck: AccessRestriction;
  characterLevel: number;
  characterWantedLevel: number;
  characterGold: number;
  isInGang: boolean;
  onBribe?: () => void;
  onClose: () => void;
}

// Faction standing labels
const STANDING_LABELS: Record<string, { label: string; color: string }> = {
  hostile: { label: 'Hostile', color: 'text-blood-red' },
  unfriendly: { label: 'Unfriendly', color: 'text-orange-500' },
  neutral: { label: 'Neutral', color: 'text-desert-clay' },
  friendly: { label: 'Friendly', color: 'text-green-500' },
  honored: { label: 'Honored', color: 'text-gold-medium' },
};

export const AccessRestrictionUI: React.FC<AccessRestrictionUIProps> = ({
  buildingName,
  requirements,
  operatingHours,
  accessCheck,
  characterLevel,
  characterWantedLevel,
  characterGold,
  isInGang,
  onBribe,
  onClose,
}) => {
  const canAffordBribe = accessCheck.bribeCost ? characterGold >= accessCheck.bribeCost : false;

  return (
    <Card variant="wood" className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-4 pb-4 border-b border-wood-light">
        <span className="text-4xl mb-2 block">🔒</span>
        <h2 className="text-xl font-western text-desert-sand">
          Access Denied
        </h2>
        <p className="text-sm text-desert-clay mt-1">
          {buildingName}
        </p>
      </div>

      {/* Main reason */}
      <div className="mb-4 p-3 bg-blood-red/20 border border-blood-red/40 rounded">
        <p className="text-blood-red font-semibold text-center">
          {accessCheck.reason || 'You cannot enter this building'}
        </p>
      </div>

      {/* Requirements breakdown */}
      {requirements && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-desert-sand mb-2 uppercase">
            Requirements
          </h3>
          <div className="space-y-2">
            {/* Level */}
            {requirements.minLevel && (
              <RequirementRow
                label="Level"
                required={`${requirements.minLevel}+`}
                current={characterLevel.toString()}
                met={characterLevel >= requirements.minLevel}
              />
            )}

            {/* Wanted Level */}
            {requirements.maxWanted !== undefined && (
              <RequirementRow
                label="Max Wanted"
                required={requirements.maxWanted.toString()}
                current={characterWantedLevel.toString()}
                met={characterWantedLevel <= requirements.maxWanted}
                icon="⭐"
              />
            )}

            {/* Criminal Rep */}
            {requirements.minCriminalRep !== undefined && (
              <RequirementRow
                label="Criminal Rep"
                required={`${requirements.minCriminalRep}+`}
                current="?"
                met={false}
                icon="💀"
              />
            )}

            {/* Faction Standing */}
            {requirements.faction && requirements.factionStanding && (
              <RequirementRow
                label={`${requirements.faction} Standing`}
                required={STANDING_LABELS[requirements.factionStanding]?.label || requirements.factionStanding}
                current="?"
                met={false}
                icon="🏛️"
              />
            )}

            {/* Gang Membership */}
            {requirements.gangMember && (
              <RequirementRow
                label="Gang Member"
                required="Yes"
                current={isInGang ? 'Yes' : 'No'}
                met={isInGang}
                icon="🤝"
              />
            )}

            {/* Required Items */}
            {requirements.requiredItems && requirements.requiredItems.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-desert-clay">
                  📦 Required Items
                </span>
                <span className="text-blood-red">
                  {requirements.requiredItems.length} item(s)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Operating Hours */}
      {operatingHours && (
        <div className="mb-4 p-2 bg-wood-light/20 rounded">
          <p className="text-sm text-desert-clay">
            <span className="mr-2">🕐</span>
            Operating Hours: {operatingHours.open}:00 - {operatingHours.close}:00
          </p>
        </div>
      )}

      {/* Bribe option */}
      {accessCheck.canBribe && accessCheck.bribeCost && onBribe && (
        <div className="mb-4 p-3 bg-gold-medium/10 border border-gold-medium/40 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-desert-sand">
              💰 Bribe the guard
            </span>
            <span className={`font-bold ${canAffordBribe ? 'text-gold-medium' : 'text-blood-red'}`}>
              {accessCheck.bribeCost} gold
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            disabled={!canAffordBribe}
            onClick={onBribe}
          >
            {canAffordBribe ? 'Pay Bribe' : `Need ${accessCheck.bribeCost - characterGold} more gold`}
          </Button>
          <p className="text-xs text-desert-clay mt-2 text-center">
            ⚠️ This will increase your criminal reputation
          </p>
        </div>
      )}

      {/* Close button */}
      <Button variant="ghost" fullWidth onClick={onClose}>
        Go Back
      </Button>
    </Card>
  );
};

// Requirement row component
const RequirementRow: React.FC<{
  label: string;
  required: string;
  current: string;
  met: boolean;
  icon?: string;
}> = ({ label, required, current, met, icon }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-desert-clay">
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </span>
    <div className="flex items-center gap-2">
      <span className={met ? 'text-green-500' : 'text-blood-red'}>
        {current}
      </span>
      <span className="text-desert-clay">/</span>
      <span className="text-desert-sand">{required}</span>
      <span>{met ? '✅' : '❌'}</span>
    </div>
  </div>
);

export default AccessRestrictionUI;
