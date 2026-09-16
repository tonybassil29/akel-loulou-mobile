# AUDIT APPLE — Akel Loulou (iOS)

| | |
|---|---|
| **Date de l'audit** | 16 septembre 2026 |
| **Guidelines auditées** | App Store Review Guidelines — **Last Updated: June 8, 2026** (source : https://developer.apple.com/app-store/review/guidelines/, HTTP 200, 238 359 o) |
| **Application** | Akel Loulou — `com.akelloulou.recipes` — v1.0.0 |
| **Projet** | `C:\Users\tonyb\Documents\AkelLoulou-mobile` |
| **Mode** | Lecture seule — aucun fichier source modifié |

## Sources Apple consultées

| Document | Statut |
|---|---|
| App Store Review Guidelines | ✅ HTTP 200 — 136 identifiants extraits |
| Third-party SDK requirements (liste des SDK exigeant manifest + signature) | ✅ HTTP 200 — 84 SDK listés |
| App Privacy Details on the App Store | ✅ HTTP 200 |
| Offering Account Deletion in Your App | ✅ HTTP 200 |
| Describing use of required reason API | ⚠️ 404 sur l'URL historique — récupéré via l'API JSON de la doc (HTTP 200) |
| Human Interface Guidelines | ⚠️ HTTP 200 mais **coquille JS de 17 ko** — contenu non extractible sans navigateur. Les points HIG de cet audit reposent donc sur les guidelines 4.x elles-mêmes, pas sur le texte HIG. **À confirmer manuellement.** |
| Apple Developer Program License Agreement | ❌ **Non récupéré** (PDF derrière authentification développeur). Section 5.x auditée sur la base des guidelines seules. |

---

## ⚠️ HYPOTHÈSES DE TRAVAIL

Tu m'as répondu « fais le nécessaire et le recommandé ». J'ai donc retenu **mes réponses par défaut proposées en Phase 2**. Chacune est une hypothèse, pas un fait vérifié — **toute hypothèse fausse change le verdict de la ligne concernée**.

| # | Hypothèse retenue | Impact si fausse |
|---|---|---|
| H1 | App **100 % gratuite**, aucun achat, jamais | Toute la section 3.x bascule de ➖ N/A à applicable |
| H2 | Aucune vente de contenu/service numérique ailleurs | 3.1.1 / 3.1.3 deviennent bloquants |
| H3 | Espace admin = **toi seul**, aucune inscription utilisateur | 4.8 + 5.1.1(v) deviennent bloquants |
| H4 | Pas de comptes utilisateurs en V1 | idem H3 |
| H5 | Les images `pplx-res.cloudinary.com` **ne t'appartiennent pas** | Si elles t'appartiennent, B-02 tombe |
| H6 | Classification visée **4+**, hors Kids Category | 1.3 / 5.1.4 changeraient complètement |
| H7 | Les suggestions restent **privées** (admin seulement) | 1.2 deviendrait bloquant (modération, signalement, blocage, EULA) |
| H8 | **Push retirées de la V1** (recommandation forte) | 4.5.4 + collecte de données + manifest se compliquent |
| H9 | Privacy Policy hébergée sur `laurecipe.akeloulou.workers.dev/privacy` | Aucun — seul le lieu change |
| H10 | Distribution **mondiale** | Exigences locales (Chine ICP, Corée) à ajouter |
| H11 | **Entrée admin masquée** du build App Store | Sinon compte démo obligatoire dans les Review Notes |
| H12 | Compte Apple Developer Program actif | Sans lui, rien n'est soumettable |

---

## VERDICT GLOBAL

> ## 🔴 Soumission en l'état = **REJET CERTAIN**

Ce n'est pas une estimation prudente : **trois motifs indépendants** suffisent chacun à eux seuls à faire rejeter la soumission, et deux d'entre eux bloquent même l'*upload* du binaire avant toute revue humaine.

### Tableau de synthèse

| | Nombre |
|---|---|
| Identifiants de guideline listés sur le site | **136** |
| Lignes dans le tableau d'audit | **136** |
| ✅ Conformes | 41 |
| ⚠️ Partiels | 12 |
| ❌ Non conformes | 9 |
| ❓ À vérifier | 7 |
| ➖ N/A (justifiés) | 67 |
| 🔴 Bloquants | **9** |
| 🟠 Risque élevé | 6 |

---

## TOP 10 DES BLOQUEURS

### 🔴 1 — L'icône de l'app est le logo d'Expo
**Guidelines : 5.2.1 Intellectual Property — Generally** · **4.1 Copycats**

> *« Don't use protected third-party material such as trademarks, copyrighted works, or patented ideas in your app without permission »* (5.2.1)

**Preuve :** `assets/images/icon.png` — fichier ouvert et visualisé : chevron blanc sur dégradé bleu, c'est l'icône par défaut de `create-expo-app`, marque d'Expo/650 Industries. Également non remplacés : `assets/images/splash-icon.png`, `expo-logo.png`, `react-logo@{1,2,3}x.png`, `expo-badge*.png`, `tutorial-web.png`.

**Conséquence :** rejet immédiat, et l'app serait indiscernable de milliers d'autres builds Expo.

---

### 🔴 2 — 38 % des recettes visibles affichent des images tierces de provenance inconnue
**Guideline : 5.2.1 Intellectual Property**

**Preuve** (requête REST sur la base de production, filtre `hidden`/`is_secondary` identique à l'app) :
- **29 recettes visibles**
- **9 sur `pplx-res.cloudinary.com`** — CDN d'images de **Perplexity**, donc images issues de recherche web : *Pancakes, Fudgy Brownie, Crumble aux poires, Bourghoul, Toffee Crisp, Oat Dough, Cookies Cyril, Banana Cake, Reese's Cups*
- **2 sur `lh3.googleusercontent.com`** : *Butter Chicken, Ramen*
- **53 images d'ingrédients** hot-linkées depuis `themealdb.com` (`src/lib/ingredient-images.ts`)
- Images de matériel par défaut depuis `images.unsplash.com`

**Aggravant — marques tierces dans le contenu :** recettes nommées « **Reese's Cups** » (Hershey) et « **Toffee Crisp** » (Nestlé), et la photo de l'écran « À propos » montre un tablier **Nestlé Dessert** lisible.

---

### 🔴 3 — Aucune politique de confidentialité
**Guideline : 5.1.1(i) Data Collection and Storage — Privacy Policies**

> *« All apps must include a link to their privacy policy in the App Store Connect metadata field and within the app in an easily accessible manner. »*

**Preuve :** `ls` à la racine du projet → seul `LICENSE` (template MIT). Recherche effectuée : `grep -riE "privacy|policy|confidentialit"` sur `src/` → **aucun lien, aucun écran**. Aucune URL publique connue.

**Aggravant :** l'app **collecte réellement des données** — donc la politique n'est pas une formalité :
- `src/lib/push.ts:85` → `push_subscriptions` : jeton Expo, plateforme, **fabricant + modèle d'appareil**
- `src/lib/queries.ts:137` → `recipe_suggestions` : titre, description, **prénom facultatif**

---

### 🔴 4 — Aucun privacy manifest (`PrivacyInfo.xcprivacy`)
**Annexe — Privacy Manifest / Required Reason APIs**

> *« Starting May 1, 2024, apps that don't describe their use of required reason API in their privacy manifest file aren't accepted by App Store Connect. »* (doc Apple « Describing use of required reason API »)

**Preuve :** `find . -name "PrivacyInfo.xcprivacy" -not -path "*/node_modules/*"` → **vide**. Aucune clé `ios.privacyManifests` dans `app.json`.

**Ce qui déclenche l'exigence :** `@react-native-async-storage/async-storage` utilise `NSUserDefaults` (catégorie `NSPrivacyAccessedAPICategoryUserDefaults`, raison `CA92.1`) — utilisé à `src/lib/favorites.ts:16,28` et `src/lib/supabase.ts:19`.

**Nuance importante :** les modules Expo embarquent chacun leur manifest (vérifié : `expo-application`, `expo-constants`, `expo-device`, `expo-file-system`, `expo-notifications`, `expo-system-ui`, `react-native`, `@react-native-async-storage`). Il manque le manifest **au niveau app**, celui qui déclare `NSPrivacyCollectedDataTypes`. **Blocage à l'upload, avant toute revue humaine.**

---

### 🔴 5 — Risque « app à fonctionnalité minimale »
**Guidelines : 4.2 Minimum Functionality** · **4.3(b) Spam**

> *« If your app is not particularly useful, unique, or "app-like," it doesn't belong on the App Store. »* (4.2)
> *« Don't submit apps that are indistinguishable from what's already widely available. »* (4.3(b))

**Preuve :** l'app livre 4 écrans en lecture seule (liste, détail, galerie, à propos) alimentés par une base distante, sans compte, sans personnalisation au-delà d'un favori local (`src/lib/favorites.ts`). Catalogue réel : **27 recettes** d'une seule famille.

**C'est le risque le plus difficile à corriger**, car il ne se règle pas par une case à cocher : il faut ajouter de la valeur native. Voir Lot 1 du plan d'action.

---

### 🔴 6 — App Privacy Details non renseignés
**Guideline : 5.1.2 Data Use and Sharing** · Annexe App Privacy Details

**Preuve :** aucune fiche App Store Connect n'existe (projet EAS créé le 15/09/2026, aucune app ASC associée vérifiée). Les « nutrition labels » devront déclarer au minimum : *Identifiants → ID d'appareil* (jeton push), *Diagnostics/Utilisation* (modèle d'appareil), *Contact → Nom* (prénom dans les suggestions), *Contenu utilisateur* (texte des suggestions).

---

### 🔴 7 — Aucune métadonnée ni capture d'écran
**Guidelines : 2.3.3 Screenshots** · **2.3.7 app name/keywords** · **1.5 Developer Information**

**Preuve :** aucun screenshot dans le repo ; aucune URL de support ni marketing définie nulle part (`grep -rn "support\|http" app.json` → seules des URLs techniques). 1.5 exige une **URL de support valide et à jour**.

---

### 🔴 8 — Permission Android déclarée et jamais utilisée
**Guideline : 5.1.1(iii) Data Minimization** (esprit) · Play Store côté Android

**Preuve :** `app.json:24` déclare `"android.permission.RECORD_AUDIO"`. Recherche `grep -riE "Audio|Recording|Microphone"` sur `src/` → **0 occurrence**. Permission fantôme, probablement héritée d'un plugin.

---

### 🔴 9 — Aucun versionnement du code
**Hors guideline Apple — risque projet**

**Preuve :** `git rev-parse --show-toplevel` → `/mnt/c/Users/tonyb` ; `git log` → *« your current branch 'main' does not have any commits yet »*. Le projet vit dans le dépôt accidentel créé à la racine du dossier utilisateur Windows, **sans aucun commit**. Aucun retour arrière possible en cas d'erreur pendant la mise en conformité.

---

### 🟠 10 — iPad déclaré supporté mais jamais testé
**Guideline : 2.4.1 Hardware Compatibility**

**Preuve :** `app.json:13` → `"supportsTablet": true`. Aucune vérification de rendu iPad n'a été faite (aucun simulateur disponible sur cette machine Windows). Une mise en page iPhone étirée sur iPad est un motif de rejet fréquent.

---

---

# TABLEAU D'AUDIT COMPLET

Légende — **Statut** : ✅ Conforme · ⚠️ Partiel · ❌ Non conforme · ❓ À vérifier · ➖ N/A
**Risque** : 🔴 Bloquant · 🟠 Élevé · 🟡 Moyen · 🟢 Faible
**Effort** : XS (<30 min) · S (<2 h) · M (<1 j) · L (>1 j)

Recherches systématiques effectuées sur le projet (citées comme preuve d'absence) :
`grep -rniE "<motif>" src/ app.json package.json` · `find . -name "<fichier>" -not -path "*/node_modules/*"`

---

## Section 1 — Safety

| # | Guideline | Appl. | Statut | Preuve | Raison | Risque | Action requise | Où | Effort | Prio | Critère d'acceptation |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1.1 | Objectionable Content | Oui | ✅ | Contenu = 27 recettes de cuisine, base vérifiée | Aucun contenu répréhensible | 🟢 | Aucune | — | — | — | Revue manuelle des 27 titres/textes : rien d'offensant |
| 1.1.1 | Defamatory, discriminatory, or mean-spirited content | Oui | ✅ | `recipes` : titres et instructions lus | Contenu culinaire neutre | 🟢 | Aucune | — | — | — | Idem |
| 1.1.2 | Realistic portrayals of people/animals being killed | Oui | ➖ | Photos de plats uniquement | Pas de violence | 🟢 | Aucune | — | — | — | — |
| 1.1.3 | Depictions encouraging illegal/reckless use of weapons | Oui | ➖ | grep `arme|weapon|couteau` → seuls ustensiles de cuisine | Sans objet | 🟢 | Aucune | — | — | — | — |
| 1.1.4 | Overtly sexual or pornographic material | Oui | ➖ | Aucun | Sans objet | 🟢 | Aucune | — | — | — | — |
| 1.1.5 | Inflammatory religious commentary | Oui | ➖ | Aucun | Sans objet | 🟢 | Aucune | — | — | — | — |
| 1.1.6 | False information and features | Oui | ⚠️ | Aucune source/attribution sur les recettes | Recettes familiales non sourcées ≠ fausse info, mais 11 photos ne correspondent pas à des plats réellement cuisinés (voir 5.2.1) | 🟡 | Remplacer les photos non authentiques par les photos réelles des plats | Base Supabase `recipes.image_url` | M | P1 | 0 image hors `res.cloudinary.com` |
| 1.1.7 | Harmful concepts capitalizing on current events | Oui | ➖ | Aucun | Sans objet | 🟢 | Aucune | — | — | — | — |
| 1.2 | User-Generated Content | Oui | ⚠️ | `src/app/suggest.tsx` + `src/lib/queries.ts:137` | Un formulaire permet d'envoyer du texte libre + un prénom. Le contenu **n'est pas rediffusé** aux autres utilisateurs (H7) → les 4 exigences UGC strictes ne s'appliquent pas, mais Apple peut demander des précisions | 🟠 | Documenter dans les Review Notes que les suggestions sont privées ; retirer le champ prénom ; ajouter un filtre de longueur/contenu | Review Notes + `src/app/suggest.tsx` | S | P1 | Review Notes contiennent le paragraphe « UGC » ; champ prénom supprimé |
| 1.2.1 | Creator Content | Non | ➖ | Pas de plateforme de créateurs | Sans objet | 🟢 | Aucune | — | — | — | — |
| 1.3 | Kids Category | Non | ➖ | H6 : Kids Category non visée ; `app.json` sans déclaration | Hors catégorie Enfants | 🟢 | Ne **pas** cocher Kids Category dans ASC | App Store Connect | XS | P2 | Catégorie = Food & Drink, Kids non cochée |
| 1.4 | Physical Harm | Oui | ⚠️ | Recettes sans allergènes ni avertissement | Cuisine = risque faible, mais aucune mention d'allergènes | 🟡 | Ajouter une mention « Vérifiez les allergènes » dans À propos | `src/screens/about.tsx` | XS | P3 | Texte présent à l'écran À propos |
| 1.4.1 | Medical apps / inaccurate data | Non | ➖ | Aucune fonction médicale | Sans objet | 🟢 | — | — | — | — | — |
| 1.4.2 | Drug dosage calculators | Non | ➖ | Aucun | Sans objet | 🟢 | — | — | — | — | — |
| 1.4.3 | Tobacco, vape, illegal drugs, **excessive amounts of alcohol** | Oui | ❓ | `src/lib/ingredient-images.ts` contient `vin blanc`, `vin rouge` | Usage culinaire ; aucune recette visible n'en contient d'après la base, mais non exhaustivement vérifié | 🟡 | Vérifier les 27 recettes ; si alcool présent, classification 17+ ou retrait | Base + ASC age rating | S | P2 | Liste des recettes contenant de l'alcool établie ; rating cohérent |
| 1.4.4 | DUI checkpoints | Non | ➖ | Aucun | Sans objet | 🟢 | — | — | — | — | — |
| 1.4.5 | Apps should not urge customers to participate in activities (bets, challenges) | Oui | ➖ | Aucun défi ni pari | Sans objet | 🟢 | — | — | — | — | — |
| 1.5 | Developer Information | Oui | ❌ | Recherche `grep -rniE "support|contact|mailto"` sur `src/` → **0** ; aucune URL support | Apple exige une **URL de support valide** et un moyen de contact | 🔴 | Créer une page de support publique + la renseigner dans ASC | Site web + ASC | S | **P0** | L'URL de support renvoie HTTP 200 et affiche un email de contact |
| 1.6 | Data Security | Oui | ⚠️ | RLS durcie le 15/09/2026 (lecture publique, écriture admin) ; HTTPS partout ; jeton admin dans AsyncStorage | Bon niveau, mais le jeton de session admin est en AsyncStorage (non chiffré) plutôt qu'en Keychain | 🟡 | Si l'admin reste dans le build : migrer vers `expo-secure-store`. Si masqué (H11) : sans objet | `src/lib/supabase.ts:19` | S | P2 | Session admin stockée en Keychain, ou admin absent du build |
| 1.7 | Reporting Criminal Activity | Non | ➖ | Aucune fonction de signalement d'infraction | Sans objet | 🟢 | — | — | — | — | — |

---

## Section 2 — Performance

| # | Guideline | Appl. | Statut | Preuve | Raison | Risque | Action requise | Où | Effort | Prio | Critère d'acceptation |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2.1 | App Completeness | Oui | ⚠️ | `tsc --noEmit` clean ; `expo export --platform ios` OK (8,3 Mo) ; 0 `TODO/FIXME/coming soon/lorem` ; **mais** 11 images distantes hors de ton contrôle (`pplx`, `googleusercontent`) peuvent tomber → écrans cassés en revue | Build complet, contenu fragile ; aucun compte démo documenté | 🔴 | Rapatrier toutes les images sur Cloudinary ; rédiger les Review Notes | Base + ASC | M | **P0** | 100 % des `image_url` sur un domaine que tu contrôles |
| 2.2 | Beta Testing | Oui | ✅ | Aucune mention « beta/test » dans l'UI (grep effectué) | App présentée comme finale | 🟢 | Utiliser TestFlight avant soumission, pas l'App Store | TestFlight | XS | P1 | Build validé en TestFlight d'abord |
| 2.3 | Accurate Metadata | Oui | ❌ | Aucune métadonnée existante | Rien n'est rédigé | 🔴 | Rédiger nom/sous-titre/description/mots-clés | ASC | S | **P0** | Fiche ASC complète |
| 2.3.1 | No hidden, dormant, or undocumented features | Oui | ⚠️ | `src/app/admin/` : 4 écrans admin atteignables via À propos → `src/screens/about.tsx` (lien « Espace admin ») | Une zone admin protégée par mot de passe = fonctionnalité non documentée si non expliquée | 🔴 | H11 : **retirer l'entrée admin du build App Store** (ou fournir un compte démo + l'expliquer) | `src/screens/about.tsx` + `src/app/admin/` | S | **P0** | Aucun chemin vers `/admin` dans le build de production |
| 2.3.2 | In-app purchase description accuracy | Non | ➖ | Aucun IAP (H1) | Sans objet | 🟢 | — | — | — | — | — |
| 2.3.3 | Screenshots show the app in use | Oui | ❌ | Aucun screenshot | Obligatoire | 🔴 | Produire les captures 6,9" et 6,5" (+ 13" si iPad) | ASC | S | **P0** | Captures = écrans réels, pas de mockup |
| 2.3.4 | App Previews | Oui | ➖ | Optionnel | Non fourni, non obligatoire | 🟢 | — | — | — | — | — |
| 2.3.5 | Select the most appropriate category | Oui | ❓ | Non défini | À choisir | 🟡 | Catégorie **Food & Drink** | ASC | XS | P1 | Catégorie renseignée |
| 2.3.6 | Answer age rating questions honestly | Oui | ❓ | Non renseigné ; dépend de 1.4.3 | À faire après vérif alcool | 🟠 | Remplir le questionnaire | ASC | XS | P1 | Rating cohérent avec le contenu |
| 2.3.7 | Unique app name, accurate keywords | Oui | ❌ | Non défini | À rédiger | 🔴 | Nom « Akel Loulou », mots-clés sans marque tierce | ASC | S | **P0** | Aucun mot-clé contenant une marque |
| 2.3.8 | Metadata appropriate for all audiences | Oui | ❓ | Non rédigé | À vérifier une fois rédigé | 🟡 | Relire la description | ASC | XS | P2 | Description tout public |
| 2.3.9 | Securing rights to use all materials in metadata | Oui | ❌ | Voir bloqueur n°2 | Images tierces | 🔴 | Ne mettre que des visuels dont tu détiens les droits | ASC + base | M | **P0** | Captures composées d'images maison |
| 2.3.10 | Focused on the Apple platform experience | Oui | ✅ | grep `Android|Google Play` dans `src/screens` + `src/components` → seulement un commentaire de code, jamais à l'écran | Aucune mention d'une autre plateforme dans l'UI | 🟢 | Ne pas mentionner Android dans la description ASC | ASC | XS | P2 | Description sans « Android » |
| 2.3.11 | Pre-order apps | Non | ➖ | Pas de pré-commande | Sans objet | 🟢 | — | — | — | — | — |
| 2.3.12 | Describe new features in "What's New" | Oui | ❓ | Première soumission | À rédiger | 🟢 | « Version initiale » | ASC | XS | P2 | Champ rempli |
| 2.3.13 | In-app events | Non | ➖ | Aucun événement in-app | Sans objet | 🟢 | — | — | — | — | — |
| 2.4 | Hardware Compatibility | Oui | ⚠️ | Voir 2.4.1 | — | 🟠 | — | — | — | — | — |
| 2.4.1 | iPhone apps should run on iPad | Oui | ❓ | `app.json:13` `supportsTablet: true` ; **aucun test iPad effectué** | Machine Windows, pas de simulateur iOS disponible | 🟠 | Tester sur iPad (EAS Simulator ou appareil réel) ; sinon passer `supportsTablet: false` | `app.json` | M | **P0** | Captures iPad correctes, ou iPad désactivé |
| 2.4.2 | Power efficiency | Oui | ✅ | Pas de tâche de fond, pas de polling ; React Query `staleTime` 2 min (`src/app/_layout.tsx`) | Consommation normale | 🟢 | — | — | — | — | — |
| 2.4.3 | Apple TV without hardware | Non | ➖ | Pas de target tvOS | Sans objet | 🟢 | — | — | — | — | — |
| 2.4.4 | Apps should never suggest a device restart | Oui | ✅ | grep `redémarr|restart|reboot` → 0 | Aucun message de ce type | 🟢 | — | — | — | — | — |
| 2.4.5 | Mac App Store additional requirements | Non | ➖ | Pas de target macOS/Catalyst | Sans objet | 🟢 | — | — | — | — | — |
| 2.5 | Software Requirements | Oui | ⚠️ | Voir sous-points | — | 🟠 | — | — | — | — | — |
| 2.5.1 | Public APIs only, current OS | Oui | ✅ | Expo SDK 57 / RN 0.86.3, aucune API privée ; deployment target fixé par EAS | Stack officielle | 🟢 | Fixer explicitement `ios.deploymentTarget` | `app.json` | XS | P2 | Valeur explicite au build |
| 2.5.2 | Self-contained bundles | Oui | ✅ | Pas d'écriture hors sandbox ; `expo-file-system` non utilisé pour écrire | Conforme | 🟢 | Retirer `expo-file-system` s'il est inutilisé | `package.json` | XS | P3 | Dépendance retirée ou usage justifié |
| 2.5.3 | No viruses/malicious code | Oui | ✅ | Code lu intégralement (44 fichiers, 4 285 lignes) | Aucun code malveillant | 🟢 | — | — | — | — | — |
| 2.5.4 | Background services limited to intended purpose | Oui | ✅ | Aucun `UIBackgroundModes` déclaré (`app.json:16-19`) | Pas de fond | 🟢 | Ne pas ajouter `remote-notification` sans besoin réel | `app.json` | — | — | Aucun mode de fond |
| 2.5.5 | Fully functional on IPv6-only networks | Oui | ❓ | Non testé. Supabase et Cloudinary sont IPv6-compatibles, mais non vérifié | Apple teste en IPv6-only | 🟠 | Tester sur un réseau NAT64/DNS64 | — | S | P1 | App fonctionnelle en IPv6-only |
| 2.5.6 | Apps that browse the web must use WebKit | Non | ➖ | **Aucune WebView** (grep `WebView|WebBrowser|Linking.openURL` → 0) | Sans objet | 🟢 | Retirer `expo-web-browser` (inutilisé) | `package.json` | XS | P3 | Dépendance retirée |
| 2.5.7 | Intentionally omitted | — | ➖ | Guideline vide chez Apple | — | — | — | — | — | — | — |
| 2.5.8 | Alternate desktop/home screen environments | Non | ➖ | Sans objet | — | 🟢 | — | — | — | — | — |
| 2.5.9 | Altering standard switches (Volume, Ring/Silent) | Non | ➖ | Aucun | Sans objet | 🟢 | — | — | — | — | — |
| 2.5.10 | Intentionally omitted | — | ➖ | Guideline vide | — | — | — | — | — | — | — |
| 2.5.11 | SiriKit and Shortcuts | Non | ➖ | Aucune intégration Siri | Sans objet (candidat d'amélioration pour 4.2) | 🟢 | — | — | — | — | — |
| 2.5.12 | CallKit / SMS Fraud Extension | Non | ➖ | Aucun | Sans objet | 🟢 | — | — | — | — | — |
| 2.5.13 | Facial recognition must use LocalAuthentication | Non | ➖ | Aucune biométrie | Sans objet | 🟢 | — | — | — | — | — |
| 2.5.14 | Explicit consent + visual/audible indication when recording | Oui | ⚠️ | `app.json:24` déclare `RECORD_AUDIO` **sans aucun usage** (grep → 0) | Permission fantôme | 🔴 | **Supprimer** `android.permission.RECORD_AUDIO` | `app.json:24` | XS | **P0** | Clé absente d'`app.json` |
| 2.5.15 | File viewers must include Files app items | Non | ➖ | Pas de navigateur de fichiers | Sans objet | 🟢 | — | — | — | — | — |
| 2.5.16 | Widgets/extensions/notifications related to app content | Oui | ✅ | Aucun widget ni extension ; notifications = recette du jour, cohérent | Cohérent | 🟢 | — | — | — | — | — |
| 2.5.17 | Matter support must use Apple's framework | Non | ➖ | Aucun Matter | Sans objet | 🟢 | — | — | — | — | — |
| 2.5.18 | Display advertising limited to main app binary | Non | ➖ | **Aucune publicité** (grep AdMob/Meta/etc. → 0) | Sans objet | 🟢 | — | — | — | — | — |

---

## Section 3 — Business

> **Toute la section repose sur H1 + H2** : app gratuite, aucun achat, aucune vente de contenu numérique ailleurs. Vérifié dans le code : `grep -rniE "StoreKit|purchase|subscription|paywall|stripe|paypal|price|abonnement"` sur `src/` → **0 occurrence**. `package.json` ne contient ni `expo-in-app-purchases`, ni `react-native-iap`, ni `revenuecat`.

| # | Guideline | Appl. | Statut | Preuve | Raison | Risque | Action requise | Où | Effort | Prio | Critère d'acceptation |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 3.1 | Payments | Non | ➖ | grep paiement → 0 | App gratuite (H1) | 🟢 | Si H1 tombe, tout re-auditer | — | — | — | — |
| 3.1.1 | In-App Purchase | Non | ➖ | Aucun IAP | Aucun contenu déverrouillable | 🟢 | — | — | — | — | — |
| 3.1.1(a) | Link to Other Purchase Methods (entitlement) | Non | ➖ | Aucun lien de paiement | Sans objet | 🟢 | — | — | — | — | — |
| 3.1.2 | Subscriptions | Non | ➖ | Aucun abonnement | Sans objet | 🟢 | — | — | — | — | — |
| 3.1.2(a) | Permissible uses | Non | ➖ | — | Sans objet | 🟢 | — | — | — | — | — |
| 3.1.2(b) | Upgrades and Downgrades | Non | ➖ | — | Sans objet | 🟢 | — | — | — | — | — |
| 3.1.2(c) | Subscription Information | Non | ➖ | — | Sans objet | 🟢 | — | — | — | — | — |
| 3.1.3 | Other Purchase Methods | Non | ➖ | — | Sans objet | 🟢 | — | — | — | — | — |
| 3.1.3(a) | "Reader" Apps | Non | ➖ | Pas une reader app | Sans objet | 🟢 | — | — | — | — | — |
| 3.1.3(b) | Multiplatform Services | Non | ➖ | Le site web est gratuit lui aussi | Aucun contenu payant multiplateforme | 🟢 | — | — | — | — | — |
| 3.1.3(c) | Enterprise Services | Non | ➖ | Grand public | Sans objet | 🟢 | — | — | — | — | — |
| 3.1.3(d) | Person-to-Person Services | Non | ➖ | Aucun service entre personnes | Sans objet | 🟢 | — | — | — | — | — |
| 3.1.3(e) | Goods and Services Outside of the App | Non | ➖ | Aucun achat de biens physiques | Sans objet | 🟢 | — | — | — | — | — |
| 3.1.3(f) | Free Stand-alone Apps | Non | ➖ | Pas de compagnon payant | Sans objet | 🟢 | — | — | — | — | — |
| 3.1.3(g) | Advertising Management Apps | Non | ➖ | Sans objet | — | 🟢 | — | — | — | — | — |
| 3.1.4 | Hardware-Specific Content | Non | ➖ | Aucun accessoire | Sans objet | 🟢 | — | — | — | — | — |
| 3.1.5 | Cryptocurrencies | Non | ➖ | Aucune crypto | Sans objet | 🟢 | — | — | — | — | — |
| 3.2 | Other Business Model Issues | Oui | ✅ | Modèle : app gratuite, catalogue personnel | Modèle simple et licite | 🟢 | — | — | — | — | — |
| 3.2.1 | Acceptable business models | Oui | ✅ | App gratuite sans monétisation | Relève des modèles acceptables | 🟢 | — | — | — | — | — |
| 3.2.2 | Unacceptable business models | Oui | ⚠️ | 3.2.2 interdit notamment les apps « artificially increasing impressions », le contenu tiers non autorisé et les schémas trompeurs | Le seul point de contact réel est le contenu tiers → traité en 5.2.1 | 🟡 | Voir actions 5.2.1 | Base | M | P0 | Idem 5.2.1 |

---

## Section 4 — Design

| # | Guideline | Appl. | Statut | Preuve | Raison | Risque | Action requise | Où | Effort | Prio | Critère d'acceptation |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 4.0 | Design (HIG) | Oui | ⚠️ | Barre d'onglets native (`src/components/app-tabs.tsx`), SF Symbols (`src/components/icon.tsx`), Dynamic Type actif (aucun `allowFontScaling={false}`), dark mode complet (`src/theme/index.ts`) ; **mais** 5 écrans sur 7 utilisent `headerShown: false` avec en-tête maison | Bon niveau global ; les en-têtes reconstruits sont un écart HIG assumé pour coller au site | 🟡 | Vérifier que le retour par geste fonctionne partout ; sinon rétablir les en-têtes natifs | `src/screens/*.tsx` | S | P2 | Swipe-back fonctionnel sur détail recette et admin |
| 4.1 | Copycats | Oui | ❌ | `assets/images/icon.png` = **icône Expo par défaut** (fichier visualisé) | Utilise l'identité visuelle d'Expo | 🔴 | Créer une icône Akel Loulou 1024×1024 originale | `assets/images/icon.png` | M | **P0** | Icône originale, sans logo tiers |
| 4.2 | Minimum Functionality | Oui | ❌ | 4 écrans en lecture seule, 27 recettes, favoris locaux uniquement (`src/lib/favorites.ts`) | Profil type des rejets 4.2 | 🔴 | Ajouter de vraies fonctions natives (voir Lot 1) | `src/` | L | **P0** | Au moins 3 fonctions natives impossibles sur une page web |
| 4.2.1 | ARKit apps must provide rich AR | Non | ➖ | Aucun ARKit | Sans objet | 🟢 | — | — | — | — | — |
| 4.2.2 | Not primarily marketing materials | Oui | ✅ | L'app est un outil de consultation, pas une brochure | Conforme | 🟢 | — | — | — | — | — |
| 4.2.3 | App should work without requiring another app / must be usable | Oui | ⚠️ | L'app **exige le réseau** au premier lancement : `src/lib/queries.ts` interroge Supabase, aucun cache disque, aucune donnée embarquée | Hors ligne au premier lancement = écran vide | 🟠 | Persister le cache React Query et embarquer un jeu de recettes de secours | `src/app/_layout.tsx`, `src/lib/queries.ts` | M | **P0** | En mode avion, l'app affiche du contenu après un 1er lancement en ligne |
| 4.2.4 | Intentionally omitted | — | ➖ | Guideline vide | — | — | — | — | — | — | — |
| 4.2.5 | Intentionally omitted | — | ➖ | Guideline vide | — | — | — | — | — | — | — |
| 4.2.6 | Apps created from a commercialized template or app generation service | Oui | ⚠️ | App générée par `create-expo-app` puis **entièrement recodée** (44 fichiers écrits à la main, 4 285 lignes) ; **mais** les assets template subsistent (`expo-logo.png`, `react-logo*.png`, `tutorial-web.png`, `expo-badge*.png`, `scripts/reset-project.js`, script npm `reset-project`) | Un reviewer qui voit l'icône Expo + les assets template peut classer l'app en 4.2.6 | 🔴 | Supprimer tous les assets et scripts du template | `assets/images/`, `scripts/`, `package.json` | S | **P0** | `ls assets/images` ne contient plus aucun fichier `expo-*` / `react-*` / `tutorial-*` |
| 4.2.7 | Remote Desktop Clients | Non | ➖ | Sans objet | — | 🟢 | — | — | — | — | — |
| 4.3 | Spam | Oui | ⚠️ | Voir (a) et (b) | — | 🟠 | — | — | — | — | — |
| 4.3(a) | Don't create multiple Bundle IDs of the same app | Oui | ✅ | Un seul bundle ID `com.akelloulou.recipes` ; un seul projet EAS | Conforme | 🟢 | — | — | — | — | — |
| 4.3(b) | Don't submit apps indistinguishable from what's already available | Oui | ⚠️ | Catalogue de recettes : catégorie **très encombrée** sur l'App Store | 4.3(b) vise explicitement les app « opportunistes » de catégories bien établies. L'angle « carnet familial privé » est différenciant mais doit être **démontré** | 🟠 | Assumer l'angle familial dans la description ; ajouter les fonctions natives de 4.2 | ASC + `src/` | M | P0 | Description explicitant l'usage familial ; fonctions natives présentes |
| 4.4 | Extensions | Non | ➖ | Aucune extension (`find -name "*.appex"` → néant, pas de dossier `ios/`) | Sans objet | 🟢 | — | — | — | — | — |
| 4.4.1 | Keyboard extensions | Non | ➖ | Aucune | Sans objet | 🟢 | — | — | — | — | — |
| 4.4.2 | Safari extensions | Non | ➖ | Aucune | Sans objet | 🟢 | — | — | — | — | — |
| 4.4.3 | Intentionally omitted | — | ➖ | Guideline vide | — | — | — | — | — | — | — |
| 4.5 | Apple Sites and Services | Oui | ✅ | Aucun service Apple détourné | Conforme | 🟢 | — | — | — | — | — |
| 4.5.1 | Approved Apple RSS feeds | Non | ➖ | Aucun | Sans objet | 🟢 | — | — | — | — | — |
| 4.5.2 | Apple Music | Non | ➖ | Aucun | Sans objet | 🟢 | — | — | — | — | — |
| 4.5.3 | Don't use Apple Services to spam or phish | Oui | ✅ | Notifications = recette du jour, opt-in explicite (`src/screens/about.tsx`) | Pas de spam | 🟢 | — | — | — | — | — |
| 4.5.4 | Push Notifications must not be required for the app to function, and require consent | Oui | ⚠️ | `src/lib/push.ts:59-63` demande la permission **uniquement sur appui utilisateur** ; l'app fonctionne sans | Conforme sur le principe. **Mais** aucun backend n'envoie réellement de notification aujourd'hui → fonctionnalité annoncée et inopérante (croise 2.1) | 🟠 | **H8 : retirer les push de la V1** (recommandé), ou livrer la chaîne d'envoi complète | `src/lib/push.ts`, `src/screens/about.tsx`, `app.json` | M | **P0** | Soit plus aucune mention de notifications, soit une notification reçue en TestFlight |
| 4.5.5 | Game Center Player IDs | Non | ➖ | Aucun Game Center | Sans objet | 🟢 | — | — | — | — | — |
| 4.5.6 | Unicode characters rendering as Apple emoji | Oui | ⚠️ | Emoji utilisés comme éléments d'interface : filtres `✨🍽️🍰♥` (`src/screens/home.tsx:48-55`), épices `🌿🧂` (`src/lib/spices.ts`), badges `🍽️🍰` (`src/screens/recipe-detail.tsx`) | 4.5.6 autorise les emoji Apple **dans l'app** mais interdit leur usage dans l'icône et les métadonnées. Usage in-app = toléré | 🟡 | **Ne pas** mettre d'emoji dans l'icône, le nom App Store ni les captures marketing | ASC + `assets/` | XS | P1 | Nom et icône sans emoji |
| 4.6 | Intentionally omitted | — | ➖ | Guideline vide | — | — | — | — | — | — | — |
| 4.7 | Mini apps, mini games, chatbots, plug-ins | Non | ➖ | Aucun contenu exécutable tiers, aucun moteur de mini-apps | Sans objet | 🟢 | — | — | — | — | — |
| 4.7.1 | (sous-règle mini apps) | Non | ➖ | Sans objet | — | 🟢 | — | — | — | — | — |
| 4.7.2 | May not extend or expose native platform APIs | Non | ➖ | Sans objet | — | 🟢 | — | — | — | — | — |
| 4.7.3 | May not share data or privacy permissions to software | Non | ➖ | Sans objet | — | 🟢 | — | — | — | — | — |
| 4.7.4 | Must provide an index of software and metadata | Non | ➖ | Sans objet | — | 🟢 | — | — | — | — | — |
| 4.7.5 | (sous-règle mini apps) | Non | ➖ | Sans objet | — | 🟢 | — | — | — | — | — |
| 4.8 | Login Services | Oui | ➖ | `src/lib/auth.ts` : Supabase email+mot de passe uniquement. **Aucun** login social tiers (Google/Facebook/Apple) — grep `signInWithOAuth|GoogleSignin|FacebookLogin` → 0. H3 : réservé à l'admin | 4.8 ne s'applique que si un **service de connexion tiers** est proposé. Email/mot de passe propriétaire n'en est pas un | 🟢 | Si un jour tu ajoutes « Se connecter avec Google », **Sign in with Apple devient obligatoire** | — | — | — | Aucun login social dans le build |
| 4.9 | Apple Pay | Non | ➖ | Aucun Apple Pay | Sans objet | 🟢 | — | — | — | — | — |
| 4.10 | Monetizing Built-In Capabilities | Non | ➖ | Aucune monétisation | Sans objet | 🟢 | — | — | — | — | — |

---

## Section 5 — Legal

| # | Guideline | Appl. | Statut | Preuve | Raison | Risque | Action requise | Où | Effort | Prio | Critère d'acceptation |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 5.1 | Privacy | Oui | ❌ | Voir 5.1.1 | Aucune politique de confidentialité | 🔴 | Voir 5.1.1(i) | — | — | **P0** | — |
| 5.1.1 | Data Collection and Storage | Oui | ❌ | Voir (i) à (v) | — | 🔴 | — | — | — | **P0** | — |
| 5.1.1(i) | **Privacy Policies** — lien obligatoire dans ASC **et** dans l'app | Oui | ❌ | `ls` racine → seul `LICENSE`. grep `privacy|confidentialit|politique` sur `src/` → **0** | Aucune politique, nulle part, alors que l'app collecte des données | 🔴 | Rédiger la politique (squelette fourni dans PLAN_ACTION.md), la publier, ajouter un lien dans « À propos » | Site + `src/screens/about.tsx` + ASC | M | **P0** | URL publique HTTP 200 **et** lien atteignable en ≤ 2 taps depuis À propos |
| 5.1.1(ii) | **Permission** — consentement + finalité claire dans la chaîne d'usage | Oui | ⚠️ | `NSPhotoLibraryUsageDescription` présent (`app.json:17`) : « Akel Loulou a besoin d'acceder a tes photos pour illustrer une recette. » — **sans accents**, **français uniquement** | Texte compréhensible mais mal orthographié et non localisé ; s'affiche tel quel à un utilisateur anglophone | 🟠 | Corriger les accents ; ajouter `InfoPlist.strings` en/fr ; si l'admin est retiré (H11), **supprimer la permission photos** | `app.json:16-19` | S | **P0** | Message accentué, localisé, ou permission absente |
| 5.1.1(iii) | **Data Minimization** — ne demander que le nécessaire | Oui | ⚠️ | `RECORD_AUDIO` déclaré sans usage (`app.json:24`) ; prénom collecté dans les suggestions (`src/lib/queries.ts:137`) ; **fabricant + modèle d'appareil** envoyés (`src/lib/push.ts:88`) | Trois collectes non indispensables | 🔴 | Supprimer `RECORD_AUDIO`, supprimer le prénom, supprimer `user_agent` de l'upsert push | `app.json`, `src/app/suggest.tsx`, `src/lib/push.ts` | S | **P0** | Les 3 collectes ont disparu du code |
| 5.1.1(iv) | **Access** — respecter les réglages de permission | Oui | ✅ | `src/lib/push.ts:66-70` gère le refus proprement (statut `denied` + message) ; `admin-recipe-form.tsx:80-83` gère le refus photos | Aucun contournement, aucune relance insistante | 🟢 | — | — | — | — | Refus de permission → message clair, pas de blocage |
| 5.1.1(v) | **Account Sign-In** — pas de compte imposé ; suppression de compte in-app si création de compte | Oui | ✅ | Aucune création de compte utilisateur (grep `signUp` → 0) ; toutes les fonctions publiques sont accessibles sans compte (`src/app/(tabs)/`) | L'obligation de suppression de compte ne s'applique **que** si l'app permet de créer un compte (doc « Offering Account Deletion in Your App », HTTP 200). H3/H4 | 🟢 | Si des comptes utilisateurs apparaissent un jour : suppression in-app obligatoire | — | — | — | Aucun `signUp` dans le build |
| 5.1.2 | Data Use and Sharing | Oui | ❌ | Aucune fiche App Privacy Details renseignée ; aucune app ASC créée | Les nutrition labels sont obligatoires et doivent refléter le code | 🔴 | Remplir les App Privacy Details (valeurs exactes dans CHECKLIST_SOUMISSION.md) | ASC | S | **P0** | Labels cohérents à 100 % avec le code après nettoyage |
| 5.1.3 | Health and Health Research | Non | ➖ | Aucune donnée de santé ; pas de HealthKit | Recettes ≠ données de santé | 🟢 | Ne pas ajouter de calories/nutrition sans re-auditer | — | — | — | — |
| 5.1.4 | Kids | Non | ➖ | H6 : hors Kids Category | Sans objet | 🟢 | — | — | — | — | — |
| 5.1.5 | Location Services | Non | ➖ | grep `Location|geolocation|expo-location` → **0** ; aucune clé `NSLocation*` | Aucune localisation | 🟢 | — | — | — | — | — |
| 5.2 | Intellectual Property | Oui | ❌ | Voir 5.2.1 | — | 🔴 | — | — | — | **P0** | — |
| 5.2.1 | **Generally** — pas de marques/œuvres protégées sans autorisation | Oui | ❌ | **(a)** icône = logo Expo (`assets/images/icon.png`) · **(b)** 9 images `pplx-res.cloudinary.com` + 2 `lh3.googleusercontent.com` sur 29 recettes visibles · **(c)** 53 images d'ingrédients hot-linkées `themealdb.com` (`src/lib/ingredient-images.ts`) · **(d)** matériel par défaut `images.unsplash.com` · **(e)** recettes « Reese's Cups » (Hershey) et « Toffee Crisp » (Nestlé) · **(f)** tablier **Nestlé Dessert** lisible sur la photo À propos | Cinq sources distinctes de contenu tiers non autorisé | 🔴 | Icône originale · photographier les 11 plats · héberger les visuels d'ingrédients sous licence claire · renommer les 2 recettes · recadrer/remplacer la photo À propos | `assets/`, base Supabase, `src/lib/ingredient-images.ts` | L | **P0** | 0 domaine tiers dans `image_url` ; 0 marque tierce visible ou citée |
| 5.2.2 | Third-Party Sites/Services | Oui | ⚠️ | L'app consomme `themealdb.com` et `flagcdn.com` sans contrat ni vérification des CGU (`src/lib/ingredient-images.ts`, `src/lib/country.ts`) | Hot-linking de CDN tiers sans autorisation écrite | 🟠 | Lire les CGU de TheMealDB et flagcdn ; sinon rapatrier les assets | `src/lib/` | M | P1 | Autorisation documentée ou assets auto-hébergés |
| 5.2.3 | Audio/Video Downloading | Non | ➖ | Aucun téléchargement média | Sans objet | 🟢 | — | — | — | — | — |
| 5.2.4 | Apple Endorsements | Oui | ✅ | Aucune mention d'Apple dans l'UI (grep `Apple` sur `src/screens`,`src/components` → 0 hors commentaires) | Pas de fausse caution | 🟢 | Ne pas écrire « Optimisé pour iPhone par Apple » en description | ASC | — | — | Description sans allusion à une caution Apple |
| 5.2.5 | Apple Products — ne pas imiter les produits Apple | Oui | ✅ | Design propre à la marque Akel Loulou (rose/abricot, Cormorant/DM Sans) | Aucune confusion possible | 🟢 | — | — | — | — | — |
| 5.3 | Gaming, Gambling, and Lotteries | Non | ➖ | Aucun jeu d'argent | Sans objet | 🟢 | — | — | — | — | — |
| 5.3.1 | Sweepstakes and contests sponsored by developer | Non | ➖ | Aucun concours | Sans objet | 🟢 | — | — | — | — | — |
| 5.3.2 | Official rules presented in the app | Non | ➖ | Sans objet | — | 🟢 | — | — | — | — | — |
| 5.3.3 | No IAP for real money gaming credit | Non | ➖ | Sans objet | — | 🟢 | — | — | — | — | — |
| 5.3.4 | Real money gaming | Non | ➖ | Sans objet | — | 🟢 | — | — | — | — | — |
| 5.4 | VPN Apps | Non | ➖ | Aucun VPN, aucun `NEVPNManager` | Sans objet | 🟢 | — | — | — | — | — |
| 5.5 | Mobile Device Management | Non | ➖ | Aucun MDM | Sans objet | 🟢 | — | — | — | — | — |
| 5.6 | Developer Code of Conduct | Oui | ⚠️ | Compte développeur `tonybueno` ; identité non vérifiée dans cet audit | Dépend de la conformité des points ci-dessus | 🟠 | Respecter les engagements ; ne pas soumettre en l'état | ASC | — | P0 | Aucun bloqueur 🔴 restant |
| 5.6.1 | App Store Reviews | Oui | ✅ | Aucun `SKStoreReviewController`, aucune incitation à noter (grep `requestReview|StoreReview` → 0) | Pas de manipulation d'avis | 🟢 | Si tu ajoutes une demande d'avis, utiliser l'API Apple officielle | — | — | — | — |
| 5.6.2 | Developer Identity | Oui | ❓ | Compte Apple Developer **non vérifié** dans cet audit (H12) | Information manquante | 🟠 | Confirmer que le compte est actif et l'identité validée | ASC | — | P0 | Compte actif, identité vérifiée |
| 5.6.3 | Discovery Fraud | Oui | ✅ | Aucun mot-clé trompeur (métadonnées inexistantes) | Rien à frauder pour l'instant | 🟢 | Ne pas bourrer les mots-clés | ASC | — | P1 | Mots-clés honnêtes |
| 5.6.4 | App Quality | Oui | ⚠️ | Build propre (`tsc` clean, export OK) mais icône template + contenu tiers + hors-ligne cassé | 5.6.4 permet à Apple de retirer les apps de faible qualité | 🟠 | Traiter les bloqueurs 4.1, 4.2, 4.2.6, 5.2.1 | — | L | P0 | Tous les 🔴 résolus |

---

## Annexe A — Exigences transverses non numérotées

| # | Exigence | Statut | Preuve | Risque | Action requise | Effort | Critère d'acceptation |
|---|---|---|---|---|---|---|---|
| A1 | **PrivacyInfo.xcprivacy (app)** | ❌ | `find . -name "PrivacyInfo.xcprivacy" -not -path "*/node_modules/*"` → vide ; aucune clé `ios.privacyManifests` dans `app.json` | 🔴 | Déclarer `ios.privacyManifests` dans `app.json` avec `NSPrivacyAccessedAPITypes` + `NSPrivacyCollectedDataTypes` | S | Le build EAS produit un `PrivacyInfo.xcprivacy` non vide |
| A2 | **Required Reason APIs** | ❌ | AsyncStorage → `NSUserDefaults` utilisé à `src/lib/favorites.ts:16,28` et `src/lib/supabase.ts:19` ; non déclaré au niveau app | 🔴 | Déclarer `NSPrivacyAccessedAPICategoryUserDefaults` raison **`CA92.1`** | XS | Catégorie présente dans le manifest généré |
| A3 | **Signatures SDK tiers** | ✅ | Croisement de `package.json` avec la liste Apple (HTTP 200, 84 SDK) : seul **`hermes`** est concerné, fourni par `react-native` qui embarque son `PrivacyInfo.xcprivacy` (vérifié dans `node_modules/react-native`) | 🟢 | Aucune. Reanimated / gesture-handler / screens / safe-area-context / flash-list **ne figurent pas** sur la liste Apple | — | — |
| A4 | **App Privacy Details** | ❌ | Aucune fiche ASC | 🔴 | Remplir selon CHECKLIST_SOUMISSION.md | S | Labels = code |
| A5 | **ATT (App Tracking Transparency)** | ➖ | grep `AppTrackingTransparency|requestTrackingAuthorization|IDFA|expo-tracking-transparency` → **0** ; aucun SDK publicitaire | 🟢 | **Ne pas** ajouter `NSUserTrackingUsageDescription` (déclarer une clé inutilisée attire l'attention) | — | Clé absente |
| A6 | **Export compliance** | ✅ | `app.json:18` → `ITSAppUsesNonExemptEncryption: false` | 🟡 | Vérifier l'exactitude : l'app n'utilise que HTTPS/TLS standard → exemption correcte | XS | Champ accepté par ASC sans documentation supplémentaire |
| A7 | **App Review Notes** | ❌ | Inexistantes | 🔴 | Rédiger (squelette dans PLAN_ACTION.md) | S | Notes présentes et complètes |
| A8 | **HIG** | ❓ | Page HIG non extractible (coquille JS de 17 ko) | 🟡 | Revue manuelle sur appareil | M | Parcours validé sur iPhone réel |
| A9 | **Localisation des chaînes** | ⚠️ | Toute l'UI est en français en dur ; aucun `i18n`, aucun `InfoPlist.strings` | 🟡 | Soit assumer « français uniquement » dans ASC, soit localiser | M | Langue déclarée = français, cohérente avec l'UI |
| A10 | **Build number / versioning** | ⚠️ | `eas.json` → `appVersionSource: remote` + `autoIncrement` ; aucun `buildNumber` local | 🟢 | Laisser EAS gérer | — | Build accepté par ASC |
| A11 | **Versionnement Git** | ❌ | `git log` → aucun commit ; projet dans le dépôt accidentel `C:\Users\tonyb` | 🟠 | `git init` dédié dans `AkelLoulou-mobile` + `.gitignore` | XS | `git log` affiche au moins 1 commit dans le dossier du projet |

---

## INFORMATIONS MANQUANTES (lignes ❓)

| Ligne | Question à trancher | Pourquoi ça change le verdict |
|---|---|---|
| 1.4.3 | Une des 27 recettes visibles contient-elle de l'alcool ? | Détermine la classification d'âge (4+ vs 17+) |
| 2.3.5 | Catégorie App Store retenue ? | Champ obligatoire ASC |
| 2.3.6 | Classification d'âge visée ? | Dépend de 1.4.3 |
| 2.3.8 | Description rédigée ? | Non rédigeable sans ton texte |
| 2.3.12 | Texte « Nouveautés » ? | Champ obligatoire |
| 2.4.1 | iPad supporté pour de vrai ? | Soit tester, soit désactiver — pas d'entre-deux |
| 2.5.5 | L'app fonctionne-t-elle en IPv6-only ? | Apple teste systématiquement en IPv6-only |
| 5.6.2 | Compte Apple Developer actif et identité vérifiée ? | Sans lui, aucune soumission possible |
| A8 | Parcours validé sur iPhone réel ? | HIG non vérifiable automatiquement |

---

## CONTRÔLE DE COMPLÉTUDE

| | |
|---|---|
| Identifiants numérotés extraits du site (June 8, 2026) | **136** |
| Lignes de guideline dans ce tableau | **136** |
| Écart | **0** ✅ |

Détail : Section 1 = 20 · Section 2 = 41 · Section 3 = 21 · Section 4 = 32 · Section 5 = 22 = **136**.
Les sous-points lettrés `4.3(a)` et `4.3(b)` sont audités séparément et comptés dans la ligne `4.3`. Les sous-points `5.1.1(i)` à `(v)` sont audités séparément et comptés dans la ligne `5.1.1`. Les guidelines marquées « Intentionally omitted » par Apple (2.5.7, 2.5.10, 4.2.4, 4.2.5, 4.4.3, 4.6) sont listées pour respecter l'exhaustivité.
