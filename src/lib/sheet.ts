/**
 * Hauteurs des feuilles natives.
 *
 * Une `formSheet` iOS ne transmet pas sa hauteur a son contenu : un enfant en
 * `flex: 1` y recoit zero, et tous les enfants se retrouvent empiles a la meme
 * position — la liste se dessinait par-dessus son propre en-tete.
 *
 * Chaque feuille fixe donc sa hauteur elle-meme, a partir de ces fractions, et
 * `_layout.tsx` declare le meme chiffre en `sheetAllowedDetents`. Un seul
 * detent par feuille : deux valeurs rendraient la hauteur variable et la
 * fraction fausse des que l'utilisateur agrandit la feuille.
 */
export const FRACTION_FILTRE = 0.6;
export const FRACTION_CHOIX_RECETTE = 0.85;

/** Marge de securite : le detent se calcule sur la hauteur disponible, un peu
 *  inferieure a celle de la fenetre. Sans elle, le bas du contenu serait rogne. */
export function hauteurFeuille(hauteurFenetre: number, fraction: number) {
  return Math.round(hauteurFenetre * fraction) - 28;
}
