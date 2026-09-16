# PLAN D'ACTION — Mise en conformité App Store

**App :** Akel Loulou · `com.akelloulou.recipes` · v1.0.0
**Basé sur :** `AUDIT_APPLE.md` (guidelines du 8 juin 2026)
**Durée estimée totale :** **6 à 9 jours de travail effectif**, hors délais de revue Apple (24–48 h) et hors séance photo.

> ⚠️ **Rien de ce plan n'est appliqué.** Le code est intact. Ce document décrit ce qu'il faudra faire après ton « GO ».

---

## ÉTAT D'AVANCEMENT — 16 septembre 2026

Exécuté après ton « GO », en retenant **toutes mes recommandations du Lot 0** (D-01 à D-09).
Deux commits : `a9110e8` (état initial, point de retour) et `4943661` (mise en conformité).

### ✅ Fait

| Tâche | Guideline | Preuve |
|---|---|---|
| T-101 Icône originale + purge template | 4.1, 4.2.6, 5.2.1 | `assets/images/icon.png` régénérée ; 8 assets et `scripts/` supprimés |
| T-102 Trois fonctions natives | 4.2, 4.3(b) | cache persistant, liste de courses, mode cuisson — écrans vérifiés |
| T-103 Minimisation des données | 5.1.1(iii), 2.5.14 | `RECORD_AUDIO`, champ prénom et `user_agent` supprimés |
| T-104 Push retirées | 4.5.4, 2.1 | `src/lib/push.ts` supprimé, plugin retiré |
| T-105 Admin retiré du build | 2.3.1, 5.1.1(ii) | `src/app/admin/` supprimé ; routes générées sans `/admin` |
| T-106 Privacy manifest | A1, A2 | `ios.privacyManifests` avec `CA92.1` |
| T-107 Hors ligne | 4.2.3, 2.1 | `PersistQueryClientProvider` + `gcTime` 7 j |
| T-202 Politique de confidentialité | 5.1.1(i) | `public/privacy.html` + lien dans À propos |
| T-203 Page de support | 1.5 | `public/support.html` + lien dans À propos |
| T-207 Versionnement | A11 | dépôt git dédié, isolé du dépôt accidentel |
| D-03 iPad désactivé | 2.4.1 | `supportsTablet: false` |
| T-401 Mention allergènes | 1.4 | visible dans À propos |
| T-402 Dépendances inutilisées | 2.5.2, 2.5.6 | 11 paquets retirés |
| T-403 Deployment target | 2.5.1 | `ios.deploymentTarget: "16.0"` |

**Vérifications :** `tsc --noEmit` clean · bundle iOS **2,63 Mo** (contre 8,3 Mo avant) · export web OK · 5 écrans rendus et screenshottés · **0 erreur console**.

### ⛔ Reste à faire — et ça ne dépend pas de moi

| Tâche | Pourquoi je ne peux pas | Bloquant ? |
|---|---|---|
| **T-201 Photos des 11 plats** | Il faut cuisiner et photographier | 🔴 **OUI** — 5.2.1 |
| **D-06 Renommer 2 recettes** | Écriture sur la base de production, à ta main via l'admin du site | 🔴 OUI |
| **D-07 Photo À propos (tablier Nestlé)** | Recadrage ou autre photo, à ton choix | 🔴 OUI |
| **D-05 Images d'ingrédients TheMealDB** | Décision à trancher : pictogrammes ou licence | 🟠 |
| **Remplir `[VOTRE NOM]` / `[VOTRE-EMAIL]`** dans `privacy.html` et `support.html` | Tes coordonnées | 🔴 OUI |
| **Déployer le site** (les 2 pages HTML) | `wrangler login` requis | 🔴 OUI |
| **T-204/205/206 App Store Connect** | Compte Apple Developer requis | 🔴 OUI |
| **T-301 / T-302 / T-307 tests appareil** | iPhone réel, réseau IPv6-only | 🟠 |

---

## LOT 0 — Décisions produit (à trancher avant toute ligne de code)

Ces choix conditionnent tout le reste. J'indique ma recommandation ; dis-moi si tu diverges.

| ID | Décision | Ma recommandation | Conséquence |
|---|---|---|---|
| D-01 | **Notifications push en V1 ?** | ❌ **Retirer** | Supprime `expo-notifications`, la collecte de jeton + modèle d'appareil, une entrée du privacy manifest et le risque 4.5.4 « fonctionnalité annoncée mais inopérante ». Réintroduisible en V2 avec le cron. |
| D-02 | **Espace admin dans le build App Store ?** | ❌ **Masquer** | Supprime 2.3.1 (fonction non documentée), la permission photos, l'obligation de compte démo, et le stockage de session. Tu continues d'administrer depuis le site web. |
| D-03 | **iPad supporté ?** | ⚠️ **`supportsTablet: false`** en V1 | Sans Mac ni simulateur, tu ne peux pas valider le rendu iPad. Déclarer faux est honnête et supprime le risque 2.4.1. Réactivable après test. |
| D-04 | **Les 11 photos non authentiques** | 📸 **Re-photographier les plats** | Seule solution propre pour 5.2.1. Alternative dégradée : masquer ces 11 recettes (`hidden = true`) → le catalogue tombe à 18 recettes, ce qui aggrave 4.2. |
| D-05 | **Images d'ingrédients TheMealDB** | 🔄 **Remplacer par des pictogrammes SF Symbols** ou rapatrier sous licence vérifiée | Supprime la dépendance à un CDN tiers et le risque 5.2.2. Les SF Symbols sont gratuits et natifs. |
| D-06 | **Recettes « Reese's Cups » / « Toffee Crisp »** | ✏️ **Renommer** : « Bouchées chocolat-cacahuète », « Croustillant caramel-chocolat » | Supprime 2 marques déposées |
| D-07 | **Photo À propos (tablier Nestlé)** | ✂️ **Recadrer** au-dessus du logo, ou autre photo | Supprime une marque visible |
| D-08 | **Langue de l'app** | 🇫🇷 **Français uniquement**, assumé dans ASC | Évite le coût d'une localisation complète |
| D-09 | **Fonctions natives à ajouter pour 4.2** | Voir Lot 1 — **choisir au moins 3** | C'est le point qui décide de l'acceptation |

---

## LOT 1 — Bloqueurs 🔴 CODE

### T-101 · Remplacer l'icône et purger les assets du template
**Guidelines :** 4.1, 4.2.6, 5.2.1 · **Effort :** M · **Dépend de :** rien

**Fichiers :** `assets/images/icon.png`, `splash-icon.png`, `favicon.png`, `android-icon-*.png`, `expo-logo.png`, `react-logo@{1,2,3}x.png`, `expo-badge*.png`, `tutorial-web.png`, `scripts/reset-project.js`, `package.json` (script `reset-project`)

**Étapes**
1. Créer une icône 1024×1024 originale, sans transparence, sans coins arrondis, **sans emoji** (4.5.6) et sans logo tiers. Piste : le monogramme « AL » en Cormorant Garamond sur le dégradé rose→abricot de la marque.
2. Remplacer `icon.png` et `splash-icon.png`.
3. `rm` des 7 assets de template listés.
4. Supprimer `scripts/reset-project.js` et l'entrée `"reset-project"` de `package.json`.

**Test :** `ls assets/images` ne renvoie aucun `expo-*`, `react-*`, `tutorial-*`.
**Critère :** icône originale visible sur l'écran d'accueil de l'iPhone, aucun logo tiers.

---

### T-102 · Ajouter de la valeur native (le vrai enjeu de 4.2)
**Guidelines :** 4.2, 4.3(b), 5.6.4 · **Effort :** L · **Dépend de :** D-09

C'est la tâche qui décide de l'acceptation. Une app qui ne fait que lire une base distante se fait rejeter avec la phrase type : *« we found that the experience it provides is not sufficiently different from a web browsing experience »*.

**Candidats, par rapport valeur/effort :**

| Fonction | Pourquoi ça compte pour 4.2 | Effort |
|---|---|---|
| **Hors ligne complet** | Impossible sur une page web. Persiste le cache React Query (`@tanstack/react-query-persist-client` + AsyncStorage) et embarque un jeu de recettes de secours dans le bundle | M |
| **Liste de courses interactive** | Cases à cocher persistantes, regroupement par rayon, partage natif. Usage typiquement mobile (en magasin) | M |
| **Minuteurs de cuisson** | Détection des durées dans les étapes (« 6 min ») → bouton minuteur + notification locale. Très « app-like » | M |
| **Mode cuisine** | Écran maintenu allumé (`expo-keep-awake`), étapes en grand, navigation au swipe | S |
| **Widget iOS** | Recette du jour sur l'écran d'accueil. Argument 4.2 imparable | L |
| **Siri / Raccourcis** | « Dis Siri, ouvre la recette du jour » (2.5.11) | M |

**Ma recommandation : hors ligne + liste de courses + mode cuisine** (≈ 2,5 jours) — les trois plus rentables.

**Critère :** en mode avion, après un premier lancement en ligne, l'app affiche les recettes, permet de cocher une liste de courses et de lancer un minuteur.

---

### T-103 · Supprimer les collectes de données non nécessaires
**Guidelines :** 5.1.1(iii), 2.5.14 · **Effort :** S

| Fichier | Action |
|---|---|
| `app.json:24` | Supprimer `"android.permission.RECORD_AUDIO"` |
| `src/app/suggest.tsx` | Supprimer le champ « Ton prénom » |
| `src/lib/queries.ts:137-141` | Retirer `author` de l'insert |
| `src/lib/push.ts:85-95` | Si D-01 = retirer → supprimer le fichier. Sinon retirer `user_agent` (fabricant + modèle) |

**Test :** `grep -rn "RECORD_AUDIO\|author\|user_agent" app.json src/` → 0.

---

### T-104 · Retirer les notifications push de la V1 *(si D-01 validé)*
**Guidelines :** 4.5.4, 2.1, 5.1.1(iii) · **Effort :** S

1. Supprimer `src/lib/push.ts`.
2. Retirer le bloc « Notifications » de `src/screens/about.tsx`.
3. Retirer `"expo-notifications"` de `plugins` dans `app.json` et de `package.json`.
4. Vérifier qu'aucun `aps-environment` n'est demandé.

**Test :** `grep -rn "Notifications\|push" src/` → 0. `npx expo export --platform ios` OK.

---

### T-105 · Retirer l'espace admin du build *(si D-02 validé)*
**Guidelines :** 2.3.1, 5.1.1(ii) · **Effort :** S

1. Supprimer le lien « Espace admin » de `src/screens/about.tsx`.
2. Supprimer `src/app/admin/` et `src/screens/admin-*.tsx`.
3. Supprimer `src/lib/auth.ts`, `src/lib/cloudinary.ts`.
4. Retirer `expo-image-picker` (plugin + dépendance) et `NSPhotoLibraryUsageDescription` d'`app.json`.

**Gain :** supprime une permission, une fonction non documentée, l'obligation de compte démo, le stockage de session.
**Test :** aucune route `/admin` ; `npx expo export` OK ; Info.plist généré sans `NSPhotoLibraryUsageDescription`.

---

### T-106 · Déclarer le privacy manifest
**Annexe A1, A2 · Effort :** S · **Dépend de :** T-103, T-104, T-105

Ajouter dans `app.json`, sous `ios` :

```json
"privacyManifests": {
  "NSPrivacyAccessedAPITypes": [
    {
      "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
      "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
    }
  ],
  "NSPrivacyCollectedDataTypes": [],
  "NSPrivacyTracking": false,
  "NSPrivacyTrackingDomains": []
}
```

`CA92.1` = accès à `NSUserDefaults` limité à l'app elle-même — c'est exactement l'usage d'AsyncStorage pour les favoris.
`NSPrivacyCollectedDataTypes: []` n'est valide **que si** T-103 à T-105 sont faits (plus aucune donnée transmise). Sinon déclarer les types réels.

**Test :** après `npx expo prebuild --platform ios`, `ios/AkelLoulou/PrivacyInfo.xcprivacy` existe et contient la catégorie.

---

### T-107 · Fonctionnement hors ligne
**Guidelines :** 4.2.3, 2.1 · **Effort :** M · *(inclus dans T-102 si l'option « hors ligne » est retenue)*

**Critère :** mode avion → contenu affiché, aucun écran vide, message d'état clair.

---

## LOT 2 — Bloqueurs 🔴 HORS CODE

### T-201 · Rapatrier 100 % des images
**Guideline :** 5.2.1 · **Effort :** L · **Dépend de :** D-04

1. Photographier les 11 plats concernés : *Pancakes, Fudgy Brownie, Crumble aux poires, Bourghoul, Toffee Crisp, Oat Dough, Cookies Cyril, Banana Cake, Reese's Cups, Butter Chicken, Ramen*.
2. Téléverser sur Cloudinary via l'admin du site.
3. Mettre à jour `recipes.image_url`.

**Test :**
```sql
select count(*) from recipes
where image_url not like 'https://res.cloudinary.com/%'
  and (hidden is not true) and (is_secondary is not true);
-- doit renvoyer 0
```

---

### T-202 · Politique de confidentialité
**Guideline :** 5.1.1(i) · **Effort :** M

**Squelette prêt à remplir** (à publier sur `https://laurecipe.akeloulou.workers.dev/privacy`) :

```markdown
# Politique de confidentialité — Akel Loulou
Dernière mise à jour : [DATE]

## Qui est responsable du traitement
[NOM COMPLET], [EMAIL DE CONTACT].

## Quelles données sont collectées
- **Favoris** : les identifiants des recettes que vous marquez comme favorites.
  Finalité : afficher vos favoris. Stockage : **uniquement sur votre appareil**.
  Ils ne sont jamais transmis. Conservation : jusqu'à désinstallation.
- **Suggestions de recettes** : le texte que vous saisissez volontairement.
  Finalité : nous transmettre une idée de recette. Destinataire : nous seuls.
  Conservation : [X] mois. Base légale : votre consentement (envoi volontaire).

## Ce que nous ne collectons pas
Aucun compte, aucune publicité, aucun traceur, aucun outil d'analyse,
aucune localisation, aucun identifiant publicitaire. Nous ne vendons ni ne
partageons aucune donnée. Aucun suivi entre applications ou sites.

## Sous-traitants
- **Supabase** (base de données) — hébergement : [RÉGION À CONFIRMER]
- **Cloudinary** (images des recettes)

## Vos droits (RGPD)
Accès, rectification, effacement, opposition, portabilité : écrivez à [EMAIL].
Réponse sous 30 jours. Réclamation possible auprès de la CNIL.

## Enfants
L'app ne s'adresse pas aux moins de 13 ans et ne collecte pas sciemment
leurs données.

## Modifications
Toute évolution sera publiée sur cette page avec une nouvelle date.
```

**Puis :** ajouter un lien « Politique de confidentialité » dans `src/screens/about.tsx` (5.1.1(i) exige le lien **dans l'app**, pas seulement dans ASC).
**Test :** URL HTTP 200 ; lien atteignable en ≤ 2 taps depuis À propos.

---

### T-203 · Page de support
**Guideline :** 1.5 · **Effort :** S

Page publique avec : nom du développeur, email de contact, délai de réponse indicatif, lien vers la politique de confidentialité.
**Test :** URL HTTP 200, email cliquable.

---

### T-204 · Métadonnées App Store Connect
**Guidelines :** 2.3, 2.3.3, 2.3.7, 2.3.8 · **Effort :** M

Valeurs exactes dans `CHECKLIST_SOUMISSION.md`. Inclut : nom, sous-titre, mots-clés, description, captures 6,9" et 6,5".

---

### T-205 · App Privacy Details
**Guideline :** 5.1.2 · **Effort :** S · **Dépend de :** T-103 à T-105

Après nettoyage, la réponse devient **« Data Not Collected »** — le cas le plus simple et le plus sûr. **Ne déclarer cela que si T-103/104/105 sont effectivement faits**, sinon c'est une fausse déclaration (motif de rejet aggravé).

---

### T-206 · App Review Notes
**Annexe A7 · Effort :** S

**Squelette :**

```
Bonjour,

Akel Loulou est un carnet de recettes familial. Les recettes, les photos et
les textes sont produits par notre famille.

• Aucun compte n'est nécessaire : toutes les fonctions sont accessibles
  immédiatement au lancement.
• L'app ne contient ni achat intégré, ni publicité, ni outil d'analyse,
  ni suivi. Aucune donnée personnelle n'est collectée.
• Les favoris et la liste de courses sont stockés uniquement sur l'appareil.
• Le formulaire « Proposer une recette » envoie un texte libre qui nous est
  destiné en privé ; il n'est jamais republié vers d'autres utilisateurs.
  Il n'y a donc ni profils, ni messagerie, ni contenu public entre personnes.
• L'app fonctionne hors ligne après le premier lancement.

Langue : français.
Contact : [EMAIL]

Merci pour votre lecture.
```

---

### T-207 · Versionner le projet
**Annexe A11 · Effort :** XS

`git init` **dans `AkelLoulou-mobile`**, `.gitignore` (node_modules, .expo, dist*, .env), premier commit. ⚠️ Ne pas committer depuis `C:\Users\tonyb` : ce dépôt accidentel embarquerait `.ssh`, `.aws`, `.azure`.

---

## LOT 3 — Risques 🟠

| ID | Guideline | Tâche | Effort |
|---|---|---|---|
| T-301 | 2.4.1 | iPad : tester, ou `supportsTablet: false` (D-03) | S |
| T-302 | 2.5.5 | Tester en IPv6-only (réseau NAT64) | S |
| T-303 | 5.2.2 | Vérifier les CGU TheMealDB / flagcdn, ou rapatrier (D-05) | M |
| T-304 | 5.1.1(ii) | Corriger les accents de `NSPhotoLibraryUsageDescription` — **sans objet si T-105 fait** | XS |
| T-305 | 1.2 | Documenter le caractère privé des suggestions dans les Review Notes | XS |
| T-306 | 1.4.3 | Inventorier les recettes contenant de l'alcool → classification d'âge | S |
| T-307 | 4.0 / A8 | Parcours complet sur iPhone réel : swipe-back, Dynamic Type XXL, VoiceOver | M |
| T-308 | 5.6.2 | Confirmer compte Apple Developer actif | XS |

---

## LOT 4 — Risques 🟡 / 🟢 et finitions

| ID | Guideline | Tâche | Effort |
|---|---|---|---|
| T-401 | 1.4 | Mention « Vérifiez les allergènes » dans À propos | XS |
| T-402 | 2.5.2 / 2.5.6 | Retirer `expo-file-system` et `expo-web-browser` (inutilisés) | XS |
| T-403 | 2.5.1 | Fixer explicitement `ios.deploymentTarget` | XS |
| T-404 | 1.6 | Session admin en Keychain — **sans objet si T-105 fait** | S |
| T-405 | A9 | Déclarer « Français » comme langue principale dans ASC | XS |
| T-406 | 4.0 | Vérifier le contraste des textes `textSecondary #B090A8` sur `bgMain #FDF6FB` (ratio faible, à mesurer) | S |

---

## CHEMIN CRITIQUE

```
D-01..D-09 (décisions, 1 h)
   │
   ├─► T-201 Photos des 11 plats ─────────────► (2 j, dépend de toi : séance photo)
   │
   ├─► T-102 Fonctions natives ───────────────► (2,5 j)  ⬅ LE PLUS LONG EN CODE
   │
   ├─► T-101 Icône + purge template ──────────► (0,5 j)
   │
   ├─► T-103/104/105 Nettoyage ───────────────► (0,5 j)
   │        └─► T-106 Privacy manifest ───────► (0,5 j)
   │                 └─► T-205 Privacy Details
   │
   ├─► T-202 Privacy Policy + T-203 Support ──► (0,5 j)
   │
   └─► T-204 Métadonnées + captures ──────────► (0,5 j, après T-101 et T-102)
                │
                └─► Build EAS ─► TestFlight ─► T-206 Review Notes ─► Soumission
```

**Durée : 6 à 9 jours** — dont environ 2 jours qui ne dépendent pas de moi (séance photo, tests sur iPhone réel).
**Verrou n°1 :** T-201 (photos). **Verrou n°2 :** T-102 (fonctions natives).
