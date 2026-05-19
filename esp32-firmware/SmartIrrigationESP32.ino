/*
 * Smart Irrigation Dashboard - ESP32 Firmware
 * 
 * This code reads soil moisture, temperature, humidity sensors
 * and sends data to Supabase for the dashboard to display.
 * 
 * Hardware Required:
 * - ESP32 DevKit
 * - Capacitive Soil Moisture Sensor (v1.2)
 * - DHT11 Temperature/Humidity Sensor
 * - Rain Sensor
 * - 5V Relay Module for Pump Control
 * - 5V Mini Pump
 * - OLED Display (I2C) - Optional
 * - Green LED + 220Ω resistor
 * - Red LED + 220Ω resistor
 * - 12V Battery with Solar Charge Controller
 * - Buck Converter (12V → 5V)
 * 
 * Power Setup:
 * - 12V Battery → Controller LOAD → Fuse → Buck Converter → 5V
 * - 5V powers: ESP32, Relay, DHT11, Rain Sensor, Soil Moisture, OLED
 * 
 * Wiring:
 * - Soil Moisture: VCC->5V, GND->GND, AO->GPIO34
 * - DHT11: VCC->5V, GND->GND, DATA->GPIO4
 * - Rain Sensor: VCC->5V, GND->GND, AO->GPIO35
 * - Relay: VCC->5V, GND->GND, IN->GPIO26
 * - OLED I2C: VCC->5V, GND->GND, SDA->GPIO21, SCL->GPIO22
 * - Green LED: GPIO18 -> 220Ω -> LED -> GND
 * - Red LED: GPIO19 -> 220Ω -> LED -> GND
 * - Pump: Buck 5V+ -> Relay COM, Relay NO -> Pump+, Pump- -> GND
 *   (Add 1N4007 diode across pump: cathode->Pump+, anode->Pump-)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>  // DHT sensor library

// DHT setup
#define DHT_TYPE DHT11  // Change to DHT22 if using DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// ============= CONFIGURATION =============
// WiFi Credentials
const char* WIFI_SSID = "PEC_TECH";
const char* WIFI_PASSWORD = "tech@123";

// Supabase Configuration
const char* SUPABASE_URL = "https://axkvpbbaasuywhxkbofm.supabase.co";
const char* SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4a3ZwYmJhYXN1eXdoeGtib2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0ODA5NTEsImV4cCI6MjA4NzA1Njk1MX0.prSjOesLEEEYWqGuLpFjkS28cE9O5TWTzfbQ2cHkd5k";

// Device Configuration
const char* DEVICE_ID = "irrigation-system-001";
const unsigned long SEND_INTERVAL = 30000; // Send data every 30 seconds
const unsigned long SENSOR_READ_INTERVAL = 5000; // Read sensors every 5 seconds

// Pin Definitions (Matching your wiring)
#define SOIL_MOISTURE_PIN 34    // ADC pin for soil moisture
#define DHT_PIN 4               // DHT11 data pin
#define RAIN_SENSOR_PIN 35      // Rain sensor analog pin
#define RELAY_PUMP_PIN 26       // Relay control for pump (was GPIO5)
#define GREEN_LED_PIN 18        // Green status LED
#define RED_LED_PIN 19          // Red status/error LED
#define OLED_SDA 21             // OLED I2C SDA
#define OLED_SCL 22             // OLED I2C SCL

// ============= GLOBAL VARIABLES =============
unsigned long lastSendTime = 0;
unsigned long lastSensorReadTime = 0;

// Sensor readings (rolling average)
float soilMoisture = 0;
float temperature = 25.0;  // Default if no DHT
float humidity = 60.0;     // Default if no DHT
bool rainDetected = false;
float batteryLevel = 100.0;
float waterConsumed = 0;
float waterSaved = 0;
bool pumpStatus = false;

// Simple moving average for soil moisture
#define SMOOTHING_WINDOW 10
float moistureReadings[SMOOTHING_WINDOW];
int moistureIndex = 0;

// ============= SETUP =============
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=== Smart Irrigation ESP32 Starting ===");
  
  // Initialize pins
  pinMode(RELAY_PUMP_PIN, OUTPUT);
  digitalWrite(RELAY_PUMP_PIN, LOW); // Pump OFF by default
  
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  digitalWrite(GREEN_LED_PIN, HIGH); // Green ON during startup
  digitalWrite(RED_LED_PIN, LOW);
  
  // Initialize DHT sensor
  dht.begin();
  
  // Initialize ADC for analog sensors
  analogReadResolution(12); // 12-bit resolution (0-4095)
  analogSetAttenuation(ADC_11db); // Full 0-3.3V range
  
  // Initialize smoothing array
  for (int i = 0; i < SMOOTHING_WINDOW; i++) {
    moistureReadings[i] = analogRead(SOIL_MOISTURE_PIN);
    delay(10);
  }
  
  // Connect to WiFi
  connectToWiFi();
  
  // Startup complete - blink green LED
  digitalWrite(GREEN_LED_PIN, LOW);
  delay(200);
  digitalWrite(GREEN_LED_PIN, HIGH);
  
  Serial.println("=== Setup Complete ===");
}

// ============= MAIN LOOP =============
void loop() {
  unsigned long currentTime = millis();
  
  // Reconnect WiFi if needed
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }
  
  // Read sensors periodically
  if (currentTime - lastSensorReadTime >= SENSOR_READ_INTERVAL) {
    readSensors();
    lastSensorReadTime = currentTime;
    
    // Print to Serial for debugging
    Serial.printf("Sensors - Moisture: %.1f%%, Temp: %.1f°C, Humidity: %.1f%%, Rain: %s\n",
                  soilMoisture, temperature, humidity, rainDetected ? "YES" : "NO");
  }
  
  // Send data to Supabase periodically
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    sendDataToSupabase();
    lastSendTime = currentTime;
  }
  
  // Check for pump control commands from dashboard
  checkPumpControl();
  
  // Handle manual serial commands
  handleSerialCommands();
  
  delay(100); // Small delay to prevent watchdog issues
}

// ============= FUNCTIONS =============

void connectToWiFi() {
  Serial.printf("Connecting to WiFi: %s", WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    // Blink red LED while connecting
    digitalWrite(RED_LED_PIN, !digitalRead(RED_LED_PIN));
    attempts++;
  }
  
  digitalWrite(RED_LED_PIN, LOW); // Turn off red LED
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nWiFi Connected! IP: %s\n", WiFi.localIP().toString().c_str());
    digitalWrite(GREEN_LED_PIN, HIGH); // Solid green when connected
  } else {
    Serial.println("\nWiFi Connection Failed!");
    digitalWrite(RED_LED_PIN, HIGH); // Solid red on failure
    digitalWrite(GREEN_LED_PIN, LOW);
  }
}

void readSensors() {
  // Read soil moisture with smoothing
  int rawMoisture = analogRead(SOIL_MOISTURE_PIN);
  moistureReadings[moistureIndex] = rawMoisture;
  moistureIndex = (moistureIndex + 1) % SMOOTHING_WINDOW;
  
  // Calculate average
  long sum = 0;
  for (int i = 0; i < SMOOTHING_WINDOW; i++) {
    sum += moistureReadings[i];
  }
  float avgRaw = sum / SMOOTHING_WINDOW;
  
  // Convert to percentage (calibrate these values for your sensor)
  // Typical capacitive sensor: dry ~3000, wet ~1500
  // Map 3000-1500 to 0-100%
  float moisturePercent = map(avgRaw, 3000, 1500, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);
  
  // Force soil moisture to 0% as requested
  soilMoisture = 0.0;
  
  // Read rain sensor (analog - AO pin)
  // Typical values: dry ~3500, wet/rain ~1500 or lower
  int rainRaw = analogRead(RAIN_SENSOR_PIN);
  rainDetected = (rainRaw < 2500); // Threshold for rain detection
  
  // Read DHT11 temperature and humidity
  float newTemp = dht.readTemperature();
  float newHum = dht.readHumidity();
  
  // Check if readings are valid (not NaN)
  if (!isnan(newTemp) && !isnan(newHum)) {
    temperature = newTemp;
    humidity = newHum;
  }
  
  // Force humidity to 50% as requested
  humidity = 50.0;
  
  // Battery monitoring disabled in this version (no voltage divider)
  // Set to 100% or estimate from controller if available
  batteryLevel = 100.0;
  
  // Estimate water consumed/saved (simplified calculation)
  // In real implementation, use a flow sensor
  if (pumpStatus) {
    waterConsumed += 0.5; // Assume 0.5L per send interval when pumping
  }
  
  // Calculate water saved vs traditional irrigation
  // Traditional typically uses 30-50% more water
  float traditionalUsage = waterConsumed * 1.4; // 40% more
  waterSaved = traditionalUsage - waterConsumed;
}

void sendDataToSupabase() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Cannot send data - WiFi not connected");
    return;
  }
  
  HTTPClient http;
  
  // Ensure URL is properly formatted
  String baseUrl = SUPABASE_URL;
  if (!baseUrl.startsWith("https://")) {
    baseUrl = "https://" + baseUrl;
  }
  // Remove trailing slash if present
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
  }
  
  String url = baseUrl + "/rest/v1/sensor_readings";
  
  Serial.println("=================================");
  Serial.printf("URL: %s\n", url.c_str());
  Serial.printf("Key length: %d\n", String(SUPABASE_KEY).length());
  Serial.print("WiFi status: ");
  Serial.println(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
  
  // Configure HTTP client for HTTPS with SSL bypass
  http.begin(url);
  http.setInsecure(); // Skip SSL certificate validation
  http.setTimeout(15000); // 15 second timeout
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
  http.addHeader("Prefer", "return=minimal");
  
  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["soil_moisture"] = soilMoisture;
  doc["rain_status"] = rainDetected ? "rain" : "dry";
  doc["battery_level"] = batteryLevel;
  doc["water_consumed"] = waterConsumed;
  doc["water_saved"] = waterSaved;
  
  String payload;
  serializeJson(doc, payload);
  
  Serial.printf("Payload: %s\n", payload.c_str());
  Serial.println("Sending POST request...");
  
  int httpCode = http.POST(payload);
  
  Serial.printf("HTTP Code: %d\n", httpCode);
  
  if (httpCode == 201) {
    Serial.println("✓ Data sent successfully!");
    digitalWrite(GREEN_LED_PIN, HIGH);
    digitalWrite(RED_LED_PIN, LOW);
  } else if (httpCode == -11) {
    Serial.println("✗ Connection failed (-11)");
    Serial.println("  Possible causes:");
    Serial.println("  - Wrong Supabase URL or key");
    Serial.println("  - Network/firewall blocking HTTPS");
    Serial.println("  - SSL certificate issues");
    digitalWrite(RED_LED_PIN, HIGH);
    digitalWrite(GREEN_LED_PIN, LOW);
  } else if (httpCode > 0) {
    Serial.printf("✗ Server error: %d\n", httpCode);
    String response = http.getString();
    Serial.printf("Response: %s\n", response.c_str());
    digitalWrite(RED_LED_PIN, HIGH);
  } else {
    Serial.printf("✗ Connection error: %d - %s\n", httpCode, http.errorToString(httpCode).c_str());
    digitalWrite(RED_LED_PIN, HIGH);
  }
  
  http.end();
  Serial.println("=================================");
  
  // Also update system status (pump state)
  updateSystemStatus();
}

void updateSystemStatus() {
  HTTPClient http;
  
  String url = String(SUPABASE_URL) + "/rest/v1/system_status?id=eq.1";
  
  http.begin(url);
  http.setInsecure(); // Bypass SSL for HTTPS
  
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
  
  StaticJsonDocument<256> doc;
  doc["pump_status"] = pumpStatus;
  doc["updated_at"] = "now()";
  
  String payload;
  serializeJson(doc, payload);
  
  http.PATCH(payload);
  http.end();
}

void checkPumpControl() {
  // Poll system_status table to check if dashboard requested pump ON/OFF
  HTTPClient http;
  String url = String(SUPABASE_URL) + "/rest/v1/system_status?select=pump_status,irrigation_mode&limit=1";
  
  http.begin(url);
  http.setInsecure(); // Bypass SSL for HTTPS
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String response = http.getString();
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error && doc.size() > 0) {
      bool requestedPumpState = doc[0]["pump_status"];
      const char* mode = doc[0]["irrigation_mode"];
      
      // Only auto-control if in AUTO mode
      if (strcmp(mode, "AUTO") == 0) {
        if (requestedPumpState != pumpStatus) {
          setPump(requestedPumpState);
        }
      }
    }
  }
  
  http.end();
}

void setPump(bool state) {
  pumpStatus = state;
  digitalWrite(RELAY_PUMP_PIN, state ? HIGH : LOW);
  
  // LED indication: Green for pump OFF, Red for pump ON
  digitalWrite(GREEN_LED_PIN, state ? LOW : HIGH);
  digitalWrite(RED_LED_PIN, state ? HIGH : LOW);
  
  Serial.printf("Pump turned %s\n", state ? "ON" : "OFF");
  
  // Log to Supabase
  HTTPClient http;
  String url = String(SUPABASE_URL) + "/rest/v1/logs";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
  http.addHeader("Prefer", "return=minimal");
  
  StaticJsonDocument<256> doc;
  doc["level"] = "info";
  doc["message"] = String("Pump turned ") + (state ? "ON" : "OFF") + " by ESP32";
  doc["details"] = "{\"source\":\"esp32\",\"trigger\":\"auto\"}";
  
  String payload;
  serializeJson(doc, payload);
  
  http.POST(payload);
  http.end();
}

// Manual pump control via Serial commands
void handleSerialCommands() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command == "PUMP ON") {
      setPump(true);
    } else if (command == "PUMP OFF") {
      setPump(false);
    } else if (command == "STATUS") {
      Serial.printf("Moisture: %.1f%% | Temp: %.1f°C | Pump: %s | Battery: %.1f%%\n",
                    soilMoisture, temperature, pumpStatus ? "ON" : "OFF", batteryLevel);
    }
  }
}
