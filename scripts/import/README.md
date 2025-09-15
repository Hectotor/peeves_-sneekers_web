# Importation CSV vers Firebase

Ce script permet d'importer des données depuis un fichier CSV vers Firestore.

## Prérequis

1. Avoir Node.js installé
2. Avoir un projet Firebase
3. Avoir activé Firestore dans votre projet Firebase
4. Avoir les droits d'administration sur le projet Firebase

## Configuration

1. Placez votre fichier CSV dans le dossier `scripts/import/` et renommez-le en `products.csv`
   - Assurez-vous que le fichier utilise la virgule (,) comme séparateur
   - Assurez-vous que le fichier contient les colonnes suivantes :
     - id (optionnel)
     - gender
     - masterCategory
     - subCategory
     - articleType
     - baseColour
     - season
     - year
     - usage
     - productDisplayName

2. Configurez Firebase Admin SDK :
   - Allez dans la [console Firebase](https://console.firebase.google.com/)
   - Sélectionnez votre projet
   - Allez dans Paramètres > Comptes de service
   - Cliquez sur "Générer une nouvelle clé privée"
   - Renommez le fichier téléchargé en `serviceAccountKey.json`
   - Placez-le dans le dossier `scripts/import/`

3. Mettez à jour la configuration dans `firebaseConfig.js` avec votre URL Firebase

## Utilisation

1. Installez les dépendances :
   ```bash
   npm install firebase-admin csv-parser
   ```

2. Exécutez le script :
   ```bash
   node scripts/import/csvToFirebase.js
   ```

## Sécurité

- Ne partagez jamais votre fichier `serviceAccountKey.json`
- Ajoutez `serviceAccountKey.json` à votre `.gitignore`
- Pour la production, utilisez des variables d'environnement au lieu d'un fichier de configuration

## Personnalisation

Vous pouvez modifier les paramètres suivants dans le script `excelToFirebase.js` :
- `EXCEL_FILE_PATH` : Chemin vers votre fichier Excel
- `COLLECTION_NAME` : Nom de la collection Firestore cible
