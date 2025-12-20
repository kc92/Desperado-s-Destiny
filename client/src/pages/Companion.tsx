/**
 * Companion Page
 * Manage animal companions - tame, care for, and train them
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, LoadingSpinner, ProgressBar } from '@/components/ui';
import { useToast } from '@/store/useToastStore';
import {
  companionService,
  Companion,
  ShopCompanion,
  WildEncounter,
  CareTask,
  CompanionCategory,
  CompanionSpecies,
  TrustLevel,
  CombatRole,
} from '@/services/companion.service';
import { logger } from '@/services/logger.service';

type CompanionView = 'overview' | 'shop' | 'taming' | 'care' | 'details';

export function Companion() {
  const navigate = useNavigate();
  const { success, info } = useToast();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [activeCompanion, setActiveCompanion] = useState<Companion | null>(null);
  const [shopCompanions, setShopCompanions] = useState<ShopCompanion[]>([]);
  const [wildEncounters, setWildEncounters] = useState<WildEncounter[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [view, setView] = useState<CompanionView>('overview');

  // Selection state
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [selectedShopItem, setSelectedShopItem] = useState<ShopCompanion | null>(null);
  const [selectedEncounter, setSelectedEncounter] = useState<WildEncounter | null>(null);

  // ===== Data Loading =====
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const companionsData = await companionService.getCompanions();
      setCompanions(companionsData.companions || []);
      setActiveCompanion(companionsData.activeCompanion || null);
    } catch (err) {
      logger.error('Failed to load companions', err);
      setError('Failed to load companions. Please try again later.');
    }

    try {
      const shopData = await companionService.getShop();
      setShopCompanions(shopData || []);
    } catch (err) {
      logger.error('Failed to load shop data', err);
      // Shop error is non-critical, continue loading other data
    }

    try {
      const encountersData = await companionService.getWildEncounters();
      setWildEncounters(encountersData || []);
    } catch (err) {
      logger.error('Failed to load wild encounters', err);
      // Encounters error is non-critical, continue loading other data
    }

    try {
      const tasksData = await companionService.getCareTasks();
      setCareTasks(tasksData || []);
    } catch (err) {
      logger.error('Failed to load care tasks', err);
      // Care tasks error is non-critical, continue loading other data
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===== Actions =====
  const handleActivateCompanion = async (companion: Companion) => {
    try {
      const result = await companionService.activateCompanion(companion._id);
      if (result.success && result.companion) {
        setActiveCompanion(result.companion);
        loadData();
      } else {
        setError(result.message || 'Failed to activate companion');
      }
    } catch (err) {
      logger.error('Failed to activate companion', err);
      setError('Failed to activate companion. Please try again.');
    }
  };

  const handleFeedCompanion = async (companion: Companion) => {
    try {
      const result = await companionService.feedCompanion(companion._id);
      if (result.success) {
        loadData();
      } else {
        setError(result.message || 'Failed to feed companion');
      }
    } catch (err) {
      logger.error('Failed to feed companion', err);
      setError('Failed to feed companion. Please try again.');
    }
  };

  const handleHealCompanion = async (companion: Companion) => {
    try {
      const result = await companionService.healCompanion(companion._id);
      if (result.success) {
        loadData();
      } else {
        setError(result.message || 'Failed to heal companion');
      }
    } catch (err) {
      logger.error('Failed to heal companion', err);
      setError('Failed to heal companion. Please try again.');
    }
  };

  const handlePurchaseCompanion = async (shopItem: ShopCompanion) => {
    try {
      const result = await companionService.purchaseCompanion(shopItem.species);
      if (result.success) {
        loadData();
        setView('overview');
      } else {
        setError(result.message || 'Failed to purchase companion');
      }
    } catch (err) {
      logger.error('Failed to purchase companion', err);
      setError('Failed to purchase companion. Please try again.');
    }
  };

  const handleAttemptTaming = async (encounter: WildEncounter) => {
    try {
      const result = await companionService.attemptTaming(encounter.species, encounter.location);
      if (result.tamed && result.companion) {
        loadData();
        setSelectedEncounter(null);
      } else {
        setError(result.message || 'Taming attempt failed');
      }
    } catch (err) {
      logger.error('Failed to attempt taming', err);
      setError('Failed to attempt taming. Please try again.');
    }
  };

  // ===== Render Helpers =====
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Active Companion */}
      {activeCompanion && (
        <Card className="p-6 border-amber-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-amber-400">Active Companion</div>
              <h2 className="text-2xl font-bold">
                {activeCompanion.nickname || activeCompanion.name}
              </h2>
            </div>
            <span className="text-5xl">{companionService.getCategoryIcon(activeCompanion.category)}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-500">Level</div>
              <div className="font-bold">{activeCompanion.level}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Trust</div>
              <div className={companionService.getTrustLevelInfo(activeCompanion.trustLevel).color}>
                {companionService.getTrustLevelInfo(activeCompanion.trustLevel).name}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Health</div>
              <div className="text-green-400">{activeCompanion.health}/{activeCompanion.maxHealth}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Role</div>
              <div>
                {companionService.getCombatRoleInfo(activeCompanion.combatRole).icon}{' '}
                {companionService.getCombatRoleInfo(activeCompanion.combatRole).name}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Health</span>
                <span>{activeCompanion.health}/{activeCompanion.maxHealth}</span>
              </div>
              <ProgressBar
                value={activeCompanion.health}
                max={activeCompanion.maxHealth}
                color="green"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Hunger</span>
                <span className={activeCompanion.hunger > 70 ? 'text-red-400' : ''}>
                  {activeCompanion.hunger}%
                </span>
              </div>
              <ProgressBar
                value={activeCompanion.hunger}
                max={100}
                color={activeCompanion.hunger > 70 ? 'red' : 'yellow'}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Happiness</span>
                <span>{activeCompanion.happiness}%</span>
              </div>
              <ProgressBar value={activeCompanion.happiness} max={100} color="blue" />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleFeedCompanion(activeCompanion)}
              disabled={activeCompanion.hunger === 0}
            >
              Feed
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleHealCompanion(activeCompanion)}
              disabled={activeCompanion.health === activeCompanion.maxHealth}
            >
              Heal
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCompanion(activeCompanion);
                setView('details');
              }}
            >
              Details
            </Button>
          </div>
        </Card>
      )}

      {/* All Companions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-400">Your Companions ({companions.length})</h2>
        </div>

        {error && companions.length === 0 ? (
          <Card className="p-6 text-center border-red-500">
            <p className="text-red-400 mb-2">Failed to load companions</p>
            <p className="text-gray-400 mb-4 text-sm">Unable to retrieve your companion data.</p>
            <Button variant="primary" onClick={() => loadData()}>
              Try Again
            </Button>
          </Card>
        ) : companions.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-400 mb-4">You don't have any companions yet.</p>
            <Button variant="primary" onClick={() => setView('shop')}>
              Visit Shop
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companions.map(companion => (
              <Card
                key={companion._id}
                className={`p-4 cursor-pointer transition-colors ${
                  companion.isActive ? 'border-amber-500' : 'hover:border-gray-600'
                }`}
                onClick={() => {
                  setSelectedCompanion(companion);
                  setView('details');
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold">{companion.nickname || companion.name}</h3>
                    <span className="text-sm text-gray-400">Lv.{companion.level}</span>
                  </div>
                  <span className="text-2xl">{companionService.getCategoryIcon(companion.category)}</span>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Health:</span>
                    <span className={companion.health < companion.maxHealth * 0.5 ? 'text-red-400' : 'text-green-400'}>
                      {companion.health}/{companion.maxHealth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trust:</span>
                    <span className={companionService.getTrustLevelInfo(companion.trustLevel).color}>
                      {companionService.getTrustLevelInfo(companion.trustLevel).name}
                    </span>
                  </div>
                </div>

                {!companion.isActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivateCompanion(companion);
                    }}
                  >
                    Set Active
                  </Button>
                )}
                {companion.isActive && (
                  <div className="text-center text-amber-400 text-sm mt-3">Active</div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Care Alerts */}
      {careTasks.length > 0 && (
        <Card className="p-4 border-yellow-500">
          <h3 className="font-bold text-yellow-400 mb-2">Care Needed</h3>
          <div className="space-y-2">
            {careTasks.map((task, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span>{task.description}</span>
                <span className={
                  task.urgency === 'critical' ? 'text-red-400' :
                  task.urgency === 'high' ? 'text-orange-400' :
                  task.urgency === 'medium' ? 'text-yellow-400' :
                  'text-gray-400'
                }>
                  {task.urgency}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderShop = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-amber-400">Companion Shop</h2>
        <Button variant="ghost" onClick={() => setView('overview')}>Back</Button>
      </div>

      {shopCompanions.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-400 mb-2">Shop is currently unavailable</p>
          <p className="text-sm text-gray-500 mb-4">Unable to load companion shop data.</p>
          <Button variant="primary" onClick={() => loadData()}>
            Try Again
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shopCompanions.map(item => {
          const rarityInfo = companionService.getRarityInfo(item.rarity);
          const roleInfo = companionService.getCombatRoleInfo(item.combatRole);

          return (
            <Card key={item.species} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <span className={`text-sm ${rarityInfo.color}`}>{rarityInfo.name}</span>
                </div>
                <span className="text-3xl">{companionService.getCategoryIcon(item.category)}</span>
              </div>

              <p className="text-sm text-gray-400 mb-3">{item.description}</p>
              <p className="text-xs text-gray-500 italic mb-3">{item.flavorText}</p>

              <div className="space-y-1 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Role:</span>
                  <span>{roleInfo.icon} {roleInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Health:</span>
                  <span className="text-green-400">{item.baseStats.health}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Attack:</span>
                  <span className="text-red-400">{item.baseStats.attackPower}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Level Req:</span>
                  <span>{item.levelRequired}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-yellow-400 font-bold">${item.price}</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handlePurchaseCompanion(item)}
                >
                  Purchase
                </Button>
              </div>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );

  const renderTaming = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-amber-400">Wild Encounters</h2>
        <Button variant="ghost" onClick={() => setView('overview')}>Back</Button>
      </div>

      {wildEncounters.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-400">No wild animals in the area right now.</p>
          <p className="text-sm text-gray-500 mt-2">Try exploring different locations.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {wildEncounters.map((encounter, idx) => (
            <Card
              key={idx}
              className={`p-4 ${selectedEncounter?.species === encounter.species ? 'border-amber-500' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold">{companionService.getSpeciesName(encounter.species)}</h3>
                  <span className="text-sm text-gray-400">{encounter.location}</span>
                </div>
                <span className="text-2xl">
                  {encounter.hostility > 50 ? '😠' : encounter.hostility > 25 ? '😐' : '🦊'}
                </span>
              </div>

              <p className="text-sm text-gray-400 mb-3">{encounter.description}</p>

              <div className="space-y-1 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Difficulty:</span>
                  <span className={
                    encounter.difficulty > 7 ? 'text-red-400' :
                    encounter.difficulty > 4 ? 'text-yellow-400' :
                    'text-green-400'
                  }>
                    {encounter.difficulty}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hostility:</span>
                  <span className={encounter.hostility > 50 ? 'text-red-400' : 'text-gray-300'}>
                    {encounter.hostility}%
                  </span>
                </div>
              </div>

              <Button
                variant={encounter.tameable ? 'primary' : 'ghost'}
                size="sm"
                className="w-full"
                disabled={!encounter.tameable}
                onClick={() => handleAttemptTaming(encounter)}
              >
                {encounter.tameable ? 'Attempt Taming' : 'Cannot Tame'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderDetails = () => {
    if (!selectedCompanion) return null;

    const trustInfo = companionService.getTrustLevelInfo(selectedCompanion.trustLevel);
    const roleInfo = companionService.getCombatRoleInfo(selectedCompanion.combatRole);

    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setView('overview')}>
          &larr; Back to Overview
        </Button>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {selectedCompanion.nickname || selectedCompanion.name}
              </h2>
              <p className="text-gray-400">
                {companionService.getSpeciesName(selectedCompanion.species)}
              </p>
              <span className={`text-sm ${trustInfo.color}`}>
                {trustInfo.name} - {selectedCompanion.trust}% Trust
              </span>
            </div>
            <span className="text-6xl">{companionService.getCategoryIcon(selectedCompanion.category)}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded p-3">
              <div className="text-sm text-gray-500">Level</div>
              <div className="text-xl font-bold">{selectedCompanion.level}</div>
            </div>
            <div className="bg-gray-800/50 rounded p-3">
              <div className="text-sm text-gray-500">Role</div>
              <div className="text-xl">{roleInfo.icon} {roleInfo.name}</div>
            </div>
            <div className="bg-gray-800/50 rounded p-3">
              <div className="text-sm text-gray-500">Attack</div>
              <div className="text-xl font-bold text-red-400">{selectedCompanion.combatStats.attackPower}</div>
            </div>
            <div className="bg-gray-800/50 rounded p-3">
              <div className="text-sm text-gray-500">Defense</div>
              <div className="text-xl font-bold text-blue-400">{selectedCompanion.combatStats.defensePower}</div>
            </div>
          </div>

          {/* Status Bars */}
          <div className="space-y-3 mb-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Health</span>
                <span>{selectedCompanion.health}/{selectedCompanion.maxHealth}</span>
              </div>
              <ProgressBar value={selectedCompanion.health} max={selectedCompanion.maxHealth} color="green" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Hunger</span>
                <span>{selectedCompanion.hunger}%</span>
              </div>
              <ProgressBar value={selectedCompanion.hunger} max={100} color={selectedCompanion.hunger > 70 ? 'red' : 'yellow'} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Happiness</span>
                <span>{selectedCompanion.happiness}%</span>
              </div>
              <ProgressBar value={selectedCompanion.happiness} max={100} color="blue" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Trust</span>
                <span>{selectedCompanion.trust}%</span>
              </div>
              <ProgressBar value={selectedCompanion.trust} max={100} color="purple" />
            </div>
          </div>

          {/* Utility Stats */}
          <div className="mb-6">
            <h3 className="font-bold text-amber-400 mb-2">Utility Bonuses</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tracking:</span>
                <span className="text-green-400">+{selectedCompanion.utilityStats.trackingBonus}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hunting:</span>
                <span className="text-green-400">+{selectedCompanion.utilityStats.huntingBonus}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Guard:</span>
                <span className="text-green-400">+{selectedCompanion.utilityStats.guardBonus}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Social:</span>
                <span className="text-green-400">+{selectedCompanion.utilityStats.socialBonus}%</span>
              </div>
            </div>
          </div>

          {/* Abilities */}
          <div className="mb-6">
            <h3 className="font-bold text-amber-400 mb-2">Abilities</h3>
            {selectedCompanion.abilities.length === 0 ? (
              <p className="text-gray-500 text-sm">No abilities learned yet.</p>
            ) : (
              <div className="space-y-2">
                {selectedCompanion.abilities.map(ability => (
                  <div key={ability.id} className="bg-gray-800/50 rounded p-3">
                    <div className="flex justify-between">
                      <span className="font-bold">{ability.name}</span>
                      <span className="text-sm text-gray-500">Power: {ability.power}</span>
                    </div>
                    <p className="text-sm text-gray-400">{ability.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => handleFeedCompanion(selectedCompanion)}>
              Feed
            </Button>
            <Button variant="secondary" onClick={() => handleHealCompanion(selectedCompanion)}>
              Heal
            </Button>
            {!selectedCompanion.isActive && (
              <Button variant="primary" onClick={() => handleActivateCompanion(selectedCompanion)}>
                Set Active
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // ===== Main Render =====
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-amber-400 mb-2">Companions</h1>
        <p className="text-gray-400">
          Tame, train, and care for animal companions to aid you on your journey.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setError(null);
                loadData();
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* View Tabs */}
      {view === 'overview' && (
        <div className="flex gap-2 mb-6">
          <Button variant="primary">My Companions</Button>
          <Button variant="ghost" onClick={() => setView('shop')}>Shop</Button>
          <Button variant="ghost" onClick={() => setView('taming')}>Wild Encounters</Button>
        </div>
      )}

      {view === 'overview' && renderOverview()}
      {view === 'shop' && renderShop()}
      {view === 'taming' && renderTaming()}
      {view === 'details' && renderDetails()}
    </div>
  );
}

export default Companion;
