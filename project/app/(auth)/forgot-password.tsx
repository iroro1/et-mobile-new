import React, { useState } from 'react';
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
import { ArrowLeft, Mail } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import AuthInput from '@/components/AuthInput';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { forgotPassword, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState(false);

  // Handle forgot password
  const handleForgotPassword = async () => {
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    try {
      clearError();
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      console.log('Forgot password error');
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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.neutral[100] }]}
          >
            <ArrowLeft size={24} color={colors.primary.main} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Forgot Password
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {success ? (
            <View style={styles.successContainer}>
              <Text style={[styles.successTitle, { color: colors.text }]}>
                Email Sent!
              </Text>
              <Text style={[styles.successMessage, { color: colors.neutral[600] }]}>
                Please check your email for instructions to reset your password.
              </Text>
              <Button
                title="Back to Login"
                onPress={() => router.replace('/login')}
                style={styles.button}
              />
            </View>
          ) : (
            <>
              <Text style={[styles.subtitle, { color: colors.neutral[600] }]}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
              
              {error && (
                <View style={[styles.errorContainer, { backgroundColor: colors.error.light }]}>
                  <Text style={[styles.errorText, { color: colors.error.dark }]}>
                    {error}
                  </Text>
                </View>
              )}

              <AuthInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (text) setEmailError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
                icon={Mail}
              />

              <Button
                title="Send Reset Link"
                onPress={handleForgotPassword}
                isLoading={isLoading}
                style={styles.button}
              />
            </>
          )}
        </View>

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: colors.text }]}>
            Remember your password?
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
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
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
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
  successContainer: {
    alignItems: 'center',
    padding: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
});