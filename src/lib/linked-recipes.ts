import { normalizeString } from '@/lib/format';
import type { Recipe } from '@/lib/types';

/**
 * Sous-recettes d'une recette : l'Ater du Beklewa, la tapenade des pates, la
 * sauce skyr du poisson.
 *
 * Deux sources, comme sur le site : la liste `related_recipes` enregistree par
 * l'admin, et les recettes secondaires citees par leur titre dans un ingredient
 * ou une etape. On ne garde que les **secondaires** pour la citation par titre :
 * un plat qui mentionne un autre plat ne doit pas verser ses courses avec lui.
 */
export function sousRecettesDe(recipe: Recipe, toutes: Recipe[]): Recipe[] {
  const parId = new Map(toutes.map((r) => [r.id, r]));
  const trouvees = new Map<string, Recipe>();

  for (const lien of recipe.related_recipes ?? []) {
    const r = lien?.id ? parId.get(lien.id) : undefined;
    if (r && r.id !== recipe.id) trouvees.set(r.id, r);
  }

  const texte = normalizeString(
    [...(recipe.ingredients ?? []), recipe.instructions ?? ''].join(' ')
  );
  for (const r of toutes) {
    if (r.id === recipe.id || !r.is_secondary || r.title.length <= 3) continue;
    if (texte.includes(normalizeString(r.title))) trouvees.set(r.id, r);
  }

  return Array.from(trouvees.values());
}
