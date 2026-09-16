import { Text, View } from 'react-native';

import { spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * L'intitule de section du site (.label-eyebrow) : petites capitales roses
 * tres espacees, suivies d'un filet qui file jusqu'au bord.
 */
export function SectionHeader({ title, color }: { title: string; color?: string }) {
  const theme = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.row }}>
      <Text style={{ ...type.eyebrow, color: color ?? theme.accent }}>
        {title.toUpperCase()}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: theme.borderCard }} />
    </View>
  );
}
