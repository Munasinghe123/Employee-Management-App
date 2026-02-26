import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/authContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
