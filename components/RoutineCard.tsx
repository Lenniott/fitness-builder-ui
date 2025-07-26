/**
 * @file RoutineCard.tsx
 * This component displays a summary of a generated workout routine.
 * It is a collapsible card that shows the user's initial prompt,
 * duration, and intensity. When expanded, it lists all the exercises
 * included in the routine and provides a button to start the workout.
 */
import React, { useState } from 'react';
import type { Routine } from '../types';

interface RoutineCardProps {
  routine: Routine;
  onStartWorkout?: (routine: Routine) => void;
}

const RoutineCard: React.FC<RoutineCardProps> = ({ routine, onStartWorkout }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-dark-card rounded-lg shadow-lg overflow-hidden transition-all duration-300">
      <button 
        className="p-4 cursor-pointer w-full text-left" 
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`routine-details-${routine.routine_id}`}
      >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs text-medium-text uppercase">{routine.intensity_level} Intensity</p>
                <h3 className="text-xl font-bold text-light-text">{routine.user_requirements}</h3>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
                 <p className="text-xs text-medium-text">Duration</p>
                 <p className="text-lg font-semibold text-brand-primary">{Math.round(routine.target_duration / 60)} min</p>
            </div>
        </div>
        <p className="text-xs text-medium-text mt-2">
            {routine.routine.exercises.length} exercises &bull; Created on {new Date(routine.created_at).toLocaleDateString()}
        </p>
      </button>
      
      {isExpanded && (
        <div id={`routine-details-${routine.routine_id}`} className="p-4 border-t border-dark-border">
          <h4 className="font-semibold text-lg mb-2 text-brand-secondary">Exercises in this routine:</h4>
          <ul className="space-y-4 mb-4">
            {routine.routine.exercises.map((ex, index) => (
              <li key={index} className="bg-gray-800 p-3 rounded-md">
                <p className="font-bold text-light-text">{ex.order}. {ex.exercise_name}</p>
                <p className="text-sm text-medium-text mt-1"><span className="font-semibold">Reps:</span> {ex.rounds_reps}</p>
                <p className="text-sm text-medium-text mt-1"><span className="font-semibold">How-to:</span> {ex.how_to}</p>
              </li>
            ))}
          </ul>
          {onStartWorkout && (
            <button
                onClick={() => onStartWorkout(routine)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark-bg bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-primary"
            >
                Start Workout
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RoutineCard;