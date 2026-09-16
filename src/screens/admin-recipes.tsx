import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';

import { Icon, icons } from '@/components/icon';
import { EmptyState, ErrorState, LoadingState } from '@/components/screen-state';
import { normalizeString } from '@/lib/format';
import { thumbUrl } from '@/lib/images';
import { useDeleteRecipe, useRecipes, useToggleRecipeHidden } from '@/lib/queries';
import { radius, spacing, type, shadow } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

export function AdminRecipesScreen() {
  const theme = useAppTheme();
  const router = useRouter();

  const query = useRecipes(true);
  const toggleHidden = useToggleRecipeHidden();
  const deleteRecipe = useDeleteRecipe();

  const [search, setSearch] = useState('');

  const results = useMemo(() => {
    const needle = normalizeString(search);
    const all = query.data ?? [];
    if (!needle) return all;
    return all.filter((r) => normalizeString(r.title).includes(needle));
  }, [query.data, search]);

  const confirmDelete = (id: string, title: string) => {
    // Suppression definitive et rare : c'est exactement le cas ou une alerte
    // native de confirmation est justifiee.
    Alert.alert(
      'Supprimer cette recette ?',
      `"${title}" sera définitivement retirée du carnet.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () =>
            deleteRecipe.mutate(id, {
              onError: (error) =>
                Alert.alert('Suppression impossible', (error as Error).message),
            }),
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Recettes',
          headerLargeTitleEnabled: true,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ajouter une recette"
              hitSlop={8}
              onPress={() => router.push('/admin/recipe-form')}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Icon name={icons.plus} size={18} color={theme.accent} />
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: theme.bgMain }}
        contentContainerStyle={{
          paddingHorizontal: spacing.gutter,
          paddingBottom: spacing.section,
          gap: spacing.sm,
        }}
        ListHeaderComponent={
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Filtrer par titre"
            placeholderTextColor={theme.textPlaceholder}
            autoCapitalize="none"
            style={{
              ...type.body,
              color: theme.textMain,
              backgroundColor: theme.bgCard,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.gutter,
              paddingVertical: spacing.row,
              marginBottom: spacing.row,
            }}
          />
        }
        ListEmptyComponent={
          query.isLoading ? (
            <View style={{ height: 300 }}>
              <LoadingState />
            </View>
          ) : query.isError ? (
            <View style={{ height: 300 }}>
              <ErrorState message={(query.error as Error)?.message} onRetry={query.refetch} />
            </View>
          ) : (
            <View style={{ height: 300 }}>
              <EmptyState
                title="Aucune recette"
                message={search ? 'Aucun titre ne correspond.' : 'Le carnet est vide.'}
                action={search ? { label: 'Effacer', onPress: () => setSearch('') } : undefined}
              />
            </View>
          )
        }
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.row,
              paddingHorizontal: spacing.row,
              paddingVertical: spacing.row,
              borderRadius: radius.md,
              borderCurve: 'continuous',
              backgroundColor: theme.bgCard,
              opacity: item.hidden ? 0.55 : 1,
              ...shadow(theme.shadowCard),
            }}>
            <Image
              source={thumbUrl(item.image_url, 120)}
              contentFit="cover"
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.sm,
                backgroundColor: theme.bgSubtle,
              }}
              accessibilityIgnoresInvertColors
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Modifier ${item.title}`}
              onPress={() =>
                router.push({ pathname: '/admin/recipe-form', params: { id: item.id } })
              }
              style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.6 : 1 })}>
              <Text numberOfLines={1} style={{ ...type.bodySemi, color: theme.textMain }}>
                {item.title}
              </Text>
              <Text style={{ ...type.caption, color: theme.textPlaceholder }}>
                {item.category === 'dessert' ? 'Dessert' : 'Plat'}
                {item.hidden ? ' · masquée' : ''}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={item.hidden ? 'Rendre visible' : 'Masquer'}
              hitSlop={6}
              onPress={() => toggleHidden.mutate({ id: item.id, hidden: !item.hidden })}
              style={({ pressed }) => ({ padding: spacing.xs, opacity: pressed ? 0.6 : 1 })}>
              <Icon
                name={item.hidden ? icons.eyeSlash : icons.eye}
                size={16}
                color={theme.textSecondary}
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Supprimer ${item.title}`}
              hitSlop={6}
              onPress={() => confirmDelete(item.id, item.title)}
              style={({ pressed }) => ({ padding: spacing.xs, opacity: pressed ? 0.6 : 1 })}>
              <Icon name={icons.trash} size={16} color={'#E5484D'} />
            </Pressable>
          </View>
        )}
      />
    </>
  );
}
