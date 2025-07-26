/**
 * @file ExerciseCard.tsx
 * This component renders a detailed card for a single exercise.
 * It includes a video player, exercise name, and key stats like
 * fitness level and intensity, along with instructional text.
 * It is designed to be used in the swiping interface of ExercisesView.
 */
import React from 'react';
import type { Exercise } from '../types';
import { API_ROOT_URL } from '../constants';

interface ExerciseCardProps {
  exercise: Exercise;
}

/**
 * A small component to display a single statistic with a label.
 */
const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="text-center">
    <p className="text-xs text-medium-text uppercase tracking-wider">{label}</p>
    <p className="text-lg font-semibold text-light-text">{value}</p>
  </div>
);

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  return (
    <div className="w-full h-full bg-dark-card rounded-xl shadow-lg overflow-hidden flex flex-col">
      <div className="relative h-1/2">
        <video
          key={exercise.video_path}
          className="w-full h-full object-cover"
          src={`${API_ROOT_URL}/${exercise.video_path}`}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card to-transparent"></div>
        <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-white drop-shadow-lg">
          {exercise.exercise_name}
        </h2>
      </div>

      <div className="p-4 flex-grow overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 mb-4">
            <Stat label="Fitness Level" value={`${exercise.fitness_level}/10`} />
            <Stat label="Intensity" value={`${exercise.intensity}/10`} />
        </div>

        <div className="space-y-3 text-sm">
            <div>
                <h4 className="font-semibold text-brand-primary">How-To</h4>
                <p className="text-medium-text">{exercise.how_to}</p>
            </div>
             <div>
                <h4 className="font-semibold text-brand-primary">Sets & Reps</h4>
                <p className="text-medium-text">{exercise.rounds_reps}</p>
            </div>
            <div>
                <h4 className="font-semibold text-brand-primary">Benefits</h4>
                <p className="text-medium-text">{exercise.benefits}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;