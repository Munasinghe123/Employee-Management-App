import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/authContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';

export default function RootLayout() {
  const colorScheme = useColorScheme();

   useEffect(() => {
    NavigationBar.setBackgroundColorAsync('#f3f4f6');
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Splash (index.tsx) */}
            <Stack.Screen name="index" />

            {/* Auth */}
            <Stack.Screen name="login" />

            {/* Main App */}
            <Stack.Screen name="(drawer)" />
          </Stack>

          <StatusBar style="auto" />
        </AuthProvider>

      </ThemeProvider>
    </SafeAreaProvider>
  );
}
