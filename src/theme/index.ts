/**
 * Akel Loulou — jetons de design repris **a l'identique** du site
 * (lorecipesss/src/index.css). Toute couleur ajoutee ici doit exister la-bas :
 * l'app et le site doivent etre indistinguables.
 */
import { Platform } from 'react-native';

export interface BrandColors {
  // accents
  accent: string;          // --accent-primary
  accentSecondary: string; // --accent-secondary
  accentGold: string;      // --accent-gold
  accentGoldSoft: string;  // --accent-gold-soft
  accentDeep: string;      // --accent-deep
  // surfaces
  bgMain: string;
  bgCard: string;
  bgHover: string;
  bgSubtle: string;
  bgInput: string;
  // bordures
  borderCard: string;
  borderInput: string;
  // texte
  textMain: string;
  textSecondary: string;
  textPlaceholder: string;
  textMuted: string;
  // badges categorie
  badgeDessertBg: string;
  badgeDessertText: string;
  badgePlatBg: string;
  badgePlatText: string;
  // degrade de la carte "A propos"
  aboutGrad1: string;
  aboutGrad2: string;
  aboutGrad3: string;
  // texte pose sur le degrade de marque
  btnText: string;
  // ombres
  shadowCard: string;
  shadowWarm: string;
}

const palette: Record<'light' | 'dark', BrandColors> = {
  // --- LIGHT : "orange abricot" ---
  light: {
    accent: '#F26A1B',
    accentSecondary: '#FBBF24',
    accentGold: '#FED7AA',
    accentGoldSoft: '#FFE8CC',
    accentDeep: '#C2410C',
    bgMain: '#FFF8F1',
    bgCard: '#FFFFFF',
    bgHover: '#FFF1E4',
    bgSubtle: '#FFEFDF',
    bgInput: '#FFFFFF',
    borderCard: '#FFE8D3',
    borderInput: '#FED7AA',
    textMain: '#1F1108',
    textSecondary: '#A9785A',
    textPlaceholder: '#C9A58E',
    textMuted: '#8A6244',
    badgeDessertBg: '#FFE4CC',
    badgeDessertText: '#C2410C',
    badgePlatBg: '#FFF3CD',
    badgePlatText: '#C87800',
    aboutGrad1: '#FDBA74',
    aboutGrad2: '#FED7AA',
    aboutGrad3: '#FB923C',
    btnText: '#FFFFFF',
    shadowCard: 'rgba(242, 106, 27, 0.07)',
    shadowWarm: 'rgba(194, 65, 12, 0.09)',
  },
  // --- DARK : "Onyx & Champagne" ---
  dark: {
    accent: '#FB923C',
    accentSecondary: '#F5B15A',
    accentGold: '#E5C89F',
    accentGoldSoft: '#C2A47A',
    accentDeep: '#EA580C',
    bgMain: '#0E1116',
    bgCard: '#161A20',
    bgHover: '#1C2026',
    bgSubtle: '#131720',
    bgInput: '#1C2026',
    borderCard: '#232830',
    borderInput: '#2E343F',
    textMain: '#F1EBE0',
    textSecondary: '#B8AFA0',
    textPlaceholder: '#6B645B',
    textMuted: '#9A9388',
    badgeDessertBg: 'rgba(251, 146, 60, 0.16)',
    badgeDessertText: '#FB923C',
    badgePlatBg: 'rgba(212, 165, 116, 0.12)',
    badgePlatText: '#D4A574',
    aboutGrad1: '#14181E',
    aboutGrad2: '#0E1116',
    aboutGrad3: '#1C2026',
    btnText: '#0E1116',
    shadowCard: 'rgba(0, 0, 0, 0.65)',
    shadowWarm: 'rgba(0, 0, 0, 0.7)',
  },
};

/** Degrade de marque : --btn-from -> --btn-to (orange -> ambre). */
export const brandGradient = (c: BrandColors): readonly [string, string] => [
  c.accent,
  c.accentSecondary,
];

/** Degrade des titres ("text-gradient" du site) : orange -> ambre -> peche. */
export const titleGradient = (c: BrandColors): readonly [string, string, string] => [
  c.accent,
  c.accentSecondary,
  c.accentGold,
];

// ------------------------------------------------------------------- fontes

export const fonts = {
  /** Cormorant Garamond — titres, noms de recettes (le "font-serif" du site). */
  serif: 'CormorantGaramond_700Bold',
  serifItalic: 'CormorantGaramond_600SemiBold_Italic',
  serifMediumItalic: 'CormorantGaramond_500Medium_Italic',
  /** DM Sans — tout le texte courant (le "font-sans" du site). */
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemi: 'DMSans_600SemiBold',
  sansBold: 'DMSans_700Bold',
} as const;

export const type = {
  /** .label-eyebrow du site : DM Sans 500, 0.68rem, letter-spacing 0.32em. */
  eyebrow: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 3.5 },
  /** Pilules de filtre : 12px, 0.06em, majuscules. */
  pill: { fontFamily: fonts.sansMedium, fontSize: 12, letterSpacing: 0.72 },
  /** Titre de carte recette. */
  cardTitle: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 23 },
  /** Grand titre d'ecran ("Galerie", "La Cheffe"). */
  display: { fontFamily: fonts.serif, fontSize: 40, lineHeight: 45 },
  /** Titre de recette sur la photo. */
  heroTitle: { fontFamily: fonts.serif, fontSize: 32, lineHeight: 36 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 24 },
  bodyMedium: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 24 },
  bodySemi: { fontFamily: fonts.sansSemi, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 18 },
  button: { fontFamily: fonts.sansSemi, fontSize: 14, letterSpacing: 0.4 },
  /** Badge de categorie sur la photo : 10px, 0.14em. */
  badge: { fontFamily: fonts.sansMedium, fontSize: 10.5, letterSpacing: 1.5 },
} as const;

// ------------------------------------------------------------------ mesures

export const spacing = {
  xs: 4,
  sm: 8,
  row: 12,
  gutter: 20,
  group: 26,
  section: 40,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/** Ombres douces et roses du site (--shadow-card), jamais d'ombre lourde. */
export const shadow = (color: string) =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOpacity: 1,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    },
    default: { elevation: 3 },
  })!;

export { palette };
