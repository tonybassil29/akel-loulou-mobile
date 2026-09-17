# Photos d'ingrédients — sources et procédure

Les vignettes d'ingrédients de l'app venaient de deux endroits, tous deux
pollués par des emballages de marque :

1. **`settings.custom_ingredient_images`** en base — pots Nestlé YAOS, Vahiné,
   Alsa, Carrefour, Al Wadi, Samia, Envia, La Fermière, Suzi Wan, Grain de Frais ;
2. **`src/lib/ingredient-images.ts`** dans le code — table TheMealDB dont 29
   entrées étaient des packshots de marque (Tate & Lyle, Dr. Oetker, Anchor,
   Hershey's, Colman's, Sarson's, Swanson, Alpro, Sargento…).

Les deux exposaient l'app aux guidelines **5.2.1** (propriété intellectuelle) et
**2.3.9** (contenu tiers dans les captures App Store).

## Ce qui est en place

`photos-ingredients/` contient 14 photos générées sur commande : packshots
détourés sur blanc, contenants nus, **aucune étiquette, aucun texte, aucune
marque**. Elles couvrent 58 clés de la base (variantes de casse, quantités
collées au nom, pluriels).

`urls.json` garde la correspondance nom → URL Cloudinary.

Les 29 entrées de marque du code ont été retirées. Sans visuel, la vignette
affiche l'icône neutre prévue par `IngredientTile`.

## Ajouter une photo

1. Photo carrée, sujet détouré sur blanc, contenant nu, aucune étiquette.
2. Téléverser sur Cloudinary (preset `mon_preset_image`, dossier
   `ingredients-photos`).
3. Pointer la ou les clés de `settings.custom_ingredient_images` vers l'URL, en
   prévoyant **toutes** les variantes : majuscule initiale, pluriel, et la forme
   avec quantité telle qu'elle apparaît dans les recettes (`120 g de yaourt`).

Le site et l'app mobile lisent la même table : la mise à jour est immédiate des
deux côtés, sans redéploiement.

## Ingrédients encore sans visuel

farine · sucre · sucre glace · cassonade · beurre · beurre de cacahuète ·
huile · miel · sel · poivre · cacao · moutarde · vinaigre · bouillon · riz ·
pâtes · maïzena · bicarbonate · eau · parmesan · vin blanc
