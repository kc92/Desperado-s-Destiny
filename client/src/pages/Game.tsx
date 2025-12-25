/**
 * Game Page
 * Immersive location-based hub with sidebar navigation
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useEnergyStore } from '@/store/useEnergyStore';
import { useCrimeStore } from '@/store/useCrimeStore';
import { useActionStore } from '@/store/useActionStore';
import { useSkillStore } from '@/store/useSkillStore';
import { Card, Tooltip, NavTile } from '@/components/ui';
import { DashboardStatsSkeleton, ProgressBarSkeleton } from '@/components/ui/Skeleton';
import { DollarsDisplay } from '@/components/game/DollarsDisplay';
import { GettingStartedGuide } from '@/components/game/GettingStartedGuide';
import { KarmaPanel, DeityRelationship } from '@/components/karma';
import { api } from '@/services/api';
import { logger } from '@/services/logger.service';

// Building type to icon/color mapping for dynamic buildings
const buildingConfig: Record<string, { icon: string; color: string }> = {
  saloon: { icon: '🍺', color: 'from-amber-900 to-amber-800' },
  bank: { icon: '🏦', color: 'from-emerald-900 to-emerald-800' },
  general_store: { icon: '🏪', color: 'from-purple-900 to-purple-800' },
  sheriff_office: { icon: '⭐', color: 'from-blue-900 to-blue-800' },
  hotel: { icon: '🏨', color: 'from-rose-900 to-rose-800' },
  telegraph_office: { icon: '📨', color: 'from-cyan-900 to-cyan-800' },
  church: { icon: '⛪', color: 'from-slate-800 to-slate-700' },
  doctors_office: { icon: '🏥', color: 'from-red-900 to-red-800' },
  blacksmith: { icon: '⚒️', color: 'from-gray-800 to-gray-700' },
  stables: { icon: '🐎', color: 'from-orange-900 to-orange-800' },
  government: { icon: '🏛️', color: 'from-indigo-900 to-indigo-800' },
  mining_office: { icon: '⛏️', color: 'from-stone-800 to-stone-700' },
  elite_club: { icon: '🎩', color: 'from-violet-900 to-violet-800' },
  labor_exchange: { icon: '👷', color: 'from-yellow-900 to-yellow-800' },
  worker_tavern: { icon: '🍻', color: 'from-amber-800 to-amber-700' },
  tent_city: { icon: '⛺', color: 'from-zinc-800 to-zinc-700' },
  laundry: { icon: '🧺', color: 'from-sky-900 to-sky-800' },
  apothecary: { icon: '🧪', color: 'from-teal-900 to-teal-800' },
  tea_house: { icon: '🍵', color: 'from-green-900 to-green-800' },
  business: { icon: '💼', color: 'from-neutral-800 to-neutral-700' },
  entertainment: { icon: '🎭', color: 'from-pink-900 to-pink-800' },
  labor: { icon: '🔧', color: 'from-orange-800 to-orange-700' },
  service: { icon: '🛎️', color: 'from-blue-800 to-blue-700' },
};

interface TownBuilding {
  id: string;
  name: string;
  type: string;
  description: string;
  icon?: string;
  isOpen: boolean;
}

// Location-specific flavor text with time of day variations
const locationFlavor: Record<string, { morning: string; afternoon: string; evening: string; night: string }> = {
  // Frontera Territories
  'villa-esperanza': {
    morning: 'The sun rises over the lawless town. Outlaws nurse hangovers as the cantina opens early.',
    afternoon: 'Heat shimmers off adobe walls. The plaza buzzes with black market deals and whispered conspiracies.',
    evening: 'Golden light bathes the haciendas. Guitar music and laughter spill from every doorway.',
    night: 'The town comes alive after dark. Fortune favors the bold in Villa Esperanza.',
  },
  'the-hideout': {
    morning: 'Dawn breaks over the hidden canyon. Lookouts change shifts on the clifftops.',
    afternoon: 'The sun barely reaches this secret place. Outlaws plan their next raid in the shadows.',
    evening: 'Campfires flicker in the ravine. Stories of scores and close calls fill the air.',
    night: 'Perfect darkness in the canyon. Only those who know the paths can find their way.',
  },
  // Settler Territories
  'red-gulch': {
    morning: 'Church bells ring across the canyon. Merchants open their shops on Main Street.',
    afternoon: 'The midday sun beats down on packed dirt roads. Settlers seek shade in the saloons.',
    evening: 'Red canyon walls glow like fire at sunset. Piano music echoes through town.',
    night: 'Gas lamps light Main Street. The respectable folk retire while the saloons grow rowdy.',
  },
  'marshals-station': {
    morning: 'The flag rises over the station. Deputies prepare for patrol.',
    afternoon: 'Wanted posters flutter in the hot breeze. Justice watches over the frontier.',
    evening: 'Prisoners are brought in from the day\'s work. The cells fill with outlaws.',
    night: 'A single lamp burns in the marshal\'s window. The law never sleeps.',
  },
  'railroad-camp': {
    morning: 'Steam whistles signal the start of work. Chinese laborers head to the tracks.',
    afternoon: 'The crack of hammers on iron echoes through the desert. Progress waits for no one.',
    evening: 'Workers collapse in their tents. The rails stretch ever westward.',
    night: 'Guards patrol the supply depot. Saboteurs have been spotted in the area.',
  },
  'settlers-fort': {
    morning: 'Bugle calls wake the garrison. Soldiers drill in the courtyard.',
    afternoon: 'The fort bakes in the sun. Sentries scan the horizon for threats.',
    evening: 'The flag is lowered at sunset. Another day on the frontier survives.',
    night: 'Torches line the walls. The fort stands watch against the darkness.',
  },
  // Nahi Coalition Territories
  'kaiowa-mesa': {
    morning: 'Mist rises from the high plateau. Elders greet the sun with ancient songs.',
    afternoon: 'Eagles soar above the mesa. The spirits walk close in this sacred place.',
    evening: 'The sun paints the rock faces in shades of gold and red. Drums echo at dusk.',
    night: 'Stars blaze overhead. The ancestors speak in dreams to those who listen.',
  },
  'sacred-springs': {
    morning: 'Clear waters catch the first light. Healers gather sacred herbs at dawn.',
    afternoon: 'The springs shimmer with blessing. Pilgrims come to be cleansed.',
    evening: 'The waters turn to liquid gold at sunset. Prayers rise with the steam.',
    night: 'Spirits dance on the water. This place holds power older than memory.',
  },
  'spirit-rock': {
    morning: 'The great stone catches the first rays. Visions come to those who fast.',
    afternoon: 'Heat rises from the sacred monument. The veil between worlds grows thin.',
    evening: 'Shadows lengthen across the rock face. Ancient symbols glow at dusk.',
    night: 'The spirits speak clearly here. Few dare to listen to what they say.',
  },
  'ancestor-grove': {
    morning: 'Dew clings to ancient trees. The grove holds secrets from the beginning.',
    afternoon: 'Cool shade beneath the canopy. Time moves differently here.',
    evening: 'Fireflies emerge at dusk. The ancestors are never far from this place.',
    night: 'Owl calls echo through the trees. The grove watches over its children.',
  },
  // Neutral Territories
  'sangre-canyon': {
    morning: 'Blood-red walls catch the dawn. Ghosts of battles past stir in the shadows.',
    afternoon: 'The canyon bakes in unforgiving heat. Claim jumpers and bandits hide in every crevice.',
    evening: 'The canyon earns its name at sunset. Red as blood, red as the lives lost here.',
    night: 'Danger lurks around every bend. Many enter Sangre Canyon. Fewer leave.',
  },
  'the-scar': {
    morning: 'Strange lights flicker in the rift at dawn. Reality itself seems wounded here.',
    afternoon: 'The air crackles with supernatural energy. Compasses spin uselessly.',
    evening: 'The Scar glows from within at dusk. Things move in the corner of your eye.',
    night: 'The veil between worlds tears open. What walks here should not exist.',
  },
};

// Get time of day and location-specific flavor
const getTimeOfDay = (hour: number, locationId: string) => {
  const location = locationFlavor[locationId] || locationFlavor['villa-esperanza'];

  if (hour >= 5 && hour < 12) return { period: 'Morning', flavor: location.morning };
  if (hour >= 12 && hour < 17) return { period: 'Afternoon', flavor: location.afternoon };
  if (hour >= 17 && hour < 20) return { period: 'Evening', flavor: location.evening };
  return { period: 'Night', flavor: location.night };
};

// Random NPC dialogue/events
const npcDialogue = [
  '"Watch yourself, stranger. El Toro\'s gang was spotted near Red Gulch..." - Marshal Blackwood',
  '"I heard there\'s gold in them hills, if you\'re brave enough to look." - Old Prospector',
  '"The Coalition elders speak of dark omens in the sacred caves." - Running Fox',
  '"Business is good when outlaws are about. Need anything... special?" - Eliza Chen',
  '"Another dusty day in paradise, eh partner?" - Barkeep',
  '"The Frontera runs this territory. Best you remember that." - El Rey\'s messenger',
  '"Settlers keep pushing west. Won\'t be long before there\'s trouble." - Local rancher',
];

/**
 * Main game dashboard page - Location-based immersive hub
 */
export const Game: React.FC = () => {
  const navigate = useNavigate();
  const { user: _user } = useAuthStore();
  const {
    currentCharacter,
    loadSelectedCharacter,
    isLoading: isCharacterLoading,
  } = useCharacterStore();
  const { energy } = useEnergyStore();
  const { crime } = useCrimeStore();
  const { fetchActions, isLoading: isActionLoading } = useActionStore();
  const { fetchSkills, isLoading: isSkillLoading } = useSkillStore();

  const isLoading = isCharacterLoading || isActionLoading || isSkillLoading;

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDialogue, setCurrentDialogue] = useState(npcDialogue[0]);
  const [townBuildings, setTownBuildings] = useState<TownBuilding[]>([]);
  const [buildingsLoading, setBuildingsLoading] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<TownBuilding | null>(null);

  // Load character on mount
  useEffect(() => {
    loadSelectedCharacter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load actions and skills only after character is loaded
  useEffect(() => {
    if (currentCharacter) {
      fetchActions();
      fetchSkills();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCharacter]);

  // Fetch town buildings when character location matches Red Gulch
  useEffect(() => {
    const fetchBuildings = async () => {
      if (!currentCharacter) return;

      // Red Gulch town ID from seed data
      const redGulchId = '6501a0000000000000000001';
      const locationValue = currentCharacter.currentLocation || '';
      const locationLower = locationValue.toLowerCase();

      // Check if player is in Red Gulch (by ID, name, or slug variations)
      const isInRedGulch =
        locationValue === redGulchId ||
        locationLower === 'red gulch' ||
        locationLower === 'red-gulch' ||
        (locationLower.includes('red') && locationLower.includes('gulch'));

      // Always try to fetch for Red Gulch - players typically start there
      // Fallback: if no specific location, assume Red Gulch for now
      const shouldFetchBuildings = isInRedGulch || !locationValue || locationLower === 'red gulch';

      if (shouldFetchBuildings) {
        setBuildingsLoading(true);
        try {
          const response = await api.get(`/locations/${redGulchId}/buildings`);
          if (response.data.success && response.data.data?.buildings) {
            setTownBuildings(response.data.data.buildings);
          }
        } catch (err) {
          logger.error('Failed to fetch buildings', err as Error, { context: 'Game.fetchBuildings', locationValue });
        } finally {
          setBuildingsLoading(false);
        }
      } else {
        setTownBuildings([]);
      }
    };

    fetchBuildings();
  }, [currentCharacter]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate NPC dialogue every 30 seconds
  useEffect(() => {
    const dialogueTimer = setInterval(() => {
      setCurrentDialogue(npcDialogue[Math.floor(Math.random() * npcDialogue.length)]);
    }, 30000);
    return () => clearInterval(dialogueTimer);
  }, []);

  // Redirect to character select if no character
  useEffect(() => {
    if (!isLoading && !currentCharacter) {
      navigate('/character-select');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, currentCharacter]);

  if (isLoading || !currentCharacter) {
    return (
      <div className="flex gap-6" aria-busy="true" aria-live="polite">
        {/* Sidebar Skeleton */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
          <DashboardStatsSkeleton />
          <Card variant="wood" className="p-3">
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-wood-dark/30 rounded animate-pulse" />
              ))}
            </div>
          </Card>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 space-y-4">
          <div className="h-32 bg-wood-dark/30 rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-24 bg-wood-dark/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  const energyPercent = energy
    ? Math.round((energy.currentEnergy / energy.maxEnergy) * 100)
    : 100;

  const isJailed = crime?.isJailed || false;
  const jailTimeRemaining = crime?.jailedUntil
    ? Math.max(0, new Date(crime.jailedUntil).getTime() - currentTime.getTime())
    : 0;

  // Get location ID (convert display name to ID format if needed)
  const locationId = currentCharacter.currentLocation?.toLowerCase().replace(/\s+/g, '-') || 'villa-esperanza';
  const locationName = currentCharacter.currentLocation || 'Villa Esperanza';
  const timeOfDay = getTimeOfDay(currentTime.getHours(), locationId);

  return (
    <div className="flex gap-6" data-testid="game-dashboard">
      {/* Sidebar - Character & Quick Nav */}
      <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
        {/* Character Card */}
        <Card variant="leather" className="p-4" data-tutorial-target="dashboard-stats">
          <div className="text-center mb-3">
            <h2 className="text-xl font-western text-gold-light">{currentCharacter.name}</h2>
            <p className="text-sm text-desert-stone">
              Level {currentCharacter.level} • {currentCharacter.faction}
            </p>
          </div>

          {/* Gold */}
          <div className="text-center mb-3">
            <DollarsDisplay amount={currentCharacter.gold} size="lg" />
          </div>

          {/* Energy Bar with Tooltip */}
          {energy ? (
            <Tooltip
              content={`Energy is used to perform actions. Regenerates ${Math.round(energy.regenRate || 30)} per hour. Current: ${Math.floor(energy.currentEnergy || 0)}/${energy.maxEnergy || 100}`}
              position="right"
            >
              <div className="space-y-1 mb-3 cursor-help" data-tutorial-target="energy-bar">
                <div className="flex justify-between text-xs text-desert-sand">
                  <span>Energy</span>
                  <span>{Math.floor(energy.currentEnergy || 0)}/{energy.maxEnergy || 100}</span>
                </div>
                <div className="h-2 bg-wood-dark/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-500"
                    style={{ width: `${energyPercent}%` }}
                  />
                </div>
              </div>
            </Tooltip>
          ) : (
            <div className="mb-3">
              <ProgressBarSkeleton />
            </div>
          )}

          {/* Stats with Tooltips */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <Tooltip
              content="Cunning: Stealth, deception, and social manipulation. Affects crime success and social challenges."
              position="right"
            >
              <div className="cursor-help hover:bg-wood-dark/30 rounded p-1 transition-colors">
                <div className="text-gold-light font-bold">{currentCharacter.stats.cunning}</div>
                <div className="text-desert-stone">CUN</div>
              </div>
            </Tooltip>
            <Tooltip
              content="Spirit: Willpower, luck, and mystical power. Affects Destiny Deck draws and spiritual abilities."
              position="left"
            >
              <div className="cursor-help hover:bg-wood-dark/30 rounded p-1 transition-colors">
                <div className="text-gold-light font-bold">{currentCharacter.stats.spirit}</div>
                <div className="text-desert-stone">SPI</div>
              </div>
            </Tooltip>
            <Tooltip
              content="Combat: Fighting prowess and weapon mastery. Affects damage dealt and combat success rate."
              position="right"
            >
              <div className="cursor-help hover:bg-wood-dark/30 rounded p-1 transition-colors">
                <div className="text-gold-light font-bold">{currentCharacter.stats.combat}</div>
                <div className="text-desert-stone">COM</div>
              </div>
            </Tooltip>
            <Tooltip
              content="Craft: Building, crafting, and technical skills. Affects item quality and crafting success."
              position="left"
            >
              <div className="cursor-help hover:bg-wood-dark/30 rounded p-1 transition-colors">
                <div className="text-gold-light font-bold">{currentCharacter.stats.craft}</div>
                <div className="text-desert-stone">CRA</div>
              </div>
            </Tooltip>
          </div>

          {/* Wanted Level */}
          {crime?.wantedLevel && crime.wantedLevel > 0 && (
            <div className="mt-3 pt-3 border-t border-wood-grain/30 text-center">
              <span className="text-red-600 text-xs font-bold">WANTED</span>
              <div className="flex justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-xs ${i < crime.wantedLevel ? 'text-red-600' : 'text-gray-600'}`}>★</span>
                ))}
              </div>
            </div>
          )}

          {/* Jailed Status */}
          {isJailed && (
            <div className="mt-3 pt-3 border-t border-wood-grain/30 text-center">
              <p className="text-red-600 text-xs font-bold animate-pulse">
                🔒 JAILED - {Math.ceil(jailTimeRemaining / 60000)}m
              </p>
            </div>
          )}
        </Card>

        {/* Getting Started Guide - Shows for new players (level 1-5) */}
        <GettingStartedGuide />

        {/* Karma/Deity Panel - Moral Profile */}
        <KarmaPanel variant="compact" className="border border-wood-grain/30" />

        {/* Deity Relationships */}
        <DeityRelationship variant="hud" showTooltips={true} />

        {/* Quick Navigation */}
        <Card variant="wood" className="p-3">
          <h3 className="text-sm font-western text-desert-sand mb-2 px-2">Quick Actions</h3>
          <nav className="space-y-1">
            <button
              onClick={() => !isJailed && navigate('/game/crimes')}
              disabled={isJailed}
              className={`w-full text-left px-3 py-2 rounded text-sm font-serif transition-colors ${
                isJailed
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-desert-sand hover:bg-wood-dark/50 hover:text-gold-light'
              }`}
            >
              🔫 Crimes
            </button>
            <button
              onClick={() => !isJailed && navigate('/game/combat')}
              disabled={isJailed}
              className={`w-full text-left px-3 py-2 rounded text-sm font-serif transition-colors ${
                isJailed
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-desert-sand hover:bg-wood-dark/50 hover:text-gold-light'
              }`}
            >
              ⚔️ Combat
            </button>
            <button
              onClick={() => navigate('/game/skills')}
              className="w-full text-left px-3 py-2 rounded text-sm font-serif text-desert-sand hover:bg-wood-dark/50 hover:text-gold-light transition-colors"
            >
              📚 Skills
            </button>
            <button
              onClick={() => navigate('/game/territory')}
              className="w-full text-left px-3 py-2 rounded text-sm font-serif text-desert-sand hover:bg-wood-dark/50 hover:text-gold-light transition-colors"
            >
              🗺️ Travel
            </button>
            <button
              onClick={() => navigate('/game/gang')}
              className="w-full text-left px-3 py-2 rounded text-sm font-serif text-desert-sand hover:bg-wood-dark/50 hover:text-gold-light transition-colors"
            >
              🤠 Gang
            </button>
            <button
              onClick={() => navigate('/game/inventory')}
              className="w-full text-left px-3 py-2 rounded text-sm font-serif text-desert-sand hover:bg-wood-dark/50 hover:text-gold-light transition-colors"
            >
              🎒 Inventory
            </button>
            <button
              onClick={() => navigate('/game/contracts')}
              className="w-full text-left px-3 py-2 rounded text-sm font-serif text-desert-sand hover:bg-wood-dark/50 hover:text-gold-light transition-colors"
            >
              📋 Contracts
            </button>
          </nav>
        </Card>

        {/* Time Display */}
        <div className="text-center text-sm text-desert-stone">
          {currentTime.toLocaleTimeString()}
        </div>
      </aside>

      {/* Main Content - Location View */}
      <main className="flex-1 space-y-4">
        {/* Location Header */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-wood-dark to-wood-medium border border-wood-grain/30">
          <div className="absolute inset-0 opacity-20 bg-[url('/textures/dust.png')] bg-repeat"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-western text-gold-light tracking-wide">
                {locationName.toUpperCase()}
              </h1>
              <span className="text-sm text-desert-sand font-serif italic">
                {timeOfDay.period}
              </span>
            </div>
            <p className="text-desert-sand font-serif italic text-sm">
              {timeOfDay.flavor}
            </p>
          </div>
        </div>

        {/* Mobile Character Stats */}
        <Card variant="leather" className="lg:hidden p-4" data-testid="character-stats">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-western text-gold-light">{currentCharacter.name}</h2>
              <p className="text-sm text-desert-stone">Level {currentCharacter.level}</p>
            </div>
            <div className="text-right">
              <DollarsDisplay amount={currentCharacter.gold} size="lg" />
              <div className="text-xs text-desert-stone">{Math.floor(energy?.currentEnergy || 0)}/{energy?.maxEnergy || 100} Energy</div>
            </div>
          </div>
        </Card>

        {/* Town Buildings Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <NavTile
            to="/game/crimes"
            icon="🍺"
            title="The Saloon"
            subtitle="Crimes & Bounties"
            disabled={isJailed}
            disabledReason="Cannot access while jailed"
            data-testid="nav-crimes"
          />

          <NavTile
            to="/game/combat"
            icon="⚔️"
            title="Dueling Grounds"
            subtitle="Combat & Duels"
            disabled={isJailed}
            disabledReason="Cannot access while jailed"
            data-tutorial-target="combat-link"
          />

          <NavTile
            to="/game/skills"
            icon="📚"
            title="The Library"
            subtitle="Skills & Training"
            data-tutorial-target="skills-link"
          />

          <NavTile
            to="/game/territory"
            icon="🐎"
            title="Stables"
            subtitle="Territory Map"
            data-testid="nav-territory"
          />

          <NavTile
            to="/game/gang"
            icon="🤠"
            title="Gang Hideout"
            subtitle={currentCharacter.gangId ? 'Your Gang' : 'Join a Gang'}
            data-testid="nav-gang"
          />

          <NavTile
            to="/game/mail"
            icon="📨"
            title="Telegraph Office"
            subtitle="Mail & Messages"
          />

          <NavTile
            to="/game/friends"
            icon="🤝"
            title="Town Square"
            subtitle="Friends & Allies"
          />

          <NavTile
            to="/game/inventory"
            icon="🏪"
            title="General Store"
            subtitle="Inventory"
            data-testid="nav-inventory"
          />

          <NavTile
            to="/game/actions"
            icon="📜"
            title="Bounty Board"
            subtitle="Actions & Tasks"
            disabled={isJailed}
            disabledReason="Cannot access while jailed"
            data-testid="nav-actions"
            data-tutorial-target="actions-link"
          />

          <NavTile
            to="/game/leaderboard"
            icon="🏛️"
            title="Town Hall"
            subtitle="Leaderboard"
            data-testid="nav-leaderboard"
          />

          <NavTile
            to="/game/shop"
            icon="🔧"
            title="Gunsmith"
            subtitle="Buy & Sell"
            data-testid="nav-shop"
          />

          <NavTile
            to="/game/quests"
            icon="📖"
            title="Quest Hall"
            subtitle="Missions"
            data-testid="nav-quests"
          />

          <NavTile
            to="/game/contracts"
            icon="📋"
            title="Contract Board"
            subtitle="Daily Jobs"
            gradientColors="bg-gradient-to-b from-amber-900 to-amber-800"
            data-testid="nav-contracts"
          />

          <NavTile
            to="/game/deck-guide"
            icon="🃏"
            title="Card Table"
            subtitle="Deck Guide"
            data-testid="nav-deck-guide"
          />
        </div>

        {/* Red Gulch Town Buildings - Dynamic Section */}
        {townBuildings.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-western text-gold-light">
                Red Gulch Buildings
              </h2>
              <span className="text-xs text-desert-stone">
                {townBuildings.length} buildings
              </span>
            </div>

            {buildingsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 bg-wood-dark/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {townBuildings.map((building) => {
                  const config = buildingConfig[building.type] || {
                    icon: building.icon || '🏠',
                    color: 'from-wood-dark to-wood-medium'
                  };

                  return (
                    <button
                      key={building.id}
                      onClick={() => setSelectedBuilding(building)}
                      className={`group relative overflow-hidden rounded-lg border transition-all ${
                        building.isOpen
                          ? 'border-wood-grain/50 hover:border-gold-light hover:shadow-lg hover:shadow-gold-dark/20'
                          : 'border-gray-700 opacity-60'
                      }`}
                      disabled={!building.isOpen}
                    >
                      <div className={`bg-gradient-to-b ${config.color} p-3 text-center`}>
                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                          {config.icon}
                        </div>
                        <h3 className="font-western text-desert-sand group-hover:text-gold-light transition-colors text-sm truncate">
                          {building.name}
                        </h3>
                        <p className="text-xs text-desert-stone mt-1 line-clamp-1">
                          {building.isOpen ? building.description : 'Closed'}
                        </p>
                      </div>
                      {!building.isOpen && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="text-red-400 text-xs font-bold">CLOSED</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Building Detail Modal */}
        {selectedBuilding && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card variant="leather" className="max-w-lg w-full p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">
                    {buildingConfig[selectedBuilding.type]?.icon || selectedBuilding.icon || '🏠'}
                  </span>
                  <div>
                    <h2 className="text-2xl font-western text-gold-light">
                      {selectedBuilding.name}
                    </h2>
                    <p className="text-sm text-desert-stone capitalize">
                      {selectedBuilding.type.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBuilding(null)}
                  className="text-desert-stone hover:text-gold-light text-2xl"
                >
                  ×
                </button>
              </div>

              <p className="text-desert-sand font-serif">
                {selectedBuilding.description}
              </p>

              <div className="flex items-center gap-2 text-sm">
                <span className={selectedBuilding.isOpen ? 'text-green-400' : 'text-red-400'}>
                  {selectedBuilding.isOpen ? '● Open' : '● Closed'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      await api.post(`/locations/buildings/${selectedBuilding.id}/enter`);
                      setSelectedBuilding(null);
                      // Reload character to get updated location
                      loadSelectedCharacter();
                    } catch (err) {
                      logger.error('Failed to enter building', err as Error, { context: 'Game.enterBuilding', buildingId: selectedBuilding.id });
                    }
                  }}
                  disabled={!selectedBuilding.isOpen}
                  className={`flex-1 py-2 px-4 rounded font-western transition-colors ${
                    selectedBuilding.isOpen
                      ? 'bg-gold-dark hover:bg-gold-light text-wood-dark'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Enter Building
                </button>
                <button
                  onClick={() => setSelectedBuilding(null)}
                  className="py-2 px-4 rounded font-western bg-wood-dark hover:bg-wood-medium text-desert-sand border border-wood-grain/50"
                >
                  Close
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* NPC Dialogue / Event Ticker */}
        <div className="bg-wood-dark/80 rounded-lg p-4 border border-wood-grain/30">
          <p className="text-desert-sand font-serif text-sm italic">
            {currentDialogue}
          </p>
        </div>

        {/* Quick Stats Footer */}
        <Card variant="leather" className="p-3">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <div className="text-lg font-bold text-gold-light">{currentCharacter.experience}</div>
              <div className="text-desert-stone">XP</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gold-light">{currentCharacter.skills?.length || 0}</div>
              <div className="text-desert-stone">Skills</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gold-light">{currentCharacter.inventory?.length || 0}</div>
              <div className="text-desert-stone">Items</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gold-light">
                {currentCharacter.combatStats?.wins || 0}/{currentCharacter.combatStats?.losses || 0}
              </div>
              <div className="text-desert-stone">W/L</div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};
