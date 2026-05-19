import { useRef } from 'react';

// Default voice ID for a natural sounding Tamil voice (Multilingual v2)
// 'Rachel' is often good, but we need a specific multilingual one. 
// 'Sarah' or 'Charlie' are popular. Let's start with a known reliable ID or let user pick.
// Using a generic ID for now, user can swap. 
// '21m00Tcm4TlvDq8ikWAM' is Rachel.
// To reliably get Tamil, we need the "eleven_multilingual_v2" model.

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
// const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel (Good default)
const VOICE_ID = 'jsCqWAovK2LkecY7zXl4'; // Freya (Often used for calm assistants)

export const speakNaturalTamil = async (text: string, apiKey: string | null) => {
    if (!apiKey) {
        console.warn("No ElevenLabs API Key found. Falling back to browser TTS.");
        fallbackToBrowserTTS(text);
        return;
    }

    try {
        const response = await fetch(`${ELEVENLABS_API_URL}/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2", // Critical for Tamil
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.5,
                    use_speaker_boost: true
                }
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("ElevenLabs API Error:", error);
            fallbackToBrowserTTS(text); // Fallback on error
            return;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
            URL.revokeObjectURL(audioUrl); // Cleanup
        };

        await audio.play();

    } catch (error) {
        console.error("TTS Network Error:", error);
        fallbackToBrowserTTS(text);
    }
};

const fallbackToBrowserTTS = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ta-IN';
    utterance.rate = 0.9;

    // Try to find a high-quality Tamil voice if available (e.g., Rishi on Mac)
    const voices = window.speechSynthesis.getVoices();
    const tamilVoice = voices.find(v => v.lang.includes('ta') || v.name.includes('Tamil'));
    if (tamilVoice) {
        utterance.voice = tamilVoice;
    }

    window.speechSynthesis.speak(utterance);
};
