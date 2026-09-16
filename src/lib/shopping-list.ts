import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { ingredientName } from './ingredient-images';
import { normalizeString } from './format';

/**
 * Liste de courses. Elle vit uniquement sur l'appareil : c'est une note
 * personnelle, pas une donnee a envoyer sur un serveur. Elle reste donc
 * disponible en magasin, sans reseau.
 */
export interface ShoppingItem {
  /** Cle stable derivee du libelle, pour ne pas ajouter deux fois la meme chose. */
  id: string;
  label: string;
  checked: boolean;
  /** Recette d'origine, pour pouvoir retirer tout un plat d'un coup. */
  recipeId: string;
  recipeTitle: string;
}

const KEY = 'akel-loulou.shopping-list';

let cache: ShoppingItem[] | null = null;
const listeners = new Set<(items: ShoppingItem[]) => void>();

async function read(): Promise<ShoppingItem[]> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as ShoppingItem[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

async function write(items: ShoppingItem[]) {
  cache = items;
  listeners.forEach((l) => l(items));
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // L'etat en memoire reste juste pour la session en cours.
  }
}

const makeId = (label: string) => normalizeString(ingredientName(label)).replace(/\s+/g, '-');

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[] | null>(cache);

  useEffect(() => {
    let alive = true;
    read().then((v) => alive && setItems(v));
    listeners.add(setItems);
    return () => {
      alive = false;
      listeners.delete(setItems);
    };
  }, []);

  const addMany = useCallback(
    async (labels: string[], recipeId: string, recipeTitle: string) => {
      const current = await read();
      const known = new Set(current.map((i) => i.id));
      const added = labels
        .map((label) => ({
          id: makeId(label),
          label: ingredientName(label),
          checked: false,
          recipeId,
          recipeTitle,
        }))
        // Un ingredient deja present n'est pas duplique, meme venant d'une autre recette.
        .filter((item) => item.label && !known.has(item.id));
      await write([...current, ...added]);
      return added.length;
    },
    []
  );

  const toggle = useCallback(async (id: string) => {
    const current = await read();
    await write(current.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  }, []);

  const remove = useCallback(async (id: string) => {
    const current = await read();
    await write(current.filter((i) => i.id !== id));
  }, []);

  const clearChecked = useCallback(async () => {
    const current = await read();
    await write(current.filter((i) => !i.checked));
  }, []);

  const clearAll = useCallback(async () => write([]), []);

  return {
    /** null tant que le stockage n'a pas repondu — evite un faux "liste vide". */
    items,
    addMany,
    toggle,
    remove,
    clearChecked,
    clearAll,
    count: items?.length ?? 0,
    remaining: items?.filter((i) => !i.checked).length ?? 0,
  };
}
