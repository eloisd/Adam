#!/bin/sh
# Créez ce fichier dans Adam/fix-entity.sh

# Rechercher le fichier file.entity.ts et modifier la définition de la colonne text
cd /app
if [ -f "src/entities/file.entity.ts" ]; then
  echo "Modifying file.entity.ts..."
  # Remplacer la définition de la colonne text pour la rendre nullable
  sed -i 's/@Column({ type: .longtext. })/@Column({ type: "longtext", nullable: true })/g' src/entities/file.entity.ts
  echo "Entity file modified successfully."
else
  echo "File entity not found in expected location. Searching..."
  # Recherche plus large dans tout le dossier src
  FILE_PATH=$(find src -name "file.entity.ts" | head -n 1)
  if [ -n "$FILE_PATH" ]; then
    echo "Found file at: $FILE_PATH"
    sed -i 's/@Column({ type: .longtext. })/@Column({ type: "longtext", nullable: true })/g' "$FILE_PATH"
    echo "Entity file modified successfully."
  else
    echo "Could not find file.entity.ts in the src directory."
  fi
fi