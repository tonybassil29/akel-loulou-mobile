import { normalizeString } from './format';
import type { Recipe } from './types';

/**
 * Correspondance entre ce qu'on a dans le frigo et les ingredients d'une recette.
 * Portage de l'algorithme du site (src/components/FrigoMagique.tsx), avec deux
 * corrections mesurees sur les donnees reelles : gestion des pluriels, et
 * classement par nombre d'ingredients manquants plutot qu'un seuil a 50 %.
 */

/** Mots a ignorer : unites, articles, conditionnements. */
const STOP_WORDS = new Set([
  'de', 'd', 'des', 'du', 'la', 'le', 'les', 'un', 'une',
  'g', 'kg', 'ml', 'cl', 'l',
  'cuillere', 'cuilleres', 'cas', 'cac', 'pincee', 'verre', 'verres',
  'tasse', 'tasses', 'poignee', 'morceau', 'tranche', 'tranches',
  'gousse', 'gousses', 'botte', 'boite', 'boites', 'brique', 'briques',
  'sachet', 'sachets', 'filet', 'zeste', 'jus', 'poudre', 'extrait',
  'goutte', 'gouttes',
]);

/** Mots dont le "s" final fait partie du mot : on ne le retire pas. */
const PLURAL_EXCEPTIONS = new Set([
  'pois', 'ananas', 'mais', 'radis', 'jus', 'cassis', 'souris',
  'epices', 'herbes', 'riz', 'anis', 'couscous', 'houmous',
]);

/**
 * La base contient a la fois "oignon" et "oignons" : sans cette etape, ce sont
 * deux ingredients differents et le frigo rate la moitie des correspondances.
 */
function singular(word: string): string {
  return word.length > 3 && word.endsWith('s') && !PLURAL_EXCEPTIONS.has(word)
    ? word.slice(0, -1)
    : word;
}

/** Les mots porteurs de sens d'un libelle : "200 g de farine" -> {farine}. */
export function getCoreWords(text: string): Set<string> {
  return new Set(
    normalizeString(text)
      .split(/[\s,.'’\-]+/)
      // On jette aussi "175g", "300ml", "1/2" : la quantite collee a l'unite
      // n'est pas un ingredient, et elle polluait la liste des suggestions.
      .filter((w) => w.length > 1 && !/^\d/.test(w) && !STOP_WORDS.has(w))
      .map(singular)
  );
}

/**
 * Paires [base, qualificatif] ou la base seule ne remplace pas la version
 * qualifiee, ni l'inverse : avoir du lait ne permet pas une recette au lait de
 * coco, et avoir du lait de coco ne remplace pas du lait.
 */
const VARIANT_EXCLUSIONS: readonly (readonly [string, string])[] = [
  ['riz', 'souffle'], ['lait', 'coco'], ['lait', 'amande'], ['lait', 'concentre'],
  ['chocolat', 'blanc'], ['chocolat', 'noir'], ['huile', 'olive'], ['huile', 'sesame'],
  ['creme', 'fraiche'], ['creme', 'liquide'], ['sucre', 'glace'], ['sucre', 'vanille'],
  ['farine', 'complete'], ['beurre', 'cacahuete'], ['sauce', 'soja'], ['sauce', 'tomate'],
  ['vinaigre', 'balsamique'], ['fromage', 'blanc'], ['pate', 'feuilletee'],
  ['pate', 'brisee'], ['pomme', 'terre'], ['haricot', 'vert'], ['oignon', 'rouge'],
  ['poivre', 'moulu'],
];

function isExcludedVariant(user: Set<string>, recipe: Set<string>): boolean {
  return VARIANT_EXCLUSIONS.some(([base, qualifier]) => {
    if (!user.has(base) || !recipe.has(base)) return false;
    const userQualified = user.has(qualifier);
    const recipeQualified = recipe.has(qualifier);
    return userQualified !== recipeQualified;
  });
}

/** Cas particuliers que l'inclusion de mots ne saurait pas distinguer. */
function isHardExclusion(user: Set<string>, recipe: Set<string>): boolean {
  if (user.has('eau') && (recipe.has('rose') || recipe.has('oranger') || recipe.has('vie'))) {
    return true;
  }
  if (user.has('creme') && (recipe.has('anglaise') || recipe.has('patissiere'))) {
    return true;
  }
  return false;
}

export function isIngredientMatch(userIngredient: string, recipeIngredient: string): boolean {
  const user = getCoreWords(userIngredient);
  const recipe = getCoreWords(recipeIngredient);
  if (user.size === 0 || recipe.size === 0) return false;

  const same = user.size === recipe.size && [...user].every((w) => recipe.has(w));
  if (same) return true;

  if (isHardExclusion(user, recipe)) return false;
  if (isExcludedVariant(user, recipe)) return false;

  // Inclusion dans les deux sens : "tapenade" couvre "tapenade d'olives",
  // et "tapenade d'olives" couvre "tapenade".
  const userInRecipe = [...user].every((w) => recipe.has(w));
  const recipeInUser = [...recipe].every((w) => user.has(w));
  return userInRecipe || recipeInUser;
}

/** Ingredients qu'on suppose toujours presents dans une cuisine. */
export const STAPLES = ['sel', 'poivre', 'eau', 'huile', 'epices', 'vinaigre'] as const;

export interface MatchResult {
  recipe: Recipe;
  /** Ingredients de la recette couverts par le frigo. */
  matched: string[];
  /** Ingredients couverts par les basiques. */
  staplesUsed: string[];
  missing: string[];
  ratio: number;
}

/**
 * Classe les recettes realisables. On retient des qu'un vrai ingredient du
 * frigo est utilise — les basiques seuls ne suffisent jamais, sinon "sel"
 * remonterait tout le carnet.
 *
 * Le tri met en tete ce qui manque le moins : la question posee est
 * « qu'est-ce que je peux cuisiner en achetant le moins possible ? ».
 */
export function matchRecipes(userIngredients: string[], recipes: Recipe[]): MatchResult[] {
  if (userIngredients.length === 0) return [];

  const results: MatchResult[] = [];

  for (const recipe of recipes) {
    const ingredients = (recipe.ingredients ?? []).filter(Boolean);
    if (ingredients.length === 0) continue;

    const matched: string[] = [];
    const staplesUsed: string[] = [];
    const missing: string[] = [];

    for (const ingredient of ingredients) {
      if (userIngredients.some((u) => isIngredientMatch(u, ingredient))) {
        matched.push(ingredient);
      } else if (STAPLES.some((s) => isIngredientMatch(s, ingredient))) {
        staplesUsed.push(ingredient);
      } else {
        missing.push(ingredient);
      }
    }

    if (matched.length === 0) continue;

    results.push({
      recipe,
      matched,
      staplesUsed,
      missing,
      ratio: (matched.length + staplesUsed.length) / ingredients.length,
    });
  }

  return results.sort(
    (a, b) =>
      a.missing.length - b.missing.length ||
      b.ratio - a.ratio ||
      b.matched.length - a.matched.length
  );
}

/**
 * Les ingredients les plus frequents du carnet, dedoublonnes sur le singulier,
 * pour proposer une liste a cocher plutot qu'une saisie a l'aveugle.
 */
export function suggestIngredients(recipes: Recipe[], limit = 30): string[] {
  const counts = new Map<string, { label: string; n: number }>();

  for (const recipe of recipes) {
    for (const raw of recipe.ingredients ?? []) {
      const words = [...getCoreWords(raw)];
      if (words.length === 0) continue;
      const key = words.join(' ');
      const existing = counts.get(key);
      if (existing) existing.n += 1;
      else counts.set(key, { label: words.join(' '), n: 1 });
    }
  }

  return [...counts.values()]
    // Inutile de proposer de cocher "sel" ou "eau" : ils sont deja supposes
    // presents, et les cocher ne changerait aucun resultat.
    .filter((e) => !e.label.split(' ').every((w) => (STAPLES as readonly string[]).includes(w)))
    .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label))
    .slice(0, limit)
    .map((e) => e.label);
}
