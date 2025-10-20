import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { validatePIN, savePIN, authenticateUser, checkBiometricSupport } from '../utils/biometrics';
import PINInput from '../components/PINInput';
import { useAuth } from '../hooks/useAuth';

type ChangePINStep = 'biometric' | 'verify-old' | 'enter-new' | 'confirm-new';

type RootStackParamList = {
  ChangePIN: undefined;
};

type ChangePINProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChangePIN'>;
};

export default function ChangePIN({ navigation }: ChangePINProps) {
  const { biometricEnabled } = useAuth();
  const [step, setStep] = useState<ChangePINStep>(
    biometricEnabled ? 'biometric' : 'verify-old'
  );
  const [newPin, setNewPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBiometricVerification = async (): Promise<void> => {
    setIsProcessing(true);
    setPinError('');

    try {
      const success = await authenticateUser();
      
      if (success) {
        setStep('enter-new');
      } else {
        Alert.alert(
          'Authentication Failed',
          'Biometric authentication failed. Please verify your old PIN instead.',
          [
            {
              text: 'OK',
              onPress: () => setStep('verify-old'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Biometric verification error:', error);
      setStep('verify-old');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOldPinVerification = async (pin: string): Promise<void> => {
    setIsProcessing(true);
    setPinError('');

    try {
      const isValid = await validatePIN(pin);
      
      if (isValid) {
        setStep('enter-new');
      } else {
        setPinError('Incorrect PIN. Please try again.');
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      setPinError('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewPinEntry = (pin: string): void => {
    setNewPin(pin);
    setStep('confirm-new');
    setPinError('');
  };

  const handleConfirmNewPin = async (pin: string): Promise<void> => {
    setIsProcessing(true);
    setPinError('');

    if (pin !== newPin) {
      setPinError('PINs do not match. Please try again.');
      setStep('enter-new');
      setNewPin('');
      setIsProcessing(false);
      return;
    }

    try {
      const success = await savePIN(pin);
      
      if (success) {
        Alert.alert(
          'PIN Changed Successfully',
          'Your new PIN has been saved securely.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        setPinError('Failed to save new PIN. Please try again.');
        setStep('enter-new');
        setNewPin('');
      }
    } catch (error) {
      console.error('PIN save error:', error);
      setPinError('An error occurred. Please try again.');
      setStep('enter-new');
      setNewPin('');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderBiometricStep = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Change PIN</Text>
        <Text style={styles.subtitle}>
          First, verify your identity
        </Text>
      </View>

      <View style={styles.biometricContainer}>
        <View style={styles.biometricIcon}>
          <Text style={styles.biometricIconText}>🔐</Text>
        </View>
        <Text style={styles.biometricText}>
          Use biometric authentication to continue
        </Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleBiometricVerification}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>
            {isProcessing ? 'Authenticating...' : 'Verify Identity'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.usePinButton}
        onPress={() => setStep('verify-old')}
        disabled={isProcessing}
      >
        <Text style={styles.usePinText}>Use Old PIN Instead</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVerifyOldStep = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Change PIN</Text>
        <Text style={styles.subtitle}>
          Enter your current PIN to continue
        </Text>
      </View>

      <PINInput
        onComplete={handleOldPinVerification}
        title="Enter Current PIN"
        error={pinError}
      />

      {isProcessing && (
        <ActivityIndicator size="small" color="#4A90E2" style={styles.loader} />
      )}
    </View>
  );

  const renderEnterNewStep = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>New PIN</Text>
        <Text style={styles.subtitle}>
          Create a new 4-digit PIN
        </Text>
      </View>

      <PINInput
        onComplete={handleNewPinEntry}
        title="Enter New PIN"
        error={pinError}
      />
    </View>
  );

  const renderConfirmNewStep = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirm New PIN</Text>
        <Text style={styles.subtitle}>
          Re-enter your new PIN to confirm
        </Text>
      </View>

      <PINInput
        onComplete={handleConfirmNewPin}
        title="Confirm New PIN"
        error={pinError}
      />

      {isProcessing && (
        <ActivityIndicator size="small" color="#4A90E2" style={styles.loader} />
      )}

      <TouchableOpacity
        style={styles.usePinButton}
        onPress={() => {
          setStep('enter-new');
          setNewPin('');
          setPinError('');
        }}
        disabled={isProcessing}
      >
        <Text style={styles.usePinText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <View style={styles.placeholder} />
      </View>

      {step === 'biometric' && renderBiometricStep()}
      {step === 'verify-old' && renderVerifyOldStep()}
      {step === 'enter-new' && renderEnterNewStep()}
      {step === 'confirm-new' && renderConfirmNewStep()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  placeholder: {
    width: 60,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
});

