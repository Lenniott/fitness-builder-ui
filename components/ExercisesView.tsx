/**
 * @file ExercisesView.tsx
 * This component provides the main interface for browsing exercises.
 * It displays them in a searchable list. Clicking an exercise opens a
 * detailed "cycle" view where the user can swipe through all exercises
 * in the current list.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { getExercises, searchExercises } from '../services/api';
import type { Exercise } from '../types';
import Loader from './Loader';
import ArrowPathIcon from './icons/ArrowPathIcon';

interface ExercisesViewProps {
  onSelectExercise: (exercises: Exercise[], startIndex: number) => void;
}

const ExercisesView: React.FC<ExercisesViewProps> = ({ onSelectExercise }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  /**
   * Fetches the default list of exercises or clears the current search.
   */
  const fetchDefaultExercises = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSearchQuery('');
    setActiveSearch('');
    try {
      const data = await getExercises(100, 0); // Load more by default
      setExercises(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch exercises.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handles the search submission to filter exercises.
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchDefaultExercises();
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const payload = { query: searchQuery, limit: 100 };
      const data = await searchExercises(payload);
      setExercises(data);
      setActiveSearch(searchQuery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch exercises on initial component mount.
  useEffect(() => {
    fetchDefaultExercises();
  }, [fetchDefaultExercises]);

  return (
    <div className="flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Exercise Library</h2>
        <p className="text-medium-text mt-1">
          {activeSearch ? `Showing results for "${activeSearch}"` : 'Browse all available exercises.'}
        </p>
      </div>
      
      <form onSubmit={handleSearch} className="w-full max-w-lg mx-auto mb-6 flex gap-2">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name..."
          className="flex-grow bg-gray-800 border border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
        />
        <button type="submit" className="px-4 py-2 bg-brand-primary text-dark-bg font-semibold rounded-lg hover:bg-opacity-80 transition-colors">
          Search
        </button>
        {activeSearch && (
          <button type="button" onClick={fetchDefaultExercises} className="px-4 py-2 bg-dark-card text-medium-text font-semibold rounded-lg hover:bg-dark-border transition-colors">
            Clear
          </button>
        )}
      </form>

      {isLoading && <Loader text="Loading exercises..." />}
      {error && <div className="text-center text-red-400">Error: {error}</div>}

      {!isLoading && !error && (
        exercises.length > 0 ? (
          <ul className="space-y-3">
            {exercises.map((exercise, index) => (
              <li key={exercise.id}>
                <button 
                  onClick={() => onSelectExercise(exercises, index)}
                  className="w-full text-left p-4 bg-dark-card rounded-lg shadow-md hover:bg-dark-border hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-light-text">{exercise.exercise_name}</h3>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-medium-text">Lvl: <span className="font-semibold text-light-text">{exercise.fitness_level}</span></span>
                      <span className="text-medium-text">Int: <span className="font-semibold text-light-text">{exercise.intensity}</span></span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-dark-card rounded-xl shadow-lg w-full py-16 flex flex-col justify-center items-center p-4 text-center">
              <p className="text-lg text-medium-text">
              {activeSearch ? `No exercises found for "${activeSearch}"` : "No exercises in the library!"}
              </p>
              <button
              onClick={fetchDefaultExercises}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-brand-primary text-dark-bg font-semibold rounded-lg hover:bg-opacity-80 transition-all"
              >
              <ArrowPathIcon className="w-5 h-5" />
              {activeSearch ? 'Clear Search' : 'Reload Exercises'}
              </button>
          </div>
        )
      )}
    </div>
  );
};

export default ExercisesView;
