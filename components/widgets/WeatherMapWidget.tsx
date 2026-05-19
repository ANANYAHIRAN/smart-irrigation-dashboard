import React from 'react';

export const WeatherMapWidget: React.FC = () => {
    return (
        <div className="bg-white dark:bg-surface rounded-3xl p-1 shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden h-[400px]">
            <iframe
                width="100%"
                height="100%"
                src="https://embed.windy.com/embed2.html?lat=37.7749&lon=-122.4194&detailLat=37.7749&detailLon=-122.4194&width=650&height=450&zoom=5&level=surface&overlay=rain&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1"
                frameBorder="0"
                className="w-full h-full rounded-2xl"
            ></iframe>
        </div>
    );
};
