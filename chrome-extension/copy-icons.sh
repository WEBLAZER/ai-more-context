#!/bin/bash

# Créer le répertoire images s'il n'existe pas
mkdir -p images

# Copier l'icône existante pour chaque taille
cp images/icon.png images/icon16.png
cp images/icon.png images/icon48.png
cp images/icon.png images/icon128.png

# Redimensionner les icônes avec sips (utilitaire natif de macOS)
sips -z 16 16 images/icon16.png
sips -z 48 48 images/icon48.png
sips -z 128 128 images/icon128.png 