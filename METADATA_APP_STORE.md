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
| **URL de support** | `https://laurecipe.akeloulou.workers.dev/support.html` |  |
| **URL marketing** | `https://laurecipe.akeloulou.workers.dev` |  |
| **Politique de confidentialité** | `https://laurecipe.akeloulou.workers.dev/privacy.html` |  |

## Mots-clés (100 caractères max)

```
recette,cuisine,carnet,maison,famille,courses,liste,libanais,plat,dessert,cuisson,minuteur
```

90 caractères. Aucune marque tierce, aucun nom de concurrent, aucun prix — conforme 2.3.7 et 5.6.3.

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

LE MODE CUISSON
Une étape à la fois, en grand caractère, l'écran reste allumé pendant que vous
cuisinez. Les durées citées dans la recette deviennent des minuteurs : un appui
et c'est lancé.

MÊME SANS RÉSEAU
Une fois les recettes chargées, tout reste consultable hors ligne. Pratique en
cuisine, en vacances, ou dans un magasin sans signal.

VOS FAVORIS, LA GALERIE
Marquez ce que vous aimez. Retrouvez toutes les photos des plats au même endroit.
Une envie particulière ? Filtrez par plat, dessert, pays ou tag, ou cherchez
directement par ingrédient.

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
• L'application fonctionne hors ligne après le premier lancement : les recettes
  consultées restent disponibles sans réseau.
• Le mode cuisson maintient l'écran allumé pendant la préparation et propose
  des minuteurs détectés dans le texte des étapes.
• Le formulaire « Proposer une recette » nous envoie un texte libre, en privé.
  Il n'est jamais republié ni montré à d'autres utilisateurs : il n'y a ni
  profils, ni messagerie, ni contenu public entre personnes.

Langue de l'application : français.
Contact : tonybassil292@gmail.com

Merci pour votre lecture.
```

---

## Captures d'écran

Dans `store-screenshots/`, au format **1320 × 2868 (6,9")** :

| Fichier | Accroche | Écran |
|---|---|---|
| `01_accueil.png` | Tout ton carnet **de recettes** | Liste + filtres |
| `02_recette.png` | Chaque ingrédient **en image** | Fiche recette |
| `03_preparation.png` | Les étapes, **une par une** | Préparation |
| `04_filtres.png` | Filtre par pays, **par envie** | Recherche |
| `05_galerie.png` | Toutes tes photos **au même endroit** | Galerie |

⚠️ **Deux réserves :**

1. Les captures affichent **« 27 RECETTES »** alors que l'app en montre **18** depuis
   le masquage des 11 plats sans photo. À regénérer une fois les photos faites,
   sinon il y a un écart entre la capture et l'app (2.3.3).
2. Le format **6,5" (1284 × 2778)** n'est pas encore produit. App Store Connect
   l'exige en plus du 6,9".
