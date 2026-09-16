import { Host, Switch } from '@expo/ui';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { Chip } from '@/components/chip';
import { Field } from '@/components/field';
import { Icon, icons } from '@/components/icon';
import { LoadingState } from '@/components/screen-state';
import { SectionHeader } from '@/components/section-header';
import { uploadImage } from '@/lib/cloudinary';
import { heroUrl } from '@/lib/images';
import { useRecipe, useSaveRecipe } from '@/lib/queries';
import type { RecipeCategory } from '@/lib/types';
import { radius, spacing, type, shadow } from '@/theme';
import { useAppTheme } from '@/theme/use-app-theme';

const CATEGORIES: { id: RecipeCategory; label: string }[] = [
  { id: 'plat', label: 'Plat' },
  { id: 'dessert', label: 'Dessert' },
  { id: 'menu_only', label: 'Minute' },
];

export function AdminRecipeFormScreen({ id }: { id?: string }) {
  const theme = useAppTheme();
  const router = useRouter();

  const existing = useRecipe(id);
  const save = useSaveRecipe();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('plat');
  const [country, setCountry] = useState('');
  const [servings, setServings] = useState('4');
  const [imageUrl, setImageUrl] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [spices, setSpices] = useState('');
  const [instructions, setInstructions] = useState('');
  const [tags, setTags] = useState('');
  const [hidden, setHidden] = useState(false);
  const [showPortions, setShowPortions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isHydrated, setIsHydrated] = useState(!id);

  // Pre-remplissage en edition : une seule fois, pour ne pas ecraser la saisie
  // en cours quand la requete se revalide en arriere-plan.
  useEffect(() => {
    if (!id || isHydrated || !existing.data) return;
    const recipe = existing.data;
    setTitle(recipe.title ?? '');
    setDescription(recipe.description ?? '');
    setCategory((recipe.category as RecipeCategory) ?? 'plat');
    setCountry(recipe.country ?? '');
    setServings(String(recipe.servings ?? 4));
    setImageUrl(recipe.image_url ?? '');
    setIngredients((recipe.ingredients ?? []).join('\n'));
    setSpices((recipe.spices ?? []).join(', '));
    setInstructions(recipe.instructions ?? '');
    setTags((recipe.tags ?? []).join(', '));
    setHidden(Boolean(recipe.hidden));
    setShowPortions(Boolean(recipe.show_portions));
    setIsHydrated(true);
  }, [id, existing.data, isHydrated]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Autorise l\'accès aux photos pour changer l\'image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: true,
    });
    if (result.canceled || !result.assets[0]) return;

    setError('');
    setIsUploading(true);
    try {
      setImageUrl(await uploadImage(result.assets[0].uri));
    } catch (uploadError) {
      setError((uploadError as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const canSubmit = title.trim().length > 1 && !save.isPending && !isUploading;

  const submit = () => {
    if (!canSubmit) return;
    setError('');

    const payload = {
      ...(id ? { id } : {}),
      title: title.trim(),
      description: description.trim() || null,
      category,
      country: country.trim() || null,
      servings: Number(servings) || null,
      image_url: imageUrl.trim() || null,
      ingredients: splitLines(ingredients),
      spices: splitList(spices),
      instructions: instructions.trim(),
      tags: splitList(tags),
      hidden,
      show_portions: showPortions,
    };

    save.mutate(payload, {
      // On ne quitte l'ecran qu'apres confirmation de l'ecriture : en cas
      // d'echec le brouillon reste a l'ecran, pret a etre renvoye.
      onSuccess: () => router.back(),
      onError: (mutationError) => setError((mutationError as Error).message),
    });
  };

  if (id && !isHydrated && existing.isLoading) {
    return <LoadingState label="Chargement de la fiche..." />;
  }

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.bgMain }}>
      <Stack.Screen options={{ title: id ? 'Modifier' : 'Nouvelle recette' }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: spacing.gutter,
          paddingBottom: spacing.section * 2,
          gap: spacing.row,
        }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choisir une photo"
          onPress={pickImage}
          style={({ pressed }) => ({
            aspectRatio: 16 / 10,
            borderRadius: radius.lg,
            borderCurve: 'continuous',
            backgroundColor: theme.bgSubtle,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.85 : 1,
            ...shadow(theme.shadowCard),
          })}>
          {imageUrl ? (
            <Image
              source={heroUrl(imageUrl, 900)}
              contentFit="cover"
              style={{ width: '100%', height: '100%' }}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View style={{ alignItems: 'center', gap: spacing.sm }}>
              <Icon name={icons.photo} size={24} color={theme.accent} />
              <Text style={{ ...type.caption, color: theme.textSecondary }}>
                Choisir une photo
              </Text>
            </View>
          )}

          {isUploading ? (
            <View
              style={{
                position: 'absolute',
                inset: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.35)',
              }}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          ) : null}
        </Pressable>

        <Field label="Titre" value={title} onChangeText={setTitle} placeholder="Nom du plat" />
        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Une phrase"
          multiline
          minHeight={70}
        />

        <View style={{ gap: spacing.sm }}>
          <Text style={{ ...type.eyebrow, color: theme.textPlaceholder }}>CATÉGORIE</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {CATEGORIES.map((item) => (
              <Chip
                key={item.id}
                label={item.label}
                selected={category === item.id}
                onPress={() => setCategory(item.id)}
              />
            ))}
          </View>
        </View>

        <Field label="Pays" value={country} onChangeText={setCountry} placeholder="Liban" />
        <Field label="Portions" value={servings} onChangeText={setServings} placeholder="4" />

        <SectionHeader title="Contenu" />
        <Field
          label="Ingrédients (un par ligne)"
          value={ingredients}
          onChangeText={setIngredients}
          placeholder={'200 g de farine\n2 oeufs'}
          multiline
          minHeight={140}
        />
        <Field
          label="Épices (séparées par des virgules)"
          value={spices}
          onChangeText={setSpices}
          placeholder="Sel, poivre, cumin"
        />
        <Field
          label="Préparation (une étape par ligne)"
          value={instructions}
          onChangeText={setInstructions}
          placeholder={'Préchauffer le four\nMélanger…'}
          multiline
          minHeight={180}
        />
        <Field
          label="Tags (séparés par des virgules)"
          value={tags}
          onChangeText={setTags}
          placeholder="rapide, végétarien"
        />

        <SectionHeader title="Affichage" />
        <ToggleRow
          label="Masquer sur le site et l'app"
          value={hidden}
          onValueChange={setHidden}
        />
        <ToggleRow
          label="Afficher le calcul des portions"
          value={showPortions}
          onValueChange={setShowPortions}
        />

        {error ? (
          <Text style={{ ...type.caption, color: '#E5484D' }}>{error}</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit }}
          disabled={!canSubmit}
          onPress={submit}
          style={({ pressed }) => ({
            alignItems: 'center',
            paddingVertical: spacing.row + 2,
            borderRadius: radius.pill,
            backgroundColor: theme.accent,
            opacity: !canSubmit ? 0.4 : pressed ? 0.85 : 1,
          })}>
          <Text style={{ ...type.button, color: theme.btnText }}>
            {save.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  const theme = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.row,
        paddingHorizontal: spacing.row,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        borderCurve: 'continuous',
        backgroundColor: theme.bgCard,
      }}>
      <Text style={{ ...type.body, flex: 1, color: theme.textMain }}>{label}</Text>
      <Host matchContents>
        <Switch value={value} onValueChange={onValueChange} />
      </Host>
    </View>
  );
}

const splitLines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
