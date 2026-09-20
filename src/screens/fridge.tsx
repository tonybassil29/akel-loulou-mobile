import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, icons } from '@/components/icon';
import { type Echange, type Proposition, useFrigoIa } from '@/lib/frigo-ia';
import { radius, shadow, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Frigo IA : on ecrit ce qu'on a, en une phrase ; l'agent lit, cherche sur le
 * web et propose des recettes qui n'utilisent QUE ca — plus les basiques du
 * placard. Le calcul se fait sur le serveur (fonction Edge `frigo-ia`) : la cle
 * d'API ne descend jamais sur le telephone. Cet ecran ne marche pas hors ligne.
 */
export function FridgeScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { echanges, demander, effacer } = useFrigoIa();
  const [texte, setTexte] = useState('');
  const defilement = useRef<ScrollView>(null);

  const enCours = echanges.some((e) => e.etat === 'en_cours');

  const envoyer = () => {
    const message = texte.trim();
    if (message.length < 3 || enCours) return;
    setTexte('');
    demander(message);
    setTimeout(() => defilement.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.bgMain }}>
      <ScrollView
        ref={defilement}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.group,
          paddingHorizontal: spacing.gutter,
          paddingBottom: spacing.section,
          gap: spacing.group,
        }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => defilement.current?.scrollToEnd({ animated: true })}>
        <View style={{ gap: spacing.row }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.row }}>
            <View style={{ width: 28, height: 1, backgroundColor: theme.accent }} />
            <Text style={{ ...type.eyebrow, flex: 1, color: theme.accent }}>AKEL LOULOU</Text>
            {echanges.length > 0 ? (
              <Pressable accessibilityRole="button" onPress={effacer} hitSlop={8}>
                <Text style={{ ...type.caption, color: theme.textSecondary }}>Effacer</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={{ ...type.display, color: theme.textMain }}>
            Qu'est-ce{'\n'}qu'on cuisine ?
          </Text>
          <Text style={{ ...type.body, color: theme.textMuted }}>
            Écris ce que tu as dans le frigo, en une phrase. Je cherche des recettes qui n'utilisent
            que ça — et ce qu'on a toujours au placard : sel, huile, épices…
          </Text>
        </View>

        {echanges.length === 0 ? (
          <View style={{ gap: spacing.sm }}>
            {[
              'J\'ai des pâtes, du riz, de la sauce tomate, du poulet et de la viande hachée',
              'Il me reste 3 œufs, du fromage et des pommes de terre',
              'Des bananes, du chocolat et de la farine',
            ].map((ex) => (
              <Pressable
                key={ex}
                accessibilityRole="button"
                onPress={() => setTexte(ex)}
                style={({ pressed }) => ({
                  paddingHorizontal: spacing.row,
                  paddingVertical: 10,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: theme.borderCard,
                  backgroundColor: pressed ? theme.bgHover : theme.bgCard,
                })}>
                <Text style={{ ...type.body, fontSize: 14, color: theme.textSecondary }}>{ex}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {echanges.map((e) => (
          <EchangeVue
            key={e.id}
            echange={e}
            onChoisir={(p) =>
              router.push({ pathname: '/frigo/detail', params: { echange: e.id, titre: p.titre } })
            }
          />
        ))}
      </ScrollView>

      {/* --- saisie, collee au clavier --- */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: spacing.sm,
          paddingHorizontal: spacing.gutter,
          paddingTop: spacing.sm,
          paddingBottom: Math.max(insets.bottom, spacing.sm) + spacing.sm,
          borderTopWidth: 1,
          borderTopColor: theme.borderCard,
          backgroundColor: theme.bgMain,
        }}>
        <TextInput
          value={texte}
          onChangeText={setTexte}
          placeholder="J'ai du poulet, du riz, des tomates…"
          placeholderTextColor={theme.textPlaceholder}
          multiline
          onSubmitEditing={envoyer}
          blurOnSubmit
          style={{
            flex: 1,
            minHeight: 46,
            maxHeight: 120,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: theme.borderInput,
            backgroundColor: theme.bgInput,
            fontFamily: type.body.fontFamily,
            fontSize: 15,
            color: theme.textMain,
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chercher des recettes"
          disabled={texte.trim().length < 3 || enCours}
          onPress={envoyer}
          style={({ pressed }) => ({
            width: 46,
            height: 46,
            borderRadius: 23,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.accent,
            opacity: texte.trim().length < 3 || enCours ? 0.4 : pressed ? 0.85 : 1,
          })}>
          {enCours ? (
            <ActivityIndicator color={theme.btnText} />
          ) : (
            <Icon name={icons.arrowUp} size={18} color={theme.btnText} />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function EchangeVue({ echange, onChoisir }: { echange: Echange; onChoisir: (p: Proposition) => void }) {
  const theme = useAppTheme();

  return (
    <View style={{ gap: spacing.row }}>
      {/* la phrase de l'utilisateur */}
      <View style={{ alignItems: 'flex-end' }}>
        <View
          style={{
            maxWidth: '85%',
            paddingHorizontal: spacing.row + 2,
            paddingVertical: 10,
            borderRadius: radius.lg,
            borderBottomRightRadius: 6,
            backgroundColor: theme.accent,
          }}>
          <Text style={{ ...type.body, color: theme.btnText }}>{echange.message}</Text>
        </View>
      </View>

      {/* la reponse */}
      {echange.etat === 'en_cours' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <ActivityIndicator color={theme.accent} />
          <Text style={{ ...type.body, color: theme.textSecondary }}>Je cherche des recettes…</Text>
        </View>
      ) : null}

      {echange.etat === 'erreur' ? (
        <View
          style={{
            padding: spacing.row,
            borderRadius: radius.md,
            backgroundColor: theme.bgSubtle,
            borderWidth: 1,
            borderColor: theme.borderCard,
          }}>
          <Text style={{ ...type.bodySemi, color: theme.textMain }}>Je n'ai pas pu chercher.</Text>
          <Text style={{ ...type.caption, color: theme.textSecondary, marginTop: 2 }}>{echange.erreur}</Text>
        </View>
      ) : null}

      {echange.etat === 'ok' ? (
        <View style={{ gap: spacing.row }}>
          {echange.ingredients.length > 0 ? (
            <Text style={{ ...type.caption, color: theme.textSecondary }}>
              Avec : {echange.ingredients.join(', ')}
            </Text>
          ) : null}

          {echange.propositions.length === 0 ? (
            <Text style={{ ...type.body, color: theme.textMain }}>
              Je n'ai rien trouvé qui tienne avec seulement ça. Ajoute un ou deux ingrédients ?
            </Text>
          ) : null}

          {echange.propositions.map((p) => (
            <Pressable
              key={p.titre}
              accessibilityRole="button"
              accessibilityLabel={`Voir la recette ${p.titre}`}
              onPress={() => onChoisir(p)}
              style={({ pressed }) => ({
                padding: spacing.row + 2,
                gap: 6,
                borderRadius: radius.lg,
                borderCurve: 'continuous',
                backgroundColor: pressed ? theme.bgHover : theme.bgCard,
                borderWidth: 1,
                borderColor: theme.borderCard,
                ...shadow(theme.shadowCard),
              })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Text style={{ ...type.cardTitle, flex: 1, color: theme.textMain }} numberOfLines={2}>
                  {p.titre}
                </Text>
                <Icon name={icons.chevronRight} size={13} color={theme.accent} />
              </View>
              <Text style={{ ...type.body, fontSize: 14, color: theme.textSecondary }}>{p.resume}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                {[p.temps, p.difficulte, p.carnet ? 'Recette du carnet' : null]
                  .filter(Boolean)
                  .map((t) => (
                    <View
                      key={String(t)}
                      style={{
                        paddingHorizontal: 9,
                        paddingVertical: 3,
                        borderRadius: radius.pill,
                        backgroundColor: theme.bgSubtle,
                      }}>
                      <Text style={{ ...type.eyebrow, fontSize: 9.5, color: theme.accentDeep }}>{String(t)}</Text>
                    </View>
                  ))}
              </View>
              <Text style={{ ...type.caption, fontSize: 12, color: theme.textMuted }}>
                Utilise : {p.ingredients_utilises.join(', ')}
                {p.basiques_utilises.length ? ` · placard : ${p.basiques_utilises.join(', ')}` : ''}
              </Text>
            </Pressable>
          ))}

          {echange.recherche_web === false && echange.propositions.length > 0 ? (
            <Text style={{ ...type.caption, fontSize: 11.5, color: theme.textPlaceholder }}>
              Recettes proposées de mémoire, sans recherche web.
            </Text>
          ) : null}

          {echange.rejetees > 0 ? (
            <Text style={{ ...type.caption, fontSize: 11.5, color: theme.textPlaceholder }}>
              {echange.rejetees} proposition{echange.rejetees > 1 ? 's' : ''} écartée
              {echange.rejetees > 1 ? 's' : ''} : elle{echange.rejetees > 1 ? 's' : ''} demandai
              {echange.rejetees > 1 ? 'ent' : 't'} un ingrédient que tu n'as pas.
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
