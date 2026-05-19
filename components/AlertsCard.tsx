
import React from 'react';
import type { Alert } from '../types';
import { InfoIcon } from './icons/InfoIcon';
import { WarningIcon } from './icons/WarningIcon';
import { ErrorIcon } from './icons/ErrorIcon';


const alertConfig = {
    info: { icon: <InfoIcon className="w-5 h-5 text-blue-400" />, style: 'bg-blue-50 dark:bg-blue-900/50 border-blue-400' },
    warning: { icon: <WarningIcon className="w-5 h-5 text-yellow-400" />, style: 'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-400' },
    error: { icon: <ErrorIcon className="w-5 h-5 text-red-400" />, style: 'bg-red-50 dark:bg-red-900/50 border-red-400' },
};

export const AlertsCard: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  return (
    <div className="bg-light-surface dark:bg-surface rounded-xl shadow-lg p-6 transition-colors">
      <h3 className="text-lg font-bold text-light-on-surface dark:text-on-surface mb-4">Alerts & Notifications</h3>
      <div className="space-y-3">
        {alerts.map(alert => {
            const config = alertConfig[alert.type];
            return (
                <div key={alert.id} className={`flex items-center p-3 rounded-lg border-l-4 ${config.style}`}>
                    <div className="flex-shrink-0 mr-3">
                        {config.icon}
                    </div>
                    <p className="text-light-on-surface-variant dark:text-on-surface-variant text-sm">{alert.message}</p>
                </div>
            );
        })}
      </div>
    </div>
  );
};
