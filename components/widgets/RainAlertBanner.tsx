import React from 'react';
import { CloudRain, Umbrella, AlertTriangle, Droplets } from 'lucide-react';

interface RainAlertBannerProps {
    isVisible: boolean;
}

export const RainAlertBanner: React.FC<RainAlertBannerProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 rounded-3xl p-6 mb-8 shadow-xl animate-fade-in group">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <CloudRain className="w-48 h-48 text-white rotate-12 transform group-hover:scale-110 transition-transform duration-700" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/10">
                        <Umbrella className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-blue-400/30 text-blue-50 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-300/20 uppercase tracking-widest">
                                Weather Alert
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Precipitation Expected</h3>
                        <p className="text-blue-100 max-w-lg leading-relaxed">
                            Significant rainfall is forecasted for Chennai within the next 48 hours.
                            The automated irrigation schedule has been <span className="font-bold text-white">paused</span> to prevent waterlogging and conserve resources.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                        <span className="text-xs text-blue-200 uppercase font-bold">Probability</span>
                        <span className="text-xl font-bold text-white">85%</span>
                    </div>
                    <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                        <span className="text-xs text-blue-200 uppercase font-bold">Action</span>
                        <span className="text-xl font-bold text-white flex items-center gap-1">
                            <Droplets className="w-4 h-4" /> OFF
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
