import { useIsRestoring } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, icons } from '@/components/icon';
import { RecipePickerSheet } from '@/components/recipe-picker-sheet';
import { EmptyState, ErrorState, LoadingState } from '@/components/screen-state';
import { thumbUrl } from '@/lib/images';
import { useRecipes } from '@/lib/queries';
import { AISLES, aisleOf, isWater } from '@/lib/shopping-categories';
import { useShoppingList } from '@/lib/shopping-list';
import type { Recipe } from '@/lib/types';
import { DAYS, SLOTS, useWeekPlan, type MealSlot } from '@/lib/week-plan';
import { radius, shadow, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Le menu de la semaine : 7 jours x 3 creneaux, remplis par appui. Le planning
 * ne garde que des identifiants, les recettes sont re-resolues a l'affichage.
 */
export function WeekPlanScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isRestoring = useIsRestoring();
  const recipesQuery = useRecipes();
  const { plan, add, remove, clear, mealCount } = useWeekPlan();
  const { addMany } = useShoppingList();

  const [picker, setPicker] = useState<{ day: number; slot: MealSlot } | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const recipes = recipesQuery.data ?? [];

  const byId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  /**
   * Envoi vers les courses, un rayon apres l'autre. Surtout pas en parallele :
   * `addMany` lit l'etat courant avant d'ecrire, donc huit appels simultanes
   * partiraient du meme instantane et le dernier ecraserait les sept autres,
   * sans la moindre erreur.
   */
  const sendToShoppingList = useCallback(async () => {
    if (!plan) return;

    const buckets = new Map<string, string[]>();
    const seen = new Set<string>();

    for (let day = 0; day < DAYS.length; day += 1) {
      for (const { id: slot } of SLOTS) {
        for (const recipeId of plan[day]?.[slot] ?? []) {
          if (seen.has(recipeId)) continue;
          seen.add(recipeId);
          for (const raw of byId.get(recipeId)?.ingredients ?? []) {
            if (!raw || isWater(raw)) continue;
            const aisle = aisleOf(raw);
            const bucket = buckets.get(aisle.id);
            if (bucket) bucket.push(raw);
            else buckets.set(aisle.id, [raw]);
          }
        }
      }
    }

    let total = 0;
    for (const aisle of AISLES) {
      const labels = buckets.get(aisle.id);
      if (!labels?.length) continue;
      total += await addMany(labels, `menu:${aisle.id}`, aisle.label);
    }

    setStatus(
      total === 0
        ? 'Tout est déjà dans la liste de courses.'
        : `${total} ingrédient${total > 1 ? 's' : ''} ajouté${total > 1 ? 's' : ''} aux courses.`
    );
  }, [plan, byId, addMany]);

  const isHydrating = isRestoring || recipesQuery.isLoading || plan === null;

  const pickerRecipes = useMemo(
    () => [...recipes].sort((a, b) => a.title.localeCompare(b.title)),
    [recipes]
  );

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
        }}>
        <View style={{ gap: spacing.row }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.row }}>
            <View style={{ width: 28, height: 1, backgroundColor: theme.accent }} />
            <Text style={{ ...type.eyebrow, color: theme.accent }}>AKEL LOULOU · MENU</Text>
          </View>
          <Text style={{ ...type.display, color: theme.textMain }}>La semaine</Text>
          <Text style={{ ...type.body, color: theme.textMuted }}>
            {mealCount === 0
              ? 'Pose une recette sur un repas, puis envoie tout vers les courses.'
              : `${mealCount} repas prévu${mealCount > 1 ? 's' : ''} cette semaine.`}
          </Text>
        </View>

        {isHydrating ? (
          <View style={{ height: 240 }}>
            <LoadingState />
          </View>
        ) : recipesQuery.isError && recipes.length === 0 ? (
          <View style={{ height: 240 }}>
            <ErrorState
              message={(recipesQuery.error as Error)?.message}
              onRetry={() => recipesQuery.refetch()}
            />
          </View>
        ) : (
          <>
            {/* --- actions --- */}
            {mealCount > 0 ? (
              <View style={{ gap: spacing.sm }}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setStatus(null);
                    sendToShoppingList();
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.sm,
                    height: 50,
                    borderRadius: radius.pill,
                    backgroundColor: theme.accent,
                    opacity: pressed ? 0.85 : 1,
                    ...shadow(theme.shadowWarm),
                  })}>
                  <Icon name={icons.cart} size={16} color={theme.btnText} />
                  <Text style={{ ...type.button, color: theme.btnText }}>
                    Envoyer vers les courses
                  </Text>
                </Pressable>

                {status ? (
                  <Text
                    style={{ ...type.caption, color: theme.accent, textAlign: 'center' }}
                    accessibilityLiveRegion="polite">
                    {status}
                  </Text>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setStatus(null);
                    clear();
                  }}
                  style={({ pressed }) => ({
                    alignSelf: 'center',
                    paddingVertical: spacing.sm,
                    opacity: pressed ? 0.6 : 1,
                  })}>
                  <Text style={{ ...type.caption, color: theme.textPlaceholder }}>
                    Vider la semaine
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ height: 160 }}>
                <EmptyState
                  title="Semaine libre"
                  message="Touche un « + » pour poser une recette sur un repas."
                />
              </View>
            )}

            {/* --- les 7 jours --- */}
            {DAYS.map((dayLabel, day) => (
              <View
                key={dayLabel}
                style={{
                  borderRadius: radius.lg,
                  borderCurve: 'continuous',
                  borderWidth: 1,
                  borderColor: theme.borderCard,
                  backgroundColor: theme.bgCard,
                  padding: spacing.gutter,
                  gap: spacing.row,
                }}>
                <Text style={{ ...type.eyebrow, color: theme.accent }}>
                  {dayLabel.toUpperCase()}
                </Text>

                {SLOTS.map(({ id: slot, label }) => {
                  const ids = plan?.[day]?.[slot] ?? [];
                  return (
                    <View key={slot} style={{ gap: spacing.sm }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: spacing.sm,
                        }}>
                        <Text
                          style={{ ...type.caption, flex: 1, color: theme.textSecondary }}>
                          {label}
                        </Text>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Ajouter une recette — ${dayLabel} ${label}`}
                          onPress={() => {
                            setStatus(null);
                            setPicker({ day, slot });
                          }}
                          style={({ pressed }) => ({
                            width: 28,
                            height: 28,
                            borderRadius: radius.pill,
                            borderWidth: 1,
                            borderColor: theme.borderCard,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: pressed ? theme.bgHover : 'transparent',
                          })}>
                          <Icon name={icons.plus} size={13} color={theme.accent} />
                        </Pressable>
                      </View>

                      {ids.map((recipeId) => (
                        <PlannedMeal
                          key={recipeId}
                          recipe={byId.get(recipeId)}
                          // Hors ligne au tout premier lancement, la liste des
                          // recettes est vide : on n'efface surtout pas la
                          // semaine, on attend qu'elle arrive.
                          catalogueLoaded={recipes.length > 0}
                          onOpen={() =>
                            router.push({ pathname: '/recipe/[id]', params: { id: recipeId } })
                          }
                          onRemove={() => remove(day, slot, recipeId)}
                        />
                      ))}
                    </View>
                  );
                })}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <RecipePickerSheet
        isPresented={picker !== null}
        onDismiss={() => setPicker(null)}
        title={
          picker
            ? `${DAYS[picker.day]} · ${SLOTS.find((s) => s.id === picker.slot)?.label ?? ''}`
            : ''
        }
        recipes={pickerRecipes}
        onSelect={(recipe) => {
          if (picker) add(picker.day, picker.slot, recipe.id);
        }}
      />
    </>
  );
}

function PlannedMeal({
  recipe,
  catalogueLoaded,
  onOpen,
  onRemove,
}: {
  recipe: Recipe | undefined;
  catalogueLoaded: boolean;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const theme = useAppTheme();
  const unavailable = !recipe && catalogueLoaded;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.row,
        paddingVertical: spacing.xs,
      }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={recipe?.title ?? 'Recette indisponible'}
        disabled={!recipe}
        onPress={onOpen}
        style={({ pressed }) => ({
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.row,
          opacity: pressed ? 0.7 : 1,
        })}>
        <Image
          source={thumbUrl(recipe?.image_url, 88)}
          contentFit="cover"
          transition={160}
          style={{
            width: 40,
            height: 40,
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
            color: unavailable ? theme.textPlaceholder : theme.textMain,
          }}
          numberOfLines={2}>
          {recipe?.title ?? (unavailable ? 'Recette indisponible' : '…')}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retirer ce repas"
        onPress={onRemove}
        hitSlop={8}
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: spacing.xs })}>
        <Icon name={icons.close} size={13} color={theme.textPlaceholder} />
      </Pressable>
    </View>
  );
}
