
import type { SensorData, ChartDataPoint, LogEntry } from '../types';

export const getInitialSensorData = (): SensorData => ({
  soilMoisture: 0,
  temperature: 26.7,
  humidity: 50,
  rainStatus: 'No rain predicted in next24 hours',
  pumpStatus: 'OFF',
  waterConsumed: 125.5,
  traditionalWaterUsage: 575.7,
  waterSaved: 450.2,
  batteryLevel: 92.1,
});

const generateChartData = (days: number, min: number, max: number): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const name = days <= 7 ? date.toLocaleDateString('en-US', { weekday: 'short' }) : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        data.push({
            name,
            value: parseFloat((Math.random() * (max - min) + min).toFixed(1)),
        });
    }
    return data;
};

export const getHistoricalData = (range: 'daily' | 'weekly' | 'monthly'): { moisture: ChartDataPoint[], temp: ChartDataPoint[], humidity: ChartDataPoint[] } => {
    const days = range === 'daily' ? 7 : (range === 'weekly' ? 30 : 90);
    return {
        moisture: generateChartData(days, 30, 70),
        temp: generateChartData(days, 18, 35),
        humidity: generateChartData(days, 50, 85),
    };
};

export const getMockLogs = (): LogEntry[] => {
    const now = new Date();
    return [
        { id: 1, timestamp: new Date(now.getTime() - 2 * 60000).toLocaleString(), event: 'PUMP_STATE_CHANGE', source: 'MANUAL', details: 'Pump turned ON by user.' },
        { id: 2, timestamp: new Date(now.getTime() - 5 * 60000).toLocaleString(), event: 'PUMP_STATE_CHANGE', source: 'MANUAL', details: 'Pump turned OFF by user.' },
        { id: 3, timestamp: new Date(now.getTime() - 15 * 60000).toLocaleString(), event: 'AI_RECOMMENDATION', source: 'AI_SCHEDULER', details: 'Recommendation: OFF. Reason: Soil moisture is optimal.' },
        { id: 4, timestamp: new Date(now.getTime() - 30 * 60000).toLocaleString(), event: 'ALERT_TRIGGERED', source: 'SYSTEM', details: 'Low battery warning issued.' },
        { id: 5, timestamp: new Date(now.getTime() - 60 * 60000).toLocaleString(), event: 'PUMP_STATE_CHANGE', source: 'AI_SCHEDULER', details: 'Pump turned ON. Soil moisture was at 32%.' },
        { id: 6, timestamp: new Date(now.getTime() - 65 * 60000).toLocaleString(), event: 'MODE_CHANGE', source: 'USER', details: 'Switched to AUTO mode.' },
    ].sort((a, b) => b.id - a.id);
}
