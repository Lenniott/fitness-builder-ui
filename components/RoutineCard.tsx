/**
 * @file RoutineCard.tsx
 * This component displays a summary of a user-curated workout routine.
 * It is a collapsible card that shows the routine name, description,
 * and associated exercises. When expanded, it lists all the exercises
 * included in the routine and provides a button to start the workout.
 */
import React, { useState } from 'react';
import type { Routine, Exercise } from '../types';

interface RoutineCardProps {
  routine: Routine;
  exercises: Exercise[];
  onStartWorkout?: (routine: Routine) => void;
}

const RoutineCard: React.FC<RoutineCardProps> = ({ routine, exercises, onStartWorkout }) => {
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
                <h3 className="text-xl font-bold text-light-text">{routine.name}</h3>
                {routine.description && (
                  <p className="text-sm text-medium-text mt-1">{routine.description}</p>
                )}
            </div>
            <div className="text-right flex-shrink-0 ml-4">
                 <p className="text-xs text-medium-text">Exercises</p>
                 <p className="text-lg font-semibold text-brand-primary">{routine.exercise_ids.length}</p>
            </div>
        </div>
        <p className="text-xs text-medium-text mt-2">
            Created on {new Date(routine.created_at).toLocaleDateString()}
        </p>
      </button>
      
      {isExpanded && (
        <div id={`routine-details-${routine.routine_id}`} className="p-4 border-t border-dark-border">
          <div className="mb-4">
            <h4 className="font-semibold text-lg mb-2 text-brand-secondary">Routine Details:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-medium-text">Total Exercises:</p>
                <p className="text-light-text font-semibold">{routine.exercise_ids.length}</p>
              </div>
              <div>
                <p className="text-medium-text">Created:</p>
                <p className="text-light-text font-semibold">{new Date(routine.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <h4 className="font-semibold text-lg mb-2 text-brand-secondary">Exercises in this routine:</h4>
          {exercises.length > 0 ? (
            <ul className="space-y-4 mb-4">
              {exercises.map((exercise, index) => (
                <li key={exercise.id} className="bg-gray-800 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-light-text">{index + 1}. {exercise.exercise_name}</p>
                    <div className="text-xs text-medium-text">
                      <span className="bg-brand-primary text-dark-bg px-2 py-1 rounded">Lvl {exercise.fitness_level}</span>
                      <span className="bg-brand-secondary text-dark-bg px-2 py-1 rounded ml-1">Int {exercise.intensity}</span>
                    </div>
                  </div>
                  <p className="text-sm text-medium-text mb-2"><span className="font-semibold">Reps:</span> {exercise.rounds_reps}</p>
                  <p className="text-sm text-medium-text mb-2"><span className="font-semibold">How-to:</span> {exercise.how_to}</p>
                  <p className="text-sm text-medium-text"><span className="font-semibold">Benefits:</span> {exercise.benefits}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-medium-text">
              <p>No exercises found for this routine.</p>
            </div>
          )}

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