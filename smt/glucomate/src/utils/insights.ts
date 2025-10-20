import { GlucoseReading } from '../types/reading';

/**
 * Generate personalized insights based on glucose readings
 */
export const generateInsight = (
  readings: GlucoseReading[],
  latestReading: GlucoseReading | null,
  average: number
): string => {
  if (readings.length === 0) {
    return "Start tracking your glucose levels to get personalized insights! 📊";
  }

  if (readings.length === 1) {
    return "Great start! Add more readings to see trends and patterns. 🎯";
  }

  // Latest reading insights
  if (latestReading) {
    if (latestReading.value < 70) {
      return "⚠️ Your latest reading is low. Consider having a snack and retest in 15 minutes.";
    }
    if (latestReading.value > 180) {
      return "⚠️ Your latest reading is high. Stay hydrated and monitor closely.";
    }
    if (latestReading.value >= 140 && latestReading.value <= 180) {
      return "📈 Your latest reading is slightly elevated. Consider reviewing your recent meals.";
    }
  }

  // Average-based insights
  if (average < 80) {
    return "💡 Your average is on the lower side. Discuss with your doctor about adjusting your management plan.";
  }
  if (average > 130) {
    return "💡 Your average is higher than target. Consider reviewing your diet and medication with your doctor.";
  }
  if (average >= 100 && average <= 110) {
    return "✨ Excellent! Your glucose levels are well-controlled. Keep up the great work!";
  }
  if (average >= 80 && average < 100) {
    return "👍 Great control! Your average is in the optimal range.";
  }

  // Variability insights
  const values = readings.slice(0, 7).map(r => r.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;

  if (range > 100) {
    return "📊 Your readings show high variability. Try to maintain consistent meal and activity patterns.";
  }

  // Pattern-based insights
  const fastingReadings = readings.filter(r => r.type === 'Fasting').slice(0, 3);
  if (fastingReadings.length >= 3) {
    const fastingAvg = fastingReadings.reduce((sum, r) => sum + r.value, 0) / fastingReadings.length;
    if (fastingAvg > 110) {
      return "🌅 Your fasting readings are elevated. Consider discussing with your healthcare provider.";
    }
    if (fastingAvg >= 70 && fastingAvg <= 100) {
      return "🌅 Your fasting glucose levels look great! Keep maintaining your routine.";
    }
  }

  const postMealReadings = readings.filter(r => r.type === 'Post-meal').slice(0, 3);
  if (postMealReadings.length >= 3) {
    const postMealAvg = postMealReadings.reduce((sum, r) => sum + r.value, 0) / postMealReadings.length;
    if (postMealAvg > 140) {
      return "🍽️ Post-meal readings are high. Consider portion control or reviewing your meal choices.";
    }
  }

  // Streak insights
  if (readings.length >= 7) {
    const last7Days = readings.slice(0, 7);
    const allInRange = last7Days.every(r => r.value >= 70 && r.value <= 140);
    if (allInRange) {
      return "🎉 Amazing! All your recent readings are in the target range. You're doing fantastic!";
    }
  }

  // Consistency insights
  if (readings.length >= 5) {
    const recent5 = readings.slice(0, 5);
    const consistentTimes = recent5.every((r, i, arr) => {
      if (i === 0) return true;
      const timeDiff = Math.abs(r.timestamp - arr[i - 1].timestamp);
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      return hoursDiff <= 24;
    });
    
    if (consistentTimes) {
      return "⏰ Great consistency! Regular monitoring helps you understand your patterns better.";
    }
  }

  // Default positive insight
  return "📈 Keep tracking consistently to get better insights into your glucose patterns!";
};

/**
 * Get trend direction for recent readings
 */
export const getTrend = (readings: GlucoseReading[]): 'up' | 'down' | 'stable' => {
  if (readings.length < 3) return 'stable';

  const recent3 = readings.slice(0, 3);
  const avg1 = recent3[0].value;
  const avg2 = (recent3[1].value + recent3[2].value) / 2;

  if (avg1 > avg2 + 10) return 'up';
  if (avg1 < avg2 - 10) return 'down';
  return 'stable';
};

/**
 * Get emoji for trend
 */
export const getTrendEmoji = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up': return '📈';
    case 'down': return '📉';
    case 'stable': return '➡️';
  }
};

/**
 * Calculate average for a specific time range
 */
const calculateAverage = (readings: GlucoseReading[]): number => {
  if (readings.length === 0) return 0;
  const sum = readings.reduce((acc, reading) => acc + reading.value, 0);
  return Math.round(sum / readings.length);
};

/**
 * Get readings from a specific time range
 */
const getReadingsInRange = (
  readings: GlucoseReading[],
  startTime: number,
  endTime: number
): GlucoseReading[] => {
  return readings.filter(r => r.timestamp >= startTime && r.timestamp <= endTime);
};

/**
 * Generate week-over-week insights
 */
export const getWeeklyInsight = (readings: GlucoseReading[]): string => {
  if (readings.length < 2) {
    return "Add more readings to see weekly trends!";
  }

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const oneWeekMs = 7 * oneDayMs;

  // Get readings from last 7 days (current week)
  const currentWeekStart = now - oneWeekMs;
  const currentWeekReadings = getReadingsInRange(readings, currentWeekStart, now);
  
  // Get readings from previous 7 days (previous week)
  const prevWeekStart = now - (2 * oneWeekMs);
  const prevWeekEnd = currentWeekStart;
  const prevWeekReadings = getReadingsInRange(readings, prevWeekStart, prevWeekEnd);

  if (currentWeekReadings.length === 0) {
    return "No readings this week. Stay consistent with your tracking!";
  }

  if (prevWeekReadings.length === 0) {
    return "Keep tracking! Add more readings to see weekly comparisons.";
  }

  const avg7 = calculateAverage(currentWeekReadings);
  const avgPrev7 = calculateAverage(prevWeekReadings);
  const difference = avg7 - avgPrev7;

  // Week-over-week comparison
  if (difference > 5) {
    return `📈 Your glucose average rose this week (${avg7} vs ${avgPrev7} mg/dL last week).`;
  }
  
  if (difference < -5) {
    return `📉 Great job — readings improved this week! (${avg7} vs ${avgPrev7} mg/dL last week)`;
  }

  // Check for high fasting readings
  const recentFastingReadings = currentWeekReadings.filter(r => r.type === 'Fasting');
  const fastingHighs = recentFastingReadings.filter(r => r.value > 110).length;
  
  if (fastingHighs >= 3) {
    return `🌅 You've had ${fastingHighs} high fasting readings recently. Consider reviewing your evening routine.`;
  }

  // Check for post-meal spikes
  const recentPostMealReadings = currentWeekReadings.filter(r => r.type === 'Post-meal');
  const postMealHighs = recentPostMealReadings.filter(r => r.value > 160).length;
  
  if (postMealHighs >= 3) {
    return `🍽️ You've had ${postMealHighs} post-meal spikes this week. Consider portion sizes or meal composition.`;
  }

  // Check for lows
  const lows = currentWeekReadings.filter(r => r.value < 70).length;
  if (lows >= 2) {
    return `⚠️ You've had ${lows} low readings this week. Discuss with your healthcare provider if this continues.`;
  }

  // Check consistency
  if (currentWeekReadings.length >= 7) {
    return `✅ Stable week with ${currentWeekReadings.length} readings. Keep tracking daily!`;
  }

  return `➡️ Stable week. Keep tracking daily! (${currentWeekReadings.length} readings this week)`;
};

/**
 * Get detailed statistics for a time period
 */
export const getDetailedStats = (readings: GlucoseReading[], days: number = 14) => {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const startTime = now - (days * oneDayMs);
  
  const periodReadings = getReadingsInRange(readings, startTime, now);
  
  if (periodReadings.length === 0) {
    return {
      average: 0,
      highest: null,
      lowest: null,
      total: 0,
      inRange: 0,
      highCount: 0,
      lowCount: 0,
      byType: {
        fasting: [] as GlucoseReading[],
        postMeal: [] as GlucoseReading[],
        random: [] as GlucoseReading[],
      },
    };
  }

  const values = periodReadings.map(r => r.value);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const average = Math.round(sum / values.length);

  const highest = periodReadings.reduce((max, r) => r.value > max.value ? r : max);
  const lowest = periodReadings.reduce((min, r) => r.value < min.value ? r : min);

  const inRange = periodReadings.filter(r => r.value >= 70 && r.value <= 140).length;
  const highCount = periodReadings.filter(r => r.value > 140).length;
  const lowCount = periodReadings.filter(r => r.value < 70).length;

  const byType = {
    fasting: periodReadings.filter(r => r.type === 'Fasting'),
    postMeal: periodReadings.filter(r => r.type === 'Post-meal'),
    random: periodReadings.filter(r => r.type === 'Random'),
  };

  return {
    average,
    highest,
    lowest,
    total: periodReadings.length,
    inRange,
    highCount,
    lowCount,
    byType,
  };
};

