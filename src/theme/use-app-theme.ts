import { useColorScheme } from 'react-native';

import { palette, type BrandColors } from './index';

/** La palette du mode courant — exactement les memes valeurs que le site. */
export function useAppTheme(): BrandColors & { isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { ...palette[isDark ? 'dark' : 'light'], isDark };
}
