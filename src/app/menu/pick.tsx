import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { normalizeString } from '@/lib/format';
import { thumbUrl } from '@/lib/images';
import { useRecipes } from '@/lib/queries';
import { DAYS, SLOTS, useWeekPlan, type MealSlot } from '@/lib/week-plan';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Choix d'une recette pour un creneau du planning, en feuille native empilee.
 *
 * Remplace la feuille `@expo/ui` qui s'affichait mais dont aucune ligne ne
 * repondait au toucher : son `Host` en position absolue n'avait aucune taille.
 */
export default function MenuPickScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { day, slot } = useLocalSearchParams<{ day: string; slot: string }>();
  const recipesQuery = useRecipes();
  const { add } = useWeekPlan();
  const [search, setSearch] = useState('');

  const jour = Number(day);
  const creneau = slot as MealSlot;
  const titre =
    Number.isInteger(jour) && DAYS[jour]
      ? `${DAYS[jour]} · ${SLOTS.find((s) => s.id === creneau)?.label ?? ''}`
      : 'Choisir une recette';

  const recettes = useMemo(() => {
    const liste = [...(recipesQuery.data ?? [])].sort((a, b) => a.title.localeCompare(b.title));
    const q = normalizeString(search);
    return q ? liste.filter((r) => normalizeString(r.title).includes(q)) : liste;
  }, [recipesQuery.data, search]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgMain }}>
      <Stack.Screen options={{ title: titre }} />

      <View style={{ paddingHorizontal: spacing.gutter, paddingTop: spacing.row }}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Chercher une recette…"
          placeholderTextColor={theme.textPlaceholder}
          autoCorrect={false}
          clearButtonMode="while-editing"
          style={{
            paddingHorizontal: 16,
            height: 44,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: theme.borderInput,
            backgroundColor: theme.bgInput,
            fontFamily: type.body.fontFamily,
            fontSize: 15,
            color: theme.textMain,
          }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.row, paddingBottom: spacing.section }}
        keyboardShouldPersistTaps="handled">
        {recettes.length === 0 ? (
          <Text
            style={{
              ...type.body,
              color: theme.textPlaceholder,
              textAlign: 'center',
              paddingVertical: spacing.group,
            }}>
            Aucune recette à ce nom.
          </Text>
        ) : null}

        {recettes.map((recipe) => (
          <Pressable
            key={recipe.id}
            accessibilityRole="button"
            accessibilityLabel={recipe.title}
            onPress={() => {
              if (Number.isInteger(jour) && creneau) add(jour, creneau, recipe.id);
              router.back();
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.row,
              paddingHorizontal: spacing.row,
              paddingVertical: spacing.sm + 2,
              borderRadius: radius.sm,
              backgroundColor: pressed ? theme.bgHover : 'transparent',
            })}>
            <Image
              source={thumbUrl(recipe.image_url, 120)}
              contentFit="cover"
              transition={160}
              style={{
                width: 48,
                height: 48,
                borderRadius: radius.sm,
                backgroundColor: theme.bgSubtle,
              }}
              accessibilityIgnoresInvertColors
            />
            <Text
              style={{ ...type.cardTitle, fontSize: 17, flex: 1, color: theme.textMain }}
              numberOfLines={2}>
              {recipe.title}
            </Text>
            {recipe.category === 'menu_only' ? (
              <Text
                style={{
                  ...type.eyebrow,
                  fontSize: 9,
                  color: theme.accent,
                  borderWidth: 1,
                  borderColor: theme.borderCard,
                  borderRadius: radius.pill,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}>
                MINUTE
              </Text>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
