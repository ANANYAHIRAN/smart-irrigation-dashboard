
import React from 'react';

interface SensorCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  statusColor?: string;
  onClick?: () => void;
}

export const SensorCard: React.FC<SensorCardProps> = ({ icon, title, value, statusColor = 'text-light-on-surface', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-surface rounded-3xl shadow-apple p-6 flex flex-col justify-between h-32 transition-all duration-300 hover:shadow-apple-hover border border-light-base/50 ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-light-base dark:bg-white/5 rounded-full text-apple-blue">
            {icon}
          </div>
          <p className="text-sm font-medium text-light-on-surface-variant dark:text-gray-400">{title}</p>
        </div>
      </div>
      <div>
        <p className={`text-3xl font-semibold tracking-tight ${statusColor}`}>{value}</p>
      </div>
    </div>
  );
};
