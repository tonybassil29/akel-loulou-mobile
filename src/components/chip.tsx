import * as Haptics from 'expo-haptics';
import { Pressable, Text, View } from 'react-native';

import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Pilule de filtre, reprise du site : bordure fine, libelle en majuscules
 * espacees, emoji en prefixe. L'etat actif est un aplat sombre (--text-main),
 * comme sur le web — pas un aplat rose.
 */
export function Chip({
  label,
  emoji,
  selected = false,
  tone = 'dark',
  trailing,
  onPress,
}: {
  label: string;
  emoji?: string;
  selected?: boolean;
  /** 'dark' = pilule de categorie ; 'accent' = filtre pays/tag actif. */
  tone?: 'dark' | 'accent';
  trailing?: string;
  onPress: () => void;
}) {
  const theme = useAppTheme();

  const background = selected
    ? tone === 'accent'
      ? theme.accent
      : theme.textMain
    : 'transparent';
  const border = selected
    ? tone === 'accent'
      ? theme.accent
      : theme.textMain
    : theme.borderCard;
  const color = selected
    ? tone === 'accent'
      ? theme.btnText
      : theme.bgMain
    : theme.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        if (process.env.EXPO_OS === 'ios') Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: background,
        opacity: pressed ? 0.7 : 1,
      })}>
      {emoji ? (
        <Text style={{ fontSize: 11, opacity: 0.8, marginRight: 6, color }}>{emoji}</Text>
      ) : null}
      <Text style={{ ...type.pill, color, textTransform: 'uppercase' }}>{label}</Text>
      {trailing ? (
        <Text style={{ fontSize: 9, marginLeft: 6, color, opacity: 0.7 }}>{trailing}</Text>
      ) : null}
    </Pressable>
  );
}

/** Etiquette non interactive : epices, tags. Contour rose, texte rose. */
export function Tag({
  label,
  emoji,
  background,
  color,
  borderColor,
}: {
  label: string;
  emoji?: string;
  background?: string;
  color?: string;
  borderColor?: string;
}) {
  const theme = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs + 2,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: borderColor ?? theme.borderInput,
        backgroundColor: background ?? theme.bgCard,
      }}>
      {emoji ? <Text style={{ fontSize: 13 }}>{emoji}</Text> : null}
      <Text style={{ ...type.bodySemi, fontSize: 14, color: color ?? theme.accent }}>
        {label}
      </Text>
    </View>
  );
}
