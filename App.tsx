/**
 * @file App.tsx
 * This is the root component of the application.
 * It manages the main application state, such as the current view,
 * and renders the appropriate components based on user navigation.
 * It also includes the main header.
 */
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ExercisesView from './components/ExercisesView';
import RoutinesView from './components/RoutinesView';
import ManageView from './components/ManageView';
import ExerciseCycleView from './components/ExerciseCycleView';
import RoutineWorkoutView from './components/RoutineWorkoutView';
import type { View, CycleContext, Exercise, Routine } from './types';


const App: React.FC = () => {
  const [view, setView] = useState<View>('exercises');
  const [cycleContext, setCycleContext] = useState<CycleContext>(null);

  const handleStartExerciseCycle = useCallback((exercises: Exercise[], startIndex: number) => {
    setCycleContext({ type: 'exercise', exercises, startIndex });
  }, []);

  const handleStartRoutineWorkout = useCallback((routine: Routine) => {
    setCycleContext({ type: 'routine', routine });
  }, []);
  
  const handleExitCycle = useCallback(() => {
    setCycleContext(null);
  }, []);

  const renderCurrentView = () => {
    // If we are in a cycle/workout view, render that above everything.
    if (cycleContext) {
      if (cycleContext.type === 'exercise') {
        return <ExerciseCycleView 
                  exercises={cycleContext.exercises} 
                  startIndex={cycleContext.startIndex}
                  onExit={handleExitCycle} 
               />;
      }
      if (cycleContext.type === 'routine') {
        return <RoutineWorkoutView 
                  routine={cycleContext.routine}
                  onExit={handleExitCycle}
               />;
      }
    }

    // Otherwise, render the main view based on the active tab.
    switch (view) {
      case 'routines':
        return <RoutinesView onStartWorkout={handleStartRoutineWorkout} />;
      case 'manage':
        return <ManageView />;
      case 'exercises':
      default:
        return <ExercisesView onSelectExercise={handleStartExerciseCycle} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-light-text font-sans">
      <Header activeView={view} setView={setView} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default App;