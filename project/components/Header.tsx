import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { Bell, Settings, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useNotifications } from '@/context/NotificationContext';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showNotification?: boolean;
  showSettings?: boolean;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showNotification = false,
  showSettings = false,
  onBackPress,
  onNotificationPress,
  onSettingsPress,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { unreadCount } = useNotifications();

  return (
    <View style={[
      styles.container,
      { backgroundColor: colors.card }
    ]}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.iconButton}
          >
            <ArrowLeft size={24} color={colors.primary.main} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[
        styles.title,
        { color: colors.text }
      ]}>
        {title}
      </Text>

      <View style={styles.rightContainer}>
        {showNotification && (
          <TouchableOpacity
            onPress={onNotificationPress}
            style={styles.iconButton}
          >
            <Bell size={24} color={colors.primary.main} />
            {unreadCount > 0 && (
              <View style={[
                styles.badge,
                { backgroundColor: colors.error.main }
              ]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {showSettings && (
          <TouchableOpacity
            onPress={onSettingsPress}
            style={styles.iconButton}
          >
            <Settings size={24} color={colors.primary.main} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  leftContainer: {
    width: 40,
  },
  rightContainer: {
    flexDirection: 'row',
    width: 80,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Header;