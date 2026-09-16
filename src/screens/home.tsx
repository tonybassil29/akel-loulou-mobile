import { useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { FilterSheet } from '@/components/filter-sheet';
import { Icon, icons } from '@/components/icon';
import { RecipeCard } from '@/components/recipe-card';
import { EmptyState, ErrorState, LoadingState } from '@/components/screen-state';
import { normalizeCountryName, normalizeString } from '@/lib/format';
import { useFavorites } from '@/lib/favorites';
import { useHeaderSettings, useRecipes } from '@/lib/queries';
import type { Recipe } from '@/lib/types';
import { radius, shadow, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

type CategoryFilter = 'all' | 'plat' | 'dessert' | 'favorite';

export function HomeScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const router = useRouter();

  const recipesQuery = useRecipes();
  const { data: header } = useHeaderSettings();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [country, setCountry] = useState('all');
  const [tag, setTag] = useState('all');
  const [openSheet, setOpenSheet] = useState<'pays' | 'tags' | null>(null);

  // Les emojis des filtres viennent de settings.header, comme sur le site :
  // les changer sur le web les change ici aussi.
  const filters: { id: CategoryFilter; label: string; emoji: string }[] = [
    { id: 'all', label: header?.filterAllText ?? 'Tout', emoji: header?.filterAllEmoji ?? '✨' },
    { id: 'plat', label: header?.filterPlatText ?? 'Plats', emoji: header?.filterPlatEmoji ?? '◆' },
    {
      id: 'dessert',
      label: header?.filterDessertText ?? 'Desserts',
      emoji: header?.filterDessertEmoji ?? '✦',
    },
    { id: 'favorite', label: 'Favoris', emoji: '♥' },
  ];

  const catalogue = useMemo(
    () => (recipesQuery.data ?? []).filter((r) => r.category !== 'menu_only'),
    [recipesQuery.data]
  );

  const countries = useMemo(() => {
    const names = catalogue
      .map((r) => normalizeCountryName(r.country))
      .filter((n): n is string => Boolean(n));
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [catalogue]);

  const tags = useMemo(() => {
    const all = catalogue.flatMap((r) => r.tags ?? []).filter(Boolean);
    return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
  }, [catalogue]);

  const results = useMemo(() => {
    const query = normalizeString(search);

    return catalogue.filter((recipe) => {
      if (category === 'favorite' && !isFavorite(recipe.id)) return false;
      if ((category === 'plat' || category === 'dessert') && recipe.category !== category) {
        return false;
      }
      if (country !== 'all' && normalizeCountryName(recipe.country) !== country) return false;
      if (tag !== 'all' && !(recipe.tags ?? []).includes(tag)) return false;
      if (!query) return true;

      // Meme portee de recherche que le site : titre, description, ingredients,
      // epices, materiel, pays et preparation.
      const haystack = [
        recipe.title,
        recipe.description,
        recipe.country,
        recipe.instructions,
        ...(recipe.ingredients ?? []),
        ...(recipe.spices ?? []),
        ...(recipe.equipment ?? []).map((e) => e.name),
      ]
        .filter(Boolean)
        .map((v) => normalizeString(String(v)))
        .join(' ');
      return haystack.includes(query);
    });
  }, [catalogue, category, country, tag, search, isFavorite]);

  const gap = spacing.row;
  const cardWidth = (width - spacing.gutter * 2 - gap) / 2;
  const hasFilter = category !== 'all' || country !== 'all' || tag !== 'all' || search.length > 0;
  const isHydrating = recipesQuery.isLoading || favorites === null;

  const reset = () => {
    setCategory('all');
    setCountry('all');
    setTag('all');
    setSearch('');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        keyboardShouldPersistTaps="handled"
        columnWrapperStyle={{ gap, alignItems: 'flex-start' }}
        style={{ backgroundColor: theme.bgMain }}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.group,
          paddingHorizontal: spacing.gutter,
          paddingBottom: spacing.section * 2,
          gap,
        }}
        refreshControl={
          <RefreshControl
            refreshing={recipesQuery.isRefetching}
            onRefresh={recipesQuery.refetch}
            tintColor={theme.accent}
            progressViewOffset={insets.top}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: spacing.group, paddingBottom: spacing.group }}>
            {/* --- recherche + suggestion, comme la barre du site --- */}
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
                  borderColor: theme.borderCard,
                  backgroundColor: theme.bgCard,
                }}>
                <Icon name={icons.search} size={16} color={theme.textPlaceholder} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Rechercher une recette, un ingrédient…"
                  placeholderTextColor={theme.textPlaceholder}
                  autoCapitalize="none"
                  returnKeyType="search"
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
                accessibilityLabel="Suggérer une recette"
                onPress={() => router.push('/suggest')}
                style={({ pressed }) => ({
                  width: 46,
                  height: 46,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: theme.borderCard,
                  backgroundColor: theme.bgCard,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}>
                <Text style={{ fontSize: 17, color: theme.accent }}>{'✦'}</Text>
              </Pressable>
            </View>

            {/* --- pilules de filtre --- */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {filters.map((filter) => (
                <Chip
                  key={filter.id}
                  label={filter.label}
                  emoji={filter.emoji}
                  selected={category === filter.id}
                  onPress={() => setCategory(filter.id)}
                />
              ))}
              {countries.length > 0 ? (
                <Chip
                  label={country === 'all' ? 'Pays' : country}
                  emoji={'◯'}
                  trailing={'▾'}
                  tone="accent"
                  selected={country !== 'all'}
                  onPress={() => setOpenSheet('pays')}
                />
              ) : null}
              {tags.length > 0 ? (
                <Chip
                  label={tag === 'all' ? 'Tags' : tag}
                  emoji="#"
                  trailing={'▾'}
                  tone="accent"
                  selected={tag !== 'all'}
                  onPress={() => setOpenSheet('tags')}
                />
              ) : null}
            </View>

            {/* --- compteur + filet --- */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.row }}>
              <Text style={{ ...type.eyebrow, color: theme.textSecondary }}>
                {results.length} {results.length === 1 ? 'RECETTE' : 'RECETTES'}
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: theme.borderCard }} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={{ height: 320 }}>
            {isHydrating ? (
              <LoadingState label="Chargement des recettes…" />
            ) : recipesQuery.isError ? (
              <ErrorState
                message={(recipesQuery.error as Error)?.message}
                onRetry={recipesQuery.refetch}
              />
            ) : (
              <EmptyState
                title="Aucune recette"
                message={
                  hasFilter
                    ? "Essayez d'ajuster vos filtres ou votre recherche."
                    : 'Les recettes ajoutées sur le site apparaîtront ici.'
                }
                action={hasFilter ? { label: 'Effacer les filtres', onPress: reset } : undefined}
              />
            )}
          </View>
        }
        renderItem={({ item }: { item: Recipe }) => (
          <RecipeCard
            recipe={item}
            width={cardWidth}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
      />

      <FilterSheet
        isPresented={openSheet === 'pays'}
        onDismiss={() => setOpenSheet(null)}
        title="Filtrer par pays"
        allLabel="Tous les pays"
        options={countries}
        selected={country}
        onSelect={setCountry}
        withFlags
      />
      <FilterSheet
        isPresented={openSheet === 'tags'}
        onDismiss={() => setOpenSheet(null)}
        title="Filtrer par tag"
        allLabel="Tous les tags"
        options={tags}
        selected={tag}
        onSelect={setTag}
        prefix="#"
      />
    </>
  );
}
