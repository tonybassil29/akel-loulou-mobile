import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

/**
 * Favoris : stockes sur l'appareil uniquement (comme sur le site), donc
 * disponibles hors ligne et sans compte.
 */
const KEY = 'akel-loulou.favorites';

let cache: string[] | null = null;
const listeners = new Set<(ids: string[]) => void>();

async function read(): Promise<string[]> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

async function write(ids: string[]) {
  cache = ids;
  listeners.forEach((l) => l(ids));
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Un echec d'ecriture ne doit pas casser l'interaction : l'etat en memoire
    // reste correct pour la session en cours.
  }
}

export function useFavorites() {
  const [ids, setIds] = useState<string[] | null>(cache);

  useEffect(() => {
    let alive = true;
    read().then((v) => alive && setIds(v));
    listeners.add(setIds);
    return () => {
      alive = false;
      listeners.delete(setIds);
    };
  }, []);

  const toggle = useCallback(async (id: string) => {
    const current = await read();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    await write(next);
  }, []);

  return {
    /** null tant que le stockage n'a pas repondu — evite un flash "aucun favori". */
    favorites: ids,
    isFavorite: (id: string) => (ids ?? []).includes(id),
    toggleFavorite: toggle,
  };
}
