import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  useColorScheme,
  Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChartLine } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Header from '@/components/Header';
import LineChart from '@/components/LineChart';
import { useSensors } from '@/context/SensorContext';
import { SensorType } from '@/types';
import { SENSORS } from '@/constants/Sensors';

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const params = useLocalSearchParams();
  const { type: initialType } = params;
  
  const [selectedType, setSelectedType] = useState<SensorType>(
    (initialType as SensorType) || 'temperature'
  );
  
  const { 
    readings,
    thresholds,
    isLoading,
    fetchReadings,
    getLatestReading,
  } = useSensors();

  // Set initial type from params
  useEffect(() => {
    if (initialType && Object.keys(SENSORS).includes(initialType as string)) {
      setSelectedType(initialType as SensorType);
    }
  }, [initialType]);

  // Handle refreshing
  const onRefresh = async () => {
    await fetchReadings();
  };

  // Filter readings by sensor type
  const filteredReadings = Array.isArray(readings) ? readings.filter(reading => reading.sensor_type === selectedType) : [];
  
  // Get threshold for selected sensor with safety check
  const threshold = Array.isArray(thresholds) ? thresholds.find(t => t.sensor_type === selectedType) : undefined;
  
  // Get latest reading
  const latestReading = getLatestReading(selectedType);
  
  // Format readings for statistics
  const getStatistics = () => {
    if (filteredReadings.length === 0) {
      return {
        min: 'N/A',
        max: 'N/A',
        avg: 'N/A',
      };
    }
    
    const values = filteredReadings.map(r => r.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    const sensorInfo = SENSORS[selectedType];
    
    return {
      min: `${min.toFixed(1)} ${sensorInfo.unit}`,
      max: `${max.toFixed(1)} ${sensorInfo.unit}`,
      avg: `${avg.toFixed(1)} ${sensorInfo.unit}`,
    };
  };
  
  const stats = getStatistics();

  // Handle sensor type selection
  const handleSensorSelect = (type: SensorType) => {
    setSelectedType(type);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Sensor Analytics"
        showBack
        onBackPress={() => router.back()}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Sensor selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sensorSelector}
          contentContainerStyle={styles.sensorSelectorContent}
        >
          {Object.keys(SENSORS).map((type) => (
            <View 
              key={type}
              style={[
                styles.sensorButton,
                selectedType === type ? 
                  { backgroundColor: colors.primary.main } : 
                  { backgroundColor: colors.neutral[200] }
              ]}
            >
              <Text 
                style={[
                  styles.sensorButtonText,
                  { color: selectedType === type ? 'white' : colors.text }
                ]}
                onPress={() => handleSensorSelect(type as SensorType)}
              >
                {SENSORS[type as SensorType].name}
              </Text>
            </View>
          ))}
        </ScrollView>
        
        {/* Current Value */}
        <View style={[styles.currentValueCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.currentValueLabel, { color: colors.neutral[600] }]}>
            Current Value
          </Text>
          <View style={styles.currentValueContainer}>
            <Text style={[styles.currentValue, { color: colors.text }]}>
              {latestReading ? latestReading.value.toFixed(1) : 'N/A'}
            </Text>
            <Text style={[styles.currentValueUnit, { color: colors.text }]}>
              {SENSORS[selectedType].unit}
            </Text>
          </View>
          {threshold && (
            <Text style={[styles.thresholdText, { color: colors.neutral[500] }]}>
              Threshold: {threshold.min_value} - {threshold.max_value} {SENSORS[selectedType].unit}
            </Text>
          )}
        </View>
        
        {/* Statistics */}
        <View style={styles.statisticsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statLabel, { color: colors.neutral[600] }]}>Min</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.min}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statLabel, { color: colors.neutral[600] }]}>Avg</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.avg}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statLabel, { color: colors.neutral[600] }]}>Max</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.max}</Text>
          </View>
        </View>
        
        {/* Chart */}
        <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
          {filteredReadings.length > 0 ? (
            <LineChart
              type={selectedType}
              readings={filteredReadings}
              thresholdMin={threshold?.min_value}
              thresholdMax={threshold?.max_value}
            />
          ) : (
            <View style={styles.emptyChart}>
              <ChartLine size={48} color={colors.neutral[400]} />
              <Text style={[styles.emptyChartText, { color: colors.neutral[600] }]}>
                No data available for this sensor
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  sensorSelector: {
    marginBottom: 16,
  },
  sensorSelectorContent: {
    paddingRight: 16,
  },
  sensorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  sensorButtonText: {
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  currentValueCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  currentValueLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  currentValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currentValue: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  currentValueUnit: {
    fontSize: 20,
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
  thresholdText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  statisticsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});