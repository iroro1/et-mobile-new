import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { 
  ApiResponse, 
  LoginCredentials, 
  RegisterData, 
  SensorReading, 
  SensorThreshold, 
  Notification, 
  User 
} from '@/types';

// Set base URL based on environment
const API_URL = Platform.select({
  web: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8081/api'  // Updated port to match Expo's web server
    : '/api', // In production, use relative path
  default: 'http://localhost:8000/api',
});

// Create axios instance with retry logic
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add retry interceptor
api.interceptors.response.use(undefined, async (err) => {
  const { config, message } = err;
  if (!config || !config.retry) {
    return Promise.reject(err);
  }
  
  // Retry only on network errors, up to 3 times
  if (message === 'Network Error' && config.retryCount < 3) {
    config.retryCount = config.retryCount ? config.retryCount + 1 : 1;
    
    // Implement exponential backoff
    const backoff = Math.pow(2, config.retryCount) * 1000;
    
    await new Promise(resolve => setTimeout(resolve, backoff));
    return api(config);
  }
  
  return Promise.reject(err);
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Add retry configuration
    config.retry = true;
    config.retryCount = 0;

    // Check if we're on web platform
    if (Platform.OS !== 'web') {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // For web, use localStorage instead
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API services
export const authService = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{user: User, token: string}>> => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      // Save token securely
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync('auth_token', response.data.token);
      } else {
        localStorage.setItem('auth_token', response.data.token);
      }
    }
    return response.data;
  },
  
  register: async (data: RegisterData): Promise<ApiResponse<{user: User, token: string}>> => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      // Save token securely
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync('auth_token', response.data.token);
      } else {
        localStorage.setItem('auth_token', response.data.token);
      }
    }
    return response.data;
  },
  
  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token: string, email: string, password: string, password_confirmation: string): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/reset-password', {
      token,
      email,
      password,
      password_confirmation
    });
    return response.data;
  },
  
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/logout');
    // Remove token
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync('auth_token');
    } else {
      localStorage.removeItem('auth_token');
    }
    return response.data;
  },
  
  getUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/user');
    return response.data;
  },
};

// Sensor API services
export const sensorService = {
  getSensorReadings: async (): Promise<ApiResponse<SensorReading[]>> => {
    const response = await api.get('/sensors/readings');
    return response.data;
  },
  
  getSensorReadingsByType: async (type: string): Promise<ApiResponse<SensorReading[]>> => {
    const response = await api.get(`/sensors/readings/${type}`);
    return response.data;
  },
  
  getThresholds: async (): Promise<ApiResponse<SensorThreshold[]>> => {
    const response = await api.get('/sensors/thresholds');
    return response.data;
  },
  
  updateThreshold: async (id: number, data: Partial<SensorThreshold>): Promise<ApiResponse<SensorThreshold>> => {
    const response = await api.put(`/sensors/thresholds/${id}`, data);
    return response.data;
  },
  
  createThreshold: async (data: Omit<SensorThreshold, 'id'>): Promise<ApiResponse<SensorThreshold>> => {
    const response = await api.post('/sensors/thresholds', data);
    return response.data;
  },
};

// Notification API services
export const notificationService = {
  getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await api.get('/notifications');
    return response.data;
  },
  
  markAsRead: async (id: number): Promise<ApiResponse<Notification>> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  
  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};

export default api;