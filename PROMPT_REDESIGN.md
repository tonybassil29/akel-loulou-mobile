# Prompt — refonte visuelle d'Akel Loulou

> À coller tel quel dans Claude Design. Le lien du dépôt est dans le texte.

---

Tu conçois la **refonte visuelle complète** d'Akel Loulou, une application iOS de
recettes de cuisine maison, déjà en production. Livre une **maquette**, pas du
code d'application : des écrans HTML/CSS haute fidélité que je pourrai ensuite
porter en React Native.

## Le dépôt

**https://github.com/tonybassil29/akel-loulou-mobile** — public, clone-le ou
parcours-le en ligne. Lis ces fichiers avant de dessiner :

- `src/theme/index.ts` — la charte actuelle : tous les jetons de couleur des
  deux thèmes, la typographie, les espacements, les rayons, les ombres
- `src/screens/` — les huit écrans à repenser
- `src/components/` — carte recette, pilule de filtre, en-tête de section,
  feuille de filtres, états vides

Ne réinvente pas le contenu : les libellés, les recettes et la structure de
navigation sont justes. C'est **l'habillage** qui doit changer.

## Ce qui est imposé

- **La marque reste.** Rose poudré `#FF6B9D`, accent abricot `#FFA94D`, fond
  `#FDF6FB`, texte `#1A0A1E`. Tu peux enrichir la palette, l'assombrir,
  introduire des neutres plus chauds — mais on doit reconnaître l'app.
- **Les deux fontes restent** : Cormorant Garamond pour les titres et les noms
  de recettes, DM Sans pour tout le reste. C'est l'identité éditoriale du
  projet, elle vient du site web.
- **Les 5 onglets restent** : Recettes · Frigo · Menu · Courses · Galerie.
- **Thème clair et thème sombre.** Le sombre actuel s'appelle « Onyx &
  Champagne » — accent `#E8A87C` sur fond `#0E1116`. Propose les deux.
- **Cible iOS 16.4 minimum.** Tout effet qui exige plus récent doit avoir un
  repli propre, et tu le signales.

## Ce que je veux voir

Une app qui a l'air **conçue pour iOS**, pas portée depuis un site. Inspire-toi
des idiomes système que les vraies apps Apple utilisent :

- **Grands titres** qui se contractent au défilement, avec la barre de
  navigation qui devient translucide.
- **Matériaux translucides** plutôt que des aplats : barre d'onglets, en-têtes,
  feuilles. Les flous doivent laisser deviner le contenu qui passe dessous.
- **Feuilles à paliers** (`detents`) pour le sélecteur de recette du Menu et les
  filtres, avec une poignée et un fond qui respire.
- **SF Symbols** partout où c'est possible, avec leurs variantes pleines/vides
  et leurs animations de bascule. L'app en utilise déjà : `fork.knife`,
  `sparkles`, `calendar`, `cart`, `photo.on.rectangle`.
- **Cartes et profondeur** : coins `continuous` (des squircles, pas des arcs de
  cercle), ombres douces et colorées, jamais de gris.
- **Mouvement discret** : une carte qui s'enfonce légèrement à l'appui, une
  transition partagée entre la grille et la fiche recette, un retour haptique
  aux moments clés.
- **Respiration.** L'app actuelle est dense. Donne-lui de l'air, une hiérarchie
  typographique plus franche, moins d'éléments par écran.

Ce que je ne veux pas : des dégradés criards, des ombres dures, des bordures
partout, une grille compressée, ou un style « template » interchangeable.

## Les écrans à livrer

Format **393 × 852** (iPhone 15/16), thème clair **et** thème sombre.

| Écran | Ce qu'il montre |
|---|---|
| **1. Recettes** | grille de cartes, champ de recherche, pilules de filtre, bandeau de marque |
| **2. Fiche recette** | photo en héros, badge de catégorie, ingrédients en vignettes rondes, épices, matériel, étapes numérotées |
| **3. Frigo** | saisie d'ingrédients, pilules, résultats en trois groupes : réalisable maintenant / il te manque peu / plus loin |
| **4. Menu** | 7 jours × 3 créneaux, créneaux vides et remplis, bouton d'envoi vers les courses |
| **5. Courses** | articles cochables groupés par rayon, barré quand pris |
| **6. Mode cuisson** | plein écran, une étape en très grand, progression, carte minuteur |
| **7. Galerie** | mosaïque de photos en colonnes de hauteurs inégales |
| **8. Feuille de sélection** | la feuille à paliers du Menu, par-dessus l'écran Menu |

Plus, en supplément :

- une **planche de la charte** : palette claire et sombre côte à côte, échelle
  typographique, espacements, rayons, ombres, états des composants
- deux ou trois **détails zoomés** : la carte recette, la pilule de filtre, la
  carte minuteur — pour que je voie les intentions de près

## Contraintes techniques à respecter

L'app est en **React Native / Expo SDK 57**. Ce qui est disponible :

```
expo-router NativeTabs   barre d'onglets native, limite de 5 onglets
@expo/ui BottomSheet     feuilles natives a paliers
expo-symbols             SF Symbols
expo-image               images, flou de chargement, cache disque
expo-linear-gradient     degrades
react-native-reanimated  animations
expo-haptics             retours haptiques
```

`expo-blur` et `expo-glass-effect` **ne sont pas installés** — si ta maquette en
dépend, dis-le explicitement, je les ajouterai.

Tout ce qui n'est pas réalisable avec ces briques doit être signalé, avec le
repli que tu proposes. Une maquette magnifique mais impossible à porter ne me
sert à rien.

## Livraison

Les 16 écrans (8 × 2 thèmes) en PNG, la planche de charte, les détails zoomés,
et un court document qui explique les partis pris : ce que tu as changé,
pourquoi, et ce qui demande un module supplémentaire.
