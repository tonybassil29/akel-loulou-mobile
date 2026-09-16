import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

/**
 * Le planning de la semaine. Comme les favoris, le frigo et la liste de
 * courses, il ne quitte jamais l'appareil.
 *
 * Choix assume, different du site : on stocke des identifiants de recette, pas
 * l'objet complet. Le site fige une copie de la recette dans chaque case, donc
 * une photo ou un titre corriges plus tard n'apparaissent jamais dans le menu.
 */

export const DAYS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
] as const;

export type MealSlot = 'midi' | 'gouter' | 'soir';

export const SLOTS: readonly { id: MealSlot; label: string }[] = [
  { id: 'midi', label: 'Midi' },
  { id: 'gouter', label: 'Goûter' },
  { id: 'soir', label: 'Soir' },
];

/** jour (0 = lundi) -> creneau -> identifiants de recette. */
export type WeekPlan = Record<number, Partial<Record<MealSlot, string[]>>>;

interface Stored {
  v: 1;
  plan: WeekPlan;
}

const KEY = 'akel-loulou.week-plan';

let cache: WeekPlan | null = null;
const listeners = new Set<(plan: WeekPlan) => void>();

/**
 * Un planning a moitie ecrit ferait planter l'ecran au premier acces
 * (`plan[0].midi.map`), contrairement a un tableau de favoris casse qui reste
 * inoffensif. On revalide donc la forme a la lecture.
 */
function sanitize(raw: unknown): WeekPlan {
  const plan: WeekPlan = {};
  if (!raw || typeof raw !== 'object') return plan;
  const stored = raw as Partial<Stored>;
  if (stored.v !== 1 || !stored.plan || typeof stored.plan !== 'object') return plan;

  for (let day = 0; day < DAYS.length; day += 1) {
    const slots = (stored.plan as WeekPlan)[day];
    if (!slots || typeof slots !== 'object') continue;
    for (const { id } of SLOTS) {
      const ids = slots[id];
      if (!Array.isArray(ids)) continue;
      const clean = ids.filter((v): v is string => typeof v === 'string' && v.length > 0);
      if (clean.length > 0) {
        plan[day] = { ...plan[day], [id]: clean };
      }
    }
  }
  return plan;
}

async function read(): Promise<WeekPlan> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? sanitize(JSON.parse(raw)) : {};
  } catch {
    cache = {};
  }
  return cache;
}

async function write(plan: WeekPlan) {
  cache = plan;
  listeners.forEach((l) => l(plan));
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify({ v: 1, plan } satisfies Stored));
  } catch {
    // L'etat en memoire reste juste pour la session en cours.
  }
}

function countMeals(plan: WeekPlan): number {
  return Object.values(plan).reduce(
    (total, slots) =>
      total + SLOTS.reduce((n, { id }) => n + (slots?.[id]?.length ?? 0), 0),
    0
  );
}

export function useWeekPlan() {
  const [plan, setPlan] = useState<WeekPlan | null>(cache);

  useEffect(() => {
    let alive = true;
    read().then((v) => alive && setPlan(v));
    listeners.add(setPlan);
    return () => {
      alive = false;
      listeners.delete(setPlan);
    };
  }, []);

  const add = useCallback(async (day: number, slot: MealSlot, recipeId: string) => {
    const current = await read();
    const existing = current[day]?.[slot] ?? [];
    if (existing.includes(recipeId)) return;
    await write({
      ...current,
      [day]: { ...current[day], [slot]: [...existing, recipeId] },
    });
  }, []);

  const remove = useCallback(async (day: number, slot: MealSlot, recipeId: string) => {
    const current = await read();
    const existing = current[day]?.[slot] ?? [];
    const next = existing.filter((id) => id !== recipeId);
    const slots = { ...current[day] };
    if (next.length > 0) slots[slot] = next;
    else delete slots[slot];
    await write({ ...current, [day]: slots });
  }, []);

  const clear = useCallback(async () => write({}), []);

  return {
    /** null tant que le stockage n'a pas repondu — evite un faux "menu vide". */
    plan,
    add,
    remove,
    clear,
    mealCount: plan ? countMeals(plan) : 0,
  };
}
