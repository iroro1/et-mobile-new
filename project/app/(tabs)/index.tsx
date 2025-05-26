import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  FlatList,
  useColorScheme,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plane as Plant } from 'lucide-react-native';
import Animated, { 
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import Header from '@/components/Header';
import SensorCard from '@/components/SensorCard';
import { useAuth } from '@/context/AuthContext';
import { useSensors } from '@/context/SensorContext';

// Placeholder data for sensors
const SENSORS = {
  temperature: {
    name: 'Temperature',
    unit: '°C',
  },
  humidity: {
    name: 'Humidity',
    unit: '%',
  },
  soil_moisture: {
    name: 'Soil Moisture',
    unit: '%',
  },
  atmospheric_pressure: {
    name: 'Atmospheric Pressure',
    unit: 'hPa',
  },
  water_level: {
    name: 'Water Level',
    unit: '%',
  },
  light_intensity: {
    name: 'Light Intensity',
    unit: 'Lux',
  },
  fire_detection: {
    name: 'Fire Detection',
    unit: '',
  },
};

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { user } = useAuth();
  const { 
    readings,
    thresholds,
    isLoading,
    fetchReadings,
    getLatestReading,
    isReadingAlert,
  } = useSensors();

  // Animation for pulse effect
  const pulseOpacity = useSharedValue(1);
  
  // Setup pulse animation
  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);
  
  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseOpacity.value,
    };
  });

  // Handle refreshing
  const onRefresh = async () => {
    await fetchReadings();
  };

  // Navigate to notification screen
  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  // Navigate to sensor details
  const handleSensorPress = (sensorType) => {
    router.push(`/analytics?type=${sensorType}`);
  };

  // Get sensors with alerts
  const alertSensors = Object.keys(SENSORS).filter(type => {
    const reading = getLatestReading(type);
    return reading && isReadingAlert(reading);
  });

  // Get last update time
  const getLastUpdateTime = () => {
    if (readings.length === 0) return 'No data';
    
    // Find the most recent reading
    const timestamps = readings.map(r => new Date(r.timestamp).getTime());
    const latestTimestamp = Math.max(...timestamps);
    const latestDate = new Date(latestTimestamp);
    
    return latestDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="AgriSense Dashboard"
        showNotification
        onNotificationPress={handleNotificationPress}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Welcome section */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Hello, {user?.name || 'User'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.neutral[600] }]}>
              Last updated: {getLastUpdateTime()}
            </Text>
          </View>
          <Animated.View style={[
            styles.statusIndicator,
            { backgroundColor: alertSensors.length > 0 ? colors.error.main : colors.success.main },
            pulseStyle
          ]}>
            <Text style={styles.statusText}>
              {alertSensors.length > 0 ? `${alertSensors.length} Alerts` : 'All Normal'}
            </Text>
          </Animated.View>
        </View>
        
        {/* Alert section */}
        {alertSensors.length > 0 && (
          <View style={[styles.alertSection, { backgroundColor: colors.error.light }]}>
            <Text style={[styles.alertTitle, { color: colors.error.dark }]}>
              Attention Required
            </Text>
            <Text style={[styles.alertText, { color: colors.error.dark }]}>
              {alertSensors.length} {alertSensors.length === 1 ? 'sensor' : 'sensors'} reporting values outside threshold limits
            </Text>
          </View>
        )}
        
        {/* Sensors grid */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Sensor Readings
        </Text>
        
        {readings.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <Plant size={48} color={colors.neutral[400]} />
            <Text style={[styles.emptyText, { color: colors.neutral[600] }]}>
              No sensor data available
            </Text>
          </View>
        ) : (
          <View style={styles.sensorGrid}>
            {Object.keys(SENSORS).map((sensorType) => {
              const reading = getLatestReading(sensorType);
              const inAlert = reading ? isReadingAlert(reading) : false;
              
              return (
                <View key={sensorType} style={styles.sensorCardContainer}>
                  <SensorCard
                    type={sensorType}
                    reading={reading}
                    inAlert={inAlert}
                    onPress={() => handleSensorPress(sensorType)}
                  />
                </View>
              );
            })}
          </View>
        )}
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
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: Platform.select({
      web: 'Poppins-Bold',
      default: 'Poppins-Bold',
    }),
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Platform.select({
      web: 'Inter-Regular',
      default: 'Inter-Regular',
    }),
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: Platform.select({
      web: 'Inter-SemiBold',
      default: 'Inter-SemiBold',
    }),
    fontSize: 12,
  },
  alertSection: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.select({
      web: 'Poppins-Bold',
      default: 'Poppins-Bold',
    }),
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    fontFamily: Platform.select({
      web: 'Inter-Regular',
      default: 'Inter-Regular',
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.select({
      web: 'Poppins-SemiBold',
      default: 'Poppins-SemiBold',
    }),
    marginBottom: 16,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  sensorCardContainer: {
    width: '50%',
    paddingHorizontal: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Platform.select({
      web: 'Inter-Regular',
      default: 'Inter-Regular',
    }),
    textAlign: 'center',
  },
});