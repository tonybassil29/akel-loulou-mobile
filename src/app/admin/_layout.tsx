import { Stack } from 'expo-router/stack';

import { useAppTheme } from '@/theme/use-app-theme';

export default function AdminLayout() {
  const theme = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerTintColor: theme.accent,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: theme.bgMain },
      }}
    />
  );
}
