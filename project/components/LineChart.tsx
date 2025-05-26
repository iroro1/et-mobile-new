import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { SensorType, SensorReading } from '@/types';
import { SENSORS } from '@/constants/Sensors';

interface LineChartProps {
  type: SensorType;
  readings: SensorReading[];
  thresholdMin?: number;
  thresholdMax?: number;
}

const LineChart: React.FC<LineChartProps> = ({ 
  type, 
  readings, 
  thresholdMin,
  thresholdMax
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const sensorInfo = SENSORS[type];
  const screenWidth = Dimensions.get('window').width - 32; // Padding

  // Format readings data for chart
  const chartData = React.useMemo(() => {
    // Sort by timestamp
    const sortedReadings = [...readings]
      .filter(r => r.sensor_type === type)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Take last 10 readings only
    const limitedReadings = sortedReadings.slice(-10);
    
    return {
      labels: limitedReadings.map(r => {
        const date = new Date(r.timestamp);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      }),
      datasets: [
        {
          data: limitedReadings.map(r => r.value),
          color: () => sensorInfo.color,
          strokeWidth: 2,
        },
      ],
    };
  }, [readings, type]);

  // Handle empty data
  if (chartData.labels.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.neutral[500] }]}>
          No data available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        {sensorInfo.name} History
      </Text>
      <RNLineChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: colors.card,
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(50, 150, 100, ${opacity})`,
          labelColor: (opacity = 1) => colors.text,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '1',
            stroke: sensorInfo.color,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    paddingRight: 16,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

export default LineChart;