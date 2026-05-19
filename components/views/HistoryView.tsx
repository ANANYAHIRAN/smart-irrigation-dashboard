import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import type { DbLogEntry } from '../../types';
import { DownloadIcon } from '../icons/DownloadIcon';
import { FilterIcon } from '../icons/FilterIcon';

const logStyleMap: Record<string, string> = {
    'info': 'bg-blue-500/10 text-blue-500',
    'warning': 'bg-orange-500/10 text-orange-500',
    'error': 'bg-red-500/10 text-red-500',
};

export const HistoryView: React.FC = () => {
    const [logs, setLogs] = useState<DbLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');

    useEffect(() => {
        fetchLogs();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('logs_channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'logs' }, (payload) => {
                const newLog = payload.new as DbLogEntry;
                setLogs((prev) => [newLog, ...prev]);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchLogs = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching logs:', error);
        } else {
            setLogs(data || []);
        }
        setIsLoading(false);
    };

    const handleExportCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Timestamp,Level,Message,Details\n"
            + logs.map(e => `${e.created_at},${e.level},${e.message},"${JSON.stringify(e.details || {}).replace(/"/g, '""')}"`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `system_logs_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.level === filter);

    return (
        <div className="bg-white dark:bg-surface rounded-3xl shadow-apple p-8 transition-colors border border-light-base/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-light-on-surface dark:text-white">System Event History</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Real-time log of system activities and alerts.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-white/5 border-none rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-apple-blue outline-none appearance-none cursor-pointer"
                        >
                            <option value="all">All Events</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </select>
                    </div>

                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Timestamp</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Level</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Message</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading system logs...</td>
                            </tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No logs found matching your criteria.</td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${logStyleMap[log.level] || 'bg-gray-100 text-gray-500'}`}>
                                            {log.level.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{log.message}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                                        {JSON.stringify(log.details)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
