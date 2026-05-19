-- Create table for sensor readings
CREATE TABLE sensor_readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    temperature FLOAT,
    humidity FLOAT,
    soil_moisture FLOAT,
    rain_status TEXT, -- 'dry', 'rain', 'predicted'
    battery_level FLOAT,
    water_consumed FLOAT DEFAULT 0,
    water_saved FLOAT DEFAULT 0
);

-- Create table for system status (Singleton or latest state)
CREATE TABLE system_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    pump_status BOOLEAN DEFAULT FALSE,
    irrigation_mode TEXT DEFAULT 'AUTO', -- 'AUTO', 'MANUAL'
    last_watered TIMESTAMPTZ,
    next_scheduled_water TIMESTAMPTZ
);

-- Insert initial system status row (we only need one)
INSERT INTO system_status (pump_status, irrigation_mode) VALUES (FALSE, 'AUTO');

-- Create table for logs
CREATE TABLE logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    level TEXT, -- 'info', 'warning', 'error'
    message TEXT,
    details JSONB
);

-- Enable Row Level Security (RLS) - Optional for initial dev but recommended
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow public read/write for demo purposes, restrict in production)
CREATE POLICY "Public Access" ON sensor_readings FOR ALL USING (true);
CREATE POLICY "Public Access" ON system_status FOR ALL USING (true);
CREATE POLICY "Public Access" ON logs FOR ALL USING (true);

-- Create Realtime Publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE sensor_readings, system_status;
