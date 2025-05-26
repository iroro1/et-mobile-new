import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Colors from '@/constants/Colors';
import { SensorType, SensorThreshold } from '@/types';
import { SENSORS } from '@/constants/Sensors';

interface ThresholdSliderProps {
  type: SensorType;
  threshold: SensorThreshold;
  onChange?: (minValue: number, maxValue: number) => void;
  onChangeComplete?: (minValue: number, maxValue: number) => void;
}

const ThresholdSlider: React.FC<ThresholdSliderProps> = ({
  type,
  threshold,
  onChange,
  onChangeComplete,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const sensorInfo = SENSORS[type];
  
  const [sliderWidth, setSliderWidth] = useState(300);
  const [minValue, setMinValue] = useState(threshold.min_value);
  const [maxValue, setMaxValue] = useState(threshold.max_value);
  
  // Calculate positions
  const minPosition = useSharedValue(
    ((threshold.min_value - sensorInfo.minValue) / (sensorInfo.maxValue - sensorInfo.minValue)) * sliderWidth
  );
  const maxPosition = useSharedValue(
    ((threshold.max_value - sensorInfo.minValue) / (sensorInfo.maxValue - sensorInfo.minValue)) * sliderWidth
  );

  // Update positions when threshold changes
  useEffect(() => {
    minPosition.value = withSpring(
      ((threshold.min_value - sensorInfo.minValue) / (sensorInfo.maxValue - sensorInfo.minValue)) * sliderWidth
    );
    maxPosition.value = withSpring(
      ((threshold.max_value - sensorInfo.minValue) / (sensorInfo.maxValue - sensorInfo.minValue)) * sliderWidth
    );
    setMinValue(threshold.min_value);
    setMaxValue(threshold.max_value);
  }, [threshold, sliderWidth]);

  // Min handle gesture
  const minHandleGestureEvent = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = minPosition.value;
    },
    onActive: (event, ctx) => {
      let newPosition = ctx.startX + event.translationX;
      // Constrain to slider bounds and max handle
      newPosition = Math.max(0, Math.min(newPosition, maxPosition.value - 20));
      minPosition.value = newPosition;
    },
    onEnd: () => {
      // Calculate and report the actual value
      const percentage = minPosition.value / sliderWidth;
      const rawValue = sensorInfo.minValue + percentage * (sensorInfo.maxValue - sensorInfo.minValue);
      const roundedValue = Math.round(rawValue);
      
      if (onChangeComplete) {
        onChangeComplete(roundedValue, maxValue);
      }
    },
  });

  // Max handle gesture
  const maxHandleGestureEvent = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = maxPosition.value;
    },
    onActive: (event, ctx) => {
      let newPosition = ctx.startX + event.translationX;
      // Constrain to slider bounds and min handle
      newPosition = Math.min(sliderWidth, Math.max(newPosition, minPosition.value + 20));
      maxPosition.value = newPosition;
    },
    onEnd: () => {
      // Calculate and report the actual value
      const percentage = maxPosition.value / sliderWidth;
      const rawValue = sensorInfo.minValue + percentage * (sensorInfo.maxValue - sensorInfo.minValue);
      const roundedValue = Math.round(rawValue);
      
      if (onChangeComplete) {
        onChangeComplete(minValue, roundedValue);
      }
    },
  });

  // Animated styles
  const minHandleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: minPosition.value }],
    };
  });

  const maxHandleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: maxPosition.value }],
    };
  });

  const rangeStyle = useAnimatedStyle(() => {
    return {
      left: minPosition.value,
      width: maxPosition.value - minPosition.value,
    };
  });

  // Update values based on positions
  useEffect(() => {
    const minPercentage = minPosition.value / sliderWidth;
    const maxPercentage = maxPosition.value / sliderWidth;
    
    const newMinValue = Math.round(
      sensorInfo.minValue + minPercentage * (sensorInfo.maxValue - sensorInfo.minValue)
    );
    const newMaxValue = Math.round(
      sensorInfo.minValue + maxPercentage * (sensorInfo.maxValue - sensorInfo.minValue)
    );
    
    if (newMinValue !== minValue || newMaxValue !== maxValue) {
      setMinValue(newMinValue);
      setMaxValue(newMaxValue);
      
      if (onChange) {
        onChange(newMinValue, newMaxValue);
      }
    }
  }, [minPosition.value, maxPosition.value]);

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: colors.text }]}>
          {sensorInfo.name} Thresholds
        </Text>
        <Text style={[styles.values, { color: colors.text }]}>
          Min: {minValue} {sensorInfo.unit} | Max: {maxValue} {sensorInfo.unit}
        </Text>
      </View>
      
      <View 
        style={styles.sliderContainer}
        onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
      >
        <View 
          style={[
            styles.track,
            { backgroundColor: colors.neutral[300] }
          ]} 
        />
        <Animated.View 
          style={[
            styles.range,
            { backgroundColor: colors.primary.main },
            rangeStyle
          ]} 
        />
        
        <PanGestureHandler onGestureEvent={minHandleGestureEvent}>
          <Animated.View 
            style={[
              styles.handle,
              { backgroundColor: colors.primary.main },
              minHandleStyle
            ]}
          />
        </PanGestureHandler>
        
        <PanGestureHandler onGestureEvent={maxHandleGestureEvent}>
          <Animated.View 
            style={[
              styles.handle,
              { backgroundColor: colors.primary.main },
              maxHandleStyle
            ]}
          />
        </PanGestureHandler>
      </View>
      
      <View style={styles.valueLabels}>
        <Text style={[styles.valueLabel, { color: colors.neutral[600] }]}>
          {sensorInfo.minValue}
        </Text>
        <Text style={[styles.valueLabel, { color: colors.neutral[600] }]}>
          {sensorInfo.maxValue}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  labelContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  values: {
    fontSize: 14,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 6,
    borderRadius: 3,
    width: '100%',
  },
  range: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
  },
  handle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    top: 8,
    marginLeft: -12,
    marginTop: -10,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  valueLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  valueLabel: {
    fontSize: 12,
  },
});

export default ThresholdSlider;