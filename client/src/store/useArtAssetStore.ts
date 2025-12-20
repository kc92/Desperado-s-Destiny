/**
 * Art Asset Store
 * Manages state for the AI Art Asset Dashboard
 * Uses IndexedDB for images (large data) and localStorage for metadata
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ArtAsset,
  AssetStatus,
  AssetPriority,
  ALL_ASSETS,
  ASSET_CATEGORIES,
} from '@/data/artAssets';
import { saveImage, deleteImage, loadAllImages } from '@/utils/imageStorage';

const STORAGE_KEY = 'desperados-art-assets-meta';

interface AssetUpdate {
  status?: AssetStatus;
  uploadedImage?: string;
  notes?: string;
}

// Metadata stored in localStorage (no image data)
interface AssetMetadata {
  id: string;
  status: AssetStatus;
  notes?: string;
  hasImage: boolean;
}

interface ArtAssetState {
  // State
  assets: ArtAsset[];
  selectedCategory: string | null;
  selectedAssetId: string | null;
  searchQuery: string;
  filterPriority: AssetPriority | 'all';
  filterStatus: AssetStatus | 'all';
  isLoading: boolean;
  imagesLoaded: boolean;

  // Computed
  categories: typeof ASSET_CATEGORIES;

  // Actions
  initializeImages: () => Promise<void>;
  selectCategory: (categoryId: string | null) => void;
  selectAsset: (assetId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterPriority: (priority: AssetPriority | 'all') => void;
  setFilterStatus: (status: AssetStatus | 'all') => void;
  updateAsset: (assetId: string, updates: AssetUpdate) => void;
  uploadImage: (assetId: string, imageData: string) => Promise<void>;
  removeImage: (assetId: string) => Promise<void>;
  markAsIntegrated: (assetId: string) => void;
  resetAsset: (assetId: string) => Promise<void>;
  getFilteredAssets: () => ArtAsset[];
  getSelectedAsset: () => ArtAsset | null;
  getCategoryProgress: (categoryId: string) => {
    total: number;
    pending: number;
    uploaded: number;
    integrated: number;
    percentage: number;
  };
  getTotalProgress: () => {
    total: number;
    pending: number;
    uploaded: number;
    integrated: number;
    percentage: number;
  };
  exportData: () => string;
  importData: (jsonData: string) => Promise<boolean>;
}

export const useArtAssetStore = create<ArtAssetState>()(
  persist(
    (set, get) => ({
      // Initial state - merge stored updates with base assets
      assets: ALL_ASSETS,
      selectedCategory: null,
      selectedAssetId: null,
      searchQuery: '',
      filterPriority: 'all',
      filterStatus: 'all',
      isLoading: false,
      imagesLoaded: false,
      categories: ASSET_CATEGORIES,

      // Load images from IndexedDB on app start
      initializeImages: async () => {
        if (get().imagesLoaded) return;

        // Clean up old localStorage data that may have caused quota issues
        try {
          localStorage.removeItem('desperados-art-assets');
        } catch {
          // Ignore cleanup errors
        }

        console.log('[ArtAssetStore] Loading images from IndexedDB...');
        set({ isLoading: true });

        try {
          const imageMap = await loadAllImages();

          set((state) => ({
            assets: state.assets.map((asset) => {
              const imageData = imageMap.get(asset.id);
              if (imageData) {
                return { ...asset, uploadedImage: imageData };
              }
              return asset;
            }),
            isLoading: false,
            imagesLoaded: true,
          }));

          console.log('[ArtAssetStore] Loaded', imageMap.size, 'images');
        } catch (error) {
          console.error('[ArtAssetStore] Failed to load images:', error);
          set({ isLoading: false, imagesLoaded: true });
        }
      },

      selectCategory: (categoryId) => {
        set({
          selectedCategory: categoryId,
          selectedAssetId: null,
        });
      },

      selectAsset: (assetId) => {
        set({ selectedAssetId: assetId });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      setFilterPriority: (priority) => {
        set({ filterPriority: priority });
      },

      setFilterStatus: (status) => {
        set({ filterStatus: status });
      },

      updateAsset: (assetId, updates) => {
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.id === assetId ? { ...asset, ...updates } : asset
          ),
        }));
      },

      uploadImage: async (assetId, imageData) => {
        console.log('[ArtAssetStore] uploadImage called:', {
          assetId,
          imageDataLength: imageData?.length,
        });

        try {
          // Save to IndexedDB first
          await saveImage(assetId, imageData);
          console.log('[ArtAssetStore] Image saved to IndexedDB');

          // Update state
          set((state) => ({
            assets: state.assets.map((asset) =>
              asset.id === assetId
                ? { ...asset, uploadedImage: imageData, status: 'uploaded' as AssetStatus }
                : asset
            ),
          }));

          console.log('[ArtAssetStore] State updated');
        } catch (error) {
          console.error('[ArtAssetStore] Failed to save image:', error);
          throw error;
        }
      },

      removeImage: async (assetId) => {
        try {
          await deleteImage(assetId);
          set((state) => ({
            assets: state.assets.map((asset) =>
              asset.id === assetId
                ? { ...asset, uploadedImage: undefined, status: 'pending' as AssetStatus }
                : asset
            ),
          }));
        } catch (error) {
          console.error('[ArtAssetStore] Failed to delete image:', error);
        }
      },

      markAsIntegrated: (assetId) => {
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.id === assetId
              ? { ...asset, status: 'integrated' as AssetStatus }
              : asset
          ),
        }));
      },

      resetAsset: async (assetId) => {
        const originalAsset = ALL_ASSETS.find((a) => a.id === assetId);
        if (originalAsset) {
          try {
            await deleteImage(assetId);
          } catch {
            // Ignore delete errors
          }
          set((state) => ({
            assets: state.assets.map((asset) =>
              asset.id === assetId ? { ...originalAsset } : asset
            ),
          }));
        }
      },

      getFilteredAssets: () => {
        const { assets, selectedCategory, searchQuery, filterPriority, filterStatus } = get();

        let filtered = assets;

        // Filter by category
        if (selectedCategory) {
          filtered = filtered.filter((asset) => asset.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (asset) =>
              asset.name.toLowerCase().includes(query) ||
              asset.prompt.toLowerCase().includes(query) ||
              (asset.subcategory && asset.subcategory.toLowerCase().includes(query))
          );
        }

        // Filter by priority
        if (filterPriority !== 'all') {
          filtered = filtered.filter((asset) => asset.priority === filterPriority);
        }

        // Filter by status
        if (filterStatus !== 'all') {
          filtered = filtered.filter((asset) => asset.status === filterStatus);
        }

        return filtered;
      },

      getSelectedAsset: () => {
        const { assets, selectedAssetId } = get();
        return assets.find((a) => a.id === selectedAssetId) || null;
      },

      getCategoryProgress: (categoryId) => {
        const { assets } = get();
        const categoryAssets = assets.filter((a) => a.category === categoryId);
        const total = categoryAssets.length;
        const pending = categoryAssets.filter((a) => a.status === 'pending').length;
        const uploaded = categoryAssets.filter((a) => a.status === 'uploaded').length;
        const integrated = categoryAssets.filter((a) => a.status === 'integrated').length;
        const completed = uploaded + integrated;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, pending, uploaded, integrated, percentage };
      },

      getTotalProgress: () => {
        const { assets } = get();
        const total = assets.length;
        const pending = assets.filter((a) => a.status === 'pending').length;
        const uploaded = assets.filter((a) => a.status === 'uploaded').length;
        const integrated = assets.filter((a) => a.status === 'integrated').length;
        const completed = uploaded + integrated;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, pending, uploaded, integrated, percentage };
      },

      exportData: () => {
        const { assets } = get();
        // Only export assets that have been modified (uploaded or have notes)
        const modifiedAssets = assets.filter(
          (a) => a.status !== 'pending' || a.uploadedImage || a.notes
        );
        return JSON.stringify(modifiedAssets, null, 2);
      },

      importData: async (jsonData) => {
        try {
          const importedAssets: ArtAsset[] = JSON.parse(jsonData);

          // Save images to IndexedDB
          for (const imported of importedAssets) {
            if (imported.uploadedImage) {
              await saveImage(imported.id, imported.uploadedImage);
            }
          }

          set((state) => ({
            assets: state.assets.map((asset) => {
              const imported = importedAssets.find((ia) => ia.id === asset.id);
              return imported ? { ...asset, ...imported } : asset;
            }),
          }));
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: STORAGE_KEY,
      // Only persist metadata, NOT image data
      partialize: (state) => ({
        // Store only metadata for modified assets
        assetMetadata: state.assets
          .filter((a) => a.status !== 'pending' || a.notes)
          .map((a) => ({
            id: a.id,
            status: a.status,
            notes: a.notes,
            hasImage: !!a.uploadedImage,
          })),
        selectedCategory: state.selectedCategory,
      }),
      merge: (persistedState: any, currentState) => {
        // Merge persisted metadata with fresh asset data
        const metadata: AssetMetadata[] = persistedState?.assetMetadata || [];
        const mergedAssets = currentState.assets.map((asset) => {
          const meta = metadata.find((m) => m.id === asset.id);
          if (meta) {
            return {
              ...asset,
              status: meta.status,
              notes: meta.notes,
              // Image will be loaded separately from IndexedDB
            };
          }
          return asset;
        });

        return {
          ...currentState,
          selectedCategory: persistedState?.selectedCategory ?? null,
          assets: mergedAssets,
        };
      },
    }
  )
);
