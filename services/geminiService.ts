
import { GoogleGenAI, Type } from "@google/genai";
import type { SensorData, AIRecommendation } from '../types';

// IMPORTANT: In a real application, the API key is set in an environment variable.
// We are using a placeholder here for demonstration purposes.
// The user of this app should configure their own API key.
const API_KEY = process.env.API_KEY; 

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const recommendationSchema = {
    type: Type.OBJECT,
    properties: {
        recommendation: {
            type: Type.STRING,
            description: "The irrigation pump recommendation, either 'ON' or 'OFF'.",
            enum: ['ON', 'OFF'],
        },
        reason: {
            type: Type.STRING,
            description: 'A brief, one-sentence reason for the recommendation.',
        },
        confidence_score: {
            type: Type.NUMBER,
            description: 'A confidence score for the recommendation from 0 to 100.',
        },
    },
    required: ['recommendation', 'reason', 'confidence_score'],
};

export const getIrrigationRecommendation = async (
  sensorData: SensorData
): Promise<AIRecommendation | { error: string }> => {
  if (!API_KEY) {
    return { error: "API Key is not configured. Please set the API_KEY environment variable." };
  }
  
  try {
    const prompt = `
      You are an expert agronomist AI for a smart irrigation system. Your goal is to provide irrigation recommendations to conserve water and maximize crop health.
      
      Current sensor data:
      - Soil Moisture: ${sensorData.soilMoisture.toFixed(1)}%
      - Temperature: ${sensorData.temperature.toFixed(1)}°C
      - Humidity: ${sensorData.humidity.toFixed(1)}%
      - Rain Prediction: "${sensorData.rainStatus}"
      - System Battery Level: ${sensorData.batteryLevel.toFixed(1)}%

      Analyze the data. The optimal soil moisture is between 40% and 60%. Avoid watering if rain is predicted or if the battery is below 30% unless absolutely necessary.
      
      Based on this data, should the water pump be turned ON or OFF?
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recommendationSchema,
      },
    });
    
    const text = response.text.trim();
    const result = JSON.parse(text);

    return result as AIRecommendation;

  } catch (error) {
    console.error('Error fetching irrigation recommendation:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { error: `Failed to get AI recommendation: ${errorMessage}` };
  }
};
