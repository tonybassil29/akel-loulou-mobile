import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsRestoring } from '@tanstack/react-query';

import { useApparence } from '@/lib/theme-preference';
import { Link, useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { Linking, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, icons } from '@/components/icon';
import { ErrorState, LoadingState } from '@/components/screen-state';
import { SectionHeader } from '@/components/section-header';
import { heroUrl } from '@/lib/images';
import { useAboutSettings, useRecipes } from '@/lib/queries';
import { fonts, radius, shadow, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/** Site public : politique de confidentialite et page de support. */
const SITE_URL = 'https://laurecipe.akeloulou.workers.dev';

export function AboutScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isRestoring = useIsRestoring();
  const aboutQuery = useAboutSettings();
  const recipesQuery = useRecipes();

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
        {/* Depuis que l'onglet a laisse sa place au Menu, cet ecran est empile :
            il lui faut son propre retour, identique a celui d'une fiche. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => router.back()}
          style={({ pressed }) => ({
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            paddingHorizontal: 18,
            paddingVertical: 11,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: theme.borderCard,
            backgroundColor: theme.bgCard,
            marginBottom: -spacing.gutter,
            opacity: pressed ? 0.7 : 1,
          })}>
          <Text style={{ fontSize: 15, color: theme.accent }}>{'\u2190'}</Text>
          <Text style={{ ...type.bodySemi, fontSize: 14.5, color: theme.accent }}>Retour</Text>
        </Pressable>

        {isRestoring || aboutQuery.isLoading ? (
          <View style={{ height: 360 }}>
            <LoadingState />
          </View>
        ) : aboutQuery.isError && !aboutQuery.data ? (
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
              {/* Sans photo, on garde le degrade de marque mais pas un cadre vide. */}
              {about.imageUrl ? (
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
                    <Image
                      source={heroUrl(about.imageUrl, Math.round(width * 2))}
                      contentFit="cover"
                      transition={240}
                      style={{ width: '100%', height: '100%', borderRadius: radius.md }}
                      accessibilityIgnoresInvertColors
                    />
                  </View>
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={[theme.aboutGrad1, theme.aboutGrad2, theme.aboutGrad3]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ height: 110 }}
                />
              )}

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

            </View>
          </>
        )}

        {/* Reglage d'apparence : l'app demarre toujours en clair, meme si le
            telephone est en sombre. Le sombre se choisit ici. */}
        <ApparenceRow />

        {/* Hors de la branche de chargement a dessein : meme hors ligne ou en
            erreur de reseau, la politique de confidentialite et le support
            doivent rester atteignables depuis l'app (5.1.1(i)). */}
        <LegalLinks />
      </ScrollView>
    </>
  );
}

function LegalLinks() {
  const theme = useAppTheme();
  return (
    <>
      {/* 5.1.1(i) : la politique de confidentialite doit etre atteignable
          depuis l'app, pas seulement depuis la fiche App Store. */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: spacing.row,
        }}>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Politique de confidentialité"
          onPress={() => Linking.openURL(`${SITE_URL}/privacy`)}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Text style={{ ...type.caption, fontSize: 12.5, color: theme.accent }}>
            Confidentialité
          </Text>
        </Pressable>
        <Text style={{ ...type.caption, color: theme.textPlaceholder }}>{'\u00b7'}</Text>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Support"
          onPress={() => Linking.openURL(`${SITE_URL}/support`)}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Text style={{ ...type.caption, fontSize: 12.5, color: theme.accent }}>
            Support
          </Text>
        </Pressable>
      </View>

      <Text
        style={{
          ...type.caption,
          color: theme.textPlaceholder,
          textAlign: 'center',
          paddingHorizontal: spacing.row,
        }}>
        Les recettes sont faites maison : vérifiez toujours les allergènes et les
        temps de cuisson selon votre matériel.
      </Text>
    </>
  );
}

function ApparenceRow() {
  const theme = useAppTheme();
  const { apparence, choisir } = useApparence();

  const options: { id: 'light' | 'dark'; label: string; emoji: string }[] = [
    { id: 'light', label: 'Clair', emoji: '\u2600\ufe0f' },
    { id: 'dark', label: 'Sombre', emoji: '\u{1F319}' },
  ];

  return (
    <View style={{ gap: spacing.row }}>
      <SectionHeader title="Apparence" />
      <View
        style={{
          flexDirection: 'row',
          gap: spacing.sm,
          padding: spacing.xs,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: theme.borderCard,
          backgroundColor: theme.bgCard,
        }}>
        {options.map((option) => {
          const actif = apparence === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected: actif }}
              onPress={() => choisir(option.id)}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                paddingVertical: 11,
                borderRadius: radius.pill,
                backgroundColor: actif ? theme.accent : 'transparent',
                opacity: pressed ? 0.8 : 1,
              })}>
              <Text style={{ fontSize: 13 }}>{option.emoji}</Text>
              <Text
                style={{
                  ...type.button,
                  color: actif ? theme.btnText : theme.textSecondary,
                }}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
