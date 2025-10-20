import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

interface PINInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  title?: string;
  error?: string;
  clearOnError?: boolean;
}

export default function PINInput({
  length = 4,
  onComplete,
  title = 'Enter PIN',
  error,
  clearOnError = true,
}: PINInputProps) {
  const [pin, setPin] = useState('');
  const inputRef = useRef<TextInput>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto-focus on mount
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  useEffect(() => {
    if (error && clearOnError) {
      setPin('');
      // Shake animation on error
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error, clearOnError, shakeAnimation]);

  const handlePinChange = (value: string) => {
    // Only allow digits
    const sanitized = value.replace(/[^0-9]/g, '');
    
    if (sanitized.length <= length) {
      setPin(sanitized);
      
      if (sanitized.length === length) {
        onComplete(sanitized);
      }
    }
  };

  const handleDotPress = () => {
    inputRef.current?.focus();
  };

  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < length; i++) {
      const isFilled = i < pin.length;
      dots.push(
        <TouchableOpacity
          key={i}
          onPress={handleDotPress}
          style={[
            styles.dot,
            isFilled && styles.dotFilled,
            error && styles.dotError,
          ]}
        >
          {isFilled && <View style={styles.dotInner} />}
        </TouchableOpacity>
      );
    }
    return dots;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <Animated.View
        style={[
          styles.dotsContainer,
          { transform: [{ translateX: shakeAnimation }] },
        ]}
      >
        {renderDots()}
      </Animated.View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Hidden input for keyboard */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={pin}
        onChangeText={handlePinChange}
        keyboardType="number-pad"
        maxLength={length}
        secureTextEntry={false}
        autoFocus
        caretHidden
      />

      <TouchableOpacity
        onPress={handleDotPress}
        style={styles.tapToEnterButton}
      >
        <Text style={styles.tapToEnterText}>Tap to enter PIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4A90E2',
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dotFilled: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  dotError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFEBEE',
  },
  dotInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4A90E2',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  tapToEnterButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  tapToEnterText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
  },
});

