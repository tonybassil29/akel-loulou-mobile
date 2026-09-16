import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useAppTheme } from '@/theme/use-app-theme';

/**
 * La barre d'onglets native — c'est le seul endroit ou l'app s'ecarte du site :
 * la navigation suit iOS/Android (placement, materiaux, liquid glass) au lieu
 * de la barre flottante du web.
 */
export default function AppTabs() {
  const theme = useAppTheme();

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={theme.accent}
      backgroundColor={theme.bgMain}
      labelStyle={{ selected: { color: theme.accent } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'fork.knife', selected: 'fork.knife' }} md="restaurant" />
        <NativeTabs.Trigger.Label>Recettes</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>


      <NativeTabs.Trigger name="fridge">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'sparkles', selected: 'sparkles' }}
          md="auto_awesome"
        />
        <NativeTabs.Trigger.Label>Frigo</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="plan">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'calendar', selected: 'calendar' }}
          md="calendar_month"
        />
        <NativeTabs.Trigger.Label>Menu</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="shopping">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'cart', selected: 'cart.fill' }}
          md="shopping_cart"
        />
        <NativeTabs.Trigger.Label>Courses</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="gallery">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'photo.on.rectangle', selected: 'photo.fill.on.rectangle.fill' }}
          md="photo_library"
        />
        <NativeTabs.Trigger.Label>Galerie</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

    </NativeTabs>
  );
}
