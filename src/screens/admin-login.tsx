import { Stack } from 'expo-router/stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';

import { Field } from '@/components/field';
import { Icon, icons } from '@/components/icon';
import { useAdminSession } from '@/lib/auth';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

export function AdminLoginScreen() {
  const theme = useAppTheme();
  const { signIn } = useAdminSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Email et mot de passe requis.');
      return;
    }
    setError('');
    setIsPending(true);
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(
          signInError.message === 'Invalid login credentials'
            ? 'Email ou mot de passe incorrect.'
            : signInError.message
        );
      }
      // En cas de succes, useAdminSession bascule l'ecran tout seul.
    } catch {
      setError('Connexion impossible. Vérifie ton réseau.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.bgMain }}>
      {/* Sans titre explicite, la barre afficherait le nom du fichier de route. */}
      <Stack.Screen options={{ title: 'Admin' }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.gutter, gap: spacing.row }}>
        <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.group }}>
          <Icon name={icons.lock} size={26} color={theme.accent} />
          <Text style={{ ...type.display, color: theme.textMain }}>Espace admin</Text>
          <Text style={{ ...type.caption, color: theme.textSecondary }}>
            Connexion sécurisée
          </Text>
        </View>

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="admin@exemple.com"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="username"
        />
        <Field
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          textContentType="password"
        />

        {error ? (
          <Text style={{ ...type.caption, color: '#E5484D' }}>{error}</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isPending }}
          disabled={isPending}
          onPress={submit}
          style={({ pressed }) => ({
            alignItems: 'center',
            paddingVertical: spacing.row + 2,
            borderRadius: radius.pill,
            backgroundColor: theme.accent,
            opacity: isPending ? 0.5 : pressed ? 0.85 : 1,
          })}>
          <Text style={{ ...type.button, color: theme.btnText }}>
            {isPending ? 'Vérification…' : 'Se connecter'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
