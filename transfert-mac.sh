#!/bin/bash
# Rassemble les fichiers absents de git dans une archive a transferer sur le Mac.
# A lancer depuis la racine du projet, cote Windows/WSL.
#
#     bash transfert-mac.sh
#
# Puis AirDrop / cle USB de akel-loulou-secrets.tar.gz vers le Mac, et cote Mac :
#
#     cd ~/chemin/vers/akel-loulou-mobile
#     tar xzf ~/Downloads/akel-loulou-secrets.tar.gz
#
# NE JAMAIS committer cette archive ni l'envoyer par mail ou messagerie.

set -e
SORTIE="akel-loulou-secrets.tar.gz"

MANQUANTS=""
for f in .env credentials.json .secrets; do
  [ -e "$f" ] || MANQUANTS="$MANQUANTS $f"
done
if [ -n "$MANQUANTS" ]; then
  echo "Introuvable :$MANQUANTS"
  exit 1
fi

# on exclut le .ipa (24 Mo) : il est deja chez Apple, inutile de le transferer
tar czf "$SORTIE" --exclude="*.ipa" .env credentials.json .secrets
echo
echo "Archive prete : $SORTIE"
echo
tar tzf "$SORTIE" | sed 's/^/   /'
echo
echo "Transfere-la par AirDrop ou cle USB, puis supprime-la des deux cotes."
