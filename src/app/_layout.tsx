import {
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold_Italic,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { palette } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      // Le cache doit survivre a la fermeture de l'app pour que le mode hors
      // ligne ait quelque chose a afficher : 7 jours.
      gcTime: 7 * 24 * 60 * 60 * 1000,
      retry: 2,
      networkMode: 'offlineFirst',
    },
  },
});

/**
 * Le cache des requetes est ecrit sur le disque. Consequence : apres un premier
 * lancement en ligne, l'app affiche les recettes, les photos deja vues et la
 * page A propos meme en mode avion.
 */
const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'akel-loulou.query-cache',
});

export default function RootLayout() {
  const theme = useAppTheme();

  const [fontsLoaded] = useFonts({
    CormorantGaramond_700Bold,
    CormorantGaramond_600SemiBold_Italic,
    CormorantGaramond_500Medium_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const navigationTheme = theme.isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: palette.dark.bgMain } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: palette.light.bgMain } };

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 7 * 24 * 60 * 60 * 1000 }}>
      <ThemeProvider value={navigationTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.bgMain },
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="recipe/[id]" />
          <Stack.Screen name="cook/[id]" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen
            name="suggest"
            options={{
              presentation: 'formSheet',
              headerShown: true,
              headerTransparent: true,
              headerTitle: '',
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.65, 1],
            }}
          />
        </Stack>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
