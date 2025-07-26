/**
 * @file ExerciseCycleView.tsx
 * This component provides a full-screen, swipeable interface for navigating
 * through a list of exercises. It's triggered when a user selects an
 * exercise from the main list. It supports swiping, button navigation, and
 * deleting the currently viewed exercise.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteExercise } from '../services/api';
import type { Exercise } from '../types';
import ExerciseCard from './ExerciseCard';
import Loader from './Loader';
import TrashIcon from './icons/TrashIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

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

  const currentIndex = page % localExercises.length;
  const currentExercise = localExercises[currentIndex];

  useEffect(() => {
    // If external list changes, update local copy
    setLocalExercises(exercises);
  }, [exercises]);

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

  if (!currentExercise) {
    return (
      <div className="text-center">
        <p className="text-medium-text">The exercise list is empty.</p>
        <button onClick={onExit} className="mt-4 px-4 py-2 bg-brand-primary text-dark-bg font-semibold rounded-lg">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
            <button onClick={onExit} className="px-4 py-2 bg-dark-card text-medium-text font-semibold rounded-lg hover:bg-dark-border transition-colors">
            &larr; Back to List
            </button>
            <span className="text-sm text-medium-text">
                {currentIndex + 1} / {localExercises.length}
            </span>
             <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 disabled:opacity-50"
                aria-label="Delete exercise"
                >
                {isDeleting ? <Loader /> : <TrashIcon className="w-5 h-5" />}
            </button>
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
                className="w-full max-w-md h-[600px]"
                >
                <ExerciseCard exercise={currentExercise} />
                </motion.div>
            </AnimatePresence>

            <button className="absolute left-0 z-10 p-2 bg-dark-card/50 rounded-full hover:bg-dark-card" onClick={() => paginate(-1)}>
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button className="absolute right-0 z-10 p-2 bg-dark-card/50 rounded-full hover:bg-dark-card" onClick={() => paginate(1)}>
                <ChevronRightIcon className="w-6 h-6" />
            </button>
        </div>
    </div>
  );
};

export default ExerciseCycleView;
