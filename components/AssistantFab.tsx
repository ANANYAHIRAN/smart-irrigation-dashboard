import React from 'react';
import { AIBrainIcon } from './icons/AIBrainIcon';

interface AssistantFabProps {
  onClick: () => void;
}

export const AssistantFab: React.FC<AssistantFabProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[9999] bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group"
    >
      <AIBrainIcon className="w-6 h-6 animate-pulse" />
      <span className="absolute right-full mr-4 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Ask AI Agronomist
      </span>
    </button>
  );
};
