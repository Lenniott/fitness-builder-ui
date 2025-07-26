/**
 * @file videoUtils.ts
 * This file contains utility functions for handling video URLs and paths.
 * It handles the conversion between API storage paths and actual file URLs.
 * 
 * Requirements:
 * - Convert storage paths to accessible URLs
 * - Handle different environments (local vs docker)
 * - Support both direct file access and API endpoints
 * 
 * Flow:
 * - API returns paths like "storage/clips/filename.mp4"
 * - Convert to proper URLs for video playback
 * - Handle different storage configurations
 */

import { API_ROOT_URL } from '../constants';

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
 * Creates a video element with proper error handling.
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