import { BottomSheet, Host } from '@expo/ui';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { thumbUrl } from '@/lib/images';
import type { Recipe } from '@/lib/types';
import { normalizeString } from '@/lib/format';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Choisir une recette pour une case du planning. `FilterSheet` ne sait presenter
 * que des `string[]` et se ferme des la premiere selection ; ici il faut une
 * vignette, un badge de categorie et une recherche, d'ou une feuille dediee.
 */
export function RecipePickerSheet({
  isPresented,
  onDismiss,
  title,
  recipes,
  onSelect,
}: {
  isPresented: boolean;
  onDismiss: () => void;
  title: string;
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
}) {
  const theme = useAppTheme();
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const q = normalizeString(search);
    if (!q) return recipes;
    return recipes.filter((r) => normalizeString(r.title).includes(q));
  }, [recipes, search]);

  return (
    <Host style={{ position: 'absolute' }}>
      <BottomSheet isPresented={isPresented} onDismiss={onDismiss} snapPoints={['half', 'full']}>
        <View style={{ flex: 1, backgroundColor: theme.bgMain }}>
          <Text
            style={{
              ...type.eyebrow,
              color: theme.accent,
              paddingHorizontal: spacing.gutter,
              paddingTop: spacing.gutter,
              paddingBottom: spacing.row,
            }}>
            {title.toUpperCase()}
          </Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Chercher une recette…"
            placeholderTextColor={theme.textPlaceholder}
            autoCorrect={false}
            style={{
              marginHorizontal: spacing.gutter,
              marginBottom: spacing.row,
              paddingHorizontal: 16,
              height: 42,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: theme.borderInput,
              backgroundColor: theme.bgInput,
              fontFamily: type.body.fontFamily,
              fontSize: 13.5,
              color: theme.textMain,
            }}
          />

          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: spacing.row,
              paddingBottom: spacing.section,
            }}
            keyboardShouldPersistTaps="handled">
            {rows.length === 0 ? (
              <Text
                style={{
                  ...type.caption,
                  color: theme.textPlaceholder,
                  textAlign: 'center',
                  paddingVertical: spacing.group,
                }}>
                Aucune recette à ce nom.
              </Text>
            ) : null}

            {rows.map((recipe) => (
              <Pressable
                key={recipe.id}
                accessibilityRole="button"
                accessibilityLabel={recipe.title}
                onPress={() => {
                  onSelect(recipe);
                  onDismiss();
                }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.row,
                  paddingHorizontal: spacing.row,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.sm,
                  backgroundColor: pressed ? theme.bgHover : 'transparent',
                })}>
                <Image
                  source={thumbUrl(recipe.image_url, 96)}
                  contentFit="cover"
                  transition={160}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: radius.sm,
                    backgroundColor: theme.bgSubtle,
                  }}
                  accessibilityIgnoresInvertColors
                />
                <Text
                  style={{
                    ...type.cardTitle,
                    fontSize: 16,
                    flex: 1,
                    color: theme.textMain,
                  }}
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
      </BottomSheet>
    </Host>
  );
}
