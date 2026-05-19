import React from 'react';
import { CloudRain, CloudSun } from 'lucide-react';

interface WeatherWidgetProps {
    rainStatus: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ rainStatus }) => {
    const isRainy = rainStatus === 'rain';
    const isPredicted = rainStatus === 'predicted';

    return (
        <div className="bg-white dark:bg-surface rounded-3xl p-6 shadow-apple border border-light-base/50 h-full flex flex-col justify-between">
            <div className="flex items-start gap-4 mb-2">
                <div className={`p-3 rounded-2xl ${isRainy || isPredicted
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500'
                    : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500'
                    }`}>
                    {isRainy || isPredicted ? <CloudRain size={24} /> : <CloudSun size={24} />}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-light-on-surface dark:text-white">Weather</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Local forecast</p>
                </div>
            </div>

            <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight text-light-on-surface dark:text-white capitalize">
                    {isPredicted ? 'Rain Predicted' : rainStatus}
                </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <p className={`text-sm font-medium ${isRainy || isPredicted ? 'text-indigo-500' : 'text-gray-400'}`}>
                    {isPredicted && 'Irrigation paused (forecast)'}
                    {isRainy && 'System paused (raining)'}
                    {!isRainy && !isPredicted && 'No rain expected'}
                </p>
            </div>
        </div>
    );
};
