import { Pressable, Text, View } from 'react-native';

import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * En-tete dessine a l'interieur d'une feuille, et non fourni par la pile.
 *
 * Avec `headerShown: true`, une `formSheet` reserve la place de l'en-tete natif
 * et le contenu restant se retrouvait sans hauteur : la feuille s'ouvrait vide.
 * La seule feuille qui s'affichait, « Proposer une recette », etait aussi la
 * seule avec `headerTransparent: true`. On supprime donc l'en-tete natif partout
 * et on le redessine ici, dans le flux normal du contenu.
 */
export function SheetHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        // Sans cela, le voisin en `flex: 1` peut ecraser l'en-tete a hauteur
        // nulle : son texte deborde alors et la liste se dessine par-dessus.
        flexShrink: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.row,
        paddingHorizontal: spacing.gutter,
        paddingTop: spacing.gutter,
        paddingBottom: spacing.sm,
      }}>
      <View style={{ flex: 1 }}>
        <Text style={{ ...type.cardTitle, fontSize: 20, color: theme.textMain }} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ ...type.caption, color: theme.textSecondary }}>{subtitle}</Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fermer"
        hitSlop={10}
        onPress={onClose}
        style={({ pressed }) => ({
          paddingHorizontal: spacing.row,
          paddingVertical: 7,
          borderRadius: radius.pill,
          backgroundColor: pressed ? theme.bgHover : theme.bgSubtle,
        })}>
        <Text style={{ ...type.bodySemi, fontSize: 14, color: theme.textMain }}>Fermer</Text>
      </Pressable>
    </View>
  );
}
