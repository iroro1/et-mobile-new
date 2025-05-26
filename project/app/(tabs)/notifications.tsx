import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { Bell } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Header from '@/components/Header';
import NotificationItem from '@/components/NotificationItem';
import Button from '@/components/Button';
import { useNotifications } from '@/context/NotificationContext';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { 
    notifications, 
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Handle refreshing
  const onRefresh = async () => {
    await fetchNotifications();
  };

  // Handle marking notification as read
  const handleNotificationPress = async (id: number) => {
    await markAsRead(id);
  };

  // Handle marking all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Notifications & Alerts" />
      
      <View style={styles.content}>
        {/* Header with count and mark all button */}
        <View style={styles.headerContainer}>
          <View style={styles.countContainer}>
            <Text style={[styles.notificationCount, { color: colors.text }]}>
              {notifications.length} Notifications
            </Text>
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.error.main }]}>
                <Text style={styles.badgeText}>{unreadCount} new</Text>
              </View>
            )}
          </View>
          
          {unreadCount > 0 && (
            <Button
              title="Mark All as Read"
              variant="outline"
              size="small"
              onPress={handleMarkAllAsRead}
            />
          )}
        </View>
        
        {/* Notifications list */}
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={handleNotificationPress}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              tintColor={colors.primary.main}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Bell size={48} color={colors.neutral[400]} />
              <Text style={[styles.emptyText, { color: colors.neutral[600] }]}>
                No notifications yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.neutral[500] }]}>
                When sensors exceed thresholds, you'll see alerts here
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationCount: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});