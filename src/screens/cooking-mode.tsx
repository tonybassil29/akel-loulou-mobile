import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, icons } from '@/components/icon';
import { ErrorState, LoadingState } from '@/components/screen-state';
import { detectTimers, formatDuration } from '@/lib/cook-timers';
import { parseInstructions } from '@/lib/format';
import { useRecipe } from '@/lib/queries';
import { brandGradient, fonts, radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Mode cuisson : une etape par ecran, en grand, l'ecran reste allume, et les
 * durees citees dans le texte deviennent des minuteurs. C'est l'ecran qu'on
 * regarde les mains pleines — il n'a aucun equivalent sur une page web.
 */
export function CookingModeScreen({ id }: { id: string }) {
  // Tant que cet ecran est affiche, le telephone ne se verrouille pas.
  useKeepAwake();

  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const { data: recipe, isLoading, refetch } = useRecipe(id);
  const steps = useMemo(() => parseInstructions(recipe?.instructions), [recipe?.instructions]);

  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  if (isLoading && !recipe) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bgMain }}>
        <LoadingState />
      </View>
    );
  }
  if (!recipe || steps.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bgMain }}>
        <ErrorState message="Cette recette n'a pas d'étapes." onRetry={refetch} />
      </View>
    );
  }

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, next));
    setIndex(clamped);
    scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    if (process.env.EXPO_OS === 'ios') Haptics.selectionAsync();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgMain }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* en-tete : progression + sortie */}
      <View
        style={{
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.gutter,
          paddingBottom: spacing.row,
          gap: spacing.row,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.row }}>
          <Text numberOfLines={1} style={{ ...type.eyebrow, flex: 1, color: theme.accent }}>
            {recipe.title.toUpperCase()}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quitter le mode cuisson"
            hitSlop={10}
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: 34,
              height: 34,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: theme.borderCard,
              backgroundColor: theme.bgCard,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
            })}>
            <Icon name={icons.close} size={14} color={theme.accent} />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', gap: 4 }}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                backgroundColor: i <= index ? theme.accent : theme.borderCard,
              }}
            />
          ))}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        style={{ flex: 1 }}>
        {steps.map((step, i) => (
          <StepPage key={i} width={width} index={i + 1} total={steps.length} text={step} />
        ))}
      </ScrollView>

      {/* navigation entre etapes */}
      <View
        style={{
          flexDirection: 'row',
          gap: spacing.row,
          paddingHorizontal: spacing.gutter,
          paddingBottom: insets.bottom + spacing.gutter,
          paddingTop: spacing.row,
        }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Étape précédente"
          accessibilityState={{ disabled: index === 0 }}
          disabled={index === 0}
          onPress={() => goTo(index - 1)}
          style={({ pressed }) => ({
            width: 56,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: theme.borderCard,
            opacity: index === 0 ? 0.3 : pressed ? 0.6 : 1,
          })}>
          <Text style={{ fontSize: 17, color: theme.accent }}>{'←'}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            index === steps.length - 1 ? 'Terminer' : 'Étape suivante'
          }
          onPress={() => (index === steps.length - 1 ? router.back() : goTo(index + 1))}
          style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.85 : 1 })}>
          <LinearGradient
            colors={brandGradient(theme)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              alignItems: 'center',
              paddingVertical: 16,
              borderRadius: radius.pill,
            }}>
            <Text style={{ ...type.button, color: theme.btnText }}>
              {index === steps.length - 1 ? "C'est prêt ✦" : 'Étape suivante'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function StepPage({
  width,
  index,
  total,
  text,
}: {
  width: number;
  index: number;
  total: number;
  text: string;
}) {
  const theme = useAppTheme();
  const timers = useMemo(() => detectTimers(text), [text]);

  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={{
        paddingHorizontal: spacing.gutter,
        paddingBottom: spacing.section,
        gap: spacing.group,
      }}>
      <Text style={{ ...type.eyebrow, color: theme.textSecondary }}>
        {'ÉTAPE '}
        {index} / {total}
      </Text>

      {/* Texte volontairement tres grand : on le lit a bout de bras. */}
      <Text
        style={{
          fontFamily: fonts.sans,
          fontSize: 27,
          lineHeight: 39,
          color: theme.textMain,
        }}>
        {text}
      </Text>

      {timers.map((timer) => (
        <Timer key={timer.seconds} label={timer.label} seconds={timer.seconds} />
      ))}
    </ScrollView>
  );
}

function Timer({ label, seconds }: { label: string; seconds: number }) {
  const theme = useAppTheme();
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const endsAt = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      endsAt.current = null;
      return;
    }

    // Un rebours qui retire une seconde par tick gele des que l'app passe en
    // arriere-plan : iOS suspend les timers JS. On vise donc une heure de fin
    // absolue, relue a chaque tick et au retour au premier plan — sinon le
    // minuteur d'une cuisson de 20 min affiche encore 18 min au retour.
    endsAt.current = Date.now() + left * 1000;

    const tick = () => {
      const end = endsAt.current;
      if (end === null) return;
      const remaining = Math.max(0, Math.round((end - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        setRunning(false);
        if (process.env.EXPO_OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    };

    const id = setInterval(tick, 500);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });

    return () => {
      clearInterval(id);
      subscription.remove();
    };
    // `left` ne sert qu'a fixer l'echeance au demarrage : le mettre en
    // dependance relancerait l'effet a chaque seconde.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const done = left === 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Minuteur ${label}`}
      onPress={() => {
        if (done) {
          setLeft(seconds);
          setRunning(false);
          return;
        }
        setRunning((r) => !r);
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.row,
        paddingHorizontal: spacing.gutter,
        paddingVertical: spacing.row + 4,
        borderRadius: radius.lg,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: done ? theme.accent : theme.borderCard,
        backgroundColor: done ? theme.bgSubtle : theme.bgCard,
        opacity: pressed ? 0.8 : 1,
      })}>
      <Icon
        name={done ? icons.checkmark : running ? icons.minus : icons.plus}
        size={16}
        color={theme.accent}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ ...type.caption, color: theme.textSecondary }}>
          {done ? 'Terminé — touchez pour relancer' : `Minuteur ${label}`}
        </Text>
        <Text style={{ fontFamily: fonts.serif, fontSize: 30, color: theme.textMain }}>
          {formatDuration(left)}
        </Text>
      </View>
      <Text style={{ ...type.caption, color: theme.accent }}>
        {done ? '' : running ? 'Pause' : 'Démarrer'}
      </Text>
    </Pressable>
  );
}
