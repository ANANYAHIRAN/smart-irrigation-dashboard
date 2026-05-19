# ESP32 + Dashboard Connection Guide

## Overview

This guide connects your ESP32 hardware to the Smart Irrigation Dashboard using **Supabase** as the cloud backend.

```
┌──────────┐      WiFi      ┌──────────┐   Realtime   ┌─────────────┐
│  ESP32   │ ───────────────│ Supabase │──────────────│  Dashboard  │
│ Sensors  │    HTTP REST   │ Database │   Updates    │   (React)   │
└──────────┘                └──────────┘              └─────────────┘
```

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Choose your organization, name it "smart-irrigation"
4. Select region closest to you
5. Wait for project creation (~2 minutes)

### 1.2 Get API Credentials

1. In Supabase dashboard, go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.3 Initialize Database Schema

1. Go to **SQL Editor** → **New query**
2. Copy and paste the contents of `supabase_schema.sql`:

```sql
-- Create table for sensor readings
CREATE TABLE sensor_readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    temperature FLOAT,
    humidity FLOAT,
    soil_moisture FLOAT,
    rain_status TEXT,
    battery_level FLOAT,
    water_consumed FLOAT DEFAULT 0,
    water_saved FLOAT DEFAULT 0
);

-- Create table for system status
CREATE TABLE system_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    pump_status BOOLEAN DEFAULT FALSE,
    irrigation_mode TEXT DEFAULT 'AUTO',
    last_watered TIMESTAMPTZ,
    next_scheduled_water TIMESTAMPTZ
);

-- Create table for logs
CREATE TABLE logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMAMPTZ DEFAULT NOW(),
    level TEXT,
    message TEXT,
    details JSONB
);

-- Enable Row Level Security
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Create policies (open access for demo)
CREATE POLICY "Public Access" ON sensor_readings FOR ALL USING (true);
CREATE POLICY "Public Access" ON system_status FOR ALL USING (true);
CREATE POLICY "Public Access" ON logs FOR ALL USING (true);

-- Create Realtime Publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE sensor_readings, system_status;

-- Insert initial system status
INSERT INTO system_status (pump_status, irrigation_mode) VALUES (FALSE, 'AUTO');
```

3. Click **Run** to execute

## Step 2: Dashboard Configuration

### 2.1 Update Environment Variables

1. In your dashboard project folder, create/edit `.env`:

```bash
# .env file
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Replace with your actual Supabase credentials

### 2.2 Restart Dashboard

```bash
npm run dev
```

## Step 3: ESP32 Firmware Setup

### 3.1 Install Arduino IDE & Libraries

1. Download [Arduino IDE](https://www.arduino.cc/en/software)
2. Add ESP32 board support:
   - File → Preferences → Additional Board Manager URLs
   - Add: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Tools → Board → Board Manager → Search "ESP32" → Install

3. Install required libraries:
   - Sketch → Include Library → Manage Libraries
   - Search and install:
     - `ArduinoJson` by Benoit Blanchon (v6.x)
     - `DHT sensor library` by Adafruit (if using DHT)
     - `Adafruit Unified Sensor` (dependency for DHT)

### 3.2 Configure Firmware

1. Open `esp32-firmware/SmartIrrigationESP32.ino`
2. Update WiFi and Supabase credentials (lines 28-35):

```cpp
// WiFi Credentials
const char* WIFI_SSID = "YourWiFiNetwork";
const char* WIFI_PASSWORD = "YourWiFiPassword";

// Supabase Configuration
const char* SUPABASE_URL = "https://your-project.supabase.co";
const char* SUPABASE_KEY = "your-anon-key";
```

### 3.3 Select Board & Upload

1. Connect ESP32 via USB
2. In Arduino IDE:
   - Tools → Board → ESP32 Arduino → "ESP32 Dev Module"
   - Tools → Port → Select your COM port
3. Click **Upload** (arrow button)
4. Open **Serial Monitor** (Ctrl+Shift+M), set baud rate to **115200**

## Step 4: Hardware Assembly

Follow the wiring diagram in `HARDWARE_SETUP.md`. Quick summary:

| Component | ESP32 Pin |
|-----------|-----------|
| Soil Moisture AOUT | GPIO34 |
| DHT22 DATA | GPIO4 |
| Rain Sensor D0 | GPIO35 |
| Relay IN | GPIO5 |
| Battery Monitor | GPIO36 |

## Step 5: Testing

### 5.1 Verify Serial Output

In Arduino Serial Monitor, you should see:

```
=== Smart Irrigation ESP32 Starting ===
Connecting to WiFi: YourNetwork....
WiFi Connected! IP: 192.168.1.105
=== Setup Complete ===
Sensors - Moisture: 45.5%, Temp: 25.3°C, Humidity: 60.2%, Rain: NO
Sending to Supabase: {"temperature":25.3,"humidity":60.2,"soil_moisture":45.5...}
Data sent successfully!
```

### 5.2 Verify Supabase Data

1. In Supabase dashboard, go to **Table Editor** → `sensor_readings`
2. You should see new rows appearing every 30 seconds

### 5.3 Verify Dashboard

1. Open dashboard at `http://localhost:3000`
2. You should see live sensor values updating
3. Try toggling pump in dashboard - relay should click

## Step 6: Data Flow Verification

Test complete data path:

```
1. Touch soil sensor → Moisture value changes in dashboard
2. Blow on DHT22 → Temperature/humidity updates
3. Put water on rain sensor → "Rain: YES" appears
4. Click "Turn Pump ON" in dashboard → Relay activates
```

## Troubleshooting

### WiFi Connection Issues

```
[Error] Failed to connect to WiFi
```
- Ensure 2.4GHz network (ESP32 doesn't support 5GHz)
- Check SSID and password spelling
- Move ESP32 closer to router

### Supabase Connection Issues

```
HTTP Error: 401
```
- Check `SUPABASE_KEY` is correct
- Verify table has RLS policy allowing inserts

```
HTTP Error: 400
```
- Check JSON payload format
- Verify column names match exactly (`soil_moisture`, not `soilMoisture`)

### Dashboard Not Updating

- Check browser console for errors
- Verify Supabase realtime is enabled
- Try refreshing dashboard

## Optional: Production Considerations

### Security
- Remove public RLS policies
- Add authentication with Row Level Security
- Use Supabase Edge Functions for sensitive operations
- Store API keys in environment variables only

### Reliability
- Add watchdog timer to ESP32 code
- Implement retry logic for failed HTTP requests
- Add local data buffering if WiFi drops
- Use deep sleep mode between readings for battery saving

### Monitoring
- Set up Supabase alerts for abnormal readings
- Add SMS/email notifications for critical events
- Log ESP32 errors to `logs` table

## Architecture Summary

```
                    ┌─────────────────────────────────────┐
                    │           CLOUD (Supabase)          │
                    │  ┌──────────────┐  ┌─────────────┐  │
                    │  │sensor_readings│  │system_status│  │
                    │  └──────────────┘  └─────────────┘  │
                    └──────────┬──────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌─────────────────┐ ┌──────────┐ ┌─────────────────┐
    │   ESP32 +       │ │  Web     │ │  Mobile/Other   │
    │   Sensors       │ │Dashboard │ │  Clients        │
    └─────────────────┘ └──────────┘ └─────────────────┘
```

## Next Steps

1. **Calibrate sensors** - Follow calibration in `HARDWARE_SETUP.md`
2. **Install in field** - Waterproof enclosure, proper sensor placement
3. **Configure alerts** - Set up low moisture/pump failure notifications
4. **Add automation** - Let AI recommend irrigation schedules based on weather

## Support

- Check Serial Monitor output first
- Verify Supabase Table Editor shows data
- Test dashboard with mock data before connecting hardware
- Review `HARDWARE_SETUP.md` for wiring details
