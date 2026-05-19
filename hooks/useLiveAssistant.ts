

import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from "@google/genai";
import type { SensorData, AssistantTranscript, IrrigationMode } from '../types';

const API_KEY = process.env.API_KEY; 

// --- Audio Encoding/Decoding Helpers ---

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Custom Hook ---

type AssistantStatus = 'idle' | 'connecting' | 'listening' | 'thinking' | 'error';

interface UseLiveAssistantProps {
  sensorData: SensorData;
  irrigationMode: IrrigationMode;
  onTranscriptUpdate: (transcript: AssistantTranscript) => void;
  onStatusChange: (status: AssistantStatus) => void;
}

export const useLiveAssistant = ({ sensorData, irrigationMode, onTranscriptUpdate, onStatusChange }: UseLiveAssistantProps) => {
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRefs = useRef<{ input: AudioContext | null, output: AudioContext | null, source: MediaStreamAudioSourceNode | null, processor: ScriptProcessorNode | null }>({ input: null, output: null, source: null, processor: null });
  const audioPlaybackQueue = useRef<{ buffer: AudioBuffer, startTime: number }[]>([]);
  const nextStartTime = useRef(0);
  
  const setStatus = (newStatus: AssistantStatus) => {
    onStatusChange(newStatus);
  };

  const systemInstruction = `**Persona: Aura**
You are Aura, a voice assistant for a smart irrigation dashboard. Follow these rules strictly:
1.  **Top Priority: Language.** Respond *only* in the language the user is speaking. Never switch languages.
2.  **Accuracy is Critical.** Base your answers *strictly and exclusively* on the real-time data provided below. Do not add, infer, or invent any information.
3.  **Be Concise.** Keep your spoken answers short and to the point.

**Live System Data:**
-   Soil Moisture: ${sensorData.soilMoisture.toFixed(1)}%
-   Temperature: ${sensorData.temperature.toFixed(1)}°C
-   Humidity: ${sensorData.humidity.toFixed(1)}%
-   Weather: "${sensorData.rainStatus}"
-   Battery: ${sensorData.batteryLevel.toFixed(1)}%
-   Pump: ${sensorData.pumpStatus}
-   Mode: ${irrigationMode}
-   Water Saved: ${sensorData.waterSaved.toFixed(1)} L
`;

  const processPlaybackQueue = useCallback(() => {
    const outputCtx = audioContextRefs.current.output;
    if (!outputCtx) return;

    while (audioPlaybackQueue.current.length > 0 && audioPlaybackQueue.current[0].startTime < outputCtx.currentTime + 0.1) {
        const { buffer, startTime } = audioPlaybackQueue.current.shift()!;
        const source = outputCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(outputCtx.destination);
        source.start(startTime);
    }
  }, []);


  const start = useCallback(async () => {
    if (!API_KEY) {
        console.error("API Key is not configured.");
        setStatus('error');
        return;
    }
    
    stop(); 
    setStatus('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRefs.current.input = inputCtx;
      audioContextRefs.current.output = outputCtx;
      nextStartTime.current = 0;
      
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
        },
        callbacks: {
          onopen: () => {
            setStatus('listening');
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (event) => {
              const inputData = event.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
            audioContextRefs.current.source = source;
            audioContextRefs.current.processor = processor;
          },
          onmessage: async (message: LiveServerMessage) => {
              if (message.serverContent?.inputTranscription) {
                  const { text, isFinal } = message.serverContent.inputTranscription;
                  onTranscriptUpdate({ source: 'user', text, isFinal });
              }

              if (message.serverContent?.outputTranscription) {
                  const { text, isFinal } = message.serverContent.outputTranscription;
                  setStatus('thinking');
                  onTranscriptUpdate({ source: 'model', text, isFinal });
              }
              
              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio) {
                   const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                   const startAt = Math.max(nextStartTime.current, outputCtx.currentTime);
                   audioPlaybackQueue.current.push({ buffer: audioBuffer, startTime: startAt });
                   nextStartTime.current = startAt + audioBuffer.duration;
                   processPlaybackQueue();
              }
              
              if(message.serverContent?.turnComplete) {
                  setStatus('listening');
              }
          },
          onclose: () => {
            stop();
          },
          onerror: (e) => {
            console.error(e);
            setStatus('error');
            stop();
          },
        },
      });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }, [systemInstruction, onTranscriptUpdate, onStatusChange]);

  const stop = useCallback(() => {
    const { input, output, source, processor } = audioContextRefs.current;
    
    source?.disconnect();
    processor?.disconnect();
    input?.close().catch(console.error);
    output?.close().catch(console.error);

    sessionPromiseRef.current?.then(session => session.close()).catch(console.error);
    sessionPromiseRef.current = null;
    audioContextRefs.current = { input: null, output: null, source: null, processor: null };
    audioPlaybackQueue.current = [];

    setStatus('idle');
  }, [onStatusChange]);

  useEffect(() => {
      const interval = setInterval(processPlaybackQueue, 100);
      return () => clearInterval(interval);
  }, [processPlaybackQueue]);

  return { start, stop };
};