import { useApparence } from '@/lib/theme-preference';

import { palette, type BrandColors } from './index';

/**
 * La palette du mode courant.
 *
 * On ne lit volontairement pas `useColorScheme()` : l'app reste en clair meme
 * si le telephone est en sombre, et le sombre se choisit depuis « A propos ».
 */
export function useAppTheme(): BrandColors & { isDark: boolean } {
  const { estSombre } = useApparence();
  return { ...palette[estSombre ? 'dark' : 'light'], isDark: estSombre };
}
