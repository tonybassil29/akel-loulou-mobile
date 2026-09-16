import { MaterialIcons } from '@expo/vector-icons';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { type ColorValue, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Une icone, deux familles : SF Symbols sur iOS, Material Symbols ailleurs.
 * On ne melange jamais les deux sur une meme plateforme, et on n'utilise jamais
 * d'emoji comme glyphe d'interface.
 */
export type IconName = {
  sf: SymbolViewProps['name'];
  md: keyof typeof MaterialIcons.glyphMap;
};

export function Icon({
  name,
  size = 20,
  color,
  style,
}: {
  name: IconName;
  size?: number;
  color: ColorValue;
  style?: StyleProp<ViewStyle>;
}) {
  if (process.env.EXPO_OS === 'ios') {
    return (
      <SymbolView
        name={name.sf}
        size={size}
        tintColor={color}
        resizeMode="scaleAspectFit"
        style={[{ width: size, height: size }, style]}
      />
    );
  }
  return (
    <MaterialIcons
      name={name.md}
      size={size}
      color={color as string}
      // MaterialIcons est un <Text> : ses styles sont des TextStyle, pas des ViewStyle.
      style={style as StyleProp<TextStyle>}
    />
  );
}

/** Les icones utilisees dans l'app, nommees par role plutot que par glyphe. */
export const icons = {
  heart: { sf: 'heart', md: 'favorite-border' },
  heartFill: { sf: 'heart.fill', md: 'favorite' },
  share: { sf: 'square.and.arrow.up', md: 'ios-share' },
  cart: { sf: 'cart', md: 'shopping-cart' },
  search: { sf: 'magnifyingglass', md: 'search' },
  close: { sf: 'xmark', md: 'close' },
  plus: { sf: 'plus', md: 'add' },
  minus: { sf: 'minus', md: 'remove' },
  chevronRight: { sf: 'chevron.right', md: 'chevron-right' },
  globe: { sf: 'globe', md: 'public' },
  tag: { sf: 'number', md: 'tag' },
  filter: { sf: 'line.3.horizontal.decrease', md: 'filter-list' },
  sparkles: { sf: 'sparkles', md: 'auto-awesome' },
  lock: { sf: 'lock', md: 'lock' },
  trash: { sf: 'trash', md: 'delete-outline' },
  pencil: { sf: 'pencil', md: 'edit' },
  eye: { sf: 'eye', md: 'visibility' },
  eyeSlash: { sf: 'eye.slash', md: 'visibility-off' },
  photo: { sf: 'photo', md: 'photo' },
  checkmark: { sf: 'checkmark', md: 'check' },
  wifiSlash: { sf: 'wifi.slash', md: 'wifi-off' },
  bookmark: { sf: 'book.closed', md: 'menu-book' },
} as const satisfies Record<string, IconName>;
