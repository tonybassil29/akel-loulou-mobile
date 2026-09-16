import { Stack } from 'expo-router/stack';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';

import { Field } from '@/components/field';
import { Icon, icons } from '@/components/icon';
import { useSendSuggestion } from '@/lib/queries';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

export default function SuggestScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const mutation = useSendSuggestion();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sent, setSent] = useState(false);

  const canSubmit = title.trim().length > 1 && !mutation.isPending;

  const submit = () => {
    if (!canSubmit) return;
    // On ne ferme la feuille qu'apres un succes : sinon un echec reseau ferait
    // disparaitre le brouillon sans rien avoir envoye.
    mutation.mutate(
      { title: title.trim(), description: description.trim() },
      { onSuccess: () => setSent(true) }
    );
  };

  if (sent) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.row,
          padding: spacing.section,
          backgroundColor: theme.bgMain,
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
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.bgMain }}>
      <Stack.Screen options={{ title: 'Proposer une recette' }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.gutter, gap: spacing.row }}>
        <Text style={{ ...type.body, color: theme.textSecondary }}>
          Une envie, un plat de famille, une recette à tester ? Raconte.
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
