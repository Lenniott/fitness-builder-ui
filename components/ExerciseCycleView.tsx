/**
 * @file ExerciseCycleView.tsx
 * This component provides a full-screen mobile-first exercise viewing experience
 * with swipe gestures for navigation. It's designed for mobile-first interaction:
 * - Swipe left/right to cycle through exercises
 * - Swipe up to view exercise details
 * - Swipe down to exit exercise view
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteExercise } from '../services/api';
import type { Exercise } from '../types';
import Loader from './Loader';
import TrashIcon from './icons/TrashIcon';
import { 
  getCachedVideoUrl, 
  getFallbackVideoUrl, 
  isVideoCached 
} from '../utils/videoUtils';

interface ExerciseCycleViewProps {
  exercises: Exercise[];
  startIndex: number;
  onExit: () => void;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

const ExerciseCycleView: React.FC<ExerciseCycleViewProps> = ({ exercises, startIndex, onExit }) => {
  const [localExercises, setLocalExercises] = useState(exercises);
  const [[page, direction], setPage] = useState([startIndex, 0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [cacheStatus, setCacheStatus] = useState<'checking' | 'cached' | 'network' | 'error'>('checking');

  const currentIndex = page % localExercises.length;
  const currentExercise = localExercises[currentIndex];

  useEffect(() => {
    // If external list changes, update local copy
    setLocalExercises(exercises);
  }, [exercises]);

  useEffect(() => {
    // Reset details when exercise changes
    setShowDetails(false);
    setVideoError(false);
    setIsLoading(true);
    setCacheStatus('checking');
    
    const loadVideo = async () => {
      try {
        setIsLoading(true);
        setVideoError(false);
        
        // Check if video is cached
        const cached = await isVideoCached(currentExercise.video_path);
        setCacheStatus(cached ? 'cached' : 'network');
        
        // Get cached URL or fallback to network
        const url = await getCachedVideoUrl(currentExercise.video_path);
        setVideoUrl(url);
        
        if (import.meta.env.DEV) {
          console.log(`Video loaded: ${currentExercise.video_path} (${cached ? 'cached' : 'network'})`);
        }
      } catch (error) {
        console.error(`Failed to load video: ${currentExercise.video_path}`, error);
        setVideoError(true);
        setVideoUrl(getFallbackVideoUrl(currentExercise.video_path));
        setCacheStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentExercise) {
      loadVideo();
    }
  }, [currentExercise?.id]);

  const paginate = (newDirection: number) => {
    if (!currentExercise || localExercises.length <= 1) return;
    setPage([page + newDirection, newDirection]);
  };

  const handleDelete = async () => {
    if (!currentExercise) return;
    if (confirm(`Are you sure you want to delete "${currentExercise.exercise_name}"?`)) {
      setIsDeleting(true);
      try {
        await deleteExercise(currentExercise.id);
        const newExercises = localExercises.filter(ex => ex.id !== currentExercise.id);
        if (newExercises.length === 0) {
          onExit();
          return;
        }
        setLocalExercises(newExercises);
        // Adjust page to not go out of bounds
        const newIndex = Math.min(page, newExercises.length - 1);
        setPage([newIndex, 0]);

      } catch (error) {
        console.error("Failed to delete exercise:", error);
        alert("Could not delete the exercise. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleVideoError = () => {
    console.warn(`Video failed to load: ${currentExercise.video_path}`);
    setVideoError(true);
    setVideoUrl(getFallbackVideoUrl(currentExercise.video_path));
    setCacheStatus('error');
  };

  if (!currentExercise) {
    return (
      <div className="fixed inset-0 bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-medium-text">The exercise list is empty.</p>
          <button onClick={onExit} className="mt-4 px-4 py-2 bg-brand-primary text-dark-bg font-semibold rounded-lg">
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Video Background */}
      <div className="absolute inset-0">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
              <p className="text-sm text-white mt-2">Loading video...</p>
            </div>
          </div>
        )}
        
        <video
          key={currentExercise.video_path}
          className="w-full h-full object-cover"
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
          <div className={`absolute top-16 right-4 px-2 py-1 rounded text-xs z-20 ${
            cacheStatus === 'cached' 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            {cacheStatus === 'cached' ? 'Cached' : 'Network'}
          </div>
        )}
        
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-card">
            <div className="text-center">
              <p className="text-white text-lg">Video Unavailable</p>
              <p className="text-medium-text text-sm mt-2">{currentExercise.exercise_name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
          <button 
            onClick={onExit}
            className="px-3 py-2 bg-black/50 text-white rounded-lg backdrop-blur-sm"
          >
            ← Back
          </button>
          
          <div className="text-center">
            <p className="text-white text-sm font-medium">{currentExercise.exercise_name}</p>
            <p className="text-white/70 text-xs">{currentIndex + 1} / {localExercises.length}</p>
          </div>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 bg-red-500/50 text-white rounded-full backdrop-blur-sm disabled:opacity-50"
            aria-label="Delete exercise"
          >
            {isDeleting ? <Loader /> : <TrashIcon className="w-5 h-5" />}
          </button>
        </div>

        {/* Exercise Details Overlay */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-dark-card rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-medium-text rounded-full mx-auto mb-4"></div>
              
              <h2 className="text-2xl font-bold text-light-text mb-4">
                {currentExercise.exercise_name}
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-xs text-medium-text uppercase tracking-wider">Fitness Level</p>
                  <p className="text-lg font-semibold text-light-text">{currentExercise.fitness_level}/10</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-medium-text uppercase tracking-wider">Intensity</p>
                  <p className="text-lg font-semibold text-light-text">{currentExercise.intensity}/10</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-brand-primary mb-2">Sets & Reps</h4>
                  <p className="text-medium-text">{currentExercise.rounds_reps}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-brand-primary mb-2">How-To</h4>
                  <p className="text-medium-text">{currentExercise.how_to}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-brand-primary mb-2">Benefits</h4>
                  <p className="text-medium-text">{currentExercise.benefits}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swipe Instructions */}
        <div className="absolute bottom-4 left-0 right-0 text-center z-10">
          <div className="bg-black/50 text-white/70 text-xs px-4 py-2 rounded-full backdrop-blur-sm mx-auto w-fit">
            Swipe left/right to navigate • Swipe up for details • Swipe down to exit
          </div>
        </div>
      </div>

      {/* Swipe Detection */}
      <motion.div
        className="absolute inset-0 z-30"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, { offset, velocity }) => {
          const swipe = swipePower(offset.y, velocity.y);
          if (swipe > swipeConfidenceThreshold) {
            // Swipe down to exit
            onExit();
          } else if (swipe < -swipeConfidenceThreshold) {
            // Swipe up to show details
            setShowDetails(true);
          }
        }}
      >
        <motion.div
          className="absolute inset-0"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              // Swipe left - next exercise
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              // Swipe right - previous exercise
              paginate(-1);
            }
          }}
        />
      </motion.div>

      {/* Navigation Buttons (for accessibility) */}
      <button 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-black/50 text-white rounded-full backdrop-blur-sm"
        onClick={() => paginate(-1)}
        disabled={currentIndex === 0}
      >
        ←
      </button>
      <button 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-black/50 text-white rounded-full backdrop-blur-sm"
        onClick={() => paginate(1)}
        disabled={currentIndex === localExercises.length - 1}
      >
        →
      </button>
    </div>
  );
};

export default ExerciseCycleView;
