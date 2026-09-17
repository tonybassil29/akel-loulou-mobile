import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

/**
 * Apparence choisie dans l'app, independamment du reglage du telephone.
 *
 * Le carnet est pense en clair — photos de plats sur fond rose poudre. Suivre
 * le mode sombre du systeme donnait une app sombre a des gens qui ne l'avaient
 * pas demande. On part donc toujours en clair, et le sombre devient un choix
 * explicite, memorise.
 */
export type Apparence = 'light' | 'dark';

const KEY = 'akel-loulou.apparence';
const DEFAUT: Apparence = 'light';

let cache: Apparence = DEFAUT;
let lu = false;
const listeners = new Set<(a: Apparence) => void>();

async function read(): Promise<Apparence> {
  if (lu) return cache;
  try {
    const brut = await AsyncStorage.getItem(KEY);
    cache = brut === 'dark' ? 'dark' : DEFAUT;
  } catch {
    cache = DEFAUT;
  }
  lu = true;
  return cache;
}

async function write(a: Apparence) {
  cache = a;
  lu = true;
  listeners.forEach((l) => l(a));
  try {
    await AsyncStorage.setItem(KEY, a);
  } catch {
    // Le choix vaut au moins pour la session en cours.
  }
}

export function useApparence() {
  const [apparence, setApparence] = useState<Apparence>(cache);

  useEffect(() => {
    let vivant = true;
    read().then((v) => vivant && setApparence(v));
    listeners.add(setApparence);
    return () => {
      vivant = false;
      listeners.delete(setApparence);
    };
  }, []);

  const choisir = useCallback((a: Apparence) => write(a), []);
  const basculer = useCallback(async () => write((await read()) === 'dark' ? 'light' : 'dark'), []);

  return { apparence, choisir, basculer, estSombre: apparence === 'dark' };
}
