import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, Text, View } from 'react-native';

import { Icon, icons, type IconName } from './icon';
import { spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Variante web : NativeTabs s'appuie sur les barres d'onglets natives (UIKit /
 * Material), qui n'existent pas dans un navigateur. On rend donc la meme
 * navigation avec les primitives d'expo-router/ui.
 */
const TABS: { name: string; href: string; label: string; icon: IconName }[] = [
  { name: 'index', href: '/', label: 'Recettes', icon: icons.bookmark },
  { name: 'gallery', href: '/gallery', label: 'Galerie', icon: icons.photo },
  { name: 'about', href: '/about', label: 'À propos', icon: icons.heart },
];

export default function AppTabs() {
  const theme = useAppTheme();

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.sm,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.row,
          backgroundColor: theme.bgCard,
          borderTopWidth: 1,
          borderTopColor: theme.borderCard,
        }}>
        {TABS.map((tab) => (
          <TabTrigger key={tab.name} name={tab.name} href={tab.href as never} asChild>
            <TabButton icon={tab.icon}>{tab.label}</TabButton>
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}

function TabButton({
  children,
  icon,
  isFocused,
  ...props
}: TabTriggerSlotProps & { icon: IconName }) {
  const theme = useAppTheme();
  const tint = isFocused ? theme.accent : theme.textSecondary;

  return (
    <Pressable {...props} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      <View
        style={{
          alignItems: 'center',
          gap: spacing.xs,
          paddingHorizontal: spacing.row,
          paddingVertical: spacing.sm,
        }}>
        <Icon name={icon} size={18} color={tint} />
        <Text style={{ ...type.caption, color: tint }}>{children}</Text>
      </View>
    </Pressable>
  );
}
