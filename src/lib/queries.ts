import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import fallbackRecipes from '../assets/fallback-recipes.json';
import { supabase } from './supabase';
import type {
  AboutSettings,
  Equipment,
  GalleryItem,
  HeaderSettings,
  Recipe,
} from './types';

export const queryKeys = {
  recipes: (includeHidden: boolean) => ['recipes', { includeHidden }] as const,
  recipe: (id: string) => ['recipe', id] as const,
  gallery: () => ['gallery'] as const,
  setting: (key: string) => ['setting', key] as const,
  suggestions: () => ['suggestions'] as const,
};

// ------------------------------------------------------------------ recipes

async function fetchRecipes(includeHidden: boolean): Promise<Recipe[]> {
  let query = supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  // Le public ne voit ni les recettes masquees ni les "secondaires" (sous-recettes
  // referencees depuis une autre recette) ; l'admin voit tout.
  if (!includeHidden) {
    query = query
      .or('hidden.eq.false,hidden.is.null')
      .or('is_secondary.eq.false,is_secondary.is.null');
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Recipe[];
}

/**
 * Carnet embarque a la compilation. Il ne sert qu'a un cas precis : le tout
 * premier lancement sans reseau, ou le cache persiste est encore vide. Sans
 * lui, l'app s'ouvrirait sur « Connexion impossible » — ce que verrait un
 * relecteur App Store en mode avion. Des qu'une reponse arrive du serveur,
 * c'est elle qui fait foi. Regenerable par scripts/build-fallback-recipes.mjs.
 */
const FALLBACK_RECIPES = fallbackRecipes as unknown as Recipe[];

export function useRecipes(includeHidden = false) {
  return useQuery({
    queryKey: queryKeys.recipes(includeHidden),
    queryFn: () => fetchRecipes(includeHidden),
    // `placeholderData` plutot qu'un repli sur `isError` : hors ligne, la
    // requete reste longtemps en cours (elle retente) avant d'echouer, et
    // l'ecran resterait sur un spinner. Le placeholder s'affiche tout de suite,
    // n'est jamais ecrit dans le cache, et disparait des la premiere reponse
    // reelle — y compris celle restauree depuis le cache persiste.
    placeholderData: includeHidden ? undefined : FALLBACK_RECIPES,
  });
}

/**
 * Une recette seule. On sert d'abord celle deja presente dans la liste en cache
 * pour que l'ecran de detail s'affiche immediatement, puis on rafraichit.
 */
export function useRecipe(id: string | undefined) {
  const client = useQueryClient();

  return useQuery({
    queryKey: queryKeys.recipe(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as Recipe | null;
    },
    initialData: () => {
      if (!id) return undefined;
      for (const includeHidden of [false, true]) {
        const list = client.getQueryData<Recipe[]>(queryKeys.recipes(includeHidden));
        const hit = list?.find((r) => r.id === id);
        if (hit) return hit;
      }
      // Hors ligne au premier lancement : la fiche doit s'ouvrir quand meme.
      return FALLBACK_RECIPES.find((r) => r.id === id);
    },
  });
}

// ------------------------------------------------------------------ gallery

export function useGallery() {
  return useQuery({
    queryKey: queryKeys.gallery(),
    queryFn: async (): Promise<GalleryItem[]> => {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as GalleryItem[];
    },
  });
}

// ----------------------------------------------------------------- settings

/**
 * La table `settings` est un magasin cle -> JSON : en-tete, page A propos,
 * materiel, epices, images d'ingredients personnalisees, logo.
 */
function useSetting<T>(key: string, fallback: T) {
  return useQuery({
    queryKey: queryKeys.setting(key),
    // Ces valeurs bougent rarement : on evite de les refetcher a chaque ecran.
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<T> => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data?.value as T) ?? fallback;
    },
  });
}

export const useHeaderSettings = () =>
  useSetting<HeaderSettings>('header', {
    topBadge: 'Cuisine maison',
    titlePart1: 'Akel ',
    titleHighlight: 'Loulou',
    subtitle: 'Des recettes simples, savoureuses & gourmandes',
  });

export const useAboutSettings = () => useSetting<AboutSettings>('about', {});
export const useGlobalSpices = () => useSetting<string[]>('all_spices', []);
export const useGlobalEquipment = () => useSetting<Equipment[]>('all_equipment', []);
export const useCustomIngredientImages = () =>
  useSetting<Record<string, string>>('custom_ingredient_images', {});

// -------------------------------------------------------------- suggestions

export function useSendSuggestion() {
  return useMutation({
    mutationFn: async (payload: { title: string; description: string }) => {
      // Minimisation : on n'envoie que ce que la personne a volontairement ecrit,
      // aucun identifiant ni nom (5.1.1(iii) Data Minimization).
      // La colonne s'appelle `recipe_name` cote base — envoyer `title` faisait
      // echouer chaque insertion en silence pour la personne qui suggerait.
      // `user_name` reste vide : on ne demande aucune identite (5.1.1(iii)).
      const { error } = await supabase.from('recipe_suggestions').insert({
        recipe_name: payload.title,
        description: payload.description || null,
      });
      if (error) throw new Error(error.message);
    },
  });
}
