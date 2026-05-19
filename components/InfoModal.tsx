
import React from 'react';
import { CrossIcon } from './icons/CrossIcon';
import { InfoSection } from '../types';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: InfoSection;
  onSectionChange: (section: InfoSection) => void;
}

const SectionContent: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-2xl font-bold text-primary mb-4">{title}</h3>
        <div className="space-y-4 text-light-on-surface-variant dark:text-on-surface-variant">{children}</div>
    </div>
);

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-light-base dark:bg-base p-4 rounded-lg text-sm whitespace-pre-wrap">
        <code>{children}</code>
    </pre>
);

const contentMap: Record<InfoSection, React.ReactNode> = {
    [InfoSection.Architecture]: (
        <SectionContent title="Overall System Architecture">
            <p>The system follows a modern IoT architecture, designed for scalability and real-time data processing.</p>
            <ol className="list-decimal list-inside space-y-2">
                <li><strong>IoT Device (ESP32):</strong> At the edge, sensors collect data (soil moisture, temp, etc.) and the microcontroller controls the water pump. It communicates with the cloud via Wi-Fi.</li>
                <li><strong>Cloud Platform (e.g., AWS IoT, Google Cloud IoT):</strong> A central hub that securely ingests, processes, and stores data from the IoT device. It handles device management and authentication.</li>
                <li><strong>AI Model (Gemini API):</strong> The cloud backend sends processed sensor data to a generative AI model. The AI analyzes the data and provides an intelligent irrigation recommendation.</li>
                <li><strong>Dashboard (This Web App):</strong> The frontend application fetches data from the cloud and presents it to the user in a readable format, allowing for monitoring and manual control.</li>
            </ol>
        </SectionContent>
    ),
    [InfoSection.AILogic]: (
        <SectionContent title="AI Scheduling Logic">
            <p>The core of the smart scheduling is a well-crafted prompt sent to the Gemini API. This approach is flexible and powerful.</p>
            <div className="bg-light-base dark:bg-base p-4 rounded-lg">
                <p className="font-semibold text-light-on-surface dark:text-on-surface">1. Context & Role:</p>
                <p className="text-sm italic">The AI is instructed to act as an "expert agronomist" to ensure its responses are relevant and professional.</p>
            </div>
             <div className="bg-light-base dark:bg-base p-4 rounded-lg">
                <p className="font-semibold text-light-on-surface dark:text-on-surface">2. Data Injection:</p>
                <p className="text-sm">Real-time sensor values (soil moisture, temperature, humidity, rain prediction, battery level) are formatted and inserted directly into the prompt.</p>
            </div>
             <div className="bg-light-base dark:bg-base p-4 rounded-lg">
                <p className="font-semibold text-light-on-surface dark:text-on-surface">3. Logic & Constraints:</p>
                <p className="text-sm">The prompt includes key rules, such as optimal moisture levels and constraints (e.g., "avoid watering if rain is predicted or battery is low").</p>
            </div>
             <div className="bg-light-base dark:bg-base p-4 rounded-lg">
                <p className="font-semibold text-light-on-surface dark:text-on-surface">4. Structured Output:</p>
                <p className="text-sm">We request a JSON object with a specific schema, containing the `recommendation` ('ON'/'OFF'), a `reason`, and a `confidence_score`. This makes the AI's response reliable and easy to parse in the application.</p>
            </div>
        </SectionContent>
    ),
    [InfoSection.DataFlow]: (
        <SectionContent title="Data Flow & Database Structure">
            <p>A simple yet effective data structure is key for this system. A time-series database is ideal for storing sensor readings.</p>
            <p className="font-semibold text-light-on-surface dark:text-on-surface">Data Flow:</p>
            <p>ESP32 → MQTT Broker (Cloud) → Data Processing Lambda → Time-Series Database (e.g., InfluxDB, TimescaleDB)</p>
            <p className="font-semibold text-light-on-surface dark:text-on-surface">Database Schema (Example):</p>
            <p>A single table/collection `sensor_readings` would be sufficient for a demo.</p>
            <CodeBlock>
{`{
  "timestamp": "2023-10-27T10:00:00Z",
  "device_id": "ESP32_FARM_01",
  "soil_moisture": 45.2,
  "temperature": 26.7,
  "humidity": 68.3,
  "battery_level": 92.1
}`}
            </CodeBlock>
            <p>The dashboard would then query this database for historical data, aggregating it by time (e.g., hourly average for daily view).</p>
        </SectionContent>
    ),
    [InfoSection.ImplementationPlan]: (
        <SectionContent title="Beginner-Friendly Implementation Plan">
             <ol className="list-decimal list-inside space-y-3">
                <li><strong>Hardware Setup:</strong> Connect soil moisture sensor, DHT11 (temp/humidity), and a relay module to an ESP32. Power it with a solar panel and battery.</li>
                <li><strong>Device Programming:</strong> Use Arduino IDE or PlatformIO to write C++ code for the ESP32. Read sensor data and publish it to a cloud MQTT broker.</li>
                <li><strong>Cloud Backend:</strong> Set up a free-tier account on a cloud provider. Create an IoT device entry and configure a rule to trigger a serverless function (Lambda/Cloud Function) to save data to a database.</li>
                <li><strong>API Development:</strong> Create a simple REST API endpoint that the dashboard can call to get the latest sensor data and historical trends.</li>
                <li><strong>Frontend Development (This App):</strong> Use this React application as the user interface. Connect it to your API endpoints to display live data instead of mock data.</li>
            </ol>
        </SectionContent>
    ),
    [InfoSection.ProFeatures]: (
        <SectionContent title="Professional Features & Innovation">
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Multi-Zone Control:</strong> Support for multiple water pumps and sensors to manage different sections of a farm independently.</li>
                <li><strong>Soil Type Calibration:</strong> Allow users to input their soil type (clay, loam, sand), which the AI can use for more accurate irrigation recommendations.</li>
                <li><strong>Crop-Specific Profiles:</strong> Create irrigation schedules based on the type of crop being grown, as different plants have different water requirements.</li>
                <li><strong>Predictive Maintenance:</strong> Analyze pump motor current and vibration data to predict failures before they happen.</li>
                <li><strong>Mobile App & Push Notifications:</strong> A native mobile app for on-the-go monitoring and push notifications for critical alerts.</li>
            </ul>
        </SectionContent>
    ),
    [InfoSection.SystemLogs]: (
        <SectionContent title="System Logs / History">
            <p>A comprehensive logging feature would track all significant system events, providing a clear audit trail for diagnostics and review.</p>
            <p><strong>Events to Log:</strong></p>
            <ul className="list-disc list-inside space-y-1">
                <li>Pump state changes (ON/OFF, both manual and automatic).</li>
                <li>AI recommendations received and whether they were followed.</li>
                <li>Alerts triggered (e.g., low battery, dry soil).</li>
                <li>System mode changes (AUTO to MANUAL).</li>
            </ul>
             <p className="font-semibold text-light-on-surface dark:text-on-surface mt-2">Example Log Entry:</p>
            <CodeBlock>
{`{
  "timestamp": "2023-10-27T12:30:00Z",
  "event": "PUMP_STATE_CHANGE",
  "source": "AI_SCHEDULER",
  "details": "Pump turned ON. Reason: Soil moisture dropped to 35%."
}`}
            </CodeBlock>
        </SectionContent>
    ),
    [InfoSection.CostSavings]: (
         <SectionContent title="Cost Savings Analysis">
            <p>By tracking water and power consumption, the system can estimate financial savings for the user, making the value proposition clear.</p>
            <p><strong>Calculation Logic:</strong></p>
            <ol className="list-decimal list-inside space-y-2">
                <li><strong>User Input:</strong> The user enters their local cost per liter of water and per kWh of electricity.</li>
                <li><strong>Water Savings:</strong> The `Water Saved` metric is multiplied by the cost per liter to calculate the financial savings on water.</li>
                <li><strong>Energy Savings:</strong> The AI avoids running the pump unnecessarily (e.g., before rain), which saves energy. This can be estimated by comparing the smart system's pump runtime to a traditional timer-based system.</li>
                <li><strong>Dashboard Display:</strong> A dedicated card or section could show "Estimated Monthly Savings" in the user's local currency.</li>
            </ol>
        </SectionContent>
    ),
};


export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, activeSection, onSectionChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-light-surface dark:bg-surface rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative transition-colors" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-light-on-surface-variant dark:text-on-surface-variant hover:text-light-on-surface dark:hover:text-white transition-colors">
          <CrossIcon className="w-6 h-6" />
        </button>
        <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 border-b-2 md:border-b-0 md:border-r-2 border-gray-200 dark:border-gray-700 pb-4 md:pb-0 md:pr-4">
                <h2 className="text-xl font-bold mb-4 text-light-on-surface dark:text-on-surface">System Information</h2>
                <nav className="flex flex-col space-y-2">
                    {Object.values(InfoSection).map(section => (
                        <button key={section} onClick={() => onSectionChange(section)} className={`p-2 rounded-md text-sm font-medium transition-colors text-left ${activeSection === section ? 'bg-secondary text-white' : 'text-light-on-surface-variant dark:text-on-surface-variant hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            {section}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="md:w-2/3">
                {contentMap[activeSection]}
            </div>
        </div>
      </div>
    </div>
  );
};
