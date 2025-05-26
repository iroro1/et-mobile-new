import React, { createContext, useContext, useState, useEffect } from 'react';
import { sensorService } from '@/services/api';
import { SensorReading, SensorThreshold, SensorType } from '@/types';
import { SENSORS } from '@/constants/Sensors';

interface SensorContextType {
  readings: SensorReading[];
  thresholds: SensorThreshold[];
  isLoading: boolean;
  error: string | null;
  fetchReadings: () => Promise<void>;
  fetchThresholds: () => Promise<void>;
  updateThreshold: (id: number, data: Partial<SensorThreshold>) => Promise<void>;
  createThreshold: (data: Omit<SensorThreshold, 'id'>) => Promise<void>;
  getLatestReading: (type: SensorType) => SensorReading | undefined;
  isReadingAlert: (reading: SensorReading) => boolean;
  clearError: () => void;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export const SensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize readings as an empty array instead of undefined
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [thresholds, setThresholds] = useState<SensorThreshold[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReadings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await sensorService.getSensorReadings();
      // Ensure we always set an array, even if empty
      setReadings(response.data || []);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch sensor readings.');
      console.error('Fetch readings error:', error);
      // Set empty array on error to maintain consistent state
      setReadings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchThresholds = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await sensorService.getThresholds();
      setThresholds(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch thresholds.');
      console.error('Fetch thresholds error:', error);
      
      // If no thresholds exist yet, initialize with defaults
      if (error.response?.status === 404) {
        const defaultThresholds: Omit<SensorThreshold, 'id'>[] = Object.values(SENSORS).map(sensor => ({
          sensor_type: sensor.type,
          min_value: sensor.defaultMin,
          max_value: sensor.defaultMax,
          unit: sensor.unit,
        }));
        
        setThresholds(defaultThresholds as SensorThreshold[]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateThreshold = async (id: number, data: Partial<SensorThreshold>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await sensorService.updateThreshold(id, data);
      
      // Update local state
      setThresholds(current => 
        current.map(threshold => 
          threshold.id === id ? response.data : threshold
        )
      );
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update threshold.');
      console.error('Update threshold error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createThreshold = async (data: Omit<SensorThreshold, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await sensorService.createThreshold(data);
      
      // Add to local state
      setThresholds(current => [...current, response.data]);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create threshold.');
      console.error('Create threshold error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getLatestReading = (type: SensorType): SensorReading | undefined => {
    // Early return if readings is not an array or empty
    if (!Array.isArray(readings) || readings.length === 0) {
      return undefined;
    }
    
    const filteredReadings = readings.filter(reading => reading.sensor_type === type);
    
    if (filteredReadings.length === 0) {
      return undefined;
    }
    
    // Sort by timestamp and get the most recent
    return filteredReadings.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  };

  const isReadingAlert = (reading: SensorReading): boolean => {
    // Early return if reading is undefined
    if (!reading) {
      return false;
    }

    const threshold = thresholds.find(t => t.sensor_type === reading.sensor_type);
    
    if (!threshold) return false;
    
    return reading.value < threshold.min_value || reading.value > threshold.max_value;
  };

  const clearError = () => setError(null);

  // Initial data fetch
  useEffect(() => {
    fetchReadings();
    fetchThresholds();
    
    // Set up interval to fetch new readings every 30 seconds
    const interval = setInterval(fetchReadings, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <SensorContext.Provider
      value={{
        readings,
        thresholds,
        isLoading,
        error,
        fetchReadings,
        fetchThresholds,
        updateThreshold,
        createThreshold,
        getLatestReading,
        isReadingAlert,
        clearError,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
};

export const useSensors = () => {
  const context = useContext(SensorContext);
  if (context === undefined) {
    throw new Error('useSensors must be used within a SensorProvider');
  }
  return context;
};