/*
 * Smart Irrigation Dashboard - ESP32 Firmware (Local Mode)
 * 
 * This code reads soil moisture, temperature, humidity sensors
 * and displays data locally via Serial Monitor.
 * NO CLOUD/SUPABASE CONNECTION.
 * 
 * Hardware Required:
 * - ESP32 DevKit
 * - Capacitive Soil Moisture Sensor (v1.2)
 * - DHT11 Temperature/Humidity Sensor
 * - Rain Sensor
 * - 5V Relay Module for Pump Control
 * - 5V Mini Pump
 * - Green LED + 220Ω resistor
 * - Red LED + 220Ω resistor
 * - 12V Battery with Solar Charge Controller
 * - Buck Converter (12V → 5V)
 * 
 * Power Setup:
 * - 12V Battery → Controller LOAD → Fuse → Buck Converter → 5V
 * - 5V powers: ESP32, Relay, DHT11, Rain Sensor, Soil Moisture
 * 
 * Wiring:
 * - Soil Moisture: VCC->5V, GND->GND, AO->GPIO34
 * - DHT11: VCC->5V, GND->GND, DATA->GPIO4
 * - Rain Sensor: VCC->5V, GND->GND, AO->GPIO35
 * - Relay: VCC->5V, GND->GND, IN->GPIO26
 * - Green LED: GPIO18 -> 220Ω -> LED -> GND
 * - Red LED: GPIO19 -> 220Ω -> LED -> GND
 * - Pump: Buck 5V+ -> Relay COM, Relay NO -> Pump+, Pump- -> GND
 *   (Add 1N4007 diode across pump: cathode->Pump+, anode->Pump-)
 */

#include <WiFi.h>
#include <ArduinoJson.h>
#include <DHT.h>  // DHT sensor library

// DHT setup
#define DHT_TYPE DHT11  // Change to DHT22 if using DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// ============= CONFIGURATION =============
// WiFi disabled - no cloud connection
// const char* WIFI_SSID = "PEC_TECH";
// const char* WIFI_PASSWORD = "tech@123";

// Device Configuration
const char* DEVICE_ID = "irrigation-system-001";
const unsigned long SEND_INTERVAL = 30000; // Display interval (no sending)
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
unsigned long lastDisplayTime = 0;
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
  
  Serial.println("\n=== Smart Irrigation ESP32 (Local Mode) ===");
  Serial.println("NO CLOUD CONNECTION - Local Operation Only");
  
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
  
  // No WiFi connection in local mode
  Serial.println("WiFi disabled - Local operation only");
  
  // Startup complete - blink green LED
  digitalWrite(GREEN_LED_PIN, LOW);
  delay(200);
  digitalWrite(GREEN_LED_PIN, HIGH);
  
  Serial.println("=== Setup Complete ===");
  Serial.println("Available Serial Commands:");
  Serial.println("  PUMP ON    - Turn pump on");
  Serial.println("  PUMP OFF   - Turn pump off");
  Serial.println("  STATUS     - Show current readings");
  Serial.println("=================================");
}

// ============= MAIN LOOP =============
void loop() {
  unsigned long currentTime = millis();
  
  // Read sensors periodically
  if (currentTime - lastSensorReadTime >= SENSOR_READ_INTERVAL) {
    readSensors();
    lastSensorReadTime = currentTime;
  }
  
  // Display data periodically
  if (currentTime - lastDisplayTime >= SEND_INTERVAL) {
    displaySensorData();
    lastDisplayTime = currentTime;
  }
  
  // Handle manual serial commands
  handleSerialCommands();
  
  delay(100); // Small delay to prevent watchdog issues
}

// ============= FUNCTIONS =============

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
  float moisturePercent = map(avgRaw, 3000, 1500, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);
  

  soilMoisture = 0.0;

  int rainRaw = analogRead(RAIN_SENSOR_PIN);
  rainDetected = (rainRaw < 2500); // Threshold for rain detection

  float newTemp = dht.readTemperature();
  float newHum = dht.readHumidity();
  
  // Check if readings are valid (not NaN)
  if (!isnan(newTemp) && !isnan(newHum)) {
    temperature = newTemp;
    humidity = newHum;
  }
  
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

void displaySensorData() {
  Serial.println("=================================");
  Serial.println("SENSOR READINGS:");
  Serial.printf("Soil Moisture: %.1f%%\n", soilMoisture);
  Serial.printf("Temperature: %.1f°C\n", temperature);
  Serial.printf("Humidity: %.1f%%\n", humidity);
  Serial.printf("Rain Detected: %s\n", rainDetected ? "YES" : "NO");
  Serial.printf("Battery Level: %.1f%%\n", batteryLevel);
  Serial.printf("Water Consumed: %.1f L\n", waterConsumed);
  Serial.printf("Water Saved: %.1f L\n", waterSaved);
  Serial.printf("Pump Status: %s\n", pumpStatus ? "ON" : "OFF");
  Serial.println("=================================");
  
  // LED status
  if (pumpStatus) {
    digitalWrite(GREEN_LED_PIN, LOW);
    digitalWrite(RED_LED_PIN, HIGH);
  } else {
    digitalWrite(GREEN_LED_PIN, HIGH);
    digitalWrite(RED_LED_PIN, LOW);
  }
}

void setPump(bool state) {
  pumpStatus = state;
  digitalWrite(RELAY_PUMP_PIN, state ? HIGH : LOW);
  
  // LED indication: Green for pump OFF, Red for pump ON
  digitalWrite(GREEN_LED_PIN, state ? LOW : HIGH);
  digitalWrite(RED_LED_PIN, state ? HIGH : LOW);
  
  Serial.printf("Pump turned %s\n", state ? "ON" : "OFF");
}

// Manual pump control via Serial commands
void handleSerialCommands() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    command.toUpperCase(); // Make commands case-insensitive
    
    if (command == "PUMP ON") {
      setPump(true);
    } else if (command == "PUMP OFF") {
      setPump(false);
    } else if (command == "STATUS") {
      displaySensorData();
    } else if (command == "HELP") {
      Serial.println("Available Commands:");
      Serial.println("  PUMP ON    - Turn pump on");
      Serial.println("  PUMP OFF   - Turn pump off");
      Serial.println("  STATUS     - Show current readings");
      Serial.println("  HELP       - Show this help");
    } else if (command.length() > 0) {
      Serial.printf("Unknown command: %s\n", command.c_str());
      Serial.println("Type 'HELP' for available commands");
    }
  }
}
