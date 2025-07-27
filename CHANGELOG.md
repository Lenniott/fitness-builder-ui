# Changelog

All notable changes to this project will be documented in this file.

## [1.9.0] - 2024-08-01

### Added
- **New Routine Management System**: Complete overhaul to support user-curated routines instead of AI-generated ones.
- **Story Generation Workflow**: Added multi-step routine creation process with story generation and exercise curation.
- **Semantic Search by IDs**: Updated search functionality to work with new API endpoint that returns exercise IDs only.
- **Bulk Exercise Fetching**: Added support for fetching multiple exercises by their IDs using the new bulk endpoint.
- **Routine CRUD Operations**: Implemented create, read, update, delete operations for user-curated routines.

### Changed
- **CreateRoutineForm**: Completely rewritten to implement the new user-curated workflow:
  - Step 1: Generate exercise requirement stories from user prompt
  - Step 2: Search for relevant exercises using semantic search
  - Step 3: Allow user to curate exercise selection
  - Step 4: Create routine with final exercise list
- **RoutinesView**: Updated to fetch routines from API instead of localStorage, with automatic exercise fetching.
- **RoutineCard**: Redesigned to work with new routine structure (name, description, exercise_ids).
- **RoutineWorkoutView**: Updated to fetch exercises by IDs and handle new routine format.
- **API Service**: Added new endpoints for story generation, semantic search by IDs, routine CRUD, and bulk exercise fetching.
- **Type Definitions**: Updated to support new routine structure and API endpoints.

### Technical Details
- **New API Integration**: Added `generateStories`, `semanticSearchIds`, `createRoutine`, `getRoutines`, `deleteRoutine`, and `getExercisesByIds` functions.
- **Type Safety**: Updated TypeScript interfaces for new routine structure and API payloads.
- **Error Handling**: Enhanced error handling for multi-step workflow and API failures.
- **User Experience**: Improved workflow with clear step-by-step progression and better feedback.

### Removed
- **Legacy AI-Generated Routines**: Removed support for the old AI-generated routine system.
- **LocalStorage Dependencies**: Routines are now managed through the API instead of localStorage.

## [1.8.0] - 2024-08-01

### Fixed
- **Search Functionality**: Fixed data type mismatches in search API responses by adding proper data transformation for UUID and datetime objects.
- **Routine Creation**: Enhanced routine creation to include all required API parameters and proper video clip integration.

### Added
- **Advanced Routine Settings**: Added controls for `exercises_per_story`, `initial_limit`, and `score_threshold` parameters.
- **Video Clip Display**: Routine cards now show connected video clips and metadata from the API response.
- **Enhanced Routine Details**: Added processing time, total exercises count, and better exercise information display.

### Changed
- **Simplified Search**: Removed keyword search option and focused on semantic search which works properly.
- **Better UX**: Added helpful descriptions for advanced settings and improved form layout.
- **Routine Metadata**: Enhanced routine display to show fitness level, intensity badges, and benefits for each exercise.

### Technical Details
- **API Data Transformation**: Added `transformExerciseData` function to handle UUID and datetime object conversion.
- **Complete API Integration**: Routine creation now uses all required parameters from the API specification.
- **Video Integration**: Routines now properly display connected video clips from the database operations metadata.

## [1.7.0] - 2024-08-01

### Fixed
- **Navigation Issue**: Fixed navigation not working when in exercise cycle view - now properly exits cycle when switching tabs.
- **Mobile Swipe**: Improved touch handling for swipe gestures on mobile devices with better drag settings and touch action styles.

### Technical Details
- **Enhanced Navigation**: Added `handleViewChange` function that exits cycle context when navigating to different views.
- **Mobile Touch**: Added `touch-pan-y` class and `touchAction: 'pan-y'` style for better mobile gesture handling.
- **Drag Improvements**: Reduced `dragElastic` from 1 to 0.2 and added `dragTransition` for more responsive swiping.

## [1.6.0] - 2024-08-01

### Added
- **Video Caching System**: Implemented local video caching using IndexedDB for improved performance.
- **Enhanced ExerciseCard**: Redesigned with video-first layout and expandable details.
- **Cache Status Indicators**: Visual indicators show when videos are loaded from cache vs network.

### Changed
- **ExerciseCard Layout**: Video is now the main focus with proper proportions and no cropping.
- **Video Loading**: Videos are automatically cached locally for faster subsequent loads.
- **User Experience**: Clean, expandable interface with "Show More Details" functionality.

### Technical Details
- **IndexedDB Caching**: Videos are stored locally with automatic cleanup and expiry.
- **Performance**: Cached videos load instantly, network videos show loading indicators.
- **Storage Management**: Automatic cache size management (500MB limit with cleanup).
- **Fallback Support**: Graceful fallback to network if caching fails.

## [1.5.0] - 2024-08-01

### Added
- **Search Functionality**: Added keyword and semantic search for exercises with filters.
- **Batch Operations**: Implemented batch deletion and low-quality exercise purging.
- **New Components**: Created SearchExercises, BatchOperations, ExerciseCycleView, and RoutineWorkoutView components.
- **Comprehensive Documentation**: Added JSDoc comments to all components and functions.

### Changed
- **API Integration**: Enhanced services/api.ts with new endpoints for search, batch operations, and health checks.
- **Type Safety**: Extended types.ts with new interfaces for search payloads and batch operations.
- **UI Organization**: Reorganized ManageView to include search and batch operation sections.

### Technical Details
- **Search API**: Integrated both keyword and semantic search with filtering capabilities.
- **Batch Processing**: Added preview functionality before batch deletions.
- **Error Handling**: Improved error handling and user feedback across all operations.
- **Performance**: Optimized API calls with proper error boundaries and loading states.

## [1.4.0] - 2024-08-01

### Added
- **Docker Support**: Complete Dockerization with multi-stage builds and environment variable configuration.
- **Environment Configuration**: Comprehensive setup for local, network, Tailscale, and public domain deployments.
- **Health Checks**: Docker health checks and proper container configuration.
- **Documentation**: Detailed README and ENVIRONMENT.md with deployment instructions.

### Changed
- **Build Process**: Optimized Docker build with proper layer caching and .dockerignore.
- **Environment Variables**: Proper ARG and ENV handling for both build and runtime.
- **Port Configuration**: Standardized on port 8888 for consistency.

### Technical Details
- **Multi-stage Build**: Node.js build stage with nginx/serve runtime for optimal image size.
- **Environment Flexibility**: Support for multiple deployment scenarios with proper fallbacks.
- **Security**: Removed hardcoded IPs in favor of environment variable configuration.

## [1.3.0] - 2024-08-01

### Added
- **Tailwind CSS Integration**: Proper npm package installation and configuration.
- **PostCSS Setup**: Added PostCSS configuration for Tailwind processing.
- **Custom Styling**: Enhanced color scheme and component styling.

### Fixed
- **React Hooks Error**: Resolved duplicate React instances by removing CDN imports.
- **TypeScript Errors**: Added vite-env.d.ts for proper environment variable typing.
- **Build Issues**: Fixed Tailwind CSS version compatibility and configuration.

### Technical Details
- **Styling System**: Migrated from CDN to npm packages for better build optimization.
- **Type Safety**: Added proper TypeScript declarations for Vite environment variables.
- **Build Optimization**: Improved build process with proper dependency management.

## [1.2.0] - 2024-08-01

### Added
- **API Service Layer**: Comprehensive API integration with error handling.
- **Type Safety**: Full TypeScript interfaces for all API requests and responses.
- **Component Structure**: Organized component hierarchy with proper prop interfaces.

### Changed
- **Code Organization**: Separated concerns with dedicated services and types files.
- **Error Handling**: Implemented consistent error handling across all API calls.
- **Documentation**: Added comprehensive JSDoc comments throughout the codebase.

### Technical Details
- **API Integration**: Centralized API communication with proper error boundaries.
- **Type Definitions**: Complete TypeScript interfaces for all data structures.
- **Code Quality**: Improved maintainability with proper separation of concerns.

## [1.1.0] - 2024-08-01

### Added
- **Core Components**: Basic UI components for exercises, routines, and management.
- **Navigation**: Header component with tab-based navigation.
- **Loading States**: Proper loading indicators and error handling.

### Changed
- **Project Structure**: Organized components into logical directories.
- **Styling**: Implemented consistent design system with Tailwind CSS.

### Technical Details
- **Component Architecture**: Modular component design with proper prop interfaces.
- **Responsive Design**: Mobile-first approach with proper breakpoints.
- **Accessibility**: Basic accessibility features and keyboard navigation.

## [1.0.0] - 2024-08-01

### Added
- **Initial Release**: Basic React application structure with Vite build system.
- **Project Setup**: TypeScript configuration and development environment.
- **Basic Styling**: Initial CSS setup with Tailwind CSS integration.

### Technical Details
- **Build System**: Vite for fast development and optimized production builds.
- **TypeScript**: Full TypeScript support with proper configuration.
- **Development Tools**: ESLint, Prettier, and other development utilities.
