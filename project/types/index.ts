// User types
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Sensor types
export interface SensorReading {
  id: number;
  sensor_id: number;
  sensor_type: SensorType;
  value: number;
  unit: string;
  timestamp: string;
}

export type SensorType = 
  | 'temperature' 
  | 'humidity' 
  | 'soil_moisture' 
  | 'atmospheric_pressure'
  | 'water_level'
  | 'light_intensity'
  | 'fire_detection';

export interface SensorThreshold {
  id: number;
  sensor_type: SensorType;
  min_value: number;
  max_value: number;
  unit: string;
}

// Notification types
export interface Notification {
  id: number;
  sensor_type: SensorType;
  message: string;
  severity: 'warning' | 'critical';
  timestamp: string;
  read: boolean;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}