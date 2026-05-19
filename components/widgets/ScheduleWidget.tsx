import React from 'react';
import { Clock } from 'lucide-react';

interface ScheduleWidgetProps {
    nextScheduledTime: string | null;
    lastWateredTime: string | null;
}

export const ScheduleWidget: React.FC<ScheduleWidgetProps> = ({ nextScheduledTime, lastWateredTime }) => {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not scheduled';
        return new Date(dateString).toLocaleString([], {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="bg-white dark:bg-surface rounded-3xl p-6 shadow-apple border border-light-base/50 h-full flex flex-col justify-between">
            <div className="flex items-start gap-4 mb-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-apple-blue">
                    <Clock size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-light-on-surface dark:text-white">Schedule</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Next watering cycle</p>
                </div>
            </div>

            <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight text-light-on-surface dark:text-white">
                    {formatDate(nextScheduledTime)}
                </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Last run</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                        {lastWateredTime ? formatDate(lastWateredTime) : 'Never'}
                    </span>
                </div>
            </div>
        </div>
    );
};
