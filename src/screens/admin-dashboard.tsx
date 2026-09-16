import { Link } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { Icon, icons } from '@/components/icon';
import { SectionHeader } from '@/components/section-header';
import { useAdminSession } from '@/lib/auth';
import { normalizeCountryName } from '@/lib/format';
import { useRecipes, useSuggestions } from '@/lib/queries';
import { fonts, radius, spacing, type, shadow } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

export function AdminDashboardScreen() {
  const theme = useAppTheme();
  const { signOut } = useAdminSession();
  const recipesQuery = useRecipes(true);
  const suggestionsQuery = useSuggestions();

  const stats = useMemo(() => {
    const all = recipesQuery.data ?? [];
    const real = all.filter((r) => r.category !== 'menu_only');
    return {
      total: real.length,
      plats: real.filter((r) => r.category === 'plat').length,
      desserts: real.filter((r) => r.category === 'dessert').length,
      hidden: all.filter((r) => r.hidden).length,
      countries: new Set(
        real.map((r) => normalizeCountryName(r.country)).filter(Boolean)
      ).size,
    };
  }, [recipesQuery.data]);

  const suggestions = suggestionsQuery.data ?? [];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Admin',
          headerLargeTitleEnabled: true,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Se deconnecter"
              hitSlop={8}
              onPress={signOut}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Text style={{ ...type.caption, color: theme.accent }}>Quitter</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: theme.bgMain }}
        contentContainerStyle={{
          paddingHorizontal: spacing.gutter,
          paddingBottom: spacing.section * 2,
          gap: spacing.group,
        }}
        refreshControl={
          <RefreshControl
            refreshing={recipesQuery.isRefetching}
            onRefresh={() => {
              recipesQuery.refetch();
              suggestionsQuery.refetch();
            }}
            tintColor={theme.accent}
          />
        }>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.row }}>
          <StatTile label="Recettes" value={stats.total} />
          <StatTile label="Plats" value={stats.plats} />
          <StatTile label="Desserts" value={stats.desserts} />
          <StatTile label="Masquées" value={stats.hidden} />
          <StatTile label="Pays" value={stats.countries} />
        </View>

        <View style={{ gap: spacing.sm }}>
          <ActionRow
            href="/admin/recipes"
            icon={icons.bookmark}
            label="Gérer les recettes"
            hint="Modifier, masquer, supprimer"
          />
          <ActionRow
            href="/admin/recipe-form"
            icon={icons.plus}
            label="Ajouter une recette"
            hint="Nouvelle fiche"
          />
        </View>

        <View style={{ gap: spacing.row }}>
          <SectionHeader title={`Suggestions (${suggestions.length})`} />
          {suggestions.length === 0 ? (
            <Text style={{ ...type.body, color: theme.textSecondary }}>
              Aucune suggestion pour le moment.
            </Text>
          ) : (
            suggestions.map((suggestion: any) => (
              <View
                key={suggestion.id}
                style={{
                  gap: spacing.xs,
                  paddingHorizontal: spacing.row,
                  paddingVertical: spacing.row,
                  borderRadius: radius.md,
                  borderCurve: 'continuous',
                  backgroundColor: theme.bgCard,
                  ...shadow(theme.shadowCard),
                }}>
                <Text style={{ ...type.bodySemi, color: theme.textMain }}>
                  {suggestion.title}
                </Text>
                {suggestion.description ? (
                  <Text style={{ ...type.caption, color: theme.textSecondary }}>
                    {suggestion.description}
                  </Text>
                ) : null}
                {suggestion.author ? (
                  <Text style={{ ...type.caption, color: theme.textPlaceholder }}>
                    — {suggestion.author}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  const theme = useAppTheme();
  return (
    <View
      style={{
        flexGrow: 1,
        minWidth: 96,
        gap: spacing.xs,
        paddingHorizontal: spacing.row,
        paddingVertical: spacing.row,
        borderRadius: radius.md,
        borderCurve: 'continuous',
        backgroundColor: theme.bgCard,
        ...shadow(theme.shadowCard),
      }}>
      <Text style={{ fontFamily: fonts.serif, fontSize: 30, lineHeight: 34, color: theme.accent }}>
        {value}
      </Text>
      <Text style={{ ...type.eyebrow, color: theme.textPlaceholder }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

function ActionRow({
  href,
  icon,
  label,
  hint,
}: {
  href: '/admin/recipes' | '/admin/recipe-form';
  icon: (typeof icons)[keyof typeof icons];
  label: string;
  hint: string;
}) {
  const theme = useAppTheme();
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.row,
          paddingHorizontal: spacing.row,
          paddingVertical: spacing.row + 2,
          borderRadius: radius.md,
          borderCurve: 'continuous',
          backgroundColor: pressed ? theme.bgSubtle : theme.bgCard,
          ...shadow(theme.shadowCard),
        })}>
        <Icon name={icon} size={17} color={theme.accent} />
        <View style={{ flex: 1 }}>
          <Text style={{ ...type.bodySemi, color: theme.textMain }}>{label}</Text>
          <Text style={{ ...type.caption, color: theme.textPlaceholder }}>{hint}</Text>
        </View>
        <Icon name={icons.chevronRight} size={13} color={theme.textPlaceholder} />
      </Pressable>
    </Link>
  );
}
