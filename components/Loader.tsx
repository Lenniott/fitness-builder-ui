/**
 * @file Loader.tsx
 * A simple, reusable loading spinner component.
 * It can optionally display a text message below the spinner
 * to provide more context about the ongoing process.
 */
import React from 'react';

const Loader = ({ text }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 my-8">
      <div className="w-12 h-12 border-4 border-dark-border border-t-brand-primary rounded-full animate-spin"></div>
      {text && <p className="text-medium-text">{text}</p>}
    </div>
  );
};

export default Loader;