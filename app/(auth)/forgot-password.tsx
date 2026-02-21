import { useAuth } from '@/src/context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    setError(null);
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      await resetPassword(email.trim());
      setEmailSent(true);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="mail" size={48} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successText}>
            We've sent password reset instructions to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => {
              setEmailSent(false);
              setEmail('');
            }}
          >
            <Text style={styles.resendButtonText}>Didn't receive it? Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.navBackButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="key-outline" size={40} color="#6366F1" />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email and we'll send you reset instructions.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrapper, error && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  editable={!isLoading}
                />
              </View>
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={[styles.resetButton, isLoading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                  <Text style={styles.resetButtonText}>Send Reset Link</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => router.replace('/(auth)/login')}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={16} color="#6366F1" />
            <Text style={styles.backToLoginText}>Back to Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3E2723', // Chocolate Dark
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  navBackButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#5D4037', // Chocolate
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.2)', // Gold tint
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF8E1', // Cream
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#D7CCC8', // Light Chocolate
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF8E1', // Cream
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#8D6E63', // Chocolate Light
    height: 56,
    gap: 12,
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  input: {
    flex: 1,
    color: '#FFF8E1', // Cream
    fontSize: 16,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 6,
  },
  resetButton: {
    flexDirection: 'row',
    backgroundColor: '#D4AF37', // Gold
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: '#3E2723', // Chocolate Dark on gold
    fontSize: 16,
    fontWeight: '700',
  },
  backToLogin: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 6,
  },
  backToLoginText: {
    color: '#D4AF37', // Gold
    fontSize: 14,
    fontWeight: '600',
  },
  // Success state
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(38, 166, 154, 0.2)', // Mint Green tint
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF8E1', // Cream
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: '#D7CCC8', // Light Chocolate
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emailHighlight: {
    color: '#FFF8E1', // Cream
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#D4AF37', // Gold
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  backButtonText: {
    color: '#3E2723', // Chocolate Dark on gold
    fontSize: 16,
    fontWeight: '700',
  },
  resendButton: {
    padding: 12,
  },
  resendButtonText: {
    color: '#D7CCC8', // Light Chocolate
    fontSize: 14,
  },
});
