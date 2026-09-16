import { normalizeString } from './format';

/**
 * Epice -> emoji, repris du site (src/data1.ts). Les entrees qui y pointaient
 * vers une image (data: / http:) retombent ici sur la feuille, exactement comme
 * le fait le web.
 */
const SPICE_EMOJI: Record<string, string> = {
  "7 épices": "✨",
  "ail en poudre": "🧄",
  "cannelle": "🍂",
  "cardamome": "💚",
  "chipotle": "🌶️",
  "coriandre": "🌱",
  "curcuma": "🟡",
  "curry": "🍛",
  "garam masala": "🍛",
  "harissa": "🌶️",
  "muscade": "🌰",
  "oignon en poudre": "🧅",
  "piment": "🌶️",
  "ras el hanout": "✨",
  "safran": "💛",
  "sel": "🧂",
  "sucre vanillé": "🍬",
  "sumac": "🔴",
  "thym": "🌿",
  "vanille": "🤎",
  "épices shawarma": "🌟"
};

const FALLBACK = '\u{1F33F}';

export function spiceEmoji(spice: string): string {
  return SPICE_EMOJI[normalizeString(spice)] ?? SPICE_EMOJI[spice.toLowerCase()] ?? FALLBACK;
}

/** "persil moulue" -> "Persil moulue" : la base stocke en minuscules. */
export function spiceLabel(spice: string): string {
  if (!spice) return '';
  return spice.charAt(0).toUpperCase() + spice.slice(1);
}
