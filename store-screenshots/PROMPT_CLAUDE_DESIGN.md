# Prompt — génération des captures App Store d'Akel Loulou

> À copier-coller intégralement dans Claude Design, en joignant le dépôt
> `https://github.com/tonybassil29/akel-loulou-mobile`.
> Tout ce qui suit est vérifié dans le code du dépôt au 16 septembre 2026.

---

Tu génères les **captures d'écran de la fiche App Store** d'une application iOS
qui s'appelle **Akel Loulou** (recettes de cuisine maison, français, gratuite,
sans compte, sans publicité). Le dépôt joint contient l'application complète :
`src/theme/index.ts` est la source de vérité du design, `src/screens/` contient
chaque écran à reproduire. **Lis-les avant de dessiner.** Ne réinvente ni la
charte, ni la mise en page : les captures doivent ressembler à l'application,
pas à une refonte.

---

## 1. Ce qu'il faut livrer

Six affiches (sept avec l'optionnelle), déclinées dans **trois formats**, en
**PNG 24 bits sans canal alpha**, RVB, portrait, sans transparence, sans coins
arrondis sur le fichier lui-même.

| Dossier | Taille App Store Connect | Pixels exacts | Appareil de référence |
|---|---|---|---|
| `store-screenshots/6.9/` | iPhone 6,9" — **obligatoire** | **1320 × 2868** | iPhone 16/17 Pro Max — Dynamic Island |
| `store-screenshots/6.7/` | iPhone 6,7" | **1290 × 2796** | iPhone 15 Pro Max — Dynamic Island |
| `store-screenshots/6.5/` | iPhone 6,5" | **1284 × 2778** | slot 6,5" d'App Store Connect |

Les trois rapports hauteur/largeur sont quasi identiques (0,4603 / 0,4614 /
0,4622). **Compose une seule fois à 1320 × 2868, puis re-rends aux deux autres
tailles** en ajustant la mise en page — ne te contente pas d'un redimensionnement
qui rendrait le texte flou.

Nommage strict, l'ordre du nom est l'ordre d'affichage sur la fiche :

```
01_accueil.png
02_frigo.png
03_menu.png
04_cuisson.png
05_courses.png
06_recette.png
07_horsligne.png   (optionnelle)
```

Garde chaque fichier sous ~5 Mo.

---

## 2. Charte — valeurs exactes, ne pas approximer

Extraites de `src/theme/index.ts`, thème clair « rose poudré ». **Utilise ces
codes hexadécimaux tels quels.**

```
accent            #FF6B9D   rose principal (boutons, eyebrow, accents)
accentSecondary   #FFA94D   abricot (2e couleur du dégradé de marque)
accentDeep        #C2185B   rose profond (titres d'affiche, texte de badge dessert)
accentGold        #FFC2E2   rose pâle

bgMain            #FDF6FB   fond d'écran de l'app
bgCard            #FFFFFF   cartes, champs
bgSubtle          #FFEEF4   aplat de photo en attente
borderCard        #FFEEF4   bordure de carte (1 px)
borderInput       #FFD6EB   bordure de champ (1 px)

textMain          #1A0A1E   texte principal (presque noir, nuance prune)
textSecondary     #B090A8   texte secondaire
textPlaceholder   #C8B0C0   placeholder
textMuted         #8A6A82   chapô sous les grands titres

badgeDessertBg    #FFE4F0   badgeDessertText  #C2185B
badgePlatBg       #FFF3CD   badgePlatText     #C87800

btnText           #FFFFFF   texte posé sur le rose
shadowCard        rgba(255,107,157,0.06)   ombre douce, jamais d'ombre lourde
```

**Dégradé de marque** (boutons principaux, bouton Mode cuisson) :
`#FF6B9D → #FFA94D`, de gauche à droite.

### Typographie

Deux familles, aucune autre :

- **Cormorant Garamond** — titres, noms de recettes, grands titres d'écran.
  Graisses utilisées : `700 Bold`, `600 SemiBold Italic`, `500 Medium Italic`.
- **DM Sans** — absolument tout le reste. `400`, `500`, `600`, `700`.

Échelle exacte de l'app (`type` dans `src/theme/index.ts`), en points iOS — à
multiplier par 3 pour le rendu à 1320 × 2868 :

```
eyebrow     DM Sans 500, 11 pt, letter-spacing 3,5 pt, TOUJOURS EN MAJUSCULES
pill        DM Sans 500, 12 pt, letter-spacing 0,72 pt, majuscules
cardTitle   Cormorant Garamond 700, 19 pt / interligne 23
display     Cormorant Garamond 700, 40 pt / interligne 45
heroTitle   Cormorant Garamond 700, 32 pt / interligne 36
body        DM Sans 400, 15 pt / interligne 24
caption     DM Sans 500, 13 pt / interligne 18
button      DM Sans 600, 14 pt, letter-spacing 0,4 pt
badge       DM Sans 500, 10,5 pt, letter-spacing 1,5 pt
```

### Mesures

```
espacements   4 · 8 · 12 · 20 (marge latérale) · 26 · 40
rayons        10 (petit) · 16 · 20 (carte recette) · 28 (grande carte) · 999 (pilule)
```

Toutes les pilules, tous les boutons principaux et tous les champs de saisie sont
des **capsules parfaites** (rayon 999). Les cartes recette ont un rayon de 20 et
un `borderCurve: continuous` — donc des coins « squircle » à l'iOS, pas un arc de
cercle.

---

## 3. L'affiche — structure commune aux six

Reprends **exactement** la composition des captures déjà présentes dans
`store-screenshots/6.9/` : elles font partie du même jeu, le nouveau doit s'y
fondre.

```
┌─────────────────────────────────────────┐
│  fond : dégradé vertical doux            │  ~5 % de la hauteur : marge haute
│  #FDF6FB (haut) → #FFD9EC (bas)          │
│                                          │
│         ── EYEBROW EN ROSE ──            │  ~7 %  filet 60 px + texte, centrés
│                                          │
│          Titre en Cormorant              │  ~11 % serif 700, #1A0A1E
│        seconde ligne en italique         │  ~16 % serif 600 italic, #C2185B
│                                          │
│                                          │
│   ┌──────────────────────────────┐       │  ~19 % : haut du téléphone
│   │  ▄▄▄  Dynamic Island         │       │
│   │  9:41      ▮▮▮ 📶 🔋          │       │
│   │                              │       │
│   │      CONTENU DE L'ÉCRAN      │       │
│   │                              │       │
│   │                              │       │
│   │    (déborde sous le cadre)   │       │  le téléphone est coupé par le bas
│   └──────────────────────────────┘       │
└─────────────────────────────────────────┘
```

**Le cadre du téléphone**, en détail — c'est là que se joue le réalisme :

- Corps : châssis titane sombre `#1C1A1E`, épaisseur ~14 px à 1320 de large,
  avec un très léger dégradé clair sur l'arête gauche pour le relief.
- Coins arrondis continus, rayon ~130 px à cette échelle.
- Liseré intérieur noir pur `#000000` de 2 px entre le châssis et l'écran.
- **Dynamic Island** : capsule noire pleine, largeur ~250 px, hauteur ~78 px,
  centrée, à ~36 px du haut de l'écran, coins entièrement arrondis.
  *(Pour le format 6,5", garde la même Dynamic Island : la cohérence du jeu
  prime sur l'exactitude du modèle d'iPhone.)*
- **Barre d'état**, en `#1A0A1E`, à la même hauteur que la Dynamic Island :
  - à gauche, **`9:41`** — la convention Apple, SF Pro Semibold ~40 px ;
  - à droite, dans l'ordre : les 4 barres de réseau cellulaire (la 4e légèrement
    grisée, comme sur un vrai appareil), l'icône Wi-Fi pleine, puis la
    **batterie** : contour arrondi de 2 px, petit ergot à droite, **remplie à
    ~85 %**, sans chiffre, sans éclair de charge.
  - Ne mets **pas** de « 100 % » ni de batterie en rouge : ça attire l'œil pour
    rien.
- **Indicateur d'accueil** (la barre horizontale du bas) : visible seulement si
  le bas du téléphone est dans le cadre. Sur ce jeu, le téléphone est coupé, donc
  il n'apparaît généralement pas.
- Ombre portée sous le téléphone : très diffuse, rose, `rgba(255,107,157,0.18)`,
  flou ~90 px, décalée de 30 px vers le bas. Jamais d'ombre grise ou noire.

**Le texte d'affiche** (eyebrow + titre) est en dehors du téléphone, sur le fond
rose. Il ne doit **jamais** recouvrir l'écran de l'application.

---

## 4. Les six affiches, une par une

Pour chaque écran : le contenu ci-dessous est **le vrai contenu de
l'application**, relevé dans le code et dans la base. Reproduis-le mot pour mot,
accents compris. N'invente aucune fonctionnalité, aucun libellé, aucun chiffre.

### 01 — Accueil

- **Eyebrow d'affiche** : `CUISINE MAISON`
- **Titre** : `Tout ton carnet` / *`de recettes`* (2e ligne en italique rose)
- *(Cette affiche existe déjà. Refais-la à l'identique en ajoutant seulement le
  bandeau « À propos » décrit ci-dessous, qui est nouveau dans l'app.)*

Contenu de l'écran, de haut en bas :

1. Bandeau de marque : un filet rose de 28 pt, puis `AKEL LOULOU · CARNET` en
   eyebrow rose ; à droite, une pilule blanche bordée `#FFEEF4` contenant un
   petit cœur rose et le mot `À propos` en 12 pt.
2. Champ de recherche : capsule blanche, bordure `#FFEEF4`, hauteur 46 pt, loupe
   grise à gauche, placeholder `Rechercher une recette, un ingrédient…`.
   À sa droite, un bouton rond de 46 pt, blanc bordé, avec un `✦` rose.
3. Pilules de filtre sur deux lignes, capsules de 46 pt de large minimum :
   `✨ TOUT` (**active** : fond `#1A0A1E`, texte `#FDF6FB`), `🍽️ PLATS`,
   `🍰 DESSERTS`, `♥ FAVORIS`, `◯ PAYS ⌄`, `# TAGS ⌄` (les autres :
   fond transparent, bordure `#FFEEF4`, texte `#B090A8`).
4. `27 RECETTES` en eyebrow `#B090A8`.
5. Grille de cartes sur deux colonnes, gouttière de 12 pt :
   photo en 4/3, dégradé sombre discret en bas de la photo, petit drapeau rond
   en bas à gauche quand la recette a un pays, cœur dans une pastille blanche
   semi-transparente en haut à droite, puis le titre en Cormorant 700 19 pt sur
   fond blanc.
   Recettes visibles, dans cet ordre :
   `Pâtes aux Tapenade d'olives` · `Bazella w rez` 🇱🇧 ·
   `Gateau au chocolat healthy` · `Creamy shrimp pasta` ·
   `Poisson sauce skyr & co` · `Veau aux olives`

### 02 — Frigo Magique *(l'affiche la plus importante)*

- **Eyebrow** : `SANS RÉSEAU, SANS IA`
- **Titre** : `Dis-moi ce qu'il y a` / *`dans ton frigo`*

Contenu de l'écran. **Ces résultats sont ceux que l'algorithme produit vraiment**
pour ce contenu de frigo — je les ai exécutés. Ne les modifie pas.

1. Filet rose + `AKEL LOULOU · FRIGO`.
2. Grand titre sur deux lignes, Cormorant 700 40 pt : `Qu'est-ce` / `qu'on cuisine ?`
3. Chapô en DM Sans 400 15 pt, couleur `#8A6A82` :
   `Dis ce que tu as sous la main, on te dit ce que tu peux préparer.`
4. Champ capsule blanc, hauteur 46 pt, petit `+` rose pâle à gauche,
   placeholder `Ajouter un ingrédient…` ; à droite un bouton rond **plein rose
   `#FF6B9D`** de 46 pt avec une coche blanche.
5. Ligne `DANS MON FRIGO · 4` en eyebrow `#B090A8`, et à droite, en 13 pt
   `#C8B0C0`, `Tout retirer`.
6. Quatre pilules **pleines roses `#FF6B9D`, texte blanc**, chacune suivie d'un
   petit `×` : `OIGNON` · `AIL` · `TOMATE` · `POIS CHICHES`
7. `LES PLUS COURANTS` en eyebrow rose, suivi d'un filet qui file jusqu'au bord.
8. Pilules vides à cocher, fond transparent, bordure `#FFEEF4`, texte `#B090A8`,
   dans cet ordre : `BEURRE` · `FARINE` · `OEUF` · `SUCRE` · `RIZ` ·
   `SAUCE TOMATE` · `PEANUT BUTTER` · `POULET` · `YAOURT`
9. `RÉALISABLE MAINTENANT · 1` en eyebrow rose + filet. Dessous, une carte
   recette **`Chickpea curry`**, et sous la carte, en 12 pt rose `#FF6B9D` :
   `Tout y est`
10. `IL TE MANQUE PEU · 1` en eyebrow rose + filet, puis la carte
    **`Veau aux olives`** avec, dessous, en 12 pt `#C8B0C0` :
    `Manque 2 : Veau, Olives vertes`
11. `PLUS LOIN · 6` en eyebrow rose + filet, puis deux cartes visibles avant la
    coupe : **`Dhal de lentilles`** → `Manque 3 : lentilles corail, Riz`, et
    **`Mdardra`** → `Manque 3 : lentilles vertes, riz`

Les cartes sont sur deux colonnes, même style que sur l'accueil.

### 03 — Menu de la semaine

- **Eyebrow** : `SEPT JOURS, TROIS REPAS`
- **Titre** : `Ta semaine` / *`en un seul geste`*

Contenu de l'écran :

1. Filet rose + `AKEL LOULOU · MENU`.
2. Grand titre Cormorant 700 40 pt : `La semaine`
3. Chapô `#8A6A82` : `5 repas prévus cette semaine.`
4. **Bouton principal pleine largeur**, capsule de 50 pt de haut, dégradé
   `#FF6B9D → #FFA94D`, icône panier blanche + `Envoyer vers les courses` en
   DM Sans 600 14 pt blanc, avec l'ombre rose douce.
5. Dessous, centré, en 13 pt `#C8B0C0` : `Vider la semaine`
6. Cartes de jour : fond blanc, rayon 20, bordure `#FFEEF4`, padding 20 pt.
   Chaque créneau est une ligne : le libellé en 13 pt `#B090A8` à gauche, et à
   droite un bouton rond de 28 pt, bordé `#FFEEF4`, avec un `+` rose.
   Un créneau rempli ajoute **sous cette ligne** une rangée : vignette carrée de
   40 pt (rayon 10) + le titre en Cormorant 700 16 pt + un `×` gris clair à
   droite.
   - **LUNDI** — `Midi` : `Mdardra` · `Goûter` : vide · `Soir` : `Chickpea curry`
   - **MARDI** — `Midi` : `Poisson sauce skyr & co` · `Goûter` : vide ·
     `Soir` : `Bazella w rez`
   - **MERCREDI** — `Midi` : `Veau aux olives` · les deux autres vides. La carte
     est coupée par le bas de l'affiche.

### 04 — Mode cuisson

- **Eyebrow** : `L'ÉCRAN RESTE ALLUMÉ`
- **Titre** : `Une étape à la fois,` / *`minuteur compris`*

Écran **plein écran**, sans barre d'onglets (c'est une modale) :

1. En haut à gauche, une pilule blanche bordée `#FFEEF4` avec `← Retour` en rose.
2. Titre de la recette en eyebrow rose, très espacé : `VEAU AUX OLIVES`
3. Une rangée de 7 segments horizontaux fins (rayon 999, hauteur 4 pt) : les
   cinq premiers pleins en rose `#FF6B9D`, les deux suivants en `#FFEEF4`.
4. `ÉTAPE 5 / 7` en eyebrow `#B090A8`.
5. Le texte de l'étape, **en très grand** : Cormorant Garamond 700, 32 pt,
   interligne 36, couleur `#1A0A1E` — c'est le cœur de l'écran :
   `Une fois que le veau a l'air cuit, couvrir d'eau et laisser mijoter au moins 30 min`
6. **Le minuteur**, la vedette de cette affiche. C'est une **carte** (pas une
   capsule) : fond blanc, rayon 20, bordure `#FFEEF4`, padding 20 pt
   horizontal / 16 pt vertical. De gauche à droite :
   - une icône `−` rose `#FF6B9D` de 16 pt (le minuteur est en marche) ;
   - une colonne : `Minuteur 30 min` en DM Sans 500 13 pt `#B090A8`, et
     **sous** ce libellé le compte à rebours **`24:12`** en Cormorant Garamond
     700 **30 pt** `#1A0A1E` ;
   - à droite, `Pause` en DM Sans 500 13 pt rose `#FF6B9D`.
7. En bas, deux boutons : `← Précédent` en capsule blanche bordée, et
   `Suivant →` en capsule remplie du dégradé de marque, texte blanc.

### 05 — Liste de courses

- **Eyebrow** : `RANGÉE PAR RAYON`
- **Titre** : `Les courses` / *`se remplissent seules`*

Cette liste est celle **réellement produite** par le bouton « Envoyer vers les
courses » de l'affiche 03. Les intitulés de section sont les rayons, avec leur
emoji, en majuscules, suivis d'un filet.

1. Filet rose + `AKEL LOULOU · CARNET`.
2. Grand titre : `Courses`
3. Chapô `#8A6A82` : `17 articles à prendre.`
4. Bouton capsule pleine largeur en dégradé de marque : icône de partage +
   `Partager la liste`.
5. Les sections, dans cet ordre exact :
   - `PRODUITS LAITIERS 🥛` → `Sauce skyr`
   - `ÉPICERIE SÈCHE 🌾` → `lentilles vertes` · `riz` **(coché)** ·
     `Huile d'olive` · `Pois chiches (en conserve)` · `Sauce tomate` **(coché)** ·
     `Pâtes` · `Vermicelles`
   - `VIANDES & POISSONS 🥩` → `Poisson` · `Viande hachée` · `Veau`
   - `FRUITS & LÉGUMES 🥦` → `Oignon` **(coché)** · `Ail` · `Patate douce` ·
     `Haricots verts` — la section est coupée par le bas de l'affiche
6. Chaque article est une ligne : à gauche une case ronde de 22 pt — vide avec
   bordure `#FFD6EB`, ou **remplie de rose `#FF6B9D` avec une coche blanche**
   quand l'article est pris ; le libellé en DM Sans 400 15 pt `#1A0A1E`,
   **barré et en `#C8B0C0` quand il est coché** ; à droite un `×` très discret.

### 06 — Fiche recette

- **Eyebrow** : `LES INGRÉDIENTS, UN PAR UN`
- **Titre** : `Chaque recette,` / *`en entier`*

Attention, un détail que l'on rate souvent : **le dégradé sous la photo va vers
le rose du fond `#FDF6FB`, pas vers du noir**, et le titre de la recette est
donc écrit en **sombre**, pas en blanc.

1. Photo **pleine largeur** en haut (`Shawarma Djej`), qui occupe environ 45 %
   de la hauteur de l'écran. Un dégradé vertical part de transparent (au milieu
   de la photo) et finit en `#FDF6FB` opaque tout en bas, sur 75 % de la hauteur
   de la photo.
2. Pilule `← Retour` blanche flottante en haut à gauche ; à droite, deux boutons
   ronds blancs de 40 pt : un cœur rose et un panier rose.
3. Posés sur le bas de la photo, dans la zone déjà fondue en rose :
   - une **pilule blanche** contenant l'emoji `🍽️` et le mot `PLAT` en DM Sans
     500 10,5 pt très espacé, couleur `#C87800` ;
   - à côté, le petit drapeau libanais, 26 × 18, coins arrondis de 3 ;
   - dessous, le titre `Shawarma Djej` en Cormorant Garamond 700 32 pt,
     couleur **`#1A0A1E`**.
4. `marinade à prévoir` en DM Sans 400 15 pt `#8A6A82`.
   *(Cette recette n'affiche pas de sélecteur de portions — ne l'invente pas.)*
5. `INGRÉDIENTS` en eyebrow rose + filet.
6. Grille d'ingrédients sur 3 colonnes : pour chacun, une **vignette ronde**
   d'environ 64 pt avec la photo de l'ingrédient sur fond `#FFEEF4`, et dessous
   le nom en 13 pt centré, sur deux lignes si besoin. Dans l'ordre :
   `blanc de poulet` · `Vinaigre` · `Yaourt` · `Ail` · `Pommes de terre` ·
   `Huile d'olive` · `Kabis me2te (pickles)` · `Coriandre fraîche`
7. `ÉPICES & ASSAISONNEMENTS` en eyebrow rose + filet, puis des pilules bordées :
   `ÉPICES SHAWARMA` · `PIMENT` · `PAPRIKA`
8. `MATÉRIEL` en eyebrow rose + filet, puis trois vignettes : `Plaque de cuisson`
   · `Four` · `Hachoir`
9. **Bouton Mode cuisson** : capsule pleine largeur, dégradé `#FF6B9D → #FFA94D`,
   une icône `✦` blanche + `Mode cuisson · 6 étapes` en DM Sans 600 blanc.
10. `PRÉPARATION` en eyebrow rose + filet, puis le début de la première étape,
    précédée de son numéro dans un rond rose pâle. La page est coupée ici.

### 07 — Hors ligne *(optionnelle, à faire si tu as le temps)*

- **Eyebrow** : `MÊME EN AVION`
- **Titre** : `Tout reste là,` / *`même sans réseau`*

Écran d'accueil identique à l'affiche 01, **à un détail près** : dans la barre
d'état, l'icône réseau et l'icône Wi-Fi sont remplacées par la petite **icône
avion** d'iOS, en `#1A0A1E`. Les cartes recette sont toutes chargées, avec leurs
photos. C'est tout l'argument : rien ne manque.

---

## 5. La barre d'onglets — cinq onglets, dans cet ordre

Elle apparaît en bas des écrans 01, 02, 03, 05 et 07 (pas sur 04 ni 06, qui sont
des écrans empilés). Sur ce jeu d'affiches, **le téléphone est coupé avant le bas
de l'écran, donc la barre d'onglets n'est généralement pas visible** — c'est
volontaire et cohérent avec les captures existantes. Si tu choisis de la montrer,
elle doit être exacte :

| Position | Libellé | Icône SF Symbols |
|---|---|---|
| 1 | Recettes | `fork.knife` |
| 2 | Frigo | `sparkles` |
| 3 | Menu | `calendar` |
| 4 | Courses | `cart` |
| 5 | Galerie | `photo.on.rectangle` |

Onglet actif en rose `#FF6B9D`, les autres en `#B090A8`. Matériau translucide
iOS par-dessus le fond `#FDF6FB`. **Il n'y a pas d'onglet « À propos »** : cet
écran est atteignable par la pilule en haut de l'onglet Recettes.

---

## 6. Les photos — obligatoire, à lire en entier

Les photos des plats doivent être **les vraies photos de l'application**. Elles
sont publiques, voici les URLs directes. **N'utilise aucune autre image de plat,
d'aucune banque d'images, d'aucun générateur.**

```
Pâtes aux Tapenade d'olives  https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1776781117/bduvop6pg3hbrkedugkb.jpg
Bazella w rez                https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1775304747/y4cdax2nflier7qoguof.jpg
Gateau au chocolat healthy   https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1775304694/tgqyfkgmg4sqwaglehhm.jpg
Creamy shrimp pasta          https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1775302390/dx7kvqygkrbzcryewjvt.jpg
Poisson sauce skyr & co      https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1775300485/cuat6xgrz8benh29s9xg.jpg
Veau aux olives              https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1774567618/ssnhvekquvhebqpoxin7.jpg
Mdardra                      https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1774014747/av13fvb15qab5fqpxale.jpg
Chickpea curry               https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1774562972/ynzh2lwguetuxonoqjgb.jpg
Shawarma Djej                https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1774565637/ph4plct1gtsiuxbkl9uk.jpg
Chicken Alfredo Pasta        https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1773930793/xsdbd6igmvkcma66dr48.jpg
chicken Bowl                 https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1773931546/ddpmsb7a333thungvkw2.jpg
Dhal de lentilles            https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1774566655/bk9qzrctrtiqqyzhtdor.jpg
Gâteau au chocolat           https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1773859972/kczndcgnpsery0azuuwo.jpg
Muffins                      https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1774565140/zb5g4tu1wqlg00zgmzcg.jpg
Tiramisu                     https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1774566744/icbn8g1r81gvlrrbzfi5.jpg
Beklewa                      https://res.cloudinary.com/dtv0rzcra/image/upload/w_1200,c_limit,q_auto,f_auto/v1774564180/jovu7xzkecj2zuuztjxi.jpg
```

### ⛔ Recettes formellement interdites dans les captures

Leurs photos ne nous appartiennent pas, ou leur nom est une marque déposée. Les
faire apparaître entraîne un rejet au titre des règles **5.2.1** (propriété
intellectuelle) et **2.3.9** (captures contenant du contenu tiers) :

```
Butter Chicken · Ramen · Banana Cake · Bourghoul · Cookies Cyril ·
Crumble aux poires · Fudgy Brownie · Oat Dough · Pancakes ·
Reese's Cups · Toffee Crisp
```

Aucun de ces titres, aucune de ces photos, nulle part — pas même flou à
l'arrière-plan d'une grille.

---

## 7. Règles Apple à respecter — un manquement = un rejet

- **2.3.3** — les captures doivent montrer **l'application réellement en
  service**. Le cadre d'iPhone et le titre au-dessus sont autorisés et usuels,
  mais le contenu à l'intérieur de l'écran doit être l'app, pas une illustration
  marketing. N'invente aucun écran qui n'existe pas dans `src/screens/`.
- **2.3.7 / 2.3.8** — aucun prix, aucune mention `gratuit`, `promo`, `bêta`,
  `test`, `démo`, `v1`, `bientôt disponible`. Aucune mention d'une autre
  plateforme : ni `Android`, ni `Google Play`, ni `Play Store`, ni `web`.
- **2.3.9 / 5.2.1** — aucune marque, aucun logo, aucun produit de tiers visible :
  pas de logo Nestlé, Mars, Reese's, Nutella, ni aucun emballage de marque dans
  une photo de plat.
- **Aucun visage de personne reconnaissable.**
- **Aucune boisson alcoolisée** mise en avant.
- Pas d'émoji utilisé comme icône d'interface — les seuls émojis autorisés sont
  ceux qui figurent déjà dans l'app : les pilules de filtre `✨ 🍽️ 🍰 ♥` et les
  noms de rayons de courses `🥦 🌾 🥛 🥩 🥖 ❄️ 🧃 🧴`.
- Textes **en français**, avec les accents corrects. `À propos`, `Goûter`,
  `Épicerie sèche`, `Réalisable`, `ingrédient` — une majuscule accentuée reste
  accentuée.
- Aucune faute : relis `Goûter`, `Mdardra`, `Bazella w rez`, `Shawarma Djej`.

---

## 8. Avant de me rendre les fichiers, vérifie

- [ ] 6 affiches × 3 tailles = **18 fichiers**, aux pixels exacts demandés
- [ ] PNG, RVB, **sans canal alpha**, sans transparence
- [ ] Les couleurs sont les codes hexadécimaux de la section 2, au pixel près
- [ ] Cormorant Garamond pour les titres, DM Sans pour le reste — rien d'autre
- [ ] Chaque libellé est copié mot pour mot depuis la section 4
- [ ] `9:41` dans la barre d'état, batterie à ~85 %, quatre barres de réseau
- [ ] Aucune des 11 recettes interdites n'apparaît
- [ ] Aucune marque tierce, aucun visage, aucun prix, aucune mention Android
- [ ] Les affiches 02, 03 et 04 montrent bien le Frigo, le Menu et le minuteur :
      ce sont elles qui prouvent que l'app n'est pas un simple site web
- [ ] Le texte de l'affiche ne déborde jamais sur l'écran du téléphone
- [ ] Rendu net à 100 % : aucun texte flou, aucun redimensionnement grossier
