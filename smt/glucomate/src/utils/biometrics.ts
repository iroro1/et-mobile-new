import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const PIN_KEY = 'user_pin';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export interface BiometricSupportResult {
  isAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

/**
 * Check if biometric authentication is supported and available on the device
 */
export const checkBiometricSupport = async (): Promise<BiometricSupportResult> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    return {
      isAvailable: hasHardware && isEnrolled,
      hasHardware,
      isEnrolled,
      supportedTypes,
    };
  } catch (error) {
    console.error('Error checking biometric support:', error);
    return {
      isAvailable: false,
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
    };
  }
};

/**
 * Authenticate user using biometrics (Face ID, Touch ID, etc.)
 */
export const authenticateUser = async (): Promise<boolean> => {
  try {
    const biometricSupport = await checkBiometricSupport();

    if (!biometricSupport.isAvailable) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access GlucoMate',
      fallbackLabel: 'Use PIN',
      cancelLabel: 'Cancel',
    });

    return result.success;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return false;
  }
};

/**
 * Get the stored PIN from secure storage
 */
export const getStoredPIN = async (): Promise<string | null> => {
  try {
    const pin = await SecureStore.getItemAsync(PIN_KEY);
    return pin;
  } catch (error) {
    console.error('Error getting stored PIN:', error);
    return null;
  }
};

/**
 * Save PIN to secure storage
 */
export const savePIN = async (pin: string): Promise<boolean> => {
  try {
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      console.error('Invalid PIN format. Must be 4 digits.');
      return false;
    }

    await SecureStore.setItemAsync(PIN_KEY, pin);
    return true;
  } catch (error) {
    console.error('Error saving PIN:', error);
    return false;
  }
};

/**
 * Validate PIN input against stored PIN
 */
export const validatePIN = async (input: string): Promise<boolean> => {
  try {
    const storedPIN = await getStoredPIN();

    if (!storedPIN) {
      console.error('No PIN found in storage');
      return false;
    }

    return input === storedPIN;
  } catch (error) {
    console.error('Error validating PIN:', error);
    return false;
  }
};

/**
 * Check if biometric authentication is enabled in app settings
 */
export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking biometric enabled status:', error);
    return false;
  }
};

/**
 * Enable or disable biometric authentication in app settings
 */
export const setBiometricEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    console.error('Error setting biometric enabled status:', error);
  }
};

/**
 * Check if user has completed initial setup (PIN created)
 */
export const hasCompletedSetup = async (): Promise<boolean> => {
  const pin = await getStoredPIN();
  return pin !== null;
};

/**
 * Clear all authentication data (for logout or reset)
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(PIN_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

