/**
 * @file Header.tsx
 * This component renders the main header for the application.
 * It includes the application title and the primary navigation links
 * to switch between different views ('Exercises', 'Routines', 'Manage').
 */
import React from 'react';
import type { View } from '../types';

interface HeaderProps {
  activeView: View;
  setView: (view: View) => void;
}

/**
 * A single navigation button within the header.
 * It highlights itself if its view is currently active.
 */
const NavItem: React.FC<{
  view: View;
  activeView: View;
  setView: (view: View) => void;
  children: React.ReactNode;
}> = ({ view, activeView, setView, children }) => {
  const isActive = activeView === view;
  return (
    <button
      onClick={() => setView(view)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-brand-primary text-dark-bg'
          : 'text-medium-text hover:bg-dark-card hover:text-light-text'
      }`}
    >
      {children}
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ activeView, setView }) => {
  return (
    <header className="bg-dark-bg border-b border-dark-border sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-light-text tracking-tight">
              Fitness <span className="text-brand-primary">Builder</span>
            </h1>
          </div>
          <nav className="flex items-center space-x-2">
            <NavItem view="exercises" activeView={activeView} setView={setView}>
              Exercises
            </NavItem>
            <NavItem view="routines" activeView={activeView} setView={setView}>
              Routines
            </NavItem>
            <NavItem view="manage" activeView={activeView} setView={setView}>
              Manage
            </NavItem>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;