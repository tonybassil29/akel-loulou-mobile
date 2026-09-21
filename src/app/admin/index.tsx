import { type Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { Field } from '@/components/field';
import { Icon, icons } from '@/components/icon';
import { useAdminSession } from '@/lib/admin-auth';
import { useSetHidden, useSuggestions } from '@/lib/admin-data';
import { normalizeString } from '@/lib/format';
import { thumbUrl } from '@/lib/images';
import { useRecipes } from '@/lib/queries';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Mode admin : connexion, puis le carnet complet — recettes cachees et
 * secondaires comprises — avec ajout, modification, masquage, suppression,
 * les suggestions recues et les textes de l'app. Meme compte que le site.
 */
export default function AdminScreen() {
  const { session, isAdmin, signIn, signOut, resetPassword } = useAdminSession();
  if (session === undefined) return <Attente />;
  if (!isAdmin) return <Connexion onSignIn={signIn} onForgot={resetPassword} signedInAs={session?.user?.email ?? null} onSignOut={signOut} />;
  return <Tableau onSignOut={signOut} />;
}

function Attente() {
  const theme = useAppTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bgMain }}>
      <ActivityIndicator color={theme.accent} />
    </View>
  );
}

function EnTete({ titre, onSignOut }: { titre: string; onSignOut?: () => void }) {
  const theme = useAppTheme();
  const router = useRouter();
  return (
    <View style={{ gap: spacing.row }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.row }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: spacing.row,
            paddingVertical: 8,
            borderRadius: radius.pill,
            backgroundColor: pressed ? theme.bgHover : theme.bgSubtle,
          })}>
          <Icon name={icons.chevronLeft} size={12} color={theme.textMain} />
          <Text style={{ ...type.bodySemi, fontSize: 14, color: theme.textMain }}>Retour</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        {onSignOut ? (
          <Pressable accessibilityRole="button" onPress={onSignOut} hitSlop={8}>
            <Text style={{ ...type.caption, color: theme.textSecondary }}>Se déconnecter</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.row }}>
        <View style={{ width: 28, height: 1, backgroundColor: theme.accent }} />
        <Text style={{ ...type.eyebrow, color: theme.accent }}>AKEL LOULOU · ADMIN</Text>
      </View>
      <Text style={{ ...type.display, color: theme.textMain }}>{titre}</Text>
    </View>
  );
}

function Connexion({
  onSignIn,
  onForgot,
  signedInAs,
  onSignOut,
}: {
  onSignIn: (p: string) => Promise<void>;
  onForgot: () => Promise<void>;
  signedInAs: string | null;
  onSignOut: () => Promise<void>;
}) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const valider = async () => {
    setErreur(null); setInfo(null); setEnCours(true);
    try { await onSignIn(password); } catch (e) { setErreur((e as Error).message); } finally { setEnCours(false); }
  };

  const oublie = async () => {
    setErreur(null); setInfo(null); setEnCours(true);
    try {
      await onForgot();
      setInfo("Un lien vient d'être envoyé à ton adresse. Ouvre-le : tu choisiras un nouveau mot de passe sur le site, puis reviens te connecter ici.");
    } catch (e) { setErreur((e as Error).message); } finally { setEnCours(false); }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bgMain }}
      contentContainerStyle={{ paddingTop: insets.top + spacing.row, paddingHorizontal: spacing.gutter, paddingBottom: spacing.section, gap: spacing.group }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets>
      <EnTete titre="Mode admin" />
      {signedInAs ? (
        <View style={{ padding: spacing.row, borderRadius: radius.md, backgroundColor: theme.bgSubtle, gap: 4 }}>
          <Text style={{ ...type.body, color: theme.textMain }}>Connecté comme {signedInAs}, mais ce compte n'est pas admin.</Text>
          <Pressable onPress={onSignOut}><Text style={{ ...type.bodySemi, color: theme.accent }}>Changer de compte</Text></Pressable>
        </View>
      ) : null}
      <Text style={{ ...type.body, color: theme.textMuted }}>Le même mot de passe que sur le site.</Text>
      <Field label="Mot de passe" value={password} onChangeText={setPassword} placeholder="••••••••••••" secureTextEntry textContentType="password" />
      {erreur ? <Text style={{ ...type.caption, color: '#E5484D' }}>{erreur}</Text> : null}
      {info ? (
        <View style={{ padding: spacing.row, borderRadius: radius.md, backgroundColor: theme.bgSubtle }}>
          <Text style={{ ...type.body, fontSize: 14, color: theme.textMain }}>{info}</Text>
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        disabled={enCours || !password}
        onPress={valider}
        style={({ pressed }) => ({ alignItems: 'center', paddingVertical: spacing.row + 2, borderRadius: radius.pill, backgroundColor: theme.accent, opacity: enCours || !password ? 0.4 : pressed ? 0.85 : 1 })}>
        <Text style={{ ...type.button, color: theme.btnText }}>{enCours ? 'Connexion…' : 'Se connecter'}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" disabled={enCours} onPress={oublie} style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
        <Text style={{ ...type.caption, color: theme.textSecondary }}>Mot de passe oublié ?</Text>
      </Pressable>
    </ScrollView>
  );
}

function Tableau({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const recipesQuery = useRecipes(true);
  const suggestions = useSuggestions(true);
  const setHidden = useSetHidden();
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState<'toutes' | 'visibles' | 'cachees' | 'secondaires'>('toutes');

  const recettes = useMemo(() => {
    const q = normalizeString(recherche);
    return [...(recipesQuery.data ?? [])]
      .filter((r) =>
        filtre === 'visibles' ? !r.hidden && !r.is_secondary
        : filtre === 'cachees' ? !!r.hidden
        : filtre === 'secondaires' ? !!r.is_secondary
        : true
      )
      .filter((r) => !q || normalizeString(r.title).includes(q))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [recipesQuery.data, recherche, filtre]);

  const total = recipesQuery.data?.length ?? 0;
  const cachees = recipesQuery.data?.filter((r) => r.hidden).length ?? 0;
  const secondaires = recipesQuery.data?.filter((r) => r.is_secondary).length ?? 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bgMain }}
      contentContainerStyle={{ paddingTop: insets.top + spacing.row, paddingHorizontal: spacing.gutter, paddingBottom: spacing.section * 2, gap: spacing.group }}
      keyboardShouldPersistTaps="handled">
      <EnTete titre="Le carnet" onSignOut={onSignOut} />

      {/* --- raccourcis --- */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <Raccourci label="Nouvelle recette" icon={icons.plus} accent onPress={() => router.push({ pathname: '/admin/recette/[id]', params: { id: 'new' } })} />
        <Raccourci label={`Suggestions${suggestions.data?.length ? ` · ${suggestions.data.length}` : ''}`} icon={icons.sparkles} onPress={() => router.push('/admin/suggestions')} />
        <Raccourci label="Textes de l'app" icon={icons.pencil} onPress={() => router.push('/admin/textes')} />
        <Raccourci label="Mot de passe" icon={icons.lock} onPress={() => router.push('/admin/mot-de-passe' as Href)} />
      </View>

      {/* --- chiffres --- */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {[
          { n: total, l: 'recettes' },
          { n: cachees, l: 'cachées' },
          { n: secondaires, l: 'secondaires' },
        ].map((s) => (
          <View key={s.l} style={{ flex: 1, padding: spacing.row, borderRadius: radius.md, backgroundColor: theme.bgCard, borderWidth: 1, borderColor: theme.borderCard, alignItems: 'center' }}>
            <Text style={{ ...type.cardTitle, fontSize: 22, color: theme.textMain }}>{s.n}</Text>
            <Text style={{ ...type.eyebrow, fontSize: 9.5, color: theme.textSecondary }}>{s.l.toUpperCase()}</Text>
          </View>
        ))}
      </View>

      {/* --- recherche + filtres --- */}
      <TextInput
        value={recherche}
        onChangeText={setRecherche}
        placeholder="Chercher une recette…"
        placeholderTextColor={theme.textPlaceholder}
        autoCorrect={false}
        clearButtonMode="while-editing"
        style={{ paddingHorizontal: 16, height: 44, borderRadius: radius.pill, borderWidth: 1, borderColor: theme.borderInput, backgroundColor: theme.bgInput, fontFamily: type.body.fontFamily, fontSize: 15, color: theme.textMain }}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {(['toutes', 'visibles', 'cachees', 'secondaires'] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFiltre(f)}
            style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, borderColor: filtre === f ? theme.accent : theme.borderCard, backgroundColor: filtre === f ? theme.accent : 'transparent' }}>
            <Text style={{ ...type.eyebrow, fontSize: 10, color: filtre === f ? theme.btnText : theme.textSecondary }}>
              {f === 'cachees' ? 'CACHÉES' : f.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* --- liste --- */}
      {recipesQuery.isPending ? <ActivityIndicator color={theme.accent} /> : null}
      {recipesQuery.isError ? <Text style={{ ...type.body, color: '#E5484D' }}>{(recipesQuery.error as Error).message}</Text> : null}
      <View style={{ gap: spacing.sm }}>
        {recettes.map((r) => (
          <Pressable
            key={r.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/admin/recette/[id]', params: { id: r.id } })}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.row,
              padding: spacing.sm,
              borderRadius: radius.md,
              backgroundColor: pressed ? theme.bgHover : theme.bgCard,
              borderWidth: 1,
              borderColor: theme.borderCard,
              opacity: r.hidden ? 0.6 : 1,
            })}>
            <Image source={thumbUrl(r.image_url, 120)} contentFit="cover" style={{ width: 52, height: 52, borderRadius: radius.sm, backgroundColor: theme.bgSubtle }} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ ...type.bodySemi, color: theme.textMain }} numberOfLines={1}>{r.title}</Text>
              <Text style={{ ...type.caption, fontSize: 11.5, color: theme.textSecondary }}>
                {[r.category, r.country, r.hidden ? 'cachée' : null, r.is_secondary ? 'secondaire' : null].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={r.hidden ? 'Rendre visible' : 'Masquer'}
              hitSlop={8}
              onPress={() => setHidden.mutate({ id: r.id, hidden: !r.hidden })}
              style={{ padding: 8 }}>
              <Icon name={r.hidden ? icons.eyeSlash : icons.eye} size={16} color={theme.textSecondary} />
            </Pressable>
            <Icon name={icons.chevronRight} size={12} color={theme.textPlaceholder} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function Raccourci({ label, icon, accent, onPress }: { label: string; icon: (typeof icons)[keyof typeof icons]; accent?: boolean; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: spacing.row + 2,
        paddingVertical: 10,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: accent ? theme.accent : theme.borderInput,
        backgroundColor: accent ? theme.accent : pressed ? theme.bgHover : theme.bgCard,
        opacity: pressed ? 0.85 : 1,
      })}>
      <Icon name={icon} size={13} color={accent ? theme.btnText : theme.accent} />
      <Text style={{ ...type.bodySemi, fontSize: 14, color: accent ? theme.btnText : theme.textMain }}>{label}</Text>
    </Pressable>
  );
}
