import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, icons } from '@/components/icon';
import { useAdminSession } from '@/lib/admin-auth';
import { useDeleteSuggestion, useSuggestions } from '@/lib/admin-data';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/** Les suggestions recues depuis l'app et le site, a lire et a supprimer. */
export default function AdminSuggestionsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAdmin } = useAdminSession();
  const query = useSuggestions(isAdmin);
  const supprimer = useDeleteSuggestion();

  const confirmer = (id: number, nom: string) =>
    Alert.alert('Supprimer ?', `« ${nom} » disparaîtra définitivement.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => supprimer.mutate(id) },
    ]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bgMain }}
      contentContainerStyle={{ paddingTop: insets.top + spacing.row, paddingHorizontal: spacing.gutter, paddingBottom: spacing.section, gap: spacing.group }}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8} style={({ pressed }) => ({ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.row, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: pressed ? theme.bgHover : theme.bgSubtle })}>
        <Icon name={icons.chevronLeft} size={12} color={theme.textMain} />
        <Text style={{ ...type.bodySemi, fontSize: 14, color: theme.textMain }}>Retour</Text>
      </Pressable>
      <View style={{ gap: spacing.sm }}>
        <Text style={{ ...type.eyebrow, color: theme.accent }}>AKEL LOULOU · ADMIN</Text>
        <Text style={{ ...type.display, color: theme.textMain }}>Suggestions</Text>
      </View>

      {!isAdmin ? <Text style={{ ...type.body, color: theme.textSecondary }}>Connecte-toi d'abord.</Text> : null}
      {query.isPending && isAdmin ? <ActivityIndicator color={theme.accent} /> : null}
      {query.data?.length === 0 ? <Text style={{ ...type.body, color: theme.textSecondary }}>Aucune suggestion pour le moment.</Text> : null}

      <View style={{ gap: spacing.row }}>
        {(query.data ?? []).map((s) => (
          <View key={s.id} style={{ padding: spacing.row + 2, gap: 6, borderRadius: radius.lg, backgroundColor: theme.bgCard, borderWidth: 1, borderColor: theme.borderCard }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ ...type.eyebrow, fontSize: 10, flex: 1, color: theme.accent }}>
                {(s.user_name || 'ANONYME').toUpperCase()} · {new Date(s.created_at).toLocaleDateString('fr-FR')}
              </Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Supprimer" hitSlop={8} onPress={() => confirmer(s.id, s.recipe_name)}>
                <Icon name={icons.trash} size={15} color={theme.textSecondary} />
              </Pressable>
            </View>
            <Text style={{ ...type.cardTitle, color: theme.textMain }}>{s.recipe_name}</Text>
            {s.description ? <Text style={{ ...type.body, fontSize: 14, color: theme.textSecondary }}>{s.description}</Text> : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
