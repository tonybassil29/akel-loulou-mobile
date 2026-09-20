import { useCallback, useEffect, useState } from 'react';

/**
 * Filtre tag de l'ecran Recettes.
 *
 * Ils vivent hors du composant parce que la feuille de selection est un ecran
 * empile : elle ne peut pas remonter une valeur a l'ecran precedent. Meme motif
 * que les favoris — un cache module et un jeu d'abonnes — mais sans
 * persistance : un filtre ne doit pas survivre au redemarrage de l'app.
 */
export interface HomeFilters {
  tag: string;
}

let cache: HomeFilters = { tag: 'all' };
const listeners = new Set<(f: HomeFilters) => void>();

export function setHomeFilter(key: keyof HomeFilters, value: string) {
  cache = { ...cache, [key]: value };
  listeners.forEach((l) => l(cache));
}

export function resetHomeFilters() {
  cache = { tag: 'all' };
  listeners.forEach((l) => l(cache));
}

export function useHomeFilters() {
  const [filters, setFilters] = useState<HomeFilters>(cache);

  useEffect(() => {
    listeners.add(setFilters);
    setFilters(cache);
    return () => {
      listeners.delete(setFilters);
    };
  }, []);

  const set = useCallback((key: keyof HomeFilters, value: string) => setHomeFilter(key, value), []);
  const reset = useCallback(() => resetHomeFilters(), []);

  return { ...filters, set, reset };
}
