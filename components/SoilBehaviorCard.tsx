import React from 'react';
import type { SoilBehaviorData, SoilType } from '../hooks/useSoilBehavior';

interface SoilBehaviorCardProps {
  soilData: SoilBehaviorData;
}

const soilTypeConfig: Record<SoilType, { label: string; color: string; bgColor: string; icon: string; description: string }> = {
  'sandy-like': {
    label: 'Sandy-like',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    icon: '⏩',
    description: 'Fast drainage, requires frequent irrigation'
  },
  'loamy-like': {
    label: 'Loamy-like',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: '✓',
    description: 'Balanced water retention and drainage'
  },
  'clay-like': {
    label: 'Clay-like',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: '⏳',
    description: 'Slow drainage, retains water longer'
  },
  'analyzing': {
    label: 'Analyzing...',
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    icon: '⟳',
    description: 'Waiting for irrigation to complete...'
  }
};

export const SoilBehaviorCard: React.FC<SoilBehaviorCardProps> = ({ soilData }) => {
  const config = soilTypeConfig[soilData.soilType];
  const hasData = soilData.soilType !== 'analyzing';

  return (
    <div className="bg-white dark:bg-surface rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <span className="text-lg">{config.icon}</span>
          </div>
          <div>
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Soil Behavior</h3>
            <p className={`text-sm font-bold ${config.color}`}>{config.label}</p>
          </div>
        </div>
        {hasData && (
          <div className="text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500">Drying Rate</p>
            <p className="text-base font-bold text-gray-800 dark:text-white">
              {soilData.dryingRate.toFixed(1)}<span className="text-xs font-normal text-gray-500">%/hr</span>
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
        {config.description}
      </p>

      {hasData && (
        <>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/5 pt-2 mb-2">
            <span>{soilData.hoursPassed.toFixed(1)}h since irrigation</span>
            <span>Lost: {(soilData.initialMoisture - soilData.currentMoisture).toFixed(1)}%</span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-0.5">💡 Tip</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 leading-snug">{soilData.irrigationAdjustmentTip}</p>
          </div>
        </>
      )}

      {!hasData && (
        <div className="mt-1">
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-pulse w-1/3" />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
            {soilData.irrigationAdjustmentTip}
          </p>
        </div>
      )}
    </div>
  );
};
