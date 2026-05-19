import { useState, useRef, useMemo } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { SensorData, IrrigationMode } from '../types';

const API_KEY = process.env.API_KEY;

interface UseTextAssistantProps {
  sensorData: SensorData;
  irrigationMode: IrrigationMode;
}

export const useTextAssistant = ({ sensorData, irrigationMode }: UseTextAssistantProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const systemInstruction = `You are a helpful text-based AI assistant for a smart irrigation system.
Your most important rule is to respond in the exact same language the user types.
Your second most important rule is to base your answers strictly and only on the data provided. Do not invent information.
Keep your answers concise.

Here is the current system data:
Soil Moisture: ${sensorData.soilMoisture.toFixed(1)}%
Temperature: ${sensorData.temperature.toFixed(1)}°C
Humidity: ${sensorData.humidity.toFixed(1)}%
Weather Forecast: "${sensorData.rainStatus}"
Battery Level: ${sensorData.batteryLevel.toFixed(1)}%
Pump Status: ${sensorData.pumpStatus}
Irrigation Mode: ${irrigationMode}
Water Saved: ${sensorData.waterSaved.toFixed(1)} Liters
`;

  const chatRef = useRef<Chat | null>(null);

  const ai = useMemo(() => {
    if (!API_KEY) return null;
    return new GoogleGenAI({ apiKey: API_KEY });
  }, []);

  const initializeChat = () => {
    if (!ai) {
        setError("API Key not configured.");
        return;
    }
    // Create a new chat session for each conversation
    chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: systemInstruction,
        },
    });
  };

  const sendMessage = async (message: string): Promise<string | null> => {
    if (!API_KEY) {
        setError("API Key not configured.");
        return null;
    }
    
    // Always initialize a new chat to get the latest sensor data in the system prompt
    initializeChat();
    
    setIsLoading(true);
    setError(null);
    
    try {
        const response = await chatRef.current!.sendMessage({ message });
        setIsLoading(false);
        return response.text;
    } catch (e) {
        console.error("Error sending text message:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        setError(errorMessage);
        setIsLoading(false);
        return null;
    }
  };

  return { isLoading, error, sendMessage };
};
