/**
 * Player Sidebar Component
 * Persistent sidebar showing player vitals, stats, and skills
 */

import React, { useState, useEffect } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useSkillStore } from '@/store/useSkillStore';
import { useEnergyStore } from '@/store/useEnergyStore';
import { useEnergy } from '@/hooks/useEnergy';
import { useLiveEnergy } from '@/hooks/useLiveEnergy';
import { useDeath } from '@/hooks/useDeath';
import { useKarma } from '@/hooks/useKarma';
import { useDuels } from '@/hooks/useDuels';
// useFateMarks imported for FateMarksDisplay context - kept for future use
// import { useFateMarks } from '@/hooks/useFateMarks';
import { FateMarksDisplay } from '@/components/danger/FateMarksDisplay';
import { ActiveBuffsDisplay } from '@/components/tavern';
import { useNotifications } from '@/hooks/useNotifications';
import { useMailStore } from '@/store/useMailStore';
import { factionToDisplay } from '@/types';
import { Tooltip } from '@/components/ui';
import { Link } from 'react-router-dom';
import { locationService } from '@/services/location.service';

type TabType = 'stats' | 'skills' | 'effects';

// Format seconds to human-readable time
const formatTimeToFull = (seconds: number): string => {
  if (seconds <= 0) return 'Full';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const PlayerSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [locationName, setLocationName] = useState<string>('Loading...');
  const { currentCharacter } = useCharacterStore();
  const { skills, skillData, fetchSkills } = useSkillStore();
  const energyState = useEnergyStore((state) => state.energy);
  const { timeToFull, fetchStatus: fetchEnergyStatus } = useEnergy();
  const { deathStatus, fetchStatus: fetchDeathStatus } = useDeath();
  const { hasBlessings, hasCurses, getBlessings, getCurses } = useKarma();
  const { duelStats, fetchDuelStats } = useDuels();
  useNotifications(); // Initialize notifications hook (counts shown in header)
  const mailUnreadCount = useMailStore((state) => state.unreadCount);

  // PERFORMANCE FIX: Use useLiveEnergy for real-time interpolated energy display
  // This replaces the previous setInterval hack that forced re-renders every 10 seconds
  const {
    displayEnergy: energy,
    maxEnergy,
    isRegenerating
  } = useLiveEnergy({ updateInterval: 1000 });

  // Regen rate for display purposes (from store or default)
  const regenRate = energyState?.regenRate ?? 0.5;

  // Fetch energy, death status, and duel stats on mount
  useEffect(() => {
    fetchEnergyStatus();
    fetchDeathStatus();
    fetchDuelStats();
  }, [fetchEnergyStatus, fetchDeathStatus, fetchDuelStats]);

  // Real-time countdown timer
  useEffect(() => {
    setCountdownSeconds(timeToFull);

    if (timeToFull <= 0) return;

    const interval = setInterval(() => {
      setCountdownSeconds(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeToFull]);

  // Check if energy is full
  const isEnergyFull = energy >= maxEnergy;

  // Fetch skills on mount if not loaded
  useEffect(() => {
    if (skillData.length === 0) {
      fetchSkills();
    }
  }, [skillData.length, fetchSkills]);

  // Fetch location name when locationId changes
  useEffect(() => {
    const fetchLocationName = async () => {
      if (currentCharacter?.locationId) {
        try {
          const response = await locationService.getLocationById(currentCharacter.locationId);
          if (response.success && response.data?.location) {
            setLocationName(response.data.location.name);
          } else {
            setLocationName('Unknown');
          }
        } catch {
          setLocationName('Unknown');
        }
      } else {
        setLocationName('Unknown');
      }
    };
    fetchLocationName();
  }, [currentCharacter?.locationId]);

  if (!currentCharacter) {
    return null;
  }

  // Total Level progression (new system)
  const totalLevel = (currentCharacter as any).totalLevel || 30;
  const combatLevel = (currentCharacter as any).combatLevel || 1;

  // Total Level milestones for progress bar
  const totalLevelMilestones = [30, 100, 250, 500, 750, 1000, 1500, 2000, 2500, 2970];
  const getCurrentMilestone = (tl: number) => {
    for (let i = totalLevelMilestones.length - 1; i >= 0; i--) {
      if (tl >= totalLevelMilestones[i]) return totalLevelMilestones[i];
    }
    return 30;
  };
  const getNextMilestone = (tl: number) => {
    for (const m of totalLevelMilestones) {
      if (m > tl) return m;
    }
    return 2970;
  };
  const currentMilestone = getCurrentMilestone(totalLevel);
  const nextMilestone = getNextMilestone(totalLevel);
  const tlProgress = currentMilestone === nextMilestone
    ? 100
    : ((totalLevel - currentMilestone) / (nextMilestone - currentMilestone)) * 100;

  const factionDisplay = factionToDisplay(currentCharacter.faction);

  // Get faction color
  const getFactionColor = () => {
    switch (factionDisplay) {
      case 'settler': return 'text-blue-400';
      case 'nahi': return 'text-green-400';
      case 'frontera': return 'text-red-400';
      default: return 'text-gold-light';
    }
  };

  // Get top skills (highest level first)
  const topSkills = [...skillData]
    .sort((a, b) => b.level - a.level)
    .slice(0, 5);

  return (
    <aside className="w-64 bg-wood-darker border-r border-wood-light/30 flex flex-col h-full overflow-hidden">
      {/* Character Header */}
      <div className="p-4 border-b border-wood-light/30 bg-gradient-to-b from-wood-dark to-wood-darker">
        <h2 className="text-lg font-western text-gold-light truncate" title={currentCharacter.name}>
          {currentCharacter.name}
        </h2>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-sm font-bold capitalize ${getFactionColor()}`}>
            {factionDisplay}
          </span>
          {/* Total Level - Primary progression */}
          <Tooltip content="Total Level - Sum of all skill levels">
            <span className="text-desert-sand text-sm">
              TL {totalLevel}
            </span>
          </Tooltip>
          {/* Combat Level - Combat progression */}
          <Tooltip content="Combat Level - Derived from combat XP">
            <span className="text-red-400 text-sm">
              CL {combatLevel}
            </span>
          </Tooltip>
          {/* Prestige Badge */}
          {(currentCharacter as any).prestige?.currentRank > 0 && (
            <Link
              to="/game/prestige"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-gold-dark/30 hover:bg-gold-dark/50 transition-colors"
              title={`Prestige Rank ${(currentCharacter as any).prestige.currentRank}`}
            >
              <span>
                {(currentCharacter as any).prestige.currentRank === 1 && '🔫'}
                {(currentCharacter as any).prestige.currentRank === 2 && '🎯'}
                {(currentCharacter as any).prestige.currentRank === 3 && '⚔️'}
                {(currentCharacter as any).prestige.currentRank === 4 && '👑'}
                {(currentCharacter as any).prestige.currentRank >= 5 && '✨'}
              </span>
              <span className="text-gold-light font-bold">P{(currentCharacter as any).prestige.currentRank}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Vitals Section */}
      <div className="p-4 space-y-3 border-b border-wood-light/30">
        {/* Energy Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-desert-sand">Energy</span>
            <span className="text-gold-light font-bold">
              {Math.floor(energy)}/{maxEnergy}
            </span>
          </div>
          <div className="h-3 bg-wood-dark rounded-full overflow-hidden border border-wood-light/30">
            <div
              className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-300"
              style={{ width: `${(energy / maxEnergy) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-desert-sand/70 mt-1">
            <span>+{regenRate.toFixed(1)}/min</span>
            {!isEnergyFull && countdownSeconds > 0 && (
              <span className="text-yellow-400">
                Full in {formatTimeToFull(countdownSeconds)}
              </span>
            )}
            {isEnergyFull && (
              <span className="text-green-400">Full</span>
            )}
          </div>

          {/* Fate Marks Display - Near Energy Bar */}
          <FateMarksDisplay className="mt-2" />

          {/* Tavern Energy Buffs Display */}
          <ActiveBuffsDisplay compact className="mt-2" />
        </div>

        {/* Total Level Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-desert-sand">Total Level</span>
            <span className="text-cyan-400 font-bold">
              {totalLevel} / {nextMilestone}
            </span>
          </div>
          <div className="h-3 bg-wood-dark rounded-full overflow-hidden border border-wood-light/30">
            <div
              className="h-full bg-gradient-to-r from-cyan-700 to-cyan-400 transition-all duration-300"
              style={{ width: `${Math.min(tlProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-desert-sand/70 mt-1">
            <span>Next tier: TL {nextMilestone}</span>
            <span className="text-cyan-400">{Math.floor(tlProgress)}%</span>
          </div>
        </div>

        {/* Dollars */}
        <div className="flex items-center justify-between bg-wood-dark/50 rounded px-3 py-2">
          <span className="text-desert-sand text-sm">Dollars</span>
          <span className="text-gold-light font-bold text-lg">
            ${currentCharacter.gold?.toLocaleString() || 0}
          </span>
        </div>

        {/* Bounty Amount (if wanted) */}
        {currentCharacter.wantedLevel > 0 && currentCharacter.bountyAmount > 0 && (
          <div className="flex items-center justify-between bg-wood-dark/50 rounded px-3 py-2">
            <span className="text-desert-sand text-sm">Bounty</span>
            <span className="text-red-400 font-bold">
              ${currentCharacter.bountyAmount.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Status Icons Row */}
      <StatusIconsRow
        isJailed={currentCharacter.isJailed}
        jailedUntil={currentCharacter.jailedUntil ? currentCharacter.jailedUntil.toString() : undefined}
        isDead={deathStatus?.isDead}
        respawnCountdown={deathStatus?.respawnCountdown}
        hasBlessings={hasBlessings}
        hasCurses={hasCurses}
        blessingsCount={getBlessings().length}
        cursesCount={getCurses().length}
        wantedLevel={currentCharacter.wantedLevel}
      />

      {/* Tabs */}
      <div className="flex border-b border-wood-light/30">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 text-xs font-bold transition-colors ${
            activeTab === 'stats'
              ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
              : 'text-desert-sand hover:text-gold-light hover:bg-wood-dark/50'
          }`}
        >
          Stats
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex-1 py-2 text-xs font-bold transition-colors ${
            activeTab === 'skills'
              ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
              : 'text-desert-sand hover:text-gold-light hover:bg-wood-dark/50'
          }`}
        >
          Skills
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className={`flex-1 py-2 text-xs font-bold transition-colors relative ${
            activeTab === 'effects'
              ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
              : 'text-desert-sand hover:text-gold-light hover:bg-wood-dark/50'
          }`}
        >
          Effects
          {(hasBlessings || hasCurses) && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'stats' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gold-light mb-2">Core Stats</h3>

            {/* Cunning - Spades */}
            <StatBar
              name="Cunning"
              value={currentCharacter.stats?.cunning || 0}
              icon="♠"
              color="from-gray-600 to-gray-400"
              description="Stealth, deception, crimes"
            />

            {/* Spirit - Hearts */}
            <StatBar
              name="Spirit"
              value={currentCharacter.stats?.spirit || 0}
              icon="♥"
              color="from-red-700 to-red-400"
              description="Social, supernatural, charm"
            />

            {/* Combat - Clubs */}
            <StatBar
              name="Combat"
              value={currentCharacter.stats?.combat || 0}
              icon="♣"
              color="from-green-700 to-green-400"
              description="Fighting, violence, force"
            />

            {/* Craft - Diamonds */}
            <StatBar
              name="Craft"
              value={currentCharacter.stats?.craft || 0}
              icon="♦"
              color="from-blue-600 to-blue-400"
              description="Economy, creation, trade"
            />

            {/* Combat Record */}
            {duelStats && (duelStats.wins > 0 || duelStats.losses > 0) && (
              <div className="mt-4 pt-3 border-t border-wood-light/20">
                <h3 className="text-sm font-bold text-gold-light mb-2">Combat Record</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-desert-sand">Wins / Losses</span>
                    <span>
                      <span className="text-green-400 font-bold">{duelStats.wins}</span>
                      <span className="text-desert-sand/50"> / </span>
                      <span className="text-red-400 font-bold">{duelStats.losses}</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-desert-sand">Win Rate</span>
                    <span className={`font-bold ${duelStats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                      {duelStats.winRate.toFixed(1)}%
                    </span>
                  </div>
                  {duelStats.currentStreak !== 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-desert-sand">Streak</span>
                      <span className={`font-bold ${duelStats.currentStreak > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {duelStats.currentStreak > 0 ? 'W' : 'L'}{Math.abs(duelStats.currentStreak)}
                        {Math.abs(duelStats.currentStreak) >= 3 && ' 🔥'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gold-light mb-2">Top Skills</h3>

            {topSkills.length === 0 ? (
              <p className="text-desert-sand/70 text-sm italic">No skills trained yet</p>
            ) : (
              topSkills.map((skill) => {
                const skillDef = skills.find(s => s.id === skill.skillId);
                return (
                  <div
                    key={skill.skillId}
                    className="flex items-center justify-between bg-wood-dark/50 rounded px-3 py-2"
                  >
                    <span className="text-desert-sand text-sm truncate" title={skillDef?.name}>
                      {skillDef?.name || 'Unknown'}
                    </span>
                    <span className="text-gold-light font-bold">
                      Lv.{skill.level}
                    </span>
                  </div>
                );
              })
            )}

            {skillData.length > 5 && (
              <p className="text-xs text-desert-sand/50 text-center mt-2">
                +{skillData.length - 5} more skills
              </p>
            )}
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-3">
            {/* Blessings */}
            <div>
              <h3 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-1">
                <span>✨</span> Blessings
              </h3>
              {getBlessings().length === 0 ? (
                <p className="text-desert-sand/70 text-xs italic">No active blessings</p>
              ) : (
                <div className="space-y-2">
                  {getBlessings().map((blessing, index) => (
                    <EffectCard
                      key={`blessing-${index}`}
                      type="blessing"
                      name={blessing.type}
                      description={blessing.description}
                      source={blessing.source}
                      expiresAt={blessing.expiresAt}
                      power={blessing.power}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Curses */}
            <div className="pt-2 border-t border-wood-light/20">
              <h3 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-1">
                <span>👁️</span> Curses
              </h3>
              {getCurses().length === 0 ? (
                <p className="text-desert-sand/70 text-xs italic">No active curses</p>
              ) : (
                <div className="space-y-2">
                  {getCurses().map((curse, index) => (
                    <EffectCard
                      key={`curse-${index}`}
                      type="curse"
                      name={curse.type}
                      description={curse.description}
                      source={curse.source}
                      expiresAt={curse.expiresAt}
                      severity={curse.severity}
                      removalCondition={curse.removalCondition}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Links Section */}
      <QuickLinksSection mailUnread={mailUnreadCount} />

      {/* Footer - Location */}
      <div className="p-3 border-t border-wood-light/30 bg-wood-dark/50">
        <div className="text-xs text-desert-sand/70">Current Location</div>
        <div className="text-sm text-gold-light truncate font-bold">
          {locationName}
        </div>
      </div>
    </aside>
  );
};

// Stat bar sub-component
interface StatBarProps {
  name: string;
  value: number;
  icon: string;
  color: string;
  description: string;
}

const StatBar: React.FC<StatBarProps> = ({ name, value, icon, color, description }) => {
  const maxStat = 100; // Assuming max stat is 100
  const percentage = (value / maxStat) * 100;

  return (
    <div className="group" title={description}>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-desert-sand flex items-center gap-1">
          <span className="text-base">{icon}</span>
          {name}
        </span>
        <span className="text-gold-light font-bold">{value}</span>
      </div>
      <div className="h-2 bg-wood-dark rounded-full overflow-hidden border border-wood-light/30">
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

// Status icons row sub-component
interface StatusIconsRowProps {
  isJailed?: boolean;
  jailedUntil?: string;
  isDead?: boolean;
  respawnCountdown?: number;
  hasBlessings: boolean;
  hasCurses: boolean;
  blessingsCount: number;
  cursesCount: number;
  wantedLevel?: number;
}

const StatusIconsRow: React.FC<StatusIconsRowProps> = ({
  isJailed,
  jailedUntil,
  isDead,
  respawnCountdown,
  hasBlessings,
  hasCurses,
  blessingsCount,
  cursesCount,
  wantedLevel,
}) => {
  // Calculate remaining jail time
  const getJailTimeRemaining = () => {
    if (!jailedUntil) return '';
    const remaining = new Date(jailedUntil).getTime() - Date.now();
    if (remaining <= 0) return '';
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  // Check if any status is active
  const hasActiveStatus = isJailed || isDead || hasBlessings || hasCurses || (wantedLevel && wantedLevel > 0);

  if (!hasActiveStatus) {
    return null; // Don't render if no status icons to show
  }

  return (
    <div className="px-4 py-2 border-b border-wood-light/30 bg-wood-dark/30">
      <div className="flex flex-wrap gap-2 justify-center">
        {/* Jail Status */}
        {isJailed && (
          <Tooltip content={`Jailed${jailedUntil ? ` - ${getJailTimeRemaining()} remaining` : ''}`}>
            <div className="flex items-center gap-1 px-2 py-1 bg-red-900/50 rounded border border-red-700/50 text-red-400 text-xs">
              <span>⛓️</span>
              <span>Jail</span>
            </div>
          </Tooltip>
        )}

        {/* Dead Status */}
        {isDead && (
          <Tooltip content={`Dead${respawnCountdown ? ` - Respawn in ${respawnCountdown}s` : ''}`}>
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-900/50 rounded border border-gray-700/50 text-gray-400 text-xs">
              <span>💀</span>
              <span>Dead</span>
            </div>
          </Tooltip>
        )}

        {/* Blessed Status */}
        {hasBlessings && (
          <Tooltip content={`${blessingsCount} active blessing${blessingsCount > 1 ? 's' : ''}`}>
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-900/50 rounded border border-yellow-700/50 text-yellow-400 text-xs">
              <span>✨</span>
              <span>{blessingsCount}</span>
            </div>
          </Tooltip>
        )}

        {/* Cursed Status */}
        {hasCurses && (
          <Tooltip content={`${cursesCount} active curse${cursesCount > 1 ? 's' : ''}`}>
            <div className="flex items-center gap-1 px-2 py-1 bg-red-900/50 rounded border border-red-700/50 text-red-400 text-xs">
              <span>👁️</span>
              <span>{cursesCount}</span>
            </div>
          </Tooltip>
        )}

        {/* Wanted Level */}
        {wantedLevel !== undefined && wantedLevel > 0 && (
          <Tooltip content={`Wanted Level ${wantedLevel}/5`}>
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-900/50 rounded border border-orange-700/50 text-orange-400 text-xs">
              <span>{'⭐'.repeat(Math.min(wantedLevel, 5))}</span>
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

// Quick links section sub-component
interface QuickLinksSectionProps {
  mailUnread: number;
}

interface QuickLinkItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

const QuickLinksSection: React.FC<QuickLinksSectionProps> = ({
  mailUnread,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const quickLinks: QuickLinkItem[] = [
    { label: 'Location', path: '/game/location', icon: '📍' },
    { label: 'Inventory', path: '/game/inventory', icon: '🎒' },
    { label: 'Crafting', path: '/game/crafting', icon: '🔨' },
    { label: 'Gathering', path: '/game/gathering', icon: '⛏️' },
    { label: 'Crimes', path: '/game/crimes', icon: '🔪' },
    { label: 'Gang', path: '/game/gang', icon: '👥' },
    { label: 'Territory', path: '/game/territory', icon: '🗺️' },
    { label: 'Mail', path: '/game/mail', icon: '✉️', badge: mailUnread },
    { label: 'Quests', path: '/game/quests', icon: '📜' },
    { label: 'Leaderboard', path: '/game/leaderboard', icon: '🏆' },
    { label: 'Shop', path: '/game/shop', icon: '🏪' },
    { label: 'Settings', path: '/game/settings', icon: '⚙️' },
  ];

  return (
    <div className="border-t border-wood-light/30">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between text-sm font-bold text-desert-sand hover:text-gold-light hover:bg-wood-dark/50 transition-colors"
      >
        <span>Quick Links</span>
        <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {/* Links Grid */}
      {isExpanded && (
        <div className="px-3 pb-3 grid grid-cols-2 gap-1">
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-desert-sand hover:text-gold-light hover:bg-wood-dark/50 rounded transition-colors relative"
            >
              <span>{link.icon}</span>
              <span className="truncate">{link.label}</span>
              {link.badge !== undefined && link.badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold rounded-full">
                  {link.badge > 99 ? '99+' : link.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// Effect card sub-component for blessings/curses
interface EffectCardProps {
  type: 'blessing' | 'curse';
  name: string;
  description: string;
  source: string;
  expiresAt: string | null;
  power?: number;
  severity?: number;
  removalCondition?: string;
}

const EffectCard: React.FC<EffectCardProps> = ({
  type,
  name,
  description,
  source,
  expiresAt,
  power,
  severity,
  removalCondition,
}) => {
  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!expiresAt) return 'Permanent';
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) return 'Expired';
    const hours = Math.floor(remaining / 3600000);
    const mins = Math.floor((remaining % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const isBlessing = type === 'blessing';
  const borderColor = isBlessing ? 'border-yellow-700/50' : 'border-red-700/50';
  const bgColor = isBlessing ? 'bg-yellow-900/20' : 'bg-red-900/20';
  const accentColor = isBlessing ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className={`${bgColor} ${borderColor} border rounded p-2`}>
      <div className="flex justify-between items-start mb-1">
        <span className={`${accentColor} text-xs font-bold capitalize`}>{name}</span>
        {(power || severity) && (
          <span className="text-xs text-desert-sand/50">
            {isBlessing ? `+${Math.round(power || 0)}` : `-${Math.round(severity || 0)}`}
          </span>
        )}
      </div>
      <p className="text-xs text-desert-sand/80 mb-1">{description}</p>
      <div className="flex justify-between text-[10px] text-desert-sand/50">
        <span>From: {source}</span>
        <span className={expiresAt ? accentColor : 'text-purple-400'}>{getTimeRemaining()}</span>
      </div>
      {removalCondition && (
        <p className="text-[10px] text-desert-sand/50 mt-1 italic">
          Remove: {removalCondition}
        </p>
      )}
    </div>
  );
};

export default PlayerSidebar;
