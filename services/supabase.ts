import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Anon Key in environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');


// Types for database tables
export type SensorReading = {
    id: string;
    created_at: string;
    temperature: number;
    humidity: number;
    soil_moisture: number;
    rain_status: string;
    battery_level: number;
    water_consumed: number;
    water_saved: number;
};

export type SystemStatus = {
    id: string;
    updated_at: string;
    pump_status: boolean;
    irrigation_mode: 'AUTO' | 'MANUAL';
    last_watered: string | null;
    next_scheduled_water: string | null;
};

export const logSystemEvent = async (level: 'info' | 'warning' | 'error', message: string, details?: any) => {
    try {
        await supabase.from('logs').insert({
            level,
            message,
            details: details ? JSON.stringify(details) : null,
        });
    } catch (error) {
        console.error('Failed to log event:', error);
    }
};
