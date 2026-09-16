# MÉTADONNÉES APP STORE — Akel Loulou

Valeurs prêtes à copier dans App Store Connect. Rédigées le 16 septembre 2026.

| | |
|---|---|
| **Apple Team ID** | `G67U5SNR8X` |
| **Bundle ID** | `com.akelloulou.recipes` |
| **EAS Project** | `@tonybueno/akel-loulou` — `48a445ef-cc61-491c-b78a-bd07eba2de97` |
| **Version** | 1.0.0 |

---

## Fiche

| Champ | Valeur | Limite |
|---|---|---|
| **Nom** | `Akel Loulou` | 11/30 |
| **Sous-titre** | `Le carnet de recettes maison` | 28/30 |
| **Langue principale** | Français (France) |  |
| **Catégorie principale** | Cuisine et boissons *(Food & Drink)* |  |
| **Catégorie secondaire** | *(aucune)* |  |
| **SKU** | `akel-loulou-ios-001` |  |
| **Prix** | Gratuit |  |
| **Copyright** | `2026 Toni Bassil` |  |
| **URL de support** | `https://laurecipe.akeloulou.workers.dev/support` |  |
| **URL marketing** | `https://laurecipe.akeloulou.workers.dev` |  |
| **Politique de confidentialité** | `https://laurecipe.akeloulou.workers.dev/privacy` |  |

## Mots-clés (100 caractères max)

```
recette,cuisine,frigo,menu,semaine,courses,liste,minuteur,libanais,oriental,dessert,maison
```

90 caractères. Aucune marque tierce, aucun nom de concurrent, aucun prix — conforme 2.3.7 et 5.6.3.

## Description

```
Akel Loulou réunit des recettes maison — celles qu'on teste, qu'on refait, et
qu'on finit toujours par se faire demander. Cuisine libanaise et orientale,
plats du quotidien, desserts : tout est cuisiné et photographié pour de vrai.

CHAQUE RECETTE, EN ENTIER
Les ingrédients illustrés un par un, les épices, le matériel, et les étapes
détaillées. Ajustez les portions : les quantités se recalculent toutes seules.

LE FRIGO MAGIQUE
Dites ce que vous avez sous la main. L'app classe les recettes en trois temps :
réalisables tout de suite, celles où il ne manque qu'un ou deux ingrédients, et
les autres. Tout le calcul se fait sur votre iPhone, rien n'est envoyé nulle
part.

LE MENU DE LA SEMAINE
Sept jours, trois repas par jour. Posez une recette sur un créneau d'un appui,
puis envoyez toute la semaine vers votre liste de courses : les ingrédients
arrivent déjà regroupés par rayon, sans doublon.

VOTRE LISTE DE COURSES
Un appui sur le panier verse tous les ingrédients d'une recette dans votre
liste. Cochez au fur et à mesure dans les rayons. Partagez-la en un geste.

LE MODE CUISSON
Une étape par écran, en grand, et l'écran reste allumé pendant que vous
cuisinez. Les durées mentionnées dans les étapes deviennent des minuteurs :
un appui et le compte à rebours démarre.

MÊME SANS RÉSEAU
Vos recettes, vos favoris, votre liste de courses, votre menu et votre frigo
restent disponibles hors connexion — en avion, dans un sous-sol ou au fond du
magasin.

TROUVEZ CE DONT VOUS AVEZ ENVIE
Cherchez par ingrédient — « courgette », « chocolat » — et l'app fouille les
titres, les descriptions et les listes d'ingrédients en même temps. Filtrez par
plat, dessert, pays ou tag. Marquez vos favoris.

LA GALERIE
Toutes les photos des plats au même endroit. Touchez-en une pour ouvrir la
recette correspondante.

PROPOSEZ UNE RECETTE
Une idée, une envie ? Envoyez-la directement depuis l'application.

Pas de compte à créer. Pas de publicité. Pas de suivi. Aucune donnée
personnelle collectée.
```

## Nouveautés (version 1.0.0)

```
Première version d'Akel Loulou.
```

## Classification d'âge

- Toutes les questions : **Aucun / Non**
- Résultat attendu : **4+**
- Kids Category : **NON cochée**

## App Privacy Details

**`Data Not Collected`** — aucune donnée n'est collectée.

Justifié : favoris, liste de courses, menu de la semaine, frigo et cache des
recettes restent sur l'appareil (AsyncStorage).
Le seul envoi possible est le texte d'une suggestion de recette, à l'initiative
explicite de la personne, sans nom ni identifiant joint.

## Conformité export

`ITSAppUsesNonExemptEncryption = false` — l'app n'utilise que HTTPS/TLS standard.

## Notes pour l'App Review

*Texte effectivement enregistré dans App Store Connect le 16 septembre 2026.*

```
Bonjour,

Akel Loulou est une application de recettes de cuisine maison. Les recettes,
les photos et les textes sont produits par nos soins : rien n'est repris
d'une source tierce.

FONCTIONNALITÉS NATIVES, POUR VOTRE ÉVALUATION
• Frigo (2e onglet) : saisissez « oignon » puis « riz ». L'application classe
  les recettes en trois groupes — réalisables immédiatement, celles où il ne
  manque qu'un ou deux ingrédients, et les autres. Le calcul est entièrement
  local : aucune requête réseau, aucun service tiers, aucune IA.
• Menu (3e onglet) : touchez le « + » d'un créneau pour y poser une recette,
  sur sept jours et trois repas par jour. « Envoyer vers les courses » agrège
  les ingrédients de la semaine, les regroupe par rayon, sans doublon.
• Mode cuisson : une étape par écran, l'écran reste allumé, et les durées
  écrites dans les étapes deviennent des minuteurs (« Cuire les œufs 6 min »
  dans la recette Ramen).
• Hors ligne : après un premier lancement, mode Avion puis relance. Recettes,
  galerie, favoris, courses, menu et frigo restent disponibles. Un jeu de
  recettes est embarqué pour couvrir un tout premier lancement sans réseau.

CONFIDENTIALITÉ ET PERMISSIONS
• Aucun compte n'est nécessaire. Toutes les fonctionnalités sont accessibles
  dès le lancement. Aucun identifiant de démonstration n'est donc requis.
• Aucun achat intégré, aucune publicité, aucun outil de mesure d'audience,
  aucun suivi. Aucune donnée personnelle n'est collectée.
• Favoris, liste de courses, menu et frigo sont stockés uniquement sur
  l'appareil, jamais transmis à un serveur.
• L'écran « À propos », atteignable depuis le bouton en haut de l'onglet
  Recettes, contient les liens vers la politique de confidentialité et la
  page de support, tous deux publics.
• Le formulaire « Proposer une recette » nous envoie un texte libre, en privé.
  Il n'est jamais republié ni montré à d'autres utilisateurs : il n'y a ni
  profils, ni messagerie, ni contenu public entre personnes.
• L'application ne demande aucune autorisation système.

Langue de l'application : français.
Contact : tonybassil292@gmail.com

Merci pour votre lecture.
```

---

## Captures d'écran

Dans `store-screenshots/6.9/` (**1320 × 2868**) et `store-screenshots/6.5/` (**1284 × 2778**) :

| Fichier | Accroche | Écran |
|---|---|---|
| `01_accueil.png` | Tout ton carnet **de recettes** | Liste + filtres |
| `02_recette.png` | Chaque ingrédient **en image** | Fiche recette |
| `03_preparation.png` | Les étapes, **une par une** | Préparation (fiche recette) |
| `04_filtres.png` | Filtre par pays, **par envie** | Recherche |
| `05_galerie.png` | Toutes tes photos **au même endroit** | Galerie |

⚠️ **Deux réserves :**

1. Les captures affichent **« 27 RECETTES »**, l'app en montre **29** depuis la
   restauration des 11 plats. Écart mineur mais réel (2.3.3) : à regénérer une
   fois les nouvelles photos en place — le script est prêt.
2. Les deux formats exigés par App Store Connect sont produits.

---

# FICHE APP STORE CONNECT — à remplir de A à Z

## Étape 1 — Créer l'enregistrement de l'app *(toi, 2 minutes, web uniquement)*

L'API App Store Connect **ne permet pas** de créer une app. Citation de la documentation Apple
(`developer.apple.com/documentation/appstoreconnectapi/apps`) :

> *« Don't use this API to create new apps; instead, create new apps on the App Store Connect website. »*

Sur https://appstoreconnect.apple.com → **Apps** → **+** → **Nouvelle app** :

| Champ | Valeur exacte |
|---|---|
| Plateformes | **iOS** uniquement |
| Nom | `Akel Loulou` |
| Langue principale | **Français (France)** |
| Bundle ID | `com.akelloulou.recipes` |
| SKU | `akel-loulou-ios-001` |
| Accès utilisateur | Accès complet |

> Si le Bundle ID n'apparaît pas dans la liste, c'est qu'il n'est pas encore enregistré sur le
> portail développeur. Il le sera automatiquement au premier `eas build`, ou manuellement sur
> Certificates, IDs & Profiles → Identifiers → **+** → App IDs → App → `com.akelloulou.recipes`.

## Étape 2 — Informations sur l'app

| Champ | Valeur |
|---|---|
| Sous-titre | `Le carnet de recettes maison` |
| Catégorie principale | **Cuisine et boissons** |
| Catégorie secondaire | *(laisser vide)* |
| Droits d'auteur | `2026 Toni Bassil` |

## Étape 3 — Classification par âge → **4+**

Réponds **« Aucun / Non »** à l'intégralité du questionnaire. Détail des rubriques sensibles :

| Question | Réponse | Pourquoi |
|---|---|---|
| Violence dessinée ou fantastique | Aucun | Photos de plats uniquement |
| Violence réaliste | Aucun | — |
| Contenu sexuel ou nudité | Aucun | — |
| Blasphème ou humour grossier | Aucun | — |
| Alcool, tabac, drogues | **Aucun** | Aucune recette visible n'en contient. *À revérifier si tu ajoutes une recette au vin* |
| Thèmes horrifiques | Aucun | — |
| Jeux d'argent | Aucun | — |
| Concours | Aucun | — |
| Contenu généré par les utilisateurs **non modéré** | **Non** | Les suggestions ne sont jamais republiées |
| Accès web non restreint | **Non** | Aucune WebView dans l'app |
| Fonctions de messagerie | Non | — |
| **Kids Category** | **NON cochée** | Guideline 1.3 |

**Résultat attendu : 4+**

## Étape 4 — Confidentialité de l'app → **Aucune donnée collectée**

Écran « Confidentialité de l'app » → **« Non, nous ne collectons aucune donnée de cette app »**.

Justification, vérifiable dans le code :

| Donnée | Où elle vit | Quitte l'appareil ? |
|---|---|---|
| Favoris | `src/lib/favorites.ts` — AsyncStorage | **Non** |
| Liste de courses | `src/lib/shopping-list.ts` — AsyncStorage | **Non** |
| Menu de la semaine | `src/lib/week-plan.ts` — AsyncStorage | **Non** |
| Ingrédients du frigo | `src/lib/fridge-store.ts` — AsyncStorage | **Non** |
| Cache des recettes | `@tanstack/query-async-storage-persister` — AsyncStorage | **Non** |
| Suggestion de recette | `src/lib/queries.ts` | Oui, **sur action explicite**, texte libre seul — ni nom, ni e-mail, ni identifiant d'appareil |

Aucun SDK d'analyse, aucune publicité, aucun IDFA, aucun App Tracking Transparency,
aucune localisation, aucun compte. `NSPrivacyTracking: false` dans le manifeste.

> Le champ libre « suggestion » est du contenu fourni volontairement, sans identifiant associé,
> et n'est pas rattaché à une personne. C'est ce qui permet de déclarer « aucune donnée collectée ».
> Si tu réintroduis un jour le champ prénom, cette déclaration devient fausse — il faudra
> déclarer `Contact Info → Name`.

## Étape 5 — URL

| Champ | Valeur |
|---|---|
| URL de support | `https://laurecipe.akeloulou.workers.dev/support` |
| URL marketing | `https://laurecipe.akeloulou.workers.dev` |
| Politique de confidentialité | `https://laurecipe.akeloulou.workers.dev/privacy` |

Les trois répondent **HTTP 200**, vérifié après déploiement.

## Étape 6 — Captures d'écran

`store-screenshots/6.9/` (1320 × 2868) et `store-screenshots/6.5/` (1284 × 2778), 5 chacune.

## Étape 7 — Conformité export

`ITSAppUsesNonExemptEncryption = false`. L'app n'utilise que HTTPS/TLS standard, exemption
applicable, aucun document ERN à fournir.

## Étape 8 — Build

```powershell
cd C:\Users\tonyb\Documents\AkelLoulou-mobile
npx eas-cli@latest build -p ios --profile production
npx eas-cli@latest submit -p ios --latest
```

Le build monte dans TestFlight. **Ne pas cliquer « Soumettre pour examen »** avant le
remplacement des 11 photos.
