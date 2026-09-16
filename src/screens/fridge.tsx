import { useIsRestoring } from '@tanstack/react-query';
import { Stack } from 'expo-router/stack';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { Icon, icons } from '@/components/icon';
import { RecipeCard } from '@/components/recipe-card';
import { EmptyState, ErrorState, LoadingState } from '@/components/screen-state';
import { SectionHeader } from '@/components/section-header';
import { useFavorites } from '@/lib/favorites';
import { matchRecipes, suggestIngredients, type MatchResult } from '@/lib/fridge-match';
import { useFridge } from '@/lib/fridge-store';
import { ingredientName } from '@/lib/ingredient-images';
import { useRecipes } from '@/lib/queries';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Frigo Magique : on declare ce qu'on a sous la main, l'app classe les recettes
 * par « ce qu'il reste a acheter ». Tout le calcul est local — aucune donnee ne
 * quitte l'appareil, aucun appel reseau supplementaire.
 */
export function FridgeScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isRestoring = useIsRestoring();
  const recipesQuery = useRecipes();
  const { ingredients, add, remove, toggle, clear, has, count } = useFridge();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [draft, setDraft] = useState('');

  // Les recettes `menu_only` n'ont pas d'etapes : les proposer ici menerait a
  // une fiche sans preparation. L'accueil les ecarte deja de la meme facon.
  const catalogue = useMemo(
    () => (recipesQuery.data ?? []).filter((r) => r.category !== 'menu_only'),
    [recipesQuery.data]
  );

  // Les ingredients les plus frequents du carnet, pour cocher au lieu de taper.
  const suggestions = useMemo(() => suggestIngredients(catalogue, 24), [catalogue]);

  const results = useMemo(
    () => matchRecipes(ingredients ?? [], catalogue),
    [ingredients, catalogue]
  );

  const groupes = useMemo(
    () =>
      [
        { titre: 'Réalisable maintenant', items: results.filter((r) => r.missing.length === 0) },
        {
          titre: 'Il te manque peu',
          items: results.filter((r) => r.missing.length > 0 && r.missing.length <= 2),
        },
        { titre: 'Plus loin', items: results.filter((r) => r.missing.length > 2) },
      ].filter((g) => g.items.length > 0),
    [results]
  );

  const cardWidth = (width - spacing.gutter * 2 - spacing.row) / 2;
  const isHydrating = isRestoring || recipesQuery.isLoading || ingredients === null;

  const ajouter = () => {
    add(draft);
    setDraft('');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={{ backgroundColor: theme.bgMain }}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.group,
          paddingHorizontal: spacing.gutter,
          paddingBottom: spacing.section * 2,
          gap: spacing.group,
        }}
        keyboardShouldPersistTaps="handled">
        <View style={{ gap: spacing.row }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.row }}>
            <View style={{ width: 28, height: 1, backgroundColor: theme.accent }} />
            <Text style={{ ...type.eyebrow, color: theme.accent }}>AKEL LOULOU · FRIGO</Text>
          </View>
          <Text style={{ ...type.display, color: theme.textMain }}>
            Qu'est-ce{'\n'}qu'on cuisine ?
          </Text>
          <Text style={{ ...type.body, color: theme.textMuted }}>
            Dis ce que tu as sous la main, on te dit ce que tu peux préparer.
          </Text>
        </View>

        {/* --- saisie libre --- */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              paddingHorizontal: 16,
              height: 46,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: theme.borderInput,
              backgroundColor: theme.bgInput,
            }}>
            <Icon name={icons.plus} size={15} color={theme.textPlaceholder} />
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={ajouter}
              placeholder="Ajouter un ingrédient…"
              placeholderTextColor={theme.textPlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              style={{
                flex: 1,
                fontFamily: type.body.fontFamily,
                fontSize: 13.5,
                color: theme.textMain,
              }}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ajouter au frigo"
            accessibilityState={{ disabled: !draft.trim() }}
            disabled={!draft.trim()}
            onPress={ajouter}
            style={({ pressed }) => ({
              width: 46,
              height: 46,
              borderRadius: radius.pill,
              backgroundColor: theme.accent,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !draft.trim() ? 0.35 : pressed ? 0.8 : 1,
            })}>
            <Icon name={icons.checkmark} size={16} color={theme.btnText} />
          </Pressable>
        </View>

        {/* --- ce qu'il y a dans le frigo --- */}
        {count > 0 ? (
          <View style={{ gap: spacing.row }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.row }}>
              <Text style={{ ...type.eyebrow, flex: 1, color: theme.textSecondary }}>
                {`DANS MON FRIGO · ${count}`}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Vider le frigo"
                onPress={clear}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                <Text style={{ ...type.caption, color: theme.textPlaceholder }}>Tout retirer</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {(ingredients ?? []).map((item) => (
                <Chip
                  key={item}
                  label={ingredientName(item)}
                  trailing="×"
                  selected
                  tone="accent"
                  onPress={() => remove(item)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {/* --- suggestions a cocher --- */}
        {suggestions.length > 0 ? (
          <View style={{ gap: spacing.row }}>
            <SectionHeader title="Les plus courants" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {suggestions
                .filter((s) => !has(s))
                .slice(0, 18)
                .map((s) => (
                  <Chip key={s} label={s} onPress={() => toggle(s)} />
                ))}
            </View>
          </View>
        ) : null}

        {/* --- resultats --- */}
        {isHydrating ? (
          <View style={{ height: 240 }}>
            <LoadingState />
          </View>
        ) : recipesQuery.isError && catalogue.length === 0 ? (
          <View style={{ height: 240 }}>
            <ErrorState
              message={(recipesQuery.error as Error)?.message}
              onRetry={() => recipesQuery.refetch()}
            />
          </View>
        ) : count === 0 ? (
          <View style={{ height: 260 }}>
            <EmptyState
              title="Frigo vide"
              message="Ajoute au moins un ingrédient et on cherche ce que tu peux cuisiner."
            />
          </View>
        ) : results.length === 0 ? (
          <View style={{ height: 260 }}>
            <EmptyState
              title="Rien ne colle"
              message="Aucune recette du carnet n'utilise ces ingrédients. Essaie d'en ajouter d'autres."
              action={{ label: 'Vider le frigo', onPress: clear }}
            />
          </View>
        ) : (
          groupes.map((groupe) => (
            <View key={groupe.titre} style={{ gap: spacing.row }}>
              <SectionHeader title={`${groupe.titre} · ${groupe.items.length}`} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.row }}>
                {groupe.items.map((m: MatchResult) => (
                  <View key={m.recipe.id} style={{ width: cardWidth, gap: spacing.sm }}>
                    <RecipeCard
                      recipe={m.recipe}
                      width={cardWidth}
                      isFavorite={isFavorite(m.recipe.id)}
                      onToggleFavorite={() => toggleFavorite(m.recipe.id)}
                    />
                    <Text
                      style={{
                        ...type.caption,
                        fontSize: 12,
                        color: m.missing.length === 0 ? theme.accent : theme.textPlaceholder,
                      }}>
                      {m.missing.length === 0
                        ? 'Tout y est'
                        : `Manque ${m.missing.length} : ${m.missing
                            .slice(0, 2)
                            .map(ingredientName)
                            .join(', ')}`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
}
