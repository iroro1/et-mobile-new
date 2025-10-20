export type ReadingType = 'Fasting' | 'Post-meal' | 'Random';

export interface GlucoseReading {
  id: string;
  type: ReadingType;
  value: number;
  timestamp: number; // Unix timestamp in milliseconds
  notes?: string;
}

export interface ReadingStats {
  average: number;
  highest: GlucoseReading | null;
  lowest: GlucoseReading | null;
  total: number;
}

