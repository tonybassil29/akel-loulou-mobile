import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, icons } from '@/components/icon';
import { ErrorState, LoadingState } from '@/components/screen-state';
import { SectionHeader } from '@/components/section-header';
import { heroUrl } from '@/lib/images';
import { usePushNotifications } from '@/lib/push';
import { useAboutSettings, useRecipes } from '@/lib/queries';
import { fonts, radius, shadow, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

export function AboutScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const aboutQuery = useAboutSettings();
  const recipesQuery = useRecipes();
  const push = usePushNotifications();

  const about = (aboutQuery.data ?? {}) as Record<string, string | undefined>;
  const recipeCount = (recipesQuery.data ?? []).filter((r) => r.category !== 'menu_only').length;

  const stats = [
    { value: about.stat1Num ?? String(recipeCount), label: about.stat1Label ?? 'Recettes' },
    { value: about.stat2Num ?? '5+', label: about.stat2Label ?? 'Pays' },
    { value: about.stat3Num ?? '∞', label: about.stat3Label ?? 'Amour' },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={{ backgroundColor: theme.bgMain }}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.group,
          paddingHorizontal: spacing.gutter,
          paddingBottom: spacing.section * 2,
          gap: spacing.section,
        }}>
        {aboutQuery.isLoading ? (
          <View style={{ height: 360 }}>
            <LoadingState />
          </View>
        ) : aboutQuery.isError ? (
          <View style={{ height: 360 }}>
            <ErrorState
              message={(aboutQuery.error as Error)?.message}
              onRetry={aboutQuery.refetch}
            />
          </View>
        ) : (
          <>
            {/* --- carte portrait : degrade rose -> violet, photo encadree de blanc --- */}
            <View
              style={{
                borderRadius: radius.xl,
                borderCurve: 'continuous',
                overflow: 'hidden',
                backgroundColor: theme.bgCard,
                ...shadow(theme.shadowCard),
              }}>
              <LinearGradient
                colors={[theme.aboutGrad1, theme.aboutGrad2, theme.aboutGrad3]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: spacing.group, alignItems: 'center' }}>
                <View
                  style={{
                    width: '82%',
                    aspectRatio: 1,
                    borderRadius: radius.lg,
                    borderCurve: 'continuous',
                    backgroundColor: theme.bgCard,
                    padding: 10,
                    ...shadow(theme.shadowWarm),
                  }}>
                  {about.imageUrl ? (
                    <Image
                      source={heroUrl(about.imageUrl, Math.round(width * 2))}
                      contentFit="cover"
                      transition={240}
                      style={{ width: '100%', height: '100%', borderRadius: radius.md }}
                      accessibilityIgnoresInvertColors
                    />
                  ) : null}
                </View>
              </LinearGradient>

              <View style={{ padding: spacing.group, gap: spacing.row }}>
                {about.badgeText ? (
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: radius.pill,
                      backgroundColor: theme.bgSubtle,
                    }}>
                    <Text style={{ ...type.eyebrow, color: theme.accent }}>
                      {about.badgeText.toUpperCase()}
                    </Text>
                  </View>
                ) : null}

                <Text style={{ ...type.display, fontSize: 36, lineHeight: 42, color: theme.textMain }}>
                  {about.titlePart1 ?? 'La '}
                  <Text style={{ fontFamily: fonts.serifItalic, color: theme.accent }}>
                    {about.titleHighlight ?? 'Cheffe'}
                  </Text>
                  {'\n'}
                  {about.titlePart2 ?? 'de la famille'}
                </Text>

                {about.description ? (
                  <Text style={{ ...type.body, fontSize: 16, color: theme.textSecondary }}>
                    {about.description}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* --- statistiques --- */}
            <View style={{ flexDirection: 'row', gap: spacing.row }}>
              {stats.map((stat) => (
                <View
                  key={stat.label}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    gap: spacing.xs,
                    paddingVertical: spacing.gutter,
                    borderRadius: radius.lg,
                    borderCurve: 'continuous',
                    backgroundColor: theme.bgCard,
                    ...shadow(theme.shadowCard),
                  }}>
                  <Text style={{ fontFamily: fonts.serif, fontSize: 30, color: theme.accent }}>
                    {stat.value}
                  </Text>
                  <Text style={{ ...type.eyebrow, fontSize: 9.5, color: theme.textSecondary }}>
                    {stat.label.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>

            {/* --- son histoire --- */}
            {about.storyText ? (
              <View style={{ gap: spacing.group }}>
                <SectionHeader title={about.storyTitle ?? '✦ Son histoire'} />
                <Text style={{ ...type.body, fontSize: 15.5, color: theme.textMuted }}>
                  {about.storyText.trim()}
                </Text>
              </View>
            ) : null}

            {/* --- citation --- */}
            {about.quote ? (
              <View
                style={{
                  gap: spacing.row,
                  padding: spacing.group,
                  borderRadius: radius.lg,
                  borderCurve: 'continuous',
                  backgroundColor: theme.bgSubtle,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.serifItalic,
                    fontSize: 22,
                    lineHeight: 30,
                    color: theme.textMain,
                  }}>
                  {'« '}
                  {about.quote}
                  {' »'}
                </Text>
                {about.quoteAuthor ? (
                  <Text style={{ ...type.eyebrow, color: theme.accent }}>
                    {about.quoteAuthor.toUpperCase()}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {/* --- actions --- */}
            <View style={{ gap: spacing.row }}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !push.isSupported || push.status === 'enabled' }}
                disabled={!push.isSupported || push.status === 'enabled'}
                onPress={push.enable}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.row,
                  paddingHorizontal: spacing.gutter,
                  paddingVertical: spacing.gutter,
                  borderRadius: radius.lg,
                  borderCurve: 'continuous',
                  borderWidth: 1,
                  borderColor: theme.borderCard,
                  backgroundColor: theme.bgCard,
                  opacity: !push.isSupported ? 0.55 : pressed ? 0.8 : 1,
                })}>
                <Icon
                  name={push.status === 'enabled' ? icons.checkmark : icons.sparkles}
                  size={17}
                  color={theme.accent}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ ...type.bodySemi, color: theme.textMain }}>
                    {push.status === 'enabled'
                      ? 'Notifications activées'
                      : 'Recevoir la recette du jour'}
                  </Text>
                  {push.message ? (
                    <Text style={{ ...type.caption, fontSize: 12, color: theme.textPlaceholder }}>
                      {push.message}
                    </Text>
                  ) : null}
                </View>
              </Pressable>

              <Link href="/suggest" asChild>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.sm,
                    paddingVertical: 16,
                    borderRadius: radius.pill,
                    backgroundColor: theme.accent,
                    opacity: pressed ? 0.85 : 1,
                  })}>
                  <Text style={{ fontSize: 15, color: theme.btnText }}>{'✦'}</Text>
                  <Text style={{ ...type.button, color: theme.btnText }}>
                    Proposer une recette
                  </Text>
                </Pressable>
              </Link>

              <Link href="/admin" asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Espace admin"
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.sm,
                    paddingVertical: spacing.row,
                    opacity: pressed ? 0.6 : 1,
                  })}>
                  <Icon name={icons.lock} size={12} color={theme.textPlaceholder} />
                  <Text style={{ ...type.caption, fontSize: 12, color: theme.textPlaceholder }}>
                    Espace admin
                  </Text>
                </Pressable>
              </Link>
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}
