/**
 * @file ExerciseCard.tsx
 * This component renders a detailed card for a single exercise.
 * It includes a video player, exercise name, and key stats like
 * fitness level and intensity, along with instructional text.
 * It is designed to be used in the swiping interface of ExercisesView.
 * 
 * Features:
 * - Local video caching for improved performance
 * - Automatic cache management
 * - Fallback handling for failed loads
 * - Video-focused design with proper proportions
 */
import React, { useState, useEffect } from 'react';
import type { Exercise } from '../types';
import { 
  getVideoUrl, 
  getFallbackVideoUrl, 
  getCachedVideoUrl,
  isVideoCached 
} from '../utils/videoUtils';

interface ExerciseCardProps {
  exercise: Exercise;
}

/**
 * A small component to display a single statistic with a label.
 */
const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="text-center">
    <p className="text-xs text-medium-text uppercase tracking-wider">{label}</p>
    <p className="text-lg font-semibold text-light-text">{value}</p>
  </div>
);

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const [videoError, setVideoError] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [cacheStatus, setCacheStatus] = useState<'checking' | 'cached' | 'network' | 'error'>('checking');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setIsLoading(true);
        setVideoError(false);
        
        // Check if video is cached
        const cached = await isVideoCached(exercise.video_path);
        setCacheStatus(cached ? 'cached' : 'network');
        
        // Get cached URL or fallback to network
        const url = await getCachedVideoUrl(exercise.video_path);
        setVideoUrl(url);
        
        if (import.meta.env.DEV) {
          console.log(`Video loaded: ${exercise.video_path} (${cached ? 'cached' : 'network'})`);
        }
      } catch (error) {
        console.error(`Failed to load video: ${exercise.video_path}`, error);
        setVideoError(true);
        setVideoUrl(getFallbackVideoUrl(exercise.video_path));
        setCacheStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [exercise.video_path]);

  const handleVideoError = () => {
    console.warn(`Video failed to load: ${exercise.video_path}`);
    setVideoError(true);
    setVideoUrl(getFallbackVideoUrl(exercise.video_path));
    setCacheStatus('error');
  };

  return (
    <div className="w-full h-full bg-dark-card rounded-xl shadow-lg flex flex-col">
      {/* Video Section - Main Focus */}
      <div className="relative flex-1 min-h-0">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-card z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
              <p className="text-sm text-medium-text mt-2">Loading video...</p>
            </div>
          </div>
        )}
        
        <video
          key={exercise.video_path}
          className="w-full h-full object-contain bg-black"
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          onError={handleVideoError}
          onLoadStart={() => setIsLoading(false)}
        />
        
        {/* Cache status indicator */}
        {!isLoading && cacheStatus !== 'error' && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs z-20 ${
            cacheStatus === 'cached' 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            {cacheStatus === 'cached' ? 'Cached' : 'Network'}
          </div>
        )}
        
        {videoError && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs z-20">
            Video Unavailable
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 bg-dark-card">
        {/* Title and Stats */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-light-text mb-3">
            {exercise.exercise_name}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Fitness Level" value={`${exercise.fitness_level}/10`} />
            <Stat label="Intensity" value={`${exercise.intensity}/10`} />
          </div>
        </div>

        {/* Quick Info */}
        <div className="space-y-2 text-sm">
          <div>
            <h4 className="font-semibold text-brand-primary">Sets & Reps</h4>
            <p className="text-medium-text">{exercise.rounds_reps}</p>
          </div>
        </div>

        {/* Expandable Details */}
        <div className="mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-brand-primary text-sm font-medium hover:text-opacity-80 transition-colors"
          >
            {showDetails ? 'Show Less' : 'Show More Details'}
          </button>
          
          {showDetails && (
            <div className="mt-3 space-y-3 text-sm border-t border-dark-border pt-3">
              <div>
                <h4 className="font-semibold text-brand-primary">How-To</h4>
                <p className="text-medium-text">{exercise.how_to}</p>
              </div>
              <div>
                <h4 className="font-semibold text-brand-primary">Benefits</h4>
                <p className="text-medium-text">{exercise.benefits}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;