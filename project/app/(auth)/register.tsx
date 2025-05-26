import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Plant, Lock, Mail, User } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import AuthInput from '@/components/AuthInput';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  
  // Validation state
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmationError, setPasswordConfirmationError] = useState('');

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  // Clear validation errors when typing
  useEffect(() => {
    if (name) setNameError('');
  }, [name]);

  useEffect(() => {
    if (email) setEmailError('');
  }, [email]);

  useEffect(() => {
    if (password) setPasswordError('');
    if (password && passwordConfirmation && password === passwordConfirmation) {
      setPasswordConfirmationError('');
    }
  }, [password]);

  useEffect(() => {
    if (passwordConfirmation && password === passwordConfirmation) {
      setPasswordConfirmationError('');
    }
  }, [passwordConfirmation]);

  // Handle registration
  const handleRegister = async () => {
    // Validate inputs
    let isValid = true;

    if (!name) {
      setNameError('Name is required');
      isValid = false;
    }

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    }

    if (!passwordConfirmation) {
      setPasswordConfirmationError('Please confirm your password');
      isValid = false;
    } else if (password !== passwordConfirmation) {
      setPasswordConfirmationError('Passwords do not match');
      isValid = false;
    }

    if (!isValid) return;

    try {
      clearError();
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
    } catch (err) {
      console.log('Registration error');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background }
        ]}
      >
        <View style={styles.logoContainer}>
          <Plant size={40} color={colors.primary.main} />
          <Text style={[styles.appName, { color: colors.primary.main }]}>
            agrisense
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Create Account
          </Text>
          
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error.light }]}>
              <Text style={[styles.errorText, { color: colors.error.dark }]}>
                {error}
              </Text>
            </View>
          )}

          <AuthInput
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={nameError}
            icon={User}
          />

          <AuthInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
            icon={Mail}
          />

          <AuthInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            isPassword={true}
            showPassword={showPassword}
            togglePasswordVisibility={() => setShowPassword(!showPassword)}
            error={passwordError}
            icon={Lock}
          />

          <AuthInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            secureTextEntry={!showPasswordConfirmation}
            isPassword={true}
            showPassword={showPasswordConfirmation}
            togglePasswordVisibility={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
            error={passwordConfirmationError}
            icon={Lock}
          />

          <Button
            title="Register"
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.button}
          />
        </View>

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: colors.text }]}>
            Already have an account?
          </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.loginLink, { color: colors.primary.main }]}>
                Login
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    marginTop: 8,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  button: {
    marginTop: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});