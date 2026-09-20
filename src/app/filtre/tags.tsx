import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions } from 'react-native';

import { SheetHeader } from '@/components/sheet-header';
import { useHomeFilters } from '@/lib/home-filters';
import { useRecipes } from '@/lib/queries';
import { FRACTION_FILTRE, hauteurFeuille } from '@/lib/sheet';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Choix du tag, en feuille native empilee.
 *
 * Une route fixe plutot qu'une route dynamique : avec `filtre/[type]`,
 * `useLocalSearchParams()` renvoyait un objet vide au premier rendu sur
 * appareil. Et un seul enfant — le defilement, titre compris : une `formSheet`
 * ne transmet pas sa hauteur a son contenu, et deux enfants frere et soeur s'y
 * dessinaient l'un par-dessus l'autre.
 */
export default function FiltreTagsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { tag, set } = useHomeFilters();
  const recipesQuery = useRecipes();
  const { height } = useWindowDimensions();

  const options = useMemo(() => {
    const noms = (recipesQuery.data ?? [])
      .filter((r) => r.category !== 'menu_only')
      .flatMap((r) => r.tags ?? [])
      .filter(Boolean);
    return Array.from(new Set(noms)).sort((a, b) => a.localeCompare(b));
  }, [recipesQuery.data]);

  const lignes = ['all', ...options];

  return (
    <ScrollView
      style={{
        height: hauteurFeuille(height, FRACTION_FILTRE),
        backgroundColor: theme.bgMain,
      }}
      contentContainerStyle={{
        paddingHorizontal: spacing.row,
        paddingBottom: spacing.section,
      }}>
      <SheetHeader title="Tags" onClose={() => router.back()} />

      {options.length === 0 ? (
        <Text
          style={{
            ...type.body,
            color: theme.textPlaceholder,
            textAlign: 'center',
            paddingVertical: spacing.group,
          }}>
          {recipesQuery.isPending ? 'Chargement…' : 'Aucun tag dans le carnet.'}
        </Text>
      ) : null}

      {lignes.map((option) => {
        const actif = option === tag;

        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: actif }}
            onPress={() => {
              set('tag', option);
              router.back();
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.row,
              paddingHorizontal: spacing.row,
              paddingVertical: 14,
              borderRadius: radius.sm,
              backgroundColor: actif || pressed ? theme.bgHover : 'transparent',
            })}>
            <Text
              style={{ fontSize: 14, width: 24, textAlign: 'center', color: theme.textSecondary }}>
              #
            </Text>
            <Text style={{ ...type.body, flex: 1, color: actif ? theme.accent : theme.textMain }}>
              {option === 'all' ? 'Tous les tags' : option}
            </Text>
            {actif ? <Text style={{ fontSize: 15, color: theme.accent }}>✓</Text> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
