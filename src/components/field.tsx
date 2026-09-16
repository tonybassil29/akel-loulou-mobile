import { Text, TextInput, View } from 'react-native';

import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/** Champ de formulaire : libelle en capitale au-dessus, surface pleine en dessous. */
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  textContentType,
  minHeight,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences';
  keyboardType?: 'default' | 'email-address';
  textContentType?: 'username' | 'password';
  minHeight?: number;
}) {
  const theme = useAppTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={{ ...type.eyebrow, color: theme.textPlaceholder }}>
        {label.toUpperCase()}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textPlaceholder}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        textContentType={textContentType}
        style={{
          ...type.body,
          color: theme.textMain,
          backgroundColor: theme.bgCard,
          borderRadius: radius.md,
          borderCurve: 'continuous',
          paddingHorizontal: spacing.row,
          paddingVertical: spacing.row,
          minHeight: minHeight ?? (multiline ? 110 : undefined),
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
    </View>
  );
}
