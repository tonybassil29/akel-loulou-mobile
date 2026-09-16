import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

export function useRecipes(includeHidden = false) {
  return useQuery({
    queryKey: queryKeys.recipes(includeHidden),
    queryFn: () => fetchRecipes(includeHidden),
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
      return undefined;
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
    mutationFn: async (payload: { title: string; description: string; author?: string }) => {
      const { error } = await supabase.from('recipe_suggestions').insert({
        title: payload.title,
        description: payload.description,
        author: payload.author || null,
      });
      if (error) throw new Error(error.message);
    },
  });
}

export function useSuggestions() {
  return useQuery({
    queryKey: queryKeys.suggestions(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_suggestions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

// -------------------------------------------------------------- admin write

export function useSaveRecipe() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (recipe: Partial<Recipe> & { id?: string }) => {
      const { data, error } = recipe.id
        ? await supabase.from('recipes').update(recipe).eq('id', recipe.id).select().single()
        : await supabase.from('recipes').insert(recipe).select().single();
      if (error) throw new Error(error.message);
      return data as Recipe;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['recipes'] });
      client.invalidateQueries({ queryKey: ['recipe'] });
    },
  });
}

export function useDeleteRecipe() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

export function useToggleRecipeHidden() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, hidden }: { id: string; hidden: boolean }) => {
      const { error } = await supabase.from('recipes').update({ hidden }).eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['recipes'] }),
  });
}
