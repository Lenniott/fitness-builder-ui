/**
 * @file CacheManager.tsx
 * This component provides cache management functionality for the Fitness Builder UI.
 * It allows users to view cache statistics, clear the cache, and manage storage.
 * 
 * Features:
 * - Display cache statistics (size, entry count)
 * - Clear all cached videos
 * - Show cache status and performance metrics
 * - Automatic cache cleanup
 */

import React, { useState, useEffect } from 'react';
import { getCacheStats, clearVideoCache } from '../utils/videoCache';

interface CacheStats {
  totalSize: number;
  entryCount: number;
  isSupported: boolean;
}

const CacheManager: React.FC = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const cacheStats = await getCacheStats();
      setStats(cacheStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cache stats');
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached videos? This will free up storage space but videos will need to be re-downloaded.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await clearVideoCache();
      await loadStats(); // Reload stats after clearing
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cache');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!stats) {
    return (
      <div className="bg-dark-card rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-light-text mb-4">Video Cache</h3>
        <div className="text-center text-medium-text">Loading cache statistics...</div>
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-light-text mb-4">Video Cache</h3>
      
      {!stats.isSupported && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            Video caching is not supported in this browser. Videos will load from the network each time.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">Error: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <p className="text-xs text-medium-text uppercase tracking-wider">Cached Videos</p>
          <p className="text-lg font-semibold text-light-text">{stats.entryCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-medium-text uppercase tracking-wider">Cache Size</p>
          <p className="text-lg font-semibold text-light-text">{formatBytes(stats.totalSize)}</p>
        </div>
      </div>

      <div className="space-y-3 text-sm text-medium-text">
        <p>
          <span className="font-semibold text-brand-primary">How it works:</span> Videos are automatically cached locally to improve loading performance. 
          Cached videos load instantly on subsequent views.
        </p>
        <p>
          <span className="font-semibold text-brand-primary">Storage:</span> Videos are stored in your browser's local storage and automatically cleaned up when space is needed.
        </p>
        <p>
          <span className="font-semibold text-brand-primary">Privacy:</span> All cached data is stored locally on your device and is not shared with any servers.
        </p>
      </div>

      <button
        onClick={handleClearCache}
        disabled={isLoading || stats.entryCount === 0}
        className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark-bg bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Clearing...' : 'Clear All Cached Videos'}
      </button>
    </div>
  );
};

export default CacheManager; 