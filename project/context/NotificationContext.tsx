import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationService } from '@/services/api';
import { Notification } from '@/types';
import { useSensors } from './SensorContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { readings = [], thresholds = [], isReadingAlert } = useSensors();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await notificationService.getNotifications();
      setNotifications(response.data || []);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch notifications.');
      console.error('Fetch notifications error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await notificationService.markAsRead(id);
      
      // Update local state
      setNotifications(current => 
        current.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to mark notification as read.');
      console.error('Mark as read error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await notificationService.markAllAsRead();
      
      // Update all notifications in local state
      setNotifications(current => 
        current.map(notification => ({ ...notification, read: true }))
      );
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to mark all notifications as read.');
      console.error('Mark all as read error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  // Calculate unread count with null check
  const unreadCount = notifications?.filter(n => !n.read)?.length || 0;

  // Initial fetch and set up interval
  useEffect(() => {
    fetchNotifications();
    
    // Fetch notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Check for new alerts based on readings and thresholds
  useEffect(() => {
    if (Array.isArray(readings) && isReadingAlert) {
      readings.forEach(reading => {
        if (isReadingAlert(reading)) {
          // This is just UI-side alert, in a real app we'd rely on backend notifications
          console.log(`Alert: ${reading.sensor_type} reading is out of threshold range.`);
        }
      });
    }
  }, [readings, thresholds, isReadingAlert]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearError,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};