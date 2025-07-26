# Changelog

All notable changes to this project will be documented in this file.

## [1.5.0] - 2024-08-01

### Added
- **Automatic Network Detection**: The app now automatically detects which network you're on and uses the appropriate API endpoint.
- **Multi-Network Support**: Added support for localhost, local network, and Tailscale access with automatic switching.
- **Network-Specific Environment Variables**: New environment variables for different network scenarios.

### Changed
- **Constants Configuration**: Updated `constants.ts` to implement automatic network detection based on hostname.
- **Docker Configuration**: Updated Docker files to support the new network-specific environment variables.
- **Environment Guide**: Completely rewrote `ENVIRONMENT.md` to document the new automatic detection system.

### Technical Details
- **Localhost Detection**: When accessing via `localhost` → Uses `VITE_API_BASE_URL_LOCAL`
- **Network Detection**: When accessing via `192.168.x.x` → Uses `VITE_API_BASE_URL_NETWORK`
- **Tailscale Detection**: When accessing via `100.x.x.x` → Uses `VITE_API_BASE_URL_TAILSCALE`
- **Legacy Support**: Still supports the old single environment variable approach for backward compatibility.

## [1.4.0] - 2024-08-01

### Security
- **Removed Hardcoded IP Addresses**: Eliminated hardcoded IP addresses from source code to improve security and deployment flexibility.
- **Environment Variable Configuration**: All API endpoints now configured purely through environment variables.
- **Git Security**: No sensitive network information committed to repository.

### Changed
- **Constants Configuration**: Updated `constants.ts` to use only environment variables with localhost fallback for development.
- **Docker Configuration**: Updated `docker-compose.yml` to use environment variable substitution instead of hardcoded values.
- **Environment Guide**: Completely rewrote `ENVIRONMENT.md` with security best practices and flexible deployment scenarios.

### Added
- **Security Best Practices**: Added comprehensive guide for secure deployment without hardcoded values.
- **Flexible Deployment**: Support for multiple deployment scenarios (local, Tailscale, network, production) through environment variables only.

## [1.3.0] - 2024-08-01

### Fixed
- **Video Loading**: Fixed video loading by configuring environment variables to point to the correct API server IP address (192.168.0.47:8000).
- **Environment Configuration**: Updated `.env.local` with proper API URLs for remote server access.
- **Duplicate Files**: Cleaned up duplicate files with "2" suffixes that were accidentally created during development.

### Added
- **Remote API Support**: Added configuration for accessing API server over network (Tailscale/local network).
- **Environment Variables**: Added `VITE_API_BASE_URL` and `VITE_API_ROOT_URL` to `.env.local` for proper API routing.

## [1.2.0] - 2024-08-01

### Fixed
- **React Hook Error**: Resolved duplicate React instances by removing CDN import map from `index.html`. This was causing "Invalid hook call" errors.
- **API Configuration**: Made API addresses configurable via environment variables for different deployment environments.
- **Tailwind CSS Setup**: Properly installed and configured Tailwind CSS v3 with PostCSS integration. Fixed styles not working by downgrading from v4 to v3.

### Added
- **Environment Configuration**: Added support for `VITE_API_BASE_URL` and `VITE_API_ROOT_URL` environment variables.
- **TypeScript Environment Types**: Added `vite-env.d.ts` for proper TypeScript support of Vite environment variables.
- **Development Logging**: Added console logging of API configuration in development mode.
- **Tailwind CSS Dependencies**: Added `tailwindcss` v3, `postcss`, and `autoprefixer` packages.
- **Tailwind Configuration**: Added `tailwind.config.js` and `postcss.config.js` for proper CSS processing.
- **Docker Support**: Added Dockerfile, docker-compose.yml, and .dockerignore for containerized deployment.
- **Portainer Integration**: Configured for easy deployment through Portainer UI.
- **Video Handling**: Added videoUtils.ts for proper video URL construction and error handling.
- **Tailscale Support**: Added configuration support for Tailscale remote access.
- **Environment Guide**: Created ENVIRONMENT.md with comprehensive deployment scenarios.

### Changed
- **Default API Address**: Changed default API address from hardcoded IP to `localhost:8000` for better development experience.
- **README**: Updated with environment configuration and Docker deployment instructions.
- **CSS Processing**: Updated from CDN Tailwind to proper npm package with PostCSS integration.
- **Port Configuration**: Set container port to 8888 for easy access.
- **Video Error Handling**: Enhanced ExerciseCard with fallback video URLs and error indicators.

## [1.1.0] - 2024-08-01

### Added
- **Search Functionality**: Implemented both keyword and semantic search for exercises in the "Manage" tab. Results are displayed in a clear, readable format.
- **Batch Operations**: Added tools for administrators to perform batch deletions of exercises based on various criteria (fitness level, intensity, name, date).
- **Purge Low-Quality**: Added a feature to easily remove exercises that don't meet specified quality thresholds.
- **Deletion Preview**: Users can now preview which exercises will be deleted by batch operations before confirming, preventing accidental data loss.
- **Centralized CSS**: Migrated from inline Tailwind CSS configuration to a dedicated `index.css` file for better organization and maintainability.
- **API Service Expansion**: Integrated several new backend endpoints for search and batch management into `services/api.ts`, providing full frontend control over the API.
- **New Components**: Created modular components `SearchExercises.tsx` and `BatchOperations.tsx` to encapsulate new functionality and keep the codebase clean.
- **Code Documentation**: Added plain English JSDoc comments to all components, services, and type definitions to improve code clarity and developer experience.

### Changed
- **Manage View Layout**: Reworked the "Manage" tab to a more scalable single-column layout to cleanly accommodate the new search and batch operation panels.
