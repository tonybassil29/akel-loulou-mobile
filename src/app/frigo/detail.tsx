import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, icons } from '@/components/icon';
import { SectionHeader } from '@/components/section-header';
import { useFrigoIa } from '@/lib/frigo-ia';
import { useSendSuggestion } from '@/lib/queries';
import { splitIngredient } from '@/lib/ingredient-images';
import { useShoppingList } from '@/lib/shopping-list';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * La fiche d'une proposition du Frigo IA : ingredients avec quantites et etapes
 * detaillees, rien d'autre — pas de photo, pas d'image d'ingredient. La recette
 * est demandee au serveur a l'ouverture, et gardee en memoire pour la session.
 */
export default function FrigoDetailScreen() {
  const theme = useAppTheme();
  // Signalement d'une proposition : obligatoire des lors qu'un ecran affiche du
  // contenu produit par un modele (guidelines 1.2 et 4.7). Il emprunte la table
  // des suggestions, deja en place, prefixe pour etre trie a la lecture.
  const signalement = useSendSuggestion();
  const [signale, setSignale] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { echange, titre } = useLocalSearchParams<{ echange: string; titre: string }>();
  const { trouver, detailler } = useFrigoIa();
  const { addMany } = useShoppingList();

  const cible = echange && titre ? trouver(echange, titre) : null;

  useEffect(() => {
    if (cible && !cible.detail) detailler(cible.echange, cible.proposition);
  }, [cible, detailler]);

  const detail = cible?.detail && cible.detail !== 'en_cours' && !('erreur' in cible.detail) ? cible.detail : null;
  const erreur = cible?.detail && typeof cible.detail === 'object' && 'erreur' in cible.detail ? cible.detail.erreur : null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgMain }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.row,
          paddingHorizontal: spacing.gutter,
          paddingBottom: insets.bottom + spacing.section,
          gap: spacing.group,
        }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => ({
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: spacing.row,
            paddingVertical: 8,
            borderRadius: radius.pill,
            backgroundColor: pressed ? theme.bgHover : theme.bgSubtle,
          })}>
          <Icon name={icons.chevronLeft} size={12} color={theme.textMain} />
          <Text style={{ ...type.bodySemi, fontSize: 14, color: theme.textMain }}>Retour</Text>
        </Pressable>

        {!cible ? (
          <Text style={{ ...type.body, color: theme.textSecondary }}>
            Cette proposition n'est plus en mémoire. Reviens au Frigo et relance ta recherche.
          </Text>
        ) : (
          <>
            <View style={{ gap: spacing.sm }}>
              <Text style={{ ...type.eyebrow, color: theme.accent }}>FRIGO IA</Text>
              <Text style={{ ...type.display, color: theme.textMain }}>
                {detail?.titre ?? cible.proposition.titre}
              </Text>
              <Text style={{ ...type.body, color: theme.textMuted }}>{cible.proposition.resume}</Text>
              {detail ? (
                <Text style={{ ...type.caption, color: theme.textSecondary }}>
                  {[detail.portions, detail.temps].filter(Boolean).join(' · ')}
                </Text>
              ) : null}
            </View>

            {!detail && !erreur ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <ActivityIndicator color={theme.accent} />
                <Text style={{ ...type.body, color: theme.textSecondary }}>J'écris la recette complète…</Text>
              </View>
            ) : null}

            {erreur ? (
              <View style={{ gap: spacing.sm }}>
                <Text style={{ ...type.body, color: theme.textMain }}>Je n'ai pas pu écrire la recette.</Text>
                <Text style={{ ...type.caption, color: theme.textSecondary }}>{erreur}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => detailler(cible.echange, cible.proposition)}
                  style={({ pressed }) => ({
                    alignSelf: 'flex-start',
                    paddingHorizontal: spacing.group,
                    paddingVertical: spacing.row,
                    borderRadius: radius.pill,
                    backgroundColor: theme.accent,
                    opacity: pressed ? 0.85 : 1,
                  })}>
                  <Text style={{ ...type.button, color: theme.btnText }}>Réessayer</Text>
                </Pressable>
              </View>
            ) : null}

            {detail ? (
              <>
                <View style={{ gap: spacing.row }}>
                  <SectionHeader title="Ingrédients" />
                  <View
                    style={{
                      borderRadius: radius.lg,
                      borderCurve: 'continuous',
                      backgroundColor: theme.bgCard,
                      borderWidth: 1,
                      borderColor: theme.borderCard,
                      paddingHorizontal: spacing.row + 2,
                    }}>
                    {detail.ingredients.map((ing, i) => {
                      const { qty, nom } = splitIngredient(ing);
                      return (
                        <View
                          key={`${ing}-${i}`}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'baseline',
                            gap: spacing.sm,
                            paddingVertical: 10,
                            borderTopWidth: i === 0 ? 0 : 1,
                            borderTopColor: theme.borderCard,
                          }}>
                          {qty ? (
                            <Text style={{ ...type.bodySemi, minWidth: 64, color: theme.accentDeep }}>{qty}</Text>
                          ) : null}
                          <Text style={{ ...type.body, flex: 1, color: theme.textMain }}>{qty ? nom : ing}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => addMany(detail.ingredients, `frigo:${detail.titre}`, detail.titre)}
                    style={({ pressed }) => ({
                      alignSelf: 'flex-start',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: spacing.row + 2,
                      paddingVertical: 9,
                      borderRadius: radius.pill,
                      borderWidth: 1,
                      borderColor: theme.borderInput,
                      backgroundColor: pressed ? theme.bgHover : theme.bgCard,
                    })}>
                    <Icon name={icons.cart} size={13} color={theme.accent} />
                    <Text style={{ ...type.bodySemi, fontSize: 14, color: theme.textMain }}>
                      Ajouter à la liste de courses
                    </Text>
                  </Pressable>
                </View>

                <View style={{ gap: spacing.row }}>
                  <SectionHeader title="Préparation" />
                  {detail.etapes.map((etape, i) => (
                    <View key={i} style={{ flexDirection: 'row', gap: spacing.row }}>
                      <View
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: theme.accent,
                        }}>
                        <Text style={{ ...type.bodySemi, fontSize: 12.5, color: theme.btnText }}>{i + 1}</Text>
                      </View>
                      <Text style={{ ...type.body, flex: 1, color: theme.textMain }}>{etape}</Text>
                    </View>
                  ))}
                </View>

                {detail.conseil ? (
                  <View
                    style={{
                      padding: spacing.row + 2,
                      borderRadius: radius.md,
                      backgroundColor: theme.bgSubtle,
                    }}>
                    <Text style={{ ...type.eyebrow, color: theme.accentDeep, marginBottom: 4 }}>LE CONSEIL</Text>
                    <Text style={{ ...type.body, color: theme.textMain }}>{detail.conseil}</Text>
                  </View>
                ) : null}

                {/* La source est citee, jamais ouverte : l'URL vient du modele,
                    pas d'une liste que nous avons relue. Y envoyer l'utilisateur
                    d'un toucher vaut « acces web sans restriction » au
                    questionnaire de classification d'Apple, ce qui imposerait un
                    17+ a un carnet de recettes. L'attribution reste, le lien part. */}
                {detail.source?.titre ? (
                  <Text style={{ ...type.caption, color: theme.textSecondary }}>
                    Source : {detail.source.titre}
                  </Text>
                ) : null}

                <View style={{ marginTop: spacing.row, alignItems: 'flex-start' }}>
                  {signale ? (
                    <Text style={{ ...type.caption, color: theme.textSecondary }}>
                      Merci, c&apos;est signalé. Nous relisons chaque signalement.
                    </Text>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Signaler cette proposition"
                      disabled={signalement.isPending}
                      onPress={() => {
                        signalement.mutate(
                          {
                            title: `[SIGNALEMENT] ${detail.titre}`,
                            description: `Proposition du Frigo signalée par un utilisateur.\nIngrédients : ${(detail.ingredients ?? []).join(', ')}`,
                          },
                          { onSuccess: () => setSignale(true) }
                        );
                      }}
                      style={({ pressed }) => ({
                        paddingHorizontal: spacing.row,
                        paddingVertical: 9,
                        borderRadius: radius.pill,
                        borderWidth: 1,
                        borderColor: theme.borderCard,
                        opacity: signalement.isPending ? 0.5 : pressed ? 0.7 : 1,
                      })}>
                      <Text style={{ ...type.caption, color: theme.textSecondary }}>
                        Signaler cette proposition
                      </Text>
                    </Pressable>
                  )}
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
