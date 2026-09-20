import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field } from '@/components/field';
import { Icon, icons } from '@/components/icon';
import { useAdminSession } from '@/lib/admin-auth';
import { type RecipeInput, uploadToCloudinary, useDeleteRecipe, useSaveRecipe, useSaveSetting } from '@/lib/admin-data';
import { normalizeString } from '@/lib/format';
import { thumbUrl } from '@/lib/images';
import { useGlobalEquipment, useGlobalSpices, useRecipes } from '@/lib/queries';
import type { Equipment, Recipe } from '@/lib/types';
import { radius, spacing, type } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

/**
 * Le formulaire de recette de l'admin, complet : les memes champs que le site.
 * `id = new` cree ; sinon on modifie. La photo part sur Cloudinary a
 * l'enregistrement, jamais en base en base64.
 */
export default function AdminRecetteScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const estNouvelle = !id || id === 'new';
  const { isAdmin } = useAdminSession();
  const toutes = useRecipes(true);
  const epicesGlobales = useGlobalSpices();
  const materielGlobal = useGlobalEquipment();
  const save = useSaveRecipe();
  const supprimer = useDeleteRecipe();
  const saveSetting = useSaveSetting();

  const existante = useMemo(() => (estNouvelle ? null : toutes.data?.find((r) => r.id === id) ?? null), [toutes.data, id, estNouvelle]);

  const [f, setF] = useState<RecipeInput | null>(null);
  const [photoLocale, setPhotoLocale] = useState<string | null>(null);
  const [nouvelleEpice, setNouvelleEpice] = useState('');
  const [nouveauTag, setNouveauTag] = useState('');
  const [rechercheLiee, setRechercheLiee] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  useEffect(() => {
    if (f) return;
    if (estNouvelle) {
      setF({ title: '', description: null, category: 'plat', ingredients: [''], instructions: '', image_url: null, servings: 4, prep_time: null, cook_time: null, difficulty: null, country: null, spices: [], equipment: [], tags: [], hidden: false, is_secondary: false, show_portions: false, related_recipes: null });
    } else if (existante) {
      const { id: _i, created_at: _c, updated_at: _u, ...rest } = existante;
      setF({ ...rest, ingredients: rest.ingredients?.length ? rest.ingredients : [''], tags: rest.tags ?? [], spices: rest.spices ?? [], equipment: rest.equipment ?? [] });
    }
  }, [estNouvelle, existante, f]);

  const etapes = useMemo(() => (f?.instructions ?? '').split('\n').filter((l, i, a) => l.trim() || i === a.length - 1), [f?.instructions]);
  const set = <K extends keyof RecipeInput>(k: K, v: RecipeInput[K]) => setF((p) => (p ? { ...p, [k]: v } : p));

  const tousLesTags = useMemo(() => Array.from(new Set((toutes.data ?? []).flatMap((r) => r.tags ?? []).filter(Boolean))).sort(), [toutes.data]);
  const epices = useMemo(() => Array.from(new Set([...(epicesGlobales.data ?? []), ...(f?.spices ?? [])])).sort(), [epicesGlobales.data, f?.spices]);

  const choisirPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85, allowsEditing: true, aspect: [4, 3] });
    if (!res.canceled && res.assets[0]?.uri) setPhotoLocale(res.assets[0].uri);
  };

  const enregistrer = async () => {
    if (!f || !f.title.trim()) { setMessage('Il manque le titre.'); return; }
    setEnregistrement(true); setMessage(null);
    try {
      let image_url = f.image_url;
      if (photoLocale) image_url = await uploadToCloudinary(photoLocale);
      const data: RecipeInput = {
        ...f,
        title: f.title.trim(),
        country: f.country?.trim() || null,
        description: f.description?.trim() || null,
        image_url,
        ingredients: f.ingredients.map((i) => i.trim()).filter(Boolean),
        instructions: etapes.map((e) => e.trim()).filter(Boolean).join('\n'),
        tags: f.tags?.length ? f.tags : null,
        related_recipes: f.related_recipes?.length ? f.related_recipes : null,
      } as RecipeInput;
      const nouveauxEpices = (f.spices ?? []).filter((s) => !(epicesGlobales.data ?? []).includes(s));
      if (nouveauxEpices.length) await saveSetting.mutateAsync({ key: 'all_spices', value: Array.from(new Set([...(epicesGlobales.data ?? []), ...nouveauxEpices])) });
      await save.mutateAsync({ id: estNouvelle ? null : id!, data });
      router.back();
    } catch (e) {
      setMessage(`Échec : ${(e as Error).message}`);
    } finally {
      setEnregistrement(false);
    }
  };

  const confirmerSuppression = () =>
    Alert.alert('Supprimer la recette ?', `« ${f?.title} » disparaîtra du carnet, sur l'app et sur le site.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await supprimer.mutateAsync(id!); router.back(); } },
    ]);

  if (!f) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bgMain, gap: spacing.row }}>
        <ActivityIndicator color={theme.accent} />
        {!estNouvelle && toutes.data && !existante ? <Text style={{ ...type.body, color: theme.textSecondary }}>Recette introuvable.</Text> : null}
      </View>
    );
  }

  const photo = photoLocale ?? (f.image_url ? thumbUrl(f.image_url, 800) : null);
  const S = ({ titre }: { titre: string }) => <Text style={{ ...type.cardTitle, color: theme.textMain, marginTop: spacing.sm }}>{titre}</Text>;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bgMain }}
      contentContainerStyle={{ paddingTop: insets.top + spacing.row, paddingHorizontal: spacing.gutter, paddingBottom: spacing.section * 2, gap: spacing.row + 4 }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.row, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: pressed ? theme.bgHover : theme.bgSubtle })}>
          <Icon name={icons.chevronLeft} size={12} color={theme.textMain} />
          <Text style={{ ...type.bodySemi, fontSize: 14, color: theme.textMain }}>Retour</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        {!estNouvelle ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Supprimer la recette" onPress={confirmerSuppression} hitSlop={8} style={{ padding: 8 }}>
            <Icon name={icons.trash} size={17} color="#E5484D" />
          </Pressable>
        ) : null}
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text style={{ ...type.eyebrow, color: theme.accent }}>AKEL LOULOU · ADMIN</Text>
        <Text style={{ ...type.display, color: theme.textMain }}>{estNouvelle ? 'Nouvelle recette' : 'Modifier'}</Text>
      </View>
      {!isAdmin ? <Text style={{ ...type.body, color: '#E5484D' }}>Connecte-toi d'abord : sans session admin, la base refusera.</Text> : null}

      {/* --- photo --- */}
      <Pressable accessibilityRole="button" onPress={choisirPhoto} style={{ height: 190, borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden', backgroundColor: theme.bgSubtle, borderWidth: 1, borderColor: theme.borderCard, alignItems: 'center', justifyContent: 'center' }}>
        {photo ? <Image source={photo} contentFit="cover" style={{ width: '100%', height: '100%' }} /> : (
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Icon name={icons.photo} size={26} color={theme.textPlaceholder} />
            <Text style={{ ...type.caption, color: theme.textSecondary }}>Choisir une photo</Text>
          </View>
        )}
      </Pressable>
      {photo ? <Pressable onPress={choisirPhoto}><Text style={{ ...type.caption, color: theme.accent }}>Changer la photo</Text></Pressable> : null}

      <Field label="Titre" value={f.title} onChangeText={(v) => set('title', v)} placeholder="Gâteau au chocolat" />

      {/* --- categorie --- */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {(['plat', 'dessert'] as const).map((c) => (
          <Pressable key={c} onPress={() => set('category', c)} style={{ flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: radius.md, borderWidth: 1.5, borderColor: f.category === c ? theme.accent : theme.borderInput, backgroundColor: f.category === c ? theme.bgHover : theme.bgCard }}>
            <Text style={{ ...type.bodySemi, fontSize: 14, color: f.category === c ? theme.accent : theme.textSecondary }}>{c === 'plat' ? '🍽️ Plat' : '🍰 Dessert'}</Text>
          </Pressable>
        ))}
      </View>

      <Field label="Pays" value={f.country ?? ''} onChangeText={(v) => set('country', v)} placeholder="Liban" />
      <Field label="Description" value={f.description ?? ''} onChangeText={(v) => set('description', v)} placeholder="Deux lignes qui donnent envie…" multiline />

      {/* --- portions --- */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.row }}>
        <Text style={{ ...type.bodySemi, flex: 1, color: theme.textMain }}>Portions : {f.servings ?? 4}</Text>
        {[-1, 1].map((d) => (
          <Pressable key={d} onPress={() => set('servings', Math.max(1, (f.servings ?? 4) + d))} style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.borderInput, backgroundColor: theme.bgCard }}>
            <Icon name={d < 0 ? icons.minus : icons.plus} size={13} color={theme.textMain} />
          </Pressable>
        ))}
      </View>
      <Bascule label="Afficher le réglage des portions" value={!!f.show_portions} onChange={(v) => set('show_portions', v)} />
      <Bascule label="Recette cachée" value={!!f.hidden} onChange={(v) => set('hidden', v)} />
      <Bascule label="Recette secondaire (sous-recette, ex. Ater)" value={!!f.is_secondary} onChange={(v) => set('is_secondary', v)} />

      {/* --- ingredients --- */}
      <S titre="Ingrédients" />
      <Text style={{ ...type.caption, color: theme.textSecondary }}>Quantité puis nom : « 200 g de farine ». Une ligne par ingrédient.</Text>
      <ListeEditable items={f.ingredients} onChange={(v) => set('ingredients', v)} placeholder="200 g de farine" />

      {/* --- epices --- */}
      <S titre="Épices & assaisonnements" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {epices.map((e) => {
          const actif = f.spices?.includes(e);
          return (
            <Pressable key={e} onPress={() => set('spices', actif ? (f.spices ?? []).filter((x) => x !== e) : [...(f.spices ?? []), e])} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, borderColor: actif ? theme.accent : theme.borderCard, backgroundColor: actif ? theme.accent : theme.bgCard }}>
              <Text style={{ ...type.caption, color: actif ? theme.btnText : theme.textMain }}>{e}</Text>
            </Pressable>
          );
        })}
      </View>
      <LigneAjout value={nouvelleEpice} onChange={setNouvelleEpice} placeholder="Ajouter une épice…" onAdd={() => { const e = nouvelleEpice.trim().toLowerCase(); if (e && !f.spices?.includes(e)) set('spices', [...(f.spices ?? []), e]); setNouvelleEpice(''); }} />

      {/* --- materiel --- */}
      <S titre="Matériel" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {(materielGlobal.data ?? []).map((m: Equipment) => {
          const actif = f.equipment?.some((x) => x.name === m.name);
          return (
            <Pressable key={m.name} onPress={() => set('equipment', actif ? (f.equipment ?? []).filter((x) => x.name !== m.name) : [...(f.equipment ?? []), m])} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, borderColor: actif ? theme.accent : theme.borderCard, backgroundColor: actif ? theme.accent : theme.bgCard }}>
              <Text style={{ ...type.caption, color: actif ? theme.btnText : theme.textMain }}>{m.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* --- etapes --- */}
      <S titre="Préparation" />
      <ListeEditable items={etapes.length ? etapes : ['']} onChange={(v) => set('instructions', v.join('\n'))} placeholder="Préchauffer le four à 180 °C…" multiline numerote />

      {/* --- tags --- */}
      <S titre="Tags" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {Array.from(new Set([...tousLesTags, ...(f.tags ?? [])])).map((t) => {
          const actif = f.tags?.includes(t);
          return (
            <Pressable key={t} onPress={() => set('tags', actif ? (f.tags ?? []).filter((x) => x !== t) : [...(f.tags ?? []), t])} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, borderColor: actif ? theme.accent : theme.borderCard, backgroundColor: actif ? theme.accent : theme.bgCard }}>
              <Text style={{ ...type.caption, color: actif ? theme.btnText : theme.textMain }}># {t}</Text>
            </Pressable>
          );
        })}
      </View>
      <LigneAjout value={nouveauTag} onChange={setNouveauTag} placeholder="Nouveau tag…" onAdd={() => { const t = nouveauTag.trim().toLowerCase(); if (t && !f.tags?.includes(t)) set('tags', [...(f.tags ?? []), t]); setNouveauTag(''); }} />

      {/* --- recettes liees --- */}
      <S titre="Recettes liées" />
      <Text style={{ ...type.caption, color: theme.textSecondary }}>Les sous-recettes (l'Ater du Beklewa) : leurs ingrédients partent aux courses avec celle-ci.</Text>
      <TextInput value={rechercheLiee} onChangeText={setRechercheLiee} placeholder="Chercher une recette à lier…" placeholderTextColor={theme.textPlaceholder} style={{ paddingHorizontal: 16, height: 44, borderRadius: radius.pill, borderWidth: 1, borderColor: theme.borderInput, backgroundColor: theme.bgInput, fontFamily: type.body.fontFamily, fontSize: 15, color: theme.textMain }} />
      <View style={{ gap: 6 }}>
        {(toutes.data ?? [])
          .filter((r: Recipe) => r.id !== id && (f.related_recipes?.some((x) => x.id === r.id) || (rechercheLiee && normalizeString(r.title).includes(normalizeString(rechercheLiee)))))
          .slice(0, 12)
          .map((r: Recipe) => {
            const actif = f.related_recipes?.some((x) => x.id === r.id);
            return (
              <Pressable key={r.id} onPress={() => set('related_recipes', actif ? (f.related_recipes ?? []).filter((x) => x.id !== r.id) : [...(f.related_recipes ?? []), { id: r.id, title: r.title }])} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.row, paddingVertical: 10, borderRadius: radius.md, backgroundColor: actif ? theme.bgHover : theme.bgCard, borderWidth: 1, borderColor: actif ? theme.accent : theme.borderCard }}>
                <Text style={{ ...type.body, flex: 1, color: theme.textMain }}>{r.title}</Text>
                {r.is_secondary ? <Text style={{ ...type.eyebrow, fontSize: 9, color: theme.accentDeep }}>SECONDAIRE</Text> : null}
                {actif ? <Icon name={icons.checkmark} size={13} color={theme.accent} /> : null}
              </Pressable>
            );
          })}
      </View>

      {message ? <Text style={{ ...type.caption, color: '#E5484D' }}>{message}</Text> : null}
      <Pressable accessibilityRole="button" disabled={enregistrement || !isAdmin} onPress={enregistrer} style={({ pressed }) => ({ alignItems: 'center', paddingVertical: spacing.row + 2, borderRadius: radius.pill, backgroundColor: theme.accent, opacity: enregistrement || !isAdmin ? 0.4 : pressed ? 0.85 : 1 })}>
        <Text style={{ ...type.button, color: theme.btnText }}>{enregistrement ? 'Enregistrement…' : estNouvelle ? 'Ajouter au carnet' : 'Enregistrer'}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Bascule({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const theme = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.row }}>
      <Text style={{ ...type.body, flex: 1, color: theme.textMain }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.accent, false: theme.borderInput }} />
    </View>
  );
}

function LigneAjout({ value, onChange, placeholder, onAdd }: { value: string; onChange: (v: string) => void; placeholder: string; onAdd: () => void }) {
  const theme = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={theme.textPlaceholder} onSubmitEditing={onAdd} autoCapitalize="none" style={{ flex: 1, paddingHorizontal: 16, height: 42, borderRadius: radius.pill, borderWidth: 1, borderColor: theme.borderInput, backgroundColor: theme.bgInput, fontFamily: type.body.fontFamily, fontSize: 14, color: theme.textMain }} />
      <Pressable accessibilityRole="button" onPress={onAdd} style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bgSubtle }}>
        <Icon name={icons.plus} size={14} color={theme.accent} />
      </Pressable>
    </View>
  );
}

function ListeEditable({ items, onChange, placeholder, multiline, numerote }: { items: string[]; onChange: (v: string[]) => void; placeholder: string; multiline?: boolean; numerote?: boolean }) {
  const theme = useAppTheme();
  const maj = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  const bouger = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= items.length) return; const c = [...items]; [c[i], c[j]] = [c[j], c[i]]; onChange(c); };
  return (
    <View style={{ gap: spacing.sm }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center', gap: 6 }}>
          {numerote ? <Text style={{ ...type.bodySemi, width: 22, paddingTop: multiline ? 12 : 0, color: theme.accent }}>{i + 1}.</Text> : null}
          <TextInput value={it} onChangeText={(v) => maj(i, v)} placeholder={placeholder} placeholderTextColor={theme.textPlaceholder} multiline={multiline} style={{ flex: 1, paddingHorizontal: 14, paddingVertical: multiline ? 10 : 0, minHeight: 42, borderRadius: multiline ? radius.md : radius.pill, borderWidth: 1, borderColor: theme.borderInput, backgroundColor: theme.bgInput, fontFamily: type.body.fontFamily, fontSize: 14, color: theme.textMain }} />
          <View style={{ gap: 2 }}>
            <Pressable hitSlop={4} onPress={() => bouger(i, -1)} style={{ padding: 4 }}><Text style={{ color: theme.textSecondary, fontSize: 11 }}>▲</Text></Pressable>
            <Pressable hitSlop={4} onPress={() => bouger(i, 1)} style={{ padding: 4 }}><Text style={{ color: theme.textSecondary, fontSize: 11 }}>▼</Text></Pressable>
          </View>
          <Pressable accessibilityLabel="Retirer" hitSlop={6} onPress={() => onChange(items.length > 1 ? items.filter((_, j) => j !== i) : [''])} style={{ padding: 6 }}>
            <Icon name={icons.close} size={13} color={theme.textSecondary} />
          </Pressable>
        </View>
      ))}
      <Pressable accessibilityRole="button" onPress={() => onChange([...items, ''])} style={({ pressed }) => ({ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.row, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: pressed ? theme.bgHover : theme.bgSubtle })}>
        <Icon name={icons.plus} size={12} color={theme.accent} />
        <Text style={{ ...type.bodySemi, fontSize: 13, color: theme.textMain }}>Ajouter une ligne</Text>
      </Pressable>
    </View>
  );
}
