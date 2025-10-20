import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { validatePIN, savePIN } from '../utils/biometrics';
import PINInput from '../components/PINInput';

type AuthMode = 'biometric' | 'pin' | 'setup' | 'confirm-setup';

export default function AuthScreen() {
  const {
    login,
    authenticateWithBiometric,
    biometricSupport,
    biometricEnabled,
    needsSetup,
    completeSetup,
    enableBiometric,
  } = useAuth();
  
  const [authMode, setAuthMode] = useState<AuthMode>('biometric');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [pinError, setPinError] = useState('');
  const [setupPin, setSetupPin] = useState('');

  useEffect(() => {
    initializeAuthFlow();
  }, [needsSetup, biometricSupport, biometricEnabled]);

  const initializeAuthFlow = async () => {
    // If user needs to set up PIN first
    if (needsSetup) {
      setAuthMode('setup');
      return;
    }

    // Try biometric if available and enabled
    if (biometricSupport?.isAvailable && biometricEnabled) {
      await handleBiometricAuth();
    } else {
      // Fall back to PIN
      setAuthMode('pin');
    }
  };

  const handleBiometricAuth = async (): Promise<void> => {
    setIsAuthenticating(true);
    setPinError('');
    
    try {
      const success = await authenticateWithBiometric();
      
      if (success) {
        await login();
      } else {
        // Biometric failed, fall back to PIN
        setAuthMode('pin');
        Alert.alert(
          'Authentication Failed',
          'Please enter your PIN to continue.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      setAuthMode('pin');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePinComplete = async (pin: string): Promise<void> => {
    setIsAuthenticating(true);
    setPinError('');

    try {
      const isValid = await validatePIN(pin);
      
      if (isValid) {
        await login();
      } else {
        setPinError('Incorrect PIN. Please try again.');
      }
    } catch (error) {
      console.error('PIN validation error:', error);
      setPinError('An error occurred. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSetupPinComplete = async (pin: string): Promise<void> => {
    setSetupPin(pin);
    setAuthMode('confirm-setup');
    setPinError('');
  };

  const handleConfirmPinComplete = async (pin: string): Promise<void> => {
    setIsAuthenticating(true);
    setPinError('');

    if (pin !== setupPin) {
      setPinError('PINs do not match. Please try again.');
      setAuthMode('setup');
      setSetupPin('');
      setIsAuthenticating(false);
      return;
    }

    try {
      const success = await savePIN(pin);
      
      if (success) {
        await completeSetup();
        
        // Ask if user wants to enable biometric
        if (biometricSupport?.isAvailable) {
          Alert.alert(
            'Enable Biometric Authentication?',
            'Would you like to use Face ID/Touch ID for faster login?',
            [
              {
                text: 'Not Now',
                style: 'cancel',
                onPress: async () => {
                  await login();
                },
              },
              {
                text: 'Enable',
                onPress: async () => {
                  await enableBiometric();
                  await login();
                },
              },
            ]
          );
        } else {
          await login();
        }
      } else {
        setPinError('Failed to save PIN. Please try again.');
        setAuthMode('setup');
        setSetupPin('');
      }
    } catch (error) {
      console.error('PIN setup error:', error);
      setPinError('An error occurred. Please try again.');
      setAuthMode('setup');
      setSetupPin('');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const renderBiometricView = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>GlucoMate</Text>
        <Text style={styles.subtitle}>
          Track and manage your glucose levels
        </Text>
      </View>

      <View style={styles.biometricContainer}>
        {isAuthenticating ? (
          <>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.biometricText}>Authenticating...</Text>
          </>
        ) : (
          <>
            <View style={styles.biometricIcon}>
              <Text style={styles.biometricIconText}>🔐</Text>
            </View>
            <Text style={styles.biometricText}>
              Use {biometricSupport?.supportedTypes.includes(1) ? 'Face ID' : 'Touch ID'} to unlock
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleBiometricAuth}
              disabled={isAuthenticating}
            >
              <Text style={styles.buttonText}>Authenticate</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity
        style={styles.usePinButton}
        onPress={() => setAuthMode('pin')}
        disabled={isAuthenticating}
      >
        <Text style={styles.usePinText}>Use PIN Instead</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPinView = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>GlucoMate</Text>
        <Text style={styles.subtitle}>Enter your PIN to continue</Text>
      </View>

      <PINInput
        onComplete={handlePinComplete}
        title="Enter PIN"
        error={pinError}
      />

      {isAuthenticating && (
        <ActivityIndicator size="small" color="#4A90E2" style={styles.loader} />
      )}

      {biometricSupport?.isAvailable && biometricEnabled && (
        <TouchableOpacity
          style={styles.usePinButton}
          onPress={() => setAuthMode('biometric')}
          disabled={isAuthenticating}
        >
          <Text style={styles.usePinText}>Use Biometric Instead</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSetupView = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to GlucoMate</Text>
          <Text style={styles.subtitle}>
            Let's secure your health data with a 4-digit PIN
          </Text>
        </View>

        <View style={styles.setupInfo}>
          <Text style={styles.setupInfoText}>
            🔒 Your PIN will be stored securely
          </Text>
          <Text style={styles.setupInfoText}>
            📱 Use it to access your glucose readings
          </Text>
          <Text style={styles.setupInfoText}>
            🔐 You can enable biometric auth later
          </Text>
        </View>

        <PINInput
          onComplete={handleSetupPinComplete}
          title="Create Your PIN"
          error={pinError}
        />

        {isAuthenticating && (
          <ActivityIndicator size="small" color="#4A90E2" style={styles.loader} />
        )}
      </View>
    </ScrollView>
  );

  const renderConfirmSetupView = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirm PIN</Text>
        <Text style={styles.subtitle}>
          Enter your PIN again to confirm
        </Text>
      </View>

      <PINInput
        onComplete={handleConfirmPinComplete}
        title="Confirm PIN"
        error={pinError}
      />

      {isAuthenticating && (
        <ActivityIndicator size="small" color="#4A90E2" style={styles.loader} />
      )}

      <TouchableOpacity
        style={styles.usePinButton}
        onPress={() => {
          setAuthMode('setup');
          setSetupPin('');
          setPinError('');
        }}
        disabled={isAuthenticating}
      >
        <Text style={styles.usePinText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {authMode === 'biometric' && renderBiometricView()}
      {authMode === 'pin' && renderPinView()}
      {authMode === 'setup' && renderSetupView()}
      {authMode === 'confirm-setup' && renderConfirmSetupView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  biometricContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  biometricIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  biometricIconText: {
    fontSize: 50,
  },
  biometricText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  usePinButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  usePinText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '500',
  },
  loader: {
    marginTop: 20,
  },
  setupInfo: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
    width: '100%',
  },
  setupInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});
