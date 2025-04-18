#!/bin/sh
# Créez ce fichier dans Adam/fix-mysql.sh

echo "Waiting for MySQL to be ready..."
# Attendre que MySQL soit prêt
sleep 20

echo "Executing SQL command to alter file table..."
# Exécuter la commande SQL pour modifier la table file
mysql -h mysql -u root -ppassword adam -e "ALTER TABLE file MODIFY COLUMN text LONGTEXT NULL;"

echo "MySQL table fixed successfully!"