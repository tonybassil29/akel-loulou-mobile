import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { Field } from '@/components/field';
import { Icon, icons } from '@/components/icon';
import { SheetHeader } from '@/components/sheet-header';
import { useSendSuggestion } from '@/lib/queries';
import { FRACTION_SUGGESTION, hauteurFeuille } from '@/lib/sheet';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Proposer une recette, en feuille native empilee.
 *
 * Meme structure que les autres feuilles : un seul enfant, le defilement, avec
 * le titre dedans et une hauteur fixee a la main — une `formSheet` ne transmet
 * pas la sienne a son contenu. Les traces `[suggestion]` remontent dans le
 * journal du serveur de dev : elles disent si la feuille s'ouvre, si l'envoi
 * part, et ce que repond la base.
 */
export default function SuggestScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const mutation = useSendSuggestion();
  const { height } = useWindowDimensions();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    console.log('[suggestion] feuille ouverte');
  }, []);

  const canSubmit = title.trim().length > 1 && !mutation.isPending;

  const submit = () => {
    if (!canSubmit) return;
    console.log('[suggestion] envoi :', title.trim());
    // On ne ferme la feuille qu'apres un succes : sinon un echec reseau ferait
    // disparaitre le brouillon sans rien avoir envoye.
    mutation.mutate(
      { title: title.trim(), description: description.trim() },
      {
        onSuccess: () => {
          console.log('[suggestion] enregistree');
          setSent(true);
        },
        onError: (e) => console.log('[suggestion] ECHEC :', (e as Error).message),
      }
    );
  };

  return (
    <ScrollView
      style={{
        height: hauteurFeuille(height, FRACTION_SUGGESTION),
        backgroundColor: theme.bgMain,
      }}
      contentContainerStyle={{
        paddingHorizontal: spacing.row,
        paddingBottom: spacing.section,
        gap: spacing.row,
      }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets>
      <SheetHeader title="Proposer une recette" onClose={() => router.back()} />

      {sent ? (
        <View
          style={{
            alignItems: 'center',
            gap: spacing.row,
            paddingVertical: spacing.section,
            paddingHorizontal: spacing.gutter,
          }}>
          <Icon name={icons.checkmark} size={30} color={theme.accent} />
          <Text style={{ ...type.bodySemi, color: theme.textMain, textAlign: 'center' }}>
            C&apos;est envoyé
          </Text>
          <Text style={{ ...type.body, color: theme.textSecondary, textAlign: 'center' }}>
            Merci ! La suggestion arrive directement dans le carnet.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => ({
              marginTop: spacing.sm,
              paddingHorizontal: spacing.group,
              paddingVertical: spacing.row,
              borderRadius: radius.pill,
              backgroundColor: theme.accent,
              opacity: pressed ? 0.85 : 1,
            })}>
            <Text style={{ ...type.button, color: theme.btnText }}>Fermer</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ paddingHorizontal: spacing.sm, gap: spacing.row }}>
          <Text style={{ ...type.body, color: theme.textSecondary }}>
            Une envie, un plat de famille, une recette à tester ? Raconte.
          </Text>

          <Field label="Le plat" value={title} onChangeText={setTitle} placeholder="Tarte au citron" />
          <Field
            label="Quelques détails"
            value={description}
            onChangeText={setDescription}
            placeholder="Ce dont tu te souviens…"
            multiline
          />

          {mutation.isError ? (
            <Text style={{ ...type.caption, color: '#E5484D' }}>
              Envoi impossible : {(mutation.error as Error).message}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
            disabled={!canSubmit}
            onPress={submit}
            style={({ pressed }) => ({
              alignItems: 'center',
              paddingVertical: spacing.row + 2,
              borderRadius: radius.pill,
              backgroundColor: theme.accent,
              opacity: !canSubmit ? 0.4 : pressed ? 0.85 : 1,
            })}>
            <Text style={{ ...type.button, color: theme.btnText }}>
              {mutation.isPending ? 'Envoi…' : 'Envoyer'}
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
