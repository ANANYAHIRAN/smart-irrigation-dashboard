import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CrossIcon } from './icons/CrossIcon';
import type { SensorData } from '../types';

interface SensorDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    sensorType: keyof SensorData;
    title: string;
    unit: string;
    color: string;
}

export const SensorDetailModal: React.FC<SensorDetailModalProps> = ({ isOpen, onClose, sensorType, title, unit, color }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, sensorType]);

    const fetchHistory = async () => {
        setLoading(true);
        // Map frontend keys to DB columns
        const colMap: Record<string, string> = {
            'soilMoisture': 'soil_moisture',
            'temperature': 'temperature',
            'humidity': 'humidity',
            'batteryLevel': 'battery_level'
        };
        const dbCol = colMap[sensorType] || sensorType;

        const { data, error } = await supabase
            .from('sensor_readings')
            .select(`created_at, ${dbCol}`)
            .order('created_at', { ascending: false })
            .limit(24); // Last 24 readings

        if (data) {
            const formatted = data.map(d => ({
                time: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                value: d[dbCol]
            })).reverse();
            setData(formatted);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title} Analysis</h3>
                        <p className="text-sm text-gray-500">Last 24 readings trend</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <CrossIcon className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 h-[400px]">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
                        </div>
                    ) : data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id={`color${sensorType}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} unit={unit} domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: 'none' }}
                                    itemStyle={{ color: '#374151', fontWeight: 600 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={color}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill={`url(#color${sensorType})`}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <p>No historical data available for this sensor.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
