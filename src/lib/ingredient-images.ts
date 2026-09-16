/**
 * Image d'un ingredient. Meme table que le site (src/components/Recipe.tsx) :
 * un dictionnaire francais -> visuel TheMealDB, complete par une deduction sur
 * le nom nettoye de sa quantite. Les images personnalisees stockees dans
 * settings.custom_ingredient_images ont toujours la priorite.
 */

const INGREDIENT_IMAGES: Record<string, string> = {
  "farine": "https://www.themealdb.com/images/ingredients/Flour.png",
  "sucre vanillé": "https://www.themealdb.com/images/ingredients/Vanilla%20extract.png",
  "cassonade": "https://www.themealdb.com/images/ingredients/Brown%20Sugar.png",
  "sucre glace": "https://www.themealdb.com/images/ingredients/Icing%20Sugar.png",
  "sucre": "https://www.themealdb.com/images/ingredients/Sugar.png",
  "levure chimique": "https://www.themealdb.com/images/ingredients/Baking%20Powder.png",
  "levure boulangère": "https://www.themealdb.com/images/ingredients/Yeast.png",
  "levure": "https://www.themealdb.com/images/ingredients/Baking%20Powder.png",
  "bicarbonate": "https://www.themealdb.com/images/ingredients/Baking%20Soda.png",
  "maïzena": "https://www.themealdb.com/images/ingredients/Cornstarch.png",
  "fécule": "https://www.themealdb.com/images/ingredients/Cornstarch.png",
  "beurre de cacahuète": "https://www.themealdb.com/images/ingredients/Peanut%20Butter.png",
  "peanut butter": "https://www.themealdb.com/images/ingredients/Peanut%20Butter.png",
  "beurre": "https://www.themealdb.com/images/ingredients/Butter.png",
  "lait": "https://www.themealdb.com/images/ingredients/Milk.png",
  "oeufs": "https://www.themealdb.com/images/ingredients/Egg.png",
  "oeuf": "https://www.themealdb.com/images/ingredients/Egg.png",
  "chocolat": "https://www.themealdb.com/images/ingredients/Chocolate.png",
  "sel": "https://www.themealdb.com/images/ingredients/Salt.png",
  "poivre": "https://www.themealdb.com/images/ingredients/Pepper.png",
  "huile": "https://www.themealdb.com/images/ingredients/Olive%20Oil.png",
  "miel": "https://www.themealdb.com/images/ingredients/Honey.png",
  "banane": "https://www.themealdb.com/images/ingredients/Banana.png",
  "pomme": "https://www.themealdb.com/images/ingredients/Apple.png",
  "tomate": "https://www.themealdb.com/images/ingredients/Tomato.png",
  "oignon": "https://www.themealdb.com/images/ingredients/Onion.png",
  "ail": "https://www.themealdb.com/images/ingredients/Garlic.png",
  "poulet": "https://www.themealdb.com/images/ingredients/Chicken.png",
  "boeuf": "https://www.themealdb.com/images/ingredients/Beef.png",
  "saumon": "https://www.themealdb.com/images/ingredients/Salmon.png",
  "eau": "https://www.themealdb.com/images/ingredients/Water.png",
  "crème fraîche": "https://www.themealdb.com/images/ingredients/Cream.png",
  "crème": "https://www.themealdb.com/images/ingredients/Cream.png",
  "fromage": "https://www.themealdb.com/images/ingredients/Cheese.png",
  "gruyère": "https://www.themealdb.com/images/ingredients/Cheese.png",
  "parmesan": "https://www.themealdb.com/images/ingredients/Parmesan%20Cheese.png",
  "citron": "https://www.themealdb.com/images/ingredients/Lemon.png",
  "fraise": "https://www.themealdb.com/images/ingredients/Strawberries.png",
  "framboise": "https://www.themealdb.com/images/ingredients/Raspberries.png",
  "amande": "https://www.themealdb.com/images/ingredients/Almonds.png",
  "noix": "https://www.themealdb.com/images/ingredients/Walnuts.png",
  "noisette": "https://www.themealdb.com/images/ingredients/Hazelnuts.png",
  "cacao": "https://www.themealdb.com/images/ingredients/Cocoa.png",
  "moutarde": "https://www.themealdb.com/images/ingredients/Mustard.png",
  "vinaigre": "https://www.themealdb.com/images/ingredients/Vinegar.png",
  "bouillon": "https://www.themealdb.com/images/ingredients/Chicken%20Stock.png",
  "vin blanc": "https://www.themealdb.com/images/ingredients/White%20Wine.png",
  "vin rouge": "https://www.themealdb.com/images/ingredients/Red%20Wine.png",
  "riz": "https://www.themealdb.com/images/ingredients/Rice.png",
  "pâtes": "https://www.themealdb.com/images/ingredients/Penne%20Rigate.png",
  "pomme de terre": "https://www.themealdb.com/images/ingredients/Potatoes.png",
  "carotte": "https://www.themealdb.com/images/ingredients/Carrots.png"
};

// Cles triees du plus long au plus court : "sucre glace" doit gagner sur "sucre".
const SORTED_KEYS = Object.keys(INGREDIENT_IMAGES).sort((a, b) => b.length - a.length);

const QUANTITY_PREFIX =
  /^(\d+(?:[.,]\d+)?(?:\/\d+)?(?:-\d+)?)\s*(g|kg|ml|cl|l|c\u00e0s|c\u00e0c|cuill\u00e8re|pinc\u00e9e|sachet|gousse|tranche)?s?\s*(de|d')?\s*/i;

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

  if (name.length > 2) {
    const formatted = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(formatted)}.png`;
  }
  return null;
}
