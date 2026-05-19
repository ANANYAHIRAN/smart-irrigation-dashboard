import React, { useState, useEffect } from 'react';
import { AIBrainIcon } from '../../components/icons/AIBrainIcon';
import { Loader2, Droplets, Leaf, Activity, Sprout, CloudSun, Calendar } from 'lucide-react';
import type { SensorData } from '../../types';
import { getNutrientAnalysis } from '../../services/ollamaService';
import { DigitalClock } from '../widgets/DigitalClock';
import { PhGauge } from '../widgets/PhGauge';

interface NutrientsViewProps {
    sensorData: SensorData;
}

export const NutrientsView: React.FC<NutrientsViewProps> = ({ sensorData }) => {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Mock Nutrient Data
    const nutrientData = {
        nitrogen: 'Low',
        phosphorus: 'Adequate',
        potassium: 'Adequate',
        pH: 6.2,
        absorptionRate: 65
    };

    useEffect(() => {
        if (!analysis) {
            handleAnalysis();
        }
    }, []);

    const handleAnalysis = async () => {
        setLoading(true);
        const result = await getNutrientAnalysis(sensorData, nutrientData);
        setAnalysis(result);
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-8">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nutrient Analysis</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Real-time soil chemistry and water absorption diagnostics</p>
                </div>
                <DigitalClock />
            </header>

            {/* Context Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Growth Stage */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-3xl border border-green-100 dark:border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sprout className="w-24 h-24 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold mb-2">
                            <Calendar className="w-4 h-4" />
                            <span>Week 4 • Vegetative Stage</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Rapid Growth</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">High Nitrogen demand for leaf development.</p>
                    </div>
                </div>

                {/* Weather Context */}
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 p-6 rounded-3xl border border-blue-100 dark:border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CloudSun className="w-24 h-24 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold mb-2">
                            <Activity className="w-4 h-4" />
                            <span>Transpiration Rate</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Moderate</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Humidity at {sensorData.humidity}% slows water uptake.</p>
                    </div>
                </div>

                {/* pH Gauge Card */}
                <div className="bg-white dark:bg-surface p-6 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Soil pH</span>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{nutrientData.pH}</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${nutrientData.pH >= 6 && nutrientData.pH <= 7 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                            OPTIMAL
                        </div>
                    </div>
                    <div className="w-full max-w-[200px] mx-auto">
                        <PhGauge value={nutrientData.pH} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Metrics */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Absorption Card */}
                    <div className="bg-white dark:bg-surface rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                                <Droplets className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Water Absorption</h3>
                                <p className="text-xs text-gray-500">Root uptake efficiency</p>
                            </div>
                        </div>

                        <div className="mb-2 flex justify-between items-end">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">{nutrientData.absorptionRate}%</span>
                            <span className="text-sm font-medium text-red-500">Below Target</span>
                        </div>

                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full transition-all duration-1000"
                                style={{ width: `${nutrientData.absorptionRate}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-right">Target: &gt;85%</p>
                    </div>

                    {/* Nutrient Status */}
                    <div className="bg-white dark:bg-surface rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Soil Nutrients (N-P-K)</h3>
                        <div className="space-y-6">
                            {/* Nitrogen */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-500 tracking-wider">NITROGEN</span>
                                    <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">CRITICAL</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-400 w-1/4 rounded-full" />
                                </div>
                            </div>

                            {/* Phosphorus */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-500 tracking-wider">PHOSPHORUS</span>
                                    <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">ADEQUATE</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-3/4 rounded-full" />
                                </div>
                            </div>

                            {/* Potassium */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-500 tracking-wider">POTASSIUM</span>
                                    <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">ADEQUATE</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-4/5 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: AI Analysis */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-surface rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-white/5 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                                <AIBrainIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Agronomist Intelligence</h3>
                                <p className="text-xs text-gray-500">Llama 3 Powered Analysis</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
                                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                                <p className="text-gray-400 animate-pulse">Analyzing soil chemistry...</p>
                            </div>
                        ) : (
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-8 rounded-3xl border border-indigo-50 dark:border-indigo-500/10 mb-8">
                                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-2">
                                        {(analysis || "System ready. Detailed nutrient analysis will appear here.").split('\n').map((line, i) => (
                                            <p key={i} className="min-h-[1.5em]">
                                                {line.split(/\*\*(.*?)\*\*/g).map((part, index) =>
                                                    index % 2 === 1 ? <strong key={index} className="font-bold text-indigo-700 dark:text-indigo-300">{part}</strong> : part
                                                )}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {analysis && (
                                    <div className="space-y-4">
                                        {/* Chemical Recommendation */}
                                        <div className="flex items-start gap-4 p-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-100 dark:border-yellow-500/20">
                                            <Leaf className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wide text-sm mb-2">Chemical Treatment</h4>
                                                <p className="text-yellow-900/80 dark:text-yellow-200/80 leading-relaxed">
                                                    Apply ammonium nitrate fertilizer immediately into the irrigation mix. Increasing nitrogen availability will act as an osmolyte, restoring turgor pressure in root cells and effectively "unlocking" the water absorption potential of the crop.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Organic Alternative */}
                                        <div className="flex items-start gap-4 p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-500/20">
                                            <Sprout className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-green-800 dark:text-green-400 uppercase tracking-wide text-sm mb-2">Organic Alternative</h4>
                                                <p className="text-green-900/80 dark:text-green-200/80 leading-relaxed">
                                                    Apply compost tea or well-aged manure tea (1:10 dilution) via fertigation. For immediate nitrogen boost, use fish emulsion or seaweed extract foliar spray. Cover crop with legumes (clover, vetch) to naturally fix atmospheric nitrogen and improve soil structure for better water retention.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {!loading && (
                            <div className="mt-auto pt-8 flex justify-end">
                                <button
                                    onClick={handleAnalysis}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:scale-105 transition-transform"
                                >
                                    <Activity className="w-4 h-4" />
                                    <span>Refresh Analysis</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
