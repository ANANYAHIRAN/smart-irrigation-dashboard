
import React from 'react';
import { MenuIcon } from './icons/MenuIcon';

interface HeaderProps {
    toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="flex sticky top-0 bg-light-base/80 dark:bg-base/80 backdrop-blur-sm z-10 items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center">
         <button onClick={toggleSidebar} className="lg:hidden mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
             <MenuIcon className="w-6 h-6" />
         </button>
         <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Smart Irrigation Dashboard</h1>
            <p className="text-xs sm:text-sm text-light-on-surface-variant dark:text-on-surface-variant">Real-time monitoring and AI-powered scheduling</p>
         </div>
      </div>
    </header>
  );
};
