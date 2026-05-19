
import React from 'react';
import { BatteryIcon } from './icons/BatteryIcon';
import { PowerIcon } from './icons/PowerIcon';
import { WaterDropIcon } from './icons/WaterDropIcon';

interface SystemHealthCardProps {
  batteryLevel: number;
  waterConsumed: number;
}

export const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ batteryLevel, waterConsumed }) => {
  const batteryColor = batteryLevel < 20 ? 'text-apple-red' : batteryLevel < 50 ? 'text-apple-orange' : 'text-apple-green';
  const batteryBg = batteryLevel < 20 ? 'bg-apple-red' : batteryLevel < 50 ? 'bg-apple-orange' : 'bg-apple-green';

  return (
    <div className="bg-white dark:bg-surface rounded-2xl shadow-sm p-5 h-full border border-gray-100 dark:border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg text-apple-green">
          <PowerIcon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">System Health</h3>
      </div>

      <div className="space-y-4">
        {/* Battery */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-1.5">
              <BatteryIcon className={`w-4 h-4 ${batteryColor}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">Battery</span>
            </div>
            <span className={`text-lg font-bold ${batteryColor}`}>{batteryLevel.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${batteryBg}`} style={{ width: `${batteryLevel}%` }}></div>
          </div>
        </div>

        {/* Water Consumption */}
        <div className="pt-3 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <WaterDropIcon className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Consumption</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-800 dark:text-white">{waterConsumed.toFixed(0)}</span>
              <span className="text-xs text-gray-400 ml-1">L</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
