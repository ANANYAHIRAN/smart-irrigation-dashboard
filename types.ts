export interface SensorData {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  rainStatus: string;
  pumpStatus: 'ON' | 'OFF';
  waterConsumed: number;
  waterSaved: number;
  batteryLevel: number;
  traditionalWaterUsage: number;
}

export interface Alert {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'error';
}

export type PumpStatus = 'ON' | 'OFF';
export type IrrigationMode = 'AUTO' | 'MANUAL';

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface AIRecommendation {
  recommendation: 'ON' | 'OFF';
  reason: string;
  confidence_score: number;
}

export enum InfoSection {
  Architecture = 'System Architecture',
  AILogic = 'AI Scheduling Logic',
  DataFlow = 'Data Flow & Structure',
  ImplementationPlan = 'Implementation Plan',
  ProFeatures = 'Professional Features',
  SystemLogs = 'System Logs',
  CostSavings = 'Cost Savings Analysis',
}

export type AppView = 'dashboard' | 'history' | 'settings' | 'nutrients';

export interface LogEntry {
  id: number;
  timestamp: string;
  event: string;
  source: string;
  details: string;
}

export interface AssistantTranscript {
  source: 'user' | 'model';
  text: string;
  isFinal?: boolean;
}

export interface DbLogEntry {
  id: string;
  created_at: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  details: any;
}