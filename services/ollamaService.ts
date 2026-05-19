import type { SensorData, AIRecommendation } from '../types';

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'llama3.2:1b';

export const getOllamaRecommendation = async (
    sensorData: SensorData,
    weatherForecast: string
): Promise<AIRecommendation> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const prompt = `
            You are an expert agricultural AI. formatting your response as a strict JSON object.
            
            Current Sensor Data:
            - Soil Moisture: ${sensorData.soilMoisture}%
            - Temperature: ${sensorData.temperature}°C
            - Humidity: ${sensorData.humidity}%
            - Battery: ${sensorData.batteryLevel}%
            - Weather Forecast: ${weatherForecast}
            
            Analysis Rules:
            1. Optimal moisture is 40-60%.
            2. DO NOT irrigate if raining or rain is predicted.
            3. DO NOT irrigate if battery < 20%.
            
            Return a valid JSON object strictly matching this schema:
            {
                "recommendation": "ON" or "OFF",
                "reason": "Short explanation",
                "confidence_score": number (0-100)
            }
        `;

        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: prompt,
                stream: false,
                format: "json"
            })
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Ollama connection failed. Is it running?');

        const data = await response.json();
        const result = JSON.parse(data.response);

        return result as AIRecommendation;

    } catch (error) {
        console.log('Ollama unavailable, using local recommendation fallback');
        return generateLocalRecommendation(sensorData, weatherForecast);
    }
};

function generateLocalRecommendation(
    sensorData: SensorData,
    weatherForecast: string
): AIRecommendation {
    const moisture = sensorData.soilMoisture;
    const battery = sensorData.batteryLevel;
    const weather = weatherForecast.toLowerCase();
    
    const isRaining = weather.includes('rain') || weather.includes('storm') || weather.includes('shower');
    const lowBattery = battery < 20;
    const drySoil = moisture < 40;
    const wetSoil = moisture > 60;
    
    if (isRaining) {
        return {
            recommendation: 'OFF',
            reason: 'Rain detected - irrigation not needed',
            confidence_score: 95
        };
    }
    
    if (lowBattery) {
        return {
            recommendation: 'OFF',
            reason: `Battery critically low (${battery}%) - conserve power`,
            confidence_score: 90
        };
    }
    
    if (drySoil) {
        return {
            recommendation: 'ON',
            reason: `Soil moisture low (${moisture}%) - irrigation recommended`,
            confidence_score: 85
        };
    }
    
    if (wetSoil) {
        return {
            recommendation: 'OFF',
            reason: `Soil moisture optimal (${moisture}%) - no irrigation needed`,
            confidence_score: 80
        };
    }
    
    return {
        recommendation: 'OFF',
        reason: `Soil moisture at ${moisture}% - within acceptable range`,
        confidence_score: 70
    };
}

export const getNutrientAnalysis = async (
    sensorData: SensorData,
    nutrients: { nitrogen: string; phosphorus: string; potassium: string; pH: number }
): Promise<string> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const prompt = `
            You are an expert plant biologist and agronomist.
            
            Context:
            - Soil Moisture: ${sensorData.soilMoisture}%
            - Nitrogen (N): ${nutrients.nitrogen} (Critical for leaf growth)
            - Phosphorus (P): ${nutrients.phosphorus} (Root development)
            - Potassium (K): ${nutrients.potassium} (Overall health)
            - Soil pH: ${nutrients.pH}
            
            The user is seeing "Low Water Absorption" efficiency.
            
            Task: Explain specifically how the current nutrient levels (especially if N or P is low) are reducing the plant's ability to absorb water. 
            
            Format your response as a **short, bulleted list**. 
            - Use **Bold** for key terms.
            - Keep each point under 15 words.
            - Focus strictly on "Root Pressure" and "Osmosis".
            - No introductory fluff.
        `;

        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: prompt,
                stream: false
            })
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Ollama API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.response;

    } catch (error) {
        console.log("Ollama unavailable, using local analysis fallback");
        return generateLocalNutrientAnalysis(nutrients, sensorData.soilMoisture);
    }
};

function generateLocalNutrientAnalysis(
    nutrients: { nitrogen: string; phosphorus: string; potassium: string; pH: number },
    soilMoisture: number
): string {
    const points: string[] = [];
    
    if (nutrients.nitrogen === 'LOW' || nutrients.nitrogen === 'CRITICAL') {
        points.push("• **Low Nitrogen** reduces **root pressure** and cellular **osmotic potential**");
        points.push("• Insufficient **N** limits **proton pumps**, weakening active water uptake");
    }
    if (nutrients.phosphorus === 'LOW' || nutrients.phosphorus === 'CRITICAL') {
        points.push("• **Phosphorus deficit** impairs **ATP production**, reducing root **osmotic drive**");
        points.push("• Low **P** limits **root hair** development, decreasing absorption surface");
    }
    if (nutrients.pH < 6.0 || nutrients.pH > 7.5) {
        points.push("• **pH imbalance** locks nutrients, stunting **root osmotic function**");
    }
    if (soilMoisture < 40) {
        points.push("• **Dry soil** increases solute concentration, hindering **osmosis** into roots");
    }
    
    if (points.length === 0) {
        points.push("• Water absorption limited by **environmental stress** despite adequate nutrients");
        points.push("• Check **soil compaction** and **root zone aeration** for optimal **osmosis**");
    }
    
    return points.join("\n");
}

/**
 * Generic helper for simple text generation
 */
export const getOllamaResponse = async (systemPrompt: string, userPrompt: string): Promise<string> => {
    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: `Context: ${systemPrompt}\n\nUser Question: ${userPrompt}\nAnswer:`,
                stream: false
            })
        });

        if (!response.ok) throw new Error('Ollama connection failed');
        const data = await response.json();
        return data.response.trim();
    } catch (error) {
        console.error("Ollama Response Error:", error);
        return "ERROR";
    }
};
