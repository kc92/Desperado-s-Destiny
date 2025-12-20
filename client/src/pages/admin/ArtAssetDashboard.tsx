/**
 * Art Asset Dashboard
 * AI Art Generation Planning and Upload Dashboard
 *
 * Features:
 * - Browse all identified art asset opportunities by category
 * - View AI generation prompts for each asset
 * - Upload generated images for later integration
 * - Track progress across all categories
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useArtAssetStore } from '@/store/useArtAssetStore';
import { ArtAsset, AssetPriority, AssetStatus, STYLE_PREFIXES, GEMINI_STYLES, CARD_BG_SUFFIX } from '@/data/artAssets';

// Prompt source type
type PromptSource = 'zimage' | 'gemini';

// Convert base64 data URL to blob
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Priority badge colors
const PRIORITY_COLORS: Record<AssetPriority, string> = {
  high: 'bg-blood-red/80 text-white',
  medium: 'bg-gold-dark/80 text-white',
  low: 'bg-wood-medium/80 text-desert-sand',
};

// Status badge colors
const STATUS_COLORS: Record<AssetStatus, string> = {
  pending: 'bg-desert-stone/50 text-desert-sand',
  uploaded: 'bg-green-700/80 text-white',
  integrated: 'bg-blue-700/80 text-white',
};

const STATUS_ICONS: Record<AssetStatus, string> = {
  pending: '⏳',
  uploaded: '✅',
  integrated: '🔗',
};

export const ArtAssetDashboard: React.FC = () => {
  const {
    assets,
    categories,
    selectedCategory,
    selectedAssetId,
    searchQuery,
    filterPriority,
    filterStatus,
    isLoading,
    imagesLoaded,
    initializeImages,
    selectCategory,
    selectAsset,
    setSearchQuery,
    setFilterPriority,
    setFilterStatus,
    getFilteredAssets,
    getSelectedAsset,
    getCategoryProgress,
    getTotalProgress,
    uploadImage,
    removeImage,
    markAsIntegrated,
    updateAsset,
    exportData,
    importData,
  } = useArtAssetStore();

  // Load images from IndexedDB on mount
  useEffect(() => {
    initializeImages();
  }, [initializeImages]);

  const [showStyleGuide, setShowStyleGuide] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [autoSaveFolder, setAutoSaveFolder] = useState<FileSystemDirectoryHandle | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [promptSource, setPromptSource] = useState<PromptSource>('gemini'); // Default to Gemini
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the appropriate prompt based on selected source
  const getPromptForAsset = useCallback((asset: ArtAsset): string => {
    if (promptSource === 'gemini' && asset.geminiPrompt) {
      return asset.geminiPrompt;
    }
    return asset.prompt;
  }, [promptSource]);

  // Pick a folder for auto-saving
  const handlePickFolder = useCallback(async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const handle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
        });
        setAutoSaveFolder(handle);
        setAutoSaveEnabled(true);
        alert(`Auto-save enabled! Images will save to: ${handle.name}`);
      } else {
        alert('Your browser does not support folder selection. Use Chrome or Edge.');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Failed to pick folder:', error);
      }
    }
  }, []);

  // Auto-save image to the selected folder
  const autoSaveToFolder = useCallback(async (assetId: string, imageData: string) => {
    if (!autoSaveFolder || !autoSaveEnabled) return;

    try {
      const fileName = `${assetId}.png`;
      const fileHandle = await autoSaveFolder.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      const blob = dataURLtoBlob(imageData);
      await writable.write(blob);
      await writable.close();
      console.log(`[AutoSave] Saved ${fileName} to folder`);
    } catch (error) {
      console.error('[AutoSave] Failed to save:', error);
    }
  }, [autoSaveFolder, autoSaveEnabled]);

  const filteredAssets = getFilteredAssets();
  const selectedAsset = getSelectedAsset();
  const totalProgress = getTotalProgress();

  // Handle image upload
  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !selectedAssetId) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          await uploadImage(selectedAssetId, base64);
        } catch (error) {
          console.error('Failed to upload image:', error);
          alert('Failed to save image. Please try again.');
        }
      };
      reader.readAsDataURL(file);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [selectedAssetId, uploadImage]
  );

  // Save image to disk using File System Access API
  const handleSaveToDisk = useCallback(async () => {
    if (!selectedAsset?.uploadedImage) return;

    try {
      // Check if File System Access API is supported
      if ('showSaveFilePicker' in window) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: `${selectedAsset.id}.png`,
          types: [{
            description: 'PNG Image',
            accept: { 'image/png': ['.png'] },
          }],
        });
        const writable = await handle.createWritable();
        const blob = dataURLtoBlob(selectedAsset.uploadedImage);
        await writable.write(blob);
        await writable.close();
        alert('Image saved successfully!');
      } else {
        // Fallback: download the file
        const a = document.createElement('a');
        a.href = selectedAsset.uploadedImage;
        a.download = `${selectedAsset.id}.png`;
        a.click();
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Failed to save:', error);
        alert('Failed to save image.');
      }
    }
  }, [selectedAsset]);

  // Copy prompt to clipboard
  const copyPrompt = useCallback((prompt: string, assetId: string) => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopiedPrompt(assetId);
      setTimeout(() => setCopiedPrompt(null), 2000);
    });
  }, []);

  // Handle export
  const handleExport = useCallback(() => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `art-assets-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportData]);

  // Handle import
  const handleImport = useCallback(async () => {
    const success = await importData(importText);
    if (success) {
      setShowImportModal(false);
      setImportText('');
      alert('Data imported successfully!');
    } else {
      alert('Failed to import data. Please check the JSON format.');
    }
  }, [importText, importData]);

  return (
    <div className="min-h-screen bg-wood-darker">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-wood-dark rounded-lg p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-gold-light border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gold-light font-western text-lg">Loading Images...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-wood-dark border-b-2 border-wood-grain/30 px-6 py-4">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-western text-gold-light">
                Art Asset Dashboard
              </h1>
              <p className="text-desert-stone text-sm mt-1">
                AI Art Generation Planning & Upload Center
              </p>
            </div>

            {/* Total Progress */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-desert-stone text-sm">Total Progress</p>
                <p className="text-2xl font-western text-gold-light">
                  {totalProgress.percentage}%
                </p>
                <p className="text-xs text-desert-stone">
                  {totalProgress.uploaded + totalProgress.integrated} / {totalProgress.total} assets
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-48">
                <div className="h-4 bg-wood-medium rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-500"
                    style={{ width: `${totalProgress.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-desert-stone mt-1">
                  <span>{totalProgress.pending} pending</span>
                  <span>{totalProgress.uploaded} uploaded</span>
                  <span>{totalProgress.integrated} integrated</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 items-center">
                {/* Auto-save folder indicator */}
                <button
                  onClick={handlePickFolder}
                  className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                    autoSaveEnabled
                      ? 'bg-green-700 hover:bg-green-600 text-white'
                      : 'bg-gold-dark hover:bg-gold-medium text-wood-dark'
                  }`}
                >
                  <span>📁</span>
                  {autoSaveEnabled ? `Auto-save: ${autoSaveFolder?.name}` : 'Set Output Folder'}
                </button>
                <button
                  onClick={() => setShowStyleGuide(true)}
                  className="px-4 py-2 bg-wood-medium hover:bg-wood-light text-desert-sand rounded-lg text-sm"
                >
                  Style Guide
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-wood-medium hover:bg-wood-light text-desert-sand rounded-lg text-sm"
                >
                  Export
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 bg-wood-medium hover:bg-wood-light text-desert-sand rounded-lg text-sm"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto p-6">
        <div className="flex gap-6">
          {/* Category Sidebar */}
          <aside className="w-72 flex-shrink-0">
            <div className="bg-wood-dark rounded-lg border border-wood-grain/30 overflow-hidden">
              <div className="p-4 border-b border-wood-grain/30">
                <h2 className="font-western text-gold-light text-lg">Categories</h2>
              </div>

              <div className="p-2">
                {/* All Assets */}
                <button
                  onClick={() => selectCategory(null)}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
                    selectedCategory === null
                      ? 'bg-gold-dark/30 text-gold-light'
                      : 'text-desert-sand hover:bg-wood-medium/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span>📁</span>
                      <span>All Assets</span>
                    </span>
                    <span className="text-sm text-desert-stone">{assets.length}</span>
                  </div>
                </button>

                {/* Category List */}
                {categories.map((category) => {
                  const progress = getCategoryProgress(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => selectCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-gold-dark/30 text-gold-light'
                          : 'text-desert-sand hover:bg-wood-medium/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span className="text-sm">{category.name}</span>
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${PRIORITY_COLORS[category.priority]}`}
                        >
                          {category.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-wood-medium rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold-light transition-all duration-300"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-desert-stone">
                          {progress.uploaded + progress.integrated}/{progress.total}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Filters */}
            <div className="bg-wood-dark rounded-lg border border-wood-grain/30 p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search assets..."
                    className="w-full px-4 py-2 bg-wood-medium border border-wood-grain/30 rounded-lg text-desert-sand placeholder-desert-stone/50 focus:outline-none focus:border-gold-dark"
                  />
                </div>

                {/* Priority Filter */}
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as AssetPriority | 'all')}
                  className="px-4 py-2 bg-wood-medium border border-wood-grain/30 rounded-lg text-desert-sand focus:outline-none focus:border-gold-dark"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as AssetStatus | 'all')}
                  className="px-4 py-2 bg-wood-medium border border-wood-grain/30 rounded-lg text-desert-sand focus:outline-none focus:border-gold-dark"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="uploaded">Uploaded</option>
                  <option value="integrated">Integrated</option>
                </select>
              </div>

              <p className="text-sm text-desert-stone mt-3">
                Showing {filteredAssets.length} assets
                {selectedCategory && ` in ${categories.find((c) => c.id === selectedCategory)?.name}`}
              </p>
            </div>

            {/* Asset Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  isSelected={selectedAssetId === asset.id}
                  onSelect={() => selectAsset(asset.id)}
                  copiedPrompt={copiedPrompt}
                  onCopyPrompt={copyPrompt}
                  getPrompt={getPromptForAsset}
                />
              ))}
            </div>

            {filteredAssets.length === 0 && (
              <div className="text-center py-12 text-desert-stone">
                <p className="text-4xl mb-4">🏜️</p>
                <p>No assets match your filters</p>
              </div>
            )}
          </main>

          {/* Detail Panel */}
          {selectedAsset && (
            <aside className="w-96 flex-shrink-0">
              <div className="bg-wood-dark rounded-lg border border-wood-grain/30 overflow-hidden sticky top-6">
                {/* Asset Image Preview */}
                <div className="aspect-square bg-wood-medium relative">
                  {selectedAsset.uploadedImage ? (
                    <img
                      src={selectedAsset.uploadedImage}
                      alt={selectedAsset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-desert-stone">
                      <div className="text-center">
                        <p className="text-6xl mb-4">🖼️</p>
                        <p className="text-sm">No image uploaded</p>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm ${
                      STATUS_COLORS[selectedAsset.status]
                    }`}
                  >
                    {STATUS_ICONS[selectedAsset.status]} {selectedAsset.status}
                  </div>
                </div>

                {/* Asset Details */}
                <div className="p-4">
                  <h3 className="font-western text-xl text-gold-light mb-1">
                    {selectedAsset.name}
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        PRIORITY_COLORS[selectedAsset.priority]
                      }`}
                    >
                      {selectedAsset.priority}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-wood-medium text-desert-sand">
                      {selectedAsset.difficulty}
                    </span>
                    {selectedAsset.subcategory && (
                      <span className="text-xs px-2 py-0.5 rounded bg-wood-medium text-desert-sand">
                        {selectedAsset.subcategory}
                      </span>
                    )}
                  </div>

                  {/* Prompt Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-desert-sand">
                        AI Prompt
                      </label>
                      <div className="flex items-center gap-2">
                        {/* Prompt Source Toggle */}
                        <div className="flex text-xs rounded overflow-hidden border border-wood-grain/30">
                          <button
                            onClick={() => setPromptSource('gemini')}
                            className={`px-2 py-1 transition-colors ${
                              promptSource === 'gemini'
                                ? 'bg-green-700 text-white'
                                : 'bg-wood-medium text-desert-sand hover:bg-wood-light'
                            }`}
                            title="Gemini Nano Banana - supports negative constraints"
                          >
                            🍌 Gemini
                          </button>
                          <button
                            onClick={() => setPromptSource('zimage')}
                            className={`px-2 py-1 transition-colors ${
                              promptSource === 'zimage'
                                ? 'bg-blue-700 text-white'
                                : 'bg-wood-medium text-desert-sand hover:bg-wood-light'
                            }`}
                            title="Z Image Turbo - fast but no negative prompts"
                          >
                            ⚡ Z-Image
                          </button>
                        </div>
                        <button
                          onClick={() => copyPrompt(getPromptForAsset(selectedAsset), selectedAsset.id)}
                          className="text-xs px-3 py-1 bg-gold-dark/50 hover:bg-gold-dark text-gold-light rounded transition-colors"
                        >
                          {copiedPrompt === selectedAsset.id ? '✓ Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    {/* Show indicator if Gemini prompt available */}
                    {promptSource === 'gemini' && selectedAsset.geminiPrompt && (
                      <p className="text-xs text-green-400 mb-1">
                        ✓ Gemini-optimized prompt with negative constraints
                      </p>
                    )}
                    {promptSource === 'gemini' && !selectedAsset.geminiPrompt && (
                      <p className="text-xs text-yellow-500 mb-1">
                        ⚠ No Gemini prompt - using default
                      </p>
                    )}
                    <div className="bg-wood-medium rounded-lg p-3 text-sm text-desert-sand max-h-40 overflow-y-auto">
                      {getPromptForAsset(selectedAsset)}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-desert-sand block mb-2">
                      Notes
                    </label>
                    <textarea
                      value={selectedAsset.notes || ''}
                      onChange={(e) =>
                        updateAsset(selectedAsset.id, { notes: e.target.value })
                      }
                      placeholder="Add notes about this asset..."
                      className="w-full px-3 py-2 bg-wood-medium border border-wood-grain/30 rounded-lg text-desert-sand placeholder-desert-stone/50 focus:outline-none focus:border-gold-dark resize-none h-20 text-sm"
                    />
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {/* Upload Button */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 bg-gold-dark hover:bg-gold-medium text-wood-dark rounded-lg font-semibold transition-colors"
                    >
                      {selectedAsset.uploadedImage ? 'Replace Image' : 'Upload Image'}
                    </button>

                    {selectedAsset.uploadedImage && (
                      <>
                        {/* Save to Disk button */}
                        <button
                          onClick={handleSaveToDisk}
                          className="w-full py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <span>💾</span> Save to Disk
                        </button>

                        {autoSaveEnabled && (
                          <p className="text-xs text-green-400 text-center mt-1">
                            Auto-saving to: {autoSaveFolder?.name}
                          </p>
                        )}

                        {selectedAsset.status === 'uploaded' && (
                          <button
                            onClick={() => markAsIntegrated(selectedAsset.id)}
                            className="w-full py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                          >
                            Mark as Integrated
                          </button>
                        )}
                        <button
                          onClick={() => removeImage(selectedAsset.id)}
                          className="w-full py-2 bg-blood-red/50 hover:bg-blood-red text-white rounded-lg text-sm transition-colors"
                        >
                          Remove Image
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Style Guide Modal */}
      {showStyleGuide && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-wood-dark rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-wood-grain/30 flex justify-between items-center sticky top-0 bg-wood-dark">
              <h2 className="text-2xl font-western text-gold-light">Style Guide</h2>
              <button
                onClick={() => setShowStyleGuide(false)}
                className="text-desert-stone hover:text-gold-light text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-western text-gold-light mb-3">Target Aesthetic</h3>
                <p className="text-desert-sand">
                  Vintage Western movie poster / pulp novel illustration style with bold lines,
                  rich saturated colors, dramatic lighting, and a hand-painted look.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-western text-gold-light mb-3">🍌 Gemini Nano Banana Style Prefixes</h3>
                <p className="text-sm text-green-400 mb-3">Narrative format - supports negative constraints like "Do not include..."</p>
                <div className="space-y-3 mb-6">
                  {Object.entries(GEMINI_STYLES).map(([key, value]) => (
                    <div key={`gemini-${key}`} className="bg-wood-medium rounded-lg p-4 border-l-4 border-green-600">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gold-light capitalize">🍌 {key}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(value);
                            alert('Copied!');
                          }}
                          className="text-xs px-2 py-1 bg-green-700 text-white rounded hover:bg-green-600"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-sm text-desert-sand">{value}</p>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-western text-gold-light mb-3">⚡ Z Image Turbo Style Prefixes</h3>
                <p className="text-sm text-blue-400 mb-3">Keyword format - fast but ignores negative prompts</p>
                <div className="space-y-3">
                  {Object.entries(STYLE_PREFIXES).map(([key, value]) => (
                    <div key={`zimage-${key}`} className="bg-wood-medium rounded-lg p-4 border-l-4 border-blue-600">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gold-light capitalize">⚡ {key}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(value);
                            alert('Copied!');
                          }}
                          className="text-xs px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-600"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-sm text-desert-sand">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-western text-gold-light mb-3">Color Palette</h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'Leather Brown', color: '#8B4513' },
                    { name: 'Dusty Sand', color: '#D2B48C' },
                    { name: 'Aged Gold', color: '#DAA520' },
                    { name: 'Blood Red', color: '#8B0000' },
                    { name: 'Canyon Orange', color: '#D2691E' },
                    { name: 'Night Blue', color: '#191970' },
                    { name: 'Sage Green', color: '#9CAF88' },
                    { name: 'Sunset Pink', color: '#E8B4B8' },
                  ].map((c) => (
                    <div key={c.name} className="text-center">
                      <div
                        className="w-full aspect-square rounded-lg mb-2"
                        style={{ backgroundColor: c.color }}
                      />
                      <p className="text-xs text-desert-sand">{c.name}</p>
                      <p className="text-xs text-desert-stone">{c.color}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-western text-gold-light mb-3">Consistency Tips</h3>
                <ul className="text-desert-sand space-y-2 text-sm list-disc list-inside">
                  <li>Generate 3-5 "anchor" images first to establish your style</li>
                  <li>Batch similar assets together (all NPCs, all animals, etc.)</li>
                  <li>Use "golden hour" or "warm afternoon light" for cohesion</li>
                  <li>Apply consistent color grading filter in post-processing</li>
                  <li>Generate at 1024x1024 or higher, scale down for icons</li>
                  <li>Document prompts that produce good results</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-wood-dark rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-wood-grain/30 flex justify-between items-center">
              <h2 className="text-xl font-western text-gold-light">Import Data</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-desert-stone hover:text-gold-light text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <p className="text-desert-sand text-sm mb-4">
                Paste your exported JSON data below to restore your progress.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste JSON data here..."
                className="w-full h-64 px-4 py-3 bg-wood-medium border border-wood-grain/30 rounded-lg text-desert-sand placeholder-desert-stone/50 focus:outline-none focus:border-gold-dark font-mono text-sm"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleImport}
                  className="flex-1 py-3 bg-gold-dark hover:bg-gold-medium text-wood-dark rounded-lg font-semibold"
                >
                  Import
                </button>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-6 py-3 bg-wood-medium hover:bg-wood-light text-desert-sand rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Asset Card Component
interface AssetCardProps {
  asset: ArtAsset;
  isSelected: boolean;
  onSelect: () => void;
  copiedPrompt: string | null;
  onCopyPrompt: (prompt: string, assetId: string) => void;
  getPrompt: (asset: ArtAsset) => string;
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  isSelected,
  onSelect,
  copiedPrompt,
  onCopyPrompt,
  getPrompt,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`bg-wood-dark rounded-lg border-2 overflow-hidden cursor-pointer transition-all hover:border-gold-dark ${
        isSelected ? 'border-gold-light ring-2 ring-gold-light/30' : 'border-wood-grain/30'
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-wood-medium relative">
        {asset.uploadedImage ? (
          <img
            src={asset.uploadedImage}
            alt={asset.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-desert-stone/30">
            <span className="text-5xl">🖼️</span>
          </div>
        )}

        {/* Status indicator */}
        <div
          className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
            asset.status === 'pending'
              ? 'bg-desert-stone'
              : asset.status === 'uploaded'
              ? 'bg-green-500'
              : 'bg-blue-500'
          }`}
          title={asset.status}
        />

        {/* Priority indicator */}
        <div
          className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs ${
            PRIORITY_COLORS[asset.priority]
          }`}
        >
          {asset.priority}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h4 className="font-semibold text-desert-sand text-sm truncate mb-1">
          {asset.name}
        </h4>
        {asset.subcategory && (
          <p className="text-xs text-desert-stone truncate">{asset.subcategory}</p>
        )}

        {/* Quick copy button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopyPrompt(getPrompt(asset), asset.id);
          }}
          className="mt-2 w-full text-xs py-1.5 bg-wood-medium hover:bg-wood-light text-desert-sand rounded transition-colors"
        >
          {copiedPrompt === asset.id ? '✓ Copied!' : 'Copy Prompt'}
        </button>
        {/* Gemini indicator */}
        {asset.geminiPrompt && (
          <div className="mt-1 text-xs text-green-400 text-center">🍌</div>
        )}
      </div>
    </div>
  );
};

export default ArtAssetDashboard;
