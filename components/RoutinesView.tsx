/**
 * @file RoutinesView.tsx
 * This component displays a list of all workout routines that the user has generated.
 * It retrieves routine IDs from localStorage and fetches the full routine data
 * from the API for each ID. It handles loading and error states for the fetch operations.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { getRoutine } from '../services/api';
import type { Routine } from '../types';
import RoutineCard from './RoutineCard';
import Loader from './Loader';

const ROUTINE_IDS_KEY = 'fitness-builder-routines';

interface RoutinesViewProps {
  onStartWorkout: (routine: Routine) => void;
}

const RoutinesView: React.FC<RoutinesViewProps> = ({ onStartWorkout }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all routines by their IDs stored in localStorage.
   */
  const fetchRoutines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const storedIds: string[] = JSON.parse(localStorage.getItem(ROUTINE_IDS_KEY) || '[]');
      if (storedIds.length === 0) {
        setRoutines([]);
        setIsLoading(false);
        return;
      }
      const routinePromises = storedIds.map(id => getRoutine(id));
      const settledRoutines = await Promise.allSettled(routinePromises);
      
      const successfulRoutines = settledRoutines
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<Routine>).value);
        
      setRoutines(successfulRoutines.reverse());

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
      
      {routines.length > 0 ? (
        <div className="space-y-4">
          {routines.map(routine => (
            <RoutineCard key={routine.routine_id} routine={routine} onStartWorkout={onStartWorkout} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-dark-card rounded-lg">
          <h3 className="text-xl font-semibold text-light-text">No routines found.</h3>
          <p className="text-medium-text mt-2">Go to the 'Manage' tab to create your first AI-powered workout routine!</p>
        </div>
      )}
    </div>
  );
};

export default RoutinesView;