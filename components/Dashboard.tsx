import React, { useState } from 'react';
import { SensorCard } from './SensorCard';
import { AlertsCard } from './AlertsCard';
import { HistoricalChart } from './HistoricalChart';
import { AIScheduleCard } from './AIScheduleCard';
import { WaterSavedCard } from './WaterSavedCard';
import { SystemHealthCard } from './SystemHealthCard';
import { SoilBehaviorCard } from './SoilBehaviorCard';
import { ScheduleWidget } from './widgets/ScheduleWidget';
import { WeatherWidget } from './widgets/WeatherWidget';
import { WeatherMapWidget } from './widgets/WeatherMapWidget';
import { RainAlertBanner } from './widgets/RainAlertBanner';
import { SensorDetailModal } from './SensorDetailModal';
import { useLanguage } from '../context/LanguageContext';
import { useSoilBehavior } from '../hooks/useSoilBehavior';

import { MoistureIcon } from './icons/MoistureIcon';
import { TemperatureIcon } from './icons/TemperatureIcon';
import { HumidityIcon } from './icons/HumidityIcon';
import { RainIcon } from './icons/RainIcon';

import type { SensorData, Alert, PumpStatus, IrrigationMode } from '../types';

interface DashboardProps {
  sensorData: SensorData;
  alerts: Alert[];
  pumpStatus: PumpStatus;
  irrigationMode: IrrigationMode;
  onPumpToggle: (status: PumpStatus) => void;
  onModeChange: (mode: IrrigationMode) => void;
  nextScheduledTime: string | null;
  lastWateredTime: string | null;
  weatherForecast?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  sensorData,
  alerts,
  pumpStatus,
  irrigationMode,
  onPumpToggle,
  onModeChange,
  nextScheduledTime,
  lastWateredTime,
  weatherForecast = "Loading weather data...",
}) => {
  const [selectedSensor, setSelectedSensor] = useState<{ type: keyof SensorData; title: string; unit: string; color: string } | null>(null);
  const { t } = useLanguage();
  const soilData = useSoilBehavior(sensorData.soilMoisture, pumpStatus);

  // Check if rain is predicted (sensorData.rainStatus comes from weather service now)
  const isRainProjected = sensorData.rainStatus === 'predicted' || sensorData.rainStatus === 'rain';

  return (
    <>
      <RainAlertBanner isVisible={isRainProjected} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
        {/* Real-time Sensor Cards */}
        <SensorCard
          icon={<MoistureIcon className="w-5 h-5" />}
          title={t('soilMoisture')}
          value={`${sensorData.soilMoisture.toFixed(0)}%`}
          statusColor={sensorData.soilMoisture < 30 ? 'text-apple-red' : sensorData.soilMoisture > 60 ? 'text-apple-blue' : 'text-apple-green'}
          onClick={() => setSelectedSensor({ type: 'soilMoisture', title: t('soilMoisture'), unit: '%', color: '#007AFF' })}
        />
        <SensorCard
          icon={<TemperatureIcon className="w-5 h-5" />}
          title={t('temperature')}
          value={`${sensorData.temperature.toFixed(1)}°C`}
          statusColor="text-light-on-surface dark:text-white"
          onClick={() => setSelectedSensor({ type: 'temperature', title: t('temperature'), unit: '°C', color: '#FF9500' })}
        />
        <SensorCard
          icon={<HumidityIcon className="w-5 h-5" />}
          title={t('humidity')}
          value={`${sensorData.humidity.toFixed(0)}%`}
          statusColor="text-light-on-surface dark:text-white"
          onClick={() => setSelectedSensor({ type: 'humidity', title: t('humidity'), unit: '%', color: '#30B0C7' })}
        />
        <SensorCard
          icon={<RainIcon className="w-5 h-5" />}
          title={t('rainStatus')}
          value={sensorData.rainStatus === 'rain' ? t('raining') : sensorData.rainStatus === 'predicted' ? t('rainSoon') : t('dry')}
          statusColor={sensorData.rainStatus === 'rain' || sensorData.rainStatus === 'predicted' ? 'text-apple-blue' : 'text-apple-orange'}
        />

        {/* AI Cards and Widgets (ControlCard Removed) */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <ScheduleWidget nextScheduledTime={nextScheduledTime} lastWateredTime={lastWateredTime} />
            <WeatherWidget rainStatus={sensorData.rainStatus} />
          </div>
        </div>

        {/* Weather Map */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Weather Radar (Chennai)</h3>
            <span className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase rounded-full animate-pulse">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              LIVE FEED
            </span>
          </div>
          <WeatherMapWidget />

          {/* Dynamic Weather Insight */}
          <div className="bg-white dark:bg-surface rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${isRainProjected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>
              {isRainProjected ? <RainIcon className="w-6 h-6" /> : <MoistureIcon className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                {isRainProjected ? t('precipDetected') : t('clearSkies')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {isRainProjected
                  ? "As observed in the regional map for Chennai, significant rainfall is approaching within the next 48 hours. Consequently, all scheduled irrigation for today has been preemptively cancelled to utilize natural precipitation."
                  : "Regional map analysis for Chennai indicates dry conditions for the next 48 hours. Smart irrigation schedules remain active to maintain optimal soil moisture levels."}
              </p>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="lg:col-span-4">
          <AIScheduleCard sensorData={sensorData} weatherForecast={weatherForecast} />
        </div>

        {/* Analytics and Health Cards */}
        <div className="lg:col-span-4">
          <HistoricalChart />
        </div>

        <div className="lg:col-span-1">
          <SystemHealthCard batteryLevel={sensorData.batteryLevel} waterConsumed={sensorData.waterConsumed} />
        </div>

        <div className="lg:col-span-1">
          <SoilBehaviorCard soilData={soilData} />
        </div>

        <div className="lg:col-span-2">
          <WaterSavedCard
            waterSaved={sensorData.waterSaved}
            smartUsage={sensorData.waterConsumed}
            traditionalUsage={sensorData.traditionalWaterUsage}
          />
        </div>

        {alerts.length > 0 &&
          <div className="lg:col-span-4">
            <AlertsCard alerts={alerts} />
          </div>
        }
      </div>

      {/* Sensor Detail Modal */}
      {selectedSensor && (
        <SensorDetailModal
          isOpen={!!selectedSensor}
          onClose={() => setSelectedSensor(null)}
          sensorType={selectedSensor.type}
          title={selectedSensor.title}
          unit={selectedSensor.unit}
          color={selectedSensor.color}
        />
      )}
    </>
  );
};
