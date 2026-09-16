import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';

import { supabase } from './supabase';

/**
 * Notifications de la recette du jour.
 *
 * Le site enregistre des abonnements Web Push dans `push_subscriptions` ; l'app
 * enregistre son jeton Expo dans la meme table, distingue par `platform`. Le
 * cron quotidien peut donc arroser les deux canaux depuis une seule source.
 *
 * A savoir : depuis le SDK 53, Expo Go ne delivre plus de jeton push. La
 * fonction le detecte et renonce proprement au lieu de lever une erreur — il
 * faut une build de developpement ou TestFlight pour tester reellement.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const isExpoGo = Constants.appOwnership === 'expo';

export type PushStatus = 'idle' | 'unsupported' | 'denied' | 'enabled' | 'error';

async function getProjectId(): Promise<string | undefined> {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants.easConfig as { projectId?: string } | undefined)?.projectId
  );
}

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (isExpoGo || !Device.isDevice) {
      setStatus('unsupported');
      setMessage(
        isExpoGo
          ? 'Les notifications demandent une build de l\u2019app (pas Expo Go).'
          : 'Les notifications ne fonctionnent que sur un vrai appareil.'
      );
    }
  }, []);

  const enable = useCallback(async () => {
    if (isExpoGo || !Device.isDevice) return;

    try {
      const existing = await Notifications.getPermissionsAsync();
      let granted = existing.granted;

      if (!granted) {
        const asked = await Notifications.requestPermissionsAsync();
        granted = asked.granted;
      }

      if (!granted) {
        setStatus('denied');
        setMessage('Notifications refusées. Tu peux les réactiver dans les réglages.');
        return;
      }

      if (process.env.EXPO_OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Recette du jour',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const projectId = await getProjectId();
      const token = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );

      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          endpoint: token.data,
          keys: { provider: 'expo' },
          platform: process.env.EXPO_OS ?? 'unknown',
          user_agent: `${Device.manufacturer ?? ''} ${Device.modelName ?? ''}`.trim(),
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

      if (error) throw new Error(error.message);

      setStatus('enabled');
      setMessage('Tu recevras la recette du jour.');
    } catch (error) {
      setStatus('error');
      setMessage((error as Error).message);
    }
  }, []);

  return { status, message, enable, isSupported: !isExpoGo && Device.isDevice };
}
