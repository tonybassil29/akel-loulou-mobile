import { Pressable, Text, View } from 'react-native';

import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Titre d'une feuille, place dans le contenu defilant et non fourni par la pile.
 *
 * Deux raisons. Un en-tete natif opaque dans une `formSheet` reserve sa hauteur
 * et ne laisse rien au contenu : la feuille s'ouvrait vide. Et une `formSheet`
 * ne transmet pas sa hauteur a son contenu, si bien que deux enfants frere et
 * soeur — un en-tete puis une liste — se dessinaient l'un par-dessus l'autre.
 * En vivant a l'interieur du defilement, ce titre n'a plus de voisin avec qui
 * se disputer la hauteur.
 */
export function SheetHeader({ title, onClose }: { title: string; onClose: () => void }) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.row,
        paddingHorizontal: spacing.sm,
        paddingTop: spacing.sm,
        paddingBottom: spacing.row,
      }}>
      <Text
        style={{ ...type.cardTitle, fontSize: 20, flex: 1, color: theme.textMain }}
        numberOfLines={1}>
        {title}
      </Text>

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
