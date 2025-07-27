/**
 * @file RoutineWorkoutView.tsx
 * This component provides a focused "workout mode" for a specific routine.
 * It allows the user to cycle through the exercises of the routine one by one,
 * displaying instructional details for each.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExercisesByIds } from '../services/api';
import type { Routine, Exercise } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import Loader from './Loader';

interface RoutineWorkoutViewProps {
  routine: Routine;
  onExit: () => void;
}

// A simple card for displaying exercise instructions within a routine.
const RoutineExerciseCard: React.FC<{ exercise: Exercise }> = ({ exercise }) => (
    <div className="w-full h-full bg-dark-card rounded-xl shadow-lg p-6 flex flex-col justify-between">
        <div className="overflow-y-auto">
            <h2 className="text-3xl font-bold text-light-text mt-1 mb-4">{exercise.exercise_name}</h2>
            <div className="space-y-4 text-medium-text">
                 <div>
                    <h4 className="font-semibold text-brand-primary">Sets & Reps</h4>
                    <p>{exercise.rounds_reps}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-brand-primary">How-To</h4>
                    <p>{exercise.how_to}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-brand-primary">Benefits</h4>
                    <p>{exercise.benefits}</p>
                </div>
            </div>
        </div>
         <div className="mt-4 text-center text-xs text-medium-text">
            Fitness Level: {exercise.fitness_level}/10 &bull; Intensity: {exercise.intensity}/10
        </div>
    </div>
);

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

const RoutineWorkoutView: React.FC<RoutineWorkoutViewProps> = ({ routine, onExit }) => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validates if a string is a proper UUID format
   */
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Fetch exercises for the routine
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        // Filter out invalid UUIDs to prevent API errors
        const validExerciseIds = routine.exercise_ids.filter(isValidUUID);
        
        if (validExerciseIds.length === 0) {
          console.warn(`Routine ${routine.routine_id} has no valid exercise IDs`);
          setExercises([]);
          setIsLoading(false);
          return;
        }

        const exerciseData = await getExercisesByIds({ exercise_ids: validExerciseIds });
        setExercises(exerciseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exercises.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [routine.exercise_ids]);

  if (isLoading) {
    return <Loader text="Loading workout..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Workout</h3>
          <p className="text-medium-text mb-4">{error}</p>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-dark-card text-medium-text font-semibold rounded-lg hover:bg-dark-border transition-colors"
          >
            &larr; Back to Routines
          </button>
        </div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-medium-text mb-2">No Exercises Found</h3>
          <p className="text-medium-text mb-4">This routine doesn't have any valid exercises.</p>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-dark-card text-medium-text font-semibold rounded-lg hover:bg-dark-border transition-colors"
          >
            &larr; Back to Routines
          </button>
        </div>
      </div>
    );
  }

  const currentIndex = page % exercises.length;
  const currentExercise = exercises[currentIndex];

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onExit} className="px-4 py-2 bg-dark-card text-medium-text font-semibold rounded-lg hover:bg-dark-border transition-colors">
          &larr; End Workout
        </button>
        <div className="text-center">
            <h2 className="font-bold text-xl">{routine.name}</h2>
            <p className="text-sm text-medium-text">
                Exercise {currentIndex + 1} of {exercises.length}
            </p>
        </div>
        <div className="w-24"></div> {/* Spacer */}
      </div>
      
      <div className="relative flex-grow flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="w-full max-w-2xl h-[600px]"
          >
            <RoutineExerciseCard exercise={currentExercise} />
          </motion.div>
        </AnimatePresence>

        <button 
            className="absolute left-0 z-10 p-2 bg-dark-card/50 rounded-full hover:bg-dark-card disabled:opacity-30" 
            onClick={() => paginate(-1)}
            disabled={currentIndex === 0}
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button 
            className="absolute right-0 z-10 p-2 bg-dark-card/50 rounded-full hover:bg-dark-card disabled:opacity-30" 
            onClick={() => paginate(1)}
            disabled={currentIndex === exercises.length - 1}
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default RoutineWorkoutView;
