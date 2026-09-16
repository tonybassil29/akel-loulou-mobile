/**
 * Regenere src/assets/fallback-recipes.json depuis la base.
 *
 * Ce jeu de secours ne sert qu'au tout premier lancement sans reseau : sans lui,
 * l'app s'ouvre sur une erreur de connexion, ce qui est exactement ce qu'un
 * relecteur App Store verrait en mode avion. Les photos restent distantes (on
 * ne veut pas d'un bundle de plusieurs megaoctets), et le contenu est remplace
 * des le premier chargement en ligne.
 *
 *   node scripts/build-fallback-recipes.mjs
 */
import { writeFileSync } from 'node:fs';

const URL_BASE = 'https://dkxtmhlrewmueuwcxeki.supabase.co';
const KEY = 'sb_publishable_cUge5RXqHdISbnrtxGubew_gLAwwwVg';

const res = await fetch(
  `${URL_BASE}/rest/v1/recipes?select=*&order=created_at.desc` +
    `&or=(hidden.eq.false,hidden.is.null)&or=(is_secondary.eq.false,is_secondary.is.null)`,
  { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
);
if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);

const recipes = await res.json();

// Les images sont volontairement retirees : elles seraient distantes de toute
// facon, et un aplat rose vaut mieux qu'un bundle alourdi pour rien.
const stripped = recipes.map((r) => ({ ...r, image_url: null }));

writeFileSync(
  new URL('../src/assets/fallback-recipes.json', import.meta.url),
  JSON.stringify(stripped, null, 0) + '\n'
);
console.log(`${stripped.length} recettes ecrites`);
