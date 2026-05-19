import React, { useState, useEffect } from 'react';
import { CrossIcon } from './icons/CrossIcon';
import { AIBrainIcon } from './icons/AIBrainIcon';
import { Loader2, Droplets, Leaf, Activity } from 'lucide-react';
import type { SensorData } from '../types';
import { getNutrientAnalysis } from '../services/ollamaService';

interface AssistantSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    sensorData: SensorData;
}

export const AssistantSidebar: React.FC<AssistantSidebarProps> = ({ isOpen, onClose, sensorData }) => {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Mock Nutrient Data - simulating a "Low Absorption" scenario
    const nutrientData = {
        nitrogen: 'Low',
        phosphorus: 'Adequate',
        potassium: 'Adequate',
        pH: 6.2,
        absorptionRate: 65 // Percentage efficiency
    };

    useEffect(() => {
        if (isOpen && !analysis) {
            handleAnalysis();
        }
    }, [isOpen]);

    const handleAnalysis = async () => {
        setLoading(true);
        const result = await getNutrientAnalysis(sensorData, nutrientData);
        setAnalysis(result);
        setLoading(false);
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Panel - Minimal White UI */}
            <div
                className={`fixed inset-y-0 left-0 w-full sm:w-[450px] bg-white shadow-2xl transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-[10000] overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-8 h-full flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-light text-gray-900 tracking-tight">Plant Health <span className="font-bold">Diagnostics</span></h2>
                            <p className="text-sm text-gray-400 mt-1">Real-time nutrient absorption analysis</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-50 rounded-full transition-colors group"
                        >
                            <CrossIcon className="w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors" />
                        </button>
                    </div>

                    {/* Absorption Meter - Key Feature */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Droplets className="w-5 h-5 text-blue-500" />
                                <span className="text-sm font-semibold text-gray-700">Water Absorption Efficiency</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{nutrientData.absorptionRate}%</span>
                        </div>
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full transition-all duration-1000"
                                style={{ width: `${nutrientData.absorptionRate}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-right">Target: &gt;85%</p>
                    </div>

                    {/* Nutrient Bars (N-P-K) */}
                    <div className="grid grid-cols-1 gap-6 mb-10">
                        {/* Nitrogen */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-gray-500 tracking-wider">NITROGEN (N)</span>
                                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">LOW - CRITICAL</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-400 w-1/4 rounded-full" />
                            </div>
                        </div>

                        {/* Phosphorus */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-gray-500 tracking-wider">PHOSPHORUS (P)</span>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">ADEQUATE</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-3/4 rounded-full" />
                            </div>
                        </div>

                        {/* Potassium */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-gray-500 tracking-wider">POTASSIUM (K)</span>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">ADEQUATE</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-4/5 rounded-full" />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-2"></div>

                    {/* AI Analysis Section */}
                    <div className="flex-1 flex flex-col pt-8">
                        <div className="flex items-center gap-2 mb-4">
                            <AIBrainIcon className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest">Agronomist Intelligence</h3>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center flex-1 space-y-4 opacity-50">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                <p className="text-sm text-gray-400 font-light">Analyzing soil chemistry...</p>
                            </div>
                        ) : (
                            <div className="prose prose-sm max-w-none">
                                <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-50">
                                    <p className="text-gray-700 leading-relaxed font-normal whitespace-pre-wrap">
                                        {analysis || "System ready. Detailed nutrient analysis will appear here."}
                                    </p>
                                </div>

                                {analysis && (
                                    <div className="mt-6 flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                                        <Leaf className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-xs font-bold text-yellow-800 uppercase mb-1">Recommended Action</h4>
                                            <p className="text-sm text-yellow-800/80">
                                                Apply ammonium nitrate fertilizer immediately to boost Nitrogen levels. This will restore osmotic pressure in the roots and improve water uptake efficiency.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer for Regnerate */}
                    {!loading && (
                        <div className="mt-8 pt-4 border-t border-gray-100">
                            <button
                                onClick={handleAnalysis}
                                className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors py-2"
                            >
                                <Activity className="w-4 h-4" />
                                <span>Refresh Analysis</span>
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};
