/**
 * @file api.ts
 * This file contains all the functions for making requests to the Fitness Builder backend API.
 * Each function corresponds to a specific API endpoint and handles the request, response, and errors.
 * It uses the types defined in `types.ts` to ensure type safety.
 */
import { API_BASE_URL } from '../constants';
import type { 
    Exercise, 
    Routine, 
    ProcessVideoPayload, 
    ProcessResponse, 
    JobStatus,
    SearchPayload,
    SemanticSearchPayload,
    BatchDeleteParams,
    PurgeParams,
    DeletionPreviewResponse,
    DeletionResult,
    StoryGenerationPayload,
    StoryGenerationResponse,
    SemanticSearchIdsPayload,
    SemanticSearchIdsResponse,
    CreateRoutinePayload,
    BulkExercisePayload
} from '../types';

/**
 * A generic handler for processing API responses.
 * It checks for HTTP errors and parses the JSON response.
 * @param response The raw Response object from a fetch call.
 * @returns The parsed JSON data.
 * @throws An error with a message from the API if the response is not ok.
 */
const handleResponse = async <T,>(response: Response): Promise<T> => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'An unknown error occurred.' }));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

/**
 * Fetches a list of all exercises with pagination.
 */
export const getExercises = async (limit: number = 50, offset: number = 0): Promise<Exercise[]> => {
    const response = await fetch(`${API_BASE_URL}/exercises?limit=${limit}&offset=${offset}`);
    return handleResponse<Exercise[]>(response);
};

/**
 * Deletes a single exercise by its ID.
 */
export const deleteExercise = async (exerciseId: string): Promise<{ detail: string }> => {
    const response = await fetch(`${API_BASE_URL}/exercises/${exerciseId}`, {
        method: 'DELETE',
    });
    // This endpoint might return a simple success message, let's adjust the handler if needed or ensure it returns JSON
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to delete' }));
        throw new Error(error.detail);
    }
    if (response.status === 204) return { detail: 'Exercise deleted successfully' }; // Handle 204 No Content
    return response.json();
};

/**
 * Generates exercise requirement stories from user prompt.
 */
export const generateStories = async (payload: StoryGenerationPayload): Promise<StoryGenerationResponse> => {
    const response = await fetch(`${API_BASE_URL}/stories/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse<StoryGenerationResponse>(response);
};

/**
 * Searches for exercises using semantic search and returns only IDs.
 */
export const semanticSearchIds = async (payload: SemanticSearchIdsPayload): Promise<SemanticSearchIdsResponse> => {
    const response = await fetch(`${API_BASE_URL}/exercises/semantic-search-ids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse<SemanticSearchIdsResponse>(response);
};

/**
 * Creates a new routine with exercise IDs.
 */
export const createRoutine = async (payload: CreateRoutinePayload): Promise<Routine> => {
    const response = await fetch(`${API_BASE_URL}/routines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse<Routine>(response);
};

/**
 * Fetches all routines.
 */
export const getRoutines = async (limit: number = 50): Promise<Routine[]> => {
    const response = await fetch(`${API_BASE_URL}/routines?limit=${limit}`);
    return handleResponse<Routine[]>(response);
};

/**
 * Retrieves a specific routine by its ID.
 */
export const getRoutine = async (routineId: string): Promise<Routine> => {
    const response = await fetch(`${API_BASE_URL}/routines/${routineId}`);
    return handleResponse<Routine>(response);
};

/**
 * Deletes a routine by its ID.
 */
export const deleteRoutine = async (routineId: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/routines/${routineId}`, {
        method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
};

/**
 * Fetches multiple exercises by their IDs.
 */
export const getExercisesByIds = async (payload: BulkExercisePayload): Promise<Exercise[]> => {
    const response = await fetch(`${API_BASE_URL}/exercises/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse<Exercise[]>(response);
};



/**
 * Submits a video URL for processing into exercises.
 */
export const processVideoUrl = async (payload: ProcessVideoPayload): Promise<ProcessResponse> => {
    const response = await fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse<ProcessResponse>(response);
};

/**
 * Checks the status of a background processing job.
 */
export const getJobStatus = async (jobId: string): Promise<JobStatus> => {
    const response = await fetch(`${API_BASE_URL}/job-status/${jobId}`);
    return handleResponse<JobStatus>(response);
};

// --- New API Functions ---

/**
 * Searches for exercises using keywords and filters.
 */
export const searchExercises = async (payload: SearchPayload): Promise<Exercise[]> => {
    const response = await fetch(`${API_BASE_URL}/exercises/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse<Exercise[]>(response);
}

/**
 * Performs a semantic search for exercises based on a natural language query.
 */
export const semanticSearchExercises = async (payload: SemanticSearchPayload): Promise<Exercise[]> => {
    const response = await fetch(`${API_BASE_URL}/exercises/semantic-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse<Exercise[]>(response);
}

/**
 * Builds a query string from an object of parameters.
 * @param params The object of query parameters.
 * @returns A URL-encoded query string.
 */
const buildQueryString = (params: Record<string, any>): string => {
    const usp = new URLSearchParams();
    for (const key in params) {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            usp.append(key, params[key]);
        }
    }
    return usp.toString();
}

/**
 * Previews which exercises would be deleted based on a set of criteria.
 */
export const previewDeletion = async(params: BatchDeleteParams): Promise<DeletionPreviewResponse> => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/exercises/deletion-preview?${queryString}`);
    return handleResponse<DeletionPreviewResponse>(response);
}

/**
 * Deletes a batch of exercises matching the given criteria.
 */
export const batchDeleteExercises = async(params: BatchDeleteParams): Promise<DeletionResult> => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/exercises/batch?${queryString}`, {
        method: 'DELETE',
    });
    return handleResponse<DeletionResult>(response);
}

/**
 * Deletes exercises that are considered "low quality" based on thresholds.
 */
export const purgeLowQualityExercises = async(params: PurgeParams): Promise<DeletionResult> => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/exercises/purge-low-quality?${queryString}`, {
        method: 'DELETE',
    });
    return handleResponse<DeletionResult>(response);
}