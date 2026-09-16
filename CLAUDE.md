# Akel Loulou mobile — notes pour un agent

- Expo SDK 57, Expo Router, TypeScript strict. Les routes vivent dans `src/app/`
  et **ne contiennent que des routes** : le corps des ecrans est dans `src/screens/`.
- Un seul point d'entree pour le style : `src/theme/`. Les couleurs semantiques
  (`semantic`) sont utilisables au niveau module ; les couleurs de marque passent
  par `useAppTheme()`.
- Icones : `Icon` de `src/components/icon.tsx` (SF Symbols sur iOS, Material
  ailleurs). Jamais d'emoji comme glyphe d'interface.
- Feuilles, interrupteurs, listes groupees : `@expo/ui` avant toute alternative.
- `process.env.EXPO_OS` plutot que `Platform.OS`.
- Attention : avec `<Link asChild>`, les styles de mise en page (largeur) doivent
  etre portes par un conteneur parent, pas par le `Pressable` enfant.
- Verifier avec `npx tsc --noEmit` puis `npx expo export --platform ios`.
- Sous Windows : lancer npm / expo depuis PowerShell, pas WSL.
