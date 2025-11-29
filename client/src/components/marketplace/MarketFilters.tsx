/**
 * MarketFilters Component
 * Filter controls for marketplace listings
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  MarketCategory,
  ItemRarity,
  SortOption,
  Category,
  MarketFilters as Filters,
} from '@/hooks/useMarketplace';

interface MarketFiltersProps {
  categories: Category[];
  currentFilters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

// Rarity display info
const rarityOptions: { value: ItemRarity | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Rarities', color: 'text-desert-sand' },
  { value: 'common', label: 'Common', color: 'text-gray-300' },
  { value: 'uncommon', label: 'Uncommon', color: 'text-green-400' },
  { value: 'rare', label: 'Rare', color: 'text-blue-400' },
  { value: 'epic', label: 'Epic', color: 'text-purple-400' },
  { value: 'legendary', label: 'Legendary', color: 'text-orange-400' },
];

// Sort options
const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'time_asc', label: 'Ending Soon' },
  { value: 'time_desc', label: 'Newest First' },
  { value: 'bids_desc', label: 'Most Bids' },
];

export const MarketFilters: React.FC<MarketFiltersProps> = ({
  categories,
  currentFilters,
  onFiltersChange,
  onSearch,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState(currentFilters.search || '');
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice?.toString() || '');
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== currentFilters.search) {
        onSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentFilters.search, onSearch]);

  // Handle category change
  const handleCategoryChange = useCallback(
    (category: MarketCategory | undefined) => {
      onFiltersChange({
        ...currentFilters,
        category,
        page: 1, // Reset to first page
      });
    },
    [currentFilters, onFiltersChange]
  );

  // Handle rarity change
  const handleRarityChange = useCallback(
    (rarity: ItemRarity | undefined) => {
      onFiltersChange({
        ...currentFilters,
        rarity,
        page: 1,
      });
    },
    [currentFilters, onFiltersChange]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (sort: SortOption) => {
      onFiltersChange({
        ...currentFilters,
        sort,
      });
    },
    [currentFilters, onFiltersChange]
  );

  // Handle price range change
  const handlePriceRangeApply = useCallback(() => {
    const min = minPrice ? parseInt(minPrice, 10) : undefined;
    const max = maxPrice ? parseInt(maxPrice, 10) : undefined;

    onFiltersChange({
      ...currentFilters,
      minPrice: min,
      maxPrice: max,
      page: 1,
    });
  }, [minPrice, maxPrice, currentFilters, onFiltersChange]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    onFiltersChange({
      page: 1,
      limit: currentFilters.limit,
    });
    onSearch('');
  }, [currentFilters.limit, onFiltersChange, onSearch]);

  // Check if any filters are active
  const hasActiveFilters =
    currentFilters.category ||
    currentFilters.rarity ||
    currentFilters.minPrice ||
    currentFilters.maxPrice ||
    currentFilters.search;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items..."
          className="input-western w-full pl-10 pr-4"
          disabled={isLoading}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-desert-stone">
          🔍
        </span>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              onSearch('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-desert-stone hover:text-desert-sand"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick Filters Row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={currentFilters.sort || 'time_asc'}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="input-western py-2 px-3 pr-8 text-sm appearance-none cursor-pointer"
            disabled={isLoading}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-desert-stone pointer-events-none">
            ▼
          </span>
        </div>

        {/* Rarity Dropdown */}
        <div className="relative">
          <select
            value={currentFilters.rarity || 'all'}
            onChange={(e) =>
              handleRarityChange(e.target.value === 'all' ? undefined : (e.target.value as ItemRarity))
            }
            className="input-western py-2 px-3 pr-8 text-sm appearance-none cursor-pointer"
            disabled={isLoading}
          >
            {rarityOptions.map((option) => (
              <option key={option.value} value={option.value} className={option.color}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-desert-stone pointer-events-none">
            ▼
          </span>
        </div>

        {/* Expand/Collapse More Filters */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            py-2 px-3 rounded-lg border text-sm font-semibold transition-colors
            ${isExpanded
              ? 'border-gold-light bg-gold-dark/20 text-gold-light'
              : 'border-wood-grain/30 hover:border-gold-light/50 text-desert-sand'
            }
          `}
        >
          {isExpanded ? 'Less Filters' : 'More Filters'}
          <span className="ml-1">{isExpanded ? '▲' : '▼'}</span>
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="py-2 px-3 text-sm text-blood-red hover:text-blood-dark transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="bg-wood-darker/50 rounded-lg p-4 space-y-4 border border-wood-grain/30">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-desert-sand mb-2">
              Price Range
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  min={0}
                  className="input-western w-full text-sm pr-8"
                  disabled={isLoading}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gold-light text-sm">
                  G
                </span>
              </div>
              <span className="text-desert-stone">to</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  min={0}
                  className="input-western w-full text-sm pr-8"
                  disabled={isLoading}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gold-light text-sm">
                  G
                </span>
              </div>
              <button
                onClick={handlePriceRangeApply}
                className="py-2 px-4 bg-gold-dark hover:bg-gold-medium text-wood-dark text-sm font-semibold rounded-lg transition-colors"
                disabled={isLoading}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Quick Price Ranges */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Under 100g', min: undefined, max: 100 },
              { label: '100-500g', min: 100, max: 500 },
              { label: '500-1000g', min: 500, max: 1000 },
              { label: '1000g+', min: 1000, max: undefined },
            ].map(({ label, min, max }) => (
              <button
                key={label}
                onClick={() => {
                  setMinPrice(min?.toString() || '');
                  setMaxPrice(max?.toString() || '');
                  onFiltersChange({
                    ...currentFilters,
                    minPrice: min,
                    maxPrice: max,
                    page: 1,
                  });
                }}
                className={`
                  py-1 px-3 rounded text-xs font-semibold transition-colors
                  ${currentFilters.minPrice === min && currentFilters.maxPrice === max
                    ? 'bg-gold-dark/30 text-gold-light border border-gold-light'
                    : 'bg-wood-dark/50 text-desert-stone hover:text-desert-sand border border-wood-grain/30'
                  }
                `}
                disabled={isLoading}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Sidebar (Horizontal on mobile, Vertical on desktop) */}
      <div className="flex flex-wrap gap-2 lg:gap-1 lg:flex-col lg:w-auto">
        {/* All Categories Button */}
        <button
          onClick={() => handleCategoryChange(undefined)}
          className={`
            flex items-center gap-2 py-2 px-4 rounded-lg border text-sm font-semibold transition-all
            ${!currentFilters.category
              ? 'border-gold-light bg-gold-dark/20 text-gold-light'
              : 'border-wood-grain/30 hover:border-gold-light/50 text-desert-sand'
            }
          `}
          disabled={isLoading}
        >
          <span>📋</span>
          <span>All Categories</span>
        </button>

        {/* Category Buttons */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`
              flex items-center gap-2 py-2 px-4 rounded-lg border text-sm font-semibold transition-all
              ${currentFilters.category === category.id
                ? 'border-gold-light bg-gold-dark/20 text-gold-light'
                : 'border-wood-grain/30 hover:border-gold-light/50 text-desert-sand'
              }
            `}
            disabled={isLoading}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
            {category.count > 0 && (
              <span className="ml-auto text-xs text-desert-stone">
                ({category.count})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Compact version for sidebar display
 */
export const CategorySidebar: React.FC<{
  categories: Category[];
  selectedCategory?: MarketCategory;
  onCategoryChange: (category?: MarketCategory) => void;
  isLoading?: boolean;
}> = ({ categories, selectedCategory, onCategoryChange, isLoading }) => {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-western text-gold-light mb-3 px-2">
        Categories
      </h3>

      {/* All Categories */}
      <button
        onClick={() => onCategoryChange(undefined)}
        className={`
          w-full flex items-center gap-3 py-2 px-3 rounded-lg text-left text-sm transition-all
          ${!selectedCategory
            ? 'bg-gold-dark/20 text-gold-light border-l-2 border-gold-light'
            : 'text-desert-sand hover:bg-wood-darker/50'
          }
        `}
        disabled={isLoading}
      >
        <span>📋</span>
        <span className="flex-1">All Items</span>
      </button>

      {/* Category List */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`
            w-full flex items-center gap-3 py-2 px-3 rounded-lg text-left text-sm transition-all
            ${selectedCategory === category.id
              ? 'bg-gold-dark/20 text-gold-light border-l-2 border-gold-light'
              : 'text-desert-sand hover:bg-wood-darker/50'
            }
          `}
          disabled={isLoading}
        >
          <span>{category.icon}</span>
          <span className="flex-1">{category.name}</span>
          {category.count > 0 && (
            <span className="text-xs text-desert-stone bg-wood-dark px-2 py-0.5 rounded">
              {category.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default MarketFilters;
