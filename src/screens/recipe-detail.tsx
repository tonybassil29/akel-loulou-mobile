import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Tag } from '@/components/chip';
import { Icon, icons, type IconName } from '@/components/icon';
import { ErrorState, LoadingState } from '@/components/screen-state';
import { SectionHeader } from '@/components/section-header';
import { flagUrl } from '@/lib/country';
import { useFavorites } from '@/lib/favorites';
import { normalizeString, parseInstructions, scaleIngredient } from '@/lib/format';
import { getIngredientImage, ingredientName, splitIngredient } from '@/lib/ingredient-images';
import { heroUrl, thumbUrl } from '@/lib/images';
import { useCustomIngredientImages, useRecipe, useRecipes } from '@/lib/queries';
import { nommeUneSousRecette, sousRecettesDe } from '@/lib/linked-recipes';
import { useShoppingList } from '@/lib/shopping-list';
import { spiceEmoji, spiceLabel } from '@/lib/spices';
import type { Recipe } from '@/lib/types';
import { brandGradient, fonts, radius, shadow, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

export function RecipeDetailScreen({ id }: { id: string }) {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const { data: recipe, isLoading, isError, error, refetch } = useRecipe(id);
  const { data: customImages = {} } = useCustomIngredientImages();
  const { data: allRecipes = [] } = useRecipes(true);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addMany } = useShoppingList();
  const [addedToList, setAddedToList] = useState(false);

  const baseServings = recipe?.servings ?? 4;
  const [servings, setServings] = useState(baseServings);
  const factor = baseServings > 0 ? servings / baseServings : 1;

  const steps = useMemo(() => parseInstructions(recipe?.instructions), [recipe?.instructions]);

  // Une etape ou un ingredient peut citer une autre recette : on la rend
  // cliquable, comme le fait le site.
  const linkable = useMemo(
    () =>
      allRecipes
        .filter((r) => r.id !== id && r.title.length > 3)
        .sort((a, b) => b.title.length - a.title.length),
    [allRecipes, id]
  );

  if (isLoading && !recipe) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bgMain }}>
        <LoadingState />
      </View>
    );
  }
  if (!recipe) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bgMain }}>
        <ErrorState
          message={isError ? (error as Error)?.message : "Cette recette n'existe plus."}
          onRetry={refetch}
        />
      </View>
    );
  }

  const favorite = isFavorite(recipe.id);
  const isDessert = recipe.category === 'dessert';
  const flag = flagUrl(recipe.country, 80);
  const heroHeight = width * 0.78;
  // Quatre par ligne : les vignettes a trois etaient trop grosses et une seule
  // rangee mangeait la moitie de l'ecran.
  const tileWidth = (width - spacing.gutter * 2 - spacing.sm * 3) / 4;

  const shareRecipe = async () => {
    await Share.share({
      title: recipe.title,
      message: [
        recipe.title,
        '',
        'Ingrédients :',
        ...(recipe.ingredients ?? []).map((i) => `- ${scaleIngredient(i, factor)}`),
        '',
        'Préparation :',
        ...steps.map((s, index) => `${index + 1}. ${s}`),
        '',
        'Akel Loulou',
      ].join('\n'),
    });
  };

  /** Verse les ingredients et les epices dans la liste de courses locale. */
  const addToShoppingList = async () => {
    // Les epices ne vont pas dans les courses : on les a deja dans le placard,
    // et elles noyaient la liste sous des lignes qu'on ne coche jamais.
    // Les sous-recettes suivent : le Beklewa sans le sucre de son Ater, ce
    // n'est pas une liste de courses. Et la ligne « Ater » elle-meme n'y va
    // pas — ses ingredients la remplacent.
    const sous = sousRecettesDe(recipe, allRecipes);
    const labels = (recipe.ingredients ?? [])
      .filter((i) => !nommeUneSousRecette(i, sous))
      .map((i) => scaleIngredient(i, factor));
    let added = await addMany(labels, recipe.id, recipe.title);
    // Une apres l'autre — `addMany` relit l'etat avant d'ecrire, deux appels
    // simultanes s'ecraseraient.
    // ...et ils se rangent sous la recette principale : la liste ne doit
    // jamais afficher « Ater » ou « Sauce skyr », seulement ce qu'on achete.
    for (const s of sous) {
      added += await addMany(s.ingredients ?? [], recipe.id, recipe.title);
    }
    setAddedToList(true);
    if (process.env.EXPO_OS === 'ios') {
      Haptics.notificationAsync(
        added > 0
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgMain }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- barre d'actions, reprise du site : "Retour" + coeur / partage / courses --- */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
          paddingTop: insets.top + spacing.sm,
          paddingBottom: spacing.row,
          paddingHorizontal: spacing.gutter,
          backgroundColor: theme.bgMain,
        }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => router.back()}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            paddingHorizontal: 18,
            paddingVertical: 11,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: theme.borderCard,
            backgroundColor: theme.bgCard,
            opacity: pressed ? 0.7 : 1,
          })}>
          <Text style={{ fontSize: 15, color: theme.accent }}>{'←'}</Text>
          <Text style={{ ...type.bodySemi, fontSize: 14.5, color: theme.accent }}>Retour</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <CircleAction
            label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            icon={favorite ? icons.heartFill : icons.heart}
            filled={favorite}
            onPress={() => {
              if (process.env.EXPO_OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              toggleFavorite(recipe.id);
            }}
          />
          <CircleAction label="Partager" icon={icons.share} onPress={shareRecipe} />
          <CircleAction
            label="Ajouter a la liste de courses"
            icon={addedToList ? icons.checkmark : icons.cart}
            filled={addedToList}
            onPress={addToShoppingList}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.section * 2 }}
        showsVerticalScrollIndicator={false}>
        {/* --- photo + badge + titre --- */}
        <View style={{ height: heroHeight, backgroundColor: theme.bgSubtle }}>
          <Image
            source={heroUrl(recipe.image_url, Math.round(width * 2))}
            contentFit="cover"
            transition={260}
            style={{ width: '100%', height: '100%' }}
            accessibilityIgnoresInvertColors
          />
          <LinearGradient
            colors={['transparent', `${theme.bgMain}00`, theme.bgMain]}
            locations={[0, 0.45, 1]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '75%' }}
          />

          <View
            style={{
              position: 'absolute',
              left: spacing.gutter,
              right: spacing.gutter,
              bottom: spacing.row,
              gap: spacing.sm,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  alignSelf: 'flex-start',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: radius.pill,
                  backgroundColor: theme.bgCard,
                }}>
                <Text style={{ fontSize: 11 }}>{isDessert ? '\u{1F370}' : '\u{1F37D}️'}</Text>
                <Text
                  style={{
                    ...type.badge,
                    color: isDessert ? theme.badgeDessertText : theme.badgePlatText,
                  }}>
                  {isDessert ? 'DESSERT' : 'PLAT'}
                </Text>
              </View>
              {flag ? (
                <Image
                  source={flag}
                  contentFit="contain"
                  style={{ width: 26, height: 18, borderRadius: 3 }}
                  accessibilityIgnoresInvertColors
                />
              ) : null}
            </View>

            <Text style={{ ...type.heroTitle, color: theme.textMain }}>{recipe.title}</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.gutter, gap: spacing.section, paddingTop: spacing.sm }}>
          {recipe.description ? (
            <Text style={{ ...type.body, color: theme.textMuted }}>{recipe.description}</Text>
          ) : null}

          {recipe.show_portions ? (
            <ServingsStepper
              servings={servings}
              onChange={(next) => setServings(Math.max(1, Math.min(24, next)))}
            />
          ) : null}

          {(recipe.ingredients ?? []).length > 0 ? (
            <View style={{ gap: spacing.group }}>
              <SectionHeader title="Ingrédients" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {recipe.ingredients.map((ingredient, index) => (
                  <IngredientTile
                    key={`${ingredient}-${index}`}
                    label={scaleIngredient(ingredient, factor)}
                    imageUrl={getIngredientImage(ingredient, customImages)}
                    linkedRecipe={findLinked(ingredient, linkable)}
                    width={tileWidth}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {(recipe.spices ?? []).length > 0 ? (
            <View style={{ gap: spacing.group }}>
              <SectionHeader title="Épices & assaisonnements" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {recipe.spices.map((spice) => (
                  <Tag key={spice} label={spiceLabel(spice)} emoji={spiceEmoji(spice)} />
                ))}
              </View>
            </View>
          ) : null}

          {(recipe.equipment ?? []).length > 0 ? (
            <View style={{ gap: spacing.group }}>
              <SectionHeader title="Matériel" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {recipe.equipment.map((item) => (
                  <View key={item.name} style={{ width: tileWidth, gap: spacing.sm }}>
                    <View
                      style={{
                        // Le carre du materiel est plus petit que la cellule :
                        // quatre par ligne, mais des vignettes discretes — ce
                        // sont des ustensiles, pas le sujet de la page.
                        width: '76%',
                        alignSelf: 'center',
                        aspectRatio: 1,
                        borderRadius: radius.md,
                        borderCurve: 'continuous',
                        backgroundColor: theme.bgCard,
                        overflow: 'hidden',
                        ...shadow(theme.shadowCard),
                      }}>
                      <Image
                        source={thumbUrl(item.image_url, 300)}
                        contentFit="contain"
                        style={{ width: '100%', height: '100%' }}
                        accessibilityIgnoresInvertColors
                      />
                    </View>
                    <Text
                      numberOfLines={3}
                      style={{
                        ...type.bodySemi,
                        fontSize: 11.5,
                        color: theme.textMain,
                        textAlign: 'center',
                      }}>
                      {item.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {steps.length > 0 ? (
            <View style={{ gap: spacing.group }}>
              <SectionHeader title="Préparation" />

              {/* Mode cuisson : une etape par ecran, ecran maintenu allume,
                  minuteurs detectes dans le texte. */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Lancer le mode cuisson"
                onPress={() =>
                  router.push({ pathname: '/cook/[id]', params: { id: recipe.id } })
                }
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
                <LinearGradient
                  colors={brandGradient(theme)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.sm,
                    paddingVertical: 15,
                    borderRadius: radius.pill,
                  }}>
                  <Icon name={icons.sparkles} size={15} color={theme.btnText} />
                  <Text style={{ ...type.button, color: theme.btnText }}>
                    Mode cuisson {'\u00b7'} {steps.length} étapes
                  </Text>
                </LinearGradient>
              </Pressable>

              <View>
                {steps.map((step, index) => (
                  <StepRow
                    key={index}
                    index={index + 1}
                    text={step}
                    isLast={index === steps.length - 1}
                    linkable={linkable}
                    onOpenRecipe={(recipeId) =>
                      router.push({ pathname: '/recipe/[id]', params: { id: recipeId } })
                    }
                  />
                ))}
              </View>
            </View>
          ) : null}

          {(recipe.tags ?? []).length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {recipe.tags.map((t) => (
                <Tag key={t} label={`#${t}`} />
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

// ------------------------------------------------------------------ morceaux

function CircleAction({
  label,
  icon,
  filled = false,
  onPress,
}: {
  label: string;
  icon: IconName;
  filled?: boolean;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: filled ? theme.accent : theme.borderCard,
        backgroundColor: filled ? theme.accent : theme.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}>
      <Icon name={icon} size={17} color={filled ? theme.btnText : theme.accent} />
    </Pressable>
  );
}

function ServingsStepper({
  servings,
  onChange,
}: {
  servings: number;
  onChange: (value: number) => void;
}) {
  const theme = useAppTheme();
  const step = (delta: number) => {
    if (process.env.EXPO_OS === 'ios') Haptics.selectionAsync();
    onChange(servings + delta);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.gutter,
        paddingVertical: spacing.row,
        borderRadius: radius.lg,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: theme.borderCard,
        backgroundColor: theme.bgCard,
      }}>
      <Text style={{ ...type.eyebrow, color: theme.textSecondary }}>PORTIONS</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.gutter }}>
        <StepperButton
          icon={icons.minus}
          label="Moins de portions"
          onPress={() => step(-1)}
          disabled={servings <= 1}
        />
        <Text
          style={{
            fontFamily: fonts.serif,
            fontSize: 26,
            minWidth: 32,
            textAlign: 'center',
            color: theme.textMain,
          }}>
          {servings}
        </Text>
        <StepperButton icon={icons.plus} label="Plus de portions" onPress={() => step(1)} />
      </View>
    </View>
  );
}

function StepperButton({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 32,
        height: 32,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: theme.borderInput,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.3 : pressed ? 0.6 : 1,
      })}>
      <Icon name={icon} size={13} color={theme.accent} />
    </Pressable>
  );
}

function IngredientTile({
  label,
  imageUrl,
  linkedRecipe,
  width,
}: {
  label: string;
  imageUrl: string | null;
  linkedRecipe: Recipe | null;
  width: number;
}) {
  const theme = useAppTheme();
  const router = useRouter();
  const name = ingredientName(label);
  // Quantite au-dessus, nom en dessous — la mise en forme du site. Sans ca,
  // l'app n'affichait aucun poids : on voyait « cacao » sans les 25 g.
  const { qty, nom } = splitIngredient(label);

  const body = (
    <>
      <View
        style={{
          aspectRatio: 1,
          borderRadius: radius.md,
          borderCurve: 'continuous',
          backgroundColor: theme.bgCard,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          ...shadow(theme.shadowCard),
        }}>
        {imageUrl ? (
          <Image
            source={imageUrl}
            contentFit="contain"
            transition={180}
            style={{ width: '76%', height: '76%' }}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Text style={{ fontSize: 22 }}>{'\u{1F957}'}</Text>
        )}
      </View>

      <View style={{ gap: 1 }}>
        {qty ? (
          <Text
            numberOfLines={2}
            style={{
              // La quantite est l'information que la cuisiniere cherche : en
              // gras, en couleur pleine, plus grande que le nom en dessous.
              ...type.bodySemi,
              fontSize: 13,
              lineHeight: 16,
              textAlign: 'center',
              color: linkedRecipe ? theme.accent : theme.textMain,
            }}>
            {qty}
          </Text>
        ) : null}
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
          <Text
            numberOfLines={3}
            style={{
              ...type.caption,
              fontSize: 11,
              textAlign: 'center',
              color: linkedRecipe ? theme.accent : qty ? theme.textSecondary : theme.textMain,
            }}>
            {qty ? nom : name}
          </Text>
          {linkedRecipe ? (
            <Icon name={icons.chevronRight} size={10} color={theme.accent} />
          ) : null}
        </View>
      </View>
    </>
  );

  if (!linkedRecipe) return <View style={{ width, gap: spacing.sm }}>{body}</View>;

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Voir la recette ${linkedRecipe.title}`}
      onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: linkedRecipe.id } })}
      style={({ pressed }) => ({ width, gap: spacing.sm, opacity: pressed ? 0.6 : 1 })}>
      {body}
    </Pressable>
  );
}

function StepRow({
  index,
  text,
  isLast,
  linkable,
  onOpenRecipe,
}: {
  index: number;
  text: string;
  isLast: boolean;
  linkable: Recipe[];
  onOpenRecipe: (id: string) => void;
}) {
  const theme = useAppTheme();
  const linked = findLinked(text, linkable);

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: spacing.row + 2,
        alignItems: 'flex-start',
        paddingVertical: spacing.gutter,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.borderCard,
      }}>
      <LinearGradient
        colors={brandGradient(theme)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 38,
          height: 38,
          borderRadius: radius.sm,
          borderCurve: 'continuous',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ ...type.bodySemi, fontSize: 15, color: theme.btnText }}>{index}</Text>
      </LinearGradient>

      <View style={{ flex: 1, gap: spacing.xs, paddingTop: 5 }}>
        <Text selectable style={{ ...type.body, color: theme.textMain }}>
          {text}
        </Text>
        {linked ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => onOpenRecipe(linked.id)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              opacity: pressed ? 0.6 : 1,
            })}>
            <Text
              style={{
                ...type.bodySemi,
                fontSize: 14,
                color: theme.accent,
                textDecorationLine: 'underline',
              }}>
              {linked.title}
            </Text>
            <Icon name={icons.chevronRight} size={10} color={theme.accent} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function findLinked(text: string, candidates: Recipe[]): Recipe | null {
  const haystack = normalizeString(text);
  if (!haystack) return null;
  return candidates.find((r) => haystack.includes(normalizeString(r.title))) ?? null;
}
