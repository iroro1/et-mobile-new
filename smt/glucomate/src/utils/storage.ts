import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { GlucoseReading, ReadingType } from '../types/reading';

const READINGS_KEY = 'readings';

/**
 * Get all glucose readings from storage
 */
export const getReadings = async (): Promise<GlucoseReading[]> => {
  try {
    const readingsJson = await AsyncStorage.getItem(READINGS_KEY);
    if (!readingsJson) {
      return [];
    }
    const readings: GlucoseReading[] = JSON.parse(readingsJson);
    // Sort by timestamp descending (newest first)
    return readings.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting readings:', error);
    return [];
  }
};

/**
 * Save a new glucose reading
 */
export const saveReading = async (
  value: number,
  type: ReadingType,
  timestamp?: number,
  notes?: string
): Promise<GlucoseReading | null> => {
  try {
    // Validate value
    if (value <= 0 || value > 600) {
      throw new Error('Invalid glucose value. Must be between 1 and 600 mg/dL');
    }

    const newReading: GlucoseReading = {
      id: uuidv4(),
      type,
      value,
      timestamp: timestamp || Date.now(),
      notes: notes || undefined,
    };

    const existingReadings = await getReadings();
    const updatedReadings = [newReading, ...existingReadings];
    
    await AsyncStorage.setItem(READINGS_KEY, JSON.stringify(updatedReadings));
    
    return newReading;
  } catch (error) {
    console.error('Error saving reading:', error);
    return null;
  }
};

/**
 * Delete a glucose reading by ID
 */
export const deleteReading = async (id: string): Promise<boolean> => {
  try {
    const readings = await getReadings();
    const updatedReadings = readings.filter((reading) => reading.id !== id);
    
    await AsyncStorage.setItem(READINGS_KEY, JSON.stringify(updatedReadings));
    
    return true;
  } catch (error) {
    console.error('Error deleting reading:', error);
    return false;
  }
};

/**
 * Update an existing glucose reading
 */
export const updateReading = async (
  id: string,
  updates: Partial<Omit<GlucoseReading, 'id'>>
): Promise<GlucoseReading | null> => {
  try {
    const readings = await getReadings();
    const readingIndex = readings.findIndex((reading) => reading.id === id);
    
    if (readingIndex === -1) {
      throw new Error('Reading not found');
    }

    const updatedReading: GlucoseReading = {
      ...readings[readingIndex],
      ...updates,
    };

    readings[readingIndex] = updatedReading;
    
    await AsyncStorage.setItem(READINGS_KEY, JSON.stringify(readings));
    
    return updatedReading;
  } catch (error) {
    console.error('Error updating reading:', error);
    return null;
  }
};

/**
 * Get readings within a date range
 */
export const getReadingsByDateRange = async (
  startDate: number,
  endDate: number
): Promise<GlucoseReading[]> => {
  try {
    const allReadings = await getReadings();
    return allReadings.filter(
      (reading) => reading.timestamp >= startDate && reading.timestamp <= endDate
    );
  } catch (error) {
    console.error('Error getting readings by date range:', error);
    return [];
  }
};

/**
 * Get readings by type
 */
export const getReadingsByType = async (
  type: ReadingType
): Promise<GlucoseReading[]> => {
  try {
    const allReadings = await getReadings();
    return allReadings.filter((reading) => reading.type === type);
  } catch (error) {
    console.error('Error getting readings by type:', error);
    return [];
  }
};

/**
 * Calculate statistics for readings
 */
export const getReadingStats = async (
  readings?: GlucoseReading[]
): Promise<{
  average: number;
  highest: GlucoseReading | null;
  lowest: GlucoseReading | null;
  total: number;
}> => {
  try {
    const readingsToAnalyze = readings || (await getReadings());
    
    if (readingsToAnalyze.length === 0) {
      return {
        average: 0,
        highest: null,
        lowest: null,
        total: 0,
      };
    }

    const values = readingsToAnalyze.map((r) => r.value);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;

    const highest = readingsToAnalyze.reduce((max, reading) =>
      reading.value > max.value ? reading : max
    );

    const lowest = readingsToAnalyze.reduce((min, reading) =>
      reading.value < min.value ? reading : min
    );

    return {
      average: Math.round(average),
      highest,
      lowest,
      total: readingsToAnalyze.length,
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return {
      average: 0,
      highest: null,
      lowest: null,
      total: 0,
    };
  }
};

/**
 * Clear all readings (use with caution!)
 */
export const clearAllReadings = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(READINGS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing readings:', error);
    return false;
  }
};

