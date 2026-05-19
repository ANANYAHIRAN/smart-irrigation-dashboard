
export interface WeatherData {
    rainStatus: 'rain' | 'dry' | 'predicted';
    temperature: number;
    humidity: number;
    forecast: string;
}

// Default location (Chennai)
const DEFAULT_LAT = 13.0827;
const DEFAULT_LON = 80.2707;

export const fetchWeatherData = async (lat = DEFAULT_LAT, lon = DEFAULT_LON): Promise<WeatherData | null> => {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,showers&hourly=rain_probability&forecast_days=3`
        );

        if (!response.ok) throw new Error('Weather API failed');

        const data = await response.json();

        const current = data.current;
        const isRaining = (current.rain + current.showers) > 0;

        // Check next 48 hours for rain > 50% probability
        const hoursToCheck = 48;
        const upcomingRain = data.hourly.rain_probability.slice(0, hoursToCheck).some((p: number) => p > 50);

        return {
            rainStatus: isRaining ? 'rain' : upcomingRain ? 'predicted' : 'dry',
            temperature: current.temperature_2m,
            humidity: current.relative_humidity_2m,
            forecast: isRaining ? 'Raining now' : upcomingRain ? 'Rain expected in next 2 days' : 'Clear skies ahead'
        };
    } catch (error) {
        console.error('Error fetching weather:', error);
        return null;
    }
};
