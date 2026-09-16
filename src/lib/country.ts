/**
 * Pays -> drapeau. Recopie du site (src/utils/country.tsx) pour que les deux
 * plateformes affichent exactement les memes libelles.
 */
import { normalizeCountryName, normalizeString } from './format';

export const COUNTRY_FLAGS: Record<string, string> = {
  "france": "🇫🇷", "italie": "🇮🇹", "liban": "🇱🇧", "mexique": "🇲🇽", "japon": "🇯🇵",
  "chine": "🇨🇳", "inde": "🇮🇳", "thailande": "🇹🇭", "grece": "🇬🇷", "espagne": "🇪🇸",
  "etats-unis": "🇺🇸", "usa": "🇺🇸", "maroc": "🇲🇦", "algerie": "🇩🇿", "tunisie": "🇹🇳",
  "turquie": "🇹🇷", "vietnam": "🇻🇳", "coree": "🇰🇷", "royaume-uni": "🇬🇧", "angleterre": "🇬🇧",
  "allemagne": "🇩🇪", "bresil": "🇧🇷", "argentine": "🇦🇷", "syrie": "🇸🇾", "egypte": "🇪🇬",
  "portugal": "🇵🇹", "belgique": "🇧🇪", "suisse": "🇨🇭", "canada": "🇨🇦", "russie": "🇷🇺",
  "suede": "🇸🇪", "perou": "🇵🇪", "colombie": "🇨🇴", "senegal": "🇸🇳", "cote d'ivoire": "🇨🇮",
  "mali": "🇲🇱", "cameroun": "🇨🇲", "madagascar": "🇲🇬", "ile maurice": "🇲🇺", "reunion": "🇷🇪",
  "australie": "🇦🇺", "nouvelle-zelande": "🇳🇿", "indonesie": "🇮🇩", "malaisie": "🇲🇾",
  "philippines": "🇵🇭", "pakistan": "🇵🇰", "iran": "🇮🇷", "irak": "🇮🇶", "arabie saoudite": "🇸🇦",
  "emirats": "🇦🇪", "israel": "🇮🇱", "palestine": "🇵🇸", "jordanie": "🇯🇴", "pays-bas": "🇳🇱",
  "danemark": "🇩🇰", "norvege": "🇳🇴", "finlande": "🇫🇮", "pologne": "🇵🇱", "autriche": "🇦🇹",
  "hongrie": "🇭🇺", "republique tcheque": "🇨🇿", "roumanie": "🇷🇴", "bulgarie": "🇧🇬",
  "croatie": "🇭🇷", "serbie": "🇷🇸", "ukraine": "🇺🇦", "afrique du sud": "🇿🇦", "nigeria": "🇳🇬",
  "kenya": "🇰🇪", "ethiopie": "🇪🇹", "chili": "🇨🇱", "venezuela": "🇻🇪", "cuba": "🇨🇺",
  "jamaique": "🇯🇲", "haiti": "🇭🇹"
};

/** "france" -> "fr" : les drapeaux emoji sont deux Regional Indicator Symbols. */
export function countryCode(name: string | null | undefined): string | null {
  const normalized = normalizeString(normalizeCountryName(name));
  if (!normalized) return null;

  for (const [country, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (normalized === country || normalized.includes(country)) {
      const points = [...flag].map((c) => c.codePointAt(0)!);
      if (points.length === 2 && points[0] >= 0x1f1e6 && points[0] <= 0x1f1ff) {
        return (
          String.fromCharCode(points[0] - 0x1f1e6 + 97) +
          String.fromCharCode(points[1] - 0x1f1e6 + 97)
        );
      }
    }
  }
  return null;
}

/** Image de drapeau servie par flagcdn, utilisable directement dans <Image>. */
export function flagUrl(name: string | null | undefined, width: 20 | 40 | 80 = 40): string | null {
  const code = countryCode(name);
  return code ? `https://flagcdn.com/w${width}/${code}.png` : null;
}
