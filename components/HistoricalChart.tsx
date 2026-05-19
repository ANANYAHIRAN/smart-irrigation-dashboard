
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getHistoricalData } from '../services/mockData';
import type { ChartDataPoint } from '../types';

type ChartRange = 'daily' | 'weekly' | 'monthly';
type DataType = 'moisture' | 'temp' | 'humidity';

export const HistoricalChart: React.FC = () => {
  const [range, setRange] = useState<ChartRange>('daily');
  const [dataType, setDataType] = useState<DataType>('moisture');

  const data = getHistoricalData(range)[dataType];

  const chartConfig = {
    moisture: { color: '#4CAF50', unit: '%' },
    temp: { color: '#FF9800', unit: '°C' },
    humidity: { color: '#03A9F4', unit: '%' },
  };

  const buttons: { label: string; value: ChartRange | DataType, type: 'range' | 'data' }[] = [
    { label: 'Soil Moisture', value: 'moisture', type: 'data' },
    { label: 'Temperature', value: 'temp', type: 'data' },
    { label: 'Humidity', value: 'humidity', type: 'data' },
    { label: 'Daily', value: 'daily', type: 'range' },
    { label: 'Weekly', value: 'weekly', type: 'range' },
    { label: 'Monthly', value: 'monthly', type: 'range' },
  ];
  
  const handleButtonClick = (value: ChartRange | DataType, type: 'range' | 'data') => {
    if (type === 'range') setRange(value as ChartRange);
    if (type === 'data') setDataType(value as DataType);
  };


  return (
    <div className="bg-light-surface dark:bg-surface rounded-xl shadow-lg p-6 transition-colors">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-light-on-surface dark:text-on-surface">Historical Data</h3>
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          {buttons.map(btn => (
             <button
                key={btn.label}
                onClick={() => handleButtonClick(btn.value, btn.type)}
                className={`px-3 py-1 text-xs sm:text-sm rounded-full transition-colors ${ (btn.type === 'range' && range === btn.value) || (btn.type === 'data' && dataType === btn.value) ? 'bg-secondary text-white' : 'bg-light-base dark:bg-base hover:bg-gray-200 dark:hover:bg-gray-700 text-light-on-surface-variant dark:text-on-surface-variant'}`}
             >
                {btn.label}
             </button>
          ))}
        </div>
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 50% / 0.3)" />
            <XAxis dataKey="name" stroke="hsl(0 0% 50% / 0.7)" fontSize={12} />
            <YAxis stroke="hsl(0 0% 50% / 0.7)" fontSize={12} unit={chartConfig[dataType].unit} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(0 0% 100% / 0.8)', border: '1px solid hsl(0 0% 50% / 0.3)' }}
              itemStyle={{ color: '#212121' }}
              labelStyle={{ color: '#212121', fontWeight: 'bold' }}
              wrapperClassName="dark:!bg-opacity-80 dark:!bg-base dark:!border-gray-700 dark:[&_.recharts-tooltip-item]:!text-on-surface-variant dark:[&_.recharts-tooltip-label]:!text-on-surface"
            />
            <Legend wrapperStyle={{ color: 'var(--text-color)' }} />
            <Line type="monotone" dataKey="value" name={dataType.charAt(0).toUpperCase() + dataType.slice(1)} stroke={chartConfig[dataType].color} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
