import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  checkBiometricSupport,
  authenticateUser,
  hasCompletedSetup,
  isBiometricEnabled,
  setBiometricEnabled,
  BiometricSupportResult,
} from '../utils/biometrics';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  needsSetup: boolean;
  biometricSupport: BiometricSupportResult | null;
  biometricEnabled: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  completeSetup: () => Promise<void>;
  checkSetupStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [biometricSupport, setBiometricSupport] = useState<BiometricSupportResult | null>(null);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      // Check biometric support
      const support = await checkBiometricSupport();
      setBiometricSupport(support);

      // Check if user has completed setup
      const setupCompleted = await hasCompletedSetup();
      setNeedsSetup(!setupCompleted);

      // Check biometric enabled status
      const bioEnabled = await isBiometricEnabled();
      setBiometricEnabledState(bioEnabled);

      // Check if user was previously authenticated
      const authStatus = await AsyncStorage.getItem('isAuthenticated');
      if (authStatus === 'true' && setupCompleted) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSetupStatus = async (): Promise<void> => {
    const setupCompleted = await hasCompletedSetup();
    setNeedsSetup(!setupCompleted);
  };

  const completeSetup = async (): Promise<void> => {
    setNeedsSetup(false);
    await checkSetupStatus();
  };

  const login = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem('isAuthenticated', 'false');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      const success = await authenticateUser();
      return success;
    } catch (error) {
      console.error('Error with biometric auth:', error);
      return false;
    }
  };

  const enableBiometric = async (): Promise<void> => {
    try {
      await setBiometricEnabled(true);
      setBiometricEnabledState(true);
    } catch (error) {
      console.error('Error enabling biometric:', error);
    }
  };

  const disableBiometric = async (): Promise<void> => {
    try {
      await setBiometricEnabled(false);
      setBiometricEnabledState(false);
    } catch (error) {
      console.error('Error disabling biometric:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        needsSetup,
        biometricSupport,
        biometricEnabled,
        login,
        logout,
        authenticateWithBiometric,
        enableBiometric,
        disableBiometric,
        completeSetup,
        checkSetupStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
