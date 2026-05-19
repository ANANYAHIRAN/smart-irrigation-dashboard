import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ta';

interface Translations {
    [key: string]: {
        en: string;
        ta: string;
    };
}

export const translations: Translations = {
    dashboard: { en: 'Dashboard', ta: 'முகப்பு' },
    nutrients: { en: 'Nutrients', ta: 'ஊட்டச்சத்துகள்' },
    history: { en: 'History', ta: 'வரலாறு' },
    settings: { en: 'Settings', ta: 'அமைப்புகள்' },
    systemInfo: { en: 'System Info', ta: 'கணினி தகவல்' },
    soilMoisture: { en: 'Soil Moisture', ta: 'மண் ஈரம்' },
    temperature: { en: 'Temperature', ta: 'வெப்பநிலை' },
    humidity: { en: 'Humidity', ta: 'ஈரப்பதம்' },
    rainStatus: { en: 'Rain Status', ta: 'மழை நிலை' },
    raining: { en: 'Raining', ta: 'மழை பெய்கிறது' },
    dry: { en: 'Dry', ta: 'வறண்ட' },
    rainSoon: { en: 'Rain Soon', ta: 'விரைவில் மழை' },
    pumpControl: { en: 'Pump Control', ta: 'மோட்டார் கட்டுப்பாடு' },
    agroVoice: { en: 'AgroVoice', ta: 'குரல் உதவி' },
    listening: { en: 'Listening...', ta: 'கேட்கிறது...' },
    processing: { en: 'Processing...', ta: 'செயலாக்குகிறது...' },
    speakNow: { en: 'Speak Now', ta: 'பேசவும்' },
    irrigationMode: { en: 'Irrigation Mode', ta: 'நீர்ப்பாசன முறை' },
    auto: { en: 'AUTO', ta: 'தானியங்கி' },
    manual: { en: 'MANUAL', ta: 'மனிதரால்' },
    nextWatering: { en: 'Next Watering', ta: 'அடுத்த பாய்ச்சல்' },
    lastWatered: { en: 'Last Watered', ta: 'கடைசி பாய்ச்சல்' },
    waterSaved: { en: 'Water Saved', ta: 'நீர் சேமிப்பு' },
    liters: { en: 'Liters', ta: 'லிட்டர்' },
    battery: { en: 'Battery', ta: 'பேட்டரி' },
    weatherAlert: { en: 'Weather Alert', ta: 'வானிலை எச்சரிக்கை' },
    rainPaused: { en: 'Irrigation Paused', ta: 'பாசனம் நிறுத்தப்பட்டது' },
    radarAnalysis: { en: 'Radar Analysis', ta: 'ரேடார் ஆய்வு' },
    precipDetected: { en: 'Precipitation Detected', ta: 'மழை கண்டறியப்பட்டது' },
    clearSkies: { en: 'Clear Skies', ta: 'வானம் தெளிவாக உள்ளது' },
    // New Error Translations
    micDenied: { en: 'Mic permission denied', ta: 'மைக் அனுமதி மறுக்கப்பட்டது' },
    enableMic: { en: 'Enable Microphone', ta: 'மைக்கை இயக்கு' },
    permissionHelp: { en: 'Please allow microphone access in your browser settings.', ta: 'உங்கள் உலாவி அமைப்புகளில் மைக் அணுகலை அனுமதிக்கவும்.' },
    noSpeech: { en: 'No speech detected', ta: 'பேச்சைக் கேட்க முடியவில்லை' },
    networkError: { en: 'Network error', ta: 'இணைய பிழை' },
    genericError: { en: 'Error occurred', ta: 'பிழை ஏற்பட்டது' },
    voiceNotSupported: { en: 'Voice API not supported', ta: 'குரல் API ஆதரிக்கப்படவில்லை' },
    switchedToTamil: { en: 'Switched to Tamil', ta: 'மொழி தமிழுக்கு மாற்றப்பட்டது' },
    switchedToEnglish: { en: 'Switched to English', ta: 'Switched to English' },
    pumpOn: { en: 'Turning pump ON', ta: 'மோட்டார் ஆன் செய்யப்படுகிறது' },
    pumpOff: { en: 'Turning pump OFF', ta: 'மோட்டார் ஆஃப் செய்யப்படுகிறது' },
    commandNotRecognized: { en: 'Command not recognized', ta: 'கட்டளை புரியவில்லை' },
    greeting: { en: 'Do you need any help?', ta: 'வணக்கம், நான் ஏதாவது உதவி செய்ய வேண்டுமா?' }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: string) => {
        return translations[key]?.[language] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
