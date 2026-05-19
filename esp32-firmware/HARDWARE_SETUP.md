# ESP32 Hardware Setup Guide

## Components Required

| Component | Quantity | Purpose |
|-----------|----------|---------|
| ESP32 DevKit V1/V4 | 1 | Main microcontroller |
| Capacitive Soil Moisture Sensor (v1.2) | 1 | Measure soil moisture |
| DHT22 or DHT11 | 1 | Temperature & humidity |
| Rain Drop Sensor Module | 1 | Detect rain |
| 5V Relay Module | 1 | Control water pump |
| Water Flow Sensor (YF-S201) | 1 (optional) | Measure water consumption |
| Voltage Divider Module | 1 (optional) | Monitor battery level |
| 12V Water Pump | 1 | Irrigation pump |
| 12V Power Supply | 1 | Power pump & ESP32 |
| Breadboard + Jumper Wires | - | Connections |

## Wiring Diagram

```
ESP32 DevKit
┌─────────────────────────────────────┐
│  3.3V  ─────┬────────────────────  │
│  GND   ─────┼────────────────────  │
│  GPIO4 ─────┼─── DHT22 DATA        │
│  GPIO5 ─────┼─── Relay IN          │
│  GPIO34 ────┼─── Soil Sensor AOUT  │
│  GPIO35 ────┼─── Rain Sensor D0    │
│  GPIO36 ────┼─── Battery Voltage   │
│  GPIO39 ────┼─── Flow Sensor (opt) │
└─────────────────────────────────────┘

SENSORS:
┌────────────────────────────────────────────────┐
│  Soil Moisture Sensor                           │
│  • VCC → 3.3V                                   │
│  • GND → GND                                    │
│  • AOUT → GPIO34                                │
├────────────────────────────────────────────────┤
│  DHT22/DHT11                                    │
│  • VCC → 3.3V                                   │
│  • GND → GND                                    │
│  • DATA → GPIO4                                 │
│  • (Add 10kΩ pull-up between VCC and DATA)      │
├────────────────────────────────────────────────┤
│  Rain Sensor                                    │
│  • VCC → 3.3V                                   │
│  • GND → GND                                    │
│  • D0 → GPIO35                                  │
│  • A0 (optional, analog) → GPIO39               │
└────────────────────────────────────────────────┘

PUMP CONTROL:
┌────────────────────────────────────────────────┐
│  5V Relay Module                                │
│  • VCC → 5V                                     │
│  • GND → GND                                    │
│  • IN → GPIO5                                   │
│  • COM → 12V Power Supply (+)                   │
│  • NO → Water Pump (+)                          │
│  • Pump (-) → 12V Power Supply (-)              │
└────────────────────────────────────────────────┘

OPTIONAL - BATTERY MONITORING:
┌────────────────────────────────────────────────┐
│  Voltage Divider (for 3.7V LiPo/4.2V max)       │
│                                                 │
│  Battery (+) ────┬─── 100kΩ ────┬─── GPIO36   │
│                  │               │               │
│                  └─── 100kΩ ────┴─── GND       │
│                                                 │
│  This divides 4.2V → 2.1V (safe for ESP32 ADC) │
└────────────────────────────────────────────────┘

OPTIONAL - WATER FLOW SENSOR:
┌────────────────────────────────────────────────┐
│  YF-S201 Flow Sensor                            │
│  • Red → 5V                                     │
│  • Black → GND                                  │
│  • Yellow → GPIO39 (Pulse input)                │
└────────────────────────────────────────────────┘
```

## Schematic View

```
                    ┌─────────────┐
    3.3V ───────────│ ESP32       │
    GND  ───────────│ DevKit      │
                    │             │
    GPIO4 ──────────│             │
    GPIO5 ──────────│             │─────── Relay ────── Pump
    GPIO34 ─────────│             │          │
    GPIO35 ─────────│             │          └── 12V PSU
    GPIO36 ─────────│             │
                    └─────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────┴────┐     ┌────┴────┐     ┌────┴────┐
   │  Soil   │     │  DHT22  │     │  Rain   │
   │ Sensor  │     │ Sensor  │     │ Sensor  │
   └─────────┘     └─────────┘     └─────────┘
```

## Pin Mapping Reference

| Function | GPIO Pin | Notes |
|----------|----------|-------|
| Soil Moisture Analog | GPIO34 | ADC1_CH6 |
| Rain Sensor Digital | GPIO35 | ADC1_CH7 |
| Battery Monitor | GPIO36 | ADC1_CH0 (VP) |
| Flow Sensor Pulse | GPIO39 | ADC1_CH3 (VN) |
| DHT22 Data | GPIO4 | Digital I/O |
| Relay Control | GPIO5 | Digital I/O |

## Calibration Instructions

### 1. Soil Moisture Sensor Calibration

Place the sensor in dry soil and note the reading (should be ~3000). Then place it in fully wet soil (should be ~1500). Update these values in the code:

```cpp
// In SmartIrrigationESP32.ino, line ~150
float moisturePercent = map(avgRaw, DRY_VALUE, WET_VALUE, 0, 100);
```

Typical ranges for capacitive sensor:
- Air (dry): 3200-3500
- Dry soil: 2800-3200
- Moist soil: 1800-2800
- Wet soil: 1500-1800

### 2. Battery Voltage Calibration

Measure your battery with a multimeter when full (4.2V) and empty (3.0V). Update the ADC reading mapping accordingly.

## Power Considerations

1. **ESP32 Power**: Use the onboard USB or 5V pin
2. **Relay Module**: Needs separate 5V, can use ESP32 5V pin if low-current relay
3. **Pump**: Must use external 12V power supply, ESP32 cannot power directly
4. **Relay Isolation**: Recommended to use optocoupler relay module for safety

## Assembly Steps

1. Connect ESP32 to breadboard
2. Wire up sensors (3.3V, GND, signal pins)
3. Install relay module for pump control
4. Connect pump to relay and 12V power supply
5. Upload firmware via Arduino IDE
6. Open Serial Monitor (115200 baud) to verify readings
7. Place sensors in soil
8. Test pump control via dashboard

## Safety Notes

⚠️ **WARNING**: 
- Always use relay module to isolate ESP32 from high-voltage pump
- Waterproof all outdoor connections
- Use capacitive soil sensor (resistive types corrode quickly)
- Add fuse on pump power line
- Keep electronics protected from rain

## Troubleshooting

| Issue | Solution |
|-------|----------|
| WiFi won't connect | Check credentials, ensure 2.4GHz network |
| Moisture readings erratic | Add capacitor (100nF) across sensor power |
| Supabase HTTP 400 error | Check API key and table permissions |
| Pump not responding | Verify relay wiring, test with multimeter |
| Random resets | Add watchdog timer, check power supply stability |
