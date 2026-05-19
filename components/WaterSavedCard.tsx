
import React from 'react';
import { WaterDropIcon } from './icons/WaterDropIcon';

interface WaterSavedCardProps {
    waterSaved: number;
    smartUsage: number;
    traditionalUsage: number;
}

export const WaterSavedCard: React.FC<WaterSavedCardProps> = ({ waterSaved, smartUsage, traditionalUsage }) => {
    const maxUsage = Math.max(traditionalUsage, 1); // Avoid division by zero
    const smartHeight = (smartUsage / maxUsage) * 100;
    const traditionalHeight = (traditionalUsage / maxUsage) * 100;

    return (
        <div className="bg-white dark:bg-surface rounded-3xl shadow-apple p-8 h-full flex flex-col justify-between transition-all duration-300 border border-light-base/50">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-apple-blue">
                    <WaterDropIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-light-on-surface dark:text-white">Water Efficiency</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Smart vs. Traditional</p>
                </div>
            </div>

            <div className="flex-grow flex items-end justify-around text-center gap-8 px-4 h-48">
                <div className="w-full flex flex-col justify-end h-full group">
                    <div className="relative w-full bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden h-full flex items-end">
                        <div className="w-full bg-gray-400/50 dark:bg-gray-600 transition-all duration-1000 ease-out group-hover:bg-gray-400" style={{ height: `${traditionalHeight}%` }}></div>
                    </div>
                    <p className="text-xs mt-3 font-medium text-gray-400 uppercase tracking-wider">Traditional</p>
                    <p className="text-lg font-bold text-gray-600 dark:text-gray-300">{traditionalUsage.toFixed(0)}L</p>
                </div>

                <div className="w-full flex flex-col justify-end h-full group">
                    <div className="relative w-full bg-blue-50 dark:bg-blue-900/10 rounded-2xl overflow-hidden h-full flex items-end shadow-inner">
                        <div className="w-full bg-apple-blue transition-all duration-1000 ease-out group-hover:bg-blue-600" style={{ height: `${smartHeight}%` }}></div>
                    </div>
                    <p className="text-xs mt-3 font-medium text-apple-blue uppercase tracking-wider">Smart</p>
                    <p className="text-lg font-bold text-apple-blue">{smartUsage.toFixed(0)}L</p>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Water Saved</p>
                <p className="text-4xl font-bold text-apple-green tracking-tight">{waterSaved.toFixed(1)} L</p>
            </div>
        </div>
    );
};
