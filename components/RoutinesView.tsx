/**
 * @file RoutinesView.tsx
 * This component displays a list of all workout routines that the user has created.
 * It fetches routines from the API and displays them with their associated exercises.
 * It handles loading and error states for the fetch operations.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { getRoutines, getExercisesByIds } from '../services/api';
import type { Routine, Exercise } from '../types';
import RoutineCard from './RoutineCard';
import Loader from './Loader';

interface RoutinesViewProps {
  onStartWorkout: (routine: Routine) => void;
}

const RoutinesView: React.FC<RoutinesViewProps> = ({ onStartWorkout }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routinesWithExercises, setRoutinesWithExercises] = useState<(Routine & { exercises: Exercise[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validates if a string is a proper UUID format
   */
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  /**
   * Fetches all routines and their associated exercises.
   */
  const fetchRoutines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const routines = await getRoutines();
      setRoutines(routines);

      // Fetch exercises for each routine, filtering out invalid exercise IDs
      const routinesWithExercisesData = await Promise.all(
        routines.map(async (routine) => {
          try {
            // Filter out invalid UUIDs to prevent API errors
            const validExerciseIds = routine.exercise_ids.filter(isValidUUID);
            
            if (validExerciseIds.length === 0) {
              console.warn(`Routine ${routine.routine_id} has no valid exercise IDs`);
              return { ...routine, exercises: [] };
            }

            const exercises = await getExercisesByIds({ exercise_ids: validExerciseIds });
            return { ...routine, exercises };
          } catch (err) {
            console.error(`Failed to fetch exercises for routine ${routine.routine_id}:`, err);
            return { ...routine, exercises: [] };
          }
        })
      );

      setRoutinesWithExercises(routinesWithExercisesData);

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch routines.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  if (isLoading) return <Loader text="Loading your routines..." />;
  
  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Your Routines</h2>
      {error && <p className="text-center text-red-400 my-4">Error: {error}</p>}
      
      {routinesWithExercises.length > 0 ? (
        <div className="space-y-4">
          {routinesWithExercises.map(routine => (
            <RoutineCard 
              key={routine.routine_id} 
              routine={routine} 
              exercises={routine.exercises}
              onStartWorkout={onStartWorkout} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-dark-card rounded-lg">
          <h3 className="text-xl font-semibold text-light-text">No routines found.</h3>
          <p className="text-medium-text mt-2">Go to the 'Manage' tab to create your first workout routine!</p>
        </div>
      )}
    </div>
  );
};

export default RoutinesView;