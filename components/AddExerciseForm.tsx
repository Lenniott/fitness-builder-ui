/**
 * @file AddExerciseForm.tsx
 * This component provides a form for users to submit a video URL
 * (e.g., from YouTube, Instagram) to be processed by the backend.
 * The backend extracts exercises from the video. This component handles
 * both synchronous and asynchronous (background job) responses,
 * polling for job status when necessary.
 */
import React, { useState, useEffect } from 'react';
import { processVideoUrl, getJobStatus } from '../services/api';
import type { ProcessedClip, JobStatus, SyncProcessResponse } from '../types';
import Loader from './Loader';

const AddExerciseForm: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [processedClips, setProcessedClips] = useState<ProcessedClip[]>([]);

  // Effect to poll for the status of a background job.
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const status = await getJobStatus(jobId);
        setJobStatus(status);
        if (status.status === 'done' || status.status === 'failed') {
          clearInterval(interval);
          setJobId(null);
          setIsLoading(false);
          if (status.status === 'done' && status.result) {
            setProcessedClips((status.result as SyncProcessResponse).processed_clips);
          }
          if (status.status === 'failed' && status.result) {
             setError((status.result as {error: string}).error);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error polling job status.');
        clearInterval(interval);
        setIsLoading(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId]);

  /**
   * Handles the form submission to process the video URL.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setProcessedClips([]);
    setJobStatus(null);
    setJobId(null);

    try {
      const response = await processVideoUrl({ url, background: true });
      if ('job_id' in response) {
        setJobId(response.job_id);
      } else {
        setProcessedClips(response.processed_clips);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
    }
  };
  
  /**
   * Resets the form to its initial state.
   */
  const resetForm = () => {
      setUrl('');
      setIsLoading(false);
      setError(null);
      setJobId(null);
      setJobStatus(null);
      setProcessedClips([]);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-medium-text">
          Video URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          required
          className="mt-1 block w-full bg-gray-800 border border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark-bg bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-primary disabled:bg-gray-500"
      >
        {isLoading ? 'Processing...' : 'Process Video'}
      </button>

      {isLoading && jobStatus?.status === 'in_progress' && <Loader text="Processing video in background..." />}
      {error && <p className="text-red-400 text-sm">Error: {error}</p>}
      
      {processedClips.length > 0 && (
          <div className="mt-4">
              <h4 className="font-semibold text-green-400">Successfully processed {processedClips.length} clips!</h4>
              <ul className="list-disc list-inside text-medium-text mt-2">
                  {processedClips.map(clip => <li key={clip.video_path}>{clip.exercise_name}</li>)}
              </ul>
              <button type="button" onClick={resetForm} className="text-brand-primary mt-2 text-sm">Add another video</button>
          </div>
      )}
    </form>
  );
};

export default AddExerciseForm;