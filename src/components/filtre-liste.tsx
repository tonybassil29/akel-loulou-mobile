import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { flagUrl } from '@/lib/country';
import { normalizeCountryName } from '@/lib/format';
import { useHomeFilters } from '@/lib/home-filters';
import { useRecipes } from '@/lib/queries';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Liste de choix d'un filtre, presentee en feuille native empilee.
 *
 * Le type de filtre est passe en prop et non par un parametre de route : avec
 * une route dynamique `filtre/[type]`, `useLocalSearchParams()` renvoie un
 * objet vide au premier rendu sur appareil. On basculait alors sur la liste des
 * tags — qui n'en compte qu'un — et l'ecran paraissait vide quand on demandait
 * les pays. Deux routes fixes, aucun parametre, aucun premier rendu ambigu.
 */
export function FiltreListe({ kind }: { kind: 'pays' | 'tags' }) {
  const theme = useAppTheme();
  const router = useRouter();
  const { country, tag, set } = useHomeFilters();
  const recipesQuery = useRecipes();

  const estPays = kind === 'pays';

  const catalogue = useMemo(
    () => (recipesQuery.data ?? []).filter((r) => r.category !== 'menu_only'),
    [recipesQuery.data]
  );

  const options = useMemo(() => {
    const noms = estPays
      ? catalogue.map((r) => normalizeCountryName(r.country)).filter(Boolean)
      : catalogue.flatMap((r) => r.tags ?? []).filter(Boolean);
    return Array.from(new Set(noms)).sort((a, b) => a.localeCompare(b));
  }, [catalogue, estPays]);

  const selected = estPays ? country : tag;
  const lignes = ['all', ...options];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgMain }}>
      <Stack.Screen options={{ title: estPays ? 'Pays' : 'Tags' }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.row, paddingBottom: spacing.section }}>
        {lignes.map((option) => {
          const actif = option === selected;
          const libelle = option === 'all' ? (estPays ? 'Tous les pays' : 'Tous les tags') : option;
          const drapeau = estPays && option !== 'all' ? flagUrl(option, 40) : null;

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: actif }}
              onPress={() => {
                set(estPays ? 'country' : 'tag', option);
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
              {drapeau ? (
                <Image
                  source={drapeau}
                  contentFit="contain"
                  style={{ width: 24, height: 17, borderRadius: 3 }}
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <Text
                  style={{
                    fontSize: 14,
                    width: 24,
                    textAlign: 'center',
                    color: theme.textSecondary,
                  }}>
                  {option === 'all' ? (estPays ? '◯' : '#') : estPays ? '·' : '#'}
                </Text>
              )}
              <Text style={{ ...type.body, flex: 1, color: actif ? theme.accent : theme.textMain }}>
                {libelle}
              </Text>
              {actif ? <Text style={{ fontSize: 15, color: theme.accent }}>✓</Text> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
