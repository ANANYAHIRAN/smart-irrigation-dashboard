import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, MessageSquare, Loader2, Settings, Key } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getOllamaResponse } from '../services/ollamaService';
import { speakNaturalTamil } from '../services/ttsService';

interface AgroVoiceProps {
    onCommand: (command: string) => void;
}

export const AgroVoice: React.FC<AgroVoiceProps> = ({ onCommand }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState(localStorage.getItem('elevenlabs_api_key') || '');
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('');
    const { language, setLanguage, t } = useLanguage();
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (!window.isSecureContext) {
            setFeedback('Microphone requires a secure context (localhost). Switch to http://localhost:5173');
            return;
        }
    }, []);

    const handleApiKeySave = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setApiKey(val);
        localStorage.setItem('elevenlabs_api_key', val);
    };

    const speak = (msg: string) => {
        speakNaturalTamil(msg, apiKey);
    };

    const handleOpen = () => {
        setIsOpen(true);
        const greeting = "வணக்கம், நான் Smart Agro Assistant. மோட்டார் ஆன் செய்யவா?";
        setFeedback(greeting);
        speak(greeting);

        setTimeout(() => {
            startListening();
        }, 4000);
    };

    const handleClose = () => {
        setIsOpen(false);
        setShowSettings(false);
        stopListening();
        setFeedback('');
        setTranscript('');
        window.speechSynthesis.cancel();
    };

    const startListening = () => {
        if (!('_webkitSpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
            setFeedback(t('voiceNotSupported'));
            return;
        }

        try {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            recognition.continuous = false;
            recognition.interimResults = false;
            // Listen in Tamil to capture "Vanakkam" correctly, or English if preferred.
            // Using 'ta-IN' heavily prefers Tamil but usually captures English commands too.
            recognition.lang = language === 'en' ? 'en-US' : 'ta-IN';

            recognition.onstart = () => {
                setIsListening(true);
                setFeedback(language === 'ta' ? 'கேட்கிறேன்...' : 'Listening...');
                setTranscript('');
            };

            recognition.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                processCommandWithAI(text);
            };

            recognition.onerror = (event: any) => {
                if (event.error === 'not-allowed') {
                    setFeedback(t('micDenied'));
                } else if (event.error !== 'no-speech') {
                    // unexpected error
                }
                setIsListening(false);
            };

            recognition.onend = () => setIsListening(false);
            recognition.start();
        } catch (err) {
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsListening(false);
    };

    const processCommandWithAI = async (text: string) => {
        setIsProcessing(true);
        setIsListening(false);
        setFeedback(t('processing'));

        // Advanced System Prompt for Agentic Behavior
        const systemPrompt = `
        You are a smart, friendly, and helpful agricultural assistant for Tamil Nadu farmers.
        User Transcript: "${text}"

        Your Goal:
        1. Analyze the intent (PUMP_ON, PUMP_OFF, LANGUAGE_TAMIL, LANGUAGE_ENGLISH, GREETING, CONVERSATION, UNKNOWN).
        2. Generate a polite, short response in the SAME LANGUAGE as the user (Tamil or English).
        
        Rules:
        - If text is "Vanakkam" or "Hello", intent is GREETING. Reply nicely in Tamil/English.
        - If "Pump On" / "Motor On", intent is PUMP_ON.
        - If "Pump Off" / "Motor Off", intent is PUMP_OFF.
        - If random question like "How are you?", intent is CONVERSATION. Reply naturally.
        - Keep replies VERY SHORT (1 sentence) for speaking.

        Output Format:
        Return a Strict JSON Object ONLY:
        {
            "intent": "PUMP_ON" | "PUMP_OFF" | "LANGUAGE_TAMIL" | "LANGUAGE_ENGLISH" | "GREETING" | "CONVERSATION" | "UNKNOWN",
            "reply": "The text you want to speak back to the user"
        }
        `;

        try {
            const aiResponseRaw = await getOllamaResponse(systemPrompt, text);
            console.log("AI Raw Response:", aiResponseRaw);

            // Attempt to parse JSON. Llama sometimes adds text around JSON, so we clean it.
            const jsonMatch = aiResponseRaw.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : "{}";

            let result;
            try {
                result = JSON.parse(jsonStr);
            } catch (e) {
                // Fallback if JSON fails
                console.error("JSON Parse Error", e);
                result = { intent: "UNKNOWN", reply: "Sorry, I didn't understand that." };
            }

            const intent = result.intent?.toUpperCase() || "UNKNOWN";
            const reply = result.reply || "Command processed.";

            setFeedback(reply);
            speak(reply);

            // Execute Actions
            if (intent === 'PUMP_ON') onCommand('PUMP_ON');
            if (intent === 'PUMP_OFF') onCommand('PUMP_OFF');
            if (intent === 'LANGUAGE_TAMIL') setLanguage('ta');
            if (intent === 'LANGUAGE_ENGLISH') setLanguage('en');

        } catch (error) {
            setFeedback(t('genericError'));
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={handleOpen}
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white animate-bounce-subtle hover:scale-110 transition-transform"
            >
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                <MessageSquare className="w-8 h-8" />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative aspect-[4/5] md:aspect-auto md:h-[600px]">
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl dark:text-white">AgroVoice AI</h2>
                            <p className="text-xs text-indigo-500 font-medium">Agentic Mode</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'}`}
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors dark:text-gray-400">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="absolute top-24 left-0 right-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 p-6 animate-in slide-in-from-top-4 shadow-lg">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            Voice API Configuration
                        </h3>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ElevenLabs API Key</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={handleApiKeySave}
                                placeholder="sk_..."
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                            />
                        </div>
                    </div>
                )}

                {/* Main Interaction Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-8">
                    <div className="relative">
                        {isListening && (
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping scale-150" />
                        )}
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isListening ? 'bg-indigo-600 scale-110' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            {isProcessing ? (
                                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                            ) : (
                                <Mic className={`w-12 h-12 ${isListening ? 'text-white' : 'text-gray-400'}`} />
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className={`text-2xl font-bold transition-colors ${isListening ? 'text-indigo-600' : 'dark:text-white'}`}>
                            {feedback}
                        </h3>
                        {transcript && (
                            <p className="text-gray-500 italic text-lg opacity-75">"{transcript}"</p>
                        )}
                        {apiKey && feedback && !isListening && !isProcessing && (
                            <p className="text-xs text-indigo-400 font-medium animate-pulse">Speaking with Neural Voice...</p>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-8 bg-gray-50 dark:bg-gray-800/50 flex justify-center">
                    <button
                        onClick={() => isListening ? stopListening() : startListening()}
                        disabled={isProcessing}
                        className={`group p-6 rounded-full shadow-xl transition-all active:scale-95 ${isListening ? 'bg-red-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {isListening ? (
                            <MicOff className="w-8 h-8 text-white" />
                        ) : (
                            <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
