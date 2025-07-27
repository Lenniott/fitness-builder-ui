/**
 * @file videoUtils.ts
 * This file contains utility functions for handling video URLs and paths.
 * It handles the conversion between API storage paths and actual file URLs.
 * 
 * Requirements:
 * - Convert storage paths to accessible URLs
 * - Handle different environments (local vs docker)
 * - Support both direct file access and API endpoints
 * - Cache videos locally for improved performance
 * 
 * Flow:
 * - API returns paths like "storage/clips/filename.mp4"
 * - Convert to proper URLs for video playback
 * - Cache videos locally using IndexedDB
 * - Handle different storage configurations
 */

import { API_ROOT_URL } from '../constants';

// Video cache configuration
const CACHE_NAME = 'fitness-video-cache-v1';
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB
const CACHE_EXPIRY_DAYS = 30; // Videos expire after 30 days

/**
 * Video cache interface
 */
interface CachedVideo {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
}

/**
 * Checks if the browser supports IndexedDB
 */
const isIndexedDBSupported = (): boolean => {
  return 'indexedDB' in window;
};

/**
 * Gets the video cache database
 */
const getVideoCache = async (): Promise<IDBDatabase | null> => {
  if (!isIndexedDBSupported()) {
    console.warn('IndexedDB not supported, falling back to network requests');
    return null;
  }

  return new Promise((resolve) => {
    const request = indexedDB.open('FitnessVideoCache', 1);
    
    request.onerror = () => {
      console.error('Failed to open video cache database');
      resolve(null);
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos', { keyPath: 'url' });
      }
    };
  });
};

/**
 * Checks if a video is cached
 */
export const isVideoCached = async (videoPath: string): Promise<boolean> => {
  const db = await getVideoCache();
  if (!db) return false;
  
  return new Promise((resolve) => {
    const transaction = db.transaction(['videos'], 'readonly');
    const store = transaction.objectStore('videos');
    const request = store.get(getVideoUrl(videoPath));
    
    request.onsuccess = () => {
      if (request.result) {
        // Check if cache is expired
        const now = Date.now();
        const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        const isExpired = now - request.result.timestamp > expiryTime;
        
        if (isExpired) {
          // Remove expired cache entry
          deleteCachedVideo(videoPath);
          resolve(false);
        } else {
          resolve(true);
        }
      } else {
        resolve(false);
      }
    };
    
    request.onerror = () => resolve(false);
  });
};

/**
 * Gets a cached video
 */
export const getCachedVideo = async (videoPath: string): Promise<Blob | null> => {
  const db = await getVideoCache();
  if (!db) return null;
  
  return new Promise((resolve) => {
    const transaction = db.transaction(['videos'], 'readonly');
    const store = transaction.objectStore('videos');
    const request = store.get(getVideoUrl(videoPath));
    
    request.onsuccess = () => {
      if (request.result && !isExpired(request.result.timestamp)) {
        resolve(request.result.blob);
      } else {
        resolve(null);
      }
    };
    
    request.onerror = () => resolve(null);
  });
};

/**
 * Caches a video
 */
export const cacheVideo = async (videoPath: string, blob: Blob): Promise<void> => {
  const db = await getVideoCache();
  if (!db) return;
  
  try {
    // Check cache size and clean up if necessary
    await cleanupCache();
    
    const transaction = db.transaction(['videos'], 'readwrite');
    const store = transaction.objectStore('videos');
    
    const cachedVideo: CachedVideo = {
      url: getVideoUrl(videoPath),
      blob,
      timestamp: Date.now(),
      size: blob.size
    };
    
    store.put(cachedVideo);
    
    console.log(`Cached video: ${videoPath} (${(blob.size / 1024 / 1024).toFixed(2)}MB)`);
  } catch (error) {
    console.error('Error caching video:', error);
  }
};

/**
 * Deletes a cached video
 */
export const deleteCachedVideo = async (videoPath: string): Promise<void> => {
  const db = await getVideoCache();
  if (!db) return;
  
  const transaction = db.transaction(['videos'], 'readwrite');
  const store = transaction.objectStore('videos');
  store.delete(getVideoUrl(videoPath));
};

/**
 * Cleans up old cache entries
 */
const cleanupCache = async (): Promise<void> => {
  const db = await getVideoCache();
  if (!db) return;
  
  try {
    const transaction = db.transaction(['videos'], 'readonly');
    const store = transaction.objectStore('videos');
    const request = store.getAll();
    
    request.onsuccess = async () => {
      const entries = request.result as CachedVideo[];
      let totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
      
      // If cache is too large, remove oldest entries
      if (totalSize > MAX_CACHE_SIZE) {
        entries.sort((a, b) => a.timestamp - b.timestamp);
        
        const deleteTransaction = db.transaction(['videos'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('videos');
        
        for (const entry of entries) {
          deleteStore.delete(entry.url);
          totalSize -= entry.size;
          
          if (totalSize <= MAX_CACHE_SIZE * 0.8) { // Leave 20% buffer
            break;
          }
        }
        
        console.log(`Cleaned up cache, new size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
      }
    };
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
};

/**
 * Checks if a timestamp is expired
 */
const isExpired = (timestamp: number): boolean => {
  const now = Date.now();
  const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return now - timestamp > expiryTime;
};

/**
 * Fetches a video with caching
 */
export const fetchVideoWithCache = async (videoPath: string): Promise<Blob> => {
  // Try cache first
  const cached = await getCachedVideo(videoPath);
  if (cached) {
    console.log(`Using cached video: ${videoPath}`);
    return cached;
  }
  
  // Fetch from network
  console.log(`Fetching video from network: ${videoPath}`);
  const url = getVideoUrl(videoPath);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  
  // Cache the video
  await cacheVideo(videoPath, blob);
  
  return blob;
};

/**
 * Converts a storage path to a video URL that can be used in video elements.
 * 
 * @param videoPath - The storage path from the API (e.g., "storage/clips/filename.mp4")
 * @returns The full URL for video playback
 */
export const getVideoUrl = (videoPath: string): string => {
  // Remove any leading slashes and normalize the path
  const normalizedPath = videoPath.replace(/^\/+/, '');
  
  // Construct the full URL
  const fullUrl = `${API_ROOT_URL}/${normalizedPath}`;
  
  // Log the URL construction for debugging
  if (import.meta.env.DEV) {
    console.log(`Video URL constructed:`, {
      originalPath: videoPath,
      normalizedPath,
      apiRoot: API_ROOT_URL,
      fullUrl
    });
  }
  
  return fullUrl;
};

/**
 * Gets a cached video URL or falls back to network
 */
export const getCachedVideoUrl = async (videoPath: string): Promise<string> => {
  try {
    const blob = await fetchVideoWithCache(videoPath);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn(`Failed to get cached video: ${videoPath}`, error);
    return getVideoUrl(videoPath);
  }
};

/**
 * Checks if a video URL is accessible by making a HEAD request.
 * 
 * @param videoPath - The storage path from the API
 * @returns Promise<boolean> - True if the video is accessible
 */
export const isVideoAccessible = async (videoPath: string): Promise<boolean> => {
  try {
    const url = getVideoUrl(videoPath);
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn(`Video not accessible: ${videoPath}`, error);
    return false;
  }
};

/**
 * Gets a fallback video URL or placeholder for inaccessible videos.
 * 
 * @param videoPath - The original video path
 * @returns A fallback URL or data URL for placeholder
 */
export const getFallbackVideoUrl = (videoPath: string): string => {
  // Return a placeholder video or error state
  return 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAGhtZGF0AAACmwYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjkyMSA3YzVmYjQ2IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcWw9MCBkZWJsb2NrY3FsPTAgY3FsbWluZGFjdD0wIGxvY2tpbmd3aWR0aD0yNjUgbG9ja2hlaWdodD0yMCBkaXJlY3Q9MSB3aWR0aD0xOTIgY3JvcF90b3A9MCB0b3A9MCBsZWZ0PTAgY3JvcF9sZWZ0PTAgY3JvcF9yaWdodD0wIHJpZ2h0PTAgY3JvcF9ib3R0b209MCBib3R0b209MCB2dWNfY3FsPTAgbWV4dHJhPTAgY3JvcF9oZWlnaHQ9MCBjaHJvbWFfcXVhbnQ9MCBxdWFudD0wIGZpbGVzaXplPTAgd2VpZ2h0PTE=';
};

/**
 * Creates a video element with proper error handling and caching.
 * 
 * @param videoPath - The storage path from the API
 * @param onError - Callback for video loading errors
 * @returns Video element props
 */
export const createVideoProps = (videoPath: string, onError?: () => void) => {
  const videoUrl = getVideoUrl(videoPath);
  
  return {
    src: videoUrl,
    onError: () => {
      console.warn(`Failed to load video: ${videoPath}`);
      onError?.();
    },
    onLoadStart: () => {
      console.log(`Loading video: ${videoPath}`);
    }
  };
};

/**
 * Clears all cached videos
 */
export const clearVideoCache = async (): Promise<void> => {
  if (!isIndexedDBSupported()) return;
  
  try {
    const db = await getVideoCache();
    if (db) {
      const transaction = db.transaction(['videos'], 'readwrite');
      const store = transaction.objectStore('videos');
      store.clear();
      console.log('Video cache cleared');
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Gets cache statistics
 */
export const getCacheStats = async (): Promise<{
  totalSize: number;
  entryCount: number;
  isSupported: boolean;
}> => {
  if (!isIndexedDBSupported()) {
    return { totalSize: 0, entryCount: 0, isSupported: false };
  }
  
  try {
    const db = await getVideoCache();
    if (!db) return { totalSize: 0, entryCount: 0, isSupported: true };
    
    const transaction = db.transaction(['videos'], 'readonly');
    const store = transaction.objectStore('videos');
    const request = store.getAll();
    
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const entries = request.result as CachedVideo[];
        const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
        
        resolve({
          totalSize,
          entryCount: entries.length,
          isSupported: true
        });
      };
      
      request.onerror = () => {
        resolve({ totalSize: 0, entryCount: 0, isSupported: true });
      };
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { totalSize: 0, entryCount: 0, isSupported: true };
  }
}; 