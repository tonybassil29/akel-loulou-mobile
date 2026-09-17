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
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { palette } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

SplashScreen.preventAutoHideAsync();

const WEEK = 7 * 24 * 60 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      retry: 2,
      // Le cache doit survivre a une semaine sans ouvrir l'app, sinon il serait
      // ramasse avant meme d'etre relu au retour.
      gcTime: WEEK,
      // Hors ligne, on sert le cache d'abord et on tente quand meme la requete
      // au lieu de la mettre en pause : c'est ce qui permet a l'app d'etre
      // entierement utilisable en avion ou en magasin.
      networkMode: 'offlineFirst',
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'akel-loulou.query-cache',
});

/**
 * Change de valeur a chaque version : sans ca, un cache ecrit par une version
 * precedente serait rehydrate tel quel sous un type modifie, et planterait.
 */
const CACHE_BUSTER = Constants.expoConfig?.version ?? '1.0.0';

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
      persistOptions={{ persister, maxAge: WEEK, buster: CACHE_BUSTER }}>
      <ThemeProvider value={navigationTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.bgMain },
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="recipe/[id]" />
          <Stack.Screen name="about" />
          <Stack.Screen name="cook/[id]" options={{ presentation: 'fullScreenModal' }} />
          {/* Feuilles natives : des ecrans empiles, pas des vues superposees.
              Les feuilles `@expo/ui` affichaient leur contenu mais aucune
              ligne ne recevait le toucher. */}
          <Stack.Screen
            name="filtre/[type]"
            options={{
              presentation: 'formSheet',
              headerShown: true,
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.55, 1],
            }}
          />
          <Stack.Screen
            name="menu/pick"
            options={{
              presentation: 'formSheet',
              headerShown: true,
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.7, 1],
            }}
          />
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
