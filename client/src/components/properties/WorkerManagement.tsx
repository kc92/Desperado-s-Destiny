/**
 * WorkerManagement Component
 * Manages hiring and firing workers for a property
 */

import React, { useState } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { formatGold } from '@/utils/format';
import type { PropertyWorker, WorkerType } from '@desperados/shared';
import { BASE_WORKER_WAGES, WORKER_SKILL_TIERS } from '@desperados/shared';

/**
 * Worker type icons
 */
const WORKER_TYPE_ICONS: Record<WorkerType, string> = {
  farmhand: '👨‍🌾',
  shopkeeper: '🧑‍💼',
  craftsman: '🔧',
  miner: '⛏️',
  bartender: '🍸',
  stable_hand: '🐴',
  security: '💪',
  manager: '📋',
};

/**
 * Worker type display names
 */
const WORKER_TYPE_NAMES: Record<WorkerType, string> = {
  farmhand: 'Farmhand',
  shopkeeper: 'Shopkeeper',
  craftsman: 'Craftsman',
  miner: 'Miner',
  bartender: 'Bartender',
  stable_hand: 'Stable Hand',
  security: 'Security',
  manager: 'Manager',
};

/**
 * Get skill tier info
 */
function getSkillTier(skill: number): { name: string; color: string } {
  if (skill >= WORKER_SKILL_TIERS.MASTER.min) {
    return { name: 'Master', color: 'text-purple-400' };
  }
  if (skill >= WORKER_SKILL_TIERS.EXPERT.min) {
    return { name: 'Expert', color: 'text-blue-400' };
  }
  if (skill >= WORKER_SKILL_TIERS.SKILLED.min) {
    return { name: 'Skilled', color: 'text-green-400' };
  }
  return { name: 'Novice', color: 'text-desert-stone' };
}

/**
 * Calculate wage based on worker type and skill
 */
function calculateWage(workerType: WorkerType, skill: number): number {
  const baseWage = BASE_WORKER_WAGES[workerType] || 5;
  let multiplier = WORKER_SKILL_TIERS.NOVICE.wageMultiplier;

  if (skill >= WORKER_SKILL_TIERS.MASTER.min) {
    multiplier = WORKER_SKILL_TIERS.MASTER.wageMultiplier;
  } else if (skill >= WORKER_SKILL_TIERS.EXPERT.min) {
    multiplier = WORKER_SKILL_TIERS.EXPERT.wageMultiplier;
  } else if (skill >= WORKER_SKILL_TIERS.SKILLED.min) {
    multiplier = WORKER_SKILL_TIERS.SKILLED.wageMultiplier;
  }

  return Math.floor(baseWage * multiplier);
}

interface WorkerManagementProps {
  workers: PropertyWorker[];
  maxWorkers: number;
  availableWorkerTypes: WorkerType[];
  onHireWorker: (
    workerType: WorkerType,
    skill: number
  ) => Promise<{ success: boolean; message: string }>;
  onFireWorker: (
    workerId: string
  ) => Promise<{ success: boolean; message: string }>;
  onClose?: () => void;
  characterGold?: number;
}

/**
 * Worker card component
 */
const WorkerCard: React.FC<{
  worker: PropertyWorker;
  onFire: () => void;
  isLoading: boolean;
}> = ({ worker, onFire, isLoading }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const icon = WORKER_TYPE_ICONS[worker.workerType] || '👤';
  const typeName = WORKER_TYPE_NAMES[worker.workerType] || 'Worker';
  const skillTier = getSkillTier(worker.skill);

  const handleFire = () => {
    setShowConfirm(false);
    onFire();
  };

  return (
    <>
      <Card
        variant="leather"
        padding="none"
        className={`overflow-hidden ${!worker.isActive ? 'opacity-50' : ''}`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl" role="img" aria-label={typeName}>
                {icon}
              </span>
              <div>
                <h4 className="font-western text-desert-sand">{worker.name}</h4>
                <p className="text-sm text-desert-stone">{typeName}</p>
              </div>
            </div>
            {worker.isActive && (
              <span className="w-2 h-2 rounded-full bg-green-500" title="Active" />
            )}
          </div>

          <div className="mt-3 space-y-2">
            {/* Skill */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-desert-stone">Skill</span>
                <span className={skillTier.color}>
                  {worker.skill} - {skillTier.name}
                </span>
              </div>
              <div className="h-2 bg-wood-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-light transition-all duration-300"
                  style={{ width: `${worker.skill}%` }}
                />
              </div>
            </div>

            {/* Wage */}
            <div className="flex justify-between text-sm">
              <span className="text-desert-stone">Daily Wage:</span>
              <span className="text-gold-light">{formatGold(worker.dailyWage)}</span>
            </div>

            {/* Hired date */}
            <div className="flex justify-between text-xs text-desert-stone">
              <span>Hired:</span>
              <span>
                {new Date(worker.hiredAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {worker.isActive && (
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={() => setShowConfirm(true)}
              disabled={isLoading}
              className="mt-3"
            >
              Fire Worker
            </Button>
          )}
        </div>
      </Card>

      {/* Confirm fire modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Fire Worker"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-desert-sand">
            Are you sure you want to fire <strong>{worker.name}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="danger" fullWidth onClick={handleFire}>
              Fire
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

/**
 * Hire worker form component
 */
const HireWorkerForm: React.FC<{
  availableTypes: WorkerType[];
  onHire: (type: WorkerType, skill: number) => void;
  isLoading: boolean;
  characterGold: number;
}> = ({ availableTypes, onHire, isLoading, characterGold }) => {
  const [selectedType, setSelectedType] = useState<WorkerType | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<'novice' | 'skilled' | 'expert' | 'master'>(
    'novice'
  );

  const skillRanges = {
    novice: { min: 10, max: 25, label: 'Novice' },
    skilled: { min: 30, max: 50, label: 'Skilled' },
    expert: { min: 55, max: 75, label: 'Expert' },
    master: { min: 80, max: 100, label: 'Master' },
  };

  const getRandomSkill = (tier: 'novice' | 'skilled' | 'expert' | 'master'): number => {
    const range = skillRanges[tier];
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  };

  const estimatedWage = selectedType
    ? calculateWage(selectedType, skillRanges[selectedSkill].min)
    : 0;

  const hiringCost = estimatedWage * 7; // One week advance payment
  const canAfford = characterGold >= hiringCost;

  const handleHire = () => {
    if (!selectedType) return;
    const skill = getRandomSkill(selectedSkill);
    onHire(selectedType, skill);
    setSelectedType(null);
  };

  return (
    <Card variant="wood" className="p-4">
      <h4 className="font-western text-lg text-desert-sand mb-4">Hire New Worker</h4>

      {/* Worker type selection */}
      <div className="mb-4">
        <label className="block text-sm text-desert-stone mb-2">Worker Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {availableTypes.map((type) => {
            const icon = WORKER_TYPE_ICONS[type];
            const name = WORKER_TYPE_NAMES[type];
            const isSelected = selectedType === type;

            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`
                  p-3 rounded-lg border-2 transition-all text-center
                  ${
                    isSelected
                      ? 'border-gold-light bg-gold-dark/20'
                      : 'border-wood-grain/30 hover:border-wood-grain/50 bg-wood-dark/50'
                  }
                `}
              >
                <span className="text-2xl block mb-1">{icon}</span>
                <span className="text-xs text-desert-sand">{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Skill tier selection */}
      <div className="mb-4">
        <label className="block text-sm text-desert-stone mb-2">Skill Level</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(Object.keys(skillRanges) as Array<keyof typeof skillRanges>).map((tier) => {
            const isSelected = selectedSkill === tier;
            const range = skillRanges[tier];

            return (
              <button
                key={tier}
                onClick={() => setSelectedSkill(tier)}
                className={`
                  p-2 rounded-lg border-2 transition-all text-center
                  ${
                    isSelected
                      ? 'border-gold-light bg-gold-dark/20'
                      : 'border-wood-grain/30 hover:border-wood-grain/50 bg-wood-dark/50'
                  }
                `}
              >
                <span className="text-sm text-desert-sand block">{range.label}</span>
                <span className="text-xs text-desert-stone">
                  {range.min}-{range.max} skill
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cost preview */}
      {selectedType && (
        <div className="mb-4 p-3 bg-wood-dark/50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-desert-stone">Est. Daily Wage:</span>
            <span className="text-gold-light">{formatGold(estimatedWage)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-desert-stone">Hiring Cost (1 week advance):</span>
            <span className={canAfford ? 'text-gold-light' : 'text-red-400'}>
              {formatGold(hiringCost)}
            </span>
          </div>
        </div>
      )}

      <Button
        variant="primary"
        fullWidth
        onClick={handleHire}
        disabled={!selectedType || !canAfford || isLoading}
        isLoading={isLoading}
        loadingText="Hiring..."
      >
        {!selectedType
          ? 'Select Worker Type'
          : !canAfford
            ? 'Insufficient Gold'
            : 'Hire Worker'}
      </Button>
    </Card>
  );
};

/**
 * WorkerManagement component
 */
export const WorkerManagement: React.FC<WorkerManagementProps> = ({
  workers,
  maxWorkers,
  availableWorkerTypes,
  onHireWorker,
  onFireWorker,
  onClose,
  characterGold = 0,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);

  const activeWorkers = workers.filter((w) => w.isActive);
  const canHireMore = activeWorkers.length < maxWorkers;

  const totalDailyWages = activeWorkers.reduce(
    (sum, w) => sum + w.dailyWage,
    0
  );
  const totalWeeklyWages = totalDailyWages * 7;

  const handleHireWorker = async (workerType: WorkerType, skill: number) => {
    setIsLoading(true);
    const result = await onHireWorker(workerType, skill);
    setActionMessage({ text: result.message, success: result.success });
    setTimeout(() => setActionMessage(null), 3000);
    setIsLoading(false);
  };

  const handleFireWorker = async (workerId: string) => {
    setIsLoading(true);
    const result = await onFireWorker(workerId);
    setActionMessage({ text: result.message, success: result.success });
    setTimeout(() => setActionMessage(null), 3000);
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-western text-desert-sand">Worker Management</h3>
          <p className="text-sm text-desert-stone">
            {activeWorkers.length}/{maxWorkers} workers employed
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

      {/* Weekly wage summary */}
      <Card variant="leather" className="p-3">
        <div className="flex justify-between items-center">
          <span className="text-desert-stone">Total Weekly Wages:</span>
          <span className="text-gold-light font-western">
            {formatGold(totalWeeklyWages)}
          </span>
        </div>
      </Card>

      {/* Current workers */}
      {activeWorkers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeWorkers.map((worker) => (
            <WorkerCard
              key={worker.workerId}
              worker={worker}
              onFire={() => handleFireWorker(worker.workerId)}
              isLoading={isLoading}
            />
          ))}
        </div>
      ) : (
        <Card variant="leather" className="p-6 text-center">
          <span className="text-4xl mb-2 block">👥</span>
          <p className="text-desert-stone">No workers employed yet</p>
        </Card>
      )}

      {/* Hire new worker */}
      {canHireMore && (
        <HireWorkerForm
          availableTypes={availableWorkerTypes}
          onHire={handleHireWorker}
          isLoading={isLoading}
          characterGold={characterGold}
        />
      )}

      {!canHireMore && (
        <Card variant="leather" className="p-4 text-center">
          <p className="text-desert-stone">
            Maximum workers reached. Upgrade your property tier to hire more.
          </p>
        </Card>
      )}
    </div>
  );
};

export default WorkerManagement;
