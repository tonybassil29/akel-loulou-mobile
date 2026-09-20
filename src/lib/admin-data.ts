import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Equipment, Recipe } from '@/lib/types';

/**
 * Ecritures de l'admin : recettes, suggestions, reglages, photos.
 * Toutes passent par le JWT de la session — la base refuse sans lui (RLS).
 */

export type RecipeInput = Omit<Recipe, 'id' | 'created_at' | 'updated_at'>;

export interface Suggestion {
  id: number;
  user_name: string | null;
  recipe_name: string;
  description: string | null;
  created_at: string;
}

/** Invalide tout ce qui montre des recettes : listes, fiches, reglages. */
function useInvalidateAll() {
  const qc = useQueryClient();
  return () =>
    qc.invalidateQueries({
      predicate: (q) => ['recipes', 'recipe', 'setting', 'settings', 'suggestions'].includes(String(q.queryKey[0])),
    });
}

export function useSaveRecipe() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | null; data: RecipeInput }) => {
      if (id) {
        const { error } = await supabase.from('recipes').update(data).eq('id', id);
        if (error) throw new Error(error.message);
        return id;
      }
      const { data: rows, error } = await supabase.from('recipes').insert([{ ...data, hidden: data.hidden ?? false }]).select('id');
      if (error) throw new Error(error.message);
      return rows?.[0]?.id as string;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteRecipe() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

export function useSetHidden() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async ({ id, hidden }: { id: string; hidden: boolean }) => {
      const { error } = await supabase.from('recipes').update({ hidden }).eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

export function useSuggestions(enabled: boolean) {
  return useQuery({
    queryKey: ['suggestions'],
    enabled,
    queryFn: async (): Promise<Suggestion[]> => {
      const { data, error } = await supabase
        .from('recipe_suggestions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Suggestion[];
    },
  });
}

export function useDeleteSuggestion() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('recipe_suggestions').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

/** Ecrit une entree de `settings` (en-tete, A propos, epices, materiel...). */
export function useSaveSetting() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

/**
 * Envoi d'une photo vers Cloudinary, en upload non signe — le meme preset que
 * le site. La cle n'est pas un secret : c'est le preset qui borne ce qu'on peut
 * faire (des images, dans ce dossier, rien d'autre).
 */
export async function uploadToCloudinary(uri: string): Promise<string> {
  const cloud = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'dtv0rzcra';
  const preset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'mon_preset_image';
  const form = new FormData();
  const nom = uri.split('/').pop() ?? 'photo.jpg';
  const ext = (nom.split('.').pop() ?? 'jpg').toLowerCase();
  form.append('file', { uri, name: nom, type: `image/${ext === 'jpg' ? 'jpeg' : ext}` } as unknown as Blob);
  form.append('upload_preset', preset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Cloudinary ${res.status}`);
  const json = (await res.json()) as { secure_url: string };
  return json.secure_url;
}

export type { Equipment };
