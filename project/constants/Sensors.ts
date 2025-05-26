import { SensorType } from '@/types';

export interface SensorInfo {
  type: SensorType;
  name: string;
  unit: string;
  icon: string;
  description: string;
  minValue: number;
  maxValue: number;
  defaultMin: number;
  defaultMax: number;
  color: string;
}

export const SENSORS: Record<SensorType, SensorInfo> = {
  temperature: {
    type: 'temperature',
    name: 'Temperature',
    unit: '°C',
    icon: 'thermometer',
    description: 'Measures ambient temperature',
    minValue: -20,
    maxValue: 60,
    defaultMin: 10,
    defaultMax: 30,
    color: '#F44336', // Red
  },
  humidity: {
    type: 'humidity',
    name: 'Humidity',
    unit: '%',
    icon: 'droplets',
    description: 'Measures relative humidity in the air',
    minValue: 0,
    maxValue: 100,
    defaultMin: 30,
    defaultMax: 70,
    color: '#1E88E5', // Blue
  },
  soil_moisture: {
    type: 'soil_moisture',
    name: 'Soil Moisture',
    unit: '%',
    icon: 'waves',
    description: 'Measures soil water content',
    minValue: 0,
    maxValue: 100,
    defaultMin: 20,
    defaultMax: 80,
    color: '#8D6E63', // Brown
  },
  atmospheric_pressure: {
    type: 'atmospheric_pressure',
    name: 'Atmospheric Pressure',
    unit: 'hPa',
    icon: 'gauge',
    description: 'Measures atmospheric pressure',
    minValue: 800,
    maxValue: 1200,
    defaultMin: 950,
    defaultMax: 1050,
    color: '#7E57C2', // Purple
  },
  water_level: {
    type: 'water_level',
    name: 'Water Level',
    unit: '%',
    icon: 'droplet',
    description: 'Measures water level in tank or reservoir',
    minValue: 0,
    maxValue: 100,
    defaultMin: 20,
    defaultMax: 90,
    color: '#039BE5', // Light Blue
  },
  light_intensity: {
    type: 'light_intensity',
    name: 'Light Intensity',
    unit: 'Lux',
    icon: 'sun',
    description: 'Measures ambient light intensity',
    minValue: 0,
    maxValue: 100000,
    defaultMin: 100,
    defaultMax: 10000,
    color: '#FFC107', // Amber
  },
  fire_detection: {
    type: 'fire_detection',
    name: 'Fire Detection',
    unit: '',
    icon: 'flame',
    description: 'Detects presence of fire or smoke',
    minValue: 0,
    maxValue: 1,
    defaultMin: 0,
    defaultMax: 0,
    color: '#FF5722', // Deep Orange
  },
};