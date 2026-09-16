/**
 * Reecriture d'URL Cloudinary : on demande a la CDN exactement la taille
 * affichee, en WebP/AVIF et qualite auto. Les URLs non-Cloudinary ressortent
 * inchangees, donc l'helper s'applique sans condition.
 */
const CLOUDINARY_UPLOAD = /res\.cloudinary\.com\/[^/]+\/image\/upload\//;
const TRANSFORM_TOKEN = /(^|,)(w_|h_|c_|q_|f_|g_|e_|a_|b_|dpr_|fl_|r_|ar_)/;

type Crop = 'limit' | 'fill' | 'fit' | 'thumb';

export function optimizeImage(
  url: string | null | undefined,
  opts: { width?: number; height?: number; crop?: Crop } = {}
): string {
  if (!url || !CLOUDINARY_UPLOAD.test(url)) return url ?? '';

  const { width, height, crop = 'limit' } = opts;
  const tokens: string[] = [];
  if (width) tokens.push(`w_${width}`);
  if (height) tokens.push(`h_${height}`);
  tokens.push(`c_${crop}`);
  if (crop === 'fill' || crop === 'thumb') tokens.push('g_auto');
  tokens.push('q_auto', 'f_auto');

  const [prefix, rest] = url.split('/upload/');
  if (rest === undefined) return url;

  // On retire une eventuelle transformation deja presente pour ne pas les empiler.
  const segments = rest.split('/');
  const tail = TRANSFORM_TOKEN.test(segments[0]) ? segments.slice(1).join('/') : rest;

  return `${prefix}/upload/${tokens.join(',')}/${tail}`;
}

/** Vignette de grille. */
export const thumbUrl = (url: string | null | undefined, width = 600) =>
  optimizeImage(url, { width, crop: 'fill' });

/** Image pleine largeur en tete de recette. */
export const heroUrl = (url: string | null | undefined, width = 1200) =>
  optimizeImage(url, { width, crop: 'limit' });
