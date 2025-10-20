import { useState, useEffect, useCallback } from 'react';
import { GlucoseReading } from '../types/reading';
import { getReadings, getReadingStats, deleteReading as deleteReadingFromStorage } from '../utils/storage';

export const useReadings = () => {
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    highest: null as GlucoseReading | null,
    lowest: null as GlucoseReading | null,
    total: 0,
  });

  const loadReadings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getReadings();
      setReadings(data);
      
      const statsData = await getReadingStats(data);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading readings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteReading = useCallback(async (id: string) => {
    const success = await deleteReadingFromStorage(id);
    if (success) {
      await loadReadings();
    }
    return success;
  }, [loadReadings]);

  useEffect(() => {
    loadReadings();
  }, [loadReadings]);

  return {
    readings,
    stats,
    isLoading,
    refresh: loadReadings,
    deleteReading,
  };
};

