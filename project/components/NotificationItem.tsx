import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { AlertTriangle, BellRing } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { Notification } from '@/types';

interface NotificationItemProps {
  notification: Notification;
  onPress: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  // For animation
  const opacity = useSharedValue(notification.read ? 0.7 : 1);
  const height = useSharedValue(80);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      height: height.value,
    };
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePress = () => {
    if (!notification.read) {
      opacity.value = withTiming(0.7, { duration: 300, easing: Easing.inOut(Easing.ease) });
      onPress(notification.id);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <Animated.View style={[
        styles.container,
        { 
          backgroundColor: notification.read ? colors.neutral[100] : colors.card,
          borderLeftColor: notification.severity === 'critical' ? colors.error.main : colors.warning.main,
        },
        animatedStyle
      ]}>
        <View style={styles.iconContainer}>
          {notification.severity === 'critical' ? (
            <AlertTriangle color={colors.error.main} size={24} />
          ) : (
            <BellRing color={colors.warning.main} size={24} />
          )}
        </View>
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {notification.sensor_type.replace('_', ' ').toUpperCase()}
          </Text>
          <Text style={[styles.message, { color: colors.neutral[700] }]}>
            {notification.message}
          </Text>
          <Text style={[styles.time, { color: colors.neutral[500] }]}>
            {formatTime(notification.timestamp)}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
});

export default NotificationItem;