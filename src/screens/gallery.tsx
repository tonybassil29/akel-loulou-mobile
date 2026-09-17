import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState } from '@/components/screen-state';
import { thumbUrl } from '@/lib/images';
import { useIsRestoring } from '@tanstack/react-query';

import { useGallery, useRecipes } from '@/lib/queries';
import type { GalleryItem } from '@/lib/types';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

export function GalleryScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const query = useGallery();
  // Titre de la recette liee, pour l'afficher sur la tuile.
  const recipesQuery = useRecipes();
  const titreParId = useMemo(
    () => new Map((recipesQuery.data ?? []).map((r) => [r.id, r.title])),
    [recipesQuery.data]
  );

  // Chaque photo garde ses proportions : la galerie du site est une mosaique,
  // pas une grille de carres.
  const [ratios, setRatios] = useState<Record<string, number>>({});

  const gap = spacing.row;
  const columnWidth = (width - spacing.gutter * 2 - gap) / 2;
  const items = query.data ?? [];
  // Le cache persiste se rehydrate de facon asynchrone : sans ca, la galerie
  // clignote sur « vide » a chaque lancement.
  const isRestoring = useIsRestoring();

  // Repartition en deux colonnes, en alternance simple.
  const columns: GalleryItem[][] = [[], []];
  items.forEach((item, index) => columns[index % 2].push(item));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={{ backgroundColor: theme.bgMain }}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.group,
          paddingHorizontal: spacing.gutter,
          paddingBottom: spacing.section * 2,
        }}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={query.refetch}
            tintColor={theme.accent}
            progressViewOffset={insets.top}
          />
        }>
        {/* --- surtitre + grand titre, comme l'en-tete editorial du site --- */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.row }}>
          <View style={{ width: 28, height: 1, backgroundColor: theme.accent }} />
          <Text style={{ ...type.eyebrow, color: theme.accent }}>AKEL LOULOU {'·'} CARNET</Text>
        </View>
        <Text
          style={{
            ...type.display,
            color: theme.textMain,
            marginTop: spacing.gutter,
            marginBottom: spacing.group,
          }}>
          Galerie
        </Text>

        {isRestoring || query.isLoading ? (
          <View style={{ height: 320 }}>
            <LoadingState />
          </View>
        ) : query.isError && items.length === 0 ? (
          <View style={{ height: 320 }}>
            <ErrorState message={(query.error as Error)?.message} onRetry={query.refetch} />
          </View>
        ) : items.length === 0 ? (
          <View style={{ height: 320 }}>
            <EmptyState
              title="Galerie vide"
              message="Les photos ajoutées depuis le site apparaîtront ici."
            />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap }}>
            {columns.map((column, columnIndex) => (
              <View key={columnIndex} style={{ flex: 1, gap }}>
                {column.map((item) => (
                  <GalleryTile
                    key={item.id}
                    item={item}
                    width={columnWidth}
                    ratio={ratios[item.id] ?? 1}
                    recipeTitle={item.recipe_id ? titreParId.get(item.recipe_id) : undefined}
                    onRatio={(value) =>
                      setRatios((current) =>
                        current[item.id] === value ? current : { ...current, [item.id]: value }
                      )
                    }
                  />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

function GalleryTile({
  item,
  width,
  ratio,
  recipeTitle,
  onRatio,
}: {
  item: GalleryItem;
  width: number;
  ratio: number;
  recipeTitle?: string;
  onRatio: (value: number) => void;
}) {
  const theme = useAppTheme();
  const router = useRouter();

  const tile = (
    <Image
      source={thumbUrl(item.url, Math.round(width * 2))}
      contentFit="cover"
      transition={200}
      onLoad={(event) => {
        const { width: w, height: h } = event.source;
        if (w && h) onRatio(w / h);
      }}
      style={{
        width: '100%',
        aspectRatio: ratio,
        borderRadius: radius.md,
        backgroundColor: theme.bgSubtle,
      }}
      accessibilityIgnoresInvertColors
    />
  );

  if (!item.recipe_id) return tile;

  // Une photo liee a une recette doit se voir comme telle : sans etiquette,
  // rien ne distingue les 8 tuiles cliquables des 46 autres, et on conclut
  // que la galerie ne reagit pas.
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${recipeTitle ?? item.name ?? 'Voir la recette'} — ouvrir la recette`}
      onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: item.recipe_id! } })}
      style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}>
      {tile}
      <LinearGradient
        colors={['transparent', 'rgba(26,10,30,0.72)']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '52%',
          borderBottomLeftRadius: radius.md,
          borderBottomRightRadius: radius.md,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: spacing.sm,
          right: spacing.sm,
          bottom: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}>
        <Text
          style={{ ...type.cardTitle, fontSize: 15, flex: 1, color: '#FFFFFF' }}
          numberOfLines={2}>
          {recipeTitle ?? item.name ?? 'Voir la recette'}
        </Text>
        <Text style={{ fontSize: 13, color: '#FFFFFF', opacity: 0.9 }}>{'›'}</Text>
      </View>
    </Pressable>
  );
}
