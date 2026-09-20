import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field } from '@/components/field';
import { Icon, icons } from '@/components/icon';
import { useAdminSession } from '@/lib/admin-auth';
import { useSaveSetting } from '@/lib/admin-data';
import { useAboutSettings, useHeaderSettings } from '@/lib/queries';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

const CHAMPS_ENTETE: { cle: string; label: string }[] = [
  { cle: 'topBadge', label: 'Petit badge du haut' },
  { cle: 'titlePart1', label: 'Titre, première partie' },
  { cle: 'titleHighlight', label: 'Titre, partie en couleur' },
  { cle: 'subtitle', label: 'Sous-titre' },
  { cle: 'filterAllText', label: 'Filtre « Tout »' },
  { cle: 'filterPlatText', label: 'Filtre « Plats »' },
  { cle: 'filterDessertText', label: 'Filtre « Desserts »' },
];

const CHAMPS_APROPOS: { cle: string; label: string; long?: boolean }[] = [
  { cle: 'badgeText', label: 'Badge' },
  { cle: 'titlePart1', label: 'Titre, première partie' },
  { cle: 'titleHighlight', label: 'Titre, partie en couleur' },
  { cle: 'titlePart2', label: 'Titre, suite' },
  { cle: 'description', label: 'Description', long: true },
  { cle: 'quote', label: 'Citation', long: true },
  { cle: 'quoteAuthor', label: 'Auteur de la citation' },
  { cle: 'storyTitle', label: 'Titre de l’histoire' },
  { cle: 'storyText', label: 'Histoire', long: true },
  { cle: 'stat1Num', label: 'Chiffre 1' }, { cle: 'stat1Label', label: 'Légende 1' },
  { cle: 'stat2Num', label: 'Chiffre 2' }, { cle: 'stat2Label', label: 'Légende 2' },
  { cle: 'stat3Num', label: 'Chiffre 3' }, { cle: 'stat3Label', label: 'Légende 3' },
];

/** Les textes de l'accueil et de la page A propos — les memes reglages que le site. */
export default function AdminTextesScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAdmin } = useAdminSession();
  const header = useHeaderSettings();
  const about = useAboutSettings();
  const save = useSaveSetting();

  const [entete, setEntete] = useState<Record<string, string>>({});
  const [apropos, setApropos] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => { if (header.data) setEntete(header.data as Record<string, string>); }, [header.data]);
  useEffect(() => { if (about.data) setApropos(about.data as Record<string, string>); }, [about.data]);

  const enregistrer = async () => {
    setMessage(null);
    try {
      await save.mutateAsync({ key: 'header', value: { ...(header.data ?? {}), ...entete } });
      await save.mutateAsync({ key: 'about', value: { ...(about.data ?? {}), ...apropos } });
      setMessage('Enregistré.');
    } catch (e) {
      setMessage(`Échec : ${(e as Error).message}`);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bgMain }}
      contentContainerStyle={{ paddingTop: insets.top + spacing.row, paddingHorizontal: spacing.gutter, paddingBottom: spacing.section * 2, gap: spacing.group }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets>
      <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8} style={({ pressed }) => ({ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.row, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: pressed ? theme.bgHover : theme.bgSubtle })}>
        <Icon name={icons.chevronLeft} size={12} color={theme.textMain} />
        <Text style={{ ...type.bodySemi, fontSize: 14, color: theme.textMain }}>Retour</Text>
      </Pressable>
      <View style={{ gap: spacing.sm }}>
        <Text style={{ ...type.eyebrow, color: theme.accent }}>AKEL LOULOU · ADMIN</Text>
        <Text style={{ ...type.display, color: theme.textMain }}>Textes de l'app</Text>
      </View>

      {!isAdmin ? <Text style={{ ...type.body, color: theme.textSecondary }}>Connecte-toi d'abord.</Text> : null}

      <Text style={{ ...type.cardTitle, color: theme.textMain }}>Accueil</Text>
      {CHAMPS_ENTETE.map((c) => (
        <Field key={c.cle} label={c.label} value={entete[c.cle] ?? ''} onChangeText={(v) => setEntete((p) => ({ ...p, [c.cle]: v }))} />
      ))}

      <Text style={{ ...type.cardTitle, color: theme.textMain, marginTop: spacing.row }}>À propos</Text>
      {CHAMPS_APROPOS.map((c) => (
        <Field key={c.cle} label={c.label} value={apropos[c.cle] ?? ''} onChangeText={(v) => setApropos((p) => ({ ...p, [c.cle]: v }))} multiline={c.long} />
      ))}

      {message ? <Text style={{ ...type.caption, color: message.startsWith('Échec') ? '#E5484D' : theme.accent }}>{message}</Text> : null}
      <Pressable
        accessibilityRole="button"
        disabled={!isAdmin || save.isPending}
        onPress={enregistrer}
        style={({ pressed }) => ({ alignItems: 'center', paddingVertical: spacing.row + 2, borderRadius: radius.pill, backgroundColor: theme.accent, opacity: !isAdmin || save.isPending ? 0.4 : pressed ? 0.85 : 1 })}>
        <Text style={{ ...type.button, color: theme.btnText }}>{save.isPending ? 'Enregistrement…' : 'Enregistrer'}</Text>
      </Pressable>
    </ScrollView>
  );
}
