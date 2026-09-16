# Akel Loulou — application mobile

L'app iOS / Android du carnet de recettes [Akel Loulou](https://laurecipe.akeloulou.workers.dev).
Elle lit et ecrit **le meme projet Supabase que le site** : une recette ajoutee
ici apparait sur le web, et inversement.

- Expo SDK 57 · React Native 0.86 · New Architecture
- Expo Router (routes dans `src/app/`), onglets natifs (`NativeTabs`)
- `@expo/ui` pour les feuilles natives, `expo-symbols` / Material pour les icones
- TanStack Query pour le cache reseau, AsyncStorage pour les favoris et le planning

## Demarrer

```bash
npm install
npx expo start
```

Puis scanner le QR code avec **Expo Go**.

> Sous Windows, lancer les commandes depuis PowerShell (pas WSL) : les binaires
> natifs de Metro sont installes pour win32.

## Variables d'environnement

Tout est dans `.env` et **rien n'y est secret** : ce sont les valeurs publiques
deja presentes dans le bundle du site. Les droits d'ecriture sont decides par les
policies RLS de Supabase, pas par ces cles.

| Variable | Role |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Projet Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Cle publiable |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Hebergement des photos |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Preset d'upload non signe |

## Ce que fait l'app

**Public** — grille de recettes avec recherche (titre, description, ingredients),
filtres categorie / pays / tags / favoris ; fiche recette complete (photo,
ingredients illustres, epices, materiel, etapes numerotees, recettes liees,
calcul des portions, partage, liste de courses) ; planning de la semaine
(7 jours x midi / gouter / soir) avec liste de courses agregee ; galerie ;
page A propos ; proposition de recette.

**Admin** (compte Supabase Auth) — tableau de bord, gestion des recettes
(recherche, masquer, supprimer), ajout et edition avec upload photo Cloudinary.

Les favoris et le planning restent sur l'appareil : l'app est utilisable hors
ligne une fois les recettes chargees.

## Notifications

L'app enregistre son jeton Expo dans la table `push_subscriptions`, la meme que
le site (colonne `platform` pour distinguer web / ios / android). **Expo Go ne
delivre plus de jeton push depuis le SDK 53** : il faut une build de dev ou
TestFlight pour tester reellement.

## Publier sur l'App Store

```bash
npm install -g eas-cli
eas login
npx eas-cli@latest init          # cree extra.eas.projectId
npx eas-cli@latest build -p ios --profile production --auto-submit
```

Prerequis : un compte Apple Developer (99 $/an). Aucun Mac n'est necessaire,
la build tourne sur les serveurs EAS.
