# Illustrations d'ingrédients

Ces images remplacent des photos d'emballages de marque qui se trouvaient dans
`settings.custom_ingredient_images` : Nestlé YAOS, Vahiné, Alsa, Carrefour,
Al Wadi, Samia, Envia, La Fermière, Suzi Wan, Grain de Frais. Les montrer dans
l'app et surtout dans les captures App Store expose aux guidelines **5.2.1**
(propriété intellectuelle) et **2.3.9** (contenu tiers dans les captures).

Elles sont **dessinées en SVG dans `generer.py`**, donc entièrement libres de
droits : rien n'est repris d'une banque d'images ni d'un générateur tiers.

## Style

Aplats doux, formes arrondies, aucune étiquette, aucun texte, fond transparent
(les vignettes sont posées sur une carte blanche). Palette accordée au rose
poudré de l'app.

## Régénérer

```bash
pip install cairosvg
python scripts/illustrations/generer.py   # écrit dans rendus/
```

Puis téléverser sur Cloudinary (preset `mon_preset_image`, dossier
`ingredients-akel-loulou`) et pointer les clés de
`settings.custom_ingredient_images` vers les nouvelles URLs. Le site et l'app
mobile lisent la même table : la mise à jour est immédiate des deux côtés,
sans redéploiement.

## Ce qui reste à faire

- une vingtaine de clés affichent encore un texte de remplacement (`1E`, `8C`,
  `CH`, `CF`…) : ce sont des images cassées d'origine, pas un problème de
  marque, mais c'est laid ;
- la clé `Test` pointe vers une URL morte ;
- `Tapenade d'olives` montre ce qui ressemble à un gâteau au chocolat.
