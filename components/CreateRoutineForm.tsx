/**
 * @file CreateRoutineForm.tsx
 * This component provides a form for users to generate a personalized
 * workout routine. The user inputs their fitness goals, desired duration,
 * and intensity level. The component then calls the AI backend to create
 * a routine, displays the result, and saves the new routine's ID to
 * localStorage for future access.
 */
import React, { useState } from 'react';
import { generateRoutine } from '../services/api';
import type { Routine } from '../types';
import Loader from './Loader';
import RoutineCard from './RoutineCard';

const ROUTINE_IDS_KEY = 'fitness-builder-routines';

const CreateRoutineForm: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(15);
  const [intensity, setIntensity] = useState('moderate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRoutine, setNewRoutine] = useState<Routine | null>(null);

  /**
   * Handles form submission, sending user input to the backend to generate a routine.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setNewRoutine(null);

    try {
      const payload = {
        user_prompt: prompt,
        target_duration: duration * 60,
        intensity_level: intensity,
      };
      const routine = await generateRoutine(payload);
      setNewRoutine(routine);

      // Save the new routine ID to localStorage
      const storedIds: string[] = JSON.parse(localStorage.getItem(ROUTINE_IDS_KEY) || '[]');
      storedIds.push(routine.routine_id);
      localStorage.setItem(ROUTINE_IDS_KEY, JSON.stringify(storedIds));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Resets the form to allow for the creation of another routine.
   */
  const resetForm = () => {
      setPrompt('');
      setDuration(15);
      setIntensity('moderate');
      setNewRoutine(null);
  }

  if (isLoading) {
    return <Loader text="Generating your personalized routine..." />;
  }

  if (newRoutine) {
    return (
        <div>
            <h3 className="text-green-400 font-semibold mb-2">Routine created successfully!</h3>
            <RoutineCard routine={newRoutine} />
            <button
                onClick={resetForm}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark-bg bg-brand-primary hover:bg-opacity-90"
            >
                Create Another Routine
            </button>
        </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-medium-text">
          Your Goal
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., I want to build upper body strength, focusing on my back and shoulders."
          required
          rows={3}
          className="mt-1 block w-full bg-gray-800 border border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-medium-text">
            Duration (minutes)
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min="5"
            max="120"
            required
            className="mt-1 block w-full bg-gray-800 border border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
          />
        </div>
        <div>
          <label htmlFor="intensity" className="block text-sm font-medium text-medium-text">
            Intensity
          </label>
          <select
            id="intensity"
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
            required
            className="mt-1 block w-full bg-gray-800 border border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
          >
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="intense">Intense</option>
          </select>
        </div>
      </div>
       {error && <p className="text-red-400 text-sm">Error: {error}</p>}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark-bg bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-primary disabled:bg-gray-500"
      >
        {isLoading ? 'Generating...' : 'Generate Routine'}
      </button>
    </form>
  );
};

export default CreateRoutineForm;