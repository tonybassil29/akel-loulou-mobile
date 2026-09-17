import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Icon, icons } from './icon';
import { thumbUrl } from '@/lib/images';
import type { Recipe } from '@/lib/types';
import { radius, shadow, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

const BLUR_PLACEHOLDER = 'L6Pj0^i_.AyE_3t7t7R**0o#DgR4';

/**
 * Carte recette du site : photo en 4/3, voile sombre en bas pour la lisibilite,
 * coeur en pastille ronde, puis le titre en Cormorant Garamond gras sur fond
 * blanc. Pas de badge de categorie ici — le site le masque sur mobile.
 */
export function RecipeCard({
  recipe,
  isFavorite,
  onToggleFavorite,
  width,
}: {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  width: number;
}) {
  const theme = useAppTheme();

  return (
    <View style={{ width, flexGrow: 0, flexShrink: 0 }}>
      <Link href={{ pathname: '/recipe/[id]', params: { id: recipe.id } }} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={recipe.title}
          style={({ pressed }) => ({
            width: '100%',
            borderRadius: radius.lg,
            borderCurve: 'continuous',
            backgroundColor: theme.bgCard,
            overflow: 'hidden',
            opacity: pressed ? 0.92 : 1,
            ...shadow(theme.shadowCard),
          })}>
          <View style={{ width: '100%', aspectRatio: 4 / 3, backgroundColor: theme.bgSubtle }}>
            <Image
              source={thumbUrl(recipe.image_url, Math.round(width * 2))}
              placeholder={BLUR_PLACEHOLDER}
              contentFit="cover"
              transition={220}
              style={{ width: '100%', height: '100%' }}
              accessibilityIgnoresInvertColors
            />

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.45)']}
              style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' }}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              hitSlop={10}
              onPress={(event) => {
                // La carte entiere est un lien : sans ca le coeur navigue aussi.
                event.stopPropagation();
                if (process.env.EXPO_OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                onToggleFavorite();
              }}
              style={{
                position: 'absolute',
                top: spacing.row,
                right: spacing.row,
                width: 36,
                height: 36,
                borderRadius: radius.pill,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isFavorite ? theme.accent : 'rgba(255,255,255,0.85)',
              }}>
              <Icon
                name={isFavorite ? icons.heartFill : icons.heart}
                size={16}
                color={isFavorite ? theme.btnText : theme.textSecondary}
              />
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 14, paddingVertical: 14 }}>
            <Text numberOfLines={2} style={{ ...type.cardTitle, color: theme.textMain }}>
              {recipe.title}
            </Text>
          </View>
        </Pressable>
      </Link>
    </View>
  );
}
