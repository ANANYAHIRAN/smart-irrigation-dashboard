
import React, { useState, useEffect } from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { SaveIcon } from 'lucide-react';

interface SettingsViewProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ theme, setTheme }) => {
    // Local state for settings (simulating persistence)
    const [moistureThreshold, setMoistureThreshold] = useState(30);
    const [irrigationDuration, setIrrigationDuration] = useState(15);
    const [maxTempLimit, setMaxTempLimit] = useState(35);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        // In a real app, save to Supabase 'user_settings' table
        localStorage.setItem('moistureThreshold', moistureThreshold.toString());
        localStorage.setItem('irrigationDuration', irrigationDuration.toString());
        localStorage.setItem('maxTempLimit', maxTempLimit.toString());

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    useEffect(() => {
        const savedMoisture = localStorage.getItem('moistureThreshold');
        const savedDuration = localStorage.getItem('irrigationDuration');
        const savedTemp = localStorage.getItem('maxTempLimit');

        if (savedMoisture) setMoistureThreshold(parseInt(savedMoisture));
        if (savedDuration) setIrrigationDuration(parseInt(savedDuration));
        if (savedTemp) setMaxTempLimit(parseInt(savedTemp));
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-light-on-surface dark:text-white mb-8">System Preferences</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Settings */}
                <div className="bg-white dark:bg-surface rounded-3xl shadow-apple p-8 border border-light-base/50">
                    <h3 className="text-xl font-semibold mb-6 text-light-on-surface dark:text-white">Appearance</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Theme Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark interface</p>
                        </div>
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                    </div>
                </div>

                {/* Irrigation Thresholds */}
                <div className="bg-white dark:bg-surface rounded-3xl shadow-apple p-8 border border-light-base/50">
                    <h3 className="text-xl font-semibold mb-6 text-light-on-surface dark:text-white">Irrigation Logic</h3>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Min Soil Moisture (%)</label>
                                <span className="text-sm font-bold text-apple-blue">{moistureThreshold}%</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="80"
                                value={moistureThreshold}
                                onChange={(e) => setMoistureThreshold(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-apple-blue"
                            />
                            <p className="text-xs text-gray-400 mt-1">Pump activates when moisture drops below this value.</p>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Watering Duration (min)</label>
                                <span className="text-sm font-bold text-apple-blue">{irrigationDuration} min</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="60"
                                step="5"
                                value={irrigationDuration}
                                onChange={(e) => setIrrigationDuration(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-apple-blue"
                            />
                        </div>
                    </div>
                </div>

                {/* Safety Limits */}
                <div className="bg-white dark:bg-surface rounded-3xl shadow-apple p-8 border border-light-base/50 md:col-span-2">
                    <h3 className="text-xl font-semibold mb-6 text-light-on-surface dark:text-white">Safety Safeguards</h3>

                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl mb-4">
                        <div>
                            <p className="font-medium text-red-700 dark:text-red-400">High Temperature Cutoff</p>
                            <p className="text-sm text-red-600/70 dark:text-red-400/70">Pause irrigation if ambient temp exceeds limit to prevent evaporation loss.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={maxTempLimit}
                                onChange={(e) => setMaxTempLimit(parseInt(e.target.value))}
                                className="w-16 p-2 rounded-lg border-none text-center font-bold text-gray-700 bg-white"
                            />
                            <span className="text-gray-500">°C</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg ${isSaved ? 'bg-green-500 shadow-green-500/30' : 'bg-black dark:bg-white dark:text-black shadow-black/20'}`}
                >
                    {isSaved ? 'Preferences Saved!' : 'Save Changes'}
                    {!isSaved && <SaveIcon size={20} />}
                </button>
            </div>
        </div>
    );
};
