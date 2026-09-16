import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { fonts, radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Etats non nominaux, dans le style editorial du site : un grand mot en
 * Cormorant italique, puis une phrase d'aide.
 */

export function LoadingState({ label }: { label?: string }) {
  const theme = useAppTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.row }}>
      <ActivityIndicator color={theme.accent} />
      {label ? (
        <Text style={{ ...type.caption, color: theme.textSecondary }}>{label}</Text>
      ) : null}
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title="Connexion impossible"
      message={message ?? 'Vérifiez votre connexion, puis réessayez.'}
      action={onRetry ? { label: 'Réessayer', onPress: onRetry } : undefined}
    />
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: { label: string; onPress: () => void };
}) {
  const theme = useAppTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.section,
        gap: spacing.row,
      }}>
      <Text
        style={{
          fontFamily: fonts.serifItalic,
          fontSize: 34,
          lineHeight: 40,
          color: theme.textSecondary,
          textAlign: 'center',
        }}>
        {title}
      </Text>
      <Text style={{ ...type.body, color: theme.textPlaceholder, textAlign: 'center' }}>
        {message}
      </Text>
      {action ? (
        <Pressable
          accessibilityRole="button"
          onPress={action.onPress}
          style={({ pressed }) => ({
            marginTop: spacing.sm,
            paddingHorizontal: spacing.group,
            paddingVertical: spacing.row,
            borderRadius: radius.pill,
            backgroundColor: theme.accent,
            opacity: pressed ? 0.8 : 1,
          })}>
          <Text style={{ ...type.button, color: theme.btnText }}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
