import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { HistoryView } from './components/views/HistoryView';
import { SettingsView } from './components/views/SettingsView';
import { InfoModal } from './components/InfoModal';
import { NutrientsView } from './components/views/NutrientsView';
import { AgroVoice } from './components/AgroVoice';
import { LanguageProvider } from './context/LanguageContext';
import { getInitialSensorData } from './services/mockData';
import type { SensorData, Alert, PumpStatus, IrrigationMode } from './types';
import { InfoSection } from './types';
import { supabase, logSystemEvent } from './services/supabase';
import { fetchWeatherData } from './services/weatherService';

type Theme = 'light' | 'dark';

const AppContent: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData>(getInitialSensorData());
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [pumpStatus, setPumpStatus] = useState<PumpStatus>('OFF');
  const [irrigationMode, setIrrigationMode] = useState<IrrigationMode>('AUTO');
  const [nextScheduledTime, setNextScheduledTime] = useState<string | null>(null);
  const [lastWateredTime, setLastWateredTime] = useState<string | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<string>('Loading cloud data...');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<InfoSection>(InfoSection.Architecture);
  const [theme, setTheme] = useState<Theme>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Initial Fetch & Realtime Subscription
  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch latest sensor reading
      const { data: sensorReadings, error: sensorError } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (sensorReadings && sensorReadings.length > 0) {
        const reading = sensorReadings[0];
        setSensorData(prev => ({
          ...prev,
          temperature: reading.temperature,
          humidity: reading.humidity,
          soilMoisture: reading.soil_moisture,
          rainStatus: reading.rain_status,
          batteryLevel: reading.battery_level,
          waterConsumed: reading.water_consumed,
          waterSaved: reading.water_saved
        }));
      }

      // Fetch system status
      const { data: statusData, error: statusError } = await supabase
        .from('system_status')
        .select('*')
        .single();

      if (statusData) {
        setPumpStatus(statusData.pump_status ? 'ON' : 'OFF');
        setIrrigationMode(statusData.irrigation_mode as IrrigationMode);
        setNextScheduledTime(statusData.next_scheduled_water);
        setLastWateredTime(statusData.last_watered);
      }
    };

    fetchInitialData();

    // Realtime Subscriptions
    const sensorSubscription = supabase
      .channel('sensor-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings' }, (payload) => {
        const newReading = payload.new as any;
        setSensorData(prev => ({
          ...prev,
          temperature: newReading.temperature,
          humidity: newReading.humidity,
          soilMoisture: newReading.soil_moisture,
          rainStatus: newReading.rain_status,
          batteryLevel: newReading.battery_level,
          waterConsumed: newReading.water_consumed,
          waterSaved: newReading.water_saved
        }));
      })
      .subscribe();

    const systemSubscription = supabase
      .channel('system-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_status' }, (payload) => {
        const newStatus = payload.new as any;
        setPumpStatus(newStatus.pump_status ? 'ON' : 'OFF');
        setIrrigationMode(newStatus.irrigation_mode as IrrigationMode);
        setNextScheduledTime(newStatus.next_scheduled_water);
        setLastWateredTime(newStatus.last_watered);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sensorSubscription);
      supabase.removeChannel(systemSubscription);
    };
  }, []);

  // Initialize Weather
  useEffect(() => {
    const initWeather = async () => {
      const weather = await fetchWeatherData();
      if (weather) {
        setSensorData(prev => ({
          ...prev,
          rainStatus: weather.rainStatus,
          temperature: weather.temperature,
          humidity: weather.humidity
        }));
        setWeatherForecast(weather.forecast);
      }
    };
    initWeather();

    // Refresh weather every 15 mins
    const interval = setInterval(initWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const newAlerts: Alert[] = [];
    if (sensorData.soilMoisture < 30) {
      newAlerts.push({ id: 1, message: 'Soil is critically dry!', type: 'error' });
    }
    if (sensorData.batteryLevel < 20) {
      newAlerts.push({ id: 2, message: 'System battery is low.', type: 'warning' });
    }
    if (sensorData.rainStatus.includes("predicted")) {
      newAlerts.push({ id: 3, message: 'Rain predicted soon. Irrigation may be paused.', type: 'info' });
    }
    setAlerts(newAlerts);
  }, [sensorData]);

  const handlePumpToggle = async (status: PumpStatus) => {
    if (irrigationMode === 'MANUAL') {
      // Optimistic update
      setPumpStatus(status);

      // Log action
      await logSystemEvent('info', `Pump manually toggled ${status}`);

      // Send to Supabase
      const { error } = await supabase
        .from('system_status')
        .update({
          pump_status: status === 'ON',
          last_watered: status === 'ON' ? new Date().toISOString() : lastWateredTime
        })
        .eq('irrigation_mode', 'MANUAL');

      await supabase.from('system_status').update({ pump_status: status === 'ON' }).neq('id', '00000000-0000-0000-0000-000000000000');
    }
  };

  const handleModeChange = async (mode: IrrigationMode) => {
    setIrrigationMode(mode);
    if (mode === 'AUTO') {
      setPumpStatus('OFF');
    }

    await supabase
      .from('system_status')
      .update({
        irrigation_mode: mode,
        pump_status: mode === 'AUTO' ? false : pumpStatus === 'ON'
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');
  };

  const openModal = (section: InfoSection) => {
    setModalContent(section);
    setIsModalOpen(true);
  };

  const handleVoiceCommand = (command: string) => {
    // Global voice command handler
    if (command === 'PUMP_ON') handlePumpToggle('ON');
    if (command === 'PUMP_OFF') handlePumpToggle('OFF');
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-light-base dark:bg-base text-light-on-surface dark:text-on-surface transition-colors">
        <AgroVoice onCommand={handleVoiceCommand} />
        <div className="flex">
          <Sidebar
            openInfoModal={() => openModal(InfoSection.Architecture)}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <div className="flex-1 flex flex-col h-screen overflow-y-auto">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className="p-4 sm:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={
                  <Dashboard
                    sensorData={sensorData}
                    alerts={alerts}
                    pumpStatus={pumpStatus}
                    irrigationMode={irrigationMode}
                    onPumpToggle={handlePumpToggle}
                    onModeChange={handleModeChange}
                    nextScheduledTime={nextScheduledTime}
                    lastWateredTime={lastWateredTime}
                  />
                } />
                <Route path="/nutrients" element={<NutrientsView sensorData={sensorData} />} />
                <Route path="/history" element={<HistoryView />} />
                <Route path="/settings" element={<SettingsView theme={theme} setTheme={setTheme} />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>

        <InfoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          activeSection={modalContent}
          onSectionChange={setModalContent}
        />
      </div>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App;