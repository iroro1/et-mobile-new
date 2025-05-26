import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Droplet, Thermometer, Waves, Gauge, Sun, Flame } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { SensorType, SensorReading } from '@/types';
import { SENSORS } from '@/constants/Sensors';

interface SensorCardProps {
  type: SensorType;
  reading?: SensorReading;
  inAlert?: boolean;
  onPress?: () => void;
}

const SensorCard: React.FC<SensorCardProps> = ({ 
  type, 
  reading, 
  inAlert = false, 
  onPress 
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const sensorInfo = SENSORS[type];
  
  // For animation
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Handle press animation
  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    if (onPress) onPress();
  };

  // Get icon based on sensor type
  const renderIcon = () => {
    const iconColor = inAlert ? colors.error.main : colors.primary.main;
    const size = 32;
    
    switch (sensorInfo.icon) {
      case 'thermometer':
        return <Thermometer color={iconColor} size={size} />;
      case 'droplets':
        return <Droplet color={iconColor} size={size} />;
      case 'waves':
        return <Waves color={iconColor} size={size} />;
      case 'gauge':
        return <Gauge color={iconColor} size={size} />;
      case 'droplet':
        return <Droplet color={iconColor} size={size} />;
      case 'sun':
        return <Sun color={iconColor} size={size} />;
      case 'flame':
        return <Flame color={iconColor} size={size} />;
      default:
        return <Thermometer color={iconColor} size={size} />;
    }
  };

  // Get value display
  const getValue = () => {
    if (!reading) return 'N/A';
    
    // Fire detection is binary
    if (type === 'fire_detection') {
      return reading.value > 0 ? 'Detected' : 'None';
    }
    
    return `${reading.value} ${sensorInfo.unit}`;
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.card },
          inAlert ? styles.alertCard : null,
          animatedStyle
        ]}
      >
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {sensorInfo.name}
          </Text>
          <Text 
            style={[
              styles.value, 
              { color: inAlert ? colors.error.main : colors.text }
            ]}
          >
            {getValue()}
          </Text>
        </View>
        {inAlert && (
          <View style={[styles.alertBadge, { backgroundColor: colors.error.main }]}>
            <Text style={styles.alertText}>Alert</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 100,
  },
  alertCard: {
    borderWidth: 1,
    borderColor: '#F44336',
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  alertBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SensorCard;