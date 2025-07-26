/**
 * @file constants.ts
 * This file exports constant values used throughout the application,
 * such as API endpoints. This centralizes configuration and makes it
 * easy to update.
 */

// Environment-based API configuration
const getApiConfig = () => {
  // Check for environment variables first (for production/docker)
  if (import.meta.env.VITE_API_BASE_URL) {
    return {
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      rootUrl: import.meta.env.VITE_API_ROOT_URL || import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
    };
  }
  
  // Development defaults
  return {
    baseUrl: 'http://localhost:8000/api/v1',
    rootUrl: 'http://localhost:8000'
  };
};

const apiConfig = getApiConfig();

/**
 * The base URL for the versioned API endpoints (e.g., /api/v1).
 */
export const API_BASE_URL = apiConfig.baseUrl;

/**
 * The root URL of the API server, used for accessing static assets like videos.
 */
export const API_ROOT_URL = apiConfig.rootUrl;

// Log the API configuration in development
if (import.meta.env.DEV) {
  console.log('API Configuration:', { API_BASE_URL, API_ROOT_URL });
}