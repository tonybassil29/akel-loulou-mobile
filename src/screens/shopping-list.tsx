import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router/stack';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, icons } from '@/components/icon';
import { EmptyState, LoadingState } from '@/components/screen-state';
import { SectionHeader } from '@/components/section-header';
import { useShoppingList, type ShoppingItem } from '@/lib/shopping-list';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Liste de courses : la raison d'etre mobile de l'app. Elle fonctionne hors
 * ligne, se coche d'une main en magasin, et regroupe les ingredients par
 * recette d'origine pour savoir a quoi sert chaque ligne.
 */
export function ShoppingListScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { items, toggle, remove, clearChecked, clearAll, remaining } = useShoppingList();

  // Regroupement par recette, en conservant l'ordre d'ajout.
  const groups = useMemo(() => {
    const map = new Map<string, { title: string; items: ShoppingItem[] }>();
    for (const item of items ?? []) {
      const group = map.get(item.recipeId) ?? { title: item.recipeTitle, items: [] };
      group.items.push(item);
      map.set(item.recipeId, group);
    }
    return [...map.values()];
  }, [items]);

  const shareList = async () => {
    if (!items?.length) return;
    await Share.share({
      title: 'Liste de courses',
      message: [
        '\u{1F6D2} LISTE DE COURSES',
        '',
        ...groups.flatMap((g) => [
          `— ${g.title} —`,
          ...g.items.map((i) => `${i.checked ? '✅' : '⬜'} ${i.label}`),
          '',
        ]),
        'Akel Loulou',
      ].join('\n'),
    });
  };

  const confirmClear = () => {
    Alert.alert('Vider la liste ?', 'Tous les articles seront retirés.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Vider', style: 'destructive', onPress: clearAll },
    ]);
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
        }}>
        <View style={{ gap: spacing.row }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.row }}>
            <View style={{ width: 28, height: 1, backgroundColor: theme.accent }} />
            <Text style={{ ...type.eyebrow, color: theme.accent }}>
              AKEL LOULOU {'·'} CARNET
            </Text>
          </View>
          <Text style={{ ...type.display, color: theme.textMain }}>Courses</Text>
          {items && items.length > 0 ? (
            <Text style={{ ...type.body, color: theme.textMuted }}>
              {remaining === 0
                ? 'Tout est dans le panier.'
                : `${remaining} article${remaining > 1 ? 's' : ''} à prendre.`}
            </Text>
          ) : null}
        </View>

        {items === null ? (
          <View style={{ height: 320 }}>
            <LoadingState />
          </View>
        ) : items.length === 0 ? (
          <View style={{ height: 340 }}>
            <EmptyState
              title="Liste vide"
              message={
                'Ouvrez une recette et touchez le panier pour y ajouter tous ses ingrédients.'
              }
            />
          </View>
        ) : (
          <>
            {groups.map((group) => (
              <View key={group.title} style={{ gap: spacing.row }}>
                <SectionHeader title={group.title} />
                <View style={{ gap: spacing.sm }}>
                  {group.items.map((item) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: item.checked }}
                      accessibilityLabel={item.label}
                      onPress={() => {
                        if (process.env.EXPO_OS === 'ios') Haptics.selectionAsync();
                        toggle(item.id);
                      }}
                      onLongPress={() => remove(item.id)}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.row,
                        paddingHorizontal: spacing.row + 2,
                        paddingVertical: spacing.row + 2,
                        borderRadius: radius.md,
                        borderCurve: 'continuous',
                        borderWidth: 1,
                        borderColor: theme.borderCard,
                        backgroundColor: pressed ? theme.bgHover : theme.bgCard,
                        opacity: item.checked ? 0.55 : 1,
                      })}>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: radius.pill,
                          borderWidth: item.checked ? 0 : 1.5,
                          borderColor: theme.borderInput,
                          backgroundColor: item.checked ? theme.accent : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        {item.checked ? (
                          <Icon name={icons.checkmark} size={13} color={theme.btnText} />
                        ) : null}
                      </View>
                      <Text
                        style={{
                          ...type.bodyMedium,
                          flex: 1,
                          color: theme.textMain,
                          textDecorationLine: item.checked ? 'line-through' : 'none',
                        }}>
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}

            <View style={{ gap: spacing.row }}>
              <Pressable
                accessibilityRole="button"
                onPress={shareList}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.sm,
                  paddingVertical: 16,
                  borderRadius: radius.pill,
                  backgroundColor: theme.accent,
                  opacity: pressed ? 0.85 : 1,
                })}>
                <Icon name={icons.share} size={15} color={theme.btnText} />
                <Text style={{ ...type.button, color: theme.btnText }}>Partager la liste</Text>
              </Pressable>

              <View style={{ flexDirection: 'row', gap: spacing.row }}>
                <Pressable
                  accessibilityRole="button"
                  onPress={clearChecked}
                  style={({ pressed }) => ({
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: spacing.row + 2,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: theme.borderCard,
                    opacity: pressed ? 0.6 : 1,
                  })}>
                  <Text style={{ ...type.caption, color: theme.textMuted }}>
                    Retirer les cochés
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={confirmClear}
                  style={({ pressed }) => ({
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: spacing.row + 2,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: theme.borderCard,
                    opacity: pressed ? 0.6 : 1,
                  })}>
                  <Text style={{ ...type.caption, color: '#E5484D' }}>Tout vider</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}
