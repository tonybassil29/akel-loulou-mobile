/**
 * Image d'un ingredient, resolue uniquement a partir de
 * settings.custom_ingredient_images — nos propres visuels, heberges sur notre
 * compte Cloudinary.
 *
 * La table de 26 visuels TheMealDB qui servait de repli a ete retiree. Leurs
 * conditions reservent l'usage commercial a un palier payant et exigent une
 * attribution : nous n'avions ni l'un ni l'autre, et aucun justificatif a
 * presenter si App Review en demande (guideline 5.2.1, et point 6 de sa
 * demande d'informations). Sans visuel a nous, la vignette affiche son icone
 * neutre — on n'affiche jamais une image qui n'a pas ete relue.
 */

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

/**
 * Separe la quantite du nom, comme le site : « 25g de cacao » devient
 * { qty: "25 g", nom: "de cacao" }. La quantite s'affiche en gras au-dessus du
 * nom sous la vignette — sans ca, l'app n'indiquait aucun poids.
 */
export function splitIngredient(text: string): { qty: string; nom: string } {
  if (!text) return { qty: '', nom: '' };
  const m = text.match(
    new RegExp(
      "^(\\d+(?:[.,]\\d+)?(?:\\/\\d+)?(?:-\\d+)?|[\u00bd\u00bc\u00be\u2153\u2154])\\s*" +
        "((?:" + UNITS + ")\\b\\.?)?\\s*" +
        "(?:(\\u00e0\\s+(?:caf\u00e9|soupe))\\s*)?\\s*(de\\s|d')?\\s*(.*)$",
      "i"
    )
  );
  if (!m) return { qty: '', nom: text };
  const qty = `${m[1]} ${(m[2] ?? '').trim()}${m[3] ? ' ' + m[3] : ''}`.trim();
  // « d' » se colle au mot suivant, « de » prend une espace.
  const liaison = (m[4] ?? '').trim();
  const reste = (m[5] ?? '').trim();
  const nom = liaison === "d'" ? `${liaison}${reste}` : `${liaison} ${reste}`.trim();
  return { qty, nom: nom || text };
}

/** Singulier approximatif : « tomates » et « tomate » doivent se rejoindre. */
function racine(v: string): string {
  const b = v.toLowerCase();
  return b.length > 3 && b.endsWith('s') ? b.slice(0, -1) : b;
}

/** Echappe les caracteres speciaux d'une cle avant de la passer en expression. */
function echapper(v: string): string {
  return v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

  // Puis par mot entier, cles du plus long au plus court pour que « sauce
  // tomate » l'emporte sur « tomate ». La frontiere de mot est indispensable :
  // une simple recherche de sous-chaine trouvait « oeuf » dans « boeuf » et
  // servait un oeuf pour de la viande, et « pomme » dans « pomme de terre ».
  const lower = text.toLowerCase();
  const keys = Object.keys(customImages).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const motif = new RegExp(`(^|[^\\p{L}])${echapper(racine(key))}s?($|[^\\p{L}])`, 'u');
    if (motif.test(lower)) return customImages[key];
  }

  // Pas de repli qui devine une URL TheMealDB a partir du nom de l'ingredient :
  // il ramenait des packshots de marque jamais relus (pot Dr. Oetker pour
  // « peanut butter », barquette Casa Azzurra pour « mascarpone », sachet
  // Sajari pour « cacao ») et, le reste du temps, des 404 qui s'affichaient en
  // vignettes vides. Sans visuel verifie, on rend null : la tuile montre alors
  // son icone neutre.
  return null;
}
