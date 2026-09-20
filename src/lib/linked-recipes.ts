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

/**
 * L'ingredient qui *nomme* une sous-recette — « Ater (sirop de sucre) » dans
 * le Beklewa, « Sauce skyr » dans le poisson — ne va pas aux courses : on
 * n'achete pas de l'Ater, on achete son sucre. Ses propres ingredients le
 * remplacent. Reconnu par le titre complet ou par le nom court sans parenthese.
 */
export function nommeUneSousRecette(ingredient: string, sousRecettes: Recipe[]): boolean {
  const nom = normalizeString(ingredient.replace(/^[\d½¼¾⅓⅔.,/\s-]+(?:[a-zé]+\.?\s+)?(?:de\s|d')?/i, ''));
  if (!nom) return false;
  return sousRecettes.some((s) => {
    const complet = normalizeString(s.title);
    const court = normalizeString(s.title.replace(/\s*\(.*?\)\s*/g, ' ').trim());
    return nom === complet || nom === court || complet.includes(nom) || (court.length > 3 && nom.includes(court));
  });
}
