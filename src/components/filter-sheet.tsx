import { BottomSheet, Host } from '@expo/ui';
import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { flagUrl } from '@/lib/country';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Le menu deroulant du site (pays / tags), presente en feuille native : on
 * herite de la poignee, du glisser-pour-fermer et du materiau du systeme.
 * La valeur 'all' represente "aucun filtre", comme cote web.
 */
export function FilterSheet({
  isPresented,
  onDismiss,
  title,
  allLabel,
  options,
  selected,
  onSelect,
  withFlags = false,
  prefix,
}: {
  isPresented: boolean;
  onDismiss: () => void;
  title: string;
  allLabel: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  withFlags?: boolean;
  prefix?: string;
}) {
  const theme = useAppTheme();
  const rows = ['all', ...options];

  return (
    <Host style={{ position: 'absolute' }}>
      <BottomSheet isPresented={isPresented} onDismiss={onDismiss} snapPoints={['half', 'full']}>
        <View style={{ flex: 1, backgroundColor: theme.bgMain }}>
          <Text
            style={{
              ...type.eyebrow,
              color: theme.accent,
              paddingHorizontal: spacing.gutter,
              paddingTop: spacing.gutter,
              paddingBottom: spacing.row,
            }}>
            {title.toUpperCase()}
          </Text>

          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: spacing.row,
              paddingBottom: spacing.section,
            }}>
            {rows.map((option) => {
              const isSelected = option === selected;
              const label = option === 'all' ? allLabel : option;
              const flag = withFlags && option !== 'all' ? flagUrl(option, 40) : null;

              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    onSelect(option);
                    onDismiss();
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.row,
                    paddingHorizontal: spacing.row,
                    paddingVertical: 11,
                    borderRadius: radius.sm,
                    backgroundColor:
                      isSelected || pressed ? theme.bgHover : 'transparent',
                  })}>
                  {flag ? (
                    <Image
                      source={flag}
                      contentFit="contain"
                      style={{ width: 22, height: 15, borderRadius: 3 }}
                      accessibilityIgnoresInvertColors
                    />
                  ) : (
                    <Text style={{ fontSize: 13, opacity: 0.6, color: theme.textSecondary }}>
                      {option === 'all' ? (withFlags ? '◯' : '#') : (prefix ?? '')}
                    </Text>
                  )}
                  <Text
                    style={{
                      ...type.caption,
                      fontSize: 13.5,
                      flex: 1,
                      color: isSelected ? theme.accent : theme.textMain,
                    }}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </BottomSheet>
    </Host>
  );
}
