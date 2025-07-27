/**
 * @file CreateRoutineForm.tsx
 * This component provides a form for users to create personalized workout routines
 * using the new user-curated workflow. The process involves:
 * 1. Generating exercise requirement stories from user prompt
 * 2. Searching for relevant exercises using semantic search
 * 3. Allowing user to curate the exercise selection
 * 4. Creating a routine with the final exercise list
 */
import React, { useState } from 'react';
import { generateStories, semanticSearchIds, getExercisesByIds, createRoutine } from '../services/api';
import type { Exercise, Routine, StoryGenerationPayload, SemanticSearchIdsPayload, CreateRoutinePayload } from '../types';
import Loader from './Loader';
import ExerciseCard from './ExerciseCard';

const ROUTINE_IDS_KEY = 'fitness-builder-routines';

interface CreateRoutineFormProps {
  onRoutineCreated?: (routine: Routine) => void;
}

const CreateRoutineForm: React.FC<CreateRoutineFormProps> = ({ onRoutineCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [storyCount, setStoryCount] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Workflow state
  const [step, setStep] = useState<'input' | 'stories' | 'search' | 'curate' | 'complete'>('input');
  const [stories, setStories] = useState<string[]>([]);
  const [selectedStory, setSelectedStory] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [routineName, setRoutineName] = useState('');
  const [routineDescription, setRoutineDescription] = useState('');
  const [createdRoutine, setCreatedRoutine] = useState<Routine | null>(null);

  /**
   * Step 1: Generate stories from user prompt
   */
  const handleGenerateStories = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload: StoryGenerationPayload = {
        user_prompt: prompt,
        story_count: storyCount
      };
      const response = await generateStories(payload);
      setStories(response.stories);
      setStep('stories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate stories.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Step 2: Search for exercises based on selected story
   */
  const handleSearchExercises = async (story: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedStory(story);

    try {
      const payload: SemanticSearchIdsPayload = {
        query: story,
        limit: 10
      };
      const response = await semanticSearchIds(payload);
      
      // Fetch full exercise details using the IDs
      const exercises = await getExercisesByIds({ exercise_ids: response.exercise_ids });
      setSearchResults(exercises);
      setStep('search');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search for exercises.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Step 3: Toggle exercise selection for curation
   */
  const toggleExerciseSelection = (exercise: Exercise) => {
    setSelectedExercises(prev => {
      const isSelected = prev.some(e => e.id === exercise.id);
      if (isSelected) {
        return prev.filter(e => e.id !== exercise.id);
      } else {
        return [...prev, exercise];
      }
    });
  };

  /**
   * Step 4: Create the routine with selected exercises
   */
  const handleCreateRoutine = async () => {
    if (selectedExercises.length === 0) {
      setError('Please select at least one exercise.');
      return;
    }

    if (!routineName.trim()) {
      setError('Please enter a routine name.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload: CreateRoutinePayload = {
        name: routineName,
        description: routineDescription || `A routine based on: ${prompt}`,
        exercise_ids: selectedExercises.map(e => e.id)
      };
      const routine = await createRoutine(payload);
      setCreatedRoutine(routine);

      // Save the new routine ID to localStorage
      const storedIds: string[] = JSON.parse(localStorage.getItem(ROUTINE_IDS_KEY) || '[]');
      storedIds.push(routine.routine_id);
      localStorage.setItem(ROUTINE_IDS_KEY, JSON.stringify(storedIds));

      setStep('complete');
      onRoutineCreated?.(routine);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create routine.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset the form to start over
   */
  const resetForm = () => {
    setPrompt('');
    setStoryCount(3);
    setStep('input');
    setStories([]);
    setSelectedStory('');
    setSearchResults([]);
    setSelectedExercises([]);
    setRoutineName('');
    setRoutineDescription('');
    setCreatedRoutine(null);
    setError(null);
  };

  if (isLoading) {
    return <Loader text="Processing..." />;
  }

  if (step === 'complete' && createdRoutine) {
    return (
      <div className="space-y-4">
        <div className="bg-green-900 border border-green-700 rounded-lg p-4">
          <h3 className="text-green-400 font-semibold mb-2">Routine created successfully!</h3>
          <p className="text-green-300 text-sm">
            "{createdRoutine.name}" has been created with {createdRoutine.exercise_ids.length} exercises.
          </p>
        </div>
        <button
          onClick={resetForm}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark-bg bg-brand-primary hover:bg-opacity-90"
        >
          Create Another Routine
        </button>
      </div>
    );
  }

  if (step === 'stories') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Choose a Story</h3>
          <button
            onClick={() => setStep('input')}
            className="text-sm text-medium-text hover:text-light-text"
          >
            ← Back
          </button>
        </div>
        <p className="text-medium-text text-sm">
          Based on your prompt, here are some exercise requirement stories. Choose one to find relevant exercises:
        </p>
        <div className="space-y-3">
          {stories.map((story, index) => (
            <div
              key={index}
              className="p-4 bg-dark-card border border-dark-border rounded-lg cursor-pointer hover:border-brand-primary transition-colors"
              onClick={() => handleSearchExercises(story)}
            >
              <p className="text-light-text text-sm">{story}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'search') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Select Exercises</h3>
          <button
            onClick={() => setStep('stories')}
            className="text-sm text-medium-text hover:text-light-text"
          >
            ← Back
          </button>
        </div>
        <p className="text-medium-text text-sm">
          Found {searchResults.length} exercises based on your story. Select the ones you want in your routine:
        </p>
        
        {searchResults.length > 0 ? (
          <div className="space-y-3">
            {searchResults.map((exercise) => {
              const isSelected = selectedExercises.some(e => e.id === exercise.id);
              return (
                <div
                  key={exercise.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-brand-primary bg-opacity-20 border-brand-primary' 
                      : 'bg-dark-card border-dark-border hover:border-brand-primary'
                  }`}
                  onClick={() => toggleExerciseSelection(exercise)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-light-text">{exercise.exercise_name}</h4>
                      <p className="text-sm text-medium-text mt-1">{exercise.benefits}</p>
                    </div>
                    <div className="ml-4">
                      {isSelected ? (
                        <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
                          <span className="text-dark-bg text-sm">✓</span>
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-medium-text rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-medium-text py-8">No exercises found. Try a different story.</p>
        )}

        {selectedExercises.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-dark-border">
            <div>
              <label htmlFor="routineName" className="block text-sm font-medium text-medium-text">
                Routine Name
              </label>
              <input
                type="text"
                id="routineName"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder="e.g., My Custom Workout"
                className="mt-1 block w-full bg-gray-800 border border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label htmlFor="routineDescription" className="block text-sm font-medium text-medium-text">
                Description (optional)
              </label>
              <textarea
                id="routineDescription"
                value={routineDescription}
                onChange={(e) => setRoutineDescription(e.target.value)}
                placeholder="Describe your routine..."
                rows={2}
                className="mt-1 block w-full bg-gray-800 border border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <button
              onClick={handleCreateRoutine}
              disabled={!routineName.trim()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark-bg bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-primary disabled:bg-gray-500"
            >
              Create Routine ({selectedExercises.length} exercises)
            </button>
          </div>
        )}
      </div>
    );
  }

  // Initial form
  return (
    <form onSubmit={handleGenerateStories} className="space-y-4">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-medium-text">
          Your Goal
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., I want to get good at pull ups but i can only do 1 at the moment"
          required
          rows={3}
          className="mt-1 block w-full bg-gray-800 border border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
        />
      </div>
      
      <div>
        <label htmlFor="storyCount" className="block text-sm font-medium text-medium-text">
          Number of Stories to Generate
        </label>
        <input
          type="number"
          id="storyCount"
          value={storyCount}
          onChange={(e) => setStoryCount(Number(e.target.value))}
          min="1"
          max="5"
          className="mt-1 block w-full bg-gray-800 border border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
        />
        <p className="text-xs text-medium-text mt-1">
          More stories give you more options to choose from
        </p>
      </div>

      {error && <p className="text-red-400 text-sm">Error: {error}</p>}
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark-bg bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-primary disabled:bg-gray-500"
      >
        {isLoading ? 'Generating Stories...' : 'Generate Stories'}
      </button>
    </form>
  );
};

export default CreateRoutineForm;