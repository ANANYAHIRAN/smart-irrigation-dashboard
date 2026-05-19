import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const DigitalClock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-3 bg-white dark:bg-surface px-6 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl">
                <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex flex-col">
                <span className="text-xl font-bold font-mono text-gray-900 dark:text-white tracking-widest">
                    {time.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
            </div>
        </div>
    );
};
