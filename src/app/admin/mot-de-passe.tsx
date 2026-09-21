import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field } from '@/components/field';
import { Icon, icons } from '@/components/icon';
import { useAdminSession } from '@/lib/admin-auth';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Changer son mot de passe, session admin ouverte. Il part chiffre (TLS) vers
 * Supabase, qui ne garde qu'un hash bcrypt sale : personne ne le voit, ni ici,
 * ni dans la base.
 */
export default function AdminMotDePasseScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAdmin, changePassword } = useAdminSession();
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [fait, setFait] = useState(false);
  const [enCours, setEnCours] = useState(false);

  const force = [p1.length >= 12, /[a-z]/.test(p1) && /[A-Z]/.test(p1), /\d/.test(p1), /[^A-Za-z0-9]/.test(p1)].filter(Boolean).length;
  const libelle = ['', 'Faible', 'Moyen', 'Bon', 'Solide'][force];

  const enregistrer = async () => {
    setErreur(null);
    if (p1.length < 12) { setErreur('12 caractères minimum.'); return; }
    if (p1 !== p2) { setErreur('Les deux mots de passe ne correspondent pas.'); return; }
    setEnCours(true);
    try { await changePassword(p1); setFait(true); } catch (e) { setErreur((e as Error).message); } finally { setEnCours(false); }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bgMain }}
      contentContainerStyle={{ paddingTop: insets.top + spacing.row, paddingHorizontal: spacing.gutter, paddingBottom: spacing.section, gap: spacing.group }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets>
      <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8} style={({ pressed }) => ({ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.row, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: pressed ? theme.bgHover : theme.bgSubtle })}>
        <Icon name={icons.chevronLeft} size={12} color={theme.textMain} />
        <Text style={{ ...type.bodySemi, fontSize: 14, color: theme.textMain }}>Retour</Text>
      </Pressable>
      <View style={{ gap: spacing.sm }}>
        <Text style={{ ...type.eyebrow, color: theme.accent }}>AKEL LOULOU · ADMIN</Text>
        <Text style={{ ...type.display, color: theme.textMain }}>Mot de passe</Text>
        <Text style={{ ...type.body, color: theme.textMuted }}>12 caractères minimum. Personne d'autre que toi ne le verra : il est stocké haché, jamais en clair.</Text>
      </View>

      {!isAdmin ? <Text style={{ ...type.body, color: '#E5484D' }}>Connecte-toi d'abord.</Text> : null}

      {fait ? (
        <View style={{ padding: spacing.row + 2, borderRadius: radius.md, backgroundColor: theme.bgSubtle, gap: 4 }}>
          <Text style={{ ...type.bodySemi, color: theme.textMain }}>C'est fait.</Text>
          <Text style={{ ...type.body, fontSize: 14, color: theme.textSecondary }}>Ce mot de passe vaut sur l'app et sur le site.</Text>
        </View>
      ) : (
        <>
          <Field label="Nouveau mot de passe" value={p1} onChangeText={setP1} placeholder="••••••••••••" secureTextEntry />
          {p1 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: theme.bgSubtle, overflow: 'hidden' }}>
                <View style={{ width: `${force * 25}%`, height: '100%', backgroundColor: theme.accent }} />
              </View>
              <Text style={{ ...type.caption, width: 48, color: theme.textSecondary }}>{libelle}</Text>
            </View>
          ) : null}
          <Field label="Confirmer" value={p2} onChangeText={setP2} placeholder="••••••••••••" secureTextEntry />
          {erreur ? <Text style={{ ...type.caption, color: '#E5484D' }}>{erreur}</Text> : null}
          <Pressable
            accessibilityRole="button"
            disabled={!isAdmin || enCours}
            onPress={enregistrer}
            style={({ pressed }) => ({ alignItems: 'center', paddingVertical: spacing.row + 2, borderRadius: radius.pill, backgroundColor: theme.accent, opacity: !isAdmin || enCours ? 0.4 : pressed ? 0.85 : 1 })}>
            <Text style={{ ...type.button, color: theme.btnText }}>{enCours ? 'Enregistrement…' : 'Enregistrer le mot de passe'}</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
