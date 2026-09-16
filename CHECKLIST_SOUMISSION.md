# CHECKLIST DE SOUMISSION — Akel Loulou

Ordre chronologique strict. **Ne pas sauter d'étape.**
Chaque case ne se coche qu'après vérification réelle, pas « ça devrait aller ».

---

## ÉTAPE 0 — Prérequis

- [ ] Compte **Apple Developer Program actif** (99 $/an) — *sans lui, rien n'est soumettable*
- [ ] Identité du développeur vérifiée par Apple (5.6.2)
- [ ] Connecté à EAS : `npx expo whoami` → `tonybueno`
- [ ] Projet versionné : `git log` affiche ≥ 1 commit **dans `AkelLoulou-mobile`** (pas dans `C:\Users\tonyb`)
- [ ] Ancien token robot `laurecipes` **révoqué** sur https://expo.dev/settings/access-tokens

---

## ÉTAPE 1 — Code (tous les 🔴 du Lot 1)

- [ ] Icône 1024×1024 originale, sans transparence, sans coins arrondis, **sans emoji**, sans logo tiers
- [ ] Assets template supprimés : `expo-logo.png`, `react-logo@{1,2,3}x.png`, `expo-badge*.png`, `tutorial-web.png`
- [ ] `scripts/reset-project.js` supprimé + script npm `reset-project` retiré
- [ ] `android.permission.RECORD_AUDIO` supprimé d'`app.json`
- [ ] Champ « prénom » retiré du formulaire de suggestion
- [ ] Notifications push retirées *(si D-01)*
- [ ] Espace admin retiré du build *(si D-02)*
- [ ] `supportsTablet` cohérent avec la réalité *(D-03)*
- [ ] Au moins **3 fonctions natives** livrées (hors ligne, liste de courses, mode cuisine)
- [ ] `ios.privacyManifests` déclaré dans `app.json` avec `CA92.1`
- [ ] Lien « Politique de confidentialité » présent dans l'écran À propos
- [ ] `npx tsc --noEmit` → aucune erreur
- [ ] `npx expo export --platform ios` → succès

---

## ÉTAPE 2 — Contenu

- [ ] `select count(*) from recipes where image_url not like 'https://res.cloudinary.com/%' and hidden is not true and is_secondary is not true;` → **0**
- [ ] Recette « Reese's Cups » renommée
- [ ] Recette « Toffee Crisp » renommée
- [ ] Photo À propos sans logo Nestlé visible
- [ ] Images d'ingrédients : plus de dépendance à `themealdb.com` *(ou CGU vérifiées et documentées)*
- [ ] Inventaire des recettes contenant de l'alcool établi

---

## ÉTAPE 3 — Documents en ligne

- [ ] Politique de confidentialité publiée — URL : `________________________` → HTTP 200
- [ ] Page de support publiée — URL : `________________________` → HTTP 200
- [ ] Les deux pages mentionnent un email de contact fonctionnel

---

## ÉTAPE 4 — Build et TestFlight

- [ ] `npx eas-cli@latest build -p ios --profile production`
- [ ] Build terminé sans erreur
- [ ] Build visible dans App Store Connect (traitement ≈ 15 min)
- [ ] Installé via **TestFlight sur un iPhone réel**
- [ ] ✋ **Parcours manuel complet** :
  - [ ] Lancement à froid < 3 s, aucun écran blanc
  - [ ] Les 4 onglets s'ouvrent (Recettes, Galerie, À propos + le nouveau)
  - [ ] Ouverture d'une recette, retour par **geste de balayage**
  - [ ] Favori : ajout, fermeture de l'app, réouverture → toujours là
  - [ ] Recherche par ingrédient → résultats cohérents
  - [ ] Filtres Pays et Tags
  - [ ] Partage d'une recette
  - [ ] **Mode avion** → contenu affiché, pas d'écran vide
  - [ ] **Dynamic Type au maximum** (Réglages → Affichage → Texte + grand) → aucun texte tronqué
  - [ ] **Mode sombre**
  - [ ] **VoiceOver** activé → navigation possible, boutons annoncés
  - [ ] Aucun bouton inerte, aucun « bientôt disponible »
- [ ] Testé sur **iPad** *(si `supportsTablet: true`)*
- [ ] Testé en **IPv6-only**

---

## ÉTAPE 5 — Métadonnées App Store Connect

| Champ | Valeur à saisir |
|---|---|
| **Nom** | `Akel Loulou` *(30 car. max, sans emoji)* |
| **Sous-titre** | `Le carnet de recettes de la famille` *(30 car. max)* |
| **Langue principale** | Français (France) |
| **Bundle ID** | `com.akelloulou.recipes` |
| **SKU** | `akel-loulou-ios-001` |
| **Catégorie principale** | Cuisine et boissons *(Food & Drink)* |
| **Catégorie secondaire** | *(laisser vide)* |
| **Mots-clés** | `recettes,cuisine,carnet,maison,famille,libanais,plats,desserts` — *sans marque tierce, sans nom de concurrent (2.3.7, 5.6.3)* |
| **URL de support** | *(celle de l'étape 3)* |
| **URL marketing** | `https://laurecipe.akeloulou.workers.dev` *(facultatif)* |
| **Politique de confidentialité** | *(celle de l'étape 3)* |
| **Copyright** | `2026 [TON NOM]` |
| **Nouveautés** | `Première version.` |

- [ ] **Description** rédigée : ce que fait l'app, pour qui, ses fonctions natives. **Sans** mention « Android », « Google Play », « beta », « test », **sans** prix, **sans** marque tierce (2.3.10, 2.3.8)
- [ ] **Captures d'écran** — écrans **réels**, pas de mockup marketing (2.3.3) :
  - [ ] 6,9" (1320 × 2868) — obligatoire — au moins 3
  - [ ] 6,5" (1284 × 2778) — obligatoire — au moins 3
  - [ ] 13" iPad *(uniquement si `supportsTablet: true`)*
- [ ] Aucune capture ne contient une image tierce non autorisée (2.3.9)

---

## ÉTAPE 6 — Classification d'âge

- [ ] Questionnaire rempli **honnêtement** (2.3.6)
- [ ] Alcool : répondre selon l'inventaire de l'étape 2
- [ ] **Kids Category : NON cochée** (1.3)
- [ ] Résultat attendu : **4+** *(à confirmer après l'inventaire alcool)*

---

## ÉTAPE 7 — App Privacy Details (nutrition labels)

> ⚠️ Ne cocher « Data Not Collected » **que si** les tâches T-103, T-104 et T-105 sont réellement faites. Une déclaration inexacte est un motif de rejet aggravé.

**Si le nettoyage est fait :**
- [ ] `Data Not Collected` ✅

**Si les push ou le formulaire avec prénom restent :**
- [ ] `Identifiers → Device ID` — usage : App Functionality — lié à l'utilisateur : Non — tracking : **Non**
- [ ] `Diagnostics → Other Diagnostic Data` (modèle d'appareil) — App Functionality — Non — Non
- [ ] `Contact Info → Name` (prénom) — App Functionality — Non — Non
- [ ] `User Content → Other User Content` (texte de suggestion) — App Functionality — Non — Non
- [ ] **Tracking : Non** dans tous les cas (aucun SDK publicitaire, aucun IDFA)

---

## ÉTAPE 8 — Conformité export

- [ ] `ITSAppUsesNonExemptEncryption = false` confirmé (`app.json:18`)
- [ ] ASC ne demande aucun document ERN supplémentaire

---

## ÉTAPE 9 — App Review Notes

- [ ] Texte du squelette T-206 collé dans « Notes pour l'App Review »
- [ ] Email de contact renseigné
- [ ] Compte démo : **non requis** *(si D-02 appliqué — le préciser explicitement)*
- [ ] Mention que l'app fonctionne hors ligne
- [ ] Mention que les suggestions ne sont **pas** republiées

---

## ÉTAPE 10 — Dernière relecture avant envoi

- [ ] Relire `AUDIT_APPLE.md` : **aucun 🔴 restant**
- [ ] Le binaire sélectionné est bien celui testé en TestFlight
- [ ] Prix : **Gratuit**
- [ ] Disponibilité : tous les pays *(ou la liste choisie)*
- [ ] Sortie : manuelle *(recommandé, pour contrôler la date)*
- [ ] Version : `1.0.0`

---

## ÉTAPE 11 — Envoi

- [ ] **Submit for Review**
- [ ] Statut « Waiting for Review » confirmé
- [ ] Notifications ASC activées pour suivre la revue

---

## SI REJET

1. Lire le message d'App Review : il cite **toujours** un numéro de guideline.
2. Retrouver la ligne correspondante dans `AUDIT_APPLE.md`.
3. Répondre dans le **Resolution Center** — ne pas resoumettre en silence.
4. Si tu contestes, argumente avec des faits ; sinon corrige et resoumets.

**Les 3 motifs les plus probables pour cette app, dans l'ordre :**
1. **4.2 Minimum Functionality** — réponse : lister les fonctions natives ajoutées (hors ligne, liste de courses, minuteurs) et expliquer en quoi elles dépassent une page web.
2. **5.2.1 Intellectual Property** — réponse : confirmer que toutes les photos sont des photos de famille, et fournir la preuve.
3. **2.3.3 Screenshots** — réponse : remplacer par des captures d'écrans réels.
