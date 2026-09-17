/**
 * Image d'un ingredient. Meme table que le site (src/components/Recipe.tsx) :
 * un dictionnaire francais -> visuel TheMealDB, complete par une deduction sur
 * le nom nettoye de sa quantite. Les images personnalisees stockees dans
 * settings.custom_ingredient_images ont toujours la priorite.
 */

/**
 * Attention : chaque visuel ajoute ici doit etre verifie a l'oeil. La table
 * d'origine contenait vingt-huit photos d'emballages de marque (Tate & Lyle,
 * Dr. Oetker, Anchor, Hershey's, Colman's, Sarson's, Swanson, Alpro,
 * Sargento...), ce qui expose l'app aux guidelines 5.2.1 et 2.3.9. Elles ont
 * ete retirees : sans visuel, la vignette affiche une icone neutre.
 */
const INGREDIENT_IMAGES: Record<string, string> = {
  "lait": "https://www.themealdb.com/images/ingredients/Milk.png",
  "oeufs": "https://www.themealdb.com/images/ingredients/Egg.png",
  "oeuf": "https://www.themealdb.com/images/ingredients/Egg.png",
  "chocolat": "https://www.themealdb.com/images/ingredients/Chocolate.png",
  "banane": "https://www.themealdb.com/images/ingredients/Banana.png",
  "pomme": "https://www.themealdb.com/images/ingredients/Apple.png",
  "tomate": "https://www.themealdb.com/images/ingredients/Tomato.png",
  "oignon": "https://www.themealdb.com/images/ingredients/Onion.png",
  "ail": "https://www.themealdb.com/images/ingredients/Garlic.png",
  "poulet": "https://www.themealdb.com/images/ingredients/Chicken.png",
  "boeuf": "https://www.themealdb.com/images/ingredients/Beef.png",
  "saumon": "https://www.themealdb.com/images/ingredients/Salmon.png",
  "fromage": "https://www.themealdb.com/images/ingredients/Cheese.png",
  "gruyère": "https://www.themealdb.com/images/ingredients/Cheese.png",
  "citron": "https://www.themealdb.com/images/ingredients/Lemon.png",
  "fraise": "https://www.themealdb.com/images/ingredients/Strawberries.png",
  "framboise": "https://www.themealdb.com/images/ingredients/Raspberries.png",
  "amande": "https://www.themealdb.com/images/ingredients/Almonds.png",
  "noix": "https://www.themealdb.com/images/ingredients/Walnuts.png",
  "noisette": "https://www.themealdb.com/images/ingredients/Hazelnuts.png",
  "vin rouge": "https://www.themealdb.com/images/ingredients/Red%20Wine.png",
  "pomme de terre": "https://www.themealdb.com/images/ingredients/Potatoes.png",
  "carotte": "https://www.themealdb.com/images/ingredients/Carrots.png",
  "courgette": "https://www.themealdb.com/images/ingredients/Courgettes.png",
  "lime": "https://www.themealdb.com/images/ingredients/Lime.png",
  "spaghetti": "https://www.themealdb.com/images/ingredients/Spaghetti.png"
};

// Cles triees du plus long au plus court : "sucre glace" doit gagner sur "sucre".
const SORTED_KEYS = Object.keys(INGREDIENT_IMAGES).sort((a, b) => b.length - a.length);

// Unites triees du plus long au plus court et suivies d'une frontiere de mot :
// sans \b, le "g" de l'alternance mangeait le "g" de "gousses d'ail" et le
// libelle devenait "ousses d'ail" — visible sur la liste de courses.
const UNITS =
  "cuill\u00e8res|cuill\u00e8re|pinc\u00e9es|pinc\u00e9e|poign\u00e9es|poign\u00e9e|tranches|tranche|" +
  "gousses|gousse|sachets|sachet|briques|brique|bo\u00eetes|bo\u00eete|boites|boite|" +
  "verres|verre|tasses|tasse|bottes|botte|pots|pot|c\u00e0s|c\u00e0c|cs|cc|kg|ml|cl|g|l";

const QUANTITY_PREFIX = new RegExp(
  "^(?:\\d+(?:[.,]\\d+)?(?:\\/\\d+)?(?:-\\d+)?|[\u00bd\u00bc\u00be\u2153\u2154])\\s*" +
    "(?:(?:" + UNITS + ")\\b\\.?)?\\s*" +
    // « 2 cuilleres a cafe de levure » : sans ca, le nom retenu etait
    // « a cafe de levure » et aucune image ne correspondait.
    "(?:\\u00e0\\s+(?:caf\\u00e9|soupe)\\s*)?\\s*(?:de\\s|d')?\\s*",
  "i"
);

/** Retire la quantite pour n'afficher que le nom sous la vignette. */
export function ingredientName(text: string): string {
  if (!text) return '';
  return text.replace(QUANTITY_PREFIX, '').trim() || text;
}

export function getIngredientImage(
  text: string,
  customImages: Record<string, string> = {}
): string | null {
  if (!text) return null;

  const name = ingredientName(text);
  // Correspondance exacte d'abord, puis insensible a la casse.
  if (customImages[name]) return customImages[name];
  if (customImages[text]) return customImages[text];
  const customKey = Object.keys(customImages).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  );
  if (customKey) return customImages[customKey];

  const lower = text.toLowerCase();
  for (const key of SORTED_KEYS) {
    if (lower.includes(key)) return INGREDIENT_IMAGES[key];
  }

  // Pas de repli qui devine une URL TheMealDB a partir du nom de l'ingredient :
  // il ramenait des packshots de marque jamais relus (pot Dr. Oetker pour
  // « peanut butter », barquette Casa Azzurra pour « mascarpone », sachet
  // Sajari pour « cacao ») et, le reste du temps, des 404 qui s'affichaient en
  // vignettes vides. Sans visuel verifie, on rend null : la tuile montre alors
  // son icone neutre.
  return null;
}
