# 🌱 Smart Irrigation Dashboard

An AI-powered Smart Irrigation Dashboard designed to monitor farm conditions in real time and automate irrigation decisions using sensor data, weather intelligence, and AI-based scheduling.

The system helps optimize water usage, reduce wastage, and improve agricultural efficiency through real-time monitoring and intelligent automation.


## 🚀 Features

### 🌡 Real-Time Sensor Monitoring
- Soil moisture monitoring
- Temperature tracking
- Humidity monitoring
- Rain status detection
- Battery health monitoring

### 🤖 AI-Powered Irrigation Scheduling
- Smart irrigation recommendations
- Weather-based irrigation decisions
- Automated irrigation mode switching
- Intelligent water optimization

### 📊 Data Visualization
- Historical sensor data charts
- Live weather insights
- Soil behavior analysis
- Water consumption tracking
- Water savings analytics

### ☁️ Cloud & Real-Time Database
- Live synchronization using Supabase
- Real-time database subscriptions
- System status monitoring

### 🎤 Voice & Smart Assistant Features
- Voice-based commands
- AI assistant integration
- Interactive dashboard experience

### 🌙 User Experience
- Dark/Light mode support
- Responsive design
- Interactive sensor cards
- Modern dashboard UI


# 🛠 Technology Stack

## Frontend
- **React v19**
- **Vite**
- **TypeScript**

## Styling & UI
- **Tailwind CSS v4**
- **Lucide React**
- **Recharts**

## Backend & Database
- **Supabase**
- **PostgreSQL**
- **Supabase Realtime API**

## AI Integration
- **Google Generative AI API**
- **AI-based scheduling engine**



# 📂 Project Structure

```bash
smart-irrigation-dashboard/
│
├── components/          # UI components
├── hooks/               # Custom React hooks
├── services/            # API and backend services
├── context/             # State management
├── scripts/             # Utility scripts
├── esp32-firmware/      # ESP32 sensor code
├── types.ts             # Type definitions
├── App.tsx              # Main application
├── index.css            # Global styles
├── vite.config.ts       # Vite configuration
└── package.json
```



# ⚙️ Installation & Setup

## Clone Repository

```bash
git clone https://github.com/yourusername/smart-irrigation-dashboard.git

cd smart-irrigation-dashboard
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_google_genai_api_key
```



## Start Development Server

```bash
npm run dev
```

Application runs at:

```bash
http://localhost:3000
```



# 📡 Hardware Integration

This project supports:

- ESP32 microcontroller
- Soil Moisture Sensor
- Temperature Sensor
- Humidity Sensor
- Rain Sensor
- Water Pump System

Data collected from sensors is transmitted to Supabase and visualized on the dashboard.



# 🔄 Workflow

```text
Sensors → ESP32 → Supabase Database
                  ↓
         React Dashboard
                  ↓
        AI Scheduling Logic
                  ↓
         Smart Irrigation Action
```



# 📷 Dashboard Preview

Add screenshots here:

```md
![Dashboard](images/dashboard.png)<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/5479e483-3466-4a17-a90c-1bf0c58e7689" /><img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/972bbfcb-33df-454f-a7c7-ab6bc0239755" /><img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1b6f0a5c-aae4-46f4-9a9c-d8960b5b47a1" />



```



# 🎯 Future Enhancements

- Mobile application integration
- SMS/Email alerts
- Multi-farm monitoring
- Machine Learning prediction models
- Advanced weather forecasting
- Crop-specific irrigation recommendations

# 👥 Team Members

Developed as a collaborative team project focused on AI-driven smart agriculture and irrigation management.

Team Members:

- Soundariya S – Frontend Developer
- Ananya M V – IoT & Hardware Developer
- Priyanka S  – Backend & Database Developer
- Yaminee Lakshaya – Testing & Documentation*



