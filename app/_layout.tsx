import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/src/context';

// Initialize notification handler early (must be imported before any notification scheduling)
import '@/src/utils/notifications';

// Willy Wonka Golden Ticket Theme
const WonkaTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#D4AF37', // Golden Ticket Gold
    background: '#3E2723', // Chocolate Dark
    card: '#5D4037', // Chocolate
    text: '#FFF8E1', // Cream
    border: '#8D6E63', // Chocolate Light
    notification: '#E74C3C', // Danger Red
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { user, isLoading, isOnboardingComplete } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Debug logging
  console.log('RootLayoutNav:', { isLoading, isOnboardingComplete, user: !!user, segments });

  useEffect(() => {
    console.log('Navigation useEffect:', { isLoading, isOnboardingComplete, user: !!user, segments });
    
    if (isLoading) {
      console.log('Still loading, skipping navigation');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const inTabs = segments[0] === '(tabs)';

    console.log('Navigation state:', { inAuthGroup, inOnboarding, inTabs });

    // If user hasn't completed onboarding, show onboarding
    if (!isOnboardingComplete && !inOnboarding) {
      console.log('Redirecting to onboarding');
      router.replace('/onboarding');
      return;
    }

    // If onboarding complete but not logged in, show auth
    if (isOnboardingComplete && !user && !inAuthGroup) {
      console.log('Redirecting to login');
      router.replace('/(auth)/login');
      return;
    }

    // If logged in but in auth screens, redirect to tabs
    if (user && (inAuthGroup || inOnboarding)) {
      console.log('Redirecting to tabs');
      router.replace('/(tabs)');
      return;
    }
    
    console.log('No redirect needed');
  }, [user, isLoading, isOnboardingComplete, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="results"
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="receipt-history" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? WonkaTheme : DefaultTheme}>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3E2723', // Chocolate Dark
  },
});
