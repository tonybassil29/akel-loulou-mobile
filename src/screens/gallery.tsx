import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState } from '@/components/screen-state';
import { thumbUrl } from '@/lib/images';
import { useGallery } from '@/lib/queries';
import type { GalleryItem } from '@/lib/types';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

export function GalleryScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const query = useGallery();

  // Chaque photo garde ses proportions : la galerie du site est une mosaique,
  // pas une grille de carres.
  const [ratios, setRatios] = useState<Record<string, number>>({});

  const gap = spacing.row;
  const columnWidth = (width - spacing.gutter * 2 - gap) / 2;
  const items = query.data ?? [];

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

        {query.isLoading ? (
          <View style={{ height: 320 }}>
            <LoadingState />
          </View>
        ) : query.isError ? (
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
  onRatio,
}: {
  item: GalleryItem;
  width: number;
  ratio: number;
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

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={item.name ?? 'Voir la recette'}
      onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: item.recipe_id! } })}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      {tile}
    </Pressable>
  );
}
