/**
 * Gang Page
 * Gang management, recruitment, wars, and territory control
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { Card, Button, Modal, ConfirmDialog } from '@/components/ui';
import { ListItemSkeleton, CardGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { WarCard, DeclareWarModal, WarDetailModal, WarHistoryTable, NPCGangPanel } from '@/components/gang';
import { useGangWars, GangWar } from '@/hooks/useGangWars';
import { formatDollars } from '@/utils/format';
import apiClient from '@/services/api';
import { logger } from '@/services/logger.service';

interface GangMember {
  id: string;
  name: string;
  role: 'leader' | 'officer' | 'member' | 'recruit';
  level: number;
  contribution: number;
  joinedAt: Date;
  lastActive: Date;
  isOnline: boolean;
}

interface Gang {
  id: string;
  name: string;
  tag: string;
  description: string;
  faction: string;
  level: number;
  reputation: number;
  treasury: number;
  memberCount: number;
  maxMembers: number;
  territories: string[];
  wars: number;
  founded: Date;
  leader: GangMember;
  members: GangMember[];
  isRecruiting: boolean;
  minimumLevel: number;
}

/**
 * Gang management and warfare page
 */
export const Gang: React.FC = () => {
  const navigate = useNavigate();
  const { currentCharacter, isLoading: _gameIsLoading } = useCharacterStore();

  const [currentGang, setCurrentGang] = useState<Gang | null>(null);
  const [availableGangs, setAvailableGangs] = useState<Gang[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGang, setSelectedGang] = useState<Gang | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    tag: '',
    description: '',
    isRecruiting: true,
    minimumLevel: 1
  });
  const [nameError, setNameError] = useState<string | null>(null);
  const [tagError, setTagError] = useState<string | null>(null);
  const [checkingGangName, setCheckingGangName] = useState(false);
  const [gangNameAvailable, setGangNameAvailable] = useState<boolean | null>(null);
  const [showDeclareWarModal, setShowDeclareWarModal] = useState(false);
  const [selectedWar, setSelectedWar] = useState<GangWar | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Gang wars hook
  const {
    activeWars,
    warHistory,
    availableTerritories,
    declareWar,
    contributeToWar,
  } = useGangWars(currentGang?.id);

  // Load gang data on mount
  useEffect(() => {
    if (currentCharacter) {
      loadGangData();
    }
  }, [currentCharacter]);

  const loadGangData = async () => {
    try {
      // Check if player is in a gang
      if (currentCharacter?.gangId) {
        const response = await apiClient.get(`/gangs/${currentCharacter.gangId}`);
        if (response.data) {
          setCurrentGang(response.data.gang);
        }
      }

      // Load available gangs
      const gangsResponse = await apiClient.get('/gangs');
      if (gangsResponse.data) {
        setAvailableGangs(gangsResponse.data.gangs || []);
      }
    } catch (error) {
      logger.error('Failed to load gang data', error as Error, { context: 'Gang.loadGangData' });
      // Use mock data for now
      setAvailableGangs(getMockGangs());
    }
  };

  const getMockGangs = (): Gang[] => [
    {
      id: '1',
      name: 'Desert Wolves',
      tag: 'WOLF',
      description: 'Elite fighters controlling the northern territories',
      faction: 'Frontera Collective',
      level: 12,
      reputation: 8500,
      treasury: 125000,
      memberCount: 18,
      maxMembers: 20,
      territories: ['Dusty Gulch', 'Northern Pass'],
      wars: 5,
      founded: new Date('2024-01-15'),
      leader: {
        id: '1',
        name: 'Jake "Alpha" Morrison',
        role: 'leader',
        level: 35,
        contribution: 50000,
        joinedAt: new Date('2024-01-15'),
        lastActive: new Date(),
        isOnline: true
      },
      members: [],
      isRecruiting: true,
      minimumLevel: 10
    },
    {
      id: '2',
      name: 'Black Rose',
      tag: 'ROSE',
      description: 'Notorious outlaws specializing in heists',
      faction: 'Nahi Coalition',
      level: 15,
      reputation: 12000,
      treasury: 250000,
      memberCount: 14,
      maxMembers: 20,
      territories: ['Shadow Ridge'],
      wars: 12,
      founded: new Date('2023-11-01'),
      leader: {
        id: '2',
        name: 'Rosa "Thorn" Vasquez',
        role: 'leader',
        level: 42,
        contribution: 100000,
        joinedAt: new Date('2023-11-01'),
        lastActive: new Date(),
        isOnline: false
      },
      members: [],
      isRecruiting: false,
      minimumLevel: 15
    },
    {
      id: '3',
      name: 'Gold Diggers',
      tag: 'GOLD',
      description: 'Merchants and traders seeking fortune',
      faction: 'Settler Alliance',
      level: 8,
      reputation: 4200,
      treasury: 450000,
      memberCount: 12,
      maxMembers: 15,
      territories: ['Trade Post'],
      wars: 2,
      founded: new Date('2024-02-20'),
      leader: {
        id: '3',
        name: 'William "Midas" Chen',
        role: 'leader',
        level: 28,
        contribution: 75000,
        joinedAt: new Date('2024-02-20'),
        lastActive: new Date(),
        isOnline: true
      },
      members: [],
      isRecruiting: true,
      minimumLevel: 5
    }
  ];

  // Helper to show temporary messages
  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 4000);
  }, []);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  // Validate gang name
  const validateGangName = (gangName: string): string | null => {
    if (!gangName || !gangName.trim()) {
      return 'Gang name is required';
    }
    const trimmed = gangName.trim();
    if (trimmed.length < 3) {
      return 'Gang name must be at least 3 characters';
    }
    if (trimmed.length > 30) {
      return 'Gang name must be 30 characters or less';
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(trimmed)) {
      return 'Gang name can only contain letters, numbers, and spaces';
    }
    return null;
  };

  // Validate gang tag
  const validateGangTag = (tag: string): string | null => {
    if (!tag || !tag.trim()) {
      return 'Gang tag is required';
    }
    const trimmed = tag.trim();
    if (trimmed.length < 3 || trimmed.length > 4) {
      return 'Gang tag must be 3-4 characters';
    }
    if (!/^[A-Z]+$/.test(trimmed)) {
      return 'Gang tag must be uppercase letters only';
    }
    return null;
  };

  // Check gang name availability
  const checkGangNameAvailability = useCallback(async (gangName: string) => {
    const error = validateGangName(gangName);
    if (error || !gangName || gangName.length < 3) {
      setGangNameAvailable(null);
      return;
    }

    setCheckingGangName(true);
    try {
      const response = await apiClient.get(`/gangs/check-name?name=${encodeURIComponent(gangName)}`);
      setGangNameAvailable(response.data.available);
    } catch (err) {
      logger.error('Failed to check gang name', err as Error, { context: 'Gang.checkGangNameAvailability', gangName });
      setGangNameAvailable(null);
    } finally {
      setCheckingGangName(false);
    }
  }, []);

  // Debounced gang name check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (createForm.name && createForm.name.length >= 3 && !nameError) {
        checkGangNameAvailability(createForm.name.trim());
      } else {
        setGangNameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [createForm.name, nameError, checkGangNameAvailability]);

  const handleCreateGang = async () => {
    // Validate form
    const nameValidationError = validateGangName(createForm.name);
    const tagValidationError = validateGangTag(createForm.tag);

    if (nameValidationError) {
      setNameError(nameValidationError);
      showError('Please fix gang name errors');
      return;
    }

    if (tagValidationError) {
      setTagError(tagValidationError);
      showError('Please fix gang tag errors');
      return;
    }

    if (gangNameAvailable === false) {
      showError('Gang name is already taken');
      return;
    }

    if (!createForm.name || !createForm.tag) {
      showError('Gang name and tag are required');
      return;
    }

    try {
      const response = await apiClient.post('/gangs/create', createForm);
      if (response.data) {
        setCurrentGang(response.data.gang);
        setShowCreateModal(false);
        setNameError(null);
        setTagError(null);
        setGangNameAvailable(null);
        showSuccess(`Gang "${createForm.name}" created successfully!`);
        await loadGangData();
      }
    } catch (error: any) {
      logger.error('Failed to create gang', error as Error, { context: 'Gang.handleCreateGang', gangName: createForm.name });
      showError(error.message || 'Failed to create gang. Please try again.');
    }
  };

  const handleJoinGang = async (gangId: string) => {
    try {
      await apiClient.post(`/gangs/${gangId}/join`);
      await loadGangData();
      setShowJoinModal(false);
      showSuccess('Successfully joined the gang!');
    } catch (error: any) {
      logger.error('Failed to join gang', error as Error, { context: 'Gang.handleJoinGang', gangId });
      showError(error.message || 'Failed to join gang. Please try again.');
    }
  };

  const handleLeaveGang = useCallback(() => {
    setShowLeaveConfirm(true);
  }, []);

  const confirmLeaveGang = useCallback(async () => {
    if (!currentGang?.id) return;
    setIsLeaving(true);

    try {
      await apiClient.post(`/gangs/${currentGang.id}/leave`);
      setCurrentGang(null);
      setShowLeaveConfirm(false);
      showSuccess('You have left the gang');
      await loadGangData();
    } catch (error) {
      logger.error('Failed to leave gang', error as Error, { context: 'Gang.confirmLeaveGang', gangId: currentGang.id });
      showError('Failed to leave gang. Please try again.');
    } finally {
      setIsLeaving(false);
    }
  }, [currentGang, showError, showSuccess]);

  // @ts-ignore Unused
const _getRoleColor = (role: string) => {
    switch (role) {
      case 'leader': return 'text-gold-light';
      case 'officer': return 'text-blue-400';
      case 'member': return 'text-desert-sand';
      case 'recruit': return 'text-gray-400';
      default: return 'text-desert-stone';
    }
  };

  if (!currentCharacter) {
    return (
      <div className="text-center py-12">
        <p className="text-desert-sand">No character selected</p>
        <Button onClick={() => navigate('/character-select')} className="mt-4">
          Select Character
        </Button>
      </div>
    );
  }

  // Show current gang view if player is in a gang
  if (currentGang) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Gang Header */}
        <Card variant="leather" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-wood-dark/20 to-transparent"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-western text-gold-light">
                  {currentGang.name}
                </h1>
                <p className="text-desert-sand font-serif mt-1">
                  [{currentGang.tag}] • Level {currentGang.level} • {currentGang.faction}
                </p>
                <p className="text-desert-stone text-sm mt-2">
                  {currentGang.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gold-light">
                  💰 {formatDollars(currentGang.treasury)}
                </div>
                <div className="text-sm text-desert-sand mt-1">
                  Gang Treasury
                </div>
              </div>
            </div>

            {/* Gang Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-light">
                  {currentGang.memberCount}/{currentGang.maxMembers}
                </div>
                <div className="text-xs text-desert-stone uppercase">Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-light">
                  {currentGang.reputation.toLocaleString()}
                </div>
                <div className="text-xs text-desert-stone uppercase">Reputation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-light">
                  {currentGang.territories.length}
                </div>
                <div className="text-xs text-desert-stone uppercase">Territories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-light">
                  {currentGang.wars}
                </div>
                <div className="text-xs text-desert-stone uppercase">Wars Won</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members List */}
          <div className="lg:col-span-2">
            <Card variant="wood">
              <div className="p-6">
                <h2 className="text-xl font-western text-desert-sand mb-4">
                  Gang Members
                </h2>

                <div className="space-y-3">
                  {/* Leader */}
                  <div className="p-3 bg-leather/10 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">👑</span>
                        <div>
                          <div className="font-bold text-gold-light">
                            {currentGang.leader.name}
                          </div>
                          <div className="text-xs text-desert-stone">
                            Leader • Level {currentGang.leader.level}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gold-light">
                          ${currentGang.leader.contribution.toLocaleString()}
                        </div>
                        <div className="text-xs text-desert-stone">
                          contribution
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Other members - show skeleton or empty state */}
                  {currentGang.members.length === 0 ? (
                    <div className="text-center py-8">
                      <ListItemSkeleton count={3} />
                    </div>
                  ) : (
                    currentGang.members.map(member => (
                      <div key={member.id} className="p-3 bg-leather/10 rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">👤</span>
                            <div>
                              <div className="font-bold text-desert-sand">{member.name}</div>
                              <div className="text-xs text-desert-stone">
                                {member.role} • Level {member.level}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gold-light">
                              ${member.contribution.toLocaleString()}
                            </div>
                            <div className="text-xs text-desert-stone">contribution</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 flex gap-2">
                  <Button variant="secondary" size="sm">
                    View Roster
                  </Button>
                  <Button variant="secondary" size="sm">
                    Manage Ranks
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleLeaveGang}
                  >
                    Leave Gang
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Gang Actions */}
          <div className="space-y-4">
            <Card variant="leather">
              <div className="p-6">
                <h3 className="text-lg font-western text-desert-sand mb-4">
                  Gang Actions
                </h3>
                <div className="space-y-2">
                  <Button variant="primary" className="w-full">
                    🏦 Gang Vault
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setShowDeclareWarModal(true)}
                  >
                    ⚔️ Declare War
                  </Button>
                  <Button variant="primary" className="w-full">
                    🏴 Claim Territory
                  </Button>
                  <Button variant="primary" className="w-full">
                    📢 Recruit Members
                  </Button>
                </div>
              </div>
            </Card>

            <Card variant="parchment">
              <div className="p-6">
                <h3 className="text-lg font-western text-wood-dark mb-4">
                  Controlled Territories
                </h3>
                <div className="space-y-2">
                  {currentGang.territories.map((territory) => (
                    <div
                      key={territory}
                      className="p-2 bg-wood-grain/10 rounded text-sm text-wood-dark"
                    >
                      📍 {territory}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Gang Wars Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Wars */}
          <Card variant="leather">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-western text-gold-light">
                  Active Wars
                </h2>
                {activeWars.filter(w =>
                  w.attackerGangId === currentGang.id || w.defenderGangId === currentGang.id
                ).length === 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowDeclareWarModal(true)}
                  >
                    Declare War
                  </Button>
                )}
              </div>

              {activeWars.filter(w =>
                w.attackerGangId === currentGang.id || w.defenderGangId === currentGang.id
              ).length === 0 ? (
                <EmptyState
                  icon="🕊️"
                  title="No Active Wars"
                  description="Your gang is at peace. Declare war to claim new territories and expand your influence."
                  actionText="Declare War"
                  onAction={() => setShowDeclareWarModal(true)}
                  size="sm"
                />
              ) : (
                <div className="space-y-3">
                  {activeWars
                    .filter(w => w.attackerGangId === currentGang.id || w.defenderGangId === currentGang.id)
                    .map(war => (
                      <WarCard
                        key={war._id}
                        war={war}
                        currentGangId={currentGang.id}
                        onClick={() => setSelectedWar(war)}
                      />
                    ))}
                </div>
              )}
            </div>
          </Card>

          {/* War History */}
          <Card variant="wood">
            <div className="p-6">
              <h2 className="text-xl font-western text-desert-sand mb-4">
                War History
              </h2>
              <WarHistoryTable wars={warHistory} currentGangId={currentGang.id} />
            </div>
          </Card>
        </div>

        {/* War Modals */}
        <DeclareWarModal
          isOpen={showDeclareWarModal}
          onClose={() => setShowDeclareWarModal(false)}
          territories={availableTerritories}
          gangBank={currentGang.treasury}
          hasWarChest={true}
          hasActiveWar={activeWars.some(w =>
            w.attackerGangId === currentGang.id || w.defenderGangId === currentGang.id
          )}
          onDeclare={declareWar}
        />

        {selectedWar && (
          <WarDetailModal
            war={selectedWar}
            currentGangId={currentGang.id}
            characterGold={currentCharacter.gold}
            onClose={() => setSelectedWar(null)}
            onContribute={contributeToWar}
          />
        )}

        {/* NPC Gang Conflict Section */}
        <NPCGangPanel
          playerGangId={currentGang.id}
          playerGangLevel={currentGang.level}
          gangTreasury={currentGang.treasury}
          onTributesPaid={loadGangData}
        />
      </div>
    );
  }

  // Loading state for gang data
  const [isLoadingGangs, setIsLoadingGangs] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      setIsLoadingGangs(true);
      await loadGangData();
      setIsLoadingGangs(false);
    };
    if (!currentGang) {
      load();
    }
  }, [currentGang]);

  // Show gang selection view if player is not in a gang
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="leather">
        <div className="p-6">
          <h1 className="text-3xl font-western text-gold-light mb-2">
            Gang Territory
          </h1>
          <p className="text-desert-sand font-serif">
            Join a gang to participate in territory wars and group activities
          </p>
        </div>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="wood" hover className="cursor-pointer" onClick={() => setShowCreateModal(true)}>
          <div className="p-6 text-center">
            <div className="text-4xl mb-3">🏴</div>
            <h2 className="text-xl font-western text-desert-sand mb-2">
              Create Gang
            </h2>
            <p className="text-desert-stone text-sm">
              Start your own gang and recruit members
            </p>
            <div className="mt-4 text-gold-light font-bold">
              Cost: $5,000
            </div>
          </div>
        </Card>

        <Card variant="leather" hover className="cursor-pointer" onClick={() => setShowJoinModal(true)}>
          <div className="p-6 text-center">
            <div className="text-4xl mb-3">🤝</div>
            <h2 className="text-xl font-western text-desert-sand mb-2">
              Join Gang
            </h2>
            <p className="text-desert-stone text-sm">
              Apply to join an existing gang
            </p>
            <div className="mt-4 text-gold-light">
              {availableGangs.filter(g => g.isRecruiting).length} recruiting
            </div>
          </div>
        </Card>
      </div>

      {/* Available Gangs */}
      <Card variant="parchment">
        <div className="p-6">
          <h2 className="text-2xl font-western text-wood-dark mb-4">
            Active Gangs
          </h2>

          {isLoadingGangs ? (
            <div aria-busy="true" aria-live="polite">
              <CardGridSkeleton count={6} columns={3} />
            </div>
          ) : availableGangs.length === 0 ? (
            <EmptyState
              icon="🤠"
              title="No Gangs Found"
              description="No gangs are active yet. Be the first to establish a gang and claim your territory!"
              actionText="Create Gang"
              onAction={() => setShowCreateModal(true)}
              size="md"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableGangs.map((gang) => (
              <div
                key={gang.id}
                className="p-4 bg-wood-grain/10 rounded hover:bg-wood-grain/20 transition-colors cursor-pointer"
                onClick={() => setSelectedGang(gang)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-wood-dark">
                    {gang.name} [{gang.tag}]
                  </h3>
                  {gang.isRecruiting && (
                    <span className="text-xs bg-green-600/20 text-green-600 px-2 py-1 rounded">
                      Recruiting
                    </span>
                  )}
                </div>
                <div className="text-sm space-y-1 text-wood-grain">
                  <div>Level {gang.level} • {gang.faction}</div>
                  <div>{gang.memberCount}/{gang.maxMembers} members</div>
                  <div>Rep: {gang.reputation.toLocaleString()}</div>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Create Gang Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNameError(null);
          setTagError(null);
          setGangNameAvailable(null);
          setCreateForm({
            name: '',
            tag: '',
            description: '',
            isRecruiting: true,
            minimumLevel: 1
          });
        }}
        title="Create New Gang"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-wood-dark mb-1">
              Gang Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setCreateForm({ ...createForm, name: value });
                  setNameError(null);
                }}
                onBlur={() => {
                  const error = validateGangName(createForm.name);
                  setNameError(error);
                }}
                className={`w-full px-3 py-2 border rounded ${nameError ? 'border-red-500' : ''}`}
                placeholder="Enter gang name"
                maxLength={30}
              />
              {/* Gang name availability indicator */}
              {createForm.name && createForm.name.length >= 3 && !nameError && (
                <div className="absolute right-3 top-2.5">
                  {checkingGangName ? (
                    <span className="text-desert-stone text-sm">Checking...</span>
                  ) : gangNameAvailable === true ? (
                    <span className="text-green-500 text-xl" aria-label="Name available">✓</span>
                  ) : gangNameAvailable === false ? (
                    <span className="text-red-500 text-xl" aria-label="Name taken">✗</span>
                  ) : null}
                </div>
              )}
            </div>
            {nameError && (
              <p className="text-red-500 text-sm mt-1">{nameError}</p>
            )}
            {gangNameAvailable === false && (
              <p className="text-red-500 text-sm mt-1">This gang name is already taken</p>
            )}
            {gangNameAvailable === true && (
              <p className="text-green-500 text-sm mt-1">Gang name is available!</p>
            )}
            <p className="text-xs text-wood-grain mt-1">
              {createForm.name.length}/30 characters - Letters, numbers, and spaces only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-wood-dark mb-1">
              Tag (3-4 letters)
            </label>
            <div className="relative">
              <input
                type="text"
                value={createForm.tag}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setCreateForm({ ...createForm, tag: value });
                  setTagError(null);
                }}
                onBlur={() => {
                  const error = validateGangTag(createForm.tag);
                  setTagError(error);
                }}
                className={`w-full px-3 py-2 border rounded ${tagError ? 'border-red-500' : ''}`}
                placeholder="TAG"
                maxLength={4}
              />
              {createForm.tag && createForm.tag.length >= 3 && !tagError && (
                <div className="absolute right-3 top-2.5">
                  <span className="text-green-500 text-xl" aria-label="Valid tag">✓</span>
                </div>
              )}
            </div>
            {tagError && (
              <p className="text-red-500 text-sm mt-1">{tagError}</p>
            )}
            <p className="text-xs text-wood-grain mt-1">
              {createForm.tag.length}/4 characters - Uppercase letters only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-wood-dark mb-1">
              Description
            </label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              placeholder="Describe your gang's purpose"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={createForm.isRecruiting}
                onChange={(e) => setCreateForm({ ...createForm, isRecruiting: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Open for recruitment</span>
            </label>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" onClick={handleCreateGang}>
              Create Gang ($5,000)
            </Button>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Join Gang Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Join Gang"
      >
        {selectedGang ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-wood-dark">
                {selectedGang.name} [{selectedGang.tag}]
              </h3>
              <p className="text-sm text-wood-grain mt-1">
                {selectedGang.description}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Leader:</span>
                <span className="font-bold">{selectedGang.leader.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Members:</span>
                <span>{selectedGang.memberCount}/{selectedGang.maxMembers}</span>
              </div>
              <div className="flex justify-between">
                <span>Min Level:</span>
                <span>{selectedGang.minimumLevel}</span>
              </div>
              <div className="flex justify-between">
                <span>Territories:</span>
                <span>{selectedGang.territories.length}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => handleJoinGang(selectedGang.id)}
                disabled={
                  !selectedGang.isRecruiting ||
                  (currentCharacter?.level || 0) < selectedGang.minimumLevel
                }
              >
                {!selectedGang.isRecruiting
                  ? 'Not Recruiting'
                  : (currentCharacter?.level || 0) < selectedGang.minimumLevel
                  ? `Need Level ${selectedGang.minimumLevel}`
                  : 'Apply to Join'
                }
              </Button>
              <Button variant="secondary" onClick={() => setSelectedGang(null)}>
                Back
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {availableGangs
              .filter(g => g.isRecruiting)
              .map((gang) => (
                <button
                  key={gang.id}
                  onClick={() => setSelectedGang(gang)}
                  className="w-full p-3 text-left bg-wood-grain/10 rounded hover:bg-wood-grain/20 transition-colors"
                >
                  <div className="font-bold text-wood-dark">
                    {gang.name} [{gang.tag}]
                  </div>
                  <div className="text-sm text-wood-grain">
                    Level {gang.level} • {gang.memberCount}/{gang.maxMembers} members
                  </div>
                </button>
              ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={showLeaveConfirm}
        title="Leave Gang"
        message="Are you sure you want to leave your gang? You will lose access to the gang treasury and territories."
        confirmText="Leave Gang"
        cancelText="Stay"
        confirmVariant="danger"
        onConfirm={confirmLeaveGang}
        onCancel={() => setShowLeaveConfirm(false)}
        isLoading={isLeaving}
        icon="🏴"
      />

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-blood-red text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold">Error</div>
              <div className="text-sm">{errorMessage}</div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-4 text-white/70 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <div>
              <div className="font-bold">Success</div>
              <div className="text-sm">{successMessage}</div>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-4 text-white/70 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};