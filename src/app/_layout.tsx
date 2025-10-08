
import '@/global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ReactElement, useEffect } from 'react';
import { NAV_THEME } from '@/lib/theme';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from '@/components/hooks/use-color-scheme';

export { ErrorBoundary } from '@/components/common/error-boundary';

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 3 } } });

export default function RootLayout(): ReactElement {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  return (
    <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <QueryClientProvider client={queryClient}>
          <ActionSheetProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <NavThemeProvider value={NAV_THEME[colorScheme]}>
                <Routes />
                <PortalHost />
              </NavThemeProvider>
            </GestureHandlerRootView>
          </ActionSheetProvider>
        </QueryClientProvider>
    </KeyboardProvider>
  );
}

SplashScreen.preventAutoHideAsync();

function Routes(): ReactElement {
  const router = useRouter();

  useEffect(() => {
      SplashScreen.hideAsync();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* Screens accessible to everyone can go here */}
      <Stack.Screen name="session" />
      <Stack.Screen name="session/sensor-selector" options={SCREEN_OPTIONS} />
      <Stack.Screen name="session/session-confirm" options={SCREEN_OPTIONS} />
      <Stack.Screen name="session/session-selector" options={SCREEN_OPTIONS} />
      <Stack.Screen name="session/session-creation" options={SCREEN_OPTIONS} />
      <Stack.Screen name="session/session-code-modal" options={MODAL_OPTIONS} />
    </Stack>
  );
}

const SCREEN_OPTIONS = {
  headerShown: false,
} as const;

const MODAL_OPTIONS = {
  presentation: 'modal',
  headerShown: false,
} as const;
