// Frigo IA — fonction Edge Supabase.
//
// Le telephone (ou le site) envoie une phrase libre : « j'ai du poulet, du riz
// et des tomates ». Ici, on demande a Gemini, recherche Google activee, deux a
// quatre recettes qui n'utilisent QUE ces ingredients, plus les basiques du
// placard. Puis on revérifie nous-memes chaque proposition : le modele promet,
// le code controle. Une recette qui glisse une courgette non declaree est jetee.
//
// La cle d'API vit dans le coffre Supabase (Vault) et n'est lue qu'ici, avec le
// role de service. Elle ne transite jamais vers un client.

import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Du moins cher au plus capable ; on passe au suivant des qu'un modele refuse
 * (retire, indisponible pour cette cle, outil non supporte...). Les alias
 * `-latest` suivent les nouvelles versions sans qu'on ait a redeployer.
 */
const MODELES = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-3.6-flash'];

/** Ce qu'on a forcement chez soi : autorise sans etre ecrit. */
const BASIQUES = [
  'sel', 'poivre', 'huile', "huile d'olive", 'huile de tournesol', 'eau', 'sucre', 'farine',
  'beurre', 'vinaigre', 'ail', 'oignon', 'citron', 'epices', 'herbes', 'paprika', 'cumin',
  'curry', 'cannelle', 'thym', 'laurier', 'origan', 'persil', 'piment', 'moutarde',
  'bouillon', 'levure', 'bicarbonate', 'miel', 'maizena', 'fecule', 'sauce soja', 'lait',
  'oeuf', 'oeufs', 'ketchup', 'mayonnaise', 'creme',
];

type Proposition = {
  titre: string;
  resume: string;
  temps: string;
  difficulte: string;
  ingredients_utilises: string[];
  basiques_utilises: string[];
  source?: { titre: string; url: string } | null;
};

type Detail = {
  titre: string;
  portions: string;
  temps: string;
  ingredients: string[];
  etapes: string[];
  conseil?: string | null;
  source?: { titre: string; url: string } | null;
};

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Racine grossiere : « tomates » ~ « tomate », « poivrons » ~ « poivron ». */
const racine = (m: string) => (m.length > 4 && m.endsWith('s') ? m.slice(0, -1) : m);
const mots = (s: string) => norm(s).split(' ').filter((m) => m.length > 2 && !['des', 'les', 'une', 'avec', 'sans', 'pour'].includes(m)).map(racine);

/** Un ingredient de recette est couvert s'il partage un mot significatif avec un ingredient declare. */
function couvert(ingredient: string, declares: string[]): boolean {
  const mi = mots(ingredient);
  if (mi.length === 0) return true;
  return declares.some((d) => {
    const md = mots(d);
    return md.some((m) => mi.includes(m)) || mi.some((m) => md.includes(m));
  });
}

function extraireJson(texte: string): unknown {
  const sans = texte.replace(/```json|```/g, '').trim();
  const debut = sans.search(/[\[{]/);
  const fin = Math.max(sans.lastIndexOf('}'), sans.lastIndexOf(']'));
  if (debut < 0 || fin < 0) throw new Error('Reponse sans JSON');
  return JSON.parse(sans.slice(debut, fin + 1));
}

/**
 * Deux passes : d'abord avec la recherche Google, puis sans si aucun modele ne
 * l'accepte — sur le palier gratuit d'AI Studio, la recherche a un quota nul,
 * et l'on prefere une reponse « de memoire » a une erreur. Le drapeau
 * `rechercheWeb` remonte jusqu'a l'ecran pour le dire honnetement.
 */
async function gemini(cle: string, prompt: string): Promise<{ texte: string; sources: { titre: string; url: string }[]; rechercheWeb: boolean }> {
  let derniere = '';
  for (const recherche of [true, false]) for (const modele of MODELES) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modele}:generateContent?key=${cle}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          ...(recherche ? { tools: [{ google_search: {} }] } : {}),
          generationConfig: { temperature: 0.4 },
        }),
      }
    );
    if (!res.ok) {
      // On memorise la raison et on essaie le modele suivant.
      derniere = `${modele} : ${res.status} ${(await res.text()).slice(0, 200)}`;
      continue;
    }
    const data = await res.json();
    const cand = data.candidates?.[0];
    const texte = (cand?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? '').join('');
    const sources = (cand?.groundingMetadata?.groundingChunks ?? [])
      .map((c: { web?: { title?: string; uri?: string } }) => c.web)
      .filter((w: { uri?: string } | undefined) => w?.uri)
      .map((w: { title?: string; uri: string }) => ({ titre: w.title ?? w.uri, url: w.uri }));
    return { texte, sources, rechercheWeb: recherche };
  }
  throw new Error(derniere || 'Aucun modele disponible');
}

async function proposer(cle: string, message: string, carnet: { titre: string; ingredients: string[] }[]) {
  const prompt = `Tu es un assistant de cuisine francophone, precis et concret.

L'utilisateur a chez lui EXACTEMENT ceci : « ${message} ».
Il a aussi, sans le dire, les basiques du placard : ${BASIQUES.join(', ')}.

1) Liste les ingredients qu'il a declares (noms simples, en francais, sans quantite).
2) Cherche (sur Google si tu en as l'outil, sinon dans ta connaissance des recettes classiques et des grands sites de cuisine) des recettes realisables avec UNIQUEMENT ces ingredients declares + les basiques. Propose entre 2 et 10 recettes : toutes celles qui sont vraiment pertinentes et fiables (plats connus, realisables, dont tu es sur), les plus differentes possibles entre elles. Ne remplis pas pour atteindre 10 — mieux vaut 5 bonnes recettes que 10 approximatives — mais ne t'arrete pas a 3 s'il en existe davantage.
   REGLE ABSOLUE : aucun ingredient non declare et non basique. Pas de courgette si l'utilisateur n'a pas dit courgette. Pas de « ou autre legume ».
   Tu peux aussi proposer, si elle convient, une recette du carnet familial ci-dessous (indique alors "carnet": true).
3) Reponds UNIQUEMENT avec ce JSON, sans commentaire :
{
  "ingredients": ["..."],
  "propositions": [
    {
      "titre": "...",
      "resume": "une phrase appetissante et concrete",
      "temps": "25 min",
      "difficulte": "facile | moyen | difficile",
      "ingredients_utilises": ["uniquement des ingredients declares"],
      "basiques_utilises": ["uniquement des basiques"],
      "carnet": false,
      "source": { "titre": "nom du site", "url": "https://..." } ou null   // null si tu n'es pas SUR de l'URL : n'invente jamais de lien
    }
  ]
}

Carnet familial (titre : ingredients) :
${carnet.map((r) => `- ${r.titre} : ${r.ingredients.join(', ')}`).join('\n')}`;

  const { texte, sources, rechercheWeb } = await gemini(cle, prompt);
  const brut = extraireJson(texte) as { ingredients?: string[]; propositions?: (Proposition & { carnet?: boolean })[] };
  const declares = (brut.ingredients ?? []).map(String);

  // Controle strict : chaque ingredient utilise doit etre declare ou basique.
  const propositions = (brut.propositions ?? []).filter((p) => {
    const utilises = (p.ingredients_utilises ?? []).map(String);
    const hors = utilises.filter((i) => !couvert(i, declares) && !couvert(i, BASIQUES));
    return utilises.length > 0 && hors.length === 0;
  }).map((p, i) => ({
    ...p,
    source: p.source?.url ? p.source : (sources[i] ?? null),
  }));

  return { ingredients: declares, propositions, rejetees: (brut.propositions?.length ?? 0) - propositions.length, recherche_web: rechercheWeb };
}

async function detailler(cle: string, titre: string, declares: string[], source: string | null) {
  const prompt = `Tu es un assistant de cuisine francophone. Donne la recette complete et precise de « ${titre} »${source ? ` (inspire-toi de ${source})` : ''}.

Contrainte : l'utilisateur n'a que ces ingredients : ${declares.join(', ')} — plus les basiques du placard (${BASIQUES.join(', ')}). N'utilise rien d'autre. Adapte si besoin.

Reponds UNIQUEMENT avec ce JSON :
{
  "titre": "...",
  "portions": "4 personnes",
  "temps": "preparation 15 min, cuisson 25 min",
  "ingredients": ["200 g de riz", "2 tomates", ...],   // quantite puis nom, une chaine par ingredient
  "etapes": ["Etape 1 detaillee...", "Etape 2..."],   // 5 a 10 etapes, precises (temperatures, durees, gestes)
  "conseil": "un conseil de cuisinier" ou null,
  "source": { "titre": "...", "url": "https://..." } ou null
}`;
  const { texte, sources, rechercheWeb } = await gemini(cle, prompt);
  const d = extraireJson(texte) as Detail;
  if (!d.source?.url && sources[0]) d.source = sources[0];
  return { ...d, recherche_web: rechercheWeb };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: cle, error } = await admin.rpc('frigo_ia_secret', { nom: 'GEMINI_API_KEY' });
    if (error || !cle) return json({ erreur: 'Cle IA absente du coffre : ajoute GEMINI_API_KEY dans Vault.' }, 503);

    const body = await req.json();
    if (body.action === 'proposer') {
      const message = String(body.message ?? '').trim();
      if (message.length < 3) return json({ erreur: 'Dis-moi au moins un ingredient.' }, 400);
      // Le carnet familial, pour que l'agent puisse aussi proposer une recette maison.
      const { data: recettes } = await admin
        .from('recipes').select('title, ingredients')
        .or('hidden.eq.false,hidden.is.null').or('is_secondary.eq.false,is_secondary.is.null').neq('category', 'menu_only');
      const carnet = (recettes ?? []).map((r) => ({ titre: r.title as string, ingredients: (r.ingredients ?? []) as string[] }));
      return json(await proposer(cle, message, carnet));
    }
    if (body.action === 'detail') {
      const titre = String(body.titre ?? '').trim();
      if (!titre) return json({ erreur: 'Titre manquant.' }, 400);
      return json(await detailler(cle, titre, (body.ingredients ?? []).map(String), body.source ? String(body.source) : null));
    }
    return json({ erreur: 'Action inconnue.' }, 400);
  } catch (e) {
    return json({ erreur: (e as Error).message }, 500);
  }
});
