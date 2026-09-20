import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

/**
 * Frigo IA : le client de la fonction Edge `frigo-ia`, et la memoire de la
 * conversation.
 *
 * La conversation vit hors des composants — meme motif que les filtres — parce
 * que la fiche d'une proposition est un ecran empile : il doit retrouver la
 * proposition sans qu'on lui passe tout l'objet dans l'URL. Rien n'est persiste :
 * un frigo change tous les jours.
 */
export interface Proposition {
  titre: string;
  resume: string;
  temps: string;
  difficulte: string;
  ingredients_utilises: string[];
  basiques_utilises: string[];
  carnet?: boolean;
  source?: { titre: string; url: string } | null;
}

export interface DetailRecette {
  titre: string;
  portions: string;
  temps: string;
  ingredients: string[];
  etapes: string[];
  conseil?: string | null;
  source?: { titre: string; url: string } | null;
}

export interface Echange {
  id: string;
  message: string;
  etat: 'en_cours' | 'ok' | 'erreur';
  ingredients: string[];
  propositions: Proposition[];
  rejetees: number;
  /** false = reponse « de memoire », la recherche web n'etait pas disponible. */
  recherche_web?: boolean;
  erreur?: string;
}

interface Etat {
  echanges: Echange[];
  details: Record<string, DetailRecette | 'en_cours' | { erreur: string }>;
}

let cache: Etat = { echanges: [], details: {} };
const listeners = new Set<(e: Etat) => void>();
const publier = () => listeners.forEach((l) => l(cache));

const cleDetail = (e: Echange, p: Proposition) => `${e.id}::${p.titre}`;

async function appeler<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('frigo-ia', { body });
  if (error) {
    // Le corps d'erreur de la fonction porte un message lisible.
    let message = error.message;
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx) message = (await ctx.json()).erreur ?? message;
    } catch {
      /* on garde le message brut */
    }
    throw new Error(message);
  }
  if ((data as { erreur?: string })?.erreur) throw new Error((data as { erreur: string }).erreur);
  return data as T;
}

export async function demander(message: string) {
  const id = `${Date.now()}`;
  const echange: Echange = { id, message, etat: 'en_cours', ingredients: [], propositions: [], rejetees: 0 };
  cache = { ...cache, echanges: [...cache.echanges, echange] };
  publier();
  try {
    const r = await appeler<{ ingredients: string[]; propositions: Proposition[]; rejetees: number; recherche_web?: boolean }>({
      action: 'proposer',
      message,
    });
    cache = {
      ...cache,
      echanges: cache.echanges.map((e) =>
        e.id === id ? { ...e, etat: 'ok', ingredients: r.ingredients, propositions: r.propositions, rejetees: r.rejetees, recherche_web: r.recherche_web } : e
      ),
    };
  } catch (e) {
    cache = {
      ...cache,
      echanges: cache.echanges.map((x) => (x.id === id ? { ...x, etat: 'erreur', erreur: (e as Error).message } : x)),
    };
  }
  publier();
}

export async function detailler(echange: Echange, proposition: Proposition) {
  const cle = cleDetail(echange, proposition);
  if (cache.details[cle] && cache.details[cle] !== 'en_cours' && !('erreur' in (cache.details[cle] as object))) return;
  cache = { ...cache, details: { ...cache.details, [cle]: 'en_cours' } };
  publier();
  try {
    const d = await appeler<DetailRecette>({
      action: 'detail',
      titre: proposition.titre,
      ingredients: echange.ingredients,
      source: proposition.source?.url ?? null,
    });
    cache = { ...cache, details: { ...cache.details, [cle]: d } };
  } catch (e) {
    cache = { ...cache, details: { ...cache.details, [cle]: { erreur: (e as Error).message } } };
  }
  publier();
}

export function effacer() {
  cache = { echanges: [], details: {} };
  publier();
}

export function useFrigoIa() {
  const [etat, setEtat] = useState<Etat>(cache);
  useEffect(() => {
    listeners.add(setEtat);
    setEtat(cache);
    return () => {
      listeners.delete(setEtat);
    };
  }, []);

  const trouver = useCallback((echangeId: string, titre: string) => {
    const e = etat.echanges.find((x) => x.id === echangeId);
    const p = e?.propositions.find((x) => x.titre === titre);
    return e && p ? { echange: e, proposition: p, detail: etat.details[cleDetail(e, p)] } : null;
  }, [etat]);

  return { ...etat, demander, detailler, effacer, trouver };
}
