import { normalizeString } from './format';
import { ingredientName } from './ingredient-images';

/**
 * Les rayons de la liste de courses, repris du site. Deux corrections par
 * rapport au web :
 *
 * 1. les mots-cles y sont accentues ("crème", "pâtes", "épices") alors qu'ici
 *    on compare sur du texte normalise — tels quels, ils ne matcheraient jamais
 *    et tout tomberait dans « Autres » ;
 * 2. le web prend le premier rayon trouve, donc « lait de coco » atterrit dans
 *    les produits laitiers a cause de « lait », avant meme d'atteindre les
 *    boissons qui le citent pourtant. Ici le mot-cle le plus long gagne.
 */

export interface Aisle {
  id: string;
  label: string;
}

const KEYWORDS: Record<string, { label: string; words: string[] }> = {
  laitiers: {
    label: 'Produits laitiers 🥛',
    words: [
      'lait', 'beurre', 'creme', 'fromage', 'yaourt', 'oeuf', 'mascarpone',
      'mozzarella', 'parmesan', 'gruyere', 'comte', 'skyr', 'ricotta', 'feta',
      'emmental', 'cheddar', 'chevre',
    ],
  },
  epicerie: {
    label: 'Épicerie sèche 🌾',
    words: [
      'farine', 'sucre', 'sel', 'poivre', 'huile', 'levure', 'pate', 'pates',
      'riz', 'cacao', 'chocolat', 'vanille', 'amande', 'noix', 'miel',
      'vinaigre', 'moutarde', 'bouillon', 'epices', 'curry', 'cumin',
      'paprika', 'semoule', 'lentilles', 'pois chiches', 'quinoa', 'boulgour',
      'bourghoul', 'cafe', 'the', 'biscuit', 'confiture', 'cereales',
      'maizena', 'fecule', 'chapelure', 'sauce soja', 'ketchup', 'mayonnaise',
      'sauce tomate', 'coulis', 'concentre de tomate', 'pesto', 'tapenade',
      'olives', 'cornichons', 'capres', 'vermicelles', 'sesame', 'chipotle',
    ],
  },
  viandes: {
    label: 'Viandes & poissons 🥩',
    words: [
      'poulet', 'boeuf', 'saumon', 'poisson', 'viande', 'jambon', 'porc',
      'veau', 'crevette', 'lardon', 'thon', 'saucisse', 'chorizo', 'dinde',
      'canard', 'agneau', 'merguez', 'bacon', 'pancetta', 'sardine',
      'cabillaud', 'colin', 'truite', 'moule', 'calamar', 'crabe', 'surimi',
    ],
  },
  primeur: {
    label: 'Fruits & légumes 🥦',
    words: [
      'tomate', 'carotte', 'oignon', 'pomme', 'citron', 'banane', 'poivron',
      'ail', 'salade', 'pomme de terre', 'courgette', 'aubergine', 'fraise',
      'framboise', 'poireau', 'champignon', 'epinard', 'avocat', 'brocoli',
      'chou', 'haricot', 'orange', 'kiwi', 'poire', 'peche', 'abricot',
      'prune', 'cerise', 'melon', 'pasteque', 'raisin', 'ananas', 'mangue',
      'grenade', 'figue', 'datte', 'myrtille', 'navet', 'radis', 'celeri',
      'fenouil', 'asperge', 'artichaut', 'petit pois', 'feve', 'mais',
      'potiron', 'butternut', 'patate douce', 'panais', 'betterave',
      'concombre', 'roquette', 'endive', 'echalote', 'ciboulette', 'persil',
      'coriandre', 'menthe', 'basilic', 'thym', 'romarin', 'laurier', 'aneth',
      'gingembre',
    ],
  },
  boulangerie: {
    label: 'Boulangerie 🥖',
    words: [
      'pain', 'baguette', 'croissant', 'brioche', 'biscotte', 'pain de mie',
      'pain pita', 'tortilla', 'wrap', 'pate feuilletee', 'pate brisee',
      'pate a pizza',
    ],
  },
  surgeles: {
    label: 'Surgelés ❄️',
    words: ['glace', 'sorbet', 'glacon', 'frites', 'legumes surgeles', 'poisson pane'],
  },
  boissons: {
    label: 'Boissons 🧃',
    words: [
      'eau', 'jus', 'soda', 'sirop', 'biere', 'vin', 'cidre', 'lait de soja',
      'lait d amande', 'lait d avoine', 'lait de coco', 'lait de riz',
    ],
  },
};

export const AISLES: readonly Aisle[] = [
  ...Object.entries(KEYWORDS).map(([id, { label }]) => ({ id, label })),
  { id: 'autres', label: 'Autres 🧴' },
];

const AUTRES = AISLES[AISLES.length - 1];

/**
 * Tous les mots-cles a plat, du plus long au plus court : « lait de coco » doit
 * l'emporter sur « lait », et « patate douce » sur « pomme de terre ».
 */
const SORTED: readonly { word: string; aisleId: string }[] = Object.entries(KEYWORDS)
  .flatMap(([id, { words }]) =>
    words.map((w) => ({ word: normalizeString(w), aisleId: id }))
  )
  .sort((a, b) => b.word.length - a.word.length);

const byId = new Map(AISLES.map((a) => [a.id, a]));

/** Le rayon d'un ingredient. Accepte un libelle brut, quantite comprise. */
export function aisleOf(label: string): Aisle {
  const text = normalizeString(ingredientName(label));
  if (!text) return AUTRES;
  const hit = SORTED.find(({ word }) => text.includes(word));
  return (hit && byId.get(hit.aisleId)) || AUTRES;
}

/** L'eau ne s'achete pas : on ne la met jamais dans la liste de courses. */
export function isWater(label: string): boolean {
  const text = normalizeString(ingredientName(label));
  return text === 'eau' || text === 'eau froide' || text === 'eau chaude' || text === 'eau tiede';
}
