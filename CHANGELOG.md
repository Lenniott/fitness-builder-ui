# Changelog

All notable changes to this project will be documented in this file.

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

### Changed
- **Default API Address**: Changed default API address from hardcoded IP to `localhost:8000` for better development experience.
- **README**: Updated with environment configuration and Docker deployment instructions.
- **CSS Processing**: Updated from CDN Tailwind to proper npm package with PostCSS integration.
- **Port Configuration**: Set container port to 8888 for easy access.

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
