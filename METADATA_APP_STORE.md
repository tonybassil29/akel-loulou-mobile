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
recette,cuisine,carnet,maison,famille,courses,liste,libanais,plat,dessert,galerie
```

88 caractères. Aucune marque tierce, aucun nom de concurrent, aucun prix — conforme 2.3.7 et 5.6.3.

## Description

```
Akel Loulou, c'est le carnet de recettes d'une famille — celles qu'on se
transmet, qu'on refait le dimanche, et qu'on finit toujours par demander.

CHAQUE RECETTE, EN ENTIER
Les ingrédients illustrés un par un, les épices, le matériel, et les étapes
détaillées. Ajustez les portions : les quantités se recalculent toutes seules.

VOTRE LISTE DE COURSES
Un appui sur le panier verse tous les ingrédients d'une recette dans votre
liste. Cochez au fur et à mesure dans les rayons, regroupé par plat. Partagez-la
en un geste.

VOS FAVORIS, LA GALERIE
Marquez ce que vous aimez. Retrouvez toutes les photos des plats au même endroit.
Une envie particulière ? Filtrez par plat, dessert, pays ou tag, ou cherchez
directement par ingrédient — le titre, la description et la liste des courses
sont fouillés en même temps.

PROPOSEZ VOS RECETTES
Une idée, un plat de famille ? Envoyez-la nous directement depuis l'application.

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

Justifié : favoris, liste de courses et cache restent sur l'appareil (AsyncStorage).
Le seul envoi possible est le texte d'une suggestion de recette, à l'initiative
explicite de la personne, sans nom ni identifiant joint.

## Conformité export

`ITSAppUsesNonExemptEncryption = false` — l'app n'utilise que HTTPS/TLS standard.

## Notes pour l'App Review

```
Bonjour,

Akel Loulou est le carnet de recettes de notre famille. Les recettes, les
photos et les textes sont les nôtres.

• Aucun compte n'est nécessaire. Toutes les fonctionnalités sont accessibles
  dès le lancement. Aucun identifiant de démonstration n'est donc requis.
• Aucun achat intégré, aucune publicité, aucun outil de mesure d'audience,
  aucun suivi. Aucune donnée personnelle n'est collectée.
• Les favoris et la liste de courses sont stockés uniquement sur l'appareil.
• Le formulaire « Proposer une recette » nous envoie un texte libre, en privé.
  Il n'est jamais republié ni montré à d'autres utilisateurs : il n'y a ni
  profils, ni messagerie, ni contenu public entre personnes.

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
