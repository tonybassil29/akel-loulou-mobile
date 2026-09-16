import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { getCoreWords } from './fridge-match';

/**
 * Ce qu'on a declare avoir dans son frigo. Comme les favoris et la liste de
 * courses, ca ne quitte jamais l'appareil.
 */
const KEY = 'akel-loulou.fridge';

let cache: string[] | null = null;
const listeners = new Set<(items: string[]) => void>();

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

async function write(items: string[]) {
  cache = items;
  listeners.forEach((l) => l(items));
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // L'etat en memoire reste juste pour la session en cours.
  }
}

/** Cle de comparaison : "Oignons" et "oignon" designent la meme chose. */
const key = (label: string) => [...getCoreWords(label)].sort().join(' ');

export function useFridge() {
  const [ingredients, setIngredients] = useState<string[] | null>(cache);

  useEffect(() => {
    let alive = true;
    read().then((v) => alive && setIngredients(v));
    listeners.add(setIngredients);
    return () => {
      alive = false;
      listeners.delete(setIngredients);
    };
  }, []);

  const add = useCallback(async (label: string) => {
    const clean = label.trim();
    if (!clean) return;
    const current = await read();
    const k = key(clean);
    if (!k || current.some((i) => key(i) === k)) return;
    await write([...current, clean]);
  }, []);

  const remove = useCallback(async (label: string) => {
    const current = await read();
    const k = key(label);
    await write(current.filter((i) => key(i) !== k));
  }, []);

  const toggle = useCallback(async (label: string) => {
    const current = await read();
    const k = key(label);
    if (current.some((i) => key(i) === k)) await write(current.filter((i) => key(i) !== k));
    else await write([...current, label.trim()]);
  }, []);

  const clear = useCallback(async () => write([]), []);

  return {
    /** null tant que le stockage n'a pas repondu — evite un faux "frigo vide". */
    ingredients,
    add,
    remove,
    toggle,
    clear,
    has: (label: string) => (ingredients ?? []).some((i) => key(i) === key(label)),
    count: ingredients?.length ?? 0,
  };
}
