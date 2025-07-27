/**
 * @file types.ts
 * This file contains all the TypeScript interfaces and type definitions
 * used across the application. It ensures data consistency between the
 * frontend and the backend API.
 */

/**
 * Represents a single exercise entity, including its metadata and AI-generated content.
 */
export interface Exercise {
  id: string;
  exercise_name: string;
  video_path: string;
  start_time: number;
  end_time: number;
  how_to: string;
  benefits: string;
  counteracts: string;
  fitness_level: number;
  rounds_reps: string;
  intensity: number;
  qdrant_id: string;
  created_at: string;
}

/**
 * Represents a generated story for exercise requirements.
 */
export interface ExerciseStory {
  story: string;
}

/**
 * Response from story generation endpoint.
 */
export interface StoryGenerationResponse {
  stories: string[];
}

/**
 * Response from semantic search by IDs endpoint.
 */
export interface SemanticSearchIdsResponse {
  exercise_ids: string[];
  total_found: number;
}

/**
 * Payload for story generation.
 */
export interface StoryGenerationPayload {
  user_prompt: string;
  story_count: number;
}

/**
 * Payload for semantic search by IDs.
 */
export interface SemanticSearchIdsPayload {
  query: string;
  limit: number;
}

/**
 * Represents a user-curated routine.
 */
export interface Routine {
  routine_id: string;
  name: string;
  description: string;
  exercise_ids: string[];
  created_at: string;
}

/**
 * Payload for creating a routine.
 */
export interface CreateRoutinePayload {
  name: string;
  description: string;
  exercise_ids: string[];
}

/**
 * Payload for processing a video from a URL.
 */
export interface ProcessVideoPayload {
    url: string;
    background?: boolean;
}

/**
 * Represents a single clip processed from a larger video.
 */
export interface ProcessedClip {
  exercise_name: string;
  video_path: string;
  start_time: number;
  end_time: number;
}

/**
 * API response for an asynchronous video processing job.
 */
export interface AsyncProcessResponse {
  success: true;
  processed_clips: [];
  total_clips: 0;
  processing_time: 0.0;
  temp_dir: null;
  job_id: string;
}

/**
 * API response for a synchronous video processing job.
 */
export interface SyncProcessResponse {
    success: boolean;
    processed_clips: ProcessedClip[];
    total_clips: number;
    processing_time: number;
    temp_dir: string;
}

export type ProcessResponse = AsyncProcessResponse | SyncProcessResponse;

/**
 * Represents the status of a background job.
 */
export interface JobStatus {
    status: 'in_progress' | 'done' | 'failed';
    result: SyncProcessResponse | { error: string } | null;
}

/**
 * Defines the possible views/pages in the application.
 */
export type View = 'exercises' | 'routines' | 'manage';

/**
 * Payload for keyword-based exercise search.
 */
export interface SearchPayload {
  query?: string;
  fitness_level_min?: number;
  fitness_level_max?: number;
  intensity_min?: number;
  intensity_max?: number;
  limit?: number;
}

/**
 * Payload for semantic exercise search.
 */
export interface SemanticSearchPayload {
  query: string;
  limit?: number;
  score_threshold?: number;
}

/**
 * Payload for bulk exercise fetching.
 */
export interface BulkExercisePayload {
  exercise_ids: string[];
}

/**
 * Parameters for batch deleting exercises based on criteria.
 */
export interface BatchDeleteParams {
    fitness_level_min?: number;
    fitness_level_max?: number;
    intensity_min?: number;
    intensity_max?: number;
    exercise_name_pattern?: string;
    created_before?: string;
    created_after?: string;
}

/**
 * Parameters for purging low-quality exercises.
 */
export interface PurgeParams {
    fitness_level_threshold?: number;
    intensity_threshold?: number;
    name_patterns?: string; // Comma-separated
}

/**
 * API response for a deletion preview, which is an array of exercises.
 */
export type DeletionPreviewResponse = Exercise[];

/**
 * API response for a successful deletion operation.
 */
export interface DeletionResult {
    detail: string;
    deleted_count: number;
}

/**
 * Context for the exercise cycle view, containing the list of exercises and the starting point.
 */
export type ExerciseCycleContext = {
  type: 'exercise';
  exercises: Exercise[];
  startIndex: number;
};

/**
 * Context for the routine workout view, containing the routine to be performed.
 */
export type RoutineCycleContext = {
  type: 'routine';
  routine: Routine;
};

/**
 * Union type representing the context for any full-screen "cycle" or "workout" view.
 * If null, a main list view is shown.
 */
export type CycleContext = ExerciseCycleContext | RoutineCycleContext | null;
