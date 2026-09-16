/** Minuscules, sans accents, sans ligatures — pour comparer et rechercher. */
export function normalizeString(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .trim();
}

/** Retire le drapeau emoji d'un nom de pays pour pouvoir regrouper dessus. */
export function normalizeCountryName(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim();
}

/**
 * Multiplie les quantites d'un ingredient par un facteur de portions.
 * "200 g de farine" x2 -> "400 g de farine". Les fractions unicode courantes
 * sont converties avant le calcul, et le resultat est arrondi a 2 decimales.
 */
const FRACTIONS: Record<string, number> = {
  '½': 0.5,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '¼': 0.25,
  '¾': 0.75,
};

export function scaleIngredient(text: string, factor: number): string {
  if (!text || factor === 1) return text;

  const expanded = text.replace(/[½⅓⅔¼¾]/g, (m) => String(FRACTIONS[m]));

  return expanded.replace(/(\d+(?:[.,]\d+)?)/g, (match) => {
    const value = parseFloat(match.replace(',', '.'));
    if (!Number.isFinite(value)) return match;
    const scaled = value * factor;
    // Un entier reste un entier ; sinon 2 decimales maximum, sans zeros inutiles.
    const rounded = Math.round(scaled * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace('.', ',');
  });
}

/** Decoupe le champ `instructions` (texte multi-lignes) en etapes numerotees. */
export function parseInstructions(instructions: string | null | undefined): string[] {
  if (!instructions) return [];
  return instructions
    .split('\n')
    .map((line) => line.replace(/^\s*\d+[.)-]?\s*/, '').trim())
    .filter(Boolean);
}

/** Titre -> identifiant d'URL ("Pates aux olives" -> "pates-aux-olives"). */
export function slugify(title: string): string {
  return normalizeString(title)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
