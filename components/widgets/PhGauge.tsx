import React from 'react';

interface PhGaugeProps {
    value: number;
}

export const PhGauge: React.FC<PhGaugeProps> = ({ value }) => {
    // Clamp value between 0 and 14
    const clampedValue = Math.min(Math.max(value, 0), 14);
    // Convert 0-14 pH to 0-180 degrees
    const rotation = (clampedValue / 14) * 180;

    return (
        <div className="relative w-full aspect-[2/1] overflow-hidden">
            {/* Gauge Arc */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full rounded-t-full bg-gradient-to-r from-red-500 via-green-500 to-blue-600 opacity-20" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[80%] rounded-t-full bg-white dark:bg-surface" />

            {/* Ticks/Labels */}
            <div className="absolute bottom-2 left-4 text-xs font-bold text-red-500">Acidic</div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 translate-y-4 text-xs font-bold text-green-600">Neutral</div>
            <div className="absolute bottom-2 right-4 text-xs font-bold text-blue-500">Alkaline</div>

            {/* Needle */}
            <div
                className="absolute bottom-0 left-1/2 w-1 h-full origin-bottom transition-transform duration-1000 ease-out"
                style={{ transform: `translateX(-50%) rotate(${rotation - 90}deg)` }}
            >
                <div className="w-full h-1/2 bg-gray-800 dark:bg-white rounded-t-full" />
            </div>

            {/* Center Pivot */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-gray-900 dark:bg-white rounded-full border-2 border-white dark:border-gray-900 shadow-md" />
        </div>
    );
};
