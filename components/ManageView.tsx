/**
 * @file ManageView.tsx
 * This component serves as the main dashboard for all management tasks.
 * It is organized into distinct sections for generating routines, adding exercises
 * from video URLs, searching the exercise library, and performing batch operations.
 * It uses a modular `Section` component to keep the layout consistent.
 */
import React from 'react';
import AddExerciseForm from './AddExerciseForm';
import CreateRoutineForm from './CreateRoutineForm';
import SearchExercises from './SearchExercises';
import BatchOperations from './BatchOperations';

/**
 * A reusable container for a section on the Manage page.
 */
const Section: React.FC<{ title: string, description: string, children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-dark-card p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-light-text mb-1">{title}</h2>
        <p className="text-medium-text mb-4">{description}</p>
        {children}
    </div>
);

const ManageView: React.FC = () => {
  return (
    <div className="space-y-6">
      <Section title="Search Exercises" description="Find specific exercises using keyword or semantic search.">
        <SearchExercises />
      </Section>
      
      <Section title="Batch Operations" description="Manage the exercise library by performing batch deletions or purging low-quality content.">
        <BatchOperations />
      </Section>
      
      <Section title="Create New Routine" description="Describe your fitness goals, choose from AI-generated exercise stories, and curate your perfect workout routine.">
        <CreateRoutineForm />
      </Section>
      
      <Section title="Process Video URL" description="Add new exercises to the library by processing a video from YouTube, Instagram, or TikTok.">
        <AddExerciseForm />
      </Section>
    </div>
  );
};

export default ManageView;