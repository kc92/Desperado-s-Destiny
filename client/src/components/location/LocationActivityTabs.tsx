/**
 * Location Activity Tabs Component
 * Tab navigation for different activity types at a location
 */

// No imports needed for this stateless component

export type ActivityTab =
  | 'overview'
  | 'jobs'
  | 'crimes'
  | 'train'
  | 'craft'
  | 'gather'
  | 'shop'
  | 'travel';

interface TabConfig {
  id: ActivityTab;
  label: string;
  icon: string;
  visible: boolean;
}

interface LocationActivityTabsProps {
  activeTab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
  availableTabs: {
    hasJobs: boolean;
    hasCrimes: boolean;
    hasTraining: boolean;
    hasCrafting: boolean;
    hasGathering: boolean;
    hasShops: boolean;
    hasTravel: boolean;
  };
  compact?: boolean;
}

export function LocationActivityTabs({
  activeTab,
  onTabChange,
  availableTabs,
  compact = false,
}: LocationActivityTabsProps) {
  const tabs: TabConfig[] = [
    { id: 'overview', label: 'Overview', icon: '🏠', visible: true },
    { id: 'jobs', label: 'Jobs', icon: '💼', visible: availableTabs.hasJobs },
    { id: 'crimes', label: 'Crimes', icon: '🔫', visible: availableTabs.hasCrimes },
    { id: 'train', label: 'Train', icon: '📚', visible: availableTabs.hasTraining },
    { id: 'craft', label: 'Craft', icon: '⚒️', visible: availableTabs.hasCrafting },
    { id: 'gather', label: 'Gather', icon: '⛏️', visible: availableTabs.hasGathering },
    { id: 'shop', label: 'Shop', icon: '🏪', visible: availableTabs.hasShops },
    { id: 'travel', label: 'Travel', icon: '🗺️', visible: availableTabs.hasTravel },
  ];

  const visibleTabs = tabs.filter((tab) => tab.visible);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1 bg-gray-900/50 rounded-lg p-1">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
              activeTab === tab.id
                ? 'bg-amber-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
            onClick={() => onTabChange(tab.id)}
            title={tab.label}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="border-b border-gray-700 mb-4">
      <div className="flex flex-wrap gap-1 -mb-px">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LocationActivityTabs;
