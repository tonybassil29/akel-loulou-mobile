# Passation — reprise du projet sur Mac

Ce fichier est écrit pour l'assistant qui reprend le projet sur macOS. Lis-le en
entier avant d'agir. L'objectif immédiat est de **lancer l'app sur un iPhone ou
un simulateur, vérifier qu'elle ne plante pas, puis soumettre à App Review**.

---

## 1. Ce qui est déjà fait

L'app est **complète et le binaire est déjà chez Apple**.

| | |
|---|---|
| Bundle ID | `com.akelloulou.recipes` |
| App Store Connect | app `6812901310`, version `1.0.0`, état `PREPARE_FOR_SUBMISSION` |
| Build | **build 6, `VALID`, rattaché à la version**, visible dans TestFlight |
| Apple Team ID | `58D7WWSVBF` |
| Compte EAS | `tonybueno` — quota de builds cloud **épuisé jusqu'au 1er octobre 2026** |

Fiche App Store remplie et vérifiée par API : description (1995 car.), mots-clés
(90/100), texte promotionnel, 14 captures validées par Apple (7 en 1320×2868 dans
le slot `APP_IPHONE_67`, 7 en 1284×2778 dans `APP_IPHONE_65`), copyright,
classification 4+, catégorie Cuisine et boissons, notes de revue (2463 car.),
téléphone de contact réel, tarification gratuite, tous les pays cochés.

### Fonctionnalités (elles répondent à la guideline 4.2)

Recettes, recherche, filtres, favoris, galerie, liste de courses — plus les
cinq fonctions natives ajoutées pour sortir du « repackaged website » :

- **Frigo Magique** (`src/lib/fridge-match.ts`) — 100 % local, aucun réseau
- **Menu de la semaine** (`src/lib/week-plan.ts`) — génère les courses par rayon
- **Mode cuisson** (`src/screens/cooking-mode.tsx`) — écran maintenu allumé, minuteurs
- **Hors ligne complet** — cache React Query persisté + `src/assets/fallback-recipes.json`
- Navigation à 5 onglets : Recettes · Frigo · Menu · Courses · Galerie

### Conformité contenu

Il n'y a **plus une seule marque** dans l'app — vérifié en simulant la
résolution d'image sur les 171 ingrédients des 29 recettes, pas en relisant les
tables. 22 photos d'ingrédients ont été produites et téléversées sur Cloudinary.
Trois pièges ont été trouvés et corrigés en chemin :

1. `settings.custom_ingredient_images` contenait des packshots de marque
   (Nestlé YAOS, Vahiné, Alsa, Carrefour, Al Wadi, Samia, Envia, La Fermière) ;
2. `src/lib/ingredient-images.ts` en contenait 29 autres (Tate & Lyle,
   Dr. Oetker, Anchor, Hershey's, Colman's, Sarson's, Swanson, Alpro, Sargento) ;
3. un **repli** en fin de `getIngredientImage` fabriquait une URL TheMealDB à
   partir du nom de l'ingrédient — il ramenait le pot Dr. Oetker pour
   « peanut butter » même après suppression de l'entrée. Ce repli est supprimé :
   **aucune image n'est affichée sans avoir été relue**.

Deux recettes ont été renommées parce que leur titre était une marque déposée :
`Reese's Cups` → **Cups chocolat cacahuète**, `Toffee Crisp` → **Croustillant
caramel chocolat** (et l'ingrédient `5 Mars` → `5 barres chocolatées caramel`).

---

## 2. Ce qui reste à faire, par ordre de priorité

### ⚠️ 1. Lancer le binaire sur un appareil — jamais fait

C'est le **risque le plus élevé du dossier**, plus que les images. Guideline 2.1 :
*« We will reject incomplete app bundles and binaries that crash »*. Le code a
été validé par `tsc`, par un export web et par une archive iOS réussie, mais
**jamais exécuté sur iOS**. Or tout ce qui suit est natif et non éprouvé :

- `expo-router/unstable-native-tabs` (la barre d'onglets)
- `@expo/ui` `BottomSheet` (sélecteur de recette du Menu, filtres Pays/Tags)
- `expo-symbols` (SF Symbols — `deploymentTarget` est à **16.4**, obligatoire
  pour le SDK 57 ; vérifier qu'aucune icône ne rend vide)
- `expo-keep-awake` (mode cuisson)

**À vérifier écran par écran :** les 5 onglets · une fiche recette · le mode
cuisson et un minuteur qui décompte · le sélecteur du Menu · « Envoyer vers les
courses » · le mode avion après un premier lancement.

### 2. Les 13 photos de recettes qui ne nous appartiennent pas

```sql
select title, image_url from recipes
where coalesce(hidden,false)=false and coalesce(is_secondary,false)=false
  and split_part(split_part(image_url,'//',2),'/',1) <> 'res.cloudinary.com';
```

Guideline 5.2.1. Tant qu'elles sont là, `contentRightsDeclaration` doit rester
`USES_THIRD_PARTY_CONTENT`.

### 3. Deux cases dans App Store Connect

- **App Privacy** → « Data Not Collected » doit être **publié** (bouton bleu).
  Aucune API n'expose ce champ, il faut le voir dans l'interface.
- **App Information → Content Rights** → repasser sur « No » une fois les 13
  photos remplacées.

### 4. Trois vignettes affichent encore un code à deux lettres

`Cannelle`, `Chipotle`, `Pousse de soja` — images cassées d'origine, pas des
marques. Le brief pour les régénérer est dans
`scripts/illustrations/PROMPT_LOT_2.md`.

---

## 3. Fichiers à recopier à la main (ils ne sont pas dans git)

Par AirDrop ou clé USB, **jamais par git** :

```
.env                                   variables publiques Supabase + Cloudinary
credentials.json                       chemins du .p12 et son mot de passe
.secrets/akel-dist.p12                 certificat de distribution (Y2B22BVCNA)
.secrets/akel-dist.p12.password        son mot de passe
.secrets/akel-dist.key                 clé privée du certificat
.secrets/akel-appstore.mobileprovision profil de provisionnement (3N2HL857GJ)
.secrets/AuthKey_A476YC7FGM.p8         clé API App Store Connect
```

Ces credentials ont été **créés directement via l'API Apple**, parce qu'EAS
refuse de générer un certificat en mode non interactif. Certificat et profil
expirent le **17/09/2027**.

---

## 4. Commandes

```bash
npm install

# simulateur / appareil, en temps réel — c'est l'étape qui manque
npx expo run:ios

# build de production en local, sans toucher au quota EAS
npx eas-cli@latest build -p ios --profile production --local

# envoi vers TestFlight (ascAppId est déjà dans eas.json)
npx eas-cli@latest submit -p ios --profile production --latest
```

`eas.json` a `"credentialsSource": "local"` : le build lit `credentials.json`
et ne pose aucune question.

**Ne pas** lancer `eas build` sans `--local` avant le 1er octobre : le quota
cloud est épuisé et la commande échouera après avoir téléversé le projet.

---

## 5. Pièges connus, à ne pas redécouvrir

- **`deploymentTarget` doit rester à `16.4`.** À 16.0, CocoaPods ne lie aucun
  module Expo du SDK 57 (`expo was not linked: requires iOS 16.4`).
- **`newArchEnabled` n'existe plus** dans le schéma du SDK 57.
- **Xcode 16.4 ne sait pas résoudre les paquets Swift de React Native 0.86**
  (`Could not resolve package dependencies`). Il faut Xcode 26 ou plus récent.
- **Ne pas installer `expo-updates`.** Il interroge les serveurs Expo à chaque
  lancement, ce qui contredit le « aucune donnée collectée, aucun SDK tiers »
  déjà déclaré à Apple. Le canal a été retiré du profil `production` pour ça.
- **Les routes typées** (`.expo/types/router.d.ts`) ne sont écrites que par le
  serveur de dev, ni par `tsc` ni par `expo export`. Après avoir ajouté une
  route, lancer `npx expo start` quelques secondes avant de typer.
- **`npm ci` vs `npm install`** : le `package-lock.json` est à jour, les deux
  marchent.

---

## 6. Où lire le reste

- `METADATA_APP_STORE.md` — tous les textes de la fiche, tels qu'enregistrés
- `CHECKLIST_SOUMISSION.md` — la checklist de soumission, à jour
- `AUDIT_APPLE.md` — l'audit initial des guidelines
- `scripts/illustrations/README.md` — d'où viennent les photos d'ingrédients
- `store-screenshots/PROMPT_CLAUDE_DESIGN.md` — comment refaire les captures
