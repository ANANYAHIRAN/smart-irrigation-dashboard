
import React, { useState } from 'react';
import { AIBrainIcon } from './icons/AIBrainIcon';
import { TickIcon } from './icons/TickIcon';
import { CrossIcon } from './icons/CrossIcon';
import { getOllamaRecommendation } from '../services/ollamaService';
import { Loader2 } from 'lucide-react';
import type { SensorData, AIRecommendation } from '../types';

interface AIScheduleCardProps {
  sensorData: SensorData;
  weatherForecast?: string;
}

export const AIScheduleCard: React.FC<AIScheduleCardProps> = ({ sensorData, weatherForecast = "No data" }) => {
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    const result = await getOllamaRecommendation(sensorData, weatherForecast);

    if ('error' in result) {
      setError(result.error);
    } else {
      setRecommendation(result);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-apple-hover p-8 text-white relative overflow-hidden group h-full">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/3 -translate-y-1/3">
        <AIBrainIcon className="w-64 h-64" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AIBrainIcon className="w-6 h-6 text-purple-200" />
            <span className="text-xs font-semibold tracking-wider text-purple-200 uppercase">Llama 3 Powered</span>
          </div>
          <div className="flex justify-between items-end">
            <h3 className="text-2xl font-bold">AI Irrigation Doctor</h3>
          </div>
        </div>

        {!recommendation && !loading && !error && (
          <div className="py-8 text-center flex-grow flex flex-col justify-center">
            <p className="text-indigo-100 mb-6 text-lg">
              Ready to analyze soil, sensor, and weather data.
            </p>
            <button
              onClick={handleAnalyze}
              className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Analyze System
            </button>
          </div>
        )}

        {loading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 flex-grow">
            <Loader2 className="w-10 h-10 animate-spin text-white" />
            <p className="text-purple-100 font-medium">Consulting Llama 3...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 backdrop-blur-md rounded-2xl p-6 border border-red-500/30">
            <div className="flex items-center gap-3 mb-2">
              <CrossIcon className="w-6 h-6 text-red-200" />
              <p className="font-bold text-red-100">Connection Error</p>
            </div>
            <p className="text-sm text-red-100">{error}</p>
            <button onClick={() => setError(null)} className="mt-4 text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20">Try Again</button>
          </div>
        )}

        {recommendation && (
          <div className="animate-fade-in space-y-6 mt-4">
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div>
                <p className="text-sm text-purple-200 mb-1">Recommendation</p>
                <p className="text-3xl font-bold">{recommendation.recommendation === 'ON' ? 'START WATERING' : 'KEEP OFF'}</p>
              </div>
              <div className={`p-4 rounded-full ${recommendation.recommendation === 'ON' ? 'bg-green-500' : 'bg-gray-800'}`}>
                {recommendation.recommendation === 'ON' ? <TickIcon className="w-8 h-8" /> : <CrossIcon className="w-8 h-8" />}
              </div>
            </div>

            <div className="bg-black/20 rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-lg leading-relaxed text-indigo-50">
                "{recommendation.reason}"
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-purple-200">
                <div className="h-1.5 flex-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400 rounded-full transition-all duration-1000"
                    style={{ width: `${recommendation.confidence_score}%` }}
                  />
                </div>
                <span>{recommendation.confidence_score}% Confidence</span>
              </div>
            </div>

            <button
              onClick={() => setRecommendation(null)}
              className="w-full py-3 text-sm font-medium text-purple-200 hover:text-white transition-colors"
            >
              Run New Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
